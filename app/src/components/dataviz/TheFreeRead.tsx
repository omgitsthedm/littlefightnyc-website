import { clamp, lerp, eoc, eio } from "@/kernel/motion";
import { rr, glow, DISP, MONO, ORANGE, useInstrumentCanvas } from "./instrument";

/**
 * TheFreeRead — the "tech consulting" argument, drawn.
 *
 * Four lanes feed the free read — the tool stack + costs, the website, the
 * Google profile + lead path, the workflow. Out come the findings, which then
 * SORT themselves into one ranked punch list: what to fix first, ranked by
 * customer impact, then cost, then what can wait. One causal image: you don't
 * get a pile of problems, you get an ordered list — and the first hour is free.
 *
 * Distinct from AuditBench (which consolidates scattered problems into one
 * system): this instrument's mechanic is PRIORITISATION — the list ranks itself.
 * Every fact drawn (four lanes; ranked by impact/cost/can-wait; first hour free)
 * is already in the tech-consulting copy.
 *
 * Rendered on a <canvas> (2D). Responsive to its container shape. Pauses when
 * off-viewport (IntersectionObserver). Under prefers-reduced-motion it paints a
 * single settled frame — the finished ranked list — with no motion.
 */

const LANES = ["TOOL STACK + COSTS", "WEBSITE", "GOOGLE + LEADS", "WORKFLOW"] as const;
// Short labels for the tall/phone layout, where four full labels won't fit across.
const LANES_SHORT = ["TOOLS + $", "SITE", "GOOGLE", "WORKFLOW"] as const;

// Findings, in FINAL ranked order (index = rank). Scatter order is a fixed
// permutation so they visibly re-order into this. Tags mirror the copy's ranking
// axes (customer impact → cost → can wait). Generic themes, no fabricated stats.
const FINDINGS = [
  { label: "Site slow on phones", tag: "IMPACT", scatter: 3 },
  { label: "Missing from the map pack", tag: "IMPACT", scatter: 0 },
  { label: "Leads never followed up", tag: "IMPACT", scatter: 4 },
  { label: "Paying for duplicate tools", tag: "COST", scatter: 1 },
  { label: "Manual data entry", tag: "LATER", scatter: 2 },
] as const;

const T = { read: 2400, rank: 2600, hold: 1700 };

type Sim = {
  t0: number;
  phase: 0 | 1 | 2; // read | rank | hold
  scan: number; // 0..1 read sweep
  sort: number; // 0..1 list ranking
  pulse: number;
};

const freshSim = (now: number): Sim => ({ t0: now, phase: 0, scan: 0, sort: 0, pulse: 0 });

function step(S: Sim, now: number) {
  const pt = now - S.t0;
  S.pulse *= 0.92;
  if (S.phase === 0) {
    S.scan = clamp(pt / T.read, 0, 1);
    if (pt > T.read) {
      S.phase = 1;
      S.t0 = now;
      S.pulse = 1;
    }
  } else if (S.phase === 1) {
    S.scan = 1;
    S.sort = clamp(pt / T.rank, 0, 1);
    if (pt > T.rank) {
      S.phase = 2;
      S.t0 = now;
    }
  } else {
    S.scan = 1;
    S.sort = 1;
    if (pt > T.hold) Object.assign(S, freshSim(now));
  }
}

