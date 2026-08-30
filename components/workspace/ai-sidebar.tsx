"use client";

import { useState } from "react";
import {
  ArrowUp,
  Boxes,
  Brain,
  GitBranch,
  Loader2,
  MonitorSmartphone,
  NotebookText,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AI_DIAGRAM_TYPES,
  type AiDiagramEdge,
  type AiDiagramNode,
  type AiDiagramResponse,
  type AiDiagramType,
} from "@/lib/ai-diagram-types";
import type { AiNotesResponse } from "@/lib/ai-notes-types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform";

const TYPE_ICONS: Record<AiDiagramType, typeof Workflow> = {
  diagram: Workflow,
  flowchart: GitBranch,
  "architecture-diagram": Boxes,
  "web-wireframe": MonitorSmartphone,
  "mobile-wireframe": Smartphone,
  "mind-map": Brain,
  notes: NotebookText,
};

const TYPE_BADGE_COLORS: Record<AiDiagramType, string> = {
  diagram: "bg-blue-50 text-blue-600",
  flowchart: "bg-emerald-50 text-emerald-600",
  "architecture-diagram": "bg-orange-50 text-orange-600",
  "web-wireframe": "bg-sky-50 text-sky-600",
  "mobile-wireframe": "bg-pink-50 text-pink-600",
  "mind-map": "bg-violet-50 text-violet-600",
  notes: "bg-amber-50 text-amber-600",
};

const PROMPT_EXAMPLES: Partial<Record<AiDiagramType, string>> = {
  flowchart: "Create a user login flowchart",
  "mobile-wireframe": "Generate a mobile app wireframe for a trip planner",
  "architecture-diagram": "Show a typical web app architecture with a client, API, and database",
  "mind-map": "Brainstorm ideas for a productivity app",
  notes: "Anything to focus on? (optional)",
};

function buildSkeleton(nodes: AiDiagramNode[], edges: AiDiagramEdge[]): ExcalidrawElementSkeleton[] {
  const skeleton: ExcalidrawElementSkeleton[] = nodes.map((node) => ({
    type: node.shape,
    id: node.id,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    backgroundColor: node.color || "#a5d8ff",
    strokeColor: "#1e1e1e",
    fillStyle: "solid",
    label: { text: node.label },
  }));

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  for (const edge of edges) {
    const from = nodeById.get(edge.from);
    if (!from) continue;
    skeleton.push({
      type: "arrow",
      x: from.x,
      y: from.y,
      start: { id: edge.from },
      end: { id: edge.to },
      ...(edge.label ? { label: { text: edge.label } } : {}),
    });
  }

  return skeleton;
}

