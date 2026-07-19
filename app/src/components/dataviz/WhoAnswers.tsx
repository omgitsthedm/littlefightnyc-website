import { clamp, lerp, eoc } from "@/kernel/motion";
import { rr, glow, DISP, MONO, ORANGE, RED, GREEN, useInstrumentCanvas } from "./instrument";

/**
 * WhoAnswers — the "IT support" argument, drawn.
 *
 * The tools the day runs on sit healthy; then one breaks (a Saturday-rush
 * register fault). Instead of a ticket into the void, an orange response travels
 * a real-SLA timeline — a person picks up 9am–9pm ET, a callback within 2 hours,
 * on-site within 24 hours when it needs hands — until the tool is back up. One
 * causal image: when it breaks, a human is already moving on it.
 *
 * Every fact drawn (9am–9pm ET, 2-hour callback, on-site within 24 hours) is
 * already in the it-support copy — no invented numbers, and nothing claimed
 * about the incumbent's speed.
 *
 * Rendered on a <canvas> (2D). Responsive to its container shape. Pauses when
 * off-viewport (IntersectionObserver). Under prefers-reduced-motion it paints a
 * single settled frame — the response arrived, the tool back up — with no motion.
 */

const TOOLS = ["REGISTER", "CARD READER", "WI-FI", "WEBSITE"] as const;

// The response spine, left→right. Two milestones are the real SLAs.
const MARKS = [
  { at: 0.42, label: "CALLBACK ≤ 2 HRS" },
  { at: 0.74, label: "ON-SITE ≤ 24 HRS" },
];

const T = { calm: 1500, brk: 1100, respond: 3400, fixed: 1500 };

type Sim = {
  t0: number;
  phase: 0 | 1 | 2 | 3; // calm | break | respond | fixed
  down: number; // which tool faulted
  seq: number;
  travel: number; // 0..1 response position along the spine
  shake: number;
  pulse: number; // milestone-pass pulse
  passed: boolean[];
};

const freshSim = (now: number, seq = 0): Sim => ({
  t0: now,
  phase: 0,
  down: seq % TOOLS.length,
  seq,
  travel: 0,
  shake: 0,
  pulse: 0,
  passed: MARKS.map(() => false),
});

function step(S: Sim, now: number) {
  const pt = now - S.t0;
  S.shake *= 0.9;
  S.pulse *= 0.9;
  if (S.phase === 0) {
    if (pt > T.calm) {
      S.phase = 1;
      S.t0 = now;
      S.shake = 1;
    }
  } else if (S.phase === 1) {
    if (pt > T.brk) {
      S.phase = 2;
      S.t0 = now;
    }
  } else if (S.phase === 2) {
    const p = clamp(pt / T.respond, 0, 1);
    S.travel = eoc(p);
    MARKS.forEach((m, i) => {
      if (!S.passed[i] && S.travel >= m.at) {
        S.passed[i] = true;
        S.pulse = 1;
      }
    });
    if (p >= 1) {
      S.phase = 3;
      S.t0 = now;
    }
  } else {
    S.travel = 1;
    if (pt > T.fixed) Object.assign(S, freshSim(now, S.seq + 1));
  }
}

