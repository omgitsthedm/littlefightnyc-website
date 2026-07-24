import { clamp, lerp, eoc } from "@/kernel/motion";
import { rr, glow, DISP, MONO, ORANGE, useInstrumentCanvas } from "./instrument";

/**
 * LeadsCaught — the "business systems" argument, drawn.
 *
 * Leads fall from the four channels a shop actually gets them on — a phone call,
 * a contact form, an Instagram DM, a Saturday walk-in. With nothing catching
 * them (tracked in zero places) they fall straight past and slip away. Then one
 * orange INTAKE LAYER slides in across the bottom; now every falling lead lands
 * on it and slides to FOLLOW-UP — nothing dropped. One causal image: leads slip
 * *because* nothing catches them, and one intake layer catches every one.
 *
 * It illustrates the mechanism, not a statistic — the counts are the leads this
 * animation itself drops vs. catches, so nothing here is a fabricated metric.
 * Mirrors the facts already in the business-systems copy (four channels → one
 * intake layer → follow-up).
 *
 * Rendered on a <canvas> (2D). Responsive to its container shape. Pauses when
 * off-viewport (IntersectionObserver). Under prefers-reduced-motion it paints a
 * single settled frame — the intake layer catching every lead — with no motion.
 */

// The four channels, with the short token label shown on the falling lead.
const SOURCES = ["PHONE", "FORM", "DM", "WALK-IN"] as const;
const TOKEN: Record<(typeof SOURCES)[number], string> = {
  PHONE: "CALL",
  FORM: "FORM",
  DM: "DM",
  "WALK-IN": "WALK-IN",
};

// Phase timing (ms). painMs → the beat → fixMs → hold → loop. Emission is dense
// and continuous (incl. through the beat) so the fall column is never empty.
const T = { pain: 3400, beat: 500, fix: 4400, hold: 1300, emit: 180 };

type Lead = {
  src: number;
  x0: number; // launch x (0..1 of width)
  born: number;
  drift: number;
  // resolved when it reaches the catch line:
  fate: "falling" | "lost" | "caught";
  catchAt: number; // ms it hit the line
  slide: number; // 0..1 progress sliding to follow-up (caught only)
};

type Sim = {
  t0: number;
  phase: 0 | 1 | 2 | 3; // pain | beat | fix | hold
  leads: Lead[];
  lost: number;
  caught: number;
  lastEmit: number;
  seq: number;
  barIn: number; // 0..1 intake bar reveal
  flash: number;
  pulse: number; // follow-up arrival pulse
};

const freshSim = (now: number): Sim => ({
  t0: now,
  phase: 0,
  leads: [],
  lost: 0,
  caught: 0,
  lastEmit: 0,
  seq: 0,
  barIn: 0,
  flash: 0,
  pulse: 0,
});

// Deterministic-ish drift per lead index (no Math.random reliance for testability).
const driftFor = (n: number) => ((n * 2654435761) % 1000) / 1000 - 0.5;

function step(S: Sim, now: number) {
  const pt = now - S.t0;
  S.flash *= 0.88;
  S.pulse *= 0.9;

  const emitting =
    (S.phase === 0 && pt < T.pain - 300) ||
    S.phase === 1 ||
    (S.phase === 2 && pt < T.fix - 700);
  if (emitting && now - S.lastEmit > T.emit) {
    S.lastEmit = now;
    const n = S.seq++;
    S.leads.push({
      src: n % SOURCES.length,
      x0: 0.16 + ((n * 3) % 4) * 0.22 + driftFor(n) * 0.05,
      born: now,
      drift: driftFor(n),
      fate: "falling",
      catchAt: 0,
      slide: 0,
    });
  }

  if (S.phase === 0 && pt > T.pain) {
    S.phase = 1;
    S.t0 = now;
    S.flash = 1;
  } else if (S.phase === 1) {
    S.barIn = clamp(S.barIn + 0.05, 0, 1);
    if (now - S.t0 > T.beat) {
      S.phase = 2;
      S.t0 = now;
    }
  } else if (S.phase === 2) {
    S.barIn = 1;
    if (pt > T.fix) {
      S.phase = 3;
      S.t0 = now;
    }
  } else if (S.phase === 3) {
    if (now - S.t0 > T.hold) Object.assign(S, freshSim(now));
  }

  // resolve leads that cross the catch line (fate decided by whether the bar is up)
  const barUp = S.phase >= 1 && S.barIn > 0.5;
  for (const L of S.leads) {
    if (L.fate !== "falling") {
      if (L.fate === "caught") L.slide = clamp(L.slide + 0.026, 0, 1);
      continue;
    }
    const age = now - L.born;
    const prog = age / 1400; // fall progress toward the catch line at prog≈1
    if (prog >= 1) {
      if (barUp) {
        L.fate = "caught";
        L.catchAt = now;
        S.caught++;
        S.pulse = 1;
        S.flash = Math.max(S.flash, 0.25);
      } else {
        L.fate = "lost";
        L.catchAt = now;
        S.lost++;
      }
    }
  }
  // prune long-gone leads
  if (S.leads.length > 60) S.leads = S.leads.slice(-48);
}

