import { clamp, lerp, eoc, eoBack } from "@/kernel/motion";
import { rr, glow, DISP, MONO, ORANGE, RED, GREEN, useInstrumentCanvas } from "./instrument";

/**
 * TheDirectLine — the contact page's promise, drawn as a race.
 *
 * Two lanes run at once. THE USUAL WAY: a gray dot crawls a dashed maze —
 * PRESS 1 → HOLD → TRANSFER → PRESS 4 → VOICEMAIL — stalls at HOLD, and dies
 * at a red ✗. CALLING US: one straight orange line, YOU → A REAL PERSON; a
 * pulse fires across in under a second and the person node pings PICKED UP,
 * again and again while the gray dot is still on hold. The timing contrast IS
 * the argument. Stamp: NO PHONE TREE. NO TICKET.
 *
 * Honest: no invented hold-time numbers — just the mechanism everyone has
 * lived, against the real promise on this page (a person answers; 2-hour
 * callbacks 9am–9pm). Reduced-motion: the settled frame — maze dead-ended,
 * direct line lit.
 */

const MAZE = ["PRESS 1", "HOLD", "TRANSFER", "PRESS 4", "VOICEMAIL"];
const LOOP = 9000;

type Sim = { t0: number };

function draw(S: Sim, cx: CanvasRenderingContext2D, W: number, H: number, GO: HTMLCanvasElement, now: number) {
  const pt = (now - S.t0) % LOOP;
  cx.clearRect(0, 0, W, H);
  const wide = W > H * 1.15;
  const inF = eoc(clamp(pt / 700, 0, 1));

  const leftX = W * 0.08;
  const rightX = W * 0.92;
  const mazeY = H * (wide ? 0.3 : 0.26);
  const lineY = H * (wide ? 0.72 : 0.74);
  const nodeFs = Math.max(10, (H * (wide ? 0.032 : 0.026)) | 0);

  cx.textBaseline = "middle";

  // ── lane labels ──
  cx.globalAlpha = inF;
  cx.font = "500 " + Math.max(10, (H * 0.03) | 0) + "px " + MONO;
  cx.fillStyle = "rgba(150,154,164,.8)";
  cx.textAlign = "left";
  cx.fillText("THE USUAL WAY", leftX, mazeY - H * 0.16);
  cx.fillStyle = "rgba(250,190,140,.95)";
  cx.fillText("CALLING US", leftX, lineY - H * 0.16);
  cx.globalAlpha = 1;

  // ── THE MAZE (gray, wandering, dashed) ──
  // waypoints wander vertically around mazeY
  const pts = MAZE.map((_, i) => ({
    x: lerp(leftX + W * 0.1, rightX - W * 0.02, i / (MAZE.length - 1)),
    y: mazeY + (i % 2 === 0 ? -1 : 1) * H * (wide ? 0.055 : 0.045),
  }));
  const start = { x: leftX, y: mazeY };
  const path = [start, ...pts];

  cx.globalAlpha = inF;
  cx.setLineDash([4, 6]);
  cx.strokeStyle = "rgba(150,154,164,.45)";
  cx.lineWidth = 1.4;
  cx.beginPath();
  cx.moveTo(path[0].x, path[0].y);
  for (const p of path.slice(1)) cx.lineTo(p.x, p.y);
  cx.stroke();
  cx.setLineDash([]);

  // maze nodes
  MAZE.forEach((label, i) => {
    const p = pts[i];
    const dead = label === "VOICEMAIL";
    cx.font = "500 " + nodeFs + "px " + MONO;
    const w = cx.measureText(label).width + 18;
    const h = nodeFs + 14;
    rr(cx, p.x - w / 2, p.y - h / 2, w, h, h / 2);
    cx.fillStyle = dead ? "rgba(248,113,113,.10)" : "rgba(255,255,255,.05)";
    cx.fill();
    cx.strokeStyle = dead ? "rgba(248,113,113,.5)" : "rgba(150,154,164,.4)";
    cx.lineWidth = 1.2;
    cx.stroke();
    cx.fillStyle = dead ? RED : "rgba(190,195,205,.75)";
    cx.textAlign = "center";
    cx.fillText(label, p.x, p.y + 1);
  });

  // the poor gray dot: crawls, stalls hard at HOLD (seg 1→2), dies at the end
  // progress mapped over the loop: reaches HOLD ~15%, sits until ~55%, dead by 92%
  const crawl = pt / LOOP;
  let seg;
  if (crawl < 0.15) seg = (crawl / 0.15) * 2; // start → PRESS 1 → HOLD
  else if (crawl < 0.55) seg = 2 + Math.sin(pt * 0.01) * 0.02; // stuck on hold (tiny jitter)
  else if (crawl < 0.92) seg = 2 + ((crawl - 0.55) / 0.37) * 3; // hold → voicemail
  else seg = 5;
  const si = Math.min(Math.floor(seg), path.length - 2);
  const sf = clamp(seg - si, 0, 1);
  const dx = lerp(path[si].x, path[si + 1].x, sf);
  const dy = lerp(path[si].y, path[si + 1].y, sf);
  const dead = crawl >= 0.92;
  cx.fillStyle = dead ? "rgba(248,113,113,.7)" : "rgba(190,195,205,.9)";
  cx.beginPath();
  cx.arc(dx, dy, 4.5, 0, 7);
  cx.fill();
  // "…" thought while on hold
  if (crawl >= 0.18 && crawl < 0.55) {
    const dots = 1 + (Math.floor(pt / 400) % 3);
    cx.fillStyle = "rgba(150,154,164,.8)";
    cx.font = "700 " + nodeFs + "px " + MONO;
    cx.textAlign = "left";
    cx.fillText(".".repeat(dots), dx + 10, dy - 14);
  }
  // dead ✗
  if (dead) {
    cx.strokeStyle = RED;
    cx.lineWidth = 2.4;
    cx.lineCap = "round";
    const p = pts[pts.length - 1];
    cx.beginPath();
    cx.moveTo(p.x - 6, p.y - 20);
    cx.lineTo(p.x + 6, p.y - 32);
    cx.moveTo(p.x + 6, p.y - 20);
    cx.lineTo(p.x - 6, p.y - 32);
    cx.stroke();
  }
  cx.globalAlpha = 1;

  // ── THE DIRECT LINE (orange, straight, fast) ──
  cx.globalAlpha = inF;
  // endpoints
  cx.font = "600 " + Math.max(11, (H * 0.036) | 0) + "px " + DISP;
  cx.fillStyle = "#fff";
  cx.textAlign = "left";
  cx.fillText("YOU", leftX, lineY - H * 0.07);
  cx.textAlign = "right";
  cx.fillText("A REAL PERSON", rightX, lineY - H * 0.07);

  // the line itself
  cx.strokeStyle = "rgba(249,115,22,.55)";
  cx.lineWidth = 2.5;
  cx.beginPath();
  cx.moveTo(leftX, lineY);
  cx.lineTo(rightX, lineY);
  cx.stroke();

  // repeated fast pulses: fire at 1s, 3.5s, 6s into each loop, 650ms travel
  for (const t0 of [1000, 3500, 6000]) {
    const f = (pt - t0) / 650;
    if (f < 0 || f > 1.6) continue;
    const travel = eoc(clamp(f, 0, 1));
    const px = lerp(leftX, rightX, travel);
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = inF * (f <= 1 ? 0.9 : 0.9 - (f - 1) * 1.4);
    cx.drawImage(GO, px - 20, lineY - 20, 40, 40);
    cx.globalAlpha = inF;
    cx.globalCompositeOperation = "source-over";
    if (f <= 1) {
      cx.fillStyle = ORANGE;
      cx.beginPath();
      cx.arc(px, lineY, 5, 0, 7);
      cx.fill();
    }
    // arrival ping
    if (f > 1 && f < 1.6) {
      const ring = (f - 1) / 0.6;
      cx.strokeStyle = `rgba(249,115,22,${(0.8 * (1 - ring)).toFixed(3)})`;
      cx.lineWidth = 2;
      cx.beginPath();
      cx.arc(rightX, lineY, 8 + ring * 26, 0, 7);
      cx.stroke();
    }
  }

  // person node — glows brighter with each pickup
  const lastPickup = [1000, 3500, 6000].filter((t) => pt > t + 650).length;
  cx.globalCompositeOperation = "lighter";
  cx.globalAlpha = inF * (0.3 + lastPickup * 0.15);
  cx.drawImage(GO, rightX - 26, lineY - 26, 52, 52);
  cx.globalAlpha = inF;
  cx.globalCompositeOperation = "source-over";
  cx.fillStyle = ORANGE;
  cx.beginPath();
  cx.arc(rightX, lineY, 7, 0, 7);
  cx.fill();

  // PICKED UP tally (honest: counts this animation's pickups)
  if (lastPickup > 0) {
    cx.fillStyle = GREEN;
    cx.font = "500 " + Math.max(10, (H * 0.028) | 0) + "px " + MONO;
    cx.textAlign = "right";
    cx.fillText("PICKED UP ×" + lastPickup, rightX, lineY + H * 0.08);
  }

  // stamp
  if (pt > 6800 || pt < 400) {
    const f = pt > 6800 ? eoBack(clamp((pt - 6800) / 400, 0, 1)) : 1;
    cx.globalAlpha = inF * f;
    cx.fillStyle = ORANGE;
    cx.font = "700 " + Math.max(13, (H * 0.05) | 0) + "px " + DISP;
    cx.textAlign = "center";
    cx.fillText("NO PHONE TREE. NO TICKET.", W * 0.5, H * (wide ? 0.93 : 0.95));
  }
  cx.globalAlpha = 1;
}

