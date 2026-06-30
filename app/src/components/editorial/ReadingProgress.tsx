import { useEffect, useState } from "react";
import "./ReadingProgress.css";

/**
 * Slim 2px progress bar at the very top of the viewport that tracks scroll
 * depth. Magazine-grade detail — subtle on the way down, never in the way.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
      setProgress(ratio);
    };

    update();

    if (reduced) return;

    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        update();
        rafId = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="lf-progress" aria-hidden="true">
      <div
        className="lf-progress__bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
