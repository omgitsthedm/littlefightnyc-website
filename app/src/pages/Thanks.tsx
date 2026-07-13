import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { trackEvent } from "@/lib/analytics";

export default function Thanks() {
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
      }
    } catch {
      cameFromFitCheck = false;
    }

    if (!cameFromFitCheck) return;

    trackEvent("generate_lead", {
      method: "fit_check_form",
      form_name: "fit-check-scratch",
      page_path: "/thanks/",
    });
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Tech Audit Received"
        icon={CheckCircle2}
        title={
          <>
            We've got the{" "}
            <br />
            <span className="lf-em">messy setup.</span>
          </>
        }
        dek="Little Fight NYC is reading what you sent right now (or first thing tomorrow if it's after hours). Urgent issues get a same-day call. Planned work gets a written reply by morning at the latest. If it just turned into a fire, call (646) 360-0318 — we'll bump everything else."
      />

      <QuietContact />
    </>
  );
}
