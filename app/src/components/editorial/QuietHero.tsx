import { CalendarDays, Circle, ExternalLink, Phone, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { BOOKING_HREF, PHONE_DISPLAY, PHONE_HREF } from "@/data/contact";
import { handoffToAuditLab } from "@/lib/auditPrefill";
import "./QuietHero.css";

/**
 * Homepage acquisition surface.
 *
 * The form deliberately hands off to the existing Audit Lab instead of
 * duplicating its network logic in the eager home bundle. A one-time same-tab
 * handoff keeps the submitted URL and email out of browser history; the Lab
 * lets the visitor check them and owns the measured scan state.
 */
export default function QuietHero() {
  return (
    <section className="lf-hero" aria-labelledby="lf-home-title">
      <div className="lf-hero__main">
        <div className="lf-hero__promise">
          <p className="lf-hero__eyebrow">
            <span aria-hidden="true">LF / 01</span>
            Street-level technology
          </p>

          <h1 id="lf-home-title" className="lf-hero__claim">
            Make it easier{" "}<br />
            for the next{" "}<br />
            customer to{" "}<br />
            <span>choose you.</span>
          </h1>

          <p className="lf-hero__brief">
            A clear website. Useful tech. One accountable path from first search to follow-up.
          </p>
          <p className="lf-hero__outcomes">
            Bookings. Visits. Orders. Consultations. Inquiries.
          </p>
          <p className="lf-hero__bridge">
            A table. A chair. A counter. A consultation. The next customer
            should not need a treasure map.
          </p>
        </div>

        <aside className="lf-hero__check" aria-labelledby="lf-home-check-title">
          <p className="lf-hero__check-label">
            <Search size={17} strokeWidth={1.8} aria-hidden="true" />
            Free website check
          </p>
          <h2 id="lf-home-check-title">See what gets in the way.</h2>
          <p className="lf-hero__check-dek">
            A free public-page review. Plain English. No admin login needed.
          </p>

          <form
            className="lf-hero__form"
            action="/examples/audit/"
            method="get"
            data-lf-event="website_check_started"
            data-lf-label="home_hero"
            data-lf-source="home"
            onSubmit={(event) => {
              if (event.defaultPrevented) return;
              event.preventDefault();
              handoffToAuditLab(event.currentTarget, "home");
            }}
          >
            <input type="hidden" name="source" value="home" />
            <div className="lf-hero__field">
              <label htmlFor="home-website-url">Website URL</label>
              <input
                id="home-website-url"
                data-audit-prefill="url"
                type="text"
                inputMode="url"
                autoComplete="url"
                placeholder="yourbusiness.com"
                required
              />
            </div>
            <div className="lf-hero__field">
              <label htmlFor="home-report-email">Email for the report <span>(optional here)</span></label>
              <input
                id="home-report-email"
                data-audit-prefill="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-describedby="home-report-note"
              />
            </div>
            <button type="submit">
              Check my website
              <Search size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </form>

          <p id="home-report-note" className="lf-hero__form-note">
            A useful first look. No account. No card. No sales trap.
          </p>

          <div className="lf-hero__human">
            <span aria-hidden="true"><Phone size={23} strokeWidth={1.8} /></span>
            <a href={PHONE_HREF} data-lf-label="home_hero_phone">
              <strong>Call or text Little Fight</strong>
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              className="lf-hero__human-book"
              href={BOOKING_HREF}
              target="_blank"
              rel="noopener noreferrer"
              data-lf-event="booking_started"
              data-lf-label="home_hero"
            >
              <CalendarDays size={17} strokeWidth={1.8} aria-hidden="true" />
              Book 30 minutes
            </a>
          </div>
        </aside>
      </div>

      <div className="lf-hero__proof" aria-label="Real client work">
        <div className="lf-hero__proof-label">
          <span>Real work, owner-approved</span>
          <span>Website / independent stylist</span>
        </div>

        <Link
          className="lf-hero__proof-media"
          to="/case-studies/hair-by-rachel-charles/"
          aria-label="Read the Hair By Rachel Charles case study"
        >
          <picture>
            <source
              srcSet="/assets/case-hair-by-rachel-charles-480.webp 480w, /assets/case-hair-by-rachel-charles-640.webp 640w, /assets/case-hair-by-rachel-charles.webp 1600w"
              sizes="(min-width: 900px) 46vw, 100vw"
              type="image/webp"
            />
            <img
              src="/assets/case-hair-by-rachel-charles.webp"
              width="1600"
              height="1200"
              alt="The Hair By Rachel Charles website shown across desktop, tablet, and phone"
              loading="eager"
              fetchPriority="low"
              decoding="async"
            />
          </picture>
        </Link>

        <div className="lf-hero__proof-copy">
          <p>Custom website</p>
          <h2>Hair By Rachel Charles</h2>
          <p>
            Clear services. A familiar Square booking path. Built for a
            business that earns the next appointment one chair at a time.
          </p>
          <Link to="/case-studies/hair-by-rachel-charles/">
            See what changed
          </Link>
        </div>

        <div className="lf-hero__proof-status">
          <p>Public proof</p>
          <strong><Circle size={12} fill="currentColor" aria-hidden="true" /> Live site</strong>
          <span>hairbyrachelcharles.com</span>
          <a
            href="https://hairbyrachelcharles.com"
            target="_blank"
            rel="noreferrer"
          >
            Open client site
            <ExternalLink size={15} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
