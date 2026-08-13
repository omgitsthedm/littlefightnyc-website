import { CalendarDays, ExternalLink, Search } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import { BOOKING_HREF } from "@/data/contact";
import { handoffToAuditLab } from "@/lib/auditPrefill";
import "@/styles/editorial/revenue-pages.css";

export default function WebsiteCheck() {
  return (
    <>
      <PageHero
        eyebrow="Free website check"
        icon={Search}
        title={<>See what gets in the way.</>}
        dek="A public-page read for performance, accessibility, search basics, and best-practice signals. The private report also says what it could not check."
        image={{
          src: "/assets/journal-what-a-free-tech-audit-actually-looks-like.webp",
          alt: "Little Fight NYC Website Audit Lab preview",
          width: 1600,
          height: 1067,
        }}
      />

      <section className="lf-revenue-page lf-website-check" aria-labelledby="lf-website-check-title">
        <header className="lf-revenue-page__intro">
          <p>Public page in</p>
          <h2 id="lf-website-check-title">Measured findings out.</h2>
          <div>
            <p>
              The scan reads only the public website. It does not need a login,
              card, password, analytics account, or access to the business.
            </p>
            <p>
              The Audit Lab asks for an email before it delivers a private
              report. A person can review it with you for free. A sales call is
              not required.
            </p>
          </div>
        </header>

        <form
          className="lf-website-check__form"
          action="/examples/audit/"
          method="get"
          data-lf-event="website_check_started"
          data-lf-label="website_check_page"
          data-lf-source="website_check"
          onSubmit={(event) => {
            event.preventDefault();
            handoffToAuditLab(event.currentTarget, "website_check_page");
          }}
        >
          <input type="hidden" name="source" value="website_check_page" />
          <label htmlFor="website-check-url">Website URL</label>
          <input id="website-check-url" data-audit-prefill="url" type="text" inputMode="url" autoComplete="url" placeholder="yourbusiness.com" required />
          <label htmlFor="website-check-email">Email for the private report <span>(optional on this screen)</span></label>
          <input id="website-check-email" data-audit-prefill="email" type="email" autoComplete="email" placeholder="you@company.com" />
          <button type="submit">
            Open the Website Check
            <Search size={18} strokeWidth={2} aria-hidden="true" />
          </button>
          <p>A useful first look. No account, card, password, or automatic sales call.</p>
        </form>

        <section
          className="lf-revenue-page__handoff lf-website-check__booking"
          aria-labelledby="lf-website-check-booking-title"
        >
          <div>
            <p>Prefer a human first?</p>
            <h2 id="lf-website-check-booking-title">Free second opinion.</h2>
            <p>
              The booking page shows its current available times and meeting
              details. We look at your public website together and name the
              clearest next move. No login, prep, or commitment.
            </p>
          </div>
          <a
            href={BOOKING_HREF}
            target="_blank"
            rel="noopener noreferrer"
            data-lf-event="booking_started"
            data-lf-label="website_check_page"
          >
            <CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" />
            Choose a time
            <ExternalLink size={15} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </section>
      </section>
    </>
  );
}
