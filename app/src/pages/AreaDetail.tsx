import { Link, Navigate, useParams } from "react-router-dom";
import { MapPin, Wrench, Waypoints } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import PullQuote from "@/components/editorial/PullQuote";
import FaqList from "@/components/editorial/FaqList";
import QuietContact from "@/components/editorial/QuietContact";
import MiniMapNYC from "@/components/dataviz/MiniMapNYC";
import EditorialFigure from "@/components/editorial/EditorialFigure";
import { areaPages, services } from "@/data/site";

const AREA_ROUTE_SLUG: Record<string, string> = {
  "custom-local-websites": "websites",
  "tech-consulting": "local-search",
};

// A distinct NYC frame per neighborhood so no two area pages share a hero.
const AREA_IMAGE: Record<string, string> = {
  "lower-east-side": "/assets/nyc-chinatown-night.webp",
  "east-village": "/assets/hero-east-village-night.webp",
  soho: "/assets/hero-soho-crosswalk.webp",
  chelsea: "/assets/manhattan.webp",
  midtown: "/assets/hero-midtown-market.webp",
  "upper-east-side": "/assets/hero-ues-lights.webp",
  "upper-west-side": "/assets/hero-uws-72nd.webp",
  "west-village": "/assets/hero-west-village-cafe.webp",
  williamsburg: "/assets/interior-jeans-rack.webp",
  bushwick: "/assets/pizza-menu-chalkboard.webp",
  "park-slope": "/assets/storefront-beauty-supply.webp",
  dumbo: "/assets/coworking-laptops.webp",
  astoria: "/assets/interior-spice-shop.webp",
  "long-island-city": "/assets/interior-grocery.webp",
  "greenwich-village": "/assets/hero-greenwich-arch.webp",
  "financial-district": "/assets/hero-fidi-love-gate.webp",
};

/* A second real frame per neighborhood — map-driven, so areas without a
 * photo simply skip it. Captions carry local truth, not decoration. */
const AREA_FIGURE: Record<string, { src: string; alt: string; caption: string }> = {
  "east-village": {
    src: "/assets/figure-ev-vendor.webp",
    alt: "A street vendor's clothes hung along an East Village fence, safety barriers in front",
    caption: "Half the commerce here still happens right on the sidewalk. The other half happens on a phone.",
  },
  midtown: {
    src: "/assets/figure-midtown-neon-pavement.webp",
    alt: "Wet Midtown pavement at night reflecting pink and purple neon",
    caption: "Eight million people walk past. The ones who walk in searched first.",
  },
  "upper-east-side": {
    src: "/assets/figure-ues-diner.webp",
    alt: "An Upper East Side corner diner glowing warm at night",
    caption: "The neighborhood spots that outlast every chain have one thing in common: people can find them.",
  },
  "upper-west-side": {
    src: "/assets/figure-uws-icecream.webp",
    alt: "An ice cream truck at Central Park West, golden-hour sun flaring down the cross street",
    caption: "Season by season, block by block — the Upper West Side rewards the businesses that show up.",
  },
  "west-village": {
    src: "/assets/figure-wv-bistro.webp",
    alt: "A red-brick West Village corner bistro with sidewalk tables",
    caption: "Corner rooms and sidewalk regulars. The Village runs on places like this.",
  },
  "greenwich-village": {
    src: "/assets/figure-greenwich-pizza.webp",
    alt: "A busy Greenwich Village pizza corner seen from above, people crossing toward it",
    caption: "The line out the door didn't happen by accident.",
  },
  "financial-district": {
    src: "/assets/figure-fidi-corner.webp",
    alt: "An ornate Financial District building corner above a street-level storefront",
    caption: "Old-money architecture upstairs. Small businesses keeping the lights on at street level.",
  },
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
        displayName={`${area.name}.`}
        title={<>{area.headline}</>}
        dek={area.shortAnswer.replace(/^Short answer:\s*/i, "")}
        chips={area.zipCodes}
        image={{
          src: AREA_IMAGE[area.slug] ?? "/assets/nyc-street-crowd.webp",
          alt: `${area.name}, New York`,
          width: 1600,
          height: 1200,
        }}
      />

      <section style={{ paddingBlock: "var(--lf-space-7)" }}>
        <div className="lf-container">
          <MiniMapNYC current={area.slug} />

          <EditorialBody dropcap>
            <p>{area.intro}</p>
            <h2>The businesses here</h2>
            <p>{area.businessLandscape}</p>
          </EditorialBody>

          {AREA_FIGURE[area.slug] && (
            <EditorialFigure
              src={AREA_FIGURE[area.slug].src}
              alt={AREA_FIGURE[area.slug].alt}
              caption={AREA_FIGURE[area.slug].caption}
              width={1600}
              height={1200}
            />
          )}

          <EditorialBody>
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
                fontSize: "var(--lf-text-2xs)",
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
                        fontSize: "var(--lf-text-2xs)",
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
                  fontSize: "var(--lf-text-2xs)",
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

      <QuietContact
        heading={`Near ${area.name}? We're close.`}
        lede="We work in your neighborhood. Call or text 9am-9pm New York time and we will set the right next move."
      />
    </>
  );
}
