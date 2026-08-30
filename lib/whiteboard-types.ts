import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";

export type WorkspaceMode = "whiteboard" | "doc";

export interface WhiteboardAppState {
  viewBackgroundColor?: string;
}

export interface WhiteboardData {
  mode: WorkspaceMode;
  elements: readonly ExcalidrawElement[];
  appState: WhiteboardAppState;
  // Image elements (icons, exported images) only store a fileId on the
  // element itself -- the actual image bytes live here, keyed by that id.
  // Without persisting this too, any inserted image becomes a broken
  // reference after save/reload.
  files: BinaryFiles;
  doc: string;
}

export const DEFAULT_WHITEBOARD_DATA: WhiteboardData = {
  mode: "whiteboard",
  elements: [],
  appState: {},
  files: {},
  doc: "",
};
