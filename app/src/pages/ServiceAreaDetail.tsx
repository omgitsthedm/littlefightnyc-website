import { Link, Navigate, useParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";
import { areaPages, services } from "@/data/site";

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

export default function ServiceAreaDetail() {
  const { areaSlug, serviceSlug } = useParams();
  const area = areaPages.find((item) => item.slug === areaSlug);
  const service = services.find((item) => item.slug === detailServiceSlug(serviceSlug));

  if (!area || !service) return <Navigate to="/services/" replace />;

  const related = services.filter((item) => item.slug !== service.slug);

  return (
    <>
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
          <article className="lf-content-tile lf-content-tile--third">
            <p className="lf-content-tile__label">What is happening here</p>
            <EditorialBody>
              <p>{area.localPattern}</p>
            </EditorialBody>
          </article>

          <article className="lf-content-tile lf-content-tile--third lf-content-tile--quiet">
            <p className="lf-content-tile__label">What this service changes</p>
            <EditorialBody>
              <p>{service.outcome}</p>
            </EditorialBody>
          </article>

          <article className="lf-content-tile lf-content-tile--third lf-content-tile--tablet-full lf-content-tile--signal">
            <p className="lf-content-tile__label">First move</p>
            <EditorialBody>
              <p>{area.firstMove}</p>
            </EditorialBody>
          </article>

          <section className="lf-content-tile lf-content-tile--full">
            <p className="lf-content-tile__label">The other services in {area.name}</p>
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

      <QuietContact />
    </>
  );
}
