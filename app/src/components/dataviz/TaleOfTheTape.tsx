import { clamp, lerp, eoc, eoBack } from "@/kernel/motion";
import { rr, glow, DISP, MONO, ORANGE, RED, GREEN, useInstrumentCanvas } from "./instrument";

/**
 * TaleOfTheTape — THE FIGHT, drawn like a fight card.
 *
 * A boxing tale-of-the-tape any New Yorker reads in one look: THE CHAINS in
 * the far corner with every weapon already checked — tech team, website that
 * sells, software they own, somebody who answers. YOUR BLOCK starts with
 * nothing but ✗s. Then the orange glove — us — swings in and flips every ✗,
 * row by row, until the tape reads even and the stamp slams down: FAIR FIGHT.
 *
 * One causal image: the chains didn't out-work your block, they out-tooled
 * it — and Little Fight's whole job is punching your side of the tape even.
 * Honest by construction: the rows are the four things we actually provide
 * (the four items of focus); no invented stats anywhere.
 */

const ROWS = [
  "A REAL TECH TEAM",
  "A WEBSITE THAT SELLS",
  "SOFTWARE THEY OWN",
  "SOMEONE WHO PICKS UP",
];

const T = { intro: 1100, perRow: 820, stampIn: 500, hold: 3200 };
const punchStart = (i: number) => T.intro + i * T.perRow;
const stampAt = T.intro + ROWS.length * T.perRow + 300;
const TOTAL = stampAt + T.stampIn + T.hold;

type Sim = { t0: number };

function drawGlove(cx: CanvasRenderingContext2D, x: number, y: number, s: number, angle: number) {
  // A recognizable boxing glove: fist body, thumb, cuff. Faces LEFT (punching
  // leftward into the ✗ column). `s` scales; (x,y) is the knuckle point.
  cx.save();
  cx.translate(x, y);
  cx.rotate(angle);
  cx.scale(s, s);
  // cuff
  cx.fillStyle = "#c2410c";
  rr(cx, 26, -13, 18, 26, 6);
  cx.fill();
  // fist body
  cx.fillStyle = ORANGE;
  cx.beginPath();
  cx.moveTo(30, -16);
  cx.arc(4, 0, 17.5, -Math.PI / 2, Math.PI / 2, true);
  cx.lineTo(30, 16);
  cx.closePath();
  cx.fill();
  // thumb
  cx.beginPath();
  cx.arc(16, 10, 8, 0, 7);
  cx.fill();
  // seam highlight
  cx.strokeStyle = "rgba(255,255,255,.35)";
  cx.lineWidth = 1.6;
  cx.beginPath();
  cx.arc(6, 0, 12, -Math.PI / 2.3, Math.PI / 2.3, true);
  cx.stroke();
  cx.restore();
}

