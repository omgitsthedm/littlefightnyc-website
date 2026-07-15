import { useEffect } from "react";
import { useScrollReveal } from "./useScrollReveal";
import { useOpenNow } from "@/lib/openNow";
import "./NeonSign.css";

/**
 * NeonSign — a home signature moment: hand-bent neon "OPEN" in Little Fight
 * orange, mounted on a wall like a real shopfront sign.
 *
 * Craft (phase 1):
 * - Hot-core glass TUBES: each word is drawn twice — a wide saturated-orange
 *   casing + a thin white-hot gas core — so the tube has depth, not flat glow.
 * - Environment: warm light pools on the wall behind it; a faded, blurred
 *   reflection wavers below (a <use> of the glyph group).
 * - Wide-gamut: the orange uses Display-P3 where supported (Safari / iOS /
 *   modern Chrome) so the glow is genuinely more vivid, sRGB fallback elsewhere.
 *
 * Tied to real availability, inverted like a night sign: DIM while we're
 * reachable (9am-9pm ET), full blaze after hours. Powers on when scrolled into
 * view. Pure SVG + CSS, reduced-motion safe.
 */
export default function NeonSign() {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.35 });
  const openNow = useOpenNow();

  // "Easy exciting moments": on desktop the glow leans toward the cursor; a
  // tap/click surges the sign and fires a transformer-buzz haptic (Android;
  // a no-op on iOS, which has no web vibrate). All progressive enhancement.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width).toFixed(3));
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height).toFixed(3));
      });
    };

    let surgeT = 0;
    const onDown = () => {
      el.dataset.surge = "1";
      window.clearTimeout(surgeT);
      surgeT = window.setTimeout(() => delete el.dataset.surge, 620);
      if (navigator.vibrate) {
        try { navigator.vibrate([16, 26, 10, 42, 20]); } catch { /* ignore */ }
      }
    };

    if (canHover && !reduced) el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      cancelAnimationFrame(raf);
      window.clearTimeout(surgeT);
    };
  }, [ref]);

  return (
    <section
      ref={ref}
      className="lf-neon"
      data-revealed="false"
      data-open={openNow.open ? "true" : "false"}
      aria-label={`Little Fight NYC. ${openNow.sentence}`}
    >
      <span className="lf-neon__glint" aria-hidden="true" />
      <div className="lf-neon__stage">
        <svg className="lf-neon__svg" viewBox="0 0 760 470" role="img" aria-hidden="true">
          <defs>
            {/* orange bloom — a true gaussian glow that renders the SAME on
                Chromium and WebKit (CSS drop-shadow blur is clamped on WebKit,
                so the halo was weaker on Safari/iOS). Blur the shape's alpha at
                three scales, flood it orange, composite → wide consistent glow. */}
            <filter id="lf-neon-bloom" x="-70%" y="-70%" width="240%" height="240%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b1" />
              <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b2" />
              <feGaussianBlur in="SourceAlpha" stdDeviation="24" result="b3" />
              <feMerge result="blur">
                <feMergeNode in="b3" />
                <feMergeNode in="b3" />
                <feMergeNode in="b2" />
                <feMergeNode in="b1" />
              </feMerge>
              <feFlood floodColor="#f97316" result="tint" />
              <feComposite in="tint" in2="blur" operator="in" />
            </filter>
            {/* reflection: soft, wavering, fading down */}
            <filter id="lf-neon-refl" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <linearGradient id="lf-neon-refl-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
              <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="lf-neon-refl-mask">
              <rect x="0" y="330" width="760" height="140" fill="url(#lf-neon-refl-fade)" />
            </mask>
          </defs>

          {/* wide orange bloom behind the tubes (consistent cross-browser) */}
          <use className="lf-neon__bloom" href="#lf-neon-glyphs" filter="url(#lf-neon-bloom)" />

          {/* the tubes */}
          <g id="lf-neon-glyphs">
            {/* OPEN — casing then hot core */}
            <text className="lf-neon__tube lf-neon__word lf-neon__glow lf-neon__lit" x="380" y="150" textAnchor="middle" style={{ ["--on" as string]: "0.6s" }}>OPEN</text>
            <text className="lf-neon__tube lf-neon__word lf-neon__core lf-neon__lit" x="380" y="150" textAnchor="middle" style={{ ["--on" as string]: "0.6s" }}>OPEN</text>

            {/* brand */}
            <text className="lf-neon__tube lf-neon__brand lf-neon__glow lf-neon__lit" x="380" y="262" textAnchor="middle" style={{ ["--on" as string]: "1s" }}>LITTLE FIGHT NYC</text>
            <text className="lf-neon__tube lf-neon__brand lf-neon__core lf-neon__lit" x="380" y="262" textAnchor="middle" style={{ ["--on" as string]: "1s" }}>LITTLE FIGHT NYC</text>

            {/* hand-bent underline swash */}
            <path className="lf-neon__tube lf-neon__underline lf-neon__glow lf-neon__draw" d="M244 292 Q380 316 516 292" fill="none" style={{ ["--len" as string]: 300, ["--on" as string]: "0.9s" }} />
            <path className="lf-neon__tube lf-neon__underline lf-neon__core lf-neon__draw" d="M244 292 Q380 316 516 292" fill="none" style={{ ["--len" as string]: 300, ["--on" as string]: "0.9s" }} />

            {/* hours */}
            <text className="lf-neon__hours lf-neon__lit" x="380" y="356" textAnchor="middle" style={{ ["--on" as string]: "1.4s" }}>REPLIES 9AM–9PM ET</text>
          </g>

          {/* reflection below, flipped + blurred + faded */}
          <use
            className="lf-neon__reflection"
            href="#lf-neon-glyphs"
            transform="matrix(1 0 0 -1 0 718)"
            filter="url(#lf-neon-refl)"
            mask="url(#lf-neon-refl-mask)"
          />
        </svg>
      </div>
    </section>
  );
}
