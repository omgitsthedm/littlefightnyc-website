import LeadsCaught from "./LeadsCaught";
import WhoAnswers from "./WhoAnswers";
import SiteInFourteen from "./SiteInFourteen";
import TheFreeRead from "./TheFreeRead";
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

  // The free read → self-ranking punch list, drawn as an instrument. Its
  // mechanic is PRIORITISATION (the list sorts itself), distinct from AuditBench.
  "tech-consulting": () => <TheFreeRead />,
};

export default function ServiceDiagram({ slug }: { slug: string }) {
  const Diagram = DIAGRAMS[slug];
  return Diagram ? <Diagram /> : null;
}
