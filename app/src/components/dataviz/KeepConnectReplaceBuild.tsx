import { clamp, lerp, eoc, eic } from "@/kernel/motion";
import { rr, glow, DISP, MONO, useInstrumentCanvas } from "./instrument";

/**
 * KeepConnectReplaceBuild — the systemic verbs (Small Craft doctrine, Part Five).
 *
 * The brand's promise made physical: a shop's scattered tools resolve through the
 * four verbs — KEEP what works (orange), CONNECT what matters (blue links + a
 * travelling pulse), REPLACE what drags (dissolve → clean), BUILD what fits (the
 * survivors consolidate into ONE owned system, the house Many→One motion).
 *
 * Instrument #2 on the shared canvas harness (MoneyLeaving is #1): two-role
 * canvas, cached additive-glow sprites, DPR scaling, IntersectionObserver pause,
 * reduced-motion still frame (the owned end-state), literal font families
 * (ctx.font can't parse CSS var()). Curves come from the motion grammar.
 */

type Tool = { n: string };
const TOOLS: Tool[] = [{ n: "BOOKING" }, { n: "POS" }, { n: "EMAIL" }, { n: "CRM" }, { n: "SHEETS" }, { n: "INVOICES" }];
const KEEP = [0, 1];
const CONN = [2, 3];
const DRAG = [4, 5];
const LINKS: [number, number][] = [
  [0, 2],
  [1, 3],
  [0, 1],
  [2, 3],
];
const T = { intro: 800, keep: 1400, connect: 1600, replace: 1600, build: 1800, hold: 2600 };
const ORDER = ["intro", "keep", "connect", "replace", "build", "hold"] as const;
type Phase = (typeof ORDER)[number];
const TOTAL = ORDER.reduce((s, k) => s + T[k], 0);

function phaseAt(pt: number): [Phase, number] {
  let acc = 0;
  for (const k of ORDER) {
    if (pt < acc + T[k]) return [k, (pt - acc) / T[k]];
    acc += T[k];
  }
  return ["hold", 1];
}

type Pos = { x: number; y: number; rot: number };
type Scene = { W: number; H: number; mx: number; my: number; tw: number; th: number; pos: Pos[] };

function layout(W: number, H: number): Scene {
  const mx = W * 0.5;
  const my = H * 0.58;
  const tw = Math.min(W * 0.28, 96);
  const th = tw * 0.46;
  const R = Math.min(W * 0.33, H * 0.31);
  const pos = TOOLS.map((_, i) => {
    const a = ((-96 + i * 60 + (i % 2 ? 16 : -12)) * Math.PI) / 180;
    return {
      x: mx + Math.cos(a) * R * (0.92 + (i % 3) * 0.05),
      y: my + Math.sin(a) * R * 0.7 * (0.9 + (i % 2) * 0.12),
      rot: (i % 2 ? 1 : -1) * 0.09,
    };
  });
  return { W, H, mx, my, tw, th, pos };
}

function tile(
  cx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rot: number,
  alpha: number,
  label: string,
  border: string,
  fill: string,
  txt: string,
) {
  if (alpha <= 0.01) return;
  cx.save();
  cx.globalAlpha = alpha;
  cx.translate(x, y);
  cx.rotate(rot);
  cx.shadowColor = "rgba(0,0,0,.5)";
  cx.shadowBlur = 11;
  cx.shadowOffsetY = 4;
  rr(cx, -w / 2, -h / 2, w, h, 7);
  cx.fillStyle = fill;
  cx.fill();
  cx.shadowColor = "transparent";
  cx.lineWidth = 1.6;
  cx.strokeStyle = border;
  cx.stroke();
  cx.fillStyle = txt;
  cx.font = "600 " + ((h * 0.32) | 0) + "px " + MONO;
  cx.textAlign = "center";
  cx.textBaseline = "middle";
  cx.fillText(label, 0, 1);
  cx.restore();
}

const VERBS: Record<Phase, [string, string]> = {
  intro: ["", "A shop runs on scattered tools."],
  keep: ["KEEP", "what works."],
  connect: ["CONNECT", "what matters."],
  replace: ["REPLACE", "what drags."],
  build: ["BUILD", "what fits."],
  hold: ["ONE SYSTEM", "You own it."],
};

