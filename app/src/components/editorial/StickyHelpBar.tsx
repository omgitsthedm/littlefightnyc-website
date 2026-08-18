import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "./StickyHelpBar.css";
import { PHONE_DISPLAY, PHONE_HREF } from "@/data/contact";
import {
  acquisitionCtaForIntent,
  acquisitionIntentForPathname,
} from "@/lib/acquisitionIntent";
import { CONSENT_VISIBILITY_EVENT } from "@/lib/consent";

export default function StickyHelpBar() {
  const { pathname } = useLocation();
  const trimmed = pathname.replace(/\/$/, "");
  const onHome = trimmed === "";
  const routeIntent = acquisitionIntentForPathname(pathname);
  const helpCta = acquisitionCtaForIntent(routeIntent, "sticky_help");
  const [heroVisible, setHeroVisible] = useState(onHome);
  const [consentVisible, setConsentVisible] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.dataset.lfConsentNotice === "open",
  );

  useEffect(() => {
    if (!onHome) return;
    // The hero already carries the number and both decisions, so persistent
    // help would be a second copy of what is on screen. Reveal it once the
    // hero leaves view.
    //
    // Fail OPEN, not closed. This used to query `.lf-hero__main` and bail when
    // it was absent, leaving `heroVisible` stuck at its initial `true` — so
    // when the homepage hero was rebuilt, the bar silently never appeared and
    // the page lost its persistent help on every screen below the fold.
    // Nothing errored. If the hero cannot be found, show the bar.
    const hero = document.querySelector(".lf-wall");
    if (!hero) {
      // Queued rather than called straight from the effect body: a synchronous
      // setState here cascades a second render, and React lints against it.
      queueMicrotask(() => setHeroVisible(false));
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [onHome]);

  useEffect(() => {
    const syncConsentVisibility = (event: Event) => {
      const detail = (event as CustomEvent<{ visible?: boolean }>).detail;
      setConsentVisible(detail?.visible === true);
    };
    window.addEventListener(CONSENT_VISIBILITY_EVENT, syncConsentVisibility);
    return () =>
      window.removeEventListener(CONSENT_VISIBILITY_EVENT, syncConsentVisibility);
  }, []);

  if (
    trimmed === "/tech-audit" ||
    trimmed === "/website-check" ||
    trimmed === "/thanks" ||
    (onHome && heroVisible)
  ) {
    return null;
  }

  return (
    <div
      className="lf-sticky-help"
      aria-label="Get help quickly"
      aria-hidden={consentVisible || undefined}
      data-consent-visible={consentVisible || undefined}
      inert={consentVisible || undefined}
    >
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
        <span className="lf-mono lf-sticky-help__label">9am–9pm ET</span>
        <span className="lf-sticky-help__detail">{PHONE_DISPLAY}</span>
      </a>
      <Link
        className="lf-sticky-help__cell lf-sticky-help__cell--fit"
        to={helpCta.href}
        data-lf-event={helpCta.event}
        data-lf-label="sticky_help"
      >
        <span className="lf-mono lf-sticky-help__label">{helpCta.compactKicker ?? helpCta.kicker}</span>
        <span className="lf-sticky-help__detail">
          {helpCta.compactLabel}
          <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
