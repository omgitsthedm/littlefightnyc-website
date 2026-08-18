import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import ConnectedPathDiagram from "@/components/dataviz/ConnectedPathDiagram";
import { createConnectedPath } from "@/components/dataviz/connectedPath";
import {
  MeasurementPath,
  RecoveryReadiness,
} from "@/components/dataviz/OwnerCalculators";
import { HELLO_EMAIL } from "@/data/contact";
import "@/styles/editorial/revenue-pages.css";

const CARE_WORK = [
  {
    label: "Customer path",
    title: "Keep the actions working.",
    detail: "Forms, booking, calls, directions, orders, and payment steps get checked from the customer’s side—not just from the business side.",
  },
  {
    label: "Public facts",
    title: "Keep the business accurate.",
    detail: "Hours, services, staff, offers, policies, and Google-facing facts change. Care keeps the website from confidently telling old stories.",
  },
  {
    label: "Keep it working",
    title: "Check the parts nobody sees.",
    detail: "The website, backups, basic safety, and website-address connection stay checked so a customer is less likely to find a break first.",
  },
  {
    label: "Ownership",
    title: "Keep the keys with the owner.",
    detail: "Every important change is written down. The website address, code, content, accounts, and business data stay yours whether care continues or stops.",
  },
] as const;

const CARE_PATH = createConnectedPath({
  label: "An ongoing-care path",
  summary:
    "Ongoing care checks the public facts, customer actions, and behind-the-scenes connections. Every change is written down and stays with the business owner.",
  caption: "Care keeps the path current; it does not lock the business in.",
  nodes: [
    { id: "one", label: "A real business change", sub: "Hours · staff · service · policy", col: 0 },
    { id: "two", label: "The public path is checked", sub: "Website · form · booking · call", col: 1 },
    { id: "three", label: "The change is clear", sub: "Current facts · working next step", tone: "hub", col: 2 },
    { id: "four", label: "The owner keeps the record", sub: "Notes · access · recovery", tone: "signal", col: 3 },
  ],
});

export default function OngoingCare() {
  return (
    <>
      <PageHero
        eyebrow="Ongoing care"
        icon={RefreshCw}
        title={<>Keep the front door honest after launch.</>}
        dek="Care keeps your hours, forms, booking paths, and the quiet parts current. Ask once or keep us on call. You own the website address, code, and content either way."
        image={{
          src: "/images/brand-scenes/shop-back-office.webp",
          alt: "A neighborhood shop back office with the everyday tools that keep the business running",
          width: 1672,
          height: 941,
        }}
      />

      <section className="lf-revenue-page" aria-labelledby="lf-care-title">
        <header className="lf-revenue-page__intro">
          <p>Care without lock-in</p>
          <h2 id="lf-care-title">Your hours, forms, and booking stay right after launch.</h2>
          <div>
            <p>
              You get a website that keeps telling the truth: current hours,
              a form that lands, the right service, a booking link that reaches
              the right person. Every change is written down and stays yours.
            </p>
            <p>
              Care fits the business you actually run. No mystery report. No
              ownership trap. If you need help once, ask once. Without it, a
              site can stay online while the useful parts quietly go stale, and
              lose trust without ever looking broken.
            </p>
          </div>
        </header>

        <ol className="lf-revenue-page__rows">
          {CARE_WORK.map((item, index) => (
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

        <aside className="lf-revenue-page__visual" aria-label="The ongoing care path, drawn">
          <p>How care stays accountable</p>
          <ConnectedPathDiagram path={CARE_PATH} proof="ongoing-care" />
        </aside>

        <RecoveryReadiness />
        <MeasurementPath />

        <aside className="lf-revenue-page__handoff">
          <div>
            <p>Already a client?</p>
            <h2>Do not hunt through old email threads.</h2>
            <p>
              Email <a href={`mailto:${HELLO_EMAIL}`}>{HELLO_EMAIL}</a> or use
              the current-client desk. Include the business name, the page or
              tool involved, and what you expected to happen. Call or text
              when customers are blocked right now.
            </p>
          </div>
          <Link to="/clients/">Open the client desk</Link>
        </aside>
      </section>

      <QuietContact
        heading="Want the site looked after?"
        lede="No long contract. The first look is free. Tell us what changes often, what cannot break, and who needs to know when it does. We suggest the smallest useful care plan."
        intent="website"
      />
    </>
  );
}
