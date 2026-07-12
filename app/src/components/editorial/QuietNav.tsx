import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, MessageSquare, Phone, X } from "lucide-react";
import PhoneAction from "./PhoneAction";
import { useOpenNow } from "@/lib/openNow";
import { openCommandPalette } from "@/lib/palette";
import "./QuietNav.css";

const NAV_LINKS = [
  { label: "Services", to: "/services/" },
  { label: "Examples", to: "/examples/" },
  { label: "About", to: "/about/" },
  { label: "Journal", to: "/journal/" },
  { label: "Contact", to: "/contact/" },
] as const;

/**
 * Honest availability dot for the callback window (9am–9pm ET, computed in
 * lib/openNow.ts and re-checked every minute). Shared by the nav (next to the
 * phone) and the footer contact row. Styles live in QuietNav.css (.lf-open).
 */
export function OpenNowBadge({ className }: { className?: string }) {
  const openNow = useOpenNow();
  return (
    <span
      className={`lf-open${openNow.open ? " lf-open--live" : ""}${
        className ? ` ${className}` : ""
      }`}
      role="status"
      aria-label={openNow.sentence}
    >
      <span className="lf-open__dot" aria-hidden="true" />
      <span className="lf-open__label" aria-hidden="true">
        {openNow.label}
      </span>
    </span>
  );
}

export default function QuietNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The panel closes on link tap (see the panel NavLinks) — no route-change
  // effect, so there's no synchronous setState-in-effect.

  // Chrome condenses + gains a glass floor once the page scrolls off the hero.
  // setState only fires inside the scroll handler (an event), never sync-in-effect.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While open: Escape closes (returns focus to the toggle), and Tab is
  // trapped inside the panel so keyboard users never fall behind it.
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const focusables = panel
      ? Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled])'
          )
        )
      : [];
    focusables[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key === "Tab" && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="lf-nav" data-scrolled={scrolled}>
      <div className="lf-nav__inner">
        <Link to="/" className="lf-nav__brand" aria-label="Little Fight NYC — home" viewTransition>
          Little Fight NYC
        </Link>

        <nav className="lf-nav__primary" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              viewTransition
              className={({ isActive }) =>
                `lf-nav__link${isActive ? " lf-nav__link--active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="lf-nav__actions">
          <OpenNowBadge className="lf-open--nav" />

          <PhoneAction className="lf-nav__phone" align="right">
            <span className="lf-nav__phone-label">Call or text</span>
            <span className="lf-nav__phone-number">(646) 360-0318</span>
          </PhoneAction>

          <button
            type="button"
            className="lf-nav__cmdk"
            aria-label="Open quick navigation (Command K)"
            onClick={openCommandPalette}
          >
            <kbd aria-hidden="true">⌘K</kbd>
          </button>

          <button
            ref={toggleRef}
            type="button"
            className="lf-nav__toggle"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X size={22} strokeWidth={1.9} aria-hidden="true" />
            ) : (
              <Menu size={22} strokeWidth={1.9} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="lf-nav__scrim"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            id={panelId}
            className="lf-nav__panel"
          >
            <nav className="lf-nav__panel-nav" aria-label="Primary mobile">
              <p className="lf-nav__panel-label" aria-hidden="true">Go to</p>
              {NAV_LINKS.map((link, i) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  viewTransition
                  onClick={() => setOpen(false)}
                  style={{ ["--lf-i" as string]: i }}
                  className={({ isActive }) =>
                    `lf-nav__panel-link${isActive ? " lf-nav__panel-link--active" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <p className="lf-nav__panel-label lf-nav__panel-label--talk" aria-hidden="true">
                Talk to us
              </p>
              <div className="lf-nav__panel-actions">
                <Link
                  to="/tech-audit/"
                  viewTransition
                  onClick={() => setOpen(false)}
                  className="lf-nav__panel-fit"
                >
                  Start the Tech Audit
                  <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
                </Link>
                <div className="lf-nav__panel-reach">
                  <a className="lf-nav__panel-reach-btn" href="tel:+16463600318">
                    <Phone size={16} strokeWidth={1.9} aria-hidden="true" />
                    Call
                  </a>
                  <a className="lf-nav__panel-reach-btn" href="sms:+16463600318">
                    <MessageSquare size={16} strokeWidth={1.9} aria-hidden="true" />
                    Text
                  </a>
                </div>
                <p className="lf-nav__panel-note">
                  A human answers, 9am-9pm New York time.
                </p>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
