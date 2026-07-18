import { useEffect, useRef } from "react";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { clamp, lerp, eoc } from "@/kernel/motion";
import "./AuditBench.css";

/**
 * AuditBench — the Tech-Audit "diagnostic bench" instrument (Small Craft §5.4).
 *
 * ADDITIVE: this is a header visual only. It never touches the audit form's state
 * or submission — the Netlify form underneath keeps capturing leads untouched.
 *
 * The shop's scattered moving parts (slow site, manual booking, tool sprawl,
 * missed calls, no follow-up) drift in as red "problems"; orange diagnostic lines
 * draw from a center point to each; then the fragments consolidate into one clear
 * system map (the house Many→One motion) — "one clear next step." Same shared
 * canvas harness as MoneyLeaving/KCRB: DPR, IntersectionObserver pause,
 * reduced-motion still frame, literal fonts, motion-grammar curves.
 */

const PARTS = ["SLOW SITE", "MANUAL BOOKING", "TOOL SPRAWL", "MISSED CALLS", "NO FOLLOW-UP"];
const T = { intro: 900, gather: 1400, assemble: 1400, hold: 2600 };
const ORDER = ["intro", "gather", "assemble", "hold"] as const;
type Phase = (typeof ORDER)[number];
const TOTAL = ORDER.reduce((s, k) => s + T[k], 0);

const DISP = '"Oswald Variable", "Oswald", "Barlow", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';

function phaseAt(pt: number): [Phase, number] {
  let acc = 0;
  for (const k of ORDER) {
    if (pt < acc + T[k]) return [k, (pt - acc) / T[k]];
    acc += T[k];
  }
  return ["hold", 1];
}

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
function glow(col: string, sz: number): HTMLCanvasElement {
  const s = document.createElement("canvas");
  s.width = s.height = sz;
  const g = s.getContext("2d")!;
  const rd = g.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
  rd.addColorStop(0, col);
  rd.addColorStop(0.4, col.replace("1)", ".5)"));
  rd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rd;
  g.beginPath();
  g.arc(sz / 2, sz / 2, sz / 2, 0, 7);
  g.fill();
  return s;
}

type Scene = { W: number; H: number; mx: number; my: number; cw: number; ch: number; pos: { x: number; y: number }[] };
function layout(W: number, H: number): Scene {
  const mx = W * 0.5;
  const my = H * 0.58;
  const cw = Math.min(W * 0.34, 158);
  const ch = 34;
  const R = Math.min(W * 0.36, H * 0.5);
  const pos = PARTS.map((_, i) => {
    const a = ((-90 + i * (360 / PARTS.length)) * Math.PI) / 180;
    return { x: mx + Math.cos(a) * R, y: my + Math.sin(a) * R * 0.62 };
  });
  return { W, H, mx, my, cw, ch, pos };
}

function chip(cx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha: number, label: string, border: string, txt: string) {
  if (alpha <= 0.01) return;
  cx.save();
  cx.globalAlpha = alpha;
  cx.shadowColor = "rgba(0,0,0,.5)";
  cx.shadowBlur = 10;
  cx.shadowOffsetY = 4;
  rr(cx, x - w / 2, y - h / 2, w, h, 7);
  cx.fillStyle = "rgba(42,46,58,.98)";
  cx.fill();
  cx.shadowColor = "transparent";
  cx.lineWidth = 1.8;
  cx.strokeStyle = border;
  cx.stroke();
  cx.fillStyle = txt;
  cx.font = "600 " + Math.max(11, (h * 0.4) | 0) + "px " + MONO;
  cx.textAlign = "center";
  cx.textBaseline = "middle";
  cx.fillText(label, x, y + 1);
  cx.restore();
}

