import { useEffect, useRef } from "react";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { clamp, lerp, eoc } from "@/kernel/motion";
import "./SiteInFourteen.css";

/**
 * SiteInFourteen — the "custom local websites" argument, drawn.
 *
 * A site assembles in a browser frame while a day counter climbs 1 → 14: nav,
 * hero, then the content rows snap into place, a review sweep passes, and on day
 * 14 it goes LIVE — "in 14 days, or you don't pay." One causal image: a real
 * custom build, coming together on a clock you can hold us to.
 *
 * Every fact drawn (ships by day 14, miss-the-date-you-don't-pay) is already in
 * the custom-local-websites copy — no invented numbers.
 *
 * Rendered on a <canvas> (2D). Responsive to its container shape. Pauses when
 * off-viewport (IntersectionObserver). Under prefers-reduced-motion it paints a
 * single settled frame — the finished site, LIVE on day 14 — with no motion.
 */

// Content blocks in the frame, each with the build-day it snaps in on (1..14).
const BLOCKS = [
  { day: 2, h: 0.26, kind: "hero" },
  { day: 5, h: 0.14, kind: "row" },
  { day: 7, h: 0.14, kind: "row" },
  { day: 9, h: 0.14, kind: "row" },
  { day: 11, h: 0.1, kind: "foot" },
] as const;

const T = { build: 4200, ship: 1600, hold: 1500 };

const DISP = '"Oswald Variable", "Oswald", "Barlow", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';

const ORANGE = "#F97316";
const GREEN = "#4ADE80";

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

type Sim = {
  t0: number;
  phase: 0 | 1 | 2; // build | ship | hold
  day: number; // 1..14
  live: number; // 0..1 ship reveal
  flash: number;
};

const freshSim = (now: number): Sim => ({ t0: now, phase: 0, day: 1, live: 0, flash: 0 });

function step(S: Sim, now: number) {
  const pt = now - S.t0;
  S.flash *= 0.88;
  if (S.phase === 0) {
    S.day = 1 + 12 * eoc(clamp(pt / T.build, 0, 1));
    if (pt > T.build) {
      S.phase = 1;
      S.t0 = now;
      S.day = 14;
      S.flash = 1;
    }
  } else if (S.phase === 1) {
    S.day = 14;
    S.live = clamp(S.live + 0.05, 0, 1);
    if (pt > T.ship) {
      S.phase = 2;
      S.t0 = now;
    }
  } else {
    S.live = 1;
    if (pt > T.hold) Object.assign(S, freshSim(now));
  }
}

