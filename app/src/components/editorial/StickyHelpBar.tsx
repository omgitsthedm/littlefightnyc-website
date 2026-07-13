import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PhoneAction from "./PhoneAction";
import { areaPages } from "@/data/site"; // read-only
import "./StickyHelpBar.css";

type FitCta = { label: string; detail: string; contextual: boolean; to: string };

const DEFAULT_CTA: FitCta = {
  label: "Plan",
  detail: "My website",
  contextual: false,
  to: "/tech-audit/?intent=website",
};

/**
 * The bar reads the room: the Tech Audit cell's detail line speaks to the
 * page you're on instead of repeating itself sitewide. Unknown routes keep
 * the original line exactly.
 */
function fitCta(pathname: string): FitCta {
  const p = pathname.replace(/\/+$/, "");
  if (p.startsWith("/case-studies")) {
    return { label: "Tech Audit", detail: "Want a build like this?", contextual: true, to: "/tech-audit/" };
  }
  const areaSlug = p.match(/^\/areas\/([^/]+)/)?.[1];
  if (areaSlug) {
    const area = areaPages.find((a) => a.slug === areaSlug);
    if (area) {
      return { label: "Tech Audit", detail: `Near ${area.name}? We're close.`, contextual: true, to: "/tech-audit/" };
    }
  }
  if (p === "/services/custom-local-websites") {
    return DEFAULT_CTA;
  }
  if (p.startsWith("/services")) {
    return { label: "Free consult", detail: "No pitch", contextual: true, to: "/tech-audit/" };
  }
  if (p.startsWith("/journal") || p.startsWith("/answers")) {
    return { label: "Tech Audit", detail: "Have this problem? We fix it.", contextual: true, to: "/tech-audit/" };
  }
  return DEFAULT_CTA;
}

export default function StickyHelpBar() {
  const { pathname } = useLocation();
  const trimmed = pathname.replace(/\/$/, "");
  const hide = trimmed === "/tech-audit" || trimmed === "/thanks";

  if (hide) return null;

  const cta = fitCta(pathname);

  return (
    <div className="lf-sticky-help" aria-label="Get help quickly">
      <PhoneAction
        className="lf-sticky-help__cell lf-sticky-help__cell--call"
        align="left"
        direction="up"
      >
        <span className="lf-mono lf-sticky-help__label">Call or text</span>
        <span className="lf-sticky-help__detail">(646) 360-0318</span>
      </PhoneAction>
      <Link
        className="lf-sticky-help__cell lf-sticky-help__cell--fit"
        to={cta.to}
        data-lf-event={cta.to.includes("intent=website") ? "website_plan_intent" : undefined}
        data-lf-label="sticky_help"
      >
        <span className="lf-mono lf-sticky-help__label">{cta.label}</span>
        <span
          className={`lf-sticky-help__detail${
            cta.contextual ? " lf-sticky-help__detail--ctx" : ""
          }`}
        >
          {cta.detail}
          <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
