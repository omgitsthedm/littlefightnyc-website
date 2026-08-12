import { useEffect, useRef } from "react";
import { MOTION } from "@/kernel/motion";
import { splitLeadingNumber } from "./proofValues";
import "./CountUp.css";

/**
 * CountUp — an honest-instrument number tick (Small Craft Law 6).
 *
 * The rendered text is ALWAYS the verified final string: it sits in the DOM
 * from first paint, readable by everyone and every crawler. When the element
 * enters the viewport the leading integer ticks up from zero over the shared
 * `consolidate` intent, then lands exactly on the authored text. Nothing is
 * invented — the motion just lets the real number accumulate its own weight.
 *
 * Restraint rules: strings without a leading integer never move, and numbers
 * under 10 or over 999 (ranks, years, tiny counts) stay still — ticking those
 * reads as vanity, not proof. Reduced motion never animates.
 */

const MIN_TICK = 10;
const MAX_TICK = 999;

export function CountUp({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    const parts = splitLeadingNumber(text);
    if (!parts) return;
    const [prefix, target, suffix] = parts;
    if (target < MIN_TICK || target > MAX_TICK) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    let raf = 0;
    const paint = (t: number) => {
      el.textContent = `${prefix}${Math.round(MOTION.consolidate.fn(t) * target)}${suffix}`;
    };
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
    const settle = () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) play();
          else settle();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <span ref={ref} className={`lf-countup${className ? ` ${className}` : ""}`}>
      {text}
    </span>
  );
}