function draw(
  S: Sim,
  cx: CanvasRenderingContext2D,
  W: number,
  H: number,
  GO: HTMLCanvasElement,
  GG: HTMLCanvasElement,
) {
  cx.clearRect(0, 0, W, H);
  const wide = W > H * 1.15;
  const live = S.phase >= 1;

  // layout: browser frame + a day/readout panel
  let frX: number, frY: number, frW: number, frH: number;
  let dayX: number, dayY: number, dayAlign: CanvasTextAlign;
  if (wide) {
    frW = W * 0.5;
    frH = H * 0.82;
    frX = W * 0.46;
    frY = H * 0.09;
    dayX = W * 0.08;
    dayY = H * 0.34;
    dayAlign = "left";
  } else {
    frW = W * 0.84;
    frH = H * 0.5;
    frX = W * 0.08;
    frY = H * 0.31;
    dayX = W * 0.5;
    dayY = H * 0.12;
    dayAlign = "center";
  }

  // --- day counter ---
  const dayNum = Math.min(14, Math.round(S.day));
  cx.textAlign = dayAlign;
  cx.textBaseline = "alphabetic";
  cx.fillStyle = "rgba(190,195,205,.7)";
  cx.font = "500 " + Math.max(9, (H * 0.032) | 0) + "px " + MONO;
  cx.fillText(live ? "SHIPPED" : "BUILDING", dayX, dayY);
  cx.fillStyle = live ? "#eaf6ee" : "#fff";
  cx.font = "700 " + Math.max(28, (H * (wide ? 0.16 : 0.12)) | 0) + "px " + DISP;
  cx.fillText("DAY " + String(dayNum).padStart(2, "0"), dayX, dayY + H * (wide ? 0.15 : 0.11));
  cx.fillStyle = "rgba(160,164,174,.8)";
  cx.font = "500 " + Math.max(10, (H * 0.04) | 0) + "px " + DISP;
  cx.fillText("of 14", dayX + (dayAlign === "center" ? 0 : 0), dayY + H * (wide ? 0.22 : 0.16));

  // --- browser frame ---
  const barH = clamp(frH * 0.1, 16, 26);
  // glow when live
  if (live && S.live > 0.05) {
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = 0.3 * S.live;
    cx.drawImage(GG, frX - 30, frY - 30, frW + 60, frH + 60);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
  }
  // frame body
  rr(cx, frX, frY, frW, frH, 10);
  cx.fillStyle = "rgba(255,255,255,.04)";
  cx.fill();
  cx.strokeStyle = live ? "rgba(74,222,128,.5)" : "rgba(255,255,255,.16)";
  cx.lineWidth = 1;
  cx.stroke();
  // title bar
  rr(cx, frX, frY, frW, barH, 10);
  cx.fillStyle = "rgba(255,255,255,.06)";
  cx.fill();
  cx.fillRect(frX, frY + barH * 0.6, frW, barH * 0.4);
  // window dots
  for (let i = 0; i < 3; i++) {
    cx.fillStyle = ["#ff5f57", "#febc2e", "#28c840"][i];
    cx.globalAlpha = 0.8;
    cx.beginPath();
    cx.arc(frX + 12 + i * 12, frY + barH / 2, 3, 0, 7);
    cx.fill();
    cx.globalAlpha = 1;
  }
  // url pill (fills / gets a LIVE badge on ship)
  const urlX = frX + 48;
  const urlW = frW - 60;
  rr(cx, urlX, frY + barH * 0.24, urlW, barH * 0.52, barH * 0.26);
  cx.fillStyle = "rgba(255,255,255,.08)";
  cx.fill();
  if (live) {
    cx.fillStyle = GREEN;
    cx.font = "600 " + Math.max(8, (barH * 0.42) | 0) + "px " + MONO;
    cx.textAlign = "left";
    cx.textBaseline = "middle";
    cx.globalAlpha = S.live;
    cx.fillText("● yourshop.com  LIVE", urlX + 8, frY + barH / 2 + 0.5);
    cx.globalAlpha = 1;
  }

  // content blocks (clip to the frame body under the bar)
  cx.save();
  rr(cx, frX, frY + barH, frW, frH - barH, 0);
  cx.clip();
  const padX = frW * 0.07;
  let cy = frY + barH + frH * 0.06;
  const innerW = frW - padX * 2;
  for (const b of BLOCKS) {
    const appear = clamp((S.day - b.day) / 1.6 + (live ? 1 : 0), 0, 1);
    if (appear <= 0.01) {
      cy += frH * b.h + frH * 0.03;
      continue;
    }
    const a = eoc(appear);
    const bh = frH * b.h;
    const yoff = lerp(10, 0, a);
    cx.globalAlpha = a;
    if (b.kind === "hero") {
      // hero: a headline bar + a subhead + a CTA chip
      rr(cx, frX + padX, cy + yoff, innerW * 0.7, bh * 0.28, 4);
      cx.fillStyle = "rgba(255,255,255,.28)";
      cx.fill();
      rr(cx, frX + padX, cy + yoff + bh * 0.4, innerW * 0.5, bh * 0.16, 3);
      cx.fillStyle = "rgba(255,255,255,.14)";
      cx.fill();
      rr(cx, frX + padX, cy + yoff + bh * 0.66, innerW * 0.26, bh * 0.24, bh * 0.12);
      cx.fillStyle = live ? "rgba(74,222,128,.8)" : ORANGE;
      cx.fill();
    } else if (b.kind === "row") {
      // content row: two cards
      const gap = innerW * 0.04;
      const cw = (innerW - gap) / 2;
      for (let i = 0; i < 2; i++) {
        rr(cx, frX + padX + i * (cw + gap), cy + yoff, cw, bh, 5);
        cx.fillStyle = "rgba(255,255,255,.10)";
        cx.fill();
      }
    } else {
      // footer strip
      rr(cx, frX + padX, cy + yoff, innerW, bh, 4);
      cx.fillStyle = "rgba(255,255,255,.07)";
      cx.fill();
    }
    cx.globalAlpha = 1;
    cy += bh + frH * 0.03;
  }
  // build sweep line (a soft orange scanline riding the current build front)
  if (!live) {
    const frontY = frY + barH + (frH - barH) * clamp((S.day - 1) / 12, 0.06, 0.98);
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = 0.5;
    cx.drawImage(GO, frX - 20, frontY - 12, frW + 40, 24);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.strokeStyle = "rgba(249,115,22,.7)";
    cx.lineWidth = 1.5;
    cx.beginPath();
    cx.moveTo(frX, frontY);
    cx.lineTo(frX + frW, frontY);
    cx.stroke();
  }
  cx.restore();

  // --- readout ---
  cx.textAlign = dayAlign;
  cx.textBaseline = "alphabetic";
  const ry = wide ? H * 0.68 : H * 0.89;
  if (live) {
    cx.fillStyle = "rgba(120,220,150,.95)";
    cx.font = "700 " + Math.max(12, (H * 0.055) | 0) + "px " + DISP;
    cx.fillText("Live in 14 days.", dayX, ry);
    cx.fillStyle = "rgba(200,205,215,.8)";
    cx.font = "500 " + Math.max(10, (H * 0.036) | 0) + "px " + DISP;
    cx.fillText("Or you don't pay.", dayX, ry + H * 0.055);
  } else {
    cx.fillStyle = "rgba(200,205,215,.85)";
    cx.font = "500 " + Math.max(10, (H * 0.036) | 0) + "px " + DISP;
    cx.fillText("Custom, built for your block —", dayX, ry);
    cx.fillText("shipping by day 14.", dayX, ry + H * 0.05);
  }

  if (S.flash > 0.02) {
    cx.fillStyle = "rgba(74,222,128," + S.flash * 0.12 + ")";
    cx.fillRect(0, 0, W, H);
  }
}

