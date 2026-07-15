import { Link } from "react-router-dom";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import matrixServices from "@/data/matrix-services.json";
import industriesData from "@/data/industries.json";
import "./CoverageMatrix.css";

/**
 * CoverageMatrix — industries × the four services, as a compact honest grid.
 * Columns come from the authored `matrix.services` in seo-pages.json; rows
 * from industries.json. A covered cell quotes the noun that industry's own
 * page uses for that service (source lines cited below) — no invented
 * coverage. The one open cell (galleries × IT support) is real: that page
 * never claims POS/booking/email work.
 */

type MatrixService = { slug: string; label: string };
type IndustryRow = { slug: string; title: string };

const SERVICES = matrixServices as MatrixService[];
const INDUSTRIES = industriesData as unknown as IndustryRow[];

/* Each noun below quotes the industry's authored description/body copy in
 * industries.json. null = that page makes no claim for the service. */
const COVERAGE: Record<string, Record<string, string | null>> = {
  // "Portfolio, inquiry, proposal, local visibility, and lightweight workflow systems"
  "galleries-creative-studios": {
    websites: "Portfolio & inquiry",
    "it-support": null,
    "local-search": "Local visibility",
    "business-systems": "Lightweight workflow",
  },
  // "Website, consult scheduling, intake, email on your own domain, referral
  //  tracking, and document flow for solo and small law firms"
  "law-firms": {
    websites: "Site & consult form",
    "it-support": "Firm email & documents",
    "local-search": "Search presence",
    "business-systems": "Intake & referrals",
  },
  // "Trust, booking, intake, local visibility, and workflow systems"
  "medical-wellness-practices": {
    websites: "Trust pages",
    "it-support": "Booking & intake",
    "local-search": "Local visibility",
    "business-systems": "Workflow systems",
  },
  // "Service pages, lead qualification, customer list, proposals, reporting,
  //  and local visibility" + the page's own "Open IT support" link
  "professional-services": {
    websites: "Service pages",
    "it-support": "IT support",
    "local-search": "Local visibility",
    "business-systems": "Proposals & reporting",
  },
  // "Website, POS, reservations, reviews, local search, and owner reporting"
  "restaurants-bars": {
    websites: "Website & menu",
    "it-support": "POS & reservations",
    "local-search": "Local search",
    "business-systems": "Owner reporting",
  },
  // "Inventory, Shopify or Square, local pickup, product pages, email capture,
  //  and local search"
  "retail-ecommerce": {
    websites: "Product pages",
    "it-support": "Shopify / Square",
    "local-search": "Local search",
    "business-systems": "Inventory & pickup",
  },
  // "Booking, staff calendars, service pages, reviews, rebooking, and local search"
  "salons-wellness": {
    websites: "Service pages",
    "it-support": "Booking & deposits",
    "local-search": "Local search",
    "business-systems": "Calendars & rebooking",
  },
};

export default function CoverageMatrix() {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });

  return (
    <div ref={ref} className="lf-covmatrix">
      <p className="lf-covmatrix__kicker">Coverage</p>
      <p className="lf-covmatrix__dek">
        Any trade, same read — what each industry page maps to the four services.
      </p>
      <div className="lf-covmatrix__scroll">
        <table className="lf-covmatrix__table">
          <thead>
            <tr>
              <th scope="col">
                <span className="lf-covmatrix__sr">Industry</span>
              </th>
              {SERVICES.map((service) => (
                <th key={service.slug} scope="col">
                  {service.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INDUSTRIES.map((industry, i) => {
              const row = COVERAGE[industry.slug];
              return (
                <tr key={industry.slug} style={{ ["--lf-i" as string]: i }}>
                  <th scope="row">
                    <Link to={`/industries/${industry.slug}/`}>
                      {industry.title.replace(" Help", "")}
                    </Link>
                  </th>
                  {SERVICES.map((service) => {
                    const noun = row?.[service.slug] ?? null;
                    return (
                      <td key={service.slug} data-covered={noun ? "true" : undefined}>
                        {noun ? (
                          <>
                            <span className="lf-covmatrix__mark" aria-hidden="true" />
                            <span className="lf-covmatrix__noun">{noun}</span>
                          </>
                        ) : (
                          <span aria-hidden="true">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
