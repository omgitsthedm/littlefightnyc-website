import { useEffect, useRef } from "react";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { clamp, lerp, eoc, eoBack } from "@/kernel/motion";
import "./MoneyLeaving.css";

/**
 * MoneyLeaving — the "software you own" argument, drawn.
 *
 * The owner's monthly software bill climbs in real time as recognizable,
 * specifically-priced invoices (booking, payments, website, email/texts,
 * payroll) stack up on the desk — $545/mo, $6,540/yr on auto-pay. A hard stop
 * then collapses the whole pile into ONE owned invoice ("PAID ONCE · $0") and
 * the monthly bill turns green $0 — "$6,540 back a year." One causal image: the
 * bill climbs *because* these tools recur, and owning the build stops it.
 *
 * Rendered on a <canvas> (2D). Responsive to its container: a wide card lays the
 * number LEFT / pile RIGHT; a tall phone stacks number-over-pile. Pauses when
 * off-viewport (IntersectionObserver). Under prefers-reduced-motion it paints a
 * single settled frame — the full itemized loss — with no animation.
 */

type Bill = [label: string, amount: number];
// Real, recognizable monthly software an owner-operated shop actually auto-pays,
// with specific (not rounded) prices. Sum is the monthly bill shown climbing.
const BILLS: Bill[] = [
  ["BOOKING", 69],
  ["PAYMENTS", 149],
  ["WEBSITE", 39],
  ["EMAIL & TEXTS", 99],
  ["PAYROLL", 189],
];
const TOTAL = BILLS.reduce((s, b) => s + b[1], 0); // 545 / month
const T = { perBill: 640, stop: 640, own: 3000 };

// Oswald Variable tops out at 700; JetBrains Mono is loaded at 500.
const DISP = '"Oswald Variable", "Oswald", "Barlow", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';

const money = (v: number) => "$" + Math.round(v).toLocaleString("en-US");

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
  phase: 0 | 1 | 2;
  t0: number;
  landed: number;
  drained: number;
  flash: number;
  own: number;
  bills: { born: number; rot: number; dx: number }[];
};
const freshSim = (now: number): Sim => ({
  phase: 0,
  t0: now,
  landed: 0,
  drained: 0,
  flash: 0,
  own: 0,
  bills: [],
});

function step(S: Sim, now: number) {
  const pt = now - S.t0;
  if (S.phase === 0) {
    const want = clamp(Math.floor(pt / T.perBill), 0, BILLS.length);
    while (S.landed < want) {
      S.bills.push({ born: S.landed * T.perBill, rot: (Math.random() - 0.5) * 0.14, dx: Math.random() - 0.5 });
      S.landed++;
      S.drained += BILLS[S.landed - 1][1];
    }
    if (S.landed >= BILLS.length && pt > BILLS.length * T.perBill + 520) {
      S.phase = 1;
      S.t0 = now;
      S.flash = 1;
    }
  } else if (S.phase === 1) {
    S.flash *= 0.85;
    if (now - S.t0 > T.stop) {
      S.phase = 2;
      S.t0 = now;
    }
  } else {
    S.own = clamp(S.own + 0.03, 0, 1);
    if (now - S.t0 > T.own) Object.assign(S, freshSim(now));
  }
}

