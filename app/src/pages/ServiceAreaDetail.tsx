import { Link, Navigate, useParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";
import { areaPages, services, type AreaPage } from "@/data/site";
import { acquisitionIntentForServiceSlug } from "@/lib/acquisitionIntent";
import "@/styles/editorial/longform-routes.css";

const DETAIL_SERVICE_SLUG: Record<string, string> = {
  websites: "custom-local-websites",
  "local-search": "tech-consulting",
};

const AREA_ROUTE_SLUG: Record<string, string> = {
  "custom-local-websites": "websites",
  "tech-consulting": "local-search",
};

const SERVICE_FRICTION_TERMS: Record<string, RegExp[]> = {
  "custom-local-websites": [
    /website|site|page|image|menu|mobile|phone/i,
    /google|profile|listing|hours|photo|review/i,
    /book|reserv|ticket|order|contact|inquir|appointment/i,
  ],
  "tech-consulting": [
    /subscription|software|tool|app|cost|bill/i,
    /website|google|profile|listing/i,
    /staff|spreadsheet|lead|follow-up|inquir|booking|payment/i,
  ],
  "it-support": [
    /break|fail|slow|wifi|pos|device|login|email|phone|printer|hardware/i,
    /payment|booking|order|stall|support/i,
    /website|site|form|link/i,
  ],
  "business-systems": [
    /staff|spreadsheet|lead|inquir|follow-up|detail|head/i,
    /booking|payment|order|deposit|waitlist|ticket|reservation/i,
    /subscription|software|tool|app|workflow|dm/i,
  ],
};

function detailServiceSlug(serviceSlug = "") {
  return DETAIL_SERVICE_SLUG[serviceSlug] ?? serviceSlug;
}

function areaRouteSlug(serviceSlug: string) {
  return AREA_ROUTE_SLUG[serviceSlug] ?? serviceSlug;
}

function areaEvidence(area: AreaPage, serviceSlug: string) {
  return serviceSlug === "custom-local-websites" || serviceSlug === "tech-consulting"
    ? area.localSearchReality
    : area.businessLandscape;
}

function relevantLocalFriction(area: AreaPage, serviceSlug: string) {
  const terms = SERVICE_FRICTION_TERMS[serviceSlug] ?? [];
  return area.whatWeFixHere
    .map((item, index) => ({
      item,
      index,
      score: terms.reduce((total, term) => total + Number(term.test(item)), 0),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4)
    .map(({ item }) => item);
}

export default function ServiceAreaDetail() {
  const { areaSlug, serviceSlug } = useParams();
  const area = areaPages.find((item) => item.slug === areaSlug);
  const service = services.find((item) => item.slug === detailServiceSlug(serviceSlug));

  if (!area || !service) return <Navigate to="/services/" replace />;

  const related = services.filter((item) => item.slug !== service.slug);
  const localFriction = relevantLocalFriction(area, service.slug);
  const localEvidence = areaEvidence(area, service.slug);

  return (
    <div className="lf-longform-route lf-longform-route--service-area">
      <PageHero
        eyebrow={`${area.name} · ${service.eyebrow}`}
        icon={MapPin}
        title={
          <>
            {service.eyebrow} for{" "}
            <br />
            <span className="lf-em">{area.name}.</span>
          </>
        }
        dek={`${service.eyebrow} for ${area.name} businesses. We keep what works and fix what gets in the way.`}
        image={{
          src: service.image,
          alt: `${service.eyebrow} help in ${area.name}`,
          width: 1200,
          height: 900,
        }}
      />

      <section className="lf-content-section lf-content-section--tight">
        <div className="lf-content-grid">
          <article className="lf-content-tile lf-content-tile--third lf-service-area__beat">
            <p className="lf-content-tile__label">What is happening here</p>
            <EditorialBody>
              <p>{area.localPattern}</p>
            </EditorialBody>
          </article>

          <article className="lf-content-tile lf-content-tile--third lf-content-tile--quiet lf-service-area__beat">
            <p className="lf-content-tile__label">What this service changes</p>
            <EditorialBody>
              <p>{service.outcome}</p>
            </EditorialBody>
          </article>

          <article className="lf-content-tile lf-content-tile--third lf-content-tile--tablet-full lf-content-tile--signal lf-service-area__beat lf-service-area__beat--signal">
            <p className="lf-content-tile__label">First move</p>
            <EditorialBody>
              <p>{area.firstMove}</p>
            </EditorialBody>
          </article>

          <section
            className="lf-content-tile lf-content-tile--full lf-service-area__reality"
            aria-labelledby="lf-service-area-reality-title"
          >
            <header>
              <p className="lf-content-tile__label">The {area.name} reality</p>
              <h2 id="lf-service-area-reality-title">
                {service.eyebrow} has to fit how this neighborhood works.
              </h2>
            </header>
            <p>{localEvidence}</p>
          </section>

          <section
            className="lf-content-tile lf-content-tile--full lf-service-area__checks"
            aria-labelledby="lf-service-area-checks-title"
          >
            <header>
              <p className="lf-content-tile__label">Checks for {service.eyebrow}</p>
              <h2 id="lf-service-area-checks-title">Where we would look first.</h2>
            </header>
            <ol data-count={localFriction.length}>
              {localFriction.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="lf-content-tile lf-content-tile--full lf-service-area__related">
            <h2 className="lf-service-area__related-title">The other services in {area.name}</h2>
            <ul className="lf-content-list lf-content-list--links" data-count={related.length}>
              {related.map((item) => (
                <li key={item.slug}>
                  <Link to={`/areas/${area.slug}/${areaRouteSlug(item.slug)}/`}>
                    <span className="lf-content-link__label">{item.eyebrow}</span>
                    <span className="lf-content-link__title">{item.headline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <QuietContact
        heading={`${service.eyebrow} in ${area.name}. Show us the current setup.`}
        lede={service.plain}
        intent={acquisitionIntentForServiceSlug(service.slug)}
      />
    </div>
  );
}
