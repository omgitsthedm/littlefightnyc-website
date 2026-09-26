import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import FaqList from "@/components/editorial/FaqList";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import ConnectedPathDiagram from "@/components/dataviz/ConnectedPathDiagram";
import { createConnectedPath } from "@/components/dataviz/connectedPath";
import {
  MeasurementPath,
  RecoveryReadiness,
} from "@/components/dataviz/OwnerCalculators";
import { HELLO_EMAIL } from "@/data/contact";
import ONGOING_CARE_FAQ from "@/data/ongoing-care-faq.json";
import "@/styles/editorial/revenue-pages.css";

const SUPPORT_WORK = [
  {
    label: "Customer path",
    title: "Keep the actions working.",
    detail: "Forms, booking, calls, directions, orders, and payment steps get checked from the customer’s side—not just from the business side.",
  },
  {
    label: "Public facts",
    title: "Keep the business accurate.",
    detail: "Hours, services, staff, offers, policies, and Google-facing facts change. Ongoing website support keeps the site from confidently telling old stories.",
  },
  {
    label: "Website foundations",
    title: "Check the parts nobody sees.",
    detail: "The website, backups, basic safety, and website-address connection stay checked so a customer is less likely to find a break first.",
  },
  {
    label: "Ownership",
    title: "Keep the keys with the owner.",
    detail: "Every important change is written down. The website address, code, content, accounts, and business data stay yours whether ongoing support continues or stops.",
  },
] as const;

const SUPPORT_PATH = createConnectedPath({
  label: "An ongoing website support path",
  summary:
    "Ongoing website support checks the agreed customer path, public facts, and behind-the-scenes connections. Every finding is dated, and the owner keeps the record.",
  caption: "The work follows the agreement in place; bigger changes return to the owner for a decision.",
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
        eyebrow="In Your Corner"
        icon={RefreshCw}
        title={<>Ongoing website support that keeps your customer path ready.</>}
        dek="For existing Little Fight clients, support follows the agreement in place. We keep the agreed customer path current while you keep the website address, code, and content."
        image={{
          src: "/images/brand-scenes/shop-back-office.webp",
          alt: "A neighborhood shop back office with the everyday tools that keep the business running",
          width: 1672,
          height: 941,
        }}
      />

      <section className="lf-revenue-page" aria-labelledby="lf-support-title">
        <header className="lf-revenue-page__intro">
          <p>In Your Corner</p>
          <h2 id="lf-support-title">Keep the public path clear after launch.</h2>
          <div>
            <p>
              Ongoing website support starts with the customer path that matters
              to your business: a call, booking, order, question, or visit. We
              agree what to check, date what we find, and keep a clear record
              of the work.
            </p>
            <p>
              For eligible existing clients, the support follows the agreement
              already in place. We make routine corrections that are already
              agreed. A larger change always comes back to you with the next
              decision before work begins.
            </p>
          </div>
        </header>

        <aside className="lf-revenue-page__handoff">
          <div>
            <p>Included for the sites we look after</p>
            <h2>A monthly check, and the small fixes it finds.</h2>
            <p>
              Every site we look after gets a monthly check: the agreed
              customer path, page speed, search health, broken links, and
              whether forms and booking still deliver. We make the routine
              corrections it turns up and tell you what changed. It is not a
              report you have to act on, and it costs nothing extra.
            </p>
          </div>
          <Link to="/clients/">Open the client desk</Link>
        </aside>

        <aside className="lf-revenue-page__handoff">
          <div>
            <p>A closer weekly check</p>
            <h2>A weekly check, with a record</h2>
            <p>
              When we agree a weekly check in writing, we review the agreed
              customer path, share dated findings, and make the routine
              corrections already approved. Bigger changes stay with you for a
              decision and a written next step.
            </p>
          </div>
          <Link to="/clients/">Ask about a weekly check</Link>
        </aside>

        <ol className="lf-revenue-page__rows">
          {SUPPORT_WORK.map((item, index) => (
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

        <aside className="lf-revenue-page__visual" aria-label="The ongoing website support path, drawn">
          <p>How ongoing website support stays accountable</p>
          <ConnectedPathDiagram path={SUPPORT_PATH} proof="ongoing-care" />
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

        <FaqList title="Ongoing support questions" items={ONGOING_CARE_FAQ} />
      </section>

      <QuietContact
        heading="Want a personal first look before you decide?"
        lede="Start with a free first look. We review the actual customer path, tell you what matters, and put any paid work in writing before it starts."
        intent="website"
      />
    </>
  );
}