function draw(S: Sim, cx: CanvasRenderingContext2D, W: number, H: number, GO: HTMLCanvasElement, now: number) {
  const pt = (now - S.t0) % TOTAL;
  cx.clearRect(0, 0, W, H);
  const wide = W > H * 1.05;
  const introF = eoc(clamp(pt / (T.intro * 0.7), 0, 1));

  // layout
  const nameY = H * (wide ? 0.1 : 0.07);
  const rowsTop = H * (wide ? 0.24 : 0.2);
  const rowsBottom = H * (wide ? 0.78 : 0.8);
  const rowH = (rowsBottom - rowsTop) / ROWS.length;
  const leftX = W * (wide ? 0.16 : 0.14);
  const rightX = W * (wide ? 0.84 : 0.86);
  const chip = clamp(rowH * 0.52, 26, 44);

  // --- fighter names ---
  cx.globalAlpha = introF;
  cx.textBaseline = "middle";
  cx.font = "700 " + Math.max(15, (H * (wide ? 0.062 : 0.05)) | 0) + "px " + DISP;
  cx.textAlign = "left";
  cx.fillStyle = "rgba(200,205,215,.9)";
  cx.fillText("THE CHAINS", W * 0.06, nameY);
  cx.textAlign = "right";
  cx.fillStyle = "#fff";
  cx.fillText("YOUR BLOCK", W * 0.94, nameY);
  // center VS
  cx.textAlign = "center";
  cx.fillStyle = ORANGE;
  cx.font = "700 " + Math.max(13, (H * 0.045) | 0) + "px " + DISP;
  cx.fillText("VS", W * 0.5, nameY);
  // corner tags — wide only (the two lines collide mid-canvas on phones)
  if (wide) {
    cx.font = "500 " + Math.max(9, (H * 0.026) | 0) + "px " + MONO;
    cx.fillStyle = "rgba(150,154,164,.75)";
    cx.textAlign = "left";
    cx.fillText("FULL TECH DEPT. SINCE DAY ONE", W * 0.06, nameY + H * 0.055);
    cx.textAlign = "right";
    cx.fillText("THE BAR · THE CLINIC · THE SHOP", W * 0.94, nameY + H * 0.055);
  }
  cx.globalAlpha = 1;

  // --- rows ---
  for (let i = 0; i < ROWS.length; i++) {
    const y = rowsTop + rowH * (i + 0.5);
    const rowIn = eoc(clamp((pt - i * 140) / 500, 0, 1));
    if (rowIn <= 0.01) continue;
    cx.globalAlpha = rowIn;

    // rule + center label
    cx.strokeStyle = "rgba(255,255,255,.08)";
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(W * 0.06, y + rowH * 0.5 - 2);
    cx.lineTo(W * 0.94, y + rowH * 0.5 - 2);
    cx.stroke();
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillStyle = "rgba(220,224,232,.92)";
    cx.font = "600 " + Math.max(11, (H * (wide ? 0.038 : 0.03)) | 0) + "px " + DISP;
    cx.fillText(ROWS[i], W * 0.5, y);

    // LEFT: the chains always had it — steel check
    rr(cx, leftX - chip / 2, y - chip / 2, chip, chip, 8);
    cx.fillStyle = "rgba(255,255,255,.08)";
    cx.fill();
    cx.strokeStyle = "rgba(200,205,215,.4)";
    cx.lineWidth = 1.4;
    cx.stroke();
    cx.strokeStyle = "rgba(200,205,215,.9)";
    cx.lineWidth = 2.6;
    cx.lineCap = "round";
    cx.beginPath();
    cx.moveTo(leftX - chip * 0.2, y);
    cx.lineTo(leftX - chip * 0.04, y + chip * 0.16);
    cx.lineTo(leftX + chip * 0.22, y - chip * 0.18);
    cx.stroke();

    // RIGHT: your block — ✗ until the glove lands
    const ps = punchStart(i);
    const punchF = clamp((pt - ps) / 420, 0, 1); // glove travel
    const landed = punchF >= 1;
    const impact = clamp((pt - ps - 420) / 300, 0, 1); // flash after landing

    // shake on impact
    const shake = landed && impact < 0.5 ? Math.sin(pt * 0.9) * (1 - impact * 2) * 3 : 0;
    const cxRight = rightX + shake;

    rr(cx, cxRight - chip / 2, y - chip / 2, chip, chip, 8);
    if (!landed) {
      cx.fillStyle = "rgba(248,113,113,.1)";
      cx.fill();
      cx.strokeStyle = "rgba(248,113,113,.55)";
      cx.lineWidth = 1.4;
      cx.stroke();
      // ✗
      cx.strokeStyle = RED;
      cx.lineWidth = 2.6;
      cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(cxRight - chip * 0.17, y - chip * 0.17);
      cx.lineTo(cxRight + chip * 0.17, y + chip * 0.17);
      cx.moveTo(cxRight + chip * 0.17, y - chip * 0.17);
      cx.lineTo(cxRight - chip * 0.17, y + chip * 0.17);
      cx.stroke();
    } else {
      // flipped: orange-lit, WITH US
      const pop = eoBack(clamp(impact * 1.4, 0, 1));
      cx.save();
      cx.translate(cxRight, y);
      cx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
      cx.globalCompositeOperation = "lighter";
      cx.globalAlpha = 0.5 * (1 - impact * 0.5) * rowIn;
      cx.drawImage(GO, -chip, -chip, chip * 2, chip * 2);
      cx.globalAlpha = rowIn;
      cx.globalCompositeOperation = "source-over";
      rr(cx, -chip / 2, -chip / 2, chip, chip, 8);
      cx.fillStyle = "rgba(249,115,22,.16)";
      cx.fill();
      cx.strokeStyle = ORANGE;
      cx.lineWidth = 1.8;
      cx.stroke();
      cx.strokeStyle = ORANGE;
      cx.lineWidth = 3;
      cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(-chip * 0.2, 0);
      cx.lineTo(-chip * 0.04, chip * 0.16);
      cx.lineTo(chip * 0.22, -chip * 0.18);
      cx.stroke();
      cx.restore();
      // impact starburst
      if (impact < 0.4) {
        const r = chip * (0.7 + impact * 1.6);
        cx.strokeStyle = `rgba(249,115,22,${(0.6 * (1 - impact / 0.4)).toFixed(3)})`;
        cx.lineWidth = 2;
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2 + 0.3;
          cx.beginPath();
          cx.moveTo(cxRight + Math.cos(ang) * r * 0.75, y + Math.sin(ang) * r * 0.75);
          cx.lineTo(cxRight + Math.cos(ang) * r, y + Math.sin(ang) * r);
          cx.stroke();
        }
      }
    }

    // the glove: swings in from off-canvas right, knuckles reach the chip edge
    if (pt >= ps && punchF < 1.7 && !(landed && impact >= 1)) {
      const travel = eoc(Math.min(punchF, 1));
      const retreat = landed ? eoc(clamp(impact * 1.6, 0, 1)) : 0;
      const gx = lerp(W + 60, cxRight + chip * 0.62, travel) + retreat * (W * 0.24);
      const gs = clamp(chip / 34, 0.8, 1.5);
      cx.globalAlpha = rowIn * (1 - retreat * 0.9);
      drawGlove(cx, gx, y, gs, -0.06);
      cx.globalAlpha = rowIn;
    }

    cx.globalAlpha = 1;
  }

  // --- stamp: FAIR FIGHT. ---
  if (pt >= stampAt) {
    const f = eoBack(clamp((pt - stampAt) / T.stampIn, 0, 1));
    const y = H * (wide ? 0.9 : 0.92);
    cx.save();
    cx.translate(W * 0.5, y);
    cx.rotate(-0.03);
    cx.scale(1.6 - 0.6 * f, 1.6 - 0.6 * f);
    cx.globalAlpha = f;
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = f * 0.4;
    cx.drawImage(GO, -110, -40, 220, 80);
    cx.globalAlpha = f;
    cx.globalCompositeOperation = "source-over";
    const label = "FAIR FIGHT.";
    cx.font = "700 " + Math.max(20, (H * 0.085) | 0) + "px " + DISP;
    const w = cx.measureText(label).width;
    cx.strokeStyle = ORANGE;
    cx.lineWidth = 3;
    rr(cx, -w / 2 - 18, -H * 0.062, w + 36, H * 0.124, 8);
    cx.stroke();
    cx.fillStyle = ORANGE;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText(label, 0, 2);
    cx.restore();
    cx.globalAlpha = 1;
  }

  // green tally once even (tiny honest readout, top of stamp zone)
  if (pt >= stampAt + T.stampIn) {
    cx.globalAlpha = clamp((pt - stampAt - T.stampIn) / 400, 0, 1);
    cx.fillStyle = GREEN;
    cx.font = "500 " + Math.max(9, (H * 0.028) | 0) + "px " + MONO;
    cx.textAlign = "center";
    cx.fillText("4–4 ON THE TAPE", W * 0.5, H * (wide ? 0.815 : 0.845));
    cx.globalAlpha = 1;
  }
}