function draw(
  sc: Scene,
  cx: CanvasRenderingContext2D,
  pt: number,
  GO: HTMLCanvasElement,
) {
  const { W, H, mx, my, tw, th, pos: P } = sc;
  const [ph, f] = phaseAt(pt);
  const idx = ORDER.indexOf(ph);
  const on = (k: Phase) => ph === k;
  const reached = (k: Phase) => idx >= ORDER.indexOf(k);
  const building = reached("build");
  cx.clearRect(0, 0, W, H);

  // tangle (mess) lines — present in intro, fade during keep
  const tangle = on("intro") ? clamp(f * 2, 0, 1) : on("keep") ? 1 - eoc(f) : 0;
  if (tangle > 0.01 && !building) {
    cx.strokeStyle = "rgba(248,113,113," + 0.22 * tangle + ")";
    cx.lineWidth = 1;
    const tl: [number, number][] = [
      [0, 4],
      [4, 2],
      [2, 5],
      [5, 1],
      [1, 3],
      [3, 0],
    ];
    for (const [a, b] of tl) {
      cx.beginPath();
      cx.moveTo(P[a].x, P[a].y);
      cx.lineTo(P[b].x, P[b].y);
      cx.stroke();
    }
  }

  // connector lines — draw in during connect, persist until build
  if (reached("connect") && !building) {
    const prog = on("connect") ? eoc(clamp(f * 1.15, 0, 1)) : 1;
    LINKS.forEach(([a, b], i) => {
      const p = clamp(prog * 1.25 - i * 0.09, 0, 1);
      if (p <= 0) return;
      cx.strokeStyle = "rgba(249,115,22," + (on("connect") ? 0.5 : 0.34) + ")";
      cx.lineWidth = 1.6;
      cx.beginPath();
      cx.moveTo(P[a].x, P[a].y);
      cx.lineTo(lerp(P[a].x, P[b].x, p), lerp(P[a].y, P[b].y, p));
      cx.stroke();
      if (on("connect")) {
        const pp = (f * 1.5 + i * 0.25) % 1;
        cx.globalCompositeOperation = "lighter";
        cx.drawImage(GO, lerp(P[a].x, P[b].x, pp) - 8, lerp(P[a].y, P[b].y, pp) - 8, 16, 16);
        cx.globalCompositeOperation = "source-over";
      }
    });
  }

  if (!building) {
    TOOLS.forEach((t, i) => {
      let alpha = 1;
      let border = "rgba(150,160,175,.4)";
      let fill = "rgba(40,44,54,.96)";
      let txt = "#e8ecf2";
      let label = t.n;
      if (on("intro")) alpha = clamp(f * 2.2 - i * 0.12, 0, 1);
      if (reached("keep")) {
        if (KEEP.includes(i)) {
          const sw = on("keep") ? eoc(clamp(f * 1.4 - KEEP.indexOf(i) * 0.2, 0, 1)) : 1;
          border = `rgba(249,115,22,${0.5 + 0.4 * sw})`;
          fill = "rgba(46,40,32,.96)";
        } else if (CONN.includes(i)) {
          if (reached("connect")) {
            const sw = on("connect") ? eoc(clamp(f * 1.4, 0, 1)) : 1;
            border = `rgba(59,130,246,${0.45 + 0.4 * sw})`;
            fill = "rgba(32,38,50,.96)";
          } else {
            alpha *= 0.82;
          }
        } else if (DRAG.includes(i)) {
          if (reached("replace")) {
            if (on("replace")) {
              const df = clamp(f * 1.5 - DRAG.indexOf(i) * 0.18, 0, 1);
              tile(cx, P[i].x, P[i].y, tw * (1 - 0.2 * eic(df)), th, P[i].rot, (1 - eic(df)) * 0.8, t.n, "rgba(120,128,140,.3)", "rgba(26,28,36,.9)", "rgba(160,168,180,.5)");
              label = "BUILT";
              border = `rgba(249,115,22,${0.4 * eoc(df)})`;
              fill = "rgba(44,40,34,.96)";
              alpha = eoc(df);
            } else {
              label = "BUILT";
              border = "rgba(249,115,22,.5)";
              fill = "rgba(44,40,34,.96)";
            }
          } else {
            alpha *= 0.5;
            border = "rgba(120,128,140,.25)";
            fill = "rgba(26,28,36,.9)";
            txt = "rgba(150,158,170,.5)";
          }
        }
      }
      const rot = on("intro") ? P[i].rot * (1 - eoc(f)) : reached("keep") ? 0 : P[i].rot;
      tile(cx, P[i].x, P[i].y, tw, th, rot, alpha, label, border, fill, txt);
    });
  } else {
    // BUILD: survivors fly to center + shrink; one owned unit grows in
    const bf = on("build") ? eoc(f) : 1;
    for (let i = 0; i < TOOLS.length; i++) {
      const x = lerp(P[i].x, mx, bf);
      const y = lerp(P[i].y, my, bf);
      tile(cx, x, y, tw * (1 - 0.35 * bf), th * (1 - 0.35 * bf), 0, (1 - bf) * 0.85, TOOLS[i].n, "rgba(249,115,22,.4)", "rgba(44,40,34,.9)", "#e8ecf2");
    }
    const uw = Math.min(W * 0.42, 176);
    const uh = uw * 0.42;
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = bf * 0.55;
    cx.drawImage(GO, mx - uw, my - uh, uw * 2, uh * 2);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.save();
    cx.globalAlpha = bf;
    cx.translate(mx, my);
    const w = uw * (0.55 + 0.45 * bf);
    const h = uh * (0.55 + 0.45 * bf);
    cx.shadowColor = "rgba(0,0,0,.5)";
    cx.shadowBlur = 16;
    cx.shadowOffsetY = 6;
    rr(cx, -w / 2, -h / 2, w, h, 10);
    const g = cx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, "#F5B841");
    g.addColorStop(0.5, "#F97316");
    g.addColorStop(1, "#F5B841");
    cx.fillStyle = g;
    cx.fill();
    cx.shadowColor = "transparent";
    cx.fillStyle = "#1a1a1e";
    cx.font = "700 " + ((h * 0.3) | 0) + "px " + DISP;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("ONE SYSTEM", 0, 1);
    cx.restore();
  }

  // verb + caption
  const [verb, cap] = VERBS[ph];
  const fs = Math.min(W * 0.09, 36);
  const vy = H * 0.14;
  cx.textAlign = "center";
  if (verb) {
    cx.globalAlpha = on(ph) && ph !== "hold" ? clamp(f * 5, 0, 1) * clamp((1 - f) * 5, 0.5, 1) : 1;
    cx.fillStyle = ph === "hold" || ph === "build" ? "#F97316" : "#fff";
    cx.font = "700 " + (fs | 0) + "px " + DISP;
    cx.textBaseline = "alphabetic";
    cx.fillText(verb, mx, vy);
    cx.globalAlpha = 1;
  }
  cx.fillStyle = "rgba(200,205,215,.82)";
  cx.font = "300 " + ((fs * 0.44) | 0) + "px " + DISP;
  cx.fillText(cap, mx, vy + fs * 0.5);
}

