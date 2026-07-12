import { Link, Navigate, useParams } from "react-router-dom";
import { MapPin, Wrench, Waypoints } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import PullQuote from "@/components/editorial/PullQuote";
import FaqList from "@/components/editorial/FaqList";
import QuietContact from "@/components/editorial/QuietContact";
import MiniMapNYC from "@/components/dataviz/MiniMapNYC";
import { areaPages, services } from "@/data/site";

const AREA_ROUTE_SLUG: Record<string, string> = {
  "custom-local-websites": "websites",
  "tech-consulting": "local-search",
};

// A distinct NYC frame per neighborhood so no two area pages share a hero.
const AREA_IMAGE: Record<string, string> = {
  "lower-east-side": "/assets/nyc-chinatown-night.webp",
  "east-village": "/assets/nyc-stickys-steam.webp",
  soho: "/assets/hero-soho-crosswalk.webp",
  chelsea: "/assets/manhattan.webp",
  midtown: "/assets/nyc-street-crowd.webp",
  "upper-east-side": "/assets/nyc-hair-salon-street.webp",
  "upper-west-side": "/assets/storefront-shop-deli.webp",
  "west-village": "/assets/nyc-street.webp",
};

function areaRouteSlug(serviceSlug: string) {
  return AREA_ROUTE_SLUG[serviceSlug] ?? serviceSlug;
}

export default function AreaDetail() {
  const { slug } = useParams();
  const area = areaPages.find((item) => item.slug === slug);

  if (!area) return <Navigate to="/about/" replace />;

  const nearby = area.nearby
    .map((s) => areaPages.find((a) => a.slug === s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <>
      <PageHero
        eyebrow={`Neighborhood · ${area.name}`}
        icon={MapPin}
        title={<>{area.headline}</>}
        dek={area.shortAnswer.replace(/^Short answer:\s*/i, "")}
        image={{
          src: AREA_IMAGE[area.slug] ?? "/assets/nyc-street-crowd.webp",
          alt: `${area.name}, New York`,
          width: 1600,
          height: 1200,
        }}
      />

      <section style={{ padding: "var(--lf-space-7) var(--lf-margin-mobile)" }}>
        <div style={{ maxWidth: "var(--lf-max-w)", marginInline: "auto" }}>
          <MiniMapNYC current={area.slug} />

          <EditorialBody dropcap>
            <p>{area.intro}</p>
            <h2>The businesses here</h2>
            <p>{area.businessLandscape}</p>
            <h2>How customers find you</h2>
            <p>{area.localSearchReality}</p>
          </EditorialBody>

          <PullQuote cite={`First move in ${area.name}`}>{area.firstMove}</PullQuote>

          <section
            style={{
              marginTop: "var(--lf-space-8)",
              paddingTop: "var(--lf-space-6)",
              borderTop: "1px solid var(--lf-hairline)",
            }}
          >
            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.55em",
                fontFamily: "var(--lf-mono)",
                fontSize: "11px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--lf-bone-dim)",
                margin: "0 0 var(--lf-space-4)",
              }}
            >
              <Wrench size={14} strokeWidth={2} aria-hidden="true" style={{ color: "var(--lf-fight)", flex: "none" }} />
              What we fix here
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "var(--lf-space-3)" }}>
              {area.whatWeFixHere.map((fix) => (
                <li
                  key={fix}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "var(--lf-space-3)",
                    fontSize: "var(--lf-text-md)",
                    lineHeight: 1.55,
                    color: "var(--lf-bone-soft)",
                  }}
                >
                  <span aria-hidden="true" style={{ color: "var(--lf-fight)", fontWeight: 700 }}>—</span>
                  <span>{fix}</span>
                </li>
              ))}
            </ul>
          </section>

          <FaqList title={`Owning a business in ${area.name}`} items={area.faq} />

          <EditorialBody>
            <p style={{ color: "var(--lf-bone-dim)", fontSize: "var(--lf-text-sm)" }}>
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

          {nearby.length > 0 && (
            <nav
              aria-label="Nearby neighborhoods"
              style={{
                marginTop: "var(--lf-space-8)",
                paddingTop: "var(--lf-space-6)",
                borderTop: "1px solid var(--lf-hairline)",
              }}
            >
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55em",
                  fontFamily: "var(--lf-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--lf-bone-dim)",
                  margin: "0 0 var(--lf-space-4)",
                }}
              >
                <Waypoints size={14} strokeWidth={2} aria-hidden="true" style={{ color: "var(--lf-fight)", flex: "none" }} />
                Nearby neighborhoods
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "var(--lf-space-3)" }}>
                {nearby.map((n) => (
                  <li key={n.slug}>
                    <Link
                      to={`/areas/${n.slug}/`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4em",
                        padding: "10px 16px",
                        minHeight: "44px",
                        borderRadius: "var(--lf-radius-pill)",
                        border: "1px solid var(--lf-hairline)",
                        color: "var(--lf-bone)",
                        textDecoration: "none",
                        fontSize: "var(--lf-text-sm)",
                      }}
                    >
                      {n.name} <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      <QuietContact />
    </>
  );
}
