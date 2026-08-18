import { clamp, eoc } from "@/kernel/motion";
import { rr, glow, rgba1, DISP, MONO, ORANGE, GREEN, useInstrumentCanvas } from "./instrument";

/**
 * OpenWhileClosed — the websites argument, told as the customer's night.
 *
 * The service page draws SiteInFourteen, because a reader there is reading
 * commercial terms and the written launch promise is one of them. A shop owner
 * on the homepage is not shopping for a delivery date — they are shopping for
 * customers. So the homepage draws the thing they actually buy: the shop's
 * hours run out, the lights go off, and the site keeps taking bookings.
 *
 * Nothing here is a metric. The clock is a clock; the bookings are drawn as an
 * illustration of after-hours arrival, not a count anyone achieved. The only
 * claim is the plain one — a website is open when the door is locked — which is
 * a property of having a website, not a performance promise.
 *
 * Rendered on a <canvas> (2D). Responsive to its container shape. Pauses when
 * off-viewport. Under prefers-reduced-motion it paints a single settled frame:
 * late at night, still open, with the bookings already in.
 */

/** The clock runs an evening, not a day — the point is the hours you are shut. */
const START_HOUR = 17.5;
const END_HOUR = 25.9; // 1:54am the next morning

/** When each booking lands, as a fraction of the run. */
const BOOKINGS = [0.34, 0.58, 0.82] as const;

/** The hour the shop's door locks. Everything after this is the argument. */
const CLOSES_AT = 19;

const T = { run: 7000, hold: 2200 };

type Sim = {
  t0: number;
  phase: 0 | 1; // running | hold
  p: number; // 0..1 through the evening
  pops: number[]; // per-booking pop energy
};

const freshSim = (now: number): Sim => ({ t0: now, phase: 0, p: 0, pops: BOOKINGS.map(() => 0) });

function step(S: Sim, now: number) {
  const pt = now - S.t0;
  for (let i = 0; i < S.pops.length; i++) S.pops[i] *= 0.9;
  if (S.phase === 0) {
    const next = clamp(pt / T.run, 0, 1);
    BOOKINGS.forEach((at, i) => {
      if (S.p < at && next >= at) S.pops[i] = 1;
    });
    S.p = next;
    if (pt > T.run) {
      S.phase = 1;
      S.t0 = now;
    }
  } else {
    S.p = 1;
    if (pt > T.hold) Object.assign(S, freshSim(now));
  }
}

