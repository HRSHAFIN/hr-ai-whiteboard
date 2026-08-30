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
  { value: "diagram", label: "Diagram", description: "Create a visual diagram" },
  { value: "flowchart", label: "Flowchart", description: "Visualize a workflow" },
  { value: "architecture-diagram", label: "Architecture", description: "Design system architecture" },
  { value: "web-wireframe", label: "Web Mockup", description: "Generate a web wireframe" },
  { value: "mobile-wireframe", label: "Mobile Mockup", description: "Generate app wireframe" },
  { value: "mind-map", label: "Mind Map", description: "Brainstorm and connect ideas" },
  { value: "notes", label: "Smart Notes", description: "Turn this board into notes" },
] as const;

export type AiDiagramType = (typeof AI_DIAGRAM_TYPES)[number]["value"];