function draw(
  S: Sim,
  cx: CanvasRenderingContext2D,
  W: number,
  H: number,
  GR: HTMLCanvasElement,
  GG: HTMLCanvasElement,
  now: number,
) {
  cx.clearRect(0, 0, W, H);
  const own = S.phase === 2;
  const wide = W > H * 1.12;

  let numX: number, labY: number, numY: number, subY: number;
  let pileX: number, deskY: number, deskL: number, deskR: number, numFs: number, bw: number;
  if (wide) {
    numX = W * 0.28;
    const cy = H * 0.47;
    numFs = Math.min(W * 0.11, H * 0.22, 52);
    labY = cy - numFs * 0.72;
    numY = cy;
    subY = cy + numFs * 0.62;
    pileX = W * 0.68;
    deskY = H * 0.84;
    deskL = W * 0.44;
    deskR = W * 0.94;
    bw = Math.min(W * 0.46, 220);
  } else {
    numX = W * 0.5;
    numFs = Math.min(W * 0.16, H * 0.14, 58);
    labY = H * 0.1;
    numY = H * 0.19;
    subY = H * 0.275;
    pileX = W * 0.5;
    deskY = H * 0.93;
    deskL = W * 0.1;
    deskR = W * 0.9;
    bw = Math.min(W * 0.6, 224);
  }
  const bh = bw * 0.3;
  const spread = bh * 0.7;

  // desk line
  const dg = cx.createLinearGradient(0, deskY, 0, deskY + 20);
  dg.addColorStop(0, "rgba(255,255,255,.10)");
  dg.addColorStop(1, "rgba(255,255,255,0)");
  cx.fillStyle = dg;
  cx.fillRect(deskL, deskY, deskR - deskL, 16);
  cx.strokeStyle = "rgba(255,255,255,.14)";
  cx.lineWidth = 1;
  cx.beginPath();
  cx.moveTo(deskL, deskY);
  cx.lineTo(deskR, deskY);
  cx.stroke();

  const invoice = (
    x: number,
    y: number,
    rot: number,
    a: number,
    name: string,
    amt: number,
    ghost: boolean,
    stamp: boolean,
  ) => {
    cx.save();
    cx.globalAlpha = a;
    cx.translate(x, y);
    cx.rotate(rot);
    cx.shadowColor = "rgba(0,0,0,.5)";
    cx.shadowBlur = 12;
    cx.shadowOffsetY = 5;
    rr(cx, -bw / 2, -bh, bw, bh, 5);
    cx.fillStyle = ghost ? "#f6f2ea" : "#ece5d8";
    cx.fill();
    cx.shadowColor = "transparent";
    cx.strokeStyle = "rgba(0,0,0,.10)";
    cx.lineWidth = 1;
    cx.stroke();
    const hb = bh * 0.36;
    cx.fillStyle = ghost ? "#2f9e63" : "#b23a2e";
    rr(cx, -bw / 2, -bh, bw, hb, 5);
    cx.fill();
    cx.fillRect(-bw / 2, -bh + hb * 0.5, bw, hb * 0.5);
    // header bar (fully visible only on the top card): INVOICE · AUTO-PAY
    cx.fillStyle = "rgba(255,255,255,.9)";
    cx.font = "700 " + ((hb * 0.5) | 0) + "px " + DISP;
    cx.textAlign = "left";
    cx.textBaseline = "middle";
    cx.fillText("INVOICE", -bw / 2 + 10, -bh + hb * 0.52);
    cx.fillStyle = "rgba(255,255,255,.8)";
    cx.font = "500 " + Math.max(9, (hb * 0.4) | 0) + "px " + MONO;
    cx.textAlign = "right";
    cx.fillText(ghost ? "PAID ONCE" : "AUTO-PAY", bw / 2 - 10, -bh + hb * 0.54);
    // body strip (visible on EVERY stacked card): CATEGORY .......... $amount
    cx.fillStyle = "rgba(40,36,32,.82)";
    cx.font = "600 " + Math.max(10, (bh * 0.2) | 0) + "px " + MONO;
    cx.textAlign = "left";
    cx.textBaseline = "middle";
    cx.fillText(name, -bw / 2 + 10, -bh * 0.28);
    cx.fillStyle = "#1a1a1e";
    cx.font = "700 " + ((bh * 0.34) | 0) + "px " + DISP;
    cx.textAlign = "right";
    cx.fillText(money(amt), bw / 2 - 10, -bh * 0.26);
    if (stamp) {
      cx.save();
      cx.rotate(-0.16);
      cx.strokeStyle = "#2f9e63";
      cx.lineWidth = 2.2;
      rr(cx, -52, -bh * 0.66, 104, 30, 5);
      cx.stroke();
      cx.fillStyle = "#2f9e63";
      cx.font = "700 16px " + DISP;
      cx.textAlign = "center";
      cx.textBaseline = "middle";
      cx.fillText("OWNED", 0, -bh * 0.66 + 15);
      cx.restore();
    }
    cx.restore();
  };

  if (!own) {
    S.bills.forEach((b, i) => {
      const age = (S.phase === 0 ? now - S.t0 : 1e9) - b.born;
      const y = deskY - i * spread + lerp(-84, 0, eoBack(clamp(age / 380, 0, 1)));
      invoice(pileX + b.dx * bw * 0.12, y, b.rot, clamp(age / 160, 0, 1), BILLS[i][0], BILLS[i][1], false, false);
    });
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    const heat = clamp(S.drained / TOTAL, 0, 1);
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = 0.1 + heat * 0.16;
    cx.drawImage(GR, numX - 90, numY - 90, 180, 180);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.fillStyle = "rgba(200,205,215,.8)";
    cx.font = "500 " + Math.max(10, (numFs * 0.22) | 0) + "px " + MONO;
    cx.fillText("EVERY MONTH", numX, labY);
    cx.fillStyle = "#fff";
    cx.font = "700 " + (numFs | 0) + "px " + DISP;
    cx.fillText(money(S.drained), numX, numY);
    cx.fillStyle = "#F87171";
    cx.font = "700 " + ((numFs * 0.34) | 0) + "px " + DISP;
    cx.fillText("= " + money(S.drained * 12) + " a year", numX, subY);
    if (S.flash > 0.02) {
      cx.fillStyle = "rgba(255,255,255," + S.flash * 0.4 + ")";
      cx.fillRect(0, 0, W, H);
    }
  } else {
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = S.own * 0.4;
    cx.drawImage(GG, numX - 100, numY - 80, 200, 200);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.globalAlpha = S.own;
    cx.fillStyle = "rgba(120,200,150,.85)";
    cx.font = "500 " + Math.max(10, (numFs * 0.22) | 0) + "px " + MONO;
    cx.fillText("EVERY MONTH", numX, labY);
    cx.fillStyle = "#eaf6ee";
    cx.font = "700 " + (numFs | 0) + "px " + DISP;
    cx.fillText("$0", numX, numY);
    const R = numFs * 0.16;
    const chx = numX - numFs * 1.9;
    const chy = subY;
    cx.strokeStyle = "#4ADE80";
    cx.lineWidth = 2.2;
    cx.beginPath();
    cx.arc(chx, chy, R, 0, 7);
    cx.stroke();
    cx.lineWidth = 2.6;
    cx.lineCap = "round";
    cx.beginPath();
    cx.moveTo(chx - R * 0.5, chy);
    cx.lineTo(chx - R * 0.05, chy + R * 0.45);
    cx.lineTo(chx + R * 0.5, chy - R * 0.5);
    cx.stroke();
    cx.fillStyle = "rgba(200,210,215,.92)";
    cx.font = "600 " + ((numFs * 0.32) | 0) + "px " + DISP;
    cx.fillText("$" + (TOTAL * 12).toLocaleString("en-US") + " back a year", numX + R * 0.6, subY);
    const y = lerp(deskY, deskY - spread * 1.2, eoc(S.own));
    invoice(pileX, y, 0, S.own, "ONE BUILD", 0, true, true);
    cx.globalAlpha = S.own;
    cx.fillStyle = "rgba(161,161,170,.9)";
    cx.font = "400 " + ((bh * 0.36) | 0) + "px " + DISP;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("No more monthly bills.", pileX, deskY + (H - deskY) * 0.5);
    cx.globalAlpha = 1;
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

export default function MoneyLeaving() {
  const wrapRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || typeof window === "undefined") return;
    const cx = canvas.getContext("2d");
    if (!cx) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const GR = glow("rgba(248,113,113,1)", 30);
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

    // Settled "problem" frame for reduced-motion + a first paint before rAF.
    const drawStatic = () => {
      resize();
      if (!W) return;
      const now = performance.now();
      const S = freshSim(now);
      S.t0 = now - (BILLS.length * T.perBill + 1400);
      S.landed = BILLS.length;
      S.drained = TOTAL;
      S.bills = BILLS.map((_, i) => ({ born: i * T.perBill, rot: (i - 2) * 0.05, dx: (i - 2) * 0.3 }));
      draw(S, cx, W, H, GR, GG, now);
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
      draw(S, cx, W, H, GR, GG, now);
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

    // First paint immediately so there's never an empty box.
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
      className="lf-moneyleaving"
      role="img"
      aria-label="Animation: a small business's monthly software invoices — booking, payments, website, email and texts, payroll — stack up on a desk to $545 a month, $6,540 a year on auto-pay; then the pile collapses into one owned build, paid once, and the monthly bill drops to $0 — $6,540 back a year."
    >
      <canvas ref={canvasRef} className="lf-moneyleaving__canvas" aria-hidden="true" />
    </div>
  );
}
