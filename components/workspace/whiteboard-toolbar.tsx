"use client";

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
  Square,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function WhiteboardToolbar({
  excalidrawAPI,
  activeTool,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  activeTool: string;
}) {
  const setTool = (type: ToolType) => {
    excalidrawAPI?.setActiveTool({ type });
  };

  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 rounded-xl border bg-popover p-1 shadow-lg">
      {TOOLS.map((tool) => (
        <Button
          key={tool.type}
          variant={activeTool === tool.type ? "secondary" : "ghost"}
          size="icon-sm"
          title={tool.label}
          onClick={() => setTool(tool.type)}
          className={cn(activeTool === tool.type && "ring-1 ring-primary/40")}
        >
          <tool.icon className={TOOL_COLORS[tool.type]} />
          <span className="sr-only">{tool.label}</span>
        </Button>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" title="More tools" />}>
          <MoreHorizontal className="text-muted-foreground" />
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
