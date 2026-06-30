import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";

export default function Legal() {
  return (
    <>
      <PageHero
        eyebrow="Privacy and Terms"
        title={
          <>
            Privacy and terms,{" "}
            <br />
            <span className="lf-em">plain.</span>
          </>
        }
        dek="Little Fight collects only what it needs to understand the issue, scopes work before quoting it, and handles account access through safer handoffs."
      />

      <section style={{ padding: "var(--lf-space-7) var(--lf-margin-mobile) var(--lf-space-9)" }}>
        <div style={{ maxWidth: "var(--lf-max-w)", marginInline: "auto" }}>
          <EditorialBody>
            <h2 id="privacy">What forms collect</h2>
            <p>
              Fit Check and contact paths may collect your name, business
              name, contact information, follow-up preference, and a plain
              description of the issue. That is the minimum needed to reply
              usefully.
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
          </EditorialBody>
        </div>
      </section>

      <QuietContact />
    </>
  );
}
