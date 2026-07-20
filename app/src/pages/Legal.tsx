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
        dek="Little Fight collects only what it needs to understand the issue, scopes work before quoting it, measures what is working, and handles account access through safer handoffs."
      />

      <section style={{ paddingBlock: "var(--lf-space-7) var(--lf-space-9)" }}>
        <div className="lf-container">
          <EditorialBody>
            <h2 id="privacy">What forms collect</h2>
            <p>
              Tech Audit and contact paths may collect your name, business
              name, contact information, follow-up preference, and a plain
              description of the issue. That is the minimum needed to reply
              usefully.
            </p>
            <h2>Analytics and advertising pixels</h2>
            <p>
              Little Fight uses analytics and advertising tools, including
              Google Analytics and the TikTok Pixel, to understand which pages
              are useful, which contact paths work, and whether marketing is
              sending the right people to the site.
            </p>
            <p>
              These tools may record page views, approximate device/browser
              details, referral information, and events such as phone clicks,
              email clicks, Tech Audit or contact button clicks, and form
              submits. Little Fight uses this information for measurement,
              reporting, and improving marketing, not to sell personal
              information.
            </p>
            <h2>Cookies, pixels, and opt-outs</h2>
            <p>
              Analytics is off by default for a first-time visitor. Google
              Analytics, Microsoft Clarity, and the TikTok Pixel load only
              after you choose “Allow analytics.” If you choose “Essential
              only,” the site still works and those measurement scripts do not
              load. You can change the choice at any time.
            </p>
            <p>
              <button type="button" className="lf-privacy-choice" onClick={openConsentPreferences}>
                Review analytics choices
              </button>
            </p>
            <h2>What not to send</h2>
            <p>
              Do not send passwords, recovery codes, API keys, credit card
              numbers, bank details, protected health information, or private
              customer data through any public form on this site.
            </p>
            <h2 id="terms">Work and scope</h2>
            <p>
              Project scope, pricing, access needs, and timelines are
              confirmed in writing before work begins. If anything changes
              mid-engagement, the change is written down and acknowledged
              before the work continues.
            </p>
            <h2>Safe account access</h2>
            <p>
              If access to a website, domain, payment tool, booking system, or
              business account is required, Little Fight sets up a safer handoff
              instead of asking for credentials over a public form, email, or
              text thread.
            </p>
            <h2>Privacy questions</h2>
            <p>
              For privacy questions or requests, email Little Fight at
              {" "}<a href="mailto:hello@littlefightnyc.com">hello@littlefightnyc.com</a>.
            </p>
          </EditorialBody>
        </div>
      </section>

      <QuietContact />
    </>
  );
}
