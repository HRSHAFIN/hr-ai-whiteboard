import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import type { AiDiagramResponse, AiDiagramType } from "@/lib/ai-diagram-types";

const TYPE_GUIDANCE: Record<AiDiagramType, string> = {
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
  const existing = body?.existing as AiDiagramResponse | undefined;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const guidance = TYPE_GUIDANCE[type] ?? TYPE_GUIDANCE.diagram;

  const contents = existing
    ? `Here is the current diagram as JSON:\n${JSON.stringify(existing)}\n\nUpdate it to: ${prompt}\n\nReturn the complete, updated diagram (all nodes and edges, not just the changes), reusing existing "id" values for nodes you keep so the layout stays stable.`
    : `Create ${guidance} for: ${prompt}`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
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
      },
    });

    const text = result.text;
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
  } catch (error) {
    console.error("AI diagram generation failed:", error);
    return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 502 });
  }
}
