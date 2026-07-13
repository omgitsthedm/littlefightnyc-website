import { useEffect } from "react";

/**
 * Cursor-proximity glow for the Momentum bento cards (home page).
 *
 * One pointermove listener on the section, rAF-throttled, sets three CSS
 * custom properties per card (--lf-mx / --lf-my / --lf-glow) that
 * MomentumSection.css turns into a faint orange radial tracking the pointer.
 * The glow wakes as the pointer approaches a card and peaks inside it —
 * Linear-tier ambience, not a flashlight.
 *
 * Renders nothing. Disabled entirely on touch/coarse pointers and under
 * prefers-reduced-motion (the vars are simply never set, so cards keep the
 * plain CSS hover fallback).
 */

/** Distance (px) beyond a card's edge where the glow starts waking. */
const HALO_PX = 140;

export default function MomentumCursorGlow() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    // This component commits in the same Suspense pass as MomentumSection,
    // so the section is in the DOM by the time this effect runs.
    const section = document.querySelector<HTMLElement>(".lf-momentum");
    if (!section) return;
    const cards = Array.from(
      section.querySelectorAll<HTMLElement>(".lf-momentum__card"),
    );
    if (cards.length === 0) return;

    let raf = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      for (const card of cards) {
        const r = card.getBoundingClientRect();
        const dx = Math.max(r.left - px, 0, px - r.right);
        const dy = Math.max(r.top - py, 0, py - r.bottom);
        const d = Math.hypot(dx, dy);
        if (d >= HALO_PX) {
          card.style.setProperty("--lf-glow", "0");
          continue;
        }
        card.style.setProperty("--lf-mx", `${(px - r.left).toFixed(1)}px`);
        card.style.setProperty("--lf-my", `${(py - r.top).toFixed(1)}px`);
        card.style.setProperty("--lf-glow", (1 - d / HALO_PX).toFixed(3));
      }
    };

    const onMove = (event: PointerEvent) => {
      px = event.clientX;
      py = event.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const rest = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      for (const card of cards) card.style.setProperty("--lf-glow", "0");
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", rest);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", rest);
      rest();
    };
  }, []);

  return null;
}