function draw(
  S: Sim,
  cx: CanvasRenderingContext2D,
  W: number,
  H: number,
  GO: HTMLCanvasElement,
  GG: HTMLCanvasElement,
  GR: HTMLCanvasElement,
  now: number,
) {
  cx.clearRect(0, 0, W, H);
  const wide = W > H * 1.15;

  // layout
  const toolY = H * (wide ? 0.2 : 0.16);
  const spineY = H * (wide ? 0.62 : 0.6);
  const spineL = W * 0.1;
  const spineR = W * 0.9;
  const pw = clamp(W * (wide ? 0.2 : 0.34), 84, wide ? 150 : 132);
  const ph = clamp(H * 0.1, 24, 40);

  // --- tools row ---
  const cols = wide ? TOOLS.length : 2;
  const gapx = (spineR - spineL - pw) / (cols - 1);
  for (let i = 0; i < TOOLS.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tx = spineL + col * gapx + pw / 2;
    const ty = toolY + row * (ph + H * 0.06);
    const isDown = i === S.down && S.phase >= 1 && S.phase < 3;
    const sx = isDown ? Math.sin(now / 40) * S.shake * 3 : 0;
    cx.save();
    cx.translate(tx + sx, ty);
    // pill
    rr(cx, -pw / 2, -ph / 2, pw, ph, ph / 2);
    cx.fillStyle = "rgba(255,255,255,.05)";
    cx.fill();
    cx.strokeStyle = isDown ? "rgba(248,113,113,.7)" : "rgba(255,255,255,.14)";
    cx.lineWidth = 1;
    cx.stroke();
    // status dot
    const dotX = -pw / 2 + ph * 0.5;
    if (isDown) {
      // Red glow on the fault — signal law: orange is reserved for the response.
      cx.globalCompositeOperation = "lighter";
      cx.globalAlpha = 0.5 + S.shake * 0.4;
      cx.drawImage(GR, dotX - 16, -16, 32, 32);
      cx.globalAlpha = 1;
      cx.globalCompositeOperation = "source-over";
      cx.fillStyle = RED;
    } else {
      cx.fillStyle = GREEN;
    }
    cx.beginPath();
    cx.arc(dotX, 0, ph * 0.14, 0, 7);
    cx.fill();
    // label
    cx.fillStyle = isDown ? "rgba(248,113,113,.95)" : "rgba(220,224,232,.85)";
    cx.font = "600 " + Math.max(9, (ph * 0.32) | 0) + "px " + MONO;
    cx.textAlign = "left";
    cx.textBaseline = "middle";
    cx.fillText(isDown ? TOOLS[i] + " · DOWN" : TOOLS[i], dotX + ph * 0.28, 0);
    cx.restore();
  }

  // --- response spine ---
  const active = S.phase >= 1;
  // base line
  cx.strokeStyle = "rgba(255,255,255,.12)";
  cx.lineWidth = 2;
  cx.beginPath();
  cx.moveTo(spineL, spineY);
  cx.lineTo(spineR, spineY);
  cx.stroke();
  // filled (orange) portion up to travel
  if (active) {
    const fx = lerp(spineL, spineR, S.travel);
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = 0.28;
    cx.drawImage(GO, spineL - 30, spineY - 22, fx - spineL + 60, 44);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.strokeStyle = ORANGE;
    cx.lineWidth = 3;
    cx.beginPath();
    cx.moveTo(spineL, spineY);
    cx.lineTo(fx, spineY);
    cx.stroke();
  }
  // start node (the break) + end node (fixed)
  const nodeR = clamp(H * 0.028, 6, 12);
  // break node
  cx.fillStyle = active ? RED : "rgba(255,255,255,.3)";
  cx.beginPath();
  cx.arc(spineL, spineY, nodeR, 0, 7);
  cx.fill();
  cx.fillStyle = active ? "rgba(248,113,113,.95)" : "rgba(200,205,215,.6)";
  cx.font = "700 " + Math.max(9, (H * 0.032) | 0) + "px " + DISP;
  cx.textAlign = "left";
  cx.textBaseline = "top";
  cx.fillText("IT BREAKS", spineL - nodeR, spineY + nodeR + 4);
  // fixed node
  const fixed = S.phase === 3;
  cx.fillStyle = fixed ? GREEN : "rgba(255,255,255,.14)";
  cx.beginPath();
  cx.arc(spineR, spineY, nodeR, 0, 7);
  cx.fill();
  if (fixed) {
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = 0.5;
    cx.drawImage(GG, spineR - 22, spineY - 22, 44, 44);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.strokeStyle = "#0a0a0c";
    cx.lineWidth = 2;
    cx.lineCap = "round";
    cx.beginPath();
    cx.moveTo(spineR - nodeR * 0.45, spineY);
    cx.lineTo(spineR - nodeR * 0.05, spineY + nodeR * 0.4);
    cx.lineTo(spineR + nodeR * 0.5, spineY - nodeR * 0.45);
    cx.stroke();
  }
  cx.fillStyle = fixed ? "rgba(120,220,150,.95)" : "rgba(200,205,215,.55)";
  cx.font = "700 " + Math.max(9, (H * 0.032) | 0) + "px " + DISP;
  cx.textAlign = "right";
  cx.textBaseline = "top";
  cx.fillText("BACK UP", spineR + nodeR, spineY + nodeR + 4);

  // milestone ticks
  MARKS.forEach((m, i) => {
    const mx = lerp(spineL, spineR, m.at);
    const passed = S.passed[i];
    const pr = passed ? clamp(S.pulse, 0, 1) : 0;
    cx.strokeStyle = passed ? ORANGE : "rgba(255,255,255,.2)";
    cx.lineWidth = passed ? 2 : 1;
    cx.beginPath();
    cx.moveTo(mx, spineY - nodeR * 1.4);
    cx.lineTo(mx, spineY + nodeR * 1.4);
    cx.stroke();
    if (pr > 0.02) {
      cx.globalCompositeOperation = "lighter";
      cx.globalAlpha = pr * 0.5;
      cx.drawImage(GO, mx - 20, spineY - 20, 40, 40);
      cx.globalAlpha = 1;
      cx.globalCompositeOperation = "source-over";
    }
    cx.fillStyle = passed ? "rgba(250,180,120,.95)" : "rgba(190,195,205,.6)";
    cx.font = "500 " + Math.max(8, (H * (wide ? 0.028 : 0.024)) | 0) + "px " + MONO;
    cx.textAlign = "center";
    // Narrow spine can't fit both labels on one line — stagger them. The
    // higher-x milestone goes ABOVE (the end labels IT BREAKS / BACK UP sit
    // below the spine, so a below label near the end would collide with them);
    // the middle one goes below, clear of everything. Wide keeps both above.
    const above = wide || i % 2 === 1;
    cx.textBaseline = above ? "bottom" : "top";
    cx.fillText(m.label, mx, above ? spineY - nodeR * 1.7 : spineY + nodeR * 1.7);
  });

  // travelling response dot (a person, moving)
  if (S.phase === 2) {
    const dx = lerp(spineL, spineR, S.travel);
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = 0.7;
    cx.drawImage(GO, dx - 22, spineY - 22, 44, 44);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.fillStyle = ORANGE;
    cx.beginPath();
    cx.arc(dx, spineY, nodeR * 0.7, 0, 7);
    cx.fill();
  }

  // --- readout ---
  cx.textAlign = wide ? "left" : "center";
  const rx = wide ? spineL : W * 0.5;
  const ry = H * (wide ? 0.86 : 0.86);
  // Shorter strings on the narrow layout so the readout never clips the frame.
  let label = "EVERY TOOL RUNNING";
  let line = "The day runs on these.";
  let tone = "rgba(220,224,232,.9)";
  if (S.phase === 1) {
    label = "SOMETHING BREAKS";
    line = wide ? TOOLS[S.down] + " goes down mid-day." : TOOLS[S.down] + " just went down.";
    tone = RED;
  } else if (S.phase === 2) {
    label = wide ? "A REAL PERSON PICKS UP · 9AM–9PM ET" : "A REAL PERSON · 9AM–9PM ET";
    line = wide ? "Not a ticket into the void — someone's already on it." : "Someone's already on it.";
    tone = "rgba(250,190,140,.95)";
  } else if (S.phase === 3) {
    label = "BACK UP";
    line = wide ? "A human had it, start to finish." : "A human had it.";
    tone = "rgba(120,220,150,.95)";
  }
  cx.fillStyle = "rgba(190,195,205,.7)";
  cx.font = "500 " + Math.max(9, (H * (wide ? 0.03 : 0.026)) | 0) + "px " + MONO;
  cx.textBaseline = "alphabetic";
  cx.fillText(label, rx, ry);
  cx.fillStyle = tone;
  cx.font = "700 " + Math.max(11, (H * (wide ? 0.05 : 0.044)) | 0) + "px " + DISP;
  cx.fillText(line, rx, ry + H * 0.065);
}

