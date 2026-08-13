import type { FlowEdge, FlowNode } from "./FlowDiagram";

export type ConnectedPath = {
  label: string;
  summary: string;
  caption: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
};

const connectedPathEdges: FlowEdge[] = [
  { from: "one", to: "two", tone: "muted", chip: "clear facts" },
  { from: "two", to: "three", tone: "signal", chip: "one next step", pulse: true },
  { from: "three", to: "four", tone: "signal", chip: "someone owns it", pulse: true },
];

export function createConnectedPath(
  path: Omit<ConnectedPath, "edges">,
): ConnectedPath {
  return { ...path, edges: connectedPathEdges };
}