export default function KeepConnectReplaceBuild() {
  const { wrapRef, canvasRef } = useInstrumentCanvas((cx) => {
    const GO = glow("rgba(249,115,22,1)", 40);
    let sc: Scene | null = null;
    const scene = (W: number, H: number) =>
      sc && sc.W === W && sc.H === H ? sc : (sc = layout(W, H));
    let t0 = performance.now();
    return {
      reset: (now) => {
        t0 = now; // replay from the top on (re)entry
      },
      frame: (now, W, H) => draw(scene(W, H), cx, (now - t0) % TOTAL, GO),
      // the owned end-state (hold): one system, "you own it."
      still: (_now, W, H) => draw(scene(W, H), cx, TOTAL - 200, GO),
    };
  });

  return (
    <div
      ref={wrapRef}
      className="lf-instrument lf-kcrb"
      style={
        {
          "--lf-instrument-ratio": "460 / 340",
          "--lf-instrument-minh": "260px",
          "--lf-instrument-ratio-m": "340 / 430",
          "--lf-instrument-minh-m": "400px",
        } as React.CSSProperties
      }
      role="img"
      aria-label="Animation: a shop's scattered tools resolve through four verbs — keep what works, connect what matters, replace what drags, build what fits — consolidating into one owned system."
    >
      <canvas ref={canvasRef} className="lf-instrument__canvas" aria-hidden="true" />
    </div>
  );
}