/** 17.5 → "5:30 PM". Twelve-hour, because that is how a shop reads a clock. */
function clockLabel(hour: number) {
  const h24 = Math.floor(hour) % 24;
  const mins = Math.floor((hour % 1) * 60);
  const suffix = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mins).padStart(2, "0")} ${suffix}`;
}

function draw(
  S: Sim,
  cx: CanvasRenderingContext2D,
  W: number,
  H: number,
  GG: HTMLCanvasElement,
  GO: HTMLCanvasElement,
) {
  cx.clearRect(0, 0, W, H);
  const wide = W > H * 1.15;
  const hour = START_HOUR + (END_HOUR - START_HOUR) * S.p;
  const shut = hour >= CLOSES_AT;

  // Night falls across the whole frame as the evening runs — the one piece of
  // atmosphere doing real work, because "closed" is the entire premise.
  const night = eoc(clamp((hour - CLOSES_AT + 1.2) / 3.4, 0, 1));
  if (night > 0.01) {
    // Radial, not linear. A linear wash filled the box corner to corner and
    // drew a hard rectangle against the panel's own stage light — the canvas
    // announcing its own bounds, which is the one thing an instrument must
    // never do. Fading to transparent before the edge lets the drawing sit in
    // the panel instead of on top of it.
    const sky = cx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, Math.max(W, H) * 0.72);
    sky.addColorStop(0, `rgba(26,35,62,${0.55 * night})`);
    sky.addColorStop(0.62, `rgba(14,18,32,${0.28 * night})`);
    sky.addColorStop(1, "rgba(8,10,18,0)");
    cx.fillStyle = sky;
    cx.fillRect(0, 0, W, H);
  }

  // --- layout ---
  let frX: number, frY: number, frW: number, frH: number;
  let readX: number, readY: number, readAlign: CanvasTextAlign;
  if (wide) {
    frW = W * 0.5;
    frH = H * 0.78;
    frX = W * 0.46;
    frY = H * 0.11;
    readX = W * 0.07;
    readY = H * 0.3;
    readAlign = "left";
  } else {
    // Portrait stacks clock → site → bookings in one column, so the frame has
    // to leave the three cards their room. The budget below is deliberate:
    // clock ends ~0.28H, frame runs 0.30→0.66H, cards run 0.70→0.97H.
    frW = W * 0.84;
    frH = H * 0.36;
    frX = W * 0.08;
    frY = H * 0.3;
    readX = W * 0.5;
    readY = H * 0.11;
    readAlign = "center";
  }

  // --- the clock + the shop's state ---
  cx.textAlign = readAlign;
  cx.textBaseline = "alphabetic";
  cx.fillStyle = "rgba(190,195,205,.7)";
  cx.font = "500 " + Math.max(12, (H * 0.036) | 0) + "px " + MONO;
  cx.fillText(shut ? "SHOP CLOSED" : "SHOP OPEN", readX, readY);

  cx.fillStyle = "#fff";
  cx.font = "700 " + Math.max(30, (H * (wide ? 0.15 : 0.115)) | 0) + "px " + DISP;
  cx.fillText(clockLabel(hour), readX, readY + H * (wide ? 0.15 : 0.115));

  cx.fillStyle = shut ? "rgba(120,220,150,.95)" : "rgba(160,164,174,.85)";
  cx.font = "700 " + Math.max(13, (H * 0.05) | 0) + "px " + DISP;
  cx.fillText(shut ? "Website still open" : "Website open", readX, readY + H * (wide ? 0.225 : 0.175));

  // --- the site, always lit ---
  const barH = clamp(frH * 0.11, 18, 28);
  cx.globalCompositeOperation = "lighter";
  cx.globalAlpha = 0.1 + 0.12 * night;
  cx.drawImage(GG, frX - 34, frY - 34, frW + 68, frH + 68);
  cx.globalAlpha = 1;
  cx.globalCompositeOperation = "source-over";

  rr(cx, frX, frY, frW, frH, 10);
  cx.fillStyle = "rgba(255,255,255,.045)";
  cx.fill();
  cx.strokeStyle = "rgba(74,222,128,.5)";
  cx.lineWidth = 1;
  cx.stroke();

  rr(cx, frX, frY, frW, barH, 10);
  cx.fillStyle = "rgba(255,255,255,.06)";
  cx.fill();
  cx.fillRect(frX, frY + barH * 0.6, frW, barH * 0.4);
  for (let i = 0; i < 3; i++) {
    cx.fillStyle = ["#ff5f57", "#febc2e", "#28c840"][i];
    cx.globalAlpha = 0.8;
    cx.beginPath();
    cx.arc(frX + 12 + i * 12, frY + barH / 2, 3, 0, 7);
    cx.fill();
    cx.globalAlpha = 1;
  }
  cx.fillStyle = GREEN;
  cx.font = "600 " + Math.max(12, (barH * 0.44) | 0) + "px " + MONO;
  cx.textAlign = "left";
  cx.textBaseline = "middle";
  cx.fillText("● OPEN", frX + 48, frY + barH / 2 + 0.5);

  // page content, with the booking button the one lit thing
  cx.save();
  rr(cx, frX, frY + barH, frW, frH - barH, 0);
  cx.clip();
  const padX = frW * 0.08;
  const innerW = frW - padX * 2;
  let cy = frY + barH + frH * 0.1;
  rr(cx, frX + padX, cy, innerW * 0.66, frH * 0.09, 4);
  cx.fillStyle = "rgba(255,255,255,.26)";
  cx.fill();
  cy += frH * 0.16;
  rr(cx, frX + padX, cy, innerW * 0.46, frH * 0.055, 3);
  cx.fillStyle = "rgba(255,255,255,.13)";
  cx.fill();
  cy += frH * 0.14;
  // the button: the whole reason the site is open at this hour
  const btnH = frH * 0.13;
  cx.globalCompositeOperation = "lighter";
  cx.globalAlpha = 0.4;
  cx.drawImage(GO, frX + padX - 16, cy - 12, innerW * 0.62 + 32, btnH + 24);
  cx.globalAlpha = 1;
  cx.globalCompositeOperation = "source-over";
  rr(cx, frX + padX, cy, innerW * 0.62, btnH, btnH * 0.5);
  cx.fillStyle = ORANGE;
  cx.fill();
  cx.fillStyle = "#2b1206";
  cx.font = "700 " + Math.max(12, (btnH * 0.46) | 0) + "px " + MONO;
  cx.textAlign = "center";
  cx.textBaseline = "middle";
  cx.fillText("BOOK NOW", frX + padX + innerW * 0.31, cy + btnH / 2 + 0.5);
  cx.restore();

  // --- the bookings that land after the door is locked ---
  cx.textAlign = "left";
  cx.textBaseline = "middle";
  const cardW = wide ? W * 0.34 : frW * 0.88;
  const cardH = wide ? Math.max(34, H * 0.088) : Math.max(32, H * 0.078);
  const cardGap = (wide ? 0.018 : 0.014) * H;
  const cardX = wide ? W * 0.06 : frX + frW * 0.06;
  const cardTop = wide ? H * 0.56 : frY + frH + H * 0.04;

  BOOKINGS.forEach((at, i) => {
    const shown = clamp((S.p - at) / 0.05, 0, 1);
    if (shown <= 0.01) return;
    const a = eoc(shown);
    const pop = S.pops[i];
    const y = cardTop + i * (cardH + cardGap);
    cx.globalAlpha = a;

    if (pop > 0.02) {
      cx.globalCompositeOperation = "lighter";
      cx.globalAlpha = a * pop * 0.5;
      cx.drawImage(GG, cardX - 20, y - 16, cardW + 40, cardH + 32);
      cx.globalAlpha = a;
      cx.globalCompositeOperation = "source-over";
    }

    rr(cx, cardX, y, cardW, cardH, 10);
    cx.fillStyle = "rgba(20,22,28,.92)";
    cx.fill();
    cx.strokeStyle = "rgba(255,255,255,.14)";
    cx.lineWidth = 1;
    cx.stroke();

    const tick = cardH * 0.5;
    rr(cx, cardX + cardH * 0.24, y + (cardH - tick) / 2, tick, tick, tick * 0.3);
    cx.fillStyle = GREEN;
    cx.fill();
    cx.fillStyle = "#05300f";
    cx.font = "700 " + Math.max(12, (tick * 0.62) | 0) + "px " + MONO;
    cx.textAlign = "center";
    cx.fillText("✓", cardX + cardH * 0.24 + tick / 2, y + cardH / 2 + 1);

    cx.textAlign = "left";
    const tx = cardX + cardH * 0.24 + tick + cardH * 0.28;
    cx.fillStyle = "rgba(190,195,205,.85)";
    cx.font = "500 " + Math.max(12, (cardH * 0.28) | 0) + "px " + MONO;
    cx.fillText("BOOKED", tx, y + cardH * 0.34);
    cx.fillStyle = "#fff";
    cx.font = "700 " + Math.max(13, (cardH * 0.34) | 0) + "px " + DISP;
    cx.fillText(clockLabel(START_HOUR + (END_HOUR - START_HOUR) * at), tx, y + cardH * 0.7);
    cx.globalAlpha = 1;
  });
}

/** Settled frame: late, shut, still open, all three bookings in. */
function settledSim(now: number): Sim {
  const S = freshSim(now);
  S.phase = 1;
  S.p = 1;
  return S;
}

export default function OpenWhileClosed() {
  const { wrapRef, canvasRef } = useInstrumentCanvas((cx) => {
    const GG = glow(rgba1(GREEN), 30);
    const GO = glow(rgba1(ORANGE), 30);
    let S = freshSim(performance.now());
    return {
      reset: (now) => {
        S = freshSim(now);
      },
      frame: (now, W, H) => {
        step(S, now);
        draw(S, cx, W, H, GG, GO);
      },
      still: (now, W, H) => draw(settledSim(now), cx, W, H, GG, GO),
    };
  });

  return (
    <div
      ref={wrapRef}
      className="lf-instrument lf-open-while-closed"
      style={
        {
          "--lf-instrument-mb": "var(--lf-space-4, 1.5rem)",
          "--lf-instrument-ratio-m": "360 / 430",
          "--lf-instrument-minh-m": "415px",
        } as React.CSSProperties
      }
      role="img"
      aria-label="Illustration of an evening: the shop closes, and the website stays open and keeps taking bookings into the night. The times shown are an illustration of after-hours booking, not a measured result."
    >
      <canvas ref={canvasRef} className="lf-instrument__canvas" aria-hidden="true" />
    </div>
  );
}
