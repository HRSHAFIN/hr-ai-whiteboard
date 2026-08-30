"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft, Check, Loader2, Save } from "lucide-react";

import "@excalidraw/excalidraw/index.css";
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import { renameWhiteboard, saveWhiteboardData } from "@/app/workspace/[projectId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WhiteboardQuickTools } from "@/components/workspace/whiteboard-quick-tools";
import { WhiteboardToolbar } from "@/components/workspace/whiteboard-toolbar";
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
  const [, startTransition] = useTransition();

  const sceneRef = useRef({
    elements: initialData.elements,
    appState: initialData.appState,
  });
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = () => {
    setSaveState("saving");
    startTransition(async () => {
      await saveWhiteboardData(boardId, {
        mode,
        doc,
        elements: sceneRef.current.elements,
        appState: sceneRef.current.appState,
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
    _files: BinaryFiles
  ) => {
    sceneRef.current = {
      elements,
      appState: { viewBackgroundColor: appState.viewBackgroundColor },
    };
    setActiveToolState(appState.activeTool.type);
    scheduleSave();
  };

  const handleDocChange = (value: string) => {
    setDoc(value);
    scheduleSave();
  };

  const handleModeChange = (value: WorkspaceMode) => {
    setMode(value);
    scheduleSave();
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
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon-sm" render={<Link href="/dashboard" />}>
          <ArrowLeft />
          <span className="sr-only">Back to Dashboard</span>
        </Button>

        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          W
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="h-8 w-48 border-transparent bg-transparent font-heading text-sm font-semibold shadow-none focus-visible:border-ring"
        />

        <div className="flex items-center rounded-full bg-muted p-0.5">
          {(["whiteboard", "doc"] as WorkspaceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
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
          <Button size="sm" onClick={handleManualSave}>
            <Save />
            Save
          </Button>
          <UserButton />
        </div>
      </header>

      {mode === "doc" ? (
        <div className="flex-1 overflow-auto p-6">
          <Textarea
            value={doc}
            onChange={(e) => handleDocChange(e.target.value)}
            placeholder="Write your notes here..."
            className="h-full min-h-[60vh] w-full max-w-3xl resize-none border-none text-base shadow-none focus-visible:ring-0"
          />
        </div>
      ) : (
        <div className="custom-whiteboard-shell relative flex-1">
          <Excalidraw
            excalidrawAPI={setExcalidrawAPI}
            initialData={{
              elements: sceneRef.current.elements,
              appState: sceneRef.current.appState,
              scrollToContent: true,
            }}
            onChange={handleExcalidrawChange}
          />
          <WhiteboardToolbar excalidrawAPI={excalidrawAPI} activeTool={activeTool} />
          <WhiteboardQuickTools excalidrawAPI={excalidrawAPI} />
        </div>
      )}
    </div>
  );
}
