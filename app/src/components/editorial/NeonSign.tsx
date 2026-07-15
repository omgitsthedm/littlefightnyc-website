import { useScrollReveal } from "./useScrollReveal";
import "./NeonSign.css";

/**
 * NeonSign — a home signature moment: a hand-bent neon "OPEN" shopfront sign in
 * Little Fight orange. The letters are drawn as hollow glass TUBES (stroke, not
 * fill) with a bright core + wide bloom, so it reads like real neon rather than
 * glowing text. It powers on when scrolled into view — tubes trace on, a brief
 * startup flicker, then a steady warm hum.
 *
 * Pure SVG + CSS (no images; Inter + JetBrains Mono are already self-hosted),
 * reduced-motion safe. "OPEN" is the brand statement; the live 9am-9pm state
 * lives in the nav badge.
 */
export default function NeonSign() {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.35 });

  return (
    <section
      ref={ref}
      className="lf-neon"
      data-revealed="false"
      aria-label="Little Fight NYC — open, replies 9am to 9pm Eastern"
    >
      <div className="lf-neon__stage">
        <svg className="lf-neon__svg" viewBox="0 0 760 520" role="img" aria-hidden="true">
          {/* mounting backing panel */}
          <rect className="lf-neon__panel" x="20" y="20" width="720" height="480" rx="26" />

          {/* neon tube frame — a bent-glass border */}
          <rect
            className="lf-neon__tube lf-neon__frame lf-neon__draw"
            x="44" y="44" width="672" height="432" rx="28"
            style={{ ["--len" as string]: 2280, ["--on" as string]: "0.1s" }}
          />
          {/* corner tube joints */}
          <circle className="lf-neon__joint" cx="44" cy="260" r="5" />
          <circle className="lf-neon__joint" cx="716" cy="260" r="5" />

          {/* OPEN — hollow tube caps, centered */}
          <text className="lf-neon__tube lf-neon__word lf-neon__lit" x="380" y="196" textAnchor="middle"
                style={{ ["--on" as string]: "0.9s" }}>OPEN</text>

          {/* brand — tube caps */}
          <text className="lf-neon__tube lf-neon__brand lf-neon__lit" x="380" y="316" textAnchor="middle"
                style={{ ["--on" as string]: "1.25s" }}>LITTLE FIGHT NYC</text>

          {/* underline swash tube */}
          <path className="lf-neon__tube lf-neon__underline lf-neon__draw"
                d="M250 344 Q380 366 510 344" fill="none"
                style={{ ["--len" as string]: 300, ["--on" as string]: "1.1s" }} />

          {/* hours — small, filled (a tube outline would be unreadable this small) */}
          <text className="lf-neon__hours lf-neon__lit" x="380" y="426" textAnchor="middle"
                style={{ ["--on" as string]: "1.7s" }}>REPLIES 9AM–9PM ET</text>
        </svg>
      </div>
    </section>
  );
}
