"use client";

import { useState } from "react";
import {
  Circle,
  Diamond,
  Eraser,
  Frame,
  Hand,
  Image as ImageIcon,
  Minus,
  MoreHorizontal,
  MousePointer2,
  MoveUpRight,
  Pencil,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmojiIconsPopover } from "@/components/workspace/emoji-icons-popover";
import { NotesPopover } from "@/components/workspace/notes-popover";
import { cn } from "@/lib/utils";
import type { ExcalidrawImperativeAPI, ToolType } from "@excalidraw/excalidraw/types";

const TOOLS: { type: ToolType; icon: typeof Square; label: string }[] = [
  { type: "selection", icon: MousePointer2, label: "Selection" },
  { type: "hand", icon: Hand, label: "Hand" },
  { type: "rectangle", icon: Square, label: "Rectangle" },
  { type: "diamond", icon: Diamond, label: "Diamond" },
  { type: "ellipse", icon: Circle, label: "Circle" },
  { type: "arrow", icon: MoveUpRight, label: "Arrow" },
  { type: "line", icon: Minus, label: "Line" },
  { type: "freedraw", icon: Pencil, label: "Draw" },
  { type: "text", icon: Type, label: "Text" },
  { type: "eraser", icon: Eraser, label: "Eraser" },
];

const TOOL_COLORS: Partial<Record<ToolType, string>> = {
  selection: "text-slate-600",
  hand: "text-amber-600",
  rectangle: "text-blue-600",
  diamond: "text-violet-600",
  ellipse: "text-pink-600",
  arrow: "text-emerald-600",
  line: "text-cyan-600",
  freedraw: "text-orange-600",
  text: "text-indigo-600",
  eraser: "text-rose-600",
};

const QUICK_COLORS = [
  "#1e1e1e",
  "#e03131",
  "#f08c00",
  "#2f9e44",
  "#0c8599",
  "#1971c2",
  "#9c36b5",
];

const STROKE_WIDTHS = [1, 2, 4];

function nextInCycle<T>(list: T[], current: T): T {
  const idx = list.indexOf(current);
  return list[(idx + 1) % list.length];
}

// Excalidraw's own keydown handler is a React onKeyDown prop delegated on
// the ".excalidraw" container -- an event dispatched at window/document
// never traverses that container, so it's silently ignored. Dispatching
// directly on the container (with bubbles: true) is what actually reaches it.
function fireHistoryShortcut(redo: boolean) {
  const container = document.querySelector(".excalidraw");
  if (!container) return;
  container.dispatchEvent(
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

export function WhiteboardToolbar({
  excalidrawAPI,
  activeTool,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  activeTool: string;
}) {
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState(QUICK_COLORS[0]);

  const setTool = (type: ToolType) => {
    excalidrawAPI?.setActiveTool({ type });
  };

  const setColor = (color: string) => {
    setStrokeColor(color);
    excalidrawAPI?.updateScene({ appState: { currentItemStrokeColor: color } });
  };

  const cycleStrokeWidth = () => {
    const next = nextInCycle(STROKE_WIDTHS, strokeWidth);
    setStrokeWidth(next);
    excalidrawAPI?.updateScene({ appState: { currentItemStrokeWidth: next } });
  };

  const clearCanvas = () => {
    if (window.confirm("Clear the entire canvas? This can be undone with Ctrl+Z.")) {
      excalidrawAPI?.updateScene({ elements: [] });
    }
  };

  return (
    <div className="absolute top-2 left-2 z-10 flex max-h-[calc(100vh-4.5rem)] flex-col gap-0.5 overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg sm:top-3 sm:left-3 sm:max-h-[calc(100vh-5.5rem)] sm:gap-1">
      {TOOLS.map((tool) => (
        <Button
          key={tool.type}
          variant={activeTool === tool.type ? "secondary" : "ghost"}
          size="icon-lg"
          title={tool.label}
          onClick={() => setTool(tool.type)}
          className={cn("size-8 sm:size-9", activeTool === tool.type && "ring-1 ring-primary/40")}
        >
          <tool.icon className={cn("size-4 sm:size-5", TOOL_COLORS[tool.type])} />
          <span className="sr-only">{tool.label}</span>
        </Button>
      ))}

      <div className="my-0.5 h-px w-full bg-border sm:my-1" />

      <Button
        variant="ghost"
        size="icon-lg"
        title="Brush size"
        onClick={cycleStrokeWidth}
        className="size-8 text-xs font-semibold sm:size-9"
      >
        {strokeWidth}px
      </Button>

      <div className="my-0.5 h-px w-full bg-border sm:my-1" />

      <div className="grid grid-cols-2 gap-1 p-0.5">
        {QUICK_COLORS.map((color) => (
          <button
            key={color}
            title={color}
            onClick={() => setColor(color)}
            style={{ backgroundColor: color }}
            className={cn(
              "size-3.5 shrink-0 rounded-full ring-1 ring-foreground/10 transition-transform hover:scale-110 sm:size-4",
              strokeColor === color && "ring-2 ring-primary"
            )}
          />
        ))}
      </div>

      <div className="my-0.5 h-px w-full bg-border sm:my-1" />

      <NotesPopover excalidrawAPI={excalidrawAPI} />
      <EmojiIconsPopover excalidrawAPI={excalidrawAPI} />

      <div className="my-0.5 h-px w-full bg-border sm:my-1" />

      <Button variant="ghost" size="icon-lg" title="Undo" className="size-8 sm:size-9" onClick={() => fireHistoryShortcut(false)}>
        <Undo2 className="size-4 sm:size-5" />
        <span className="sr-only">Undo</span>
      </Button>
      <Button variant="ghost" size="icon-lg" title="Redo" className="size-8 sm:size-9" onClick={() => fireHistoryShortcut(true)}>
        <Redo2 className="size-4 sm:size-5" />
        <span className="sr-only">Redo</span>
      </Button>

      <div className="my-0.5 h-px w-full bg-border sm:my-1" />

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-lg" title="More tools" className="size-8 sm:size-9" />}>
          <MoreHorizontal className="size-4 text-muted-foreground sm:size-5" />
          <span className="sr-only">More tools</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={() => setTool("frame")}>
            <Frame />
            Frame
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTool("image")}>
            <ImageIcon />
            Image
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={clearCanvas}>
            <Trash2 />
            Clear canvas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
