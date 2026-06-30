import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";
import { areaPages, services } from "@/data/site";

const AREA_ROUTE_SLUG: Record<string, string> = {
  "custom-local-websites": "websites",
  "tech-consulting": "local-search",
};

function areaRouteSlug(serviceSlug: string) {
  return AREA_ROUTE_SLUG[serviceSlug] ?? serviceSlug;
}

export default function AreaDetail() {
  const { slug } = useParams();
  const area = areaPages.find((item) => item.slug === slug);

  if (!area) return <Navigate to="/about/" replace />;

  return (
    <>
      <PageHero
        eyebrow={`Neighborhood · ${area.name}`}
        title={<>{area.headline}</>}
        dek={area.shortAnswer}
        image={{
          src: "/assets/nyc-street-crowd.webp",
          alt: `${area.name}, New York`,
          width: 1600,
          height: 1200,
        }}
      />

      <section style={{ padding: "var(--lf-space-7) var(--lf-margin-mobile)" }}>
        <div style={{ maxWidth: "var(--lf-max-w)", marginInline: "auto" }}>
          <EditorialBody>
            <p>{area.localPattern}</p>
            <p><strong>Suggested first move.</strong> {area.firstMove}</p>
            <p>
              <em>ZIP codes served:</em> {area.zipCodes.join(", ")}
            </p>
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
                fontSize: "11px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--lf-bone-dim)",
                margin: "0 0 var(--lf-space-5)",
              }}
            >
              Services in {area.name}
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 0,
                borderTop: "1px solid var(--lf-hairline)",
              }}
            >
              {services.map((service) => (
                <li
                  key={service.slug}
                  style={{ borderBottom: "1px solid var(--lf-hairline)" }}
                >
                  <Link
                    to={`/areas/${area.slug}/${areaRouteSlug(service.slug)}/`}
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
                        fontSize: "11px",
                        letterSpacing: "0.16em",
                        color: "var(--lf-fight)",
                        paddingTop: "var(--lf-space-1)",
                      }}
                    >
                      {service.eyebrow}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--lf-serif)",
                        fontVariationSettings: '"opsz" 72',
                        fontWeight: 600,
                        fontSize: "var(--lf-text-lg)",
                        lineHeight: 1.1,
                        letterSpacing: 0,
                      }}
                    >
                      {service.headline}
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
