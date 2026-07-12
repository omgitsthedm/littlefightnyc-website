import { MapPin } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import VisualIndex from "@/components/editorial/VisualIndex";
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
        dek="Little Fight works across New York City, with on-site visits usually within 24 hours. These are the Manhattan neighborhoods where we're in the most shops, salons, bars, and back offices."
        image={{
          src: "/assets/nyc-street-crowd.webp",
          alt: "A busy New York street at dusk",
          width: 1600,
          height: 1200,
        }}
      />

      <VisualIndex
        eyebrow="Neighborhoods"
        title="Eight patches of the same fight."
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