function draw(S: Sim, cx: CanvasRenderingContext2D, W: number, H: number, GO: HTMLCanvasElement) {
  cx.clearRect(0, 0, W, H);
  const wide = W > H * 1.15;

  // layout: lanes (left/top) → read node (mid) → ranked list (right/bottom)
  let laneX: number, laneY0: number, laneGap: number, laneVertical: boolean;
  let readX: number, readY: number;
  let listX: number, listY: number, listW: number, rowH: number;
  if (wide) {
    laneVertical = true;
    laneX = W * 0.04;
    laneY0 = H * 0.16;
    laneGap = H * 0.17; /* lanes 0.16→0.67H — clear of the readout at 0.82H */
    readX = W * 0.4;
    readY = H * 0.46;
    listX = W * 0.54;
    listY = H * 0.12;
    listW = W * 0.42;
    rowH = H * 0.16;
  } else {
    laneVertical = false;
    laneX = W * 0.095;
    laneY0 = H * 0.07;
    laneGap = W * 0.265;
    readX = W * 0.5;
    readY = H * 0.26;
    listX = W * 0.08;
    listY = H * 0.38;
    listW = W * 0.84;
    rowH = H * 0.1;
  }

  // --- input lanes ---
  cx.textBaseline = "middle";
  for (let i = 0; i < LANES.length; i++) {
    const lx = laneVertical ? laneX : laneX + i * laneGap;
    const ly = laneVertical ? laneY0 + i * laneGap : laneY0;
    cx.fillStyle = "rgba(200,205,215,.6)";
    cx.font = "500 " + Math.max(8, (H * (wide ? 0.028 : 0.022)) | 0) + "px " + MONO;
    cx.textAlign = laneVertical ? "left" : "center";
    cx.fillText(laneVertical ? LANES[i] : LANES_SHORT[i], lx, ly);
    // flow line toward the read node — fills as the scan runs
    const sx = laneVertical ? lx + W * 0.14 : lx;
    const sy = laneVertical ? ly : ly + H * 0.05;
    cx.strokeStyle = "rgba(255,255,255,.10)";
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(sx, sy);
    cx.lineTo(readX, readY);
    cx.stroke();
    const fp = clamp(S.scan * 1.3 - i * 0.08, 0, 1);
    if (fp > 0) {
      cx.strokeStyle = "rgba(249,115,22,.55)";
      cx.lineWidth = 1.5;
      cx.beginPath();
      cx.moveTo(sx, sy);
      cx.lineTo(lerp(sx, readX, fp), lerp(sy, readY, fp));
      cx.stroke();
    }
  }

  // --- read node (the free read / diagnostic lens) ---
  const rr0 = clamp(H * 0.055, 14, 30);
  const scanPulse = S.phase === 0 ? 0.5 + 0.5 * Math.abs(Math.sin(S.scan * Math.PI * 3)) : 0.4;
  cx.globalCompositeOperation = "lighter";
  cx.globalAlpha = 0.3 + scanPulse * 0.3;
  cx.drawImage(GO, readX - rr0 * 1.6, readY - rr0 * 1.6, rr0 * 3.2, rr0 * 3.2);
  cx.globalAlpha = 1;
  cx.globalCompositeOperation = "source-over";
  cx.strokeStyle = ORANGE;
  cx.lineWidth = 2;
  cx.beginPath();
  cx.arc(readX, readY, rr0, 0, 7);
  cx.stroke();
  cx.fillStyle = "rgba(250,190,140,.95)";
  cx.font = "700 " + Math.max(9, (rr0 * 0.5) | 0) + "px " + DISP;
  cx.textAlign = "center";
  cx.textBaseline = "middle";
  cx.fillText("THE", readX, readY - rr0 * 0.24);
  cx.fillText("READ", readX, readY + rr0 * 0.28);

  // --- ranked list ---
  const tagColor = (tag: string) =>
    tag === "IMPACT" ? "rgba(250,190,140,.95)" : tag === "COST" ? "rgba(200,205,215,.85)" : "rgba(150,154,164,.8)";
  // items emerge during read (unsorted), then sort during rank.
  FINDINGS.forEach((f, rank) => {
    const emerge = clamp((S.scan - 0.35) / 0.5 - rank * 0.06, 0, 1);
    if (emerge <= 0.01) return;
    const scatteredY = listY + f.scatter * rowH;
    const rankedY = listY + rank * rowH;
    const sp = eio(clamp((S.sort - rank * 0.04) / 0.72, 0, 1));
    const y = lerp(scatteredY, rankedY, sp);
    const a = eoc(emerge);
    const top = S.sort > 0.6 && rank === 0;
    const rh = rowH * 0.78;
    cx.save();
    cx.globalAlpha = a;
    cx.translate(listX, y);
    // row card
    rr(cx, 0, 0, listW, rh, 6);
    cx.fillStyle = top ? "rgba(249,115,22,.14)" : "rgba(255,255,255,.05)";
    cx.fill();
    cx.strokeStyle = top ? "rgba(249,115,22,.6)" : "rgba(255,255,255,.12)";
    cx.lineWidth = 1;
    cx.stroke();
    // rank badge (appears as it sorts)
    const badge = rh * 0.62;
    const bx = rh * 0.5;
    rr(cx, rh * 0.2, (rh - badge) / 2, badge, badge, 4);
    cx.fillStyle = top ? ORANGE : "rgba(255,255,255,.1)";
    cx.fill();
    cx.fillStyle = top ? "#141008" : "rgba(220,224,232,.9)";
    cx.font = "700 " + Math.max(9, (badge * 0.6) | 0) + "px " + DISP;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText(S.sort > 0.15 ? String(rank + 1) : "·", rh * 0.2 + badge / 2, rh / 2 + 0.5);
    // label
    cx.fillStyle = "rgba(230,233,240,.95)";
    cx.font = "600 " + Math.max(10, (rh * 0.34) | 0) + "px " + DISP;
    cx.textAlign = "left";
    cx.fillText(f.label, bx + badge, rh / 2);
    // priority tag (right)
    cx.fillStyle = tagColor(f.tag);
    cx.font = "500 " + Math.max(8, (rh * 0.26) | 0) + "px " + MONO;
    cx.textAlign = "right";
    cx.fillText(f.tag, listW - 10, rh / 2);
    cx.restore();
  });

  // --- readout ---
  const done = S.phase === 2 || S.sort > 0.9;
  cx.textAlign = wide ? "left" : "center";
  const rx = wide ? W * 0.04 : W * 0.5;
  const ry = wide ? H * 0.82 : H * 0.9;
  cx.textBaseline = "alphabetic";
  cx.fillStyle = "rgba(190,195,205,.7)";
  cx.font = "500 " + Math.max(9, (H * 0.028) | 0) + "px " + MONO;
  cx.fillText(done ? "ONE RANKED PUNCH LIST" : "READING…", rx, ry);
  cx.fillStyle = done ? "rgba(250,190,140,.95)" : "rgba(200,205,215,.85)";
  cx.font = "700 " + Math.max(11, (H * 0.046) | 0) + "px " + DISP;
  cx.fillText(done ? "What to fix first. First hour free." : "Four lanes in.", rx, ry + H * 0.058);
}

