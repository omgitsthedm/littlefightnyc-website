import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import FlowDiagram from "./FlowDiagram";
import TimelineStrip from "./TimelineStrip";
import "./ServiceDiagram.css";

/**
 * ServiceDiagram — slug-keyed diagrams for the four service pages. Every
 * fact drawn here is already in the service's own copy in src/data/site.ts
 * (outcome promises, includes[], commonIssues nouns). Map lives here so the
 * data layer stays untouched.
 */

/** it-support response-window strip. Facts: 2-hour callbacks 9am-9pm ET,
 * on-site within 24 hours when needed, with next-business-day follow-up after hours. */
function ResponseWindow() {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.3 });
  return (
    <figure
      ref={ref}
      className="lf-respwin"
      role="group"
      aria-label="Response windows"
    >
      <p className="lf-viz-sr">
        From 9am to 9pm Eastern, calls get a callback within 2 hours. After
        hours, leave a message and Little Fight NYC will follow up. When the fix
        needs hands on hardware, we are on-site within 24 hours.
      </p>
      <div className="lf-respwin__body" aria-hidden="true">
        <div className="lf-respwin__row">
          <p className="lf-respwin__row-label">Callback window</p>
          <div className="lf-respwin__band">
            <span className="lf-respwin__seg lf-respwin__seg--off" style={{ width: "37.5%" }} />
            <span className="lf-respwin__seg lf-respwin__seg--live" style={{ width: "50%" }}>
              <span className="lf-respwin__bracket">2-hour callback</span>
            </span>
            <span className="lf-respwin__seg lf-respwin__seg--off" style={{ width: "12.5%" }} />
          </div>
          <div className="lf-respwin__scale">
            <span>12am</span>
            <span style={{ left: "37.5%" }}>9am</span>
            <span style={{ left: "87.5%" }}>9pm</span>
            <span className="lf-respwin__scale-end">12am</span>
          </div>
          <p className="lf-respwin__note">
            After hours: leave a message and we will follow up.
          </p>
        </div>
        <div className="lf-respwin__row">
          <p className="lf-respwin__row-label">On-site</p>
          <div className="lf-respwin__band lf-respwin__band--onsite">
            <span className="lf-respwin__seg lf-respwin__seg--onsite" style={{ width: "100%" }}>
              <span className="lf-respwin__bracket">within 24 hours, when needed</span>
            </span>
          </div>
        </div>
      </div>
      <figcaption className="lf-respwin__caption">
        Callbacks within 2 hours, 9am–9pm ET · on-site within 24 hours
      </figcaption>
    </figure>
  );
}

const DIAGRAMS: Record<string, () => React.ReactElement> = {
  "custom-local-websites": () => (
    <TimelineStrip
      label="How a website build runs"
      summary="The build runs in three beats — build, review, ship — and usually ships by day 14. If our side misses the date, you don't pay. Pacing shown is typical."
      caption="Typical pacing — most builds ship within 14 days"
      beats={[
        { label: "Build", sub: "typical" },
        { label: "Review", sub: "typical" },
        { label: "Ship", sub: "≤ day 14", marker: true },
      ]}
      badge="Miss the date on our side = you don't pay"
    />
  ),

  "business-systems": () => (
    <FlowDiagram
      label="Lead intake, before and after"
      summary="Before: phone calls, contact forms, Instagram DMs, and walk-ins — four channels tracked in zero places. After: one intake layer routes every lead to follow-up, a dashboard, and the owner view."
      caption="4 channels tracked in 0 → one intake layer"
      nodes={[
        { id: "phone", label: "Phone calls", tone: "muted", col: 0 },
        { id: "forms", label: "Contact forms", tone: "muted", col: 0 },
        { id: "dms", label: "Instagram DMs", tone: "muted", col: 0 },
        { id: "walkins", label: "Walk-ins", tone: "muted", col: 0 },
        { id: "intake", label: "One intake layer", tone: "hub", col: 1 },
        { id: "follow", label: "Follow-up", col: 2 },
        { id: "dash", label: "Dashboard", col: 2 },
        { id: "owner", label: "Owner view", col: 2 },
      ]}
      edges={[
        { from: "phone", to: "intake", tone: "muted" },
        { from: "forms", to: "intake", tone: "muted" },
        { from: "dms", to: "intake", tone: "muted" },
        { from: "walkins", to: "intake", tone: "muted" },
        { from: "intake", to: "follow", tone: "signal", pulse: true },
        { from: "intake", to: "dash", tone: "signal" },
        { from: "intake", to: "owner", tone: "signal" },
      ]}
    />
  ),

  "it-support": () => <ResponseWindow />,

  "tech-consulting": () => (
    <FlowDiagram
      label="Anatomy of the free read"
      summary="Four lanes go into the free read — the tool stack and monthly costs, the website, the Google profile and lead path, and the workflow walkthrough. Out comes one written punch list, ranked by customer impact, cost, and what can wait."
      caption="The free read → one ranked punch list"
      nodes={[
        { id: "stack", label: "Tool stack + costs", col: 0 },
        { id: "site", label: "Website", col: 0 },
        { id: "google", label: "Google profile + lead path", col: 0 },
        { id: "workflow", label: "Workflow walkthrough", col: 0 },
        {
          id: "punchlist",
          label: "Written punch list",
          sub: "ranked",
          tone: "hub",
          chips: ["customer impact", "cost", "can wait"],
          col: 1,
        },
      ]}
      edges={[
        { from: "stack", to: "punchlist", tone: "signal" },
        { from: "site", to: "punchlist", tone: "signal" },
        { from: "google", to: "punchlist", tone: "signal" },
        { from: "workflow", to: "punchlist", tone: "signal" },
      ]}
    />
  ),
};

export default function ServiceDiagram({ slug }: { slug: string }) {
  const Diagram = DIAGRAMS[slug];
  return Diagram ? <Diagram /> : null;
}
