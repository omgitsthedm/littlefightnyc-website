import FlowDiagram from "./FlowDiagram";
import type { ConnectedPath } from "./connectedPath";

/**
 * A small, route-ready customer-path explainer. Routes supply only facts they
 * already state in their own copy; the shared FlowDiagram provides the text
 * equivalent, restrained reveal, and reduced-motion settled state.
 */
export default function ConnectedPathDiagram({
  path,
  proof = "connected-path",
}: {
  path: ConnectedPath;
  proof?: string;
}) {
  return (
    <div data-lf-visual-proof={proof}>
      <FlowDiagram
        className="lf-connected-path"
        label={path.label}
        summary={path.summary}
        caption={path.caption}
        nodes={path.nodes}
        edges={path.edges}
      />
    </div>
  );
}
