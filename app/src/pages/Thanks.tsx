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
    let cameFromFitCheck = false;

    try {
      cameFromFitCheck = window.sessionStorage.getItem("lf_fit_check_submitted") === "true";
      if (cameFromFitCheck) {
        window.sessionStorage.removeItem("lf_fit_check_submitted");
        // Confirmed success — retire the Tech Audit draft. (FitCheck keeps it
        // through submit so a failed POST + Back never loses the answers.
        // Literal key mirrors DRAFT_KEY in FitCheck.tsx — keep in sync.)
        window.sessionStorage.removeItem("lf_tech_audit_draft");
        window.sessionStorage.removeItem("lf_lead_intent");
      }
    } catch {
      cameFromFitCheck = false;
    }

    if (!cameFromFitCheck) return;

    trackEvent("generate_lead", {
      method: "fit_check_form",
      form_name: "fit-check-scratch",
      page_path: "/thanks/",
      intent: leadIntent,
    });
    trackEvent("lead_success", {
      method: "fit_check_form",
      form_name: "fit-check-scratch",
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
          ? "David is reading what you sent and will reply with a clear next step, usually within two hours from 9am-9pm Eastern. The consultation is free. No pitch, and no project starts until the scope makes sense to you."
          : "Little Fight NYC is reading what you sent right now (or first thing tomorrow if it's after hours). Urgent issues get a same-day call. Planned work gets a written reply by morning at the latest. If it just turned into a fire, call (646) 360-0318 — we'll bump everything else."}
      />

      <QuietContact />
    </>
  );
}
