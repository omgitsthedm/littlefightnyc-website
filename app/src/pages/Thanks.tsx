import { useEffect, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, ExternalLink } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import TugAvatar from "@/components/editorial/TugAvatar";
import { trackEvent } from "@/lib/analyticsClient";
import "@/styles/editorial/thanks.css";
import { BOOKING_HREF, PHONE_DISPLAY } from "@/data/contact";
import {
  parseTechAuditLeadIntent,
  parseTechAuditPreferredRoute,
  readTechAuditConfirmation,
  safeTechAuditReportId,
  TECH_AUDIT_SESSION_KEYS,
  techAuditReplyLanguage,
} from "@/lib/techAuditContact";

export default function Thanks() {
  const [confirmation] = useState(() => {
    const query = readTechAuditConfirmation(window.location.search);
    let storedIntent = null;
    let storedReplyRoute = null;
    let storedReportId = "";
    try {
      storedIntent = parseTechAuditLeadIntent(
        window.sessionStorage.getItem(TECH_AUDIT_SESSION_KEYS.intent),
      );
      storedReplyRoute = parseTechAuditPreferredRoute(
        window.sessionStorage.getItem(TECH_AUDIT_SESSION_KEYS.replyRoute),
      );
      storedReportId = safeTechAuditReportId(
        window.sessionStorage.getItem(TECH_AUDIT_SESSION_KEYS.report),
      );
    } catch {
      // The redirect query carries the same non-sensitive state when storage
      // is unavailable (private mode, hardened browser, or a fresh tab).
    }

    const reportId = query.reportId || storedReportId;
    return {
      leadIntent: query.intent ?? storedIntent ?? (reportId ? "website" : "general"),
      replyRoute: query.replyRoute ?? storedReplyRoute,
      reportId,
    };
  });
  const { leadIntent, replyRoute, reportId } = confirmation;
  const replyLanguage = techAuditReplyLanguage(replyRoute);
  const websiteIntent = leadIntent === "website" || Boolean(reportId);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;

    const query = readTechAuditConfirmation(window.location.search);
    let storedSubmission = false;

    try {
      storedSubmission = window.sessionStorage.getItem(
        TECH_AUDIT_SESSION_KEYS.submitted,
      ) === "true";
    } catch {
      // The one-time redirect marker remains sufficient for success tracking.
    }

    const cameFromTechAudit = query.submitted || storedSubmission;
    if (!cameFromTechAudit) return;
    trackedRef.current = true;

    // Remove the one-time marker before tracking so a reload or React's strict
    // effect replay cannot count this submission twice. Keep intent, reply,
    // and report in the URL so the confirmation remains accurate on reload.
    if (query.submitted) {
      try {
        const params = new URLSearchParams(window.location.search);
        params.delete("submitted");
        const search = params.toString();
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`,
        );
      } catch {
        // URL cleanup is progressive; the in-memory guard still prevents a
        // duplicate within this page lifecycle.
      }
    }

    try {
      window.sessionStorage.removeItem(TECH_AUDIT_SESSION_KEYS.submitted);
      // Confirmed success — retire the draft only after the native POST lands.
      window.sessionStorage.removeItem(TECH_AUDIT_SESSION_KEYS.draft);
      window.sessionStorage.removeItem(TECH_AUDIT_SESSION_KEYS.intent);
      window.sessionStorage.removeItem(TECH_AUDIT_SESSION_KEYS.replyRoute);
      window.sessionStorage.removeItem(TECH_AUDIT_SESSION_KEYS.report);
    } catch {
      // Storage can be unavailable; confirmation and tracking still succeed.
    }

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
        eyebrow="Message received"
        icon={CheckCircle2}
        title={websiteIntent ? (
          <>
            Your website message<br />{" "}
            <span className="lf-em">is with us.</span>
          </>
        ) : (
          <>
            Your message is{" "}
            <br />
            <span className="lf-em">with us.</span>
          </>
        )}
        dek={websiteIntent
          ? `You told us what you want. A real person reads it 9am–9pm Eastern and ${replyLanguage.action} with a clear next step. Messages sent after hours wait for the next reply window. The first look is free, and nothing moves until the plan makes sense to you.`
          : `You told us what is stuck. A real person reads it 9am–9pm Eastern. Messages sent after hours wait for the next reply window. If customers are blocked now, call ${PHONE_DISPLAY}.`}
        action={false}
      />

      <section className="lf-thanks__handoff" aria-labelledby="thanks-next-title">
        <div className="lf-thanks__handoff-inner">
          <p className="lf-thanks__eyebrow">What happens next</p>
          <h2 id="thanks-next-title">Your message made it to us.</h2>
          <ol>
            <li className="is-complete">
              <span aria-hidden="true"><CheckCircle2 size={19} strokeWidth={2} /></span>
              <strong>Received</strong>
              <small>
                {reportId
                  ? "Your message and website report are ready for us to read."
                  : "Your message is ready for us to read."}
              </small>
            </li>
            <li>
              <span aria-hidden="true">02</span>
              <strong>Human review</strong>
              <small>We read what is happening before we reply.</small>
            </li>
            <li>
              <span aria-hidden="true">03</span>
              <strong>Clear next step</strong>
              <small>We reply the way you chose during the reply window.</small>
            </li>
          </ol>
        </div>
      </section>

      {websiteIntent && (
        <section className="lf-thanks__booking" aria-labelledby="thanks-booking-title">
          <div className="lf-thanks__booking-inner">
            <div>
              <p className="lf-thanks__eyebrow">A time you choose</p>
              <h2 id="thanks-booking-title">Free second opinion.</h2>
              <p>
                Your message is already here. Choose a time, and we will look
                at the website with you. No prep or commitment.
              </p>
            </div>
            <a
              href={BOOKING_HREF}
              target="_blank"
              rel="noopener noreferrer"
              data-lf-event="booking_started"
              data-lf-label="website_thanks"
            >
              <CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" />
              Choose a time
              <ExternalLink size={15} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </section>
      )}

      {/* The tug, underway — the "help is on the way" beat. You just asked a
          stranger for help; this is the answer to that. */}
      <TugAvatar />

      <QuietContact showBooking={!websiteIntent} />
    </div>
  );
}
