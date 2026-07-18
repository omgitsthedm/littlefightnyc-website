import FlowDiagram from "./FlowDiagram";
import LeadsCaught from "./LeadsCaught";
import WhoAnswers from "./WhoAnswers";
import SiteInFourteen from "./SiteInFourteen";
import "./ServiceDiagram.css";

/**
 * ServiceDiagram — slug-keyed diagrams for the four service pages. Every
 * fact drawn here is already in the service's own copy in src/data/site.ts
 * (outcome promises, includes[], commonIssues nouns). Map lives here so the
 * data layer stays untouched.
 */

const DIAGRAMS: Record<string, () => React.ReactElement> = {
  // The 14-day build, drawn as an instrument: a site assembles in a browser
  // frame as the day counter climbs to 14, then ships LIVE.
  "custom-local-websites": () => <SiteInFourteen />,

  // The before/after intake story, drawn as an instrument (leads slip away →
  // one intake layer catches every one) rather than a static node diagram.
  "business-systems": () => <LeadsCaught />,

  // "It breaks → a human answers on a real timeline", drawn as an instrument.
  "it-support": () => <WhoAnswers />,

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
