export interface AiDiagramNode {
  id: string;
  shape: "rectangle" | "ellipse" | "diamond";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface AiDiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface AiDiagramResponse {
  nodes: AiDiagramNode[];
  edges: AiDiagramEdge[];
}

export const AI_DIAGRAM_TYPES = [
  { value: "diagram", label: "Diagram" },
  { value: "flowchart", label: "Flowchart" },
  { value: "architecture-diagram", label: "Architecture Diagram" },
  { value: "mobile-wireframe", label: "Mobile Wireframe" },
  { value: "web-wireframe", label: "Web Wireframe" },
  { value: "mind-map", label: "Mind Map" },
] as const;

export type AiDiagramType = (typeof AI_DIAGRAM_TYPES)[number]["value"];