export default function TheDirectLine() {
  const { wrapRef, canvasRef } = useInstrumentCanvas((cx) => {
    const GO = glow("rgba(249,115,22,1)", 30);
    let S: Sim = { t0: performance.now() };
    return {
      reset: (now) => {
        S = { t0: now };
      },
      frame: (now, W, H) => draw(S, cx, W, H, GO, now),
      // settled: maze dead-ended, line lit, stamp shown
      still: (now, W, H) => draw({ t0: now - 7400 }, cx, W, H, GO, now),
    };
  });

  return (
    <div
      ref={wrapRef}
      className="lf-instrument lf-directline"
      style={
        {
          "--lf-instrument-ratio": "760 / 400",
          "--lf-instrument-minh": "320px",
          "--lf-instrument-ratio-m": "360 / 380",
          "--lf-instrument-minh-m": "360px",
        } as React.CSSProperties
      }
      role="img"
      aria-label="Animation: two ways to reach help, racing. The usual way — a gray dot crawls through press 1, hold, transfer, press 4, and dies at voicemail with a red X. Calling us — one straight orange line from you to a real person; the call crosses in under a second and gets picked up, again and again, while the gray dot is still on hold. No phone tree. No ticket."
    >
      <canvas ref={canvasRef} className="lf-instrument__canvas" aria-hidden="true" />
    </div>
  );
}
