import FlowDiagram, {
  type FlowEdge,
  type FlowNode,
} from "@/components/dataviz/FlowDiagram";
import "./AnswerDiagram.css";

/**
 * AnswerDiagram — customer-path explainers for the three answers whose own
 * visible steps describe a sequence. Labels and summaries stay inside the
 * authored guide: no vendor lore, estimates, or invented failure states.
 */

const FORM_NODES: FlowNode[] = [
  { id: "phone", label: "A phone test", sub: "Submit one real test", col: 0 },
  { id: "form", label: "The form", sub: "Check the thank-you screen", col: 1 },
  { id: "mailbox", label: "The business mailbox", sub: "Check inbox, spam, and shared mail", col: 2 },
  { id: "reply", label: "A real reply", sub: "Someone owns the response", tone: "hub", col: 3 },
];

const FORM_EDGES: FlowEdge[] = [
  { from: "phone", to: "form", tone: "muted", pulse: true },
  { from: "form", to: "mailbox", tone: "muted" },
  { from: "mailbox", to: "reply", tone: "signal", chip: "test the whole path" },
];

const FORM_SUMMARY =
  "Submit one real test from a phone. Check the thank-you screen, inbox, spam, " +
  "and shared mailbox. The path only works when somebody owns the reply.";

const COST_NODES: FlowNode[] = [
  { id: "charges", label: "Three months of charges", sub: "Card and bank records", col: 0 },
  { id: "job", label: "Each tool's job", sub: "Name its owner and purpose", col: 1 },
  { id: "duplicates", label: "Duplicates and unused seats", sub: "Mark what does not earn its place", col: 2 },
  { id: "test", label: "One change at a time", sub: "Keep payments, booking, and records safe", tone: "hub", col: 3 },
];

const COST_EDGES: FlowEdge[] = [
  { from: "charges", to: "job", tone: "muted" },
  { from: "job", to: "duplicates", tone: "muted" },
  { from: "duplicates", to: "test", tone: "signal", chip: "do not cancel blind" },
];

const COST_SUMMARY =
  "Pull three months of card and bank charges. Name the owner and job of each tool. " +
  "Mark duplicates and unused seats. Test one change at a time, without canceling " +
  "a tool that handles payments, booking, records, or compliance before its replacement and export path are clear.";

const MAPS_NODES: FlowNode[] = [
  { id: "listing", label: "The public listing", sub: "Check it outside the business", col: 0 },
  { id: "facts", label: "The real facts", sub: "Name, address, phone, hours, category, website", col: 1 },
  { id: "duplicates", label: "Duplicate listings", sub: "Look before creating another one", col: 2 },
  { id: "official", label: "The official correction", sub: "Use Google's own flow", tone: "hub", col: 3 },
];

const MAPS_EDGES: FlowEdge[] = [
  { from: "listing", to: "facts", tone: "muted", pulse: true },
  { from: "facts", to: "duplicates", tone: "muted" },
  { from: "duplicates", to: "official", tone: "signal", chip: "do not make a second listing" },
];

const MAPS_SUMMARY =
  "Check the public listing outside the business. Compare its name, address, phone, " +
  "hours, category, and website with reality. Look for duplicates, then use Google's " +
  "own correction or verification flow rather than creating a second listing.";

export default function AnswerDiagram({ slug }: { slug: string }) {
  if (slug === "website-form-not-working-small-business") {
    return (
      <div className="lf-answer-diagram">
        <p className="lf-answer-diagram__kicker">The journey of a form message</p>
        <FlowDiagram
          label="The journey of a form message, with the usual break points"
          summary={FORM_SUMMARY}
          caption="Test the whole path before changing the design."
          nodes={FORM_NODES}
          edges={FORM_EDGES}
        />
      </div>
    );
  }

  if (slug === "reduce-monthly-software-costs-small-business") {
    return (
      <div className="lf-answer-diagram">
        <p className="lf-answer-diagram__kicker">Find the real software bill</p>
        <FlowDiagram
          label="A safe way to review recurring software costs"
          summary={COST_SUMMARY}
          caption="Know the job before you change the tool."
          nodes={COST_NODES}
          edges={COST_EDGES}
        />
      </div>
    );
  }

  if (slug === "business-not-showing-on-google-maps") {
    return (
      <div className="lf-answer-diagram">
        <p className="lf-answer-diagram__kicker">What feeds the pin</p>
        <FlowDiagram
          label="The signals that put a business on Google Maps"
          summary={MAPS_SUMMARY}
          caption="Start with public facts before calling it a ranking problem."
          nodes={MAPS_NODES}
          edges={MAPS_EDGES}
        />
      </div>
    );
  }

  return null;
}