// Settled "resolved" frame: the response arrived, the tool back up.
function settledSim(now: number): Sim {
  const S = freshSim(now);
  S.phase = 3;
  S.t0 = now - 200;
  S.travel = 1;
  S.passed = MARKS.map(() => true);
  return S;
}

export default function WhoAnswers() {
  const { wrapRef, canvasRef } = useInstrumentCanvas((cx) => {
    const GO = glow("rgba(249,115,22,1)", 30);
    const GG = glow("rgba(74,222,128,1)", 30);
    const GR = glow("rgba(248,113,113,1)", 30);
    let S = freshSim(performance.now());
    return {
      reset: (now) => {
        S = freshSim(now);
      },
      frame: (now, W, H) => {
        step(S, now);
        draw(S, cx, W, H, GO, GG, GR, now);
      },
      still: (now, W, H) => draw(settledSim(now), cx, W, H, GO, GG, GR, now),
    };
  });

  return (
    <div
      ref={wrapRef}
      className="lf-instrument lf-whoanswers"
      style={
        {
          "--lf-instrument-mb": "var(--lf-space-4, 1.5rem)",
          "--lf-instrument-ratio-m": "360 / 400",
          "--lf-instrument-minh-m": "380px",
        } as React.CSSProperties
      }
      role="img"
      aria-label="Animation: the tools a shop runs on — register, card reader, Wi-Fi, website — sit healthy; then one goes down mid-day. Instead of a ticket into the void, an orange response moves along a timeline: a real person picks up 9am to 9pm Eastern, a callback within 2 hours, on-site within 24 hours when it needs hands — until the tool is back up."
    >
      <canvas ref={canvasRef} className="lf-instrument__canvas" aria-hidden="true" />
    </div>
  );
}
