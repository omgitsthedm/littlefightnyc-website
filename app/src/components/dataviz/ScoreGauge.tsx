import { useEffect, useRef } from "react";
import { MOTION } from "@/kernel/motion";
import "./ScoreGauge.css";

/**
 * ScoreGauge — a verified score drawn as an instrument ring (Laws 2 & 6).
 *
 * Only for scores with a real, published scale — today that means Lighthouse
 * metrics out of 100, identified by `isScoreValue` in ProofMetricValue. The
 * ring and number paint settled at the verified value on first paint; when the
 * gauge scrolls into view the arc sweeps from empty to the score over the
 * shared `consolidate` intent while the number ticks alongside. The svg is
 * decorative (`aria-hidden`) — the score itself stays real DOM text.
 * Reduced motion keeps the settled state and never animates.
 */

const R = 40;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function ScoreGauge({ value, className = "" }: { value: string; className?: string }) {
  const score = Math.min(100, Number.parseInt(value, 10));
  const fraction = score / 100;
  const wrapRef = useRef<HTMLSpanElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const arc = arcRef.current;
    const num = numRef.current;
    if (!wrap || !arc || !num || typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const paint = (t: number) => {
      const p = MOTION.consolidate.fn(t) * fraction;
      arc.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - p));
      num.textContent = String(Math.round(p * 100));
    };
    const settle = () => {
      arc.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction));
      num.textContent = String(score);
    };

    let raf = 0;
    const play = () => {
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / MOTION.consolidate.ms);
        paint(t);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) play();
          else {
            cancelAnimationFrame(raf);
            settle();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(wrap);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [score, fraction]);

  return (
    <span ref={wrapRef} className={`lf-gauge${className ? ` ${className}` : ""}`}>
      <svg className="lf-gauge__ring" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <circle className="lf-gauge__track" cx="48" cy="48" r={R} />
        <circle
          ref={arcRef}
          className="lf-gauge__arc"
          cx="48"
          cy="48"
          r={R}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          transform="rotate(-90 48 48)"
        />
      </svg>
      <span ref={numRef} className="lf-gauge__value">
        {value}
      </span>
    </span>
  );
}
