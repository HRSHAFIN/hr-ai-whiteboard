import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

// Where to drop a newly inserted element: to the right of whatever's already
// on the canvas (so it never lands on top of existing content), or a
// sensible default if the canvas is empty.
export function getInsertionPoint(elements: readonly ExcalidrawElement[]) {
  if (elements.length === 0) return { x: 100, y: 100 };
  return {
    x: Math.max(...elements.map((el) => el.x + el.width)) + 60,
    y: Math.min(...elements.map((el) => el.y)),
  };
}
