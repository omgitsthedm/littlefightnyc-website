import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { areaPages } from "@/data/site";
import "./MiniMapNYC.css";

/**
 * MiniMapNYC — a REAL basemap (Leaflet + Carto dark tiles, lazy-loaded when
 * scrolled near), per David's direction: evoke a proper map product, never a
 * hand-drawn blob. The eight served neighborhoods are tappable markers
 * linking to /areas/{slug}/: current = orange, its nearby[] = blue, the rest
 * muted. The ZIP chip list beside the map carries the same links + facts as
 * visible text (and is the no-map fallback). Data: areaPages.
 */

// Real neighborhood centers (lat, lng).
const AREA_CENTER: Record<string, [number, number]> = {
  "lower-east-side": [40.7154, -73.984],
  "east-village": [40.7265, -73.9815],
  soho: [40.7233, -74.003],
  chelsea: [40.7465, -74.0014],
  midtown: [40.7549, -73.984],
  "upper-east-side": [40.7736, -73.9566],
  "upper-west-side": [40.787, -73.9754],
  "west-village": [40.7358, -74.0036],
};

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Brand values for Leaflet's canvas/SVG pane (mirrors --lf-fight / --lf-blue /
// --lf-bone-dim — Leaflet options can't consume CSS custom properties).
const COLOR = {
  current: "#F97316",
  nearby: "#3B82F6",
  default: "#8A8A94",
} as const;

type MarkerState = keyof typeof COLOR;

export default function MiniMapNYC({
  current,
  compact = false,
  className,
}: {
  /** Slug of the area page being viewed — orange marker; its nearby[] blue. */
  current?: string;
  /** Smaller footprint for supporting placements (e.g. About). */
  compact?: boolean;
  className?: string;
}) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.2 });
  const mapRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  const currentArea = current ? areaPages.find((a) => a.slug === current) : undefined;
  const nearbySlugs = new Set(currentArea?.nearby ?? []);

  const stateOf = (slug: string): MarkerState =>
    slug === current ? "current" : nearbySlugs.has(slug) ? "nearby" : "default";

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    let disposed = false;
    let map: import("leaflet").Map | undefined;
    let observer: IntersectionObserver | undefined;

    const boot = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");
        if (disposed || !mapRef.current) return;

        map = L.map(mapRef.current, {
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          touchZoom: false,
          attributionControl: true,
        });
        map.attributionControl.setPrefix(false);

        L.tileLayer(TILE_URL, {
          attribution: TILE_ATTRIBUTION,
          subdomains: "abcd",
          maxZoom: 15,
        }).addTo(map);

        const nearby = currentArea
          ? [currentArea.slug, ...currentArea.nearby.filter((s) => AREA_CENTER[s])]
          : Object.keys(AREA_CENTER);
        const bounds = L.latLngBounds(nearby.map((s) => AREA_CENTER[s]));
        map.fitBounds(bounds, { padding: compact ? [18, 18] : [34, 34] });

        for (const area of areaPages) {
          const center = AREA_CENTER[area.slug];
          if (!center || !map) continue;
          const state = stateOf(area.slug);
          const color = COLOR[state];

          const marker = L.circleMarker(center, {
            radius: state === "current" ? 9 : 6,
            color,
            weight: 2,
            fillColor: color,
            fillOpacity: state === "default" ? 0.25 : 0.7,
          }).addTo(map);

          marker.bindTooltip(area.name, {
            permanent: !compact && state !== "default",
            direction: "top",
            offset: L.point(0, -8),
            className: `lf-minimap__tooltip lf-minimap__tooltip--${state}`,
          });

          marker.on("click", () => navigate(`/areas/${area.slug}/`));
        }
      } catch {
        // Leaflet or tiles unavailable (offline, blocked) — hide the canvas;
        // the chip list beside it already carries every fact and link.
        if (!disposed) setFailed(true);
      }
    };

    // Lazy: only pull leaflet (+ tiles) when the map scrolls near.
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect();
            void boot();
          }
        },
        { rootMargin: "300px 0px" }
      );
      observer.observe(el);
    } else {
      void boot();
    }

    return () => {
      disposed = true;
      observer?.disconnect();
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-key by page
  }, [current, compact]);

  const summary = currentArea
    ? `Map of Manhattan centered on ${currentArea.name} (ZIP ${currentArea.zipCodes.join(", ")}), marked in orange, with nearby neighborhoods ${(currentArea.nearby
        .map((s) => areaPages.find((a) => a.slug === s)?.name)
        .filter(Boolean) as string[]).join(", ")} in blue. All eight served neighborhoods are listed with their ZIP codes beside the map.`
    : "Map of Manhattan showing the eight neighborhoods Little Fight serves, each listed with its ZIP codes beside the map.";

  return (
    <figure
      ref={ref}
      className={`lf-minimap${compact ? " lf-minimap--compact" : ""}${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Where we work — Manhattan coverage map"
    >
      <p className="lf-viz-sr">{summary}</p>
      <div className="lf-minimap__layout">
        <div className="lf-minimap__map" data-failed={failed || undefined}>
          <div ref={mapRef} className="lf-minimap__canvas" aria-hidden="true" />
        </div>

        <ul className="lf-minimap__chips">
          {areaPages.map((area) => (
            <li key={area.slug}>
              <Link
                to={`/areas/${area.slug}/`}
                viewTransition
                className="lf-minimap__chip"
                data-state={stateOf(area.slug)}
                aria-current={area.slug === current ? "page" : undefined}
              >
                <span className="lf-minimap__chip-name">{area.name}</span>
                <span className="lf-minimap__chip-zips">{area.zipCodes.join(" · ")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="lf-minimap__caption">
        {currentArea
          ? `${currentArea.name} in orange · nearby in blue`
          : "The eight Manhattan neighborhoods we serve"}
      </figcaption>
    </figure>
  );
}
