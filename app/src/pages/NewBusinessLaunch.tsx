import { Store } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import LabVisual from "@/components/editorial/LabVisual";
import QuietContact from "@/components/editorial/QuietContact";
import ConnectedPathDiagram from "@/components/dataviz/ConnectedPathDiagram";
import { createConnectedPath } from "@/components/dataviz/connectedPath";
import { BreakEvenCustomerCount } from "@/components/dataviz/OwnerCalculators";
import "@/styles/editorial/revenue-pages.css";

const LAUNCH_LAYERS = [
  {
    label: "Your keys",
    title: "Own the name and the logins.",
    detail: "Your website address, business email, account access, backup ways in, and a plain record of who controls what.",
  },
  {
    label: "Front door",
    title: "Give every customer the right next step.",
    detail: "A custom website built around the storefront: booking for a chair, directions for a shop, ordering for a counter, intake for a practice, or a qualified inquiry for a service firm.",
  },
  {
    label: "Be easy to find",
    title: "Make the facts agree.",
    detail: "Your website, Google listing, map listing, hours, phone, and services should all tell the same true story.",
  },
  {
    label: "Follow-up",
    title: "Give interest somewhere to land.",
    detail: "Forms, booking notices, and customer email reach an inbox somebody checks. Important messages are easy to spot, and nothing answers customers by itself.",
  },
  {
    label: "See what happens",
    title: "Check the path without guessing.",
    detail: "A simple, respectful count can show which actions people take. It cannot promise customers. It can show where the path needs help.",
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
        dek="Your name, website, Google listing, booking or question path, email, and logins—set up together instead of scattered across six accounts."
        visual={
          <LabVisual
            slug="growth-street"
            because="what connecting the parts looks like from the street"
          />
        }
      />

      <section className="lf-revenue-page" aria-labelledby="lf-launch-title">
        <header className="lf-revenue-page__intro">
          <p>Open with the basics ready</p>
          <h2 id="lf-launch-title">You open with the whole online front door working, not just the website.</h2>
          <div>
            <p>
              You get the website, the website address, Google, email, and
              customer messages set up together, with the logins and plain
              notes in your hands on opening day.
            </p>
            <p>
              We trace what a customer sees and does before launch, then use
              the smallest useful tool for each job. That is what stops the
              usual launch problems: the site in one account, the address in
              another, Google under a former employee, messages nobody checks.
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
        lede="Tell us the date, the business, and what the first customer should do. We will map the launch, who owns each step, and the smallest useful plan."
        intent="website"
      />
    </>
  );
}
