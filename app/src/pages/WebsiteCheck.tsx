import { Search } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import { handoffToAuditLab } from "@/lib/auditPrefill";
import "@/styles/editorial/revenue-pages.css";

export default function WebsiteCheck() {
  return (
    <>
      <PageHero
        eyebrow="Free website check"
        icon={Search}
        title={<>See what gets in the way.</>}
        dek="A public-page scan for measurable performance, SEO, accessibility, and best-practices signals—followed by a private report in plain English."
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
              An email is required in the Audit Lab because the report is
              private and delivered to you. It can also be reviewed with a
              human, free, but the report does not require a sales call.
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
      </section>
    </>
  );
}
