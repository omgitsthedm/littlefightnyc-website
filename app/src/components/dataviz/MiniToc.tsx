import { useEffect, useState } from "react";
import "./MiniToc.css";

/**
 * MiniToc — slim sticky "On this page" rail for long posts (>1200 real
 * words). Desktop-only (≥1024px, see MiniToc.css); JournalPost injects the
 * matching ids into the post's h2s. Scroll-spy is a cheap rAF-throttled
 * position check (max ~8 headings), highlighting the section in view.
 */

export type TocItem = { id: string; label: string };

const SPY_OFFSET = 160; // px from viewport top — matches h2 scroll-margin-top

export default function MiniToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= SPY_OFFSET) current = item.id;
        else break;
      }
      setActive(current);
    };
    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="lf-post-toc" aria-label="On this page">
      <div className="lf-post-toc__rail">
        <p className="lf-post-toc__label">On this page</p>
        <ol className="lf-post-toc__list">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="lf-post-toc__link"
                aria-current={active === item.id ? "true" : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
