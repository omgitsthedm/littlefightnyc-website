import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { areaPages } from "@/data/site";
import "./MiniMapNYC.css";

/**
 * MiniMapNYC — a REAL basemap (Leaflet + Carto dark tiles, lazy-loaded when
 * scrolled near), following the project direction: evoke a proper map product, never a
 * hand-drawn blob. The 14 served neighborhoods are tappable markers
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
  "greenwich-village": [40.7317, -73.9976],
  "financial-district": [40.7075, -74.0089],
  "the-bronx": [40.8618, -73.8904],
  "staten-island": [40.6437, -74.0765],
  "west-village": [40.7358, -74.0036],
  williamsburg: [40.7081, -73.9571],
  bushwick: [40.6944, -73.9213],
  "park-slope": [40.671, -73.9814],
  dumbo: [40.7033, -73.9881],
  astoria: [40.7644, -73.9235],
  "long-island-city": [40.7447, -73.9485],
};

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Brand values for Leaflet’s canvas/SVG pane (mirrors --lf-fight / --lf-blue /
// --lf-bone-dim — Leaflet options can’t consume CSS custom properties).
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
  // failed: Leaflet itself couldn’t boot. tilesFailed: Leaflet runs but the
  // Carto tiles error (offline, blocked CDN). Either way the branded ghost
  // grid stays visible — the container must NEVER read as a white box.
  const [failed, setFailed] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);
  // Nothing reaches Carto until someone asks for the map. Only the button in the
  // render sets this; see the comment in the effect for what it replaced.
  const [started, setStarted] = useState(false);

  const currentArea = current ? areaPages.find((a) => a.slug === current) : undefined;
  const nearbySlugs = new Set(currentArea?.nearby ?? []);

  const stateOf = (slug: string): MarkerState =>
    slug === current ? "current" : nearbySlugs.has(slug) ? "nearby" : "default";

  useEffect(() => {
    const el = mapRef.current;
    if (!el || !started) return;

    let disposed = false;
    let map: import("leaflet").Map | undefined;

    // Fresh page (re-keyed by `current`) — clear any stale failure state.
    setFailed(false);
    setTilesFailed(false);

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

        const tiles = L.tileLayer(TILE_URL, {
          attribution: TILE_ATTRIBUTION,
          subdomains: "abcd",
          maxZoom: 15,
        });
        // Tile-network failure (offline, blocked CDN): surface the branded
        // ghost instead of an empty pane. One successful tile clears it.
        let sawTile = false;
        tiles.on("tileload", () => {
          sawTile = true;
          if (!disposed) setTilesFailed(false);
        });
        tiles.on("tileerror", () => {
          if (!disposed && !sawTile) setTilesFailed(true);
        });
        tiles.addTo(map);
        // The canvas is aria-hidden (decorative wayfinding); Leaflet’s
        // attribution link must not be tab-reachable inside it
        // (axe: aria-hidden-focus). Leaflet recreates the attribution DOM
        // whenever layers change, so sweep on every layeradd + whenReady,
        // not once.
        const unfocusLinks = () => {
          mapRef.current
            ?.querySelectorAll("a")
            .forEach((a) => a.setAttribute("tabindex", "-1"));
        };
        map.on("layeradd", unfocusLinks);
        map.whenReady(unfocusLinks);
        unfocusLinks();

        const nearby = currentArea
          ? [currentArea.slug, ...currentArea.nearby].filter((s) => AREA_CENTER[s])
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
        // Leaflet unavailable (chunk blocked, offline) — the branded ghost
        // grid stands in; the chip list carries every fact and link.
        if (!disposed) setFailed(true);
      }
    };

    // Previously an IntersectionObserver with a 300px margin, which on /areas/
    // meant the map was already in range on arrival and booted immediately.
    // Measured: cartocdn.com contacted on load across all 91 /areas/ routes, and
    // 472KB of JS on a mobile profile against a 150KB ceiling — while /,
    // /services/, /examples/, /library/ and /about/ each make zero third-party
    // requests. This was the only page type on the site disclosing visitors to
    // anyone before they had opted into anything.
    //
    // Scrolling past something is not a request to load it. This effect only
    // runs once `started` is set, and only the button below sets it.
    void boot();

    return () => {
      disposed = true;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-key by page
  }, [current, compact, started]);

  const summary = currentArea
    ? `Map of New York City centered on ${currentArea.name} (ZIP ${currentArea.zipCodes.join(", ")}), marked in orange, with nearby neighborhoods ${(currentArea.nearby
        .map((s) => areaPages.find((a) => a.slug === s)?.name)
        .filter(Boolean) as string[]).join(", ")} in blue. All ${areaPages.length} served neighborhoods are listed with their ZIP codes beside the map.`
    : `Map of New York City showing the ${areaPages.length} neighborhoods Little Fight serves, each listed with its ZIP codes beside the map.`;

  return (
    <figure
      ref={ref}
      className={`lf-minimap${compact ? " lf-minimap--compact" : ""}${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Where we work — New York City coverage map"
    >
      <p className="lf-viz-sr">{summary}</p>
      <div className="lf-minimap__layout">
        <div
          className="lf-minimap__map"
          data-failed={failed || undefined}
          data-tiles-failed={tilesFailed || undefined}
        >
          {/* Branded ghost — dark grid + pin, always painted UNDER the tile
              pane so a tile/CDN failure never exposes a white box. */}
          <div className="lf-minimap__ghost" aria-hidden="true">
            <MapPin size={20} strokeWidth={1.8} />
            <span className="lf-minimap__ghost-title">Manhattan</span>
            <span className="lf-minimap__ghost-note">
              {started ? "Map tiles unavailable" : "Interactive map"}
            </span>
          </div>
          <div ref={mapRef} className="lf-minimap__canvas" aria-hidden="true" />
          {/* The map is the one thing on this site that talks to a third party.
              It loads when asked, not because someone scrolled past it. The
              chips beside it already carry every neighbourhood, ZIP and link, so
              nothing here is behind the button except the basemap itself. */}
          {!started && (
            <button
              type="button"
              className="lf-minimap__load"
              onClick={() => setStarted(true)}
            >
              <MapPin size={16} strokeWidth={2} aria-hidden="true" />
              Show the interactive map
              <span className="lf-minimap__load-note">
                Loads map tiles from Carto
              </span>
            </button>
          )}
        </div>

        <ul className="lf-minimap__chips">
          {areaPages.map((area) => (
            <li key={area.slug}>
              <Link
                to={`/areas/${area.slug}/`}
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
          : "The 18 neighborhoods we serve across all five boroughs"}
      </figcaption>
    </figure>
  );
}
