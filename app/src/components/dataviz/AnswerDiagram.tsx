import FlowDiagram, {
  type FlowEdge,
  type FlowNode,
} from "@/components/dataviz/FlowDiagram";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import "./AnswerDiagram.css";

/**
 * AnswerDiagram — slug-keyed visual explainer for the flagship owner answers.
 * Every fact is restated from the guide's own copy in src/data/site.ts;
 * nothing is invented and nothing is priced. Returns null for slugs that
 * do not have a diagram. Reveal-once via useScrollReveal; reduced motion
 * renders the final state; each figure carries an aria-label and a visually
 * hidden text equivalent.
 */

/* ---- 1. The journey of a form message (pipeline + orange break nodes) ---- */

const FORM_NODES: FlowNode[] = [
  { id: "visitor", label: "A customer", sub: "sends a real message", col: 0 },
  { id: "form", label: "The form", sub: "says thank you either way", col: 1 },
  { id: "plugin", label: "Form plugin", sub: "builds and sends the email", col: 2 },
  {
    id: "break-plugin",
    label: "✕ Plugin or trial expired",
    sub: "the form quietly stops sending",
    tone: "signal",
    col: 2,
  },
  { id: "dns", label: "Domain email records", sub: "SPF + DKIM vouch for the mail", col: 3 },
  {
    id: "break-dns",
    label: "✕ Missing SPF or DKIM",
    sub: "your mail reads as spam",
    tone: "signal",
    col: 3,
  },
  { id: "filter", label: "Spam filter", sub: "decides where it lands", col: 4 },
  {
    id: "break-filter",
    label: "✕ Filtered out",
    sub: "sitting in the spam folder",
    tone: "signal",
    col: 4,
  },
  { id: "inbox", label: "Your inbox", sub: "where someone answers", col: 5 },
  {
    id: "break-inbox",
    label: "✕ Nobody sees it",
    sub: "alert goes to someone who left, or the mailbox filled up",
    tone: "signal",
    col: 5,
  },
];

const FORM_EDGES: FlowEdge[] = [
  { from: "visitor", to: "form", tone: "muted", pulse: true },
  { from: "form", to: "plugin", tone: "muted" },
  { from: "plugin", to: "dns", tone: "muted" },
  { from: "dns", to: "filter", tone: "muted" },
  { from: "filter", to: "inbox", tone: "muted" },
  { from: "plugin", to: "break-plugin", tone: "signal" },
  { from: "dns", to: "break-dns", tone: "signal" },
  { from: "filter", to: "break-filter", tone: "signal" },
  { from: "inbox", to: "break-inbox", tone: "signal" },
];

const FORM_SUMMARY =
  "The journey of a form message: a customer sends a message, the form says " +
  "thank you either way, a form plugin builds and sends the email, your " +
  "domain's SPF and DKIM records vouch for it, a spam filter decides where " +
  "it lands, and it arrives in your inbox where someone answers. The guide's " +
  "usual break points are marked along that path: the plugin or a trial " +
  "quietly expired, missing SPF or DKIM records send your mail to spam, the " +
  "message gets filtered out, or nobody sees it because the alert goes to " +
  "someone who left or the mailbox filled up.";

/* ---- 2. The hidden bill (stacked layers, qualitative only) ---- */

const BILL_LAYERS: Array<{ name: string; note: string; hidden?: boolean }> = [
  { name: "The subscription", note: "the line you see on the statement" },
  { name: "Staff time", note: "paid hours spent working around the tool", hidden: true },
  { name: "Double typing", note: "the same info typed into three places", hidden: true },
  { name: "Missed leads", note: "follow-up that slips when tools do not talk", hidden: true },
  { name: "Hand-made reports", note: "numbers pulled together by hand", hidden: true },
];

const BILL_SUMMARY =
  "The hidden bill: the subscription is only the visible line on the " +
  "statement. Underneath it sit the costs the guide names — staff time, " +
  "double typing, missed leads, and hand-made reports. No dollar figures; " +
  "the point is that the stack under the subscription is where the real " +
  "cost hides.";

function HiddenBill() {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.25 });
  return (
    <figure ref={ref} className="lf-bill" role="group" aria-label="The hidden bill">
      <p className="lf-viz-sr">{BILL_SUMMARY}</p>
      <div className="lf-bill__stack" aria-hidden="true">
        {BILL_LAYERS.map((layer, i) => (
          <div key={layer.name} style={{ ["--lf-i" as string]: i }}>
            {i === 1 && (
              <p className="lf-bill__waterline">
                <span>What the statement never shows</span>
              </p>
            )}
            <div
              className="lf-bill__layer"
              data-tone={layer.hidden ? "hidden" : "visible"}
              data-depth={i}
            >
              <span className="lf-bill__name">{layer.name}</span>
              <span className="lf-bill__note">{layer.note}</span>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="lf-bill__caption">
        The subscription is only one cost — the stack underneath is why the bill hurts.
      </figcaption>
    </figure>
  );
}

/* ---- 3. The signals that feed the Maps pin (hub-and-spoke) ---- */

const MAPS_NODES: FlowNode[] = [
  { id: "verified", label: "Verified profile", sub: "signed in and confirmed", col: 0 },
  { id: "category", label: "Right category", sub: "matches what you really do", col: 0 },
  { id: "hours", label: "Exact address + hours", sub: "current, down to the suite", col: 0 },
  {
    id: "pin",
    label: "Your Maps pin",
    sub: "Google shows what it can confirm",
    tone: "hub",
    col: 1,
  },
  {
    id: "nap",
    label: "Matching name · address · phone",
    sub: "the same everywhere Google looks",
    col: 2,
  },
  { id: "reviews", label: "Real reviews", sub: "steady proof from customers", col: 2 },
  { id: "pages", label: "Clear service pages", sub: "say what you do, and where", col: 2 },
];

const MAPS_EDGES: FlowEdge[] = [
  { from: "verified", to: "pin", pulse: true },
  { from: "category", to: "pin" },
  { from: "hours", to: "pin" },
  { from: "pin", to: "nap" },
  { from: "pin", to: "reviews" },
  { from: "pin", to: "pages" },
];

const MAPS_SUMMARY =
  "The signals that feed your Maps pin, all pulled from the guide: a " +
  "verified Google Business Profile, a main category that matches what you " +
  "really do, an exact address and current hours, a name, address, and phone " +
  "that read the same everywhere Google looks, real reviews, and clear " +
  "service pages that say what you do and where. Google shows the pin it " +
  "can confirm — weaken a signal and the pin slips out of the local results.";

/* ---- Slug-keyed dispatch ---- */

export default function AnswerDiagram({ slug }: { slug: string }) {
  if (slug === "website-form-not-working-small-business") {
    return (
      <div className="lf-answer-diagram">
        <p className="lf-answer-diagram__kicker">The journey of a form message</p>
        <FlowDiagram
          label="The journey of a form message, with the usual break points"
          summary={FORM_SUMMARY}
          caption="Where silent forms actually break — each one is an afternoon fix once you find it"
          nodes={FORM_NODES}
          edges={FORM_EDGES}
        />
      </div>
    );
  }

  if (slug === "reduce-monthly-software-costs-small-business") {
    return (
      <div className="lf-answer-diagram">
        <p className="lf-answer-diagram__kicker">The hidden bill</p>
        <HiddenBill />
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
          caption="Google shows the pin it can confirm — every signal has to agree"
          nodes={MAPS_NODES}
          edges={MAPS_EDGES}
        />
      </div>
    );
  }

  return null;
}
