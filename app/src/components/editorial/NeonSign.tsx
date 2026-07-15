import { useScrollReveal } from "./useScrollReveal";
import { useOpenNow } from "@/lib/openNow";
import "./NeonSign.css";

/**
 * NeonSign — a home signature moment: hand-bent neon "OPEN" in Little Fight
 * orange. Letters are hollow glass TUBES (stroke, not fill) with a bright gas
 * core + wide bloom, so it reads like real neon. Frameless — the tubes and a
 * hand-bent underline swash stand alone, bar-sign style.
 *
 * Tied to real availability, inverted like a night sign: it runs DIM while
 * we're reachable (9am-9pm ET, daytime) and blazes to full glow after hours,
 * when a neon sign is most alive. Powers on when scrolled into view (draw +
 * ignite), then settles to the current state. Pure SVG + CSS, reduced-motion
 * safe, ~2KB.
 */
export default function NeonSign() {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.35 });
  const openNow = useOpenNow();

  return (
    <section
      ref={ref}
      className="lf-neon"
      data-revealed="false"
      data-open={openNow.open ? "true" : "false"}
      aria-label={`Little Fight NYC. ${openNow.sentence}`}
    >
      <div className="lf-neon__stage">
        <svg className="lf-neon__svg" viewBox="0 0 760 400" role="img" aria-hidden="true">
          {/* OPEN — hollow tube caps, centered */}
          <text className="lf-neon__tube lf-neon__word lf-neon__lit" x="380" y="150" textAnchor="middle"
                style={{ ["--on" as string]: "0.6s" }}>OPEN</text>

          {/* brand — tube caps */}
          <text className="lf-neon__tube lf-neon__brand lf-neon__lit" x="380" y="262" textAnchor="middle"
                style={{ ["--on" as string]: "1s" }}>LITTLE FIGHT NYC</text>

          {/* hand-bent underline swash */}
          <path className="lf-neon__tube lf-neon__underline lf-neon__draw"
                d="M244 292 Q380 316 516 292" fill="none"
                style={{ ["--len" as string]: 300, ["--on" as string]: "0.9s" }} />

          {/* hours — small, filled */}
          <text className="lf-neon__hours lf-neon__lit" x="380" y="356" textAnchor="middle"
                style={{ ["--on" as string]: "1.4s" }}>REPLIES 9AM–9PM ET</text>
        </svg>
      </div>
    </section>
  );
}