function draw(sc: Scene, cx: CanvasRenderingContext2D, pt: number, GO: HTMLCanvasElement) {
  const { W, H, mx, my, cw, ch, pos: P } = sc;
  const [ph, f] = phaseAt(pt);
  const idx = ORDER.indexOf(ph);
  const on = (k: Phase) => ph === k;
  const reached = (k: Phase) => idx >= ORDER.indexOf(k);
  const assembling = reached("assemble");
  cx.clearRect(0, 0, W, H);

  // a persistent center core — the focal anchor the parts resolve into
  if (!assembling) {
    const pulse = 0.5 + 0.5 * Math.sin(pt * 0.006);
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = 0.28 + 0.22 * pulse;
    cx.drawImage(GO, mx - 26, my - 26, 52, 52);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.beginPath();
    cx.arc(mx, my, 4.5, 0, 7);
    cx.fillStyle = "#F97316";
    cx.fill();
  }

  // diagnostic lines center → each part (draw during gather, persist)
  if (reached("gather")) {
    const prog = on("gather") ? eoc(clamp(f * 1.15, 0, 1)) : 1;
    const collapse = on("assemble") ? eoc(f) : reached("hold") ? 1 : 0;
    P.forEach((p, i) => {
      const dp = clamp(prog * 1.25 - i * 0.08, 0, 1);
      if (dp <= 0) return;
      const ex = lerp(mx, p.x, dp * (1 - collapse));
      const ey = lerp(my, p.y, dp * (1 - collapse));
      cx.strokeStyle = "rgba(249,115,22," + (0.28 + 0.22 * (on("gather") ? 1 : 0)) + ")";
      cx.lineWidth = 1.4;
      cx.beginPath();
      cx.moveTo(mx, my);
      cx.lineTo(ex, ey);
      cx.stroke();
      if (on("gather")) {
        const pp = (f * 1.5 + i * 0.2) % 1;
        cx.globalCompositeOperation = "lighter";
        cx.drawImage(GO, lerp(mx, p.x, pp) - 7, lerp(my, p.y, pp) - 7, 14, 14);
        cx.globalCompositeOperation = "source-over";
      }
    });
  }

  // fragments
  PARTS.forEach((label, i) => {
    let alpha = 1;
    let x = P[i].x;
    let y = P[i].y;
    let border = "rgba(248,113,113,.8)"; // problem = red
    const txt = "#eef2f8";
    if (on("intro")) alpha = clamp(f * 2 - i * 0.14, 0, 1);
    if (reached("gather")) border = "rgba(249,115,22,.9)"; // diagnosed → orange
    if (assembling) {
      const af = on("assemble") ? eoc(clamp(f * 1.2 - i * 0.06, 0, 1)) : 1;
      x = lerp(P[i].x, mx, af);
      y = lerp(P[i].y, my, af);
      alpha = 1 - af * 0.85;
    }
    chip(cx, x, y, cw, ch, alpha, label, border, txt);
  });

  // the assembled system-map node (grows in during assemble; steady in hold)
  if (assembling) {
    const bf = on("assemble") ? eoc(f) : 1;
    const uw = Math.min(W * 0.4, 190);
    const uh = 46;
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = bf * 0.5;
    cx.drawImage(GO, mx - uw, my - uh, uw * 2, uh * 2);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.save();
    cx.globalAlpha = bf;
    const w = uw * (0.6 + 0.4 * bf);
    const h = uh * (0.6 + 0.4 * bf);
    cx.shadowColor = "rgba(0,0,0,.5)";
    cx.shadowBlur = 14;
    cx.shadowOffsetY = 5;
    rr(cx, mx - w / 2, my - h / 2, w, h, 9);
    const g = cx.createLinearGradient(0, my - h / 2, 0, my + h / 2);
    g.addColorStop(0, "#F5B841");
    g.addColorStop(0.5, "#F97316");
    g.addColorStop(1, "#F5B841");
    cx.fillStyle = g;
    cx.fill();
    cx.shadowColor = "transparent";
    cx.fillStyle = "#1a1a1e";
    cx.font = "700 " + ((h * 0.34) | 0) + "px " + DISP;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("YOUR SYSTEM", mx, my + 1);
    cx.restore();
  }

  // eyebrow + caption
  const caps: Record<Phase, string> = {
    intro: "The moving parts, scattered.",
    gather: "We map how they connect.",
    assemble: "Into one clear system.",
    hold: "One clear next step.",
  };
  const fs = Math.min(W * 0.06, 23);
  cx.textAlign = "center";
  cx.fillStyle = ph === "hold" ? "#F97316" : "rgba(224,229,238,.92)";
  cx.font = "500 " + (fs | 0) + "px " + DISP;
  cx.textBaseline = "alphabetic";
  cx.fillText(caps[ph], mx, H * 0.15);
}

export default function AuditBench() {
  const wrapRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || typeof window === "undefined") return;
    const cx = canvas.getContext("2d");
    if (!cx) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const GO = glow("rgba(249,115,22,1)", 34);
    let sc = layout(0, 0);
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      canvas.width = r.width * DPR;
      canvas.height = r.height * DPR;
      cx.setTransform(DPR, 0, 0, DPR, 0, 0);
      sc = layout(r.width, r.height);
    };
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const drawStatic = () => {
      resize();
      if (!sc.W) return;
      draw(sc, cx, TOTAL - 200, GO); // the assembled "one system" end-state
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
    let t0 = performance.now();
    const frame = (now: number) => {
      draw(sc, cx, (now - t0) % TOTAL, GO);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      resize();
      if (!sc.W) return;
      running = true;
      t0 = performance.now();
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
      className="lf-auditbench"
      role="img"
      aria-label="Animation: a shop's scattered problems — slow site, manual booking, tool sprawl, missed calls, no follow-up — are mapped and consolidated into one clear system, one clear next step."
    >
      <canvas ref={canvasRef} className="lf-auditbench__canvas" aria-hidden="true" />
    </div>
  );
}