function draw(
  S: Sim,
  cx: CanvasRenderingContext2D,
  W: number,
  H: number,
  GO: HTMLCanvasElement,
  now: number,
) {
  cx.clearRect(0, 0, W, H);
  const wide = W > H * 1.15;

  // layout — in the tall/phone layout the readout owns the top band, so the
  // source rail drops below it (no collision); wide keeps the readout at the base.
  const topY = H * (wide ? 0.16 : 0.2);
  const lineY = H * (wide ? 0.72 : 0.74); // the catch line / intake bar
  const barL = W * 0.08;
  const barR = W * (wide ? 0.74 : 0.9);
  const collX = W * (wide ? 0.85 : 0.5);
  const collY = wide ? lineY : H * 0.9;
  const tw = clamp(W * 0.14, 46, 84); // token width
  const th = tw * 0.4;

  // --- source rail (top) ---
  cx.textAlign = "center";
  cx.textBaseline = "middle";
  for (let i = 0; i < SOURCES.length; i++) {
    const sx = W * (0.16 + i * 0.226);
    cx.fillStyle = "rgba(200,205,215,.55)";
    cx.font = "500 " + Math.max(9, (H * 0.032) | 0) + "px " + MONO;
    cx.fillText(SOURCES[i], sx, topY);
    // small emitter dot
    cx.fillStyle = "rgba(200,205,215,.3)";
    cx.beginPath();
    cx.arc(sx, topY + H * 0.05, 2.2, 0, 7);
    cx.fill();
  }

  // --- the catch line / intake layer ---
  if (S.barIn <= 0) {
    // pain: a faint dashed "nothing here" line so the drop reads as a miss
    cx.strokeStyle = "rgba(255,255,255,.10)";
    cx.lineWidth = 1;
    cx.setLineDash([5, 7]);
    cx.beginPath();
    cx.moveTo(barL, lineY);
    cx.lineTo(barR, lineY);
    cx.stroke();
    cx.setLineDash([]);
  } else {
    const a = eoc(S.barIn);
    const w = (barR - barL) * a;
    // additive glow under the bar
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = 0.32 * a;
    cx.drawImage(GO, barL - 40, lineY - 34, w + 80, 68);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    const bh2 = clamp(H * 0.052, 12, 26);
    const g = cx.createLinearGradient(barL, 0, barL + w, 0);
    g.addColorStop(0, "#fb8b3a");
    g.addColorStop(1, ORANGE);
    cx.fillStyle = g;
    rr(cx, barL, lineY - bh2 / 2, w, bh2, bh2 / 2);
    cx.fill();
    if (a > 0.8) {
      // Label sits just ABOVE the bar so leads landing ON the bar never cover
      // the system's identity — orange is the one signal, keep it legible.
      cx.fillStyle = ORANGE;
      cx.font = "700 " + Math.max(9, (H * 0.034) | 0) + "px " + DISP;
      cx.textAlign = "left";
      cx.textBaseline = "bottom";
      cx.fillText("ONE INTAKE LAYER", barL + 2, lineY - bh2 / 2 - 5);
    }
    // follow-up collector node
    cx.globalAlpha = a;
    const pr = clamp(S.pulse, 0, 1);
    const cr = clamp(H * 0.03, 6, 14) * (1 + pr * 0.3);
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = 0.25 + pr * 0.4;
    cx.drawImage(GO, collX - 34, collY - 34, 68, 68);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.strokeStyle = ORANGE;
    cx.lineWidth = 2;
    cx.beginPath();
    cx.arc(collX, collY, cr, 0, 7);
    cx.stroke();
    cx.fillStyle = "rgba(210,214,222,.9)";
    cx.font = "500 " + Math.max(9, (H * 0.03) | 0) + "px " + MONO;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("FOLLOW-UP", collX, collY + cr + H * 0.05);
    cx.globalAlpha = 1;
  }

  // --- leads ---
  const token = (x: number, y: number, a: number, label: string, tone: "fall" | "caught" | "lost") => {
    cx.save();
    cx.globalAlpha = a;
    cx.shadowColor = "rgba(0,0,0,.4)";
    cx.shadowBlur = 8;
    cx.shadowOffsetY = 3;
    rr(cx, x - tw / 2, y - th / 2, tw, th, th / 2);
    cx.fillStyle =
      tone === "caught" ? "#eaf1ff" : tone === "lost" ? "rgba(150,154,164,.6)" : "#e8eaf0";
    cx.fill();
    cx.shadowColor = "transparent";
    if (tone === "caught") {
      cx.strokeStyle = "rgba(249,115,22,.7)";
      cx.lineWidth = 1.4;
      cx.stroke();
    }
    cx.fillStyle = tone === "lost" ? "rgba(90,94,104,.8)" : "#1a1a1e";
    cx.font = "600 " + Math.max(8, (th * 0.5) | 0) + "px " + MONO;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText(label, x, y + 0.5);
    cx.restore();
  };

  for (const L of S.leads) {
    const label = TOKEN[SOURCES[L.src]];
    const sx = W * L.x0 + L.drift * W * 0.02;
    if (L.fate === "falling") {
      const age = now - L.born;
      const prog = clamp(age / 1400, 0, 1);
      const y = lerp(topY + H * 0.08, lineY, eoc(prog));
      token(sx, y, clamp(age / 160, 0, 1), label, "fall");
    } else if (L.fate === "lost") {
      const age = now - L.catchAt;
      const y = lineY + eoc(clamp(age / 700, 0, 1)) * (H - lineY + 40);
      const a = clamp(1 - age / 700, 0, 1);
      if (a > 0.02) token(sx, y, a * 0.8, label, "lost");
    } else {
      // caught: land on the bar, slide toward the collector, absorb
      const s = eoc(L.slide);
      const x = lerp(sx, collX, s);
      const y = lerp(lineY - th * 0.2, collY, s * s);
      const a = 1 - clamp((L.slide - 0.8) / 0.2, 0, 1);
      if (a > 0.02) token(x, y, a, label, "caught");
    }
  }

  // --- readout ---
  const fixing = S.phase >= 2;
  cx.textAlign = wide ? "left" : "center";
  const rx = wide ? W * 0.08 : W * 0.5;
  const ry = H * (wide ? 0.9 : 0.04);
  if (!fixing) {
    cx.fillStyle = "rgba(200,205,215,.75)";
    cx.font = "500 " + Math.max(9, (H * 0.03) | 0) + "px " + MONO;
    cx.fillText("TRACKED IN 0 PLACES", rx, ry);
    if (S.lost > 0) {
      cx.fillStyle = "#F87171";
      cx.font = "700 " + Math.max(11, (H * 0.05) | 0) + "px " + DISP;
      cx.fillText(S.lost + (S.lost === 1 ? " lead slipped away" : " leads slipped away"), rx, ry + H * 0.06);
    }
  } else {
    cx.fillStyle = "rgba(210,214,222,.8)";
    cx.font = "500 " + Math.max(9, (H * 0.03) | 0) + "px " + MONO;
    cx.fillText("EVERY LEAD CAUGHT", rx, ry);
    cx.fillStyle = "#eaf1ff";
    cx.font = "700 " + Math.max(11, (H * 0.05) | 0) + "px " + DISP;
    cx.fillText(S.caught + " routed to follow-up · 0 lost", rx, ry + H * 0.06);
  }

  if (S.flash > 0.02) {
    cx.fillStyle = "rgba(249,115,22," + S.flash * 0.14 + ")";
    cx.fillRect(0, 0, W, H);
  }
}

