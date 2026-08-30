"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowUpToLine,
  ArrowDownToLine,
  Copy,
  Lock,
  MoreHorizontal,
  Trash2,
  Unlock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type {
  Arrowhead,
  ExcalidrawElement,
  StrokeStyle,
  TextAlign,
} from "@excalidraw/excalidraw/element/types";

const STROKE_COLORS = ["#1e1e1e", "#e03131", "#f08c00", "#2f9e44", "#1971c2", "#9c36b5"];
const BACKGROUND_COLORS = ["transparent", "#ffec99", "#ffc9c9", "#b2f2bb", "#a5d8ff", "#eebefa"];
const STROKE_WIDTHS = [1, 2, 4];
const STROKE_STYLES: StrokeStyle[] = ["solid", "dashed", "dotted"];
const ARROWHEADS: (Arrowhead | null)[] = [null, "arrow", "triangle", "dot"];
const FONT_SIZES = [16, 20, 28, 36];
const TEXT_ALIGNS: TextAlign[] = ["left", "center", "right"];

function nextInCycle<T>(list: T[], current: T): T {
  const idx = list.indexOf(current);
  return list[(idx + 1) % list.length];
}

function ColorSwatch({
  color,
  title,
  onClick,
}: {
  color: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "size-6 shrink-0 rounded-md ring-1 ring-foreground/15",
        color === "transparent" &&
          "bg-[repeating-conic-gradient(#d4d4d4_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]"
      )}
      style={color === "transparent" ? undefined : { backgroundColor: color }}
    />
  );
}

export function PropertiesToolbar({
  excalidrawAPI,
  element,
  position,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  element: ExcalidrawElement;
  position: { x: number; y: number };
}) {
  const applyPatch = (patch: Partial<ExcalidrawElement>) => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const updated = elements.map((el) =>
      el.id === element.id
        ? ({
            ...el,
            ...patch,
            version: el.version + 1,
            versionNonce: Math.floor(Math.random() * 2 ** 31),
            updated: Date.now(),
          } as ExcalidrawElement)
        : el
    );
    excalidrawAPI.updateScene({ elements: updated, captureUpdate: "IMMEDIATELY" });
  };

  const duplicate = () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const clone = {
      ...element,
      id: crypto.randomUUID(),
      x: element.x + 20,
      y: element.y + 20,
      version: 1,
      versionNonce: Math.floor(Math.random() * 2 ** 31),
      seed: Math.floor(Math.random() * 2 ** 31),
      updated: Date.now(),
    } as ExcalidrawElement;
    excalidrawAPI.updateScene({
      elements: [...elements, clone],
      appState: { selectedElementIds: { [clone.id]: true } },
      captureUpdate: "IMMEDIATELY",
    });
  };

  const remove = () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const updated = elements.map((el) =>
      el.id === element.id ? { ...el, isDeleted: true } : el
    );
    excalidrawAPI.updateScene({
      elements: updated,
      appState: { selectedElementIds: {} },
      captureUpdate: "IMMEDIATELY",
    });
  };

  const reorder = (toFront: boolean) => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const target = elements.find((el) => el.id === element.id);
    if (!target) return;
    const rest = elements.filter((el) => el.id !== element.id);
    excalidrawAPI.updateScene({
      elements: toFront ? [...rest, target] : [target, ...rest],
      captureUpdate: "IMMEDIATELY",
    });
  };

  const isShape = element.type === "rectangle" || element.type === "diamond" || element.type === "ellipse";
  const isLinear = element.type === "arrow" || element.type === "line";
  const isText = element.type === "text";
  const isImage = element.type === "image";

  return (
    <div
      style={{ left: position.x, top: position.y, transform: "translate(-50%, calc(-100% - 12px))" }}
      className="absolute z-20 flex items-center gap-1 rounded-xl border bg-popover p-1 shadow-lg"
    >
      {isShape && (
        <ColorSwatch
          title="Fill color"
          color={element.backgroundColor}
          onClick={() => applyPatch({ backgroundColor: nextInCycle(BACKGROUND_COLORS, element.backgroundColor) })}
        />
      )}

      {!isImage && (
        <ColorSwatch
          title={isText ? "Text color" : "Stroke color"}
          color={element.strokeColor}
          onClick={() => applyPatch({ strokeColor: nextInCycle(STROKE_COLORS, element.strokeColor) })}
        />
      )}

      {isText && (
        <>
          <Button
            variant="ghost"
            size="sm"
            title="Font size"
            onClick={() => applyPatch({ fontSize: nextInCycle(FONT_SIZES, element.fontSize) } as Partial<ExcalidrawElement>)}
          >
            {(element as unknown as { fontSize: number }).fontSize}px
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Align"
            onClick={() =>
              applyPatch({ textAlign: nextInCycle(TEXT_ALIGNS, (element as unknown as { textAlign: TextAlign }).textAlign) } as Partial<ExcalidrawElement>)
            }
          >
            {(element as unknown as { textAlign: TextAlign }).textAlign === "left" && <AlignLeft />}
            {(element as unknown as { textAlign: TextAlign }).textAlign === "center" && <AlignCenter />}
            {(element as unknown as { textAlign: TextAlign }).textAlign === "right" && <AlignRight />}
          </Button>
        </>
      )}

      {(isShape || isLinear) && (
        <Button
          variant="ghost"
          size="sm"
          title="Stroke width"
          onClick={() => applyPatch({ strokeWidth: nextInCycle(STROKE_WIDTHS, element.strokeWidth) })}
        >
          {element.strokeWidth}px
        </Button>
      )}

      {(isShape || isLinear) && (
        <button
          title="Stroke style"
          onClick={() => applyPatch({ strokeStyle: nextInCycle(STROKE_STYLES, element.strokeStyle) })}
          className="flex h-7 w-8 shrink-0 items-center justify-center rounded-md hover:bg-muted"
        >
          <div
            className="h-0 w-4"
            style={{ borderTop: `2px ${element.strokeStyle} currentColor` }}
          />
        </button>
      )}

      {element.type === "arrow" && (
        <Button
          variant="ghost"
          size="sm"
          title="Arrowhead"
          onClick={() =>
            applyPatch({
              endArrowhead: nextInCycle(ARROWHEADS, (element as unknown as { endArrowhead: Arrowhead | null }).endArrowhead),
            } as Partial<ExcalidrawElement>)
          }
        >
          {(element as unknown as { endArrowhead: Arrowhead | null }).endArrowhead ?? "none"}
        </Button>
      )}

      <div className="mx-0.5 h-5 w-px bg-border" />

      <Button variant="ghost" size="icon-sm" title={element.locked ? "Unlock" : "Lock"} onClick={() => applyPatch({ locked: !element.locked })}>
        {element.locked ? <Lock /> : <Unlock />}
      </Button>
      <Button variant="ghost" size="icon-sm" title="Duplicate" onClick={duplicate}>
        <Copy />
      </Button>
      <Button variant="ghost" size="icon-sm" title="Delete" onClick={remove}>
        <Trash2 />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" title="More" />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end">
          <DropdownMenuItem onClick={() => reorder(true)}>
            <ArrowUpToLine />
            Bring to Front
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => reorder(false)}>
            <ArrowDownToLine />
            Send to Back
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="flex items-center gap-2 px-1.5 py-1">
            <span className="text-xs text-muted-foreground">Opacity</span>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={element.opacity}
              onChange={(e) => applyPatch({ opacity: Number(e.target.value) })}
              className="h-1.5 flex-1 accent-primary"
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
