import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { trackEvent } from "@/lib/analytics";

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
    <>
      <PageHero
        eyebrow="Tech Audit Received"
        icon={CheckCircle2}
        title={websiteIntent ? (
          <>
            Your website plan<br />
            <span className="lf-em">is in motion.</span>
          </>
        ) : (
          <>
            We've got the{" "}
            <br />
            <span className="lf-em">messy setup.</span>
          </>
        )}
        dek={websiteIntent
          ? "Little Fight NYC is reviewing the context and will return a clear recommended next step, normally within two hours during 9am-9pm Eastern. The consultation is free, and nothing moves forward until the scope makes sense."
          : "Little Fight NYC is reviewing the request. If it is urgent, call (646) 360-0318 and we will triage the immediate issue before planning any larger cleanup."}
      />

      <QuietContact />
    </>
  );
}
