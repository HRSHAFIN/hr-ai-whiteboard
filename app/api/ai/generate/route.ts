import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import type { AiDiagramResponse, AiDiagramType } from "@/lib/ai-diagram-types";
import type { AiNotesResponse } from "@/lib/ai-notes-types";

// Gemini can take longer than the platform's default function timeout,
// especially under load. Allow up to 60s for a single generation.
export const maxDuration = 60;

const TYPE_GUIDANCE: Record<Exclude<AiDiagramType, "notes">, string> = {
  diagram: "a general-purpose conceptual diagram",
  flowchart:
    "a flowchart with decision points (diamonds) and process steps (rectangles), connected top-to-bottom",
  "architecture-diagram":
    "a system architecture diagram showing components/services as rectangles connected by arrows",
  "mobile-wireframe":
    "a mobile app screen wireframe using rectangles to represent UI sections (header, content blocks, buttons) stacked vertically in a narrow phone-like layout",
  "web-wireframe":
    "a website wireframe using rectangles to represent UI sections (header, nav, hero, content columns, footer) in a wide desktop layout",
  "mind-map":
    "a mind map with one central topic ellipse connected to several surrounding idea ellipses",
};

// Preferred model first, then a fallback used only if the preferred one is
// unavailable. gemini-3.7-flash's free-tier quota is only 20 requests/day
// and gets exhausted quickly, so gemini-3.6-flash goes first -- trying the
// already-exhausted model first would waste the first attempt every time.
const MODELS = ["gemini-3.6-flash", "gemini-3.7-flash"] as const;

// The SDK retries failed requests up to 5x with backoff by default (up to
// ~90s+ on a persistent 503), which blew past our own maxDuration and got
// killed by the platform before our own fallback loop ever ran. Fail fast
// per model instead and let our own model-fallback loop do the retrying.
const HTTP_OPTIONS = { timeout: 20000, retryOptions: { attempts: 1 } };

const DIAGRAM_CONFIG = {
  httpOptions: HTTP_OPTIONS,
  systemInstruction:
    "You design simple node-and-edge diagrams for a whiteboard app. Lay nodes out with no overlap on a canvas roughly 1200 wide and 800 tall, with at least 40px gaps between shapes. Shape widths should be 120-260 and heights 60-120. Keep labels under 6 words. Return between 3 and 12 nodes. Use hex colors for the optional node color field.",
  responseMimeType: "application/json",
  responseSchema: {
    type: "OBJECT",
    properties: {
      nodes: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            shape: { type: "STRING", enum: ["rectangle", "ellipse", "diamond"] },
            label: { type: "STRING" },
            x: { type: "NUMBER" },
            y: { type: "NUMBER" },
            width: { type: "NUMBER" },
            height: { type: "NUMBER" },
            color: { type: "STRING" },
          },
          required: ["id", "shape", "label", "x", "y", "width", "height"],
        },
      },
      edges: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            from: { type: "STRING" },
            to: { type: "STRING" },
            label: { type: "STRING" },
          },
          required: ["from", "to"],
        },
      },
    },
    required: ["nodes", "edges"],
  },
} as const;

const NOTES_CONFIG = {
  httpOptions: HTTP_OPTIONS,
  systemInstruction:
    "You look at a snapshot of a whiteboard (handwritten sketches, sticky notes, and typed text) and turn it into clear, well-organized study notes. Group related points into 2-5 sections with short headings. Keep bullets short (under 12 words) and skip anything illegible. Pick a distinct, vivid hex color per section. Include one short actionable tip only if something genuinely useful stands out.",
  responseMimeType: "application/json",
  responseSchema: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      sections: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            heading: { type: "STRING" },
            color: { type: "STRING" },
            bullets: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["heading", "color", "bullets"],
        },
      },
      tip: { type: "STRING" },
    },
    required: ["title", "sections"],
  },
} as const;

function isHighDemandError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("aborted") ||
    message.includes("timeout")
  );
}

async function generateWithFallback(
  ai: GoogleGenAI,
  contents: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["contents"],
  config: object
) {
  let text: string | undefined;
  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const result = await ai.models.generateContent({ model, contents, config });
      text = result.text;
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      // Fall back to the next model on ANY failure (capacity, timeout/abort,
      // transient network errors, etc.) -- a slow/hanging model is just as
      // unusable as an explicit "high demand" response, and the only cost of
      // falling back on a real config-level error (e.g. bad API key) is a
      // few wasted seconds before that same error repeats and surfaces.
      console.error(`AI model ${model} failed, trying next fallback:`, error);
    }
  }

  return { text, lastError };
}

function errorResponse(lastError: unknown) {
  console.error("AI generation failed on all models:", lastError);
  if (isHighDemandError(lastError)) {
    return NextResponse.json(
      { error: "Gemini is experiencing high demand right now. Please try again in a moment." },
      { status: 503 }
    );
  }
  return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 502 });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI is not configured. Add GEMINI_API_KEY to the server environment." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const type = (typeof body?.type === "string" ? body.type : "diagram") as AiDiagramType;
  const ai = new GoogleGenAI({ apiKey });

  if (type === "notes") {
    const imageBase64 = typeof body?.imageBase64 === "string" ? body.imageBase64 : "";
    if (!imageBase64) {
      return NextResponse.json({ error: "A canvas snapshot is required" }, { status: 400 });
    }

    const instruction = prompt || "Summarize this whiteboard into notes.";
    const contents = [
      { text: instruction },
      { inlineData: { mimeType: "image/png", data: imageBase64 } },
    ];

    const { text, lastError } = await generateWithFallback(ai, contents, NOTES_CONFIG);
    if (lastError) return errorResponse(lastError);
    if (!text) {
      return NextResponse.json({ error: "AI returned an empty response" }, { status: 502 });
    }

    let parsed: AiNotesResponse;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
    }

    if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      return NextResponse.json({ error: "AI returned no notes" }, { status: 502 });
    }

    return NextResponse.json(parsed);
  }

  const existing = body?.existing as AiDiagramResponse | undefined;
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const guidance = TYPE_GUIDANCE[type] ?? TYPE_GUIDANCE.diagram;
  const contents = existing
    ? `Here is the current diagram as JSON:\n${JSON.stringify(existing)}\n\nUpdate it to: ${prompt}\n\nReturn the complete, updated diagram (all nodes and edges, not just the changes), reusing existing "id" values for nodes you keep so the layout stays stable.`
    : `Create ${guidance} for: ${prompt}`;

  const { text, lastError } = await generateWithFallback(ai, contents, DIAGRAM_CONFIG);
  if (lastError) return errorResponse(lastError);
  if (!text) {
    return NextResponse.json({ error: "AI returned an empty response" }, { status: 502 });
  }

  let parsed: AiDiagramResponse;
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
  }

  if (!Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    return NextResponse.json({ error: "AI returned no diagram nodes" }, { status: 502 });
  }

  return NextResponse.json(parsed);
}
