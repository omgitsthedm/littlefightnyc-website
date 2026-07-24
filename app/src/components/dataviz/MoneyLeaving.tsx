import { clamp, lerp, eoc, eoBack } from "@/kernel/motion";
import { rr, glow, DISP, MONO, useInstrumentCanvas } from "./instrument";

/**
 * MoneyLeaving — the "software you own" argument, drawn.
 *
 * Recognizable monthly tools stack up on the desk. The pile then consolidates
 * into one owned build. The instrument communicates recurring-tool drag and
 * many-to-one ownership without inventing prices or promising a zero-dollar
 * operating cost.
 *
 * Rendered on a <canvas> (2D). Responsive to its container: a wide card lays the
 * number LEFT / pile RIGHT; a tall phone stacks number-over-pile. Pauses when
 * off-viewport (IntersectionObserver). Under prefers-reduced-motion it paints a
 * single settled frame — the full itemized loss — with no animation.
 */

const BILLS = ["BOOKING", "PAYMENTS", "WEBSITE", "EMAIL & TEXTS", "PAYROLL"] as const;
const T = { perBill: 640, stop: 640, own: 3000 };

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
      S.drained += 1;
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
    cadence: string,
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
    // Body strip stays visible on every stacked card.
    cx.fillStyle = "rgba(40,36,32,.82)";
    cx.font = "600 " + Math.max(10, (bh * 0.2) | 0) + "px " + MONO;
    cx.textAlign = "left";
    cx.textBaseline = "middle";
    cx.fillText(name, -bw / 2 + 10, -bh * 0.28);
    cx.fillStyle = "#1a1a1e";
    cx.font = "700 " + Math.max(9, (bh * 0.22) | 0) + "px " + MONO;
    cx.textAlign = "right";
    cx.fillText(cadence, bw / 2 - 10, -bh * 0.26);
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
      invoice(
        pileX + b.dx * bw * 0.12,
        y,
        b.rot,
        clamp(age / 160, 0, 1),
        BILLS[i],
        "MONTHLY",
        false,
        false,
      );
    });
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    const heat = clamp(S.drained / BILLS.length, 0, 1);
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = 0.1 + heat * 0.16;
    cx.drawImage(GR, numX - 90, numY - 90, 180, 180);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    cx.fillStyle = "rgba(200,205,215,.8)";
    cx.font = "500 " + Math.max(10, (numFs * 0.22) | 0) + "px " + MONO;
    cx.fillText("RECURRING TOOLS", numX, labY);
    cx.fillStyle = "#fff";
    cx.font = "700 " + (numFs | 0) + "px " + DISP;
    cx.fillText(`${S.drained} MONTHLY`, numX, numY);
    cx.fillStyle = "#F87171";
    cx.font = "700 " + ((numFs * 0.28) | 0) + "px " + DISP;
    cx.fillText("MORE BILLS. MORE STEPS.", numX, subY);
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
    cx.fillText("RIGHT-SIZED SYSTEM", numX, labY);
    cx.fillStyle = "#eaf6ee";
    cx.font = "700 " + ((numFs * 0.82) | 0) + "px " + DISP;
    cx.fillText("ONE OWNED TOOL", numX, numY);
    cx.fillStyle = "rgba(200,210,215,.92)";
    cx.font = "600 " + ((numFs * 0.27) | 0) + "px " + DISP;
    cx.fillText("BUILT AROUND THE WORK", numX, subY);
    const y = lerp(deskY, deskY - spread * 1.2, eoc(S.own));
    invoice(pileX, y, 0, S.own, "ONE BUILD", "OWNED", true, true);
    cx.globalAlpha = S.own;
    cx.fillStyle = "rgba(161,161,170,.9)";
    cx.font = "400 " + ((bh * 0.36) | 0) + "px " + DISP;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("Keep useful tools. Replace the drag.", pileX, deskY + (H - deskY) * 0.5);
    cx.globalAlpha = 1;
  }
}

// Settled "problem" frame — the full itemized pile — for reduced-motion + the
// first paint before the rAF starts.
function settledSim(now: number): Sim {
  const S = freshSim(now);
  S.t0 = now - (BILLS.length * T.perBill + 1400);
  S.landed = BILLS.length;
  S.drained = BILLS.length;
  S.bills = BILLS.map((_, i) => ({ born: i * T.perBill, rot: (i - 2) * 0.05, dx: (i - 2) * 0.3 }));
  return S;
}

export default function MoneyLeaving() {
  const { wrapRef, canvasRef } = useInstrumentCanvas((cx) => {
    const GR = glow("rgba(248,113,113,1)", 30);
    const GG = glow("rgba(74,222,128,1)", 30);
    let S = freshSim(performance.now());
    return {
      reset: (now) => {
        S = freshSim(now);
      },
      frame: (now, W, H) => {
        step(S, now);
        draw(S, cx, W, H, GR, GG, now);
      },
      still: (now, W, H) => draw(settledSim(now), cx, W, H, GR, GG, now),
    };
  });

  return (
    <div
      ref={wrapRef}
      className="lf-instrument lf-moneyleaving"
      style={
        {
          "--lf-instrument-ratio": "460 / 340",
          "--lf-instrument-minh": "240px",
          "--lf-instrument-ratio-m": "340 / 430",
          "--lf-instrument-minh-m": "400px",
        } as React.CSSProperties
      }
      role="img"
      aria-label="Animation: five recurring business tools stack up as separate monthly bills. The pile then consolidates into one owned tool built around the work."
    >
      <canvas ref={canvasRef} className="lf-instrument__canvas" aria-hidden="true" />
    </div>
  );
}
