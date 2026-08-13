import { useState } from "react";
import FlowDiagram, { type FlowEdge, type FlowNode } from "./FlowDiagram";
import "./WebsiteNightShift.css";

const NODES: FlowNode[] = [
  { id: "closed", label: "The business closes", sub: "The owner goes home", tone: "muted", col: 0 },
  { id: "question", label: "A customer has a question", sub: "Hours · fit · price context", col: 1 },
  { id: "answer", label: "The website answers & stays open", sub: "Current facts · book · form · order", tone: "hub", col: 2 },
  { id: "morning", label: "The owner gets one handoff", sub: "Context ready for follow-up", tone: "signal", col: 3 },
];

const EDGES: FlowEdge[] = [
  { from: "closed", to: "question", tone: "muted", chip: "after close" },
  { from: "question", to: "answer", tone: "signal", chip: "useful answer" },
  { from: "answer", to: "morning", tone: "signal", chip: "one handoff" },
];

export default function WebsiteNightShift() {
  const [run, setRun] = useState(0);
  return (
    <section className="lf-night-shift" aria-labelledby="lf-night-shift-title" data-lf-visual-proof="website-night-shift">
      <div className="lf-night-shift__inner">
        <header>
          <p>Website night shift</p>
          <h2 id="lf-night-shift-title">You can sleep. The useful answers stay awake.</h2>
          <p>A good website does not pretend to be a person. It answers the repeat questions, keeps the right next step open, and leaves a clean handoff for morning.</p>
        </header>
        <FlowDiagram
          key={run}
          label="An after-hours customer path"
          summary="After the business closes, a customer asks a common question. The website shows current facts and keeps a booking, form, order, or later-call option open. The owner receives one clear handoff to review in the morning."
          caption="A qualitative path illustration. It does not claim visitor, booking, order, or revenue volume."
          nodes={NODES}
          edges={EDGES}
        />
        <button type="button" onClick={() => setRun((current) => current + 1)}>Replay the Path</button>
      </div>
    </section>
  );
}