function glow(col: string, sz: number): HTMLCanvasElement {
  const s = document.createElement("canvas");
  s.width = s.height = sz;
  const g = s.getContext("2d")!;
  const rad = g.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
  rad.addColorStop(0, col);
  rad.addColorStop(0.4, col.replace("1)", ".5)"));
  rad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rad;
  g.beginPath();
  g.arc(sz / 2, sz / 2, sz / 2, 0, 7);
  g.fill();
  return s;
}

export default function SiteInFourteen() {
  const wrapRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || typeof window === "undefined") return;
    const cx = canvas.getContext("2d");
    if (!cx) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const GO = glow("rgba(249,115,22,1)", 30);
    const GG = glow("rgba(74,222,128,1)", 30);
    let W = 0;
    let H = 0;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      W = r.width;
      H = r.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    // Settled "shipped" frame: the finished site, LIVE on day 14.
    const drawStatic = () => {
      resize();
      if (!W) return;
      const now = performance.now();
      const S = freshSim(now);
      S.phase = 2;
      S.day = 14;
      S.live = 1;
      draw(S, cx, W, H, GO, GG);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) drawStatic();
    });
    ro.observe(wrap);

    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (reduced) drawStatic();
    });

    if (reduced) {
      resize();
      drawStatic();
      return () => ro.disconnect();
    }

    let raf = 0;
    let running = false;
    let S = freshSim(performance.now());
    const frame = (now: number) => {
      step(S, now);
      draw(S, cx, W, H, GO, GG);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      resize();
      if (!W) return;
      running = true;
      S = freshSim(performance.now());
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    drawStatic();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(wrap);

    return () => {
      io.disconnect();
      ro.disconnect();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapRef}
      className="lf-site14"
      role="img"
      aria-label="Animation: a custom website assembles in a browser frame while a day counter climbs from 1 to 14 — navigation, hero, content rows and footer snap into place — then on day 14 it goes live at yourshop.com. Live in 14 days, or you don't pay."
    >
      <canvas ref={canvasRef} className="lf-site14__canvas" aria-hidden="true" />
    </div>
  );
}
