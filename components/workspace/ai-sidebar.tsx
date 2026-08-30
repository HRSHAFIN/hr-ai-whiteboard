"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Workflow,
  GitBranch,
  Boxes,
  Smartphone,
  MonitorSmartphone,
  Brain,
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
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform";

const TYPE_ICONS: Record<AiDiagramType, typeof Workflow> = {
  diagram: Workflow,
  flowchart: GitBranch,
  "architecture-diagram": Boxes,
  "mobile-wireframe": Smartphone,
  "web-wireframe": MonitorSmartphone,
  "mind-map": Brain,
};

const PROMPT_EXAMPLES: Partial<Record<AiDiagramType, string>> = {
  flowchart: "Create a user login flowchart",
  "mobile-wireframe": "Generate a mobile app wireframe for a trip planner",
  "architecture-diagram": "Show a typical web app architecture with a client, API, and database",
  "mind-map": "Brainstorm ideas for a productivity app",
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
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSelectedType(null);
    setPrompt("");
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!isGenerating) {
      onOpenChange(next);
      if (!next) reset();
    }
  };

  const handleGenerate = async () => {
    if (!selectedType || !prompt.trim() || !excalidrawAPI) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, prompt: prompt.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI generation failed");
      }

      const { nodes, edges } = data as AiDiagramResponse;
      const skeleton = buildSkeleton(nodes, edges);

      const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
      const newElements = convertToExcalidrawElements(skeleton);

      const existing = excalidrawAPI.getSceneElements();
      excalidrawAPI.updateScene({
        elements: [...existing, ...newElements],
        captureUpdate: "IMMEDIATELY",
      });
      excalidrawAPI.scrollToContent(newElements, { fitToContent: true });

      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            AI Tools
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-auto px-4 pb-4">
          {!selectedType ? (
            <div className="flex flex-col gap-1.5">
              <p className="mb-1 text-xs text-muted-foreground">
                Pick the type of content you want AI to generate.
              </p>
              {AI_DIAGRAM_TYPES.map((tool) => {
                const Icon = TYPE_ICONS[tool.value];
                return (
                  <button
                    key={tool.value}
                    onClick={() => setSelectedType(tool.value)}
                    className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm font-medium hover:bg-muted"
                  >
                    <Icon className="size-4 text-primary" />
                    {tool.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-3">
              <button
                onClick={() => setSelectedType(null)}
                className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Back to tools
              </button>

              <p className="text-sm font-medium">
                {AI_DIAGRAM_TYPES.find((t) => t.value === selectedType)?.label}
              </p>

              <Textarea
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={PROMPT_EXAMPLES[selectedType] ?? "Tell AI what you want..."}
                className="min-h-32"
                disabled={isGenerating}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={cn("mt-auto")}
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {isGenerating ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
