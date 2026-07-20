import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import TugAvatar from "@/components/editorial/TugAvatar";
import { trackEvent } from "@/lib/analyticsClient";
import "@/styles/editorial/thanks.css";

export default function Thanks() {
  const [leadIntent] = useState(() => {
    try {
      return window.sessionStorage.getItem("lf_lead_intent") ?? "general";
    } catch {
      return "general";
    }
  });
  const websiteIntent = leadIntent === "website";

  useEffect(() => {
    let cameFromTechAudit = false;

    try {
      cameFromTechAudit = window.sessionStorage.getItem("lf_tech_audit_submitted") === "true";
      if (cameFromTechAudit) {
        window.sessionStorage.removeItem("lf_tech_audit_submitted");
        // Confirmed success — retire the Tech Audit draft. (TechAudit keeps it
        // through submit so a failed POST + Back never loses the answers.
        // Literal key mirrors DRAFT_KEY in TechAudit.tsx — keep in sync.)
        window.sessionStorage.removeItem("lf_tech_audit_draft");
        window.sessionStorage.removeItem("lf_lead_intent");
      }
    } catch {
      cameFromTechAudit = false;
    }

    if (!cameFromTechAudit) return;

    trackEvent("generate_lead", {
      method: "tech_audit_form",
      form_name: "tech-audit-scratch",
      page_path: "/thanks/",
      intent: leadIntent,
    });
    trackEvent("lead_success", {
      method: "tech_audit_form",
      form_name: "tech-audit-scratch",
      page_path: "/thanks/",
      intent: leadIntent,
    });
  }, [leadIntent]);

  return (
    <div className="lf-thanks">
      <PageHero
        eyebrow="Tech Audit Received"
        icon={CheckCircle2}
        title={websiteIntent ? (
          <>
            Your website plan<br />{" "}
            <span className="lf-em">is in motion.</span>
          </>
        ) : (
          <>
            We've got it{" "}
            <br />
            <span className="lf-em">from here.</span>
          </>
        )}
        dek={websiteIntent
          ? "You did the hard part — you said what you want. A real person reads this today and calls you back with a clear next step, normally within two hours, 9am to 9pm Eastern. The consult is free, and nothing moves until the plan makes sense to you."
          : "You did the hard part — you said something. A real person reads this today, not a queue. Expect a callback within two hours, 9am to 9pm Eastern. If it's urgent right now, call (646) 360-0318 and we'll triage the fire first."}
      />

      <section className="lf-thanks__handoff" aria-labelledby="thanks-next-title">
        <div className="lf-thanks__handoff-inner">
          <p className="lf-thanks__eyebrow">The handoff</p>
          <h2 id="thanks-next-title">Your note made it to the right place.</h2>
          <ol>
            <li className="is-complete">
              <span aria-hidden="true"><CheckCircle2 size={19} strokeWidth={2} /></span>
              <strong>Received</strong>
              <small>Your brief is safely in the queue.</small>
            </li>
            <li>
              <span aria-hidden="true">02</span>
              <strong>Human review</strong>
              <small>We read the details before we reply.</small>
            </li>
            <li>
              <span aria-hidden="true">03</span>
              <strong>Clear next step</strong>
              <small>Expect a call or message inside the stated window.</small>
            </li>
          </ol>
        </div>
      </section>

      {/* The tug, underway — the "help is on the way" beat. You just asked a
          stranger for help; this is the answer to that. */}
      <TugAvatar />

      <QuietContact />
    </div>
  );
}
