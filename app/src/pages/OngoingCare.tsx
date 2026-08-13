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
    detail: "Forms, booking, calls, directions, orders, and payment handoffs get checked from the customer’s side—not just from an admin screen.",
  },
  {
    label: "Public facts",
    title: "Keep the business accurate.",
    detail: "Hours, services, staff, offers, policies, and Google-facing facts change. Care keeps the website from confidently telling old stories.",
  },
  {
    label: "Reliability",
    title: "Keep the quiet machinery quiet.",
    detail: "Hosting, backups, security basics, and domain connections stay checked so a customer is less likely to find a break first.",
  },
  {
    label: "Ownership",
    title: "Keep the keys with the owner.",
    detail: "Every material change is documented. The domain, code, content, accounts, and business data remain yours whether care continues or stops.",
  },
] as const;

const CARE_PATH = createConnectedPath({
  label: "An ongoing-care path",
  summary:
    "Ongoing care checks the public facts, customer actions, and quiet technical connections. A change is documented and stays with the business owner.",
  caption: "Care keeps the path current; it does not lock the business in.",
  nodes: [
    { id: "one", label: "A real business change", sub: "Hours · staff · service · policy", col: 0 },
    { id: "two", label: "The public path is checked", sub: "Website · form · booking · call", col: 1 },
    { id: "three", label: "The change is clear", sub: "Current facts · working handoff", tone: "hub", col: 2 },
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
        dek="A website is part of the business day. Care keeps its facts, forms, booking paths, and behind-the-scenes parts current. The business still owns them."
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
          <h2 id="lf-care-title">Launch is a date. Trust is maintenance.</h2>
          <div>
            <p>
              A site can stay online while the useful parts quietly go stale.
              Wrong hours, a dead form, an old service, or a booking link sent
              to the wrong person can cost trust without looking like an outage.
            </p>
            <p>
              Care is scoped around the business you actually run. No mystery
              activity report. No ownership trap. If you need help once, ask once.
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
              system involved, and what you expected to happen. Call or text
              when customers are blocked right now.
            </p>
          </div>
          <Link to="/clients/">Open the client desk</Link>
        </aside>
      </section>

      <QuietContact
        heading="Want the site looked after?"
        lede="Tell us what changes often, what cannot break, and who needs to know when it does. We will scope the smallest useful care plan."
        intent="website"
      />
    </>
  );
}
