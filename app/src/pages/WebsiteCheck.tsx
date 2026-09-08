import { ArrowRight, CalendarDays, ExternalLink, Loader2, Mail, MessageSquare, Phone, Search } from "lucide-react";
import { useState } from "react";
import { BOOKING_HREF, PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";
import { handoffToAuditLab } from "@/lib/auditPrefill";
import FaqList from "@/components/editorial/FaqList";
import websiteCheckContent from "@/data/website-check-content.json";
import "@/styles/editorial/revenue-pages.css";
import "./WebsiteCheck.css";

export default function WebsiteCheck() {
  // Doherty: the submit hands off to the Lab with a full-page load (~1s on a
  // phone). The button answers within the same frame — "Checking
  // yourbusiness.com…", spinner, aria-busy — so the wait is never silent, and
  // a second tap cannot start a second handoff.
  const [checking, setChecking] = useState<string | null>(null);
  return (
    <>
      <section className="lf-website-check" aria-labelledby="lf-website-check-title">
        <header className="lf-website-check__intro" data-lf-owner-intro="true">
          <p className="lf-website-check__eyebrow">A free first look</p>
          <h1 id="lf-website-check-title">See what a new <br />customer sees.</h1>
          <div className="lf-website-check__intro-note">
            <p>A first website, a better one, or less daily busywork.</p>
            <a
              className="lf-website-check__start"
              href="/tech-audit/?intent=website&source=no_website_check"
              data-lf-primary-action="true"
              data-lf-event="human_review_requested"
              data-lf-label="no_website_check"
              data-lf-source="website_check"
            >
              Start a free first look <ArrowRight size={20} aria-hidden="true" />
            </a>
            <div className="lf-website-check__contact" data-lf-contact-rail="true">
              <a href={PHONE_HREF}>Call {PHONE_DISPLAY}</a>
              <a href={SMS_HREF}>Text</a>
              <a href="mailto:hello@littlefightnyc.com">Email</a>
              <a href="/tech-audit/">Form</a>
            </div>
            <p className="lf-website-check__hours">9am–9pm Eastern: a human answers. After hours: leave a message.</p>
          </div>
        </header>

        <section id="website-check-start" className="lf-website-check__choices" aria-labelledby="lf-website-check-choice-title">
          <h2 className="lf-website-check__choices-kicker" id="lf-website-check-choice-title">Choose how to start.</h2>
          <div className="lf-website-check__choices-grid">
            <article className="lf-website-check__choice lf-website-check__choice--person">
              <p className="lf-website-check__eyebrow">For any starting point</p>
              <h3>Let’s look at<br />your business.</h3>
              <p>Already online? Starting from scratch? Both belong here.</p>
              <a
                href="/tech-audit/?intent=website&source=no_website_check"
                data-lf-event="human_review_requested"
                data-lf-label="no_website_check"
                data-lf-source="website_check"
              >
                Tell us what you need
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              <p className="lf-website-check__reassurance">No technical brief. No passwords. No commitment.</p>
              <ol className="lf-website-check__steps">
                <li><strong>Tell us what you need.</strong><span>A website, social page, or just an idea.</span></li>
                <li><strong>We look at what matters.</strong><span>What customers see. What slows you down.</span></li>
                <li><strong>You get a clear next step.</strong><span>What to keep, what to fix, what can wait.</span></li>
              </ol>
            </article>
            <article className="lf-website-check__choice lf-website-check__choice--automated">
              <p className="lf-website-check__eyebrow">Optional · Automated check</p>
              <h3>Want to check<br />a website now?</h3>
              <p>Run a free technical check of a public website.</p>
              <p>It can flag technical issues. It cannot judge your whole business.</p>
              <a href="#website-check-url" data-lf-label="website_check_existing_site">
                Check my website
                <Search size={18} aria-hidden="true" />
              </a>
              <p className="lf-website-check__reassurance">No login or card. Results depend on available measurements.</p>
              <div className="lf-website-check__limits">
                <h4>Useful information. Honest limits.</h4>
                <p>Missing measurements stay blank. A score is not a business plan.</p>
                <p>You can always start with a person instead.</p>
              </div>
            </article>
          </div>
        </section>

        <div className="lf-website-check__report" aria-labelledby="lf-website-check-report-title">
          <div className="lf-website-check__report-intro">
            <p className="lf-website-check__eyebrow">The optional check</p>
            <h2 id="lf-website-check-report-title">A useful place<br />to start.</h2>
            <p>Enter a public website below. Your details carry into the Audit Lab.</p>
            <p>There, you review the request before the check starts.</p>
          </div>
        <form
          className="lf-website-check__form"
          action="/examples/audit/"
          method="get"
          data-lf-event="website_check_started"
          data-lf-label="website_check_page"
          data-lf-source="website_check"
          onSubmit={(event) => {
            event.preventDefault();
            if (checking !== null) return;
            const form = event.currentTarget;
            const url = (form.querySelector<HTMLInputElement>("#website-check-url")?.value ?? "").trim();
            setChecking(url.replace(/^https?:\/\//i, "").replace(/\/.*$/, "") || "your website");
            // Let the pending state paint before the navigation starts.
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => handoffToAuditLab(form, "website_check_page"));
            });
          }}
          aria-busy={checking !== null}
        >
          <input type="hidden" name="source" value="website_check_page" />
          <div className="lf-website-check__automated-controls">
            <label htmlFor="website-check-url">Website URL</label>
            <input id="website-check-url" data-audit-prefill="url" type="text" inputMode="url" autoComplete="url" placeholder="yourbusiness.com" required />
            <label htmlFor="website-check-email">Email for your private report</label>
            <input id="website-check-email" data-audit-prefill="email" type="email" autoComplete="email" placeholder="you@company.com" />
            <button type="submit" disabled={checking !== null} data-checking={checking !== null || undefined}>
              {checking !== null ? (
                <>
                  Checking {checking}…
                  <Loader2 className="lf-website-check__spinner" size={18} strokeWidth={2} aria-hidden="true" />
                </>
              ) : (
                <>
                  Check my website
                  <Search size={18} strokeWidth={2} aria-hidden="true" />
                </>
              )}
            </button>
            <p className="lf-website-check__status" role="status" aria-live="polite">
              {checking !== null ? `Opening the report for ${checking}. This takes a moment.` : ""}
            </p>
          </div>
          <p>Free. No account, card, or password. No automatic sales call.</p>
          <noscript>
            <style>{`.lf-website-check__automated-controls { display: none; }`}</style>
            <p className="lf-website-check__noscript">
              The automated check needs JavaScript. <a href="/tech-audit/?intent=website&source=website_check_page">Start a free human first look instead.</a>
            </p>
          </noscript>
        </form>
        </div>

        <section
          className="lf-revenue-page__handoff lf-website-check__booking"
          aria-labelledby="lf-website-check-booking-title"
        >
          <div>
            <p>Want a person first?</p>
            <h2 id="lf-website-check-booking-title">Look at it together.</h2>
            <p>
              Choose a time. We look at your public website together and name
              the clearest next move. No login, prep, or commitment.
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
            Pick a time
            <ExternalLink size={15} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </section>
        <p className="lf-website-check__direct">
          Need help now? <a href={PHONE_HREF}><Phone size={16} aria-hidden="true" />Call {PHONE_DISPLAY}</a>
          <a href={SMS_HREF}><MessageSquare size={16} aria-hidden="true" />Text</a>
          <a href="mailto:hello@littlefightnyc.com"><Mail size={16} aria-hidden="true" />Email</a>
        </p>

        <FaqList
          title="Questions before you start"
          items={websiteCheckContent.faq}
        />
      </section>
    </>
  );
}
