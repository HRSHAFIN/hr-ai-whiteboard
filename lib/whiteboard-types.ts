import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export type WorkspaceMode = "whiteboard" | "doc";

export interface WhiteboardAppState {
  viewBackgroundColor?: string;
}

export interface WhiteboardData {
  mode: WorkspaceMode;
  elements: readonly ExcalidrawElement[];
  appState: WhiteboardAppState;
  doc: string;
}

export const DEFAULT_WHITEBOARD_DATA: WhiteboardData = {
  mode: "whiteboard",
  elements: [],
  appState: {},
  doc: "",
};
