import { Link, Navigate, useParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";
import { areaPages, services } from "@/data/site";
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

function detailServiceSlug(serviceSlug = "") {
  return DETAIL_SERVICE_SLUG[serviceSlug] ?? serviceSlug;
}

function areaRouteSlug(serviceSlug: string) {
  return AREA_ROUTE_SLUG[serviceSlug] ?? serviceSlug;
}

function serviceChecks(serviceSlug: string) {
  const checks: Record<string, string[]> = {
    "custom-local-websites": [
      "Can a first-time customer understand the offer on a phone?",
      "Do hours, location, services, and trust details agree everywhere?",
      "Can someone call, book, order, or inquire without hunting?",
      "Does the next message reach a person who can answer it?",
    ],
    "tech-consulting": [
      "Which tool, bill, or handoff is actually hurting the day?",
      "What still works and should stay put?",
      "Where does a customer or staff detail get copied by hand?",
      "What is the smallest useful move before buying another tool?",
    ],
    "it-support": [
      "What is broken: one device, the connection, the provider, or an account?",
      "Can the business keep serving while that part is down?",
      "Who owns the login, renewal, and recovery information?",
      "What simple backup prevents the same bad day next time?",
    ],
    "business-systems": [
      "Where does a new customer request begin and where does it disappear?",
      "Which repeated handoff depends on memory or retyping?",
      "Which current tool already earns its place?",
      "Would one small connection remove more work than a new subscription adds?",
    ],
  };
  return checks[serviceSlug] ?? checks["tech-consulting"];
}

export default function ServiceAreaDetail() {
  const { areaSlug, serviceSlug } = useParams();
  const area = areaPages.find((item) => item.slug === areaSlug);
  const service = services.find((item) => item.slug === detailServiceSlug(serviceSlug));

  if (!area || !service) return <Navigate to="/services/" replace />;

  const related = services.filter((item) => item.slug !== service.slug);
  const checks = serviceChecks(service.slug);

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
          video: service.video,
          fit: service.video ? "contain" : "cover",
          alt: `${service.eyebrow} help in ${area.name}`,
          width: 1200,
          height: 900,
        }}
      />

      <section className="lf-content-section lf-content-section--tight">
        <div className="lf-content-grid">
          <article className="lf-content-tile lf-content-tile--third lf-service-area__beat">
            <p className="lf-content-tile__label">Start with the real setup</p>
            <EditorialBody>
              <p>
                This page names {area.name}, not a pretend profile of your business. Tell us what
                happens on a normal day and where the customer path gets sticky.
              </p>
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
              <p>
                Start with one real customer path: search or referral, first question, next step,
                then the person who has to answer.
              </p>
            </EditorialBody>
          </article>

          <section
            className="lf-content-tile lf-content-tile--full lf-service-area__reality"
            aria-labelledby="lf-service-area-reality-title"
          >
            <header>
              <p className="lf-content-tile__label">What this page can honestly say</p>
              <h2 id="lf-service-area-reality-title">
                {service.eyebrow} should fit your business, not a generic neighborhood page.
              </h2>
            </header>
            <p>
              We serve {area.name}, but we do not pretend a ZIP code tells us your margins,
              staffing, customers, or current setup. The useful local work starts with the facts
              you can show us: the site, listing, tools, handoffs, and the problem in front of you.
            </p>
          </section>

          <section
            className="lf-content-tile lf-content-tile--full lf-service-area__checks"
            aria-labelledby="lf-service-area-checks-title"
          >
            <header>
              <p className="lf-content-tile__label">Checks for {service.eyebrow}</p>
              <h2 id="lf-service-area-checks-title">Where we would look first.</h2>
            </header>
            <ol data-count={checks.length}>
              {checks.map((item) => (
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
