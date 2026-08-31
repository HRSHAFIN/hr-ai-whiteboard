"use client";

import { NotebookPen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ensureExcalidrawFontsLoaded } from "@/lib/excalidraw-fonts";
import { getInsertionPoint } from "@/lib/excalidraw-layout";
import { NOTE_TEMPLATES, type NoteTemplate } from "@/lib/quick-insert-data";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export function NotesPopover({
  excalidrawAPI,
  disabled,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  disabled?: boolean;
}) {
  const insertTemplate = async (template: NoteTemplate) => {
    if (!excalidrawAPI) return;
    await ensureExcalidrawFontsLoaded();

    const existing = excalidrawAPI.getSceneElements();
    const { x, y } = getInsertionPoint(existing);

    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
    const newElements = convertToExcalidrawElements([
      {
        type: "rectangle",
        x,
        y,
        width: template.width,
        height: template.height,
        backgroundColor: template.backgroundColor,
        strokeColor: template.strokeColor,
        fillStyle: "solid",
        label: { text: template.text, fontSize: template.fontSize },
      },
    ]);

    excalidrawAPI.updateScene({
      elements: [...existing, ...newElements],
      appState: { selectedElementIds: Object.fromEntries(newElements.map((el) => [el.id, true])) },
      captureUpdate: "IMMEDIATELY",
    });
    excalidrawAPI.scrollToContent(newElements, { fitToContent: true });
  };

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon-lg" title="Notes" className="size-8 sm:size-9" disabled={disabled} />}
      >
        <NotebookPen className="size-4 sm:size-5" />
        <span className="sr-only">Notes</span>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-72">
        <PopoverHeader>
          <PopoverTitle>Add notes</PopoverTitle>
          <PopoverDescription>Pick a blank note style for the whiteboard.</PopoverDescription>
        </PopoverHeader>

        <div className="flex flex-col gap-1.5">
          {NOTE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => insertTemplate(template)}
              className="flex items-center gap-3 rounded-lg border p-2.5 text-left hover:bg-muted/50"
            >
              <span className={`size-9 shrink-0 rounded-md ${template.swatchClass}`} />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{template.label}</span>
                <span className="text-xs text-muted-foreground">{template.description}</span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
