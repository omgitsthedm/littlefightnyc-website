import FlowDiagram from "./FlowDiagram";
import ScoreRing from "./ScoreRing";
import TimelineStrip from "./TimelineStrip";

/**
 * CaseDiagram — slug-keyed diagrams for case-study pages. Every fact drawn
 * here already exists in the study's own copy/metrics in src/data/site.ts;
 * the map lives here (not in site.ts) so the data layer stays untouched.
 */

const DIAGRAMS: Record<string, () => React.ReactElement> = {
  "hair-by-rachel-charles": () => (
    <ScoreRing
      label="Lighthouse scores at launch"
      summary="Lighthouse scores measured at launch: Performance 100, Accessibility 100, Best Practices 100, SEO 100."
      caption="Lighthouse, measured at launch"
      items={[
        { label: "Performance", value: 100 },
        { label: "Accessibility", value: 100 },
        { label: "Best Practices", value: 100 },
        { label: "SEO", value: 100 },
      ]}
    />
  ),

  clearhelp: () => (
    <FlowDiagram
      label="ClearHelp system diagram"
      summary="Three sites — public site, intake, and admin, each with its own CI deploying on push — all feed one shared Supabase backend. Intake data flows in real time without copying."
      caption="Three sites · one shared backend · intake flows live"
      nodes={[
        { id: "public", label: "Public site", sub: "CI · deploys on push", col: 0 },
        { id: "intake", label: "Intake", sub: "CI · deploys on push", tone: "signal", col: 0 },
        { id: "admin", label: "Admin", sub: "CI · deploys on push", col: 0 },
        { id: "supabase", label: "Supabase", sub: "one shared backend", tone: "hub", col: 1 },
      ]}
      edges={[
        { from: "public", to: "supabase", tone: "muted" },
        { from: "intake", to: "supabase", tone: "signal", pulse: true },
        { from: "admin", to: "supabase", tone: "muted" },
      ]}
    />
  ),

  "public-house-creative": () => (
    <>
      <FlowDiagram
        label="Cockpit system diagram"
        summary="Estimates that lived across documents, spreadsheets, and tribal knowledge now run through one system: Cockpit."
        caption="Three tools' worth of estimating → one source of truth"
        nodes={[
          { id: "docs", label: "Documents", tone: "muted", col: 0 },
          { id: "sheets", label: "Spreadsheets", tone: "muted", col: 0 },
          { id: "tribal", label: "Tribal knowledge", tone: "muted", col: 0 },
          { id: "cockpit", label: "Cockpit", sub: "one source of truth", tone: "hub", col: 1 },
        ]}
        edges={[
          { from: "docs", to: "cockpit", tone: "signal" },
          { from: "sheets", to: "cockpit", tone: "signal" },
          { from: "tribal", to: "cockpit", tone: "signal" },
        ]}
      />
      <TimelineStrip
        label="What a Cockpit run looks like"
        summary="Inside Cockpit, every estimate follows the same path: documents come in, rooms get classified, drivers get reconciled, and the report exports."
        caption="Every estimate, same path"
        beats={[
          { label: "Documents in" },
          { label: "Rooms classified" },
          { label: "Drivers reconciled" },
          { label: "Report out", marker: true },
        ]}
      />
    </>
  ),

  "after-hours-agenda": () => (
    <FlowDiagram
      label="After Hours Agenda storefront rail"
      summary="The storefront runs as a rail: a JSON catalog feeds the custom Next.js storefront, Square handles payments, and Printful handles fulfillment. A new product drop ships in one day."
      caption="No platform lock-in, anywhere on the rail"
      nodes={[
        { id: "catalog", label: "JSON catalog", sub: "one master file", col: 0 },
        { id: "storefront", label: "Next.js storefront", tone: "signal", col: 1 },
        { id: "square", label: "Square", sub: "payments", col: 2 },
        { id: "printful", label: "Printful", sub: "fulfillment", col: 3 },
      ]}
      edges={[
        { from: "catalog", to: "storefront", tone: "signal", chip: "new drop: 1 day" },
        { from: "storefront", to: "square", tone: "signal" },
        { from: "square", to: "printful", tone: "signal" },
      ]}
    />
  ),
};

export default function CaseDiagram({ slug }: { slug: string }) {
  const Diagram = DIAGRAMS[slug];
  return Diagram ? <Diagram /> : null;
}
