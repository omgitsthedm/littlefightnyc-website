import { MapPin } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import VisualIndex from "@/components/editorial/VisualIndex";
import MiniMapNYC from "@/components/dataviz/MiniMapNYC";
import { areaPages } from "@/data/site";

// Same per-area frames the detail pages use, so hub and detail agree.
const AREA_IMAGE: Record<string, string> = {
  "lower-east-side": "/assets/nyc-chinatown-night.webp",
  "east-village": "/assets/nyc-stickys-steam.webp",
  soho: "/assets/hero-soho-crosswalk.webp",
  chelsea: "/assets/manhattan.webp",
  midtown: "/assets/nyc-street-crowd.webp",
  "upper-east-side": "/assets/nyc-hair-salon-street.webp",
  "upper-west-side": "/assets/storefront-shop-deli.webp",
  "west-village": "/assets/nyc-street.webp",
  williamsburg: "/assets/interior-jeans-rack.webp",
  bushwick: "/assets/pizza-menu-chalkboard.webp",
  "park-slope": "/assets/storefront-blue-gift-shop.webp",
  dumbo: "/assets/coworking-laptops.webp",
  astoria: "/assets/interior-spice-shop.webp",
  "long-island-city": "/assets/interior-grocery.webp",
};

export default function Areas() {
  return (
    <>
      <PageHero
        eyebrow="Local"
        icon={MapPin}
        title={
          <>
            The neighborhoods{" "}
            <br />
            <span className="lf-em">we show up in.</span>
          </>
        }
        dek="Little Fight works across New York City, with on-site visits usually within 24 hours. These are the Manhattan, Brooklyn, and Queens neighborhoods where we're in the most shops, salons, bars, and back offices."
        image={{
          src: "/assets/nyc-street-crowd.webp",
          alt: "A busy New York street at dusk",
          width: 1600,
          height: 1200,
        }}
      />

      <section
        aria-label="Coverage map"
        style={{ paddingBlock: "var(--lf-space-6) 0" }}
      >
        <div className="lf-container">
          <MiniMapNYC />
        </div>
      </section>

      <VisualIndex
        eyebrow="Neighborhoods"
        title="Fourteen patches of the same fight."
        dek="Every neighborhood breaks in its own way. Pick yours to see what we usually walk into there."
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
