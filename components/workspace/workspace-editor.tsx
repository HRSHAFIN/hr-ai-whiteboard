"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft, Check, Download, Loader2, Save, Sparkles } from "lucide-react";

import "@excalidraw/excalidraw/index.css";
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import { renameWhiteboard, saveWhiteboardData } from "@/app/workspace/[projectId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AiSidebar } from "@/components/workspace/ai-sidebar";
import { PropertiesToolbar } from "@/components/workspace/properties-toolbar";
import { WhiteboardToolbar } from "@/components/workspace/whiteboard-toolbar";
import { WorkspaceUtilityBar } from "@/components/workspace/workspace-utility-bar";
import { AI_DOC_TOOLS, type AiDocToolType } from "@/lib/ai-doc-types";
import { cn } from "@/lib/utils";
import type { WhiteboardData, WorkspaceMode } from "@/lib/whiteboard-types";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export function WorkspaceEditor({
  boardId,
  initialTitle,
  initialData,
}: {
  boardId: number;
  initialTitle: string;
  initialData: WhiteboardData;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [mode, setMode] = useState<WorkspaceMode>(initialData.mode);
  const [doc, setDoc] = useState(initialData.doc);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [activeTool, setActiveToolState] = useState<string>("selection");
  const [selectedElement, setSelectedElement] = useState<ExcalidrawElement | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [docPreview, setDocPreview] = useState<{ tool: AiDocToolType; text: string } | null>(null);
  const [, startTransition] = useTransition();

  const sceneRef = useRef({
    elements: initialData.elements,
    appState: initialData.appState,
    files: initialData.files,
  });
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // persist() is scheduled via setTimeout and may fire long after the render
  // that created it -- reading `doc`/`mode` state directly would save a stale
  // value (the debounce timer always lagged one keystroke behind, silently
  // dropping whatever was typed right before the user stopped). Refs are
  // mutated synchronously in the change handlers below, so persist() always
  // sees the latest value regardless of which render scheduled it.
  const docRef = useRef(initialData.doc);
  const modeRef = useRef(initialData.mode);

  const persist = () => {
    setSaveState("saving");
    startTransition(async () => {
      await saveWhiteboardData(boardId, {
        mode: modeRef.current,
        doc: docRef.current,
        elements: sceneRef.current.elements,
        appState: sceneRef.current.appState,
        files: sceneRef.current.files,
      });
      setSaveState("saved");
    });
  };

  const scheduleSave = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaveState("saving");
    saveTimeout.current = setTimeout(persist, 1000);
  };

  const handleManualSave = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    persist();
  };

  const handleExcalidrawChange = (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    sceneRef.current = {
      elements,
      appState: { viewBackgroundColor: appState.viewBackgroundColor },
      files,
    };
    setActiveToolState(appState.activeTool.type);

    const selectedIds = Object.keys(appState.selectedElementIds);
    // Hide the properties toolbar while actively typing/editing text -- it
    // would otherwise float directly over the text being edited, blocking
    // the view of what's being typed.
    const active =
      selectedIds.length === 1 && !appState.editingTextElement
        ? elements.find((el) => el.id === selectedIds[0] && !el.isDeleted) ?? null
        : null;
    setSelectedElement((prev) => {
      if (!active) return prev === null ? prev : null;
      if (prev && prev.id === active.id && prev.version === active.version) return prev;
      return active;
    });

    const nextPosition = active
      ? {
          x: (active.x + active.width / 2 + appState.scrollX) * appState.zoom.value + appState.offsetLeft,
          y: (active.y + appState.scrollY) * appState.zoom.value + appState.offsetTop,
        }
      : null;
    setToolbarPosition((prev) => {
      if (!nextPosition) return prev === null ? prev : null;
      if (prev && prev.x === nextPosition.x && prev.y === nextPosition.y) return prev;
      return nextPosition;
    });

    scheduleSave();
  };

  const handleDocChange = (value: string) => {
    docRef.current = value;
    setDoc(value);
    scheduleSave();
  };

  const handleModeChange = (value: WorkspaceMode) => {
    modeRef.current = value;
    setMode(value);
    scheduleSave();
  };

  const handleDocRewrite = (tool: AiDocToolType, text: string) => {
    setDocPreview({ tool, text });
  };

  const applyDocPreview = () => {
    if (!docPreview) return;
    handleDocChange(docPreview.text);
    setDocPreview(null);
  };

  const discardDocPreview = () => setDocPreview(null);

  const handleExportImage = async () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    if (elements.length === 0) return;

    const { exportToBlob } = await import("@excalidraw/excalidraw");
    const blob = await exportToBlob({
      elements,
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
      mimeType: "image/png",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "whiteboard"}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTitleBlur = () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === initialTitle) return;
    startTransition(() => {
      renameWhiteboard(boardId, trimmed);
    });
  };

  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-14 min-w-0 shrink-0 items-center gap-1.5 border-b px-2 sm:gap-3 sm:px-4">
        <Button variant="ghost" size="icon-sm" render={<Link href="/dashboard" />} className="shrink-0">
          <ArrowLeft />
          <span className="sr-only">Back to Dashboard</span>
        </Button>

        <div className="hidden size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground sm:flex">
          W
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="h-8 w-20 min-w-0 shrink border-transparent bg-transparent font-heading text-sm font-semibold shadow-none focus-visible:border-ring sm:w-48"
        />

        <div className="flex shrink-0 items-center rounded-full bg-muted p-0.5">
          {(["whiteboard", "doc"] as WorkspaceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={cn(
                "rounded-full px-2 py-1 text-xs font-medium capitalize transition-colors sm:px-3",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            {saveState === "saving" && (
              <>
                <Loader2 className="size-3 animate-spin" /> Saving...
              </>
            )}
            {saveState === "saved" && (
              <>
                <Check className="size-3" /> Saved
              </>
            )}
          </span>
          {mode === "whiteboard" && (
            <Button variant="outline" size="sm" onClick={handleExportImage}>
              <Download />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
          <Button size="sm" onClick={handleManualSave}>
            <Save />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <UserButton />
        </div>
      </header>

      {mode === "doc" ? (
        <div className="flex-1 overflow-auto p-6">
          {docPreview ? (
            <div className="flex h-full min-h-[60vh] w-full max-w-6xl flex-col gap-4 md:flex-row">
              <div className="flex min-h-[40vh] flex-1 flex-col gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Original
                </p>
                <Textarea
                  value={doc}
                  onChange={(e) => handleDocChange(e.target.value)}
                  className="h-full min-h-[40vh] flex-1 resize-none text-base shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="flex min-h-[40vh] flex-1 flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    {AI_DOC_TOOLS.find((t) => t.value === docPreview.tool)?.label ?? "Result"}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={discardDocPreview}>
                      Discard
                    </Button>
                    <Button size="sm" onClick={applyDocPreview}>
                      Use this version
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={docPreview.text}
                  readOnly
                  className="h-full min-h-[40vh] flex-1 resize-none border-primary/30 bg-primary/5 text-base shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          ) : (
            <Textarea
              value={doc}
              onChange={(e) => handleDocChange(e.target.value)}
              placeholder="Write your notes here..."
              className="h-full min-h-[60vh] w-full max-w-3xl resize-none border-none text-base shadow-none focus-visible:ring-0"
            />
          )}
        </div>
      ) : (
        <div className="custom-whiteboard-shell relative flex-1">
          <Excalidraw
            excalidrawAPI={setExcalidrawAPI}
            initialData={{
              elements: sceneRef.current.elements,
              appState: sceneRef.current.appState,
              files: sceneRef.current.files,
              scrollToContent: true,
            }}
            onChange={handleExcalidrawChange}
          />
          <WhiteboardToolbar excalidrawAPI={excalidrawAPI} activeTool={activeTool} />
          <WorkspaceUtilityBar excalidrawAPI={excalidrawAPI} />
          {selectedElement && toolbarPosition && (
            <PropertiesToolbar
              key={selectedElement.id}
              excalidrawAPI={excalidrawAPI}
              element={selectedElement}
              position={toolbarPosition}
            />
          )}
        </div>
      )}

      <Button
        size="icon-lg"
        onClick={() => setAiSidebarOpen(true)}
        className="fixed right-5 bottom-5 z-30 size-14 rounded-full shadow-lg"
        title="AI Tools"
      >
        <Sparkles className="size-6" />
        <span className="sr-only">Open AI Tools</span>
      </Button>

      <AiSidebar
        open={aiSidebarOpen}
        onOpenChange={setAiSidebarOpen}
        excalidrawAPI={excalidrawAPI}
        mode={mode}
        docText={doc}
        onDocRewrite={handleDocRewrite}
      />
    </div>
  );
}
