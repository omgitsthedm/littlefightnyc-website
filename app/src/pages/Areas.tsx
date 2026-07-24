import { MapPin } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import VisualIndex from "@/components/editorial/VisualIndex";
import MiniMapNYC from "@/components/dataviz/MiniMapNYC";
import { areaPages } from "@/data/site";

// Same per-area frames the detail pages use, so hub and detail agree.
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

export default function Areas() {
  return (
    <>
      <PageHero
        eyebrow="Local"
        icon={MapPin}
        title={
          <>
            Every New York business{" "}
            <br />
            <span className="lf-em">has a local story.</span>
          </>
        }
        dek="We work across all five boroughs, with on-site visits usually within 24 hours. Start with your neighborhood and the kind of problem in front of you."
        image={{
          src: "/assets/nyc-street-crowd.webp",
          alt: "A busy New York street at dusk",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-content-section lf-content-section--tight" aria-label="Coverage map">
        <div className="lf-content-grid">
          <div className="lf-content-tile lf-content-tile--full lf-content-tile--quiet">
            <MiniMapNYC />
          </div>
        </div>
      </section>

      <VisualIndex
        eyebrow="Neighborhoods"
        title="Find your neighborhood."
        dek="See the local customer habits, common technology problems, and the first move we would inspect there."
        variant="grid"
        items={areaPages.map((area) => ({
          eyebrow: `ZIP ${area.zipCodes.join(" · ")}`,
          title: area.name,
          body: area.headline,
          icon: MapPin,
          image: AREA_IMAGE[area.slug] ?? "/assets/nyc-street-crowd.webp",
          to: `/areas/${area.slug}/`,
        }))}
      />

      <QuietContact />
    </>
  );
}