function lightenHex(hex: string, amount: number): string {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return "#f1f5f9";
  const n = parseInt(match[1], 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function buildNotesSkeleton(
  notes: AiNotesResponse,
  originX: number,
  originY: number
): ExcalidrawElementSkeleton[] {
  const skeleton: ExcalidrawElementSkeleton[] = [];
  const cardWidth = 300;
  const cardHeight = 240;
  const gap = 24;
  const columns = Math.min(3, Math.max(1, notes.sections.length));

  skeleton.push({
    type: "text",
    x: originX,
    y: originY,
    text: `📝 ${notes.title}`,
    fontSize: 28,
    strokeColor: "#1e1e1e",
  });

  const gridTop = originY + 60;

  notes.sections.forEach((section, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = originX + col * (cardWidth + gap);
    const y = gridTop + row * (cardHeight + gap);
    const color = /^#[0-9a-fA-F]{6}$/.test(section.color) ? section.color : "#3b82f6";

    skeleton.push({
      type: "rectangle",
      x,
      y,
      width: cardWidth,
      height: cardHeight,
      backgroundColor: lightenHex(color, 0.85),
      strokeColor: color,
      strokeWidth: 2,
      fillStyle: "solid",
    });

    skeleton.push({
      type: "ellipse",
      x: x + 14,
      y: y + 14,
      width: 32,
      height: 32,
      backgroundColor: color,
      strokeColor: color,
      fillStyle: "solid",
      label: { text: String(i + 1), fontSize: 16, strokeColor: "#ffffff" },
    });

    skeleton.push({
      type: "text",
      x: x + 56,
      y: y + 20,
      text: section.heading,
      fontSize: 18,
      strokeColor: color,
    });

    skeleton.push({
      type: "text",
      x: x + 16,
      y: y + 64,
      text: section.bullets.map((b) => `✓ ${b}`).join("\n"),
      fontSize: 14,
      strokeColor: "#1e1e1e",
    });
  });

  if (notes.tip) {
    const rows = Math.ceil(notes.sections.length / columns);
    const tipY = gridTop + rows * (cardHeight + gap);
    const tipWidth = columns * cardWidth + (columns - 1) * gap;
    skeleton.push({
      type: "rectangle",
      x: originX,
      y: tipY,
      width: tipWidth,
      height: 80,
      backgroundColor: "#fef9c3",
      strokeColor: "#eab308",
      strokeWidth: 2,
      fillStyle: "solid",
      label: { text: `💡 Tip: ${notes.tip}`, fontSize: 15 },
    });
  }

  return skeleton;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function AiSidebar({
  open,
  onOpenChange,
  excalidrawAPI,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}) {
  const [selectedType, setSelectedType] = useState<AiDiagramType | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneration, setLastGeneration] = useState<{
    type: AiDiagramType;
    diagram: AiDiagramResponse;
    elementIds: string[];
  } | null>(null);

  const activeType = isImproving ? lastGeneration?.type ?? null : selectedType;
  const isNotes = activeType === "notes";

  const reset = () => {
    setSelectedType(null);
    setIsImproving(false);
    setPrompt("");
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!isGenerating) {
      onOpenChange(next);
      if (!next) reset();
    }
  };

  const handleGenerateNotes = async () => {
    if (!excalidrawAPI) throw new Error("Canvas isn't ready yet.");
    const elements = excalidrawAPI.getSceneElements();
    if (elements.length === 0) {
      throw new Error("Draw or add something to the canvas first.");
    }

    const { exportToBlob } = await import("@excalidraw/excalidraw");
    const blob = await exportToBlob({
      elements,
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
      mimeType: "image/png",
    });
    const imageBase64 = await blobToBase64(blob);

    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "notes", prompt: prompt.trim(), imageBase64 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "AI generation failed");

    const notes = data as AiNotesResponse;
    const maxX = Math.max(...elements.map((el) => el.x + el.width));
    const minY = Math.min(...elements.map((el) => el.y));
    const skeleton = buildNotesSkeleton(notes, maxX + 80, minY);

    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
    const newElements = convertToExcalidrawElements(skeleton);

    excalidrawAPI.updateScene({
      elements: [...elements, ...newElements],
      captureUpdate: "IMMEDIATELY",
    });
    excalidrawAPI.scrollToContent(newElements, { fitToContent: true });
  };

  const handleGenerateDiagram = async (type: AiDiagramType) => {
    if (!excalidrawAPI) throw new Error("Canvas isn't ready yet.");

    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        prompt: prompt.trim(),
        ...(isImproving && lastGeneration ? { existing: lastGeneration.diagram } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "AI generation failed");

    const diagram = data as AiDiagramResponse;
    const skeleton = buildSkeleton(diagram.nodes, diagram.edges);

    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
    const newElements = convertToExcalidrawElements(skeleton);

    const previousIds = new Set(lastGeneration?.elementIds ?? []);
    const existing = excalidrawAPI
      .getSceneElements()
      .map((el) => (isImproving && previousIds.has(el.id) ? { ...el, isDeleted: true } : el));

    excalidrawAPI.updateScene({
      elements: [...existing, ...newElements],
      captureUpdate: "IMMEDIATELY",
    });
    excalidrawAPI.scrollToContent(newElements, { fitToContent: true });

    setLastGeneration({ type, diagram, elementIds: newElements.map((el) => el.id) });
  };

  const handleGenerate = async () => {
    if (!activeType || !excalidrawAPI) return;
    if (!isNotes && !prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      if (isNotes) {
        await handleGenerateNotes();
      } else {
        await handleGenerateDiagram(activeType);
      }
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-sm">
        <SheetHeader className="pr-10">
          <SheetTitle className="flex w-fit items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white">
              <Sparkles className="size-4" />
            </span>
            <span className="flex flex-col">
              <span>AI Helper</span>
              <span className="text-xs font-normal text-muted-foreground">
                Turn your ideas into visual content
              </span>
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-auto px-4 pb-4">
          {!selectedType && !isImproving ? (
            <div className="flex flex-col gap-3">
              {lastGeneration && (
                <button
                  onClick={() => setIsImproving(true)}
                  className="flex items-center gap-2.5 rounded-xl border border-primary/40 bg-primary/5 p-3 text-left text-sm font-medium hover:bg-primary/10"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </span>
                  Improve current diagram
                </button>
              )}

              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                What do you want to create?
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {AI_DIAGRAM_TYPES.map((tool) => {
                  const Icon = TYPE_ICONS[tool.value];
                  return (
                    <button
                      key={tool.value}
                      onClick={() => setSelectedType(tool.value)}
                      className="flex flex-col items-start gap-2 rounded-xl border p-3 text-left hover:border-primary/40 hover:bg-muted/50"
                    >
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-lg",
                          TYPE_BADGE_COLORS[tool.value]
                        )}
                      >
                        <Icon className="size-4.5" />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold">{tool.label}</span>
                        <span className="text-xs text-muted-foreground">{tool.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-3">
              <button
                onClick={() => {
                  setSelectedType(null);
                  setIsImproving(false);
                }}
                className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                ← Back to tools
              </button>

              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  {isImproving
                    ? "Improve current diagram"
                    : "Describe your idea"}
                </p>
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <p className="-mt-2 text-xs text-muted-foreground">
                {isNotes
                  ? "AI will read the current canvas and add styled notes next to it."
                  : "AI will generate it directly on your canvas."}
              </p>

              <Textarea
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  isImproving
                    ? "e.g. Add an error-handling step after validation"
                    : (activeType && PROMPT_EXAMPLES[activeType]) ?? "Tell AI what you want..."
                }
                className="min-h-32"
                disabled={isGenerating}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {isImproving
                    ? AI_DIAGRAM_TYPES.find((t) => t.value === lastGeneration?.type)?.label
                    : AI_DIAGRAM_TYPES.find((t) => t.value === selectedType)?.label}
                </span>
                <Button
                  onClick={handleGenerate}
                  disabled={(!isNotes && !prompt.trim()) || isGenerating}
                  className="rounded-full"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <ArrowUp />}
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="border-t px-4 py-2.5 text-center text-xs text-muted-foreground">
          AI generated content can be edited afterwards
        </p>
      </SheetContent>
    </Sheet>
  );
}