export default function TaleOfTheTape() {
  const { wrapRef, canvasRef } = useInstrumentCanvas((cx) => {
    const GO = glow("rgba(249,115,22,1)", 34);
    let S: Sim = { t0: performance.now() };
    return {
      reset: (now) => {
        S = { t0: now };
      },
      frame: (now, W, H) => draw(S, cx, W, H, GO, now),
      // settled: the tape punched even, stamp down
      still: (now, W, H) => draw({ t0: now - (stampAt + T.stampIn + 600) }, cx, W, H, GO, now - 1),
    };
  });

  return (
    <div
      ref={wrapRef}
      className="lf-instrument lf-tape"
      style={
        {
          "--lf-instrument-ratio": "760 / 460",
          "--lf-instrument-minh": "380px",
          "--lf-instrument-ratio-m": "360 / 460",
          "--lf-instrument-minh-m": "440px",
        } as React.CSSProperties
      }
      role="img"
      aria-label="Animation: a boxing tale of the tape. The chains' corner has every box checked — a real tech team, a website that sells, software they own, someone who picks up. Your block's corner starts with an X in every row, until an orange glove swings in and punches each one into a check. The stamp lands: fair fight — four to four on the tape."
    >
      <canvas ref={canvasRef} className="lf-instrument__canvas" aria-hidden="true" />
    </div>
  );
}
