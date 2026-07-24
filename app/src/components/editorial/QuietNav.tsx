import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, MessageSquare, Phone, X } from "lucide-react";
import PhoneAction from "./PhoneAction";
import TugMark from "./TugMark";
import { useOpenNow } from "@/lib/openNow";
import "./QuietNav.css";

const NAV_LINKS = [
  { label: "What we fix", to: "/services/" },
  { label: "Work", to: "/examples/" },
  { label: "About", to: "/about/" },
  { label: "Answers", to: "/library/" },
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
  const scrollSentinelRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The panel closes on link tap (see the panel NavLinks) — no route-change
  // effect, so there's no synchronous setState-in-effect.

  // Chrome condenses + gains a glass floor once the top sentinel leaves view.
  // IntersectionObserver avoids continuous main-thread work while scrolling.
  useEffect(() => {
    const sentinel = scrollSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // The mobile drawer cannot survive into the desktop layout. Close it as
  // soon as a resize or device rotation crosses the toggle breakpoint so the
  // page never remains scroll-locked or inert without a visible close button.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeAtDesktop);
    return () => desktop.removeEventListener("change", closeAtDesktop);
  }, []);

  // While open: Escape closes (returns focus to the toggle), and Tab is
  // trapped inside the panel so keyboard users never fall behind it.
  useEffect(() => {
    if (!open) return;

    // Lock background scroll so the page behind the modal drawer can't move.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Hide the page behind the modal from assistive tech (the scroll lock +
    // focus trap handle sighted/keyboard users; `inert` handles AT swipe-nav).
    const behind = [
      document.getElementById("main-content"),
      document.querySelector("footer"),
    ].filter(Boolean) as HTMLElement[];
    behind.forEach((el) => el.setAttribute("inert", ""));

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
        // Cycle manually instead of only intercepting at the edges: Safari
        // keeps links OUT of the native Tab order (macOS Full Keyboard
        // Access is off by default), so relying on native tabbing between
        // the edges lets focus escape the open drawer entirely.
        e.preventDefault();
        const active = document.activeElement as HTMLElement | null;
        const idx = active ? focusables.indexOf(active) : -1;
        const next =
          idx === -1
            ? e.shiftKey
              ? focusables.length - 1
              : 0
            : (idx + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
        focusables[next].focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      behind.forEach((el) => el.removeAttribute("inert"));
    };
  }, [open]);

  return (
    <>
    <span ref={scrollSentinelRef} className="lf-nav__scroll-sentinel" aria-hidden="true" />
    <header className="lf-nav" data-scrolled={scrolled}>
      <div className="lf-nav__inner">
        <Link to="/" className="lf-nav__brand" aria-label="Little Fight NYC — home">
          <TugMark className="lf-nav__mark" />
          <span>Little Fight NYC</span>
        </Link>

        <nav className="lf-nav__primary" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `lf-nav__link${isActive ? " lf-nav__link--active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="lf-nav__actions">
          {/* The open/replies chip moved out of the bar (2026-07-18, David:
              desktop header was cramped) — availability lives in the hero
              trust row, the neon sign, and the footer. */}
          <PhoneAction
            className="lf-nav__phone"
            align="right"
            ariaLabel="Call or text (646) 360-0318"
          >
            <Phone className="lf-nav__phone-icon" size={17} strokeWidth={1.9} aria-hidden="true" />
            <span className="lf-nav__phone-short">Call</span>
            <span className="lf-nav__phone-number">(646) 360-0318</span>
          </PhoneAction>

          <Link
            to="/tech-audit/?intent=website"
            className="lf-nav__start"
            data-lf-event="website_plan_intent"
            data-lf-label="nav_desktop"
          >
            Get my website plan
            <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
          </Link>

          <button
            ref={toggleRef}
            type="button"
            className="lf-nav__toggle"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
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
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <nav className="lf-nav__panel-nav" aria-label="Primary mobile">
              <p className="lf-nav__panel-label" aria-hidden="true">Go to</p>
              {NAV_LINKS.map((link, i) => (
                <NavLink
                  key={link.to}
                  to={link.to}
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
                  to="/tech-audit/?intent=website"
                  data-lf-event="website_plan_intent"
                  data-lf-label="mobile_menu"
                  onClick={() => setOpen(false)}
                  className="lf-nav__panel-fit"
                >
                  Get my website plan
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
                  Available 9am-9pm New York time.
                </p>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
    </>
  );
}
