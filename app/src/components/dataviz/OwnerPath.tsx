import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import FlowDiagram, { type FlowEdge, type FlowNode } from "./FlowDiagram";
import "./OwnerPath.css";

const NODES: FlowNode[] = [
  {
    id: "plan",
    label: "Plan",
    sub: "What is slowing people down?",
    col: 0,
  },
  {
    id: "build",
    label: "Build",
    sub: "Website · words · useful tools",
    col: 1,
  },
  {
    id: "connect",
    label: "Connect",
    sub: "Search · calls · booking · payment",
    chips: ["one clear path"],
    tone: "hub",
    col: 2,
  },
  {
    id: "care",
    label: "Keep working",
    sub: "Support when life happens",
    tone: "signal",
    col: 3,
  },
];

const EDGES: FlowEdge[] = [
  { from: "plan", to: "build", tone: "signal" },
  { from: "build", to: "connect", tone: "signal" },
  { from: "connect", to: "care", tone: "signal" },
];

export default function OwnerPath() {
  const [replay, setReplay] = useState(0);

  return (
    <section className="lf-owner-path" aria-labelledby="lf-owner-path-title" data-lf-visual-proof="customer-path">
      <div className="lf-owner-path__inner">
        <header className="lf-owner-path__head">
          <p className="lf-owner-path__eyebrow">LF / 03 · One accountable path</p>
          <h2 id="lf-owner-path-title">Five handoffs. One customer waiting.</h2>
          <p>
            Search, website, booking, payment, and follow-up are one customer
            experience. We plan the handoffs so you do not have to referee them.
          </p>
          <p className="lf-owner-path__snark">No vendor ping-pong.</p>
        </header>

        <div className="lf-owner-path__instrument">
          <div className="lf-owner-path__before" role="group" aria-label="Before: search, website, booking, payment, and follow-up sit in separate handoffs without a clear owner.">
            {[
              "Search",
              "Website",
              "Booking",
              "Payment",
              "Follow-up",
            ].map((step, index) => (
              <span key={step}>
                <b>{step}</b>
                {index < 4 && <i aria-hidden="true">Who owns this?</i>}
              </span>
            ))}
          </div>

          <FlowDiagram
            key={replay}
            className="lf-owner-path__flow"
            label="One connected Little Fight delivery path"
            summary="Little Fight plans what is slowing the customer down, builds the website, words, and useful tools, connects search, calls, booking, and payment, then supports the setup when life happens."
            caption="This shows who owns the handoffs. It is not a performance or revenue claim."
            nodes={NODES}
            edges={EDGES}
          />

          <div className="lf-owner-path__footer">
            <p>
              Fix one break, or make the whole path easier to own.
            </p>
            <div>
              <button type="button" onClick={() => setReplay((current) => current + 1)}>
                <RotateCcw size={15} strokeWidth={2} aria-hidden="true" />
                Replay path
              </button>
              <Link to="/services/">See how the pieces connect</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
