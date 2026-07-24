import { Link, Navigate, useParams } from "react-router-dom";
import { MapPin, Wrench, Waypoints } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import PullQuote from "@/components/editorial/PullQuote";
import QuietContact from "@/components/editorial/QuietContact";
import MiniMapNYC from "@/components/dataviz/MiniMapNYC";
import EditorialFigure from "@/components/editorial/EditorialFigure";
import { areaPages, services } from "@/data/site";
import "@/styles/editorial/area-detail.css";

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
  "the-bronx": "/assets/hero-bronx-stadium.webp",
  "staten-island": "/assets/hero-si-ferry-terminal.webp",
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
  "the-bronx": {
    src: "/assets/figure-bronx-pizza.webp",
    alt: "A Bronx pizzeria storefront, counter glowing behind the window",
    caption: "Four generations of regulars — and every new customer starts with a search.",
  },
  "staten-island": {
    src: "/assets/figure-si-houses.webp",
    alt: "A row of Staten Island houses with tidy lawns and a front-yard fountain",
    caption: "Every one of these houses needs a plumber, a landscaper, a contractor. They all search first.",
  },
  chelsea: {
    src: "/assets/figure-chelsea-florist.webp",
    alt: "Chelsea Florist's storefront glowing pink at night, gate half open",
    caption: "Open late, lit up, easy to find. That's the whole playbook.",
  },
  "lower-east-side": {
    src: "/assets/figure-les-bottleshop.webp",
    alt: "A Lower East Side bottle shop at night, shelves glowing through the doorway",
    caption: "The night crowd decides mid-walk. The listing has to be right before they look up.",
  },
  soho: {
    src: "/assets/figure-soho-balloons.webp",
    alt: "Bright balloons over a SoHo sidewalk, a shopper passing below",
    caption: "Foot traffic is the easy part here. Turning it into customers is the fight.",
  },
  williamsburg: {
    src: "/assets/figure-wburg-kitchen.webp",
    alt: "A late-night kitchen window with an OPEN neon sign, two cooks at work",
    caption: "The kitchen's still on. The lights say open. Google better agree.",
  },
  bushwick: {
    src: "/assets/figure-bushwick-market.webp",
    alt: "A produce market on a corner, seen from above, shoppers crossing toward it",
    caption: "Real commerce, cash and all. The block knows. The internet should too.",
  },
  "park-slope": {
    src: "/assets/figure-ps-cafe-table.webp",
    alt: "A café table with the newspaper, coffee, and a pastry",
    caption: "Slow mornings, loyal regulars — and every new family checks the reviews first.",
  },
  astoria: {
    src: "/assets/figure-astoria-market.webp",
    alt: "A shopper in a yellow coat choosing fruit at a neighborhood market",
    caption: "Great produce never needed marketing. Being findable is another story.",
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

      <section className="lf-area-start" aria-labelledby="lf-area-start-title">
        <div className="lf-area-start__inner">
          <header className="lf-area-start__head">
            <p className="lf-area-start__eyebrow">Start with your situation</p>
            <h2 id="lf-area-start-title">What needs to work better?</h2>
            <p>Pick the closest problem. Each path stays specific to {area.name}.</p>
          </header>

          <nav className="lf-area-start__routes" aria-label={`Ways to start in ${area.name}`}>
            <a href="#visibility">
              <span>Get found</span>
              <strong>Customers cannot find the right information.</strong>
              <small>Check search, hours, trust, and the first phone screen.</small>
            </a>
            <a href="#customer-path">
              <span>Make action easier</span>
              <strong>Calls, bookings, orders, or inquiries drop off.</strong>
              <small>Trace the path from local search to a completed next step.</small>
            </a>
            <a href="#first-move">
              <span>Get a plan</span>
              <strong>You need a first move, not another tool.</strong>
              <small>Start with the highest-impact fix for this neighborhood.</small>
            </a>
          </nav>
        </div>
      </section>

      <section className="lf-content-section">
        <div className="lf-content-grid">
          <section className="lf-content-tile lf-content-tile--full lf-content-tile--quiet">
            <MiniMapNYC current={area.slug} />
          </section>

          <article
            className={`lf-content-tile ${
              AREA_FIGURE[area.slug] ? "lf-content-tile--wide" : "lf-content-tile--full"
            }`}
          >
            <EditorialBody dropcap>
              <p>{area.intro}</p>
            </EditorialBody>
            <h2 className="lf-area-disclosure__heading">
              What shapes business in {area.name}
            </h2>
            <details className="lf-area-disclosure">
              <summary>
                <span>Local context</span>
                <strong>Read the neighborhood context</strong>
                <span className="lf-area-disclosure__state" aria-hidden="true" />
              </summary>
              <div className="lf-area-disclosure__body">
                <h3>The businesses here</h3>
                <p>{area.businessLandscape}</p>
              </div>
            </details>
          </article>

          {AREA_FIGURE[area.slug] && (
            <div className="lf-content-tile lf-content-tile--narrow lf-content-tile--media">
              <EditorialFigure
                src={AREA_FIGURE[area.slug].src}
                alt={AREA_FIGURE[area.slug].alt}
                caption={AREA_FIGURE[area.slug].caption}
                width={1600}
                height={1200}
              />
            </div>
          )}

          <article
            id="visibility"
            className="lf-content-tile lf-content-tile--half lf-content-tile--quiet lf-area-anchor"
          >
            <EditorialBody>
              <h2>How customers find you</h2>
              <p>{area.localSearchReality}</p>
            </EditorialBody>
          </article>

          <aside
            id="first-move"
            className="lf-content-tile lf-content-tile--half lf-content-tile--tablet-full lf-content-tile--signal lf-area-anchor"
          >
            <PullQuote cite={`First move in ${area.name}`}>{area.firstMove}</PullQuote>
          </aside>

          <section
            id="customer-path"
            className="lf-content-tile lf-content-tile--full lf-area-anchor"
          >
            <p className="lf-content-tile__label">
              <Wrench size={14} strokeWidth={2} aria-hidden="true" />
              What we would inspect first
            </p>
            <ul className="lf-content-list" data-count={area.whatWeFixHere.length}>
              {area.whatWeFixHere.map((fix) => (
                <li key={fix}>{fix}</li>
              ))}
            </ul>
          </section>

          <section className="lf-content-tile lf-content-tile--full lf-content-tile--quiet">
            <div className="lf-area-faq" aria-labelledby="lf-area-faq-title">
              <header className="lf-area-faq__head">
                <p>Questions from local owners</p>
                <h2 id="lf-area-faq-title">Owning a business in {area.name}</h2>
              </header>
              <div className="lf-area-faq__list">
                {area.faq.map((item) => (
                  <details key={item.question} className="lf-area-faq__item">
                    <summary>
                      <span>{item.question}</span>
                      <span className="lf-area-disclosure__state" aria-hidden="true" />
                    </summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="lf-content-tile lf-content-tile--full">
            <h2 className="lf-area-disclosure__heading">Services in {area.name}</h2>
            <details className="lf-area-disclosure lf-area-disclosure--services">
              <summary>
                <span>Ways we help</span>
                <strong>See every service available here</strong>
                <span className="lf-area-disclosure__state" aria-hidden="true" />
              </summary>
              <div className="lf-area-disclosure__body">
                <ul className="lf-content-list lf-content-list--links" data-count={services.length}>
                  {services.map((service) => (
                    <li key={service.slug}>
                      <Link to={`/areas/${area.slug}/${areaRouteSlug(service.slug)}/`}>
                        <span className="lf-content-link__label">{service.eyebrow}</span>
                        <span className="lf-content-link__title">{service.headline}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </section>

          {nearby.length > 0 && (
            <nav className="lf-content-tile lf-content-tile--full lf-content-tile--quiet" aria-label="Nearby neighborhoods">
              <p className="lf-content-tile__label">
                <Waypoints size={14} strokeWidth={2} aria-hidden="true" />
                Nearby neighborhoods
              </p>
              <ul className="lf-chip-list">
                {nearby.map((n) => (
                  <li key={n.slug}>
                    <Link to={`/areas/${n.slug}/`}>
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
