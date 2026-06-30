import { Link } from "react-router-dom";
import { useScrollReveal } from "./useScrollReveal";
import "./ServicesPreview.css";

const ROMAN = ["I.", "II.", "III.", "IV."] as const;

// Pricing rule: never publish prices anywhere. Each service shows the
// brand-level time promise instead — see project_lfnyc_pricing_doctrine memory.
const SERVICES = [
  {
    slug: "tech-consulting",
    label: "Tech Consulting",
    verb: "Inform",
    italic: "An honest read on your tech.",
    description:
      "A plain-English audit of tools, costs, website, Google presence, and workflow — so you know what's earning its place and what's leaking money.",
    starts: "Always free",
    promise: "We'll tell you if you don't need us.",
  },
  {
    slug: "it-support",
    label: "IT Support",
    verb: "Repair",
    italic: "Fast help when the basics break.",
    description:
      "Email, domains, Wi-Fi, POS, booking, payments, accounts, and devices — fixed by someone local who knows your setup.",
    starts: "On-site within 24 hours",
    promise: "Call-backs usually within 2 hours.",
  },
  {
    slug: "custom-local-websites",
    label: "Custom Local Websites",
    verb: "Build",
    italic: "Built — not picked from a template menu.",
    description:
      "Custom-coded sites for your business, your block, and how Google reads local businesses in 2026. No templates, no themes, no Squarespace skins.",
    starts: "Usually 14 days",
    promise: "14 days or you don't pay.",
  },
  {
    slug: "business-systems",
    label: "Business Systems",
    verb: "Support",
    italic: "Less spreadsheet. Less memory. Less waste.",
    description:
      "Lead intake, follow-up, dashboards, tool cleanup, and — when no SaaS fits — custom internal apps built around the actual work.",
    starts: "Scoped to the business",
    promise: "Keep, connect, replace, or build — in that order.",
  },
] as const;

export default function ServicesPreview() {
  const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const gridRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="lf-svc" aria-labelledby="lf-svc-heading">
      <div ref={headRef} className="lf-container lf-svc__head">
        <p className="lf-mono lf-svc__eyebrow">What we actually do</p>
        <h2 id="lf-svc-heading" className="lf-display lf-svc__title">
          Four services.<br />
          <span className="lf-italic">One agency.</span>
        </h2>
        <p className="lf-svc__lede">
          Most owners need one or two. These are the four services we offer
          under one agency, sized to the actual problem — not the menu.
        </p>
      </div>

      <div ref={gridRef} className="lf-container lf-svc__grid">
        {SERVICES.map((service, i) => (
          <article key={service.slug} className="lf-svc__card">
            <Link to={`/services/${service.slug}/`} className="lf-svc__card-link">
              <span className="lf-display lf-svc__numeral" aria-hidden="true">
                {ROMAN[i]}
              </span>
              <div className="lf-svc__card-body">
                <p className="lf-mono lf-svc__card-label">
                  <span className="lf-svc__card-verb">{service.verb}</span>
                  <span aria-hidden="true"> · </span>
                  {service.label}
                </p>
                <p className="lf-italic lf-svc__card-italic">{service.italic}</p>
                <p className="lf-svc__card-desc">{service.description}</p>
                <div className="lf-svc__card-foot">
                  <p className="lf-mono lf-svc__card-price">{service.starts}</p>
                  <p className="lf-italic lf-svc__card-promise">{service.promise}</p>
                </div>
              </div>
              <span className="lf-mono lf-svc__card-cta">
                Read more <span aria-hidden="true">→</span>
              </span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
