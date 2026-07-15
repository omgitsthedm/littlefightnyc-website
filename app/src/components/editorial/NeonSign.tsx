import { useScrollReveal } from "./useScrollReveal";
import "./NeonSign.css";

/**
 * NeonSign — a home signature moment. A neon-orange "OPEN" shopfront sign that
 * powers on (draws its tubes, then flickers to life) the moment it scrolls into
 * view, then holds with a slow neon buzz. Pure SVG + CSS — no images, no extra
 * fonts (Inter/JetBrains Mono are already self-hosted), reduced-motion safe
 * (the reveal hook flags it revealed immediately and the CSS shows it steady).
 *
 * "OPEN" is the brand statement — Little Fight is open for New York's small
 * businesses. The live 9am-9pm availability stays in the nav badge; wiring this
 * sign to that state is a small follow-up if we want it to dim after hours.
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
        <svg className="lf-neon__svg" viewBox="0 0 800 500" role="img" aria-hidden="true">
          {/* frame */}
          <rect
            className="lf-neon__tube lf-neon__frame lf-neon__draw"
            x="34" y="34" width="732" height="432" rx="24"
            style={{ ["--len" as string]: 2420 }}
          />
          {/* mounting screws */}
          <circle className="lf-neon__screw" cx="60" cy="250" r="6" />
          <circle className="lf-neon__screw" cx="740" cy="250" r="6" />

          {/* OPEN — the hook, with a live dot */}
          <g className="lf-neon__lit lf-neon__flicker" style={{ ["--on" as string]: "0.9s" }}>
            <circle className="lf-neon__dot" cx="252" cy="140" r="12" />
            <text className="lf-neon__word" x="420" y="182" textAnchor="middle">OPEN</text>
          </g>

          {/* brand */}
          <g className="lf-neon__lit" style={{ ["--on" as string]: "1.2s" }}>
            <text className="lf-neon__brand" x="400" y="300" textAnchor="middle">
              LITTLE FIGHT NYC
            </text>
          </g>

          {/* underline tube */}
          <path
            className="lf-neon__tube lf-neon__underline lf-neon__draw"
            d="M232 330 H568"
            style={{ ["--len" as string]: 340, ["--on" as string]: "0.9s" }}
          />

          {/* hours */}
          <g className="lf-neon__lit" style={{ ["--on" as string]: "1.6s" }}>
            <text className="lf-neon__mono" x="400" y="410" textAnchor="middle">
              REPLIES 9AM–9PM ET
            </text>
          </g>
        </svg>
      </div>
    </section>
  );
}
