import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { SUPPORT_EMAIL } from "@/data/contact";
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
    detail: "Hosting, dependencies, backups, security headers, and domain connections stay maintained so a customer is not the first person to report a break.",
  },
  {
    label: "Ownership",
    title: "Keep the keys with the owner.",
    detail: "Every material change is documented. The domain, code, content, accounts, and business data remain yours whether care continues or stops.",
  },
] as const;

export default function OngoingCare() {
  return (
    <>
      <PageHero
        eyebrow="Ongoing care"
        icon={RefreshCw}
        title={<>Keep the front door honest after launch.</>}
        dek="A website is part of the business day. Care keeps its facts, forms, booking paths, and quiet machinery current without taking ownership away from you."
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
              The wrong hours, a dead form, an old service, or a booking link
              pointed at the wrong person can cost trust without causing an outage.
            </p>
            <p>
              Ongoing care is scoped around the business you actually run. No
              mystery activity report and no ownership trap. If you only need
              help once, ask once.
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

        <aside className="lf-revenue-page__handoff">
          <div>
            <p>Already a client?</p>
            <h2>Do not hunt for the old project thread.</h2>
            <p>
              Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or
              use the current-client desk. The Workspace priority flow routes
              real customer requests for a human reply; it does not auto-reply
              or bury the message.
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