// Settled "sorted" frame: the finished ranked punch list.
function settledSim(now: number): Sim {
  const S = freshSim(now);
  S.phase = 2;
  S.scan = 1;
  S.sort = 1;
  return S;
}

export default function TheFreeRead() {
  const { wrapRef, canvasRef } = useInstrumentCanvas((cx) => {
    const GO = glow("rgba(249,115,22,1)", 30);
    let S = freshSim(performance.now());
    return {
      reset: (now) => {
        S = freshSim(now);
      },
      frame: (now, W, H) => {
        step(S, now);
        draw(S, cx, W, H, GO);
      },
      still: (now, W, H) => draw(settledSim(now), cx, W, H, GO),
    };
  });

  return (
    <div
      ref={wrapRef}
      className="lf-instrument lf-freeread"
      style={
        {
          "--lf-instrument-mb": "var(--lf-space-4, 1.5rem)",
          "--lf-instrument-ratio-m": "360 / 430",
          "--lf-instrument-minh-m": "410px",
        } as React.CSSProperties
      }
      role="img"
      aria-label="Animation: four lanes — the tool stack and costs, the website, the Google profile and lead path, and the workflow — feed the free read; the findings then sort themselves into one ranked punch list, ordered by customer impact, then cost, then what can wait, with the top item to fix first highlighted. The first hour is free."
    >
      <canvas ref={canvasRef} className="lf-instrument__canvas" aria-hidden="true" />
    </div>
  );
}
