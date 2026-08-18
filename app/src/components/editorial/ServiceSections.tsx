import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import ServiceDiagram from "@/components/dataviz/ServiceDiagram";
import { PHONE_DISPLAY, PHONE_HREF } from "@/data/contact";
import "./ServiceSections.css";

/**
 * The four services, as four sections — not four buttons.
 *
 * They were a tab strip: four cells, one open panel, three services hidden
 * behind a click nobody makes. That is a control, and a control is not an
 * argument. These are the reason the page exists, so each one gets a full
 * section, its own drawing, and its own proof, and a visitor gets all four by
 * scrolling rather than by discovering a tab.
 *
 * Two rules the copy obeys, both from the owner:
 *
 * 1. Lead with the solved state, never the problem. The reader is already
 *    living the problem.
 * 2. No delivery-time or trade language. The written 14-day launch promise is
 *    real and it stays on the service page where a buyer is reading terms.
 *
 * Every figure traces to the service's own copy in src/data/site.ts — the
 * 24-hour on-site window, the one owned place, the free first read. Nothing is
 * invented for the sake of a big number.
 *
 * The proof line under each headline names a DIFFERENT client, so the page
 * argues by range rather than by repeating one salon six times.
 */

type Service = {
  key: string;
  /** The service slug — also selects the drawn instrument. */
  slug: string;
  num: string;
  eyebrow: string;
  chip: string;
  tone: "live" | "urgent" | "own" | "free";
  kicker: string;
  figure: string;
  unit?: string;
  sub: string;
  headline: string;
  proof: string;
  action: { label: string; to: string } | { label: string; href: string; event: string };
  more: { label: string; to: string };
};

const SERVICES: readonly Service[] = [
  {
    key: "websites",
    slug: "custom-local-websites",
    num: "01",
    eyebrow: "Websites",
    chip: "Open now",
    tone: "live",
    kicker: "Your front door is",
    figure: "24/7",
    unit: "open",
    sub: "Even at 2am. Even on a Sunday.",
    headline: "Customers can find you, and book without calling.",
    proof: "Chromatic Painting & Design — live today",
    action: { label: "How we build websites", to: "/services/custom-local-websites/" },
    more: { label: "See the painter’s site", to: "/case-studies/chromatic-painting-design/" },
  },
  {
    key: "support",
    slug: "it-support",
    num: "02",
    eyebrow: "On-site tech support",
    chip: "Picking up",
    tone: "urgent",
    // Every approved version of this figure in the repo is hedged — "usually",
    // "we can be". An unhedged "back to work in 24 hours" is a repair guarantee
    // nobody wrote, so the hedge and the conditions ride with the number.
    kicker: "Urgent jobs, usually within",
    figure: "24",
    unit: "hours",
    sub: "On site in New York. A person answers 9am–9pm Eastern.",
    // "It works again" is an unconditional guarantee. The house form states the
    // boundary instead, and the boundary is the reassuring part.
    headline: "You call. We come. We fix it, or tell you who can.",
    proof: "No jargon, and no ticket number.",
    action: { label: `Call ${PHONE_DISPLAY}`, href: PHONE_HREF, event: "home_service_phone" },
    more: { label: "How support works", to: "/services/it-support/" },
  },
  {
    key: "software",
    slug: "business-systems",
    num: "03",
    eyebrow: "Software you own",
    chip: "Yours",
    tone: "own",
    kicker: "Everything lives in",
    figure: "1",
    unit: "place",
    sub: "Built around how you already work.",
    headline: "Your clients, your files, your jobs — in one place.",
    proof: "ClearHelp — one shared record, staff and request together",
    action: { label: "Software you own", to: "/services/business-systems/" },
    more: { label: "See how it went for ClearHelp", to: "/case-studies/clearhelp/" },
  },
  {
    key: "consult",
    slug: "tech-consulting",
    num: "04",
    eyebrow: "Free second opinion",
    chip: "No charge",
    tone: "free",
    kicker: "The first read costs",
    figure: "Nothing",
    sub: "Whether you hire us or not.",
    headline: "You leave knowing what to fix first.",
    proof: "One call. A short list. No pitch.",
    action: { label: "What the free read covers", to: "/services/tech-consulting/" },
    more: { label: "See all services", to: "/services/" },
  },
] as const;

export default function ServiceSections() {
  return (
    <div className="lf-svcs">
      <h2 className="lf-svcs__title">
        <span aria-hidden="true">LF / 02 · </span>Four ways to get unstuck
      </h2>

      {SERVICES.map((service) => (
        <section
          key={service.key}
          className={`lf-svc lf-svc--${service.tone}`}
          aria-labelledby={`lf-svc-${service.key}`}
          data-lf-service={service.key}
        >
          <div className="lf-svc__inner">
            <div className="lf-svc__say">
              <p className="lf-svc__eyebrow">
                <span aria-hidden="true">{service.num}</span>
                {service.eyebrow}
                <span className="lf-svc__chip">
                  <span aria-hidden="true" />
                  {service.chip}
                </span>
              </p>

              <p className="lf-svc__kicker">{service.kicker}</p>
              <p className="lf-svc__number">
                <span
                  className={`lf-svc__value${service.unit ? "" : " lf-svc__value--word"}`}
                >
                  {service.figure}
                </span>
                {service.unit ? <span className="lf-svc__unit">{service.unit}</span> : null}
              </p>
              <p className="lf-svc__sub">{service.sub}</p>

              <h3 id={`lf-svc-${service.key}`} className="lf-svc__headline">
                {service.headline}
              </h3>
              <p className="lf-svc__proof">{service.proof}</p>

              <div className="lf-svc__actions">
                {"href" in service.action ? (
                  <a
                    className="lf-svc__action"
                    href={service.action.href}
                    data-lf-label={service.action.event}
                  >
                    <Phone size={18} strokeWidth={2} aria-hidden="true" />
                    {service.action.label}
                  </a>
                ) : (
                  <Link className="lf-svc__action" to={service.action.to}>
                    {service.action.label}
                    <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                  </Link>
                )}
                <Link className="lf-svc__more" to={service.more.to}>
                  {service.more.label}
                  <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lf-svc__object">
              <ServiceDiagram slug={service.slug} surface="home" />
            </div>
          </div>
        </section>
      ))}

      <p className="lf-svcs__order">
        Most owners start with the website, keep us for support, and only build
        software when renting stops making sense. Not sure? The{" "}
        <Link to="/services/tech-consulting/">free second opinion</Link> comes before
        any paid work.
      </p>
    </div>
  );
}
