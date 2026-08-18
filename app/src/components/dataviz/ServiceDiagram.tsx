import LeadsCaught from "./LeadsCaught";
import WhoAnswers from "./WhoAnswers";
import SiteInFourteen from "./SiteInFourteen";
import OpenWhileClosed from "./OpenWhileClosed";
import TheFreeRead from "./TheFreeRead";
import "./ServiceDiagram.css";

/**
 * ServiceDiagram — slug-keyed diagrams for the four services. Every fact drawn
 * here is already in the service's own copy in src/data/site.ts (outcome
 * promises, includes[], commonIssues nouns). Map lives here so the data layer
 * stays untouched.
 *
 * Two surfaces, two jobs. On a service page a reader is weighing commercial
 * terms, so websites draws the written launch promise. On the homepage the same
 * reader is a shop owner deciding whether to call at all — a delivery date is
 * not what they are shopping for — so websites draws what they actually buy:
 * the site taking bookings after the door is locked. Same service, same truth,
 * the part that is load-bearing for who is reading.
 */

type Surface = "service" | "home";

const DIAGRAMS: Record<string, (surface: Surface) => React.ReactElement> = {
  // Service page: the 14-day build, drawn as a site assembling in a browser
  // frame as the day counter climbs. Homepage: the shop shuts, the site does
  // not, and bookings keep landing.
  "custom-local-websites": (surface) =>
    surface === "home" ? <OpenWhileClosed /> : <SiteInFourteen />,

  // The intake story, drawn as an instrument: opens on one intake layer catching
  // every lead; the layer drops out and leads slip away (the contrast); it
  // returns. Solved state first — the reader is already living the problem.
  "business-systems": () => <LeadsCaught />,

  // "It breaks → a human answers on a real timeline", drawn as an instrument.
  "it-support": () => <WhoAnswers />,

  // The free read → self-ranking punch list, drawn as an instrument. Its
  // mechanic is PRIORITISATION: the list sorts itself.
  "tech-consulting": () => <TheFreeRead />,
};

export default function ServiceDiagram({
  slug,
  surface = "service",
}: {
  slug: string;
  surface?: Surface;
}) {
  const Diagram = DIAGRAMS[slug];
  return Diagram ? Diagram(surface) : null;
}
