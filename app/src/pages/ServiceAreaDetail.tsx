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
        dek={`${area.name} businesses need ${service.plain.toLowerCase()} Little Fight keeps what works and fixes what drags.`}
        image={{
          src: service.image,
          alt: `${service.eyebrow} help in ${area.name}`,
          width: 1200,
          height: 900,
        }}
      />

      <section style={{ paddingBlock: "var(--lf-space-7) var(--lf-space-8)" }}>
        <div className="lf-container">
          <EditorialBody>
            <p>{area.localPattern}</p>
            <p>{service.outcome}</p>
            <p><strong>First move.</strong> {area.firstMove}</p>
          </EditorialBody>

          <section
            style={{
              marginTop: "var(--lf-space-8)",
              paddingTop: "var(--lf-space-6)",
              borderTop: "1px solid var(--lf-hairline)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--lf-mono)",
                fontSize: "var(--lf-text-2xs)",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--lf-bone-dim)",
                margin: "0 0 var(--lf-space-5)",
              }}
            >
              The other services in {area.name}
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                borderTop: "1px solid var(--lf-hairline)",
              }}
            >
              {related.map((item) => (
                <li
                  key={item.slug}
                  style={{ borderBottom: "1px solid var(--lf-hairline)" }}
                >
                  <Link
                    to={`/areas/${area.slug}/${areaRouteSlug(item.slug)}/`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: "var(--lf-space-4)",
                      padding: "var(--lf-space-5) 0",
                      textDecoration: "none",
                      color: "var(--lf-bone)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--lf-mono)",
                        fontSize: "var(--lf-text-2xs)",
                        letterSpacing: "0.16em",
                        color: "var(--lf-fight)",
                        paddingTop: "var(--lf-space-1)",
                      }}
                    >
                      {item.eyebrow}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--lf-serif)",
                        fontWeight: 600,
                        fontSize: "var(--lf-text-lg)",
                        lineHeight: 1.1,
                        letterSpacing: 0,
                      }}
                    >
                      {item.headline}
                    </span>
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
