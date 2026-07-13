import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { OpenNowBadge } from "./QuietNav";
import StudioStatusStrip from "./StudioStatusStrip";
import "./QuietFooter.css";

// Hydration-safe mobile check: server snapshot says desktop (plain lists),
// the client corrects to accordions right after mount on small screens.
const MOBILE_QUERY = "(max-width: 639px)";

function subscribeMobile(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

/* Curated, not exhaustive (cleaned up 2026-07-13 per David): the hubs carry
 * the long lists — the footer names the four services and points at hubs.
 * No per-case-study, per-term, or full-neighborhood enumerations here. */
const footerGroups: Array<{ title: string; links: Array<{ label: string; to: string }> }> = [
  {
    title: "Work",
    links: [
      { label: "Custom Local Websites", to: "/services/custom-local-websites/" },
      { label: "IT Support", to: "/services/it-support/" },
      { label: "Tech Consulting", to: "/services/tech-consulting/" },
      { label: "Software You Own", to: "/services/business-systems/" },
      { label: "Free Website Scan", to: "/audit/" },
    ],
  },
  {
    title: "Proof",
    links: [
      { label: "Examples", to: "/examples/" },
      { label: "Case Studies", to: "/case-studies/" },
      { label: "The Studio", to: "/services/#studio" },
    ],
  },
  {
    title: "Answers",
    links: [
      { label: "All Answers", to: "/answers/" },
      { label: "Cut Software Costs", to: "/answers/reduce-monthly-software-costs-small-business/" },
      { label: "Not Showing on Google", to: "/answers/business-not-showing-on-google-maps/" },
      { label: "Website Down?", to: "/answers/website-down-emergency-nyc/" },
    ],
  },
  {
    title: "Local",
    links: [
      { label: "All 14 Neighborhoods", to: "/areas/" },
      { label: "SoHo", to: "/areas/soho/" },
      { label: "Midtown", to: "/areas/midtown/" },
      { label: "Williamsburg", to: "/areas/williamsburg/" },
      { label: "Astoria", to: "/areas/astoria/" },
    ],
  },
  {
    title: "Library",
    links: [
      { label: "Journal", to: "/journal/" },
      { label: "Glossary", to: "/glossary/" },
    ],
  },
];

export default function QuietFooter() {
  const year = new Date().getFullYear();
  const isMobile = useIsMobile();

  return (
    <footer className="lf-quiet-foot" role="contentinfo">
      <div className="lf-quiet-foot__inner">
        <StudioStatusStrip />
        <div className="lf-quiet-foot__top">
          <div className="lf-quiet-foot__brand">
            <Link to="/" className="lf-quiet-foot__brand-link">Little Fight NYC</Link>
            <p>New York City · Since 2012 · Still picking up the phone</p>
          </div>
          <nav className="lf-quiet-foot__company" aria-label="Company and legal">
            <Link to="/tech-audit/">Tech Audit</Link>
            <Link to="/about/">About</Link>
            <Link to="/contact/">Contact</Link>
            <Link to="/privacy/">Privacy</Link>
            <Link to="/terms/">Terms</Link>
          </nav>
        </div>

        <nav className="lf-quiet-foot__nav" aria-label="Footer">
          {footerGroups.map((group) => {
            const links = (
              <ul>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            );

            // Phones: each group folds into an accordion so the footer stops
            // being a five-screen scroll. Desktop keeps the open site map.
            return isMobile ? (
              <details className="lf-quiet-foot__group lf-quiet-foot__group--fold" key={group.title}>
                <summary>
                  <h2>{group.title}</h2>
                  <ChevronDown
                    className="lf-quiet-foot__fold-chevron"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </summary>
                {links}
              </details>
            ) : (
              <div className="lf-quiet-foot__group" key={group.title}>
                <h2>{group.title}</h2>
                {links}
              </div>
            );
          })}
        </nav>

        <div className="lf-quiet-foot__bottom">
          <p className="lf-quiet-foot__contact">
            <a href="tel:+16463600318">(646) 360-0318</a>
            <OpenNowBadge />
            <span aria-hidden="true">·</span>
            <a href="mailto:hello@littlefightnyc.com">hello@littlefightnyc.com</a>
          </p>
          <p className="lf-quiet-foot__legal">
            © {year} Little Fight NYC. All rights reserved.
          </p>
        </div>

        <p className="lf-quiet-foot__signature">
          Designed, Hosted and Cared For by{" "}
          <a
            href="https://littlefightnyc.com"
            rel="author"
          >
            LittleFightNYC.com
          </a>
        </p>
      </div>
    </footer>
  );
}
