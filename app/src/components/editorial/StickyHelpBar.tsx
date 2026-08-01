import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "./StickyHelpBar.css";
import { PHONE_DISPLAY, PHONE_HREF } from "@/data/contact";

export default function StickyHelpBar() {
  const { pathname } = useLocation();
  const trimmed = pathname.replace(/\/$/, "");
  const onHome = trimmed === "";
  const [heroVisible, setHeroVisible] = useState(onHome);

  useEffect(() => {
    if (!onHome) return;
    const hero = document.querySelector(".lf-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [onHome]);

  if (trimmed === "/tech-audit" || trimmed === "/thanks" || (onHome && heroVisible)) {
    return null;
  }

  return (
    <div className="lf-sticky-help" aria-label="Get help quickly">
      {/* A direct tel: link, not a disclosure. This cell used to open a
          Call/Text menu, which cost two taps to dial on every route that
          shows the bar, and never put the digits on screen. The header and
          the Spanish page already do it this way. Text stays one tap away in
          the nav panel, which is the right place for the second choice — a
          third cell here would shrink every tap target on a 375px bar.
          analytics.ts auto-tracks tel: clicks as phone_click. */}
      <a
        className="lf-sticky-help__cell lf-sticky-help__cell--call"
        href={PHONE_HREF}
        data-lf-label="sticky_help_phone"
      >
        <span className="lf-mono lf-sticky-help__label">Tech help</span>
        <span className="lf-sticky-help__detail">{PHONE_DISPLAY}</span>
      </a>
      <Link
        className="lf-sticky-help__cell lf-sticky-help__cell--fit"
        to="/tech-audit/?intent=website"
        data-lf-event="website_plan_intent"
        data-lf-label="sticky_help"
      >
        <span className="lf-mono lf-sticky-help__label">Website</span>
        <span className="lf-sticky-help__detail">
          Start free
          <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
