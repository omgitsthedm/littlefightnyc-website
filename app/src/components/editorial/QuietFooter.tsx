import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { OpenNowBadge } from "./QuietNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { openConsentPreferences } from "@/lib/consent";
import "./QuietFooter.css";
import { PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";

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

/* Curated, not exhaustive: the hubs carry the long lists — the footer names
 * the acquisition and continuity paths owners most often need.
 * No per-case-study, per-term, or full-neighborhood enumerations here. */
const footerGroups: Array<{
  title: string;
  links: Array<{ label: string; to: string; external?: boolean }>;
}> = [
  {
    title: "What we fix",
    links: [
      { label: "Custom websites", to: "/services/custom-local-websites/" },
      { label: "Broken tech", to: "/services/it-support/" },
      { label: "Free second opinion", to: "/services/tech-consulting/" },
      { label: "Software You Own", to: "/services/business-systems/" },
      { label: "New business launch", to: "/services/new-business-launch/" },
      { label: "Ongoing care", to: "/services/ongoing-care/" },
    ],
  },
  {
    title: "Work",
    links: [
      { label: "See every project", to: "/examples/" },
      { label: "Check my website", to: "/website-check/" },
      { label: "Try the Lab", to: "/examples/lab/" },
      // /examples/audit/ IS the live check, not a sample of one. The old
      // label ("See a site audit") read like a specimen.
      { label: "Run the free check", to: "/examples/audit/" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Plain-English answers", to: "/library/" },
      { label: "NYC Neighborhoods", to: "/areas/" },
      { label: "Websites Nationwide", to: "/nationwide/" },
      { label: "Current client desk", to: "/clients/" },
    ],
  },
];

export default function QuietFooter() {
  const year = new Date().getFullYear();
  const isMobile = useIsMobile();

  return (
    <footer className="lf-quiet-foot" role="contentinfo">
      <div className="lf-quiet-foot__inner">
        <div className="lf-quiet-foot__top">
          <div className="lf-quiet-foot__brand">
            <Link to="/" className="lf-quiet-foot__brand-link">Little Fight NYC</Link>
            <p>New York City · Since 2021 · Still picking up the phone</p>
          </div>
          <nav className="lf-quiet-foot__company" aria-label="Company and legal">
            <Link to="/about/">About</Link>
            <Link to="/contact/">Contact</Link>
            {/* /privacy/ and /terms/ render this same page and canonicalise to
                /legal/, so one link to the canonical rather than two labels for
                one document. Both words stay in the label. */}
            <Link to="/legal/">Privacy &amp; terms</Link>
            <button
              type="button"
              className="lf-quiet-foot__privacy-button"
              onClick={openConsentPreferences}
            >
              Privacy choices
            </button>
            <Link to="/es/" lang="es">
              En español</Link>{" · "}<Link to="/zh/">中文
            </Link>
          </nav>
        </div>

        <nav className="lf-quiet-foot__nav" aria-label="Footer">
          {footerGroups.map((group) => {
            const links = (
              <ul>
                {group.links.map((link) => (
                  <li key={link.to}>
                    {link.external ? (
                      <a href={link.to} rel="external">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to}>{link.label}</Link>
                    )}
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
            <a href={PHONE_HREF} data-lf-label="footer_phone">{PHONE_DISPLAY}</a>
            <OpenNowBadge />
            <span aria-hidden="true">·</span>
            <span>Daily 9am–9pm ET</span>
            <span aria-hidden="true">·</span>
            <a href={SMS_HREF} data-lf-label="footer_sms">Text</a>
            <span aria-hidden="true">·</span>
            <a href="mailto:hello@littlefightnyc.com">hello@littlefightnyc.com</a>
            <span aria-hidden="true">·</span>
            <Link to="/tech-audit/" data-lf-label="footer_form">Form</Link>
          </p>
          <p className="lf-quiet-foot__legal">
            © {year} Little Fight NYC. All rights reserved.
          </p>
          {/* Renders null until a second language bundle exists. */}
          <LanguageSwitcher />
        </div>

        <p className="lf-quiet-foot__signature">
          Designed, hosted, and cared for by{" "}
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
