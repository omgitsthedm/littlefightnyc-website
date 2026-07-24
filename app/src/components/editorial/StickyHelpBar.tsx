import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PhoneAction from "./PhoneAction";
import "./StickyHelpBar.css";

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
      <PhoneAction
        className="lf-sticky-help__cell lf-sticky-help__cell--call"
        align="left"
        direction="up"
      >
        <span className="lf-mono lf-sticky-help__label">Tech help</span>
        <span className="lf-sticky-help__detail">Call or text</span>
      </PhoneAction>
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
