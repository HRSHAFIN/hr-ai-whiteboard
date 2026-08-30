"use client";

import { Eraser, MoreHorizontal, Pencil, Redo2, Type, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EmojiIconsPopover } from "@/components/workspace/emoji-icons-popover";
import { NotesPopover } from "@/components/workspace/notes-popover";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const QUICK_COLORS = [
  "#1e1e1e",
  "#e03131",
  "#f08c00",
  "#2f9e44",
  "#0c8599",
  "#1971c2",
  "#9c36b5",
];

function fireHistoryShortcut(redo: boolean) {
  window.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "z",
      code: "KeyZ",
      ctrlKey: true,
      metaKey: true,
      shiftKey: redo,
      bubbles: true,
    })
  );
}

export function WhiteboardQuickTools({
  excalidrawAPI,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}) {
  const setColor = (color: string) => {
    excalidrawAPI?.updateScene({ appState: { currentItemStrokeColor: color } });
  };

  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex max-w-[calc(100vw-6rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border bg-popover p-1.5 shadow-lg">
      {QUICK_COLORS.map((color) => (
        <button
          key={color}
          title={color}
          onClick={() => setColor(color)}
          style={{ backgroundColor: color }}
          className={cn("size-5 shrink-0 rounded-full ring-1 ring-foreground/10 transition-transform hover:scale-110")}
        />
      ))}

      <div className="mx-1 h-5 w-px bg-border" />

      <Button variant="ghost" size="icon-sm" title="Draw" onClick={() => excalidrawAPI?.setActiveTool({ type: "freedraw" })}>
        <Pencil />
        <span className="sr-only">Pen</span>
      </Button>
      <Button variant="ghost" size="icon-sm" title="Eraser" onClick={() => excalidrawAPI?.setActiveTool({ type: "eraser" })}>
        <Eraser />
        <span className="sr-only">Eraser</span>
      </Button>
      <Button variant="ghost" size="icon-sm" title="Text" onClick={() => excalidrawAPI?.setActiveTool({ type: "text" })}>
        <Type />
        <span className="sr-only">Text</span>
      </Button>

      <div className="mx-1 h-5 w-px bg-border" />

      <NotesPopover excalidrawAPI={excalidrawAPI} />
      <EmojiIconsPopover excalidrawAPI={excalidrawAPI} />

      <div className="mx-1 h-5 w-px bg-border" />

      <Button variant="ghost" size="icon-sm" title="Undo" onClick={() => fireHistoryShortcut(false)}>
        <Undo2 />
        <span className="sr-only">Undo</span>
      </Button>
      <Button variant="ghost" size="icon-sm" title="Redo" onClick={() => fireHistoryShortcut(true)}>
        <Redo2 />
        <span className="sr-only">Redo</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" title="More" />}>
          <MoreHorizontal />
          <span className="sr-only">More</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (window.confirm("Clear the entire canvas? This can be undone with Ctrl+Z.")) {
                excalidrawAPI?.updateScene({ elements: [] });
              }
            }}
          >
            Clear canvas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
