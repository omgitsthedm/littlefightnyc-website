import { Store } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import ConnectedPathDiagram from "@/components/dataviz/ConnectedPathDiagram";
import { createConnectedPath } from "@/components/dataviz/connectedPath";
import { BreakEvenCustomerCount } from "@/components/dataviz/OwnerCalculators";
import "@/styles/editorial/revenue-pages.css";

const LAUNCH_LAYERS = [
  {
    label: "Identity",
    title: "Own the name and the keys.",
    detail: "Domain control, business email, account ownership, recovery paths, and a plain record of who controls what.",
  },
  {
    label: "Front door",
    title: "Give every customer the right next step.",
    detail: "A custom website built around the storefront: booking for a chair, directions for a shop, ordering for a counter, intake for a practice, or a qualified inquiry for a service firm.",
  },
  {
    label: "Findability",
    title: "Make the facts agree.",
    detail: "The website, Google Business Profile, search tools, map listings, and public facts should all describe the same real business.",
  },
  {
    label: "Follow-up",
    title: "Give interest somewhere to land.",
    detail: "Forms, booking notices, and real customer email reach an inbox somebody checks. Conservative routing can label priority messages without auto-replying or hiding them.",
  },
  {
    label: "Measurement",
    title: "Measure the path without lying to the visitor.",
    detail: "Simple, privacy-respecting measurement can show which actions happen. It cannot turn a visitor into a customer. It can show where the path needs work.",
  },
] as const;

const LAUNCH_PATH = createConnectedPath({
  label: "A new-business launch path",
  summary:
    "A launch starts with business ownership and recovery details, then accurate public facts, then one customer action, then an inbox or booking path a person owns.",
  caption: "A launch path, not a promise about customer volume.",
  nodes: [
    { id: "one", label: "The business owns the keys", sub: "Domain · email · recovery", col: 0 },
    { id: "two", label: "The facts agree", sub: "Website · Maps · hours", col: 1 },
    { id: "three", label: "A customer can act", sub: "Call · book · visit · ask", tone: "hub", col: 2 },
    { id: "four", label: "A real person follows up", sub: "Inbox · booking · next action", tone: "signal", col: 3 },
  ],
});

export default function NewBusinessLaunch() {
  return (
    <>
      <PageHero
        eyebrow="New business launch"
        icon={Store}
        title={<>Open with the front door already working.</>}
        dek="Name, website, Google presence, booking or inquiry path, email, and ownership—set up as one clear launch instead of six disconnected accounts."
        image={{
          src: "/images/brand-scenes/storefronts-dawn.webp",
          alt: "Neighborhood storefronts opening at dawn",
          width: 1672,
          height: 941,
        }}
      />

      <section className="lf-revenue-page" aria-labelledby="lf-launch-title">
        <header className="lf-revenue-page__intro">
          <p>Launch as one system</p>
          <h2 id="lf-launch-title">A new storefront should not inherit old digital confusion.</h2>
          <div>
            <p>
              Most launch problems are handoff problems. The website lives in
              one account. The domain lives in another. Google belongs to a
              former employee. Customer messages go somewhere nobody checks.
            </p>
            <p>
              We map the whole customer path before launch. Then we use the
              smallest useful tool for each job and leave the business with the
              keys and plain-English notes.
            </p>
          </div>
        </header>

        <ol className="lf-revenue-page__rows lf-revenue-page__rows--five">
          {LAUNCH_LAYERS.map((item, index) => (
            <li key={item.label}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <p>{item.label}</p>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <aside className="lf-revenue-page__visual" aria-label="The launch path, drawn">
          <p>How the parts connect</p>
          <ConnectedPathDiagram path={LAUNCH_PATH} proof="new-business-launch" />
        </aside>

        <BreakEvenCustomerCount />
      </section>

      <QuietContact
        heading="Opening, relaunching, or finally making it official?"
        lede="Tell us the date, the business, and what the first customer should do. We will map the launch, who owns each step, and the smallest useful scope."
        intent="website"
      />
    </>
  );
}
