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
import "@/styles/editorial/longform-routes.css";

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
 * photo simply skip it. Captions describe the image, not a neighborhood stereotype. */
const AREA_FIGURE: Record<string, { src: string; alt: string; caption: string }> = {
  "east-village": {
    src: "/assets/figure-ev-vendor.webp",
    alt: "A street vendor's clothes hung along an East Village fence, safety barriers in front",
    caption: "A street-level East Village frame. Your public details still need to work on a phone.",
  },
  midtown: {
    src: "/assets/figure-midtown-neon-pavement.webp",
    alt: "Wet Midtown pavement at night reflecting pink and purple neon",
    caption: "A Midtown street frame after dark. Make the next action clear before someone arrives.",
  },
  "upper-east-side": {
    src: "/assets/figure-ues-diner.webp",
    alt: "An Upper East Side corner diner glowing warm at night",
    caption: "A warm Upper East Side diner frame. Clear hours and contact details give people a useful place to start.",
  },
  "upper-west-side": {
    src: "/assets/figure-uws-icecream.webp",
    alt: "An ice cream truck at Central Park West, golden-hour sun flaring down the cross street",
    caption: "An Upper West Side street frame. A customer should be able to check the basics without a scavenger hunt.",
  },
  "west-village": {
    src: "/assets/figure-wv-bistro.webp",
    alt: "A red-brick West Village corner bistro with sidewalk tables",
    caption: "A West Village corner bistro frame. The online path should be as legible as the front door.",
  },
  "greenwich-village": {
    src: "/assets/figure-greenwich-pizza.webp",
    alt: "A busy Greenwich Village pizza corner seen from above, people crossing toward it",
    caption: "A Greenwich Village pizza-corner frame. A clear menu, booking, or contact route makes the next step easier.",
  },
  "the-bronx": {
    src: "/assets/figure-bronx-pizza.webp",
    alt: "A Bronx pizzeria storefront, counter glowing behind the window",
    caption: "A Bronx pizzeria storefront frame. Keep the public information customers need in one dependable place.",
  },
  "staten-island": {
    src: "/assets/figure-si-houses.webp",
    alt: "A row of Staten Island houses with tidy lawns and a front-yard fountain",
    caption: "A Staten Island residential street frame. Service businesses need a simple way for a customer to ask for help.",
  },
  chelsea: {
    src: "/assets/figure-chelsea-florist.webp",
    alt: "Chelsea Florist's storefront glowing pink at night, gate half open",
    caption: "A Chelsea florist storefront frame. A website should make the open, contact, or order path easy to see.",
  },
  "lower-east-side": {
    src: "/assets/figure-les-bottleshop.webp",
    alt: "A Lower East Side bottle shop at night, shelves glowing through the doorway",
    caption: "A Lower East Side bottle-shop frame. Check that your public hours and next step agree.",
  },
  soho: {
    src: "/assets/figure-soho-balloons.webp",
    alt: "Bright balloons over a SoHo sidewalk, a shopper passing below",
    caption: "A SoHo sidewalk frame. A clean route from curiosity to contact beats a clever dead end.",
  },
  williamsburg: {
    src: "/assets/figure-wburg-kitchen.webp",
    alt: "A late-night kitchen window with an OPEN neon sign, two cooks at work",
    caption: "A Williamsburg kitchen-window frame. When the business is open, the public details should say so too.",
  },
  bushwick: {
    src: "/assets/figure-bushwick-market.webp",
    alt: "A produce market on a corner, seen from above, shoppers crossing toward it",
    caption: "A Bushwick market frame. A customer needs the same clear answer online that they get at the counter.",
  },
  "park-slope": {
    src: "/assets/figure-ps-cafe-table.webp",
    alt: "A café table with the newspaper, coffee, and a pastry",
    caption: "A Park Slope cafe-table frame. Keep the first phone visit calm, clear, and useful.",
  },
  astoria: {
    src: "/assets/figure-astoria-market.webp",
    alt: "A shopper in a yellow coat choosing fruit at a neighborhood market",
    caption: "An Astoria market frame. Good in-person service deserves an equally clear online handoff.",
  },
  "financial-district": {
    src: "/assets/figure-fidi-corner.webp",
    alt: "An ornate Financial District building corner above a street-level storefront",
    caption: "A Financial District streetscape frame. Put the useful details near the top, before a visitor has to hunt.",
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
    <div className="lf-longform-route lf-longform-route--area">
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

          <nav className="lf-area-start__routes" aria-label={`Ways to start ${area.locative ?? `in ${area.name}`}`}>
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
              A practical {area.name} starting point.
            </h2>
            <div className="lf-area-context">
              <p className="lf-area-context__label">The useful local question</p>
              <p>{area.businessLandscape}</p>
            </div>
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

          {area.webDesign && (
            <article
              id="web-design"
              className="lf-content-tile lf-content-tile--half lf-area-anchor"
            >
              <EditorialBody>
                <h2>Website design {area.locative ?? `in ${area.name}`}</h2>
                <p>{area.webDesign}</p>
                <p>
                  <Link to="/services/custom-local-websites/">How we build websites</Link>
                  {" · "}
                  <Link to="/website-check/#website-check-url">Check your current site, free</Link>
                </p>
              </EditorialBody>
            </article>
          )}

          <aside className="lf-content-tile lf-content-tile--half lf-content-tile--quiet">
            <p className="lf-content-tile__label">Check the public record</p>
            <h2 className="lf-area-disclosure__heading">Your block is not a stereotype.</h2>
            <p className="lf-area-services__intro">
              The local notes here are a starting lens, not a claim about your business. We check
              the live listing, public location information, and your own customer path before
              recommending a change.
            </p>
            <p className="lf-area-services__intro">
              <a href="https://zola.planning.nyc.gov/" target="_blank" rel="noreferrer">
                NYC Planning’s ZoLa map ↗
              </a>{" "}
              and{" "}
              <a href="https://www.nyc.gov/site/sbs/index.page" target="_blank" rel="noreferrer">
                NYC Small Business Services ↗
              </a>{" "}
              are useful places to check the wider public picture.
            </p>
          </aside>

          <aside
            id="first-move"
            className="lf-content-tile lf-content-tile--half lf-content-tile--tablet-full lf-content-tile--signal lf-area-anchor"
          >
            <PullQuote cite={`First move ${area.locative ?? `in ${area.name}`}`}>{area.firstMove}</PullQuote>
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
                <h2 id="lf-area-faq-title">Owning a business {area.locative ?? `in ${area.name}`}</h2>
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
            <h2 className="lf-area-disclosure__heading">Services {area.locative ?? `in ${area.name}`}</h2>
            <p className="lf-area-services__intro">
              Choose the situation that matches the business. Every path starts
              with what already works {area.locative ?? `in ${area.name}`}.
            </p>
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
        heading={`Near ${area.name}? We’re close.`}
        lede="Bring the page, tool, or handoff that is getting in the way. We will help you name a sensible next move."
      />
    </div>
  );
}