// Settled "resolved" frame: the intake layer up, catching every lead — a few
// leads mid-slide toward follow-up plus a couple falling into the bar.
function settledSim(now: number): Sim {
  const S = freshSim(now);
  S.phase = 2;
  S.t0 = now - 400;
  S.barIn = 1;
  S.caught = 6;
  S.leads = [0, 1, 2, 3, 4].map((n) => ({
    src: n % SOURCES.length,
    x0: 0.16 + ((n * 3) % 4) * 0.22,
    born: now - 700 - n * 120,
    drift: driftFor(n),
    fate: n < 3 ? "caught" : "falling",
    catchAt: now - 300,
    slide: n < 3 ? 0.3 + n * 0.22 : 0,
  }));
  return S;
}

export default function LeadsCaught() {
  const { wrapRef, canvasRef } = useInstrumentCanvas((cx) => {
    const GO = glow("rgba(249,115,22,1)", 30);
    let S = freshSim(performance.now());
    return {
      reset: (now) => {
        S = freshSim(now);
      },
      frame: (now, W, H) => {
        step(S, now);
        draw(S, cx, W, H, GO, now);
      },
      still: (now, W, H) => draw(settledSim(now), cx, W, H, GO, now),
    };
  });

  return (
    <div
      ref={wrapRef}
      className="lf-instrument lf-leadscaught"
      style={
        {
          "--lf-instrument-mb": "var(--lf-space-4, 1.5rem)",
          "--lf-instrument-ratio-m": "360 / 420",
          "--lf-instrument-minh-m": "400px",
        } as React.CSSProperties
      }
      role="img"
      aria-label="Leads arrive through phone calls, contact forms, Instagram messages, and Saturday walk-ins. Without one place to track them, they slip away. One intake system catches each lead and routes it to follow-up."
    >
      <canvas ref={canvasRef} className="lf-instrument__canvas" aria-hidden="true" />
    </div>
  );
}
