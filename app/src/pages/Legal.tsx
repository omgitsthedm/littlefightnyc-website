import PageHero from "@/components/editorial/PageHero";
import { Scale } from "lucide-react";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";
import { openConsentPreferences } from "@/lib/consent";

export default function Legal() {
  return (
    <>
      <PageHero
        eyebrow="Privacy and Terms"
        icon={Scale}
        title={
          <>
            Privacy and terms,{" "}
            <br />
            <span className="lf-em">plain.</span>
          </>
        }
        dek="We collect only what we need to understand the problem, agree on work before quoting it, check what is working, and use safer ways to access accounts."
        action={false}
      />

      <section className="lf-content-section">
        <div className="lf-content-grid">
          <article className="lf-content-tile lf-content-tile--reading lf-content-tile--quiet">
            <EditorialBody wide>
            <h2 id="privacy">What forms collect</h2>
            <p>
              The website form and contact pages may collect your name, business
              name, contact information, follow-up preference, and a plain
              description of the issue. That is the minimum needed to reply
              usefully.
            </p>
            <h2>Who receives a form submission</h2>
            <p>
              Forms on this site are handled by Netlify, which hosts the site
              and stores each submission so Little Fight can read and reply to
              it. Review Netlify’s <a href="https://www.netlify.com/privacy/" target="_blank" rel="noreferrer">privacy policy</a> for its handling details.
              Little Fight does not sell form submissions or use them for advertising.
            </p>
            <p>
              The{" "}
              <a href="/examples/audit/">Website Audit Lab</a> is a separate
              tool with its own data flow — it takes a website address and an
              email address, and involves services this page does not cover.{" "}
              <a href="/examples/audit/privacy/">
                What the Audit Lab collects
              </a>{" "}
              is written out separately.
            </p>
            <h2>Analytics</h2>
            <p>
              Little Fight uses Google Analytics, after consent, to understand
              which pages are useful and which contact paths work. Microsoft
              Clarity and the TikTok Pixel are not active on this site. See
              Google’s <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">privacy policy</a> for information about Google’s handling of data.
            </p>
            <p>
              These tools may record page views, approximate device/browser
              details, referral information, and events such as phone clicks,
              email clicks, website-form or contact button clicks, and form
              submits. Little Fight uses this information for measurement,
              reporting, and improving marketing, not to sell personal
              information.
            </p>
            <h2>Cookies, pixels, and opt-outs</h2>
            <p>
              Analytics is off by default for a first-time visitor. Google
              Analytics loads only after you choose “Allow visit counting.” If you
              choose “Essential only,” the site still works and the optional
              script does not load. You can change the choice at any time.
            </p>
            <p>
              <button type="button" className="lf-privacy-choice" onClick={openConsentPreferences}>
                Review analytics choices
              </button>
            </p>
            <h2>What not to send</h2>
            <p>
              Do not send passwords, recovery codes, secret developer keys, credit card
              numbers, bank details, protected health information, or private
              customer data through any public form on this site.
            </p>
            <h2 id="terms">Work and scope</h2>
            <p>
              What we will do, what it costs, what access is needed, and when
              it happens are confirmed in writing before work begins. If
              anything changes, we write it down and agree before work continues.
            </p>
            <h2>Safe account access</h2>
            <p>
              If access to a website, domain, payment tool, booking system, or
              business account is required, Little Fight shows you a safer way
              to give access instead of asking for credentials over a public form, email, or
              text thread.
            </p>
            <h2>Privacy questions</h2>
            <p>
              For privacy questions or requests, email Little Fight at
              {" "}<a href="mailto:hello@littlefightnyc.com">hello@littlefightnyc.com</a>.
            </p>
            </EditorialBody>
          </article>
        </div>
      </section>

      <QuietContact />
    </>
  );
}
