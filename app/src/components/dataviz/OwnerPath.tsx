import { Link } from "react-router-dom";
import FlowDiagram, { type FlowEdge, type FlowNode } from "./FlowDiagram";
import "./OwnerPath.css";

const NODES: FlowNode[] = [
  {
    id: "found",
    label: "Someone finds you",
    sub: "Search · referral · map",
    col: 0,
  },
  {
    id: "website",
    label: "They get a clear answer",
    sub: "Website · hours · services",
    col: 1,
  },
  {
    id: "action",
    label: "They can act",
    sub: "Call · book · order · ask",
    chips: ["one clear next step"],
    tone: "hub",
    col: 2,
  },
  {
    id: "followup",
    label: "The right person follows up",
    sub: "Notes · payment · care",
    tone: "signal",
    col: 3,
  },
];

const EDGES: FlowEdge[] = [
  { from: "found", to: "website", tone: "muted", chip: "real facts" },
  { from: "website", to: "action", tone: "signal", chip: "less hunting", pulse: true },
  { from: "action", to: "followup", tone: "signal", chip: "clear handoff", pulse: true },
];

export default function OwnerPath() {
  return (
    <section className="lf-owner-path" aria-labelledby="lf-owner-path-title">
      <div className="lf-owner-path__inner">
        <header className="lf-owner-path__head">
          <p className="lf-owner-path__eyebrow">One customer path</p>
          <h2 id="lf-owner-path-title">Five logins. One customer waiting.</h2>
          <p>
            A website is not a poster. It is where search, calls, bookings,
            payments, and follow-up should stop arguing with each other.
          </p>
        </header>

        <FlowDiagram
          className="lf-owner-path__flow"
          label="A customer path from discovery to follow-up"
          summary="A customer finds the business through search, a referral, or Maps. The website gives a clear answer. The customer can call, book, order, or ask a question. The right person can then follow up, take payment, and keep the details current."
          caption="An illustration of the path. It is not a performance claim or a customer-count chart."
          nodes={NODES}
          edges={EDGES}
        />

        <div className="lf-owner-path__footer">
          <p>
            We can fix one break, or make the whole path easier to own.
          </p>
          <Link to="/services/">See the useful next move</Link>
        </div>
      </div>
    </section>
  );
}
