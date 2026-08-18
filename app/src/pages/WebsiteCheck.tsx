import { CalendarDays, ExternalLink, Mail, MessageSquare, Phone, Search } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import { BOOKING_HREF, PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";
import { handoffToAuditLab } from "@/lib/auditPrefill";
import "@/styles/editorial/revenue-pages.css";

export default function WebsiteCheck() {
  return (
    <>
      <PageHero
        eyebrow="Free website check"
        icon={Search}
        // Answer first: what you get (a free plain-words report on what stops
        // customers), then how it works. The old H1 was vague ("See what gets
        // in the way") and the dek opened with an instruction.
        title={<>See what stops customers on your website.</>}
        dek="A free report in plain words. We check the public parts: can people read it, use it, find the basics, and take the next step? It also says what we could not see."
        pillars={[
          "Free, and no sales call required",
          "No login, card, or password",
          "Says plainly what we could not see",
        ]}
        action={{
          href: "#website-check-url",
          kicker: "Free first look",
          label: "Start the website check",
        }}
        image={{
          src: "/assets/journal-what-a-free-tech-audit-actually-looks-like.webp",
          alt: "Little Fight NYC Website Audit Lab preview",
          width: 1600,
          height: 1067,
        }}
      />

      <section className="lf-revenue-page lf-website-check" aria-labelledby="lf-website-check-title">
        <header className="lf-revenue-page__intro">
          <p>Website in</p>
          <h2 id="lf-website-check-title">A free report, in plain words.</h2>
          <div>
            <p>
              We look only at what anyone can see on your website. We do not
              need a login, card, password, or access to your business.
            </p>
            <p>
              The Website Check asks for an email before it sends your private
              report. We can look at it with you for free. No sales call is required.
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
          <label htmlFor="website-check-email">Email for your private report</label>
          <input id="website-check-email" data-audit-prefill="email" type="email" autoComplete="email" placeholder="you@company.com" />
          <button type="submit">
            Check my website
            <Search size={18} strokeWidth={2} aria-hidden="true" />
          </button>
          <p>Free. No account, card, or password. No automatic sales call.</p>
        </form>

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
      </section>
    </>
  );
}
