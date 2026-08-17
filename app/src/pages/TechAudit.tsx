import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ClipboardCheck, Clock, Flame, Mail, MessageSquare, Phone, Send } from "lucide-react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import PhoneAction from "@/components/editorial/PhoneAction";
import TimelineStrip from "@/components/dataviz/TimelineStrip";
import { ScoreGauge } from "@/components/dataviz/ScoreGauge";
import { auditRoutes } from "@/data/site";
import { useHaptic } from "@/hooks/useHaptic";
import { trackEvent } from "@/lib/analyticsClient";
import { readAttribution } from "@/lib/attribution";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import {
  normalizeTechAuditFollowUpPreference,
  parseTechAuditLeadIntent,
  safeTechAuditReportId,
  TECH_AUDIT_SESSION_KEYS,
  techAuditConfirmationPath,
  techAuditContactProblem,
  techAuditContactRoute,
  techAuditFollowUpProblem,
  techAuditPreferredRoute,
  type TechAuditFollowUpPreference,
  type TechAuditLeadIntent,
} from "@/lib/techAuditContact";
import "@/styles/editorial/tech-audit.css";
import { HELLO_EMAIL, PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";

type FieldName = "name" | "business" | "contact" | "follow_up" | "message";

// Hair By Rachel Charles, measured 2026-07-30, Lighthouse 13.4.1 (mobile).
// Artifact: .lifi/evidence/lighthouse/hairbyrachelcharles-2026-07-30.md
const AUDIT_PROOF_SCORES = [
  { value: "96", label: "Fast on a phone" },
  { value: "100", label: "Easy to use" },
  { value: "100", label: "Built carefully" },
  { value: "100", label: "Easy to find" },
] as const;
type Step = 1 | 2 | 3;

const OUTCOMES = [
  "What to keep",
  "What to fix first",
  "The clearest next move",
  "An honest answer if the work can wait",
];

const REQUIRED_FIELDS: { name: Exclude<FieldName, "follow_up">; message: string }[] = [
  { name: "name", message: "Tell us who you are." },
  { name: "business", message: "Add your business name." },
  { name: "contact", message: "Add a phone or email so we can reply." },
  { name: "message", message: "Tell us what you want to improve or build." },
];

const URGENCY_OPTIONS = [
  {
    label: "It’s hurting customers right now",
    copy: "Broken checkout, dead site, or missed calls today.",
    icon: Flame,
  },
  {
    label: "Soon, but nothing is on fire",
    copy: "It works, but it costs you time or money every week.",
    icon: Clock,
  },
  {
    label: "Just planning ahead",
    copy: "You want a clear picture before you commit to anything.",
    icon: CalendarDays,
  },
];

const STEP_TITLES: Record<Step, string> = {
  1: "What needs attention?",
  2: "How urgent is it?",
  3: "Where should we respond?",
};

function composeMessage(symptom: string | null, urgency: string | null): string {
  const lines: string[] = [];
  const route = auditRoutes.find((r) => r.label === symptom);
  if (route) lines.push(`${route.label}: ${route.copy}`);
  if (urgency) lines.push(`Timing: ${urgency}.`);
  return lines.join("\n");
}

/* ---- Draft memory (sessionStorage) --------------------------------------
 * The 3-step flow used to forget everything if you navigated away. Progress
 * now survives within the tab session and is cleared on successful submit.
 * All storage access is guarded — private modes that throw just degrade to
 * the old behavior. */

const DRAFT_KEY = TECH_AUDIT_SESSION_KEYS.draft;
const REPORT_CONTEXT_KEY = TECH_AUDIT_SESSION_KEYS.report;
const WEBSITE_INTENT = "website";
const WEBSITE_ROUTE = auditRoutes[0];

function leadIntentFromQuery(params: URLSearchParams): TechAuditLeadIntent {
  return parseTechAuditLeadIntent(params.get("intent")) ?? "general";
}

function queryValue(params: URLSearchParams, key: string, maxLength: number): string {
  return (params.get(key) ?? "").trim().slice(0, maxLength);
}

function createDakotaCaptureId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Audit report URLs carry a generated slug such as
 * `example-com-1a2b3c4d`. Treat it as an opaque identifier: accept only the
 * same lowercase ASCII alphabet used by the Audit pipeline, cap its size, and
 * reject malformed input instead of trying to repair it into another report.
 */
function auditReportId(params: URLSearchParams): string {
  return safeTechAuditReportId(params.get("report"));
}

/**
 * The installed PWA is a Web Share Target (see site.webmanifest): when an owner
 * shares their site to the app it lands here as `?url=&text=&title=`. Share
 * sheets are inconsistent about which field carries the link — Safari often
 * puts it in `url`, others bundle it into `text` or `title` — so read `url`
 * first, then pull the first http(s) link out of the other two. Whatever the
 * owner shared is exactly the site they want us to look at.
 */
function sharedWebsiteUrl(params: URLSearchParams): string {
  const direct = queryValue(params, "url", 2048);
  if (direct) return direct;
  const blob = `${params.get("text") ?? ""} ${params.get("title") ?? ""}`;
  const match = blob.match(/https?:\/\/[^\s]+/i);
  return match ? match[0].slice(0, 2048) : "";
}

function composeContextMessage(
  symptom: string | null,
  urgency: string | null,
  websiteUrl: string,
): string {
  const lines = [composeMessage(symptom, urgency)];
  if (websiteUrl) lines.push(`Website: ${websiteUrl}`);
  return lines.filter(Boolean).join("\n");
}

function appendAuditContext(message: string, websiteUrl: string): string {
  const lines = [message];
  if (websiteUrl && !message.includes("Website:")) lines.push(`Website: ${websiteUrl}`);
  return lines.filter(Boolean).join("\n");
}

type ContactFields = {
  name: string;
  business: string;
  contact: string;
  follow_up: TechAuditFollowUpPreference;
};

const EMPTY_FIELDS: ContactFields = {
  name: "",
  business: "",
  contact: "",
  follow_up: "fastest",
};

type Draft = {
  intent: "general" | "website";
  step: Step;
  symptom: string | null;
  urgency: string | null;
  message: string;
  messageDirty: boolean;
  fields: ContactFields;
};

function readDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<Draft>;
    if (!d || typeof d !== "object") return null;
    const step: Step = d.step === 2 ? 2 : d.step === 3 ? 3 : 1;
    const symptom = typeof d.symptom === "string" ? d.symptom : null;
    const urgency = typeof d.urgency === "string" ? d.urgency : null;
    // Drafts written before intent was stored can be identified safely: the
    // general flow cannot reach step 3 without an urgency choice.
    const intent = d.intent === "website"
      ? "website"
      : d.intent === "general"
        ? "general"
        : step === 3 && symptom === WEBSITE_ROUTE.label && urgency === null
          ? "website"
          : "general";
    const savedFields = d.fields ?? EMPTY_FIELDS;
    return {
      intent,
      step,
      symptom,
      urgency,
      message: typeof d.message === "string" ? d.message : "",
      messageDirty: d.messageDirty === true,
      fields: {
        name: typeof savedFields.name === "string" ? savedFields.name : "",
        business: typeof savedFields.business === "string" ? savedFields.business : "",
        contact: typeof savedFields.contact === "string" ? savedFields.contact : "",
        follow_up: normalizeTechAuditFollowUpPreference(savedFields.follow_up),
      },
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft): void {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable — flow still works, it just won’t remember */
  }
}

export default function TechAudit() {
  const [searchParams] = useSearchParams();
  const websiteUrl = sharedWebsiteUrl(searchParams);
  const reportId = auditReportId(searchParams);
  // A shared URL (from the PWA share target) is, by definition, a website the
  // owner wants us to look at. An Audit report is also inherently website
  // context, so either one drops the form into website mode.
  const requestedIntent = leadIntentFromQuery(searchParams);
  const leadIntent: TechAuditLeadIntent = websiteUrl || reportId
    ? WEBSITE_INTENT
    : requestedIntent;
  const websiteIntent = leadIntent === WEBSITE_INTENT;
  // Attribute a lead that arrived via the PWA share target (no explicit source,
  // but the share sheet passed text/title) so shares are measurable.
  const explicitSource = queryValue(searchParams, "source", 80);
  const leadOrigin =
    explicitSource ||
    (reportId ? "audit-lab" : "") ||
    (websiteUrl && (searchParams.has("text") || searchParams.has("title"))
      ? "pwa_share"
      : "littlefightnyc.com");
  const intentMode = websiteIntent ? "website" : "general";
  // Restore any in-tab draft once per mount, before state initializes.
  const draft = useMemo(() => readDraft(), []);
  const activeDraft = draft?.intent === intentMode ? draft : null;
  const initialSymptom = activeDraft?.symptom ?? (websiteIntent ? WEBSITE_ROUTE.label : null);
  const initialMessage = appendAuditContext(
    activeDraft?.message || composeMessage(initialSymptom, activeDraft?.urgency ?? null),
    websiteUrl,
  );
  // Open on the real form. Owners can describe the problem in their own words
  // without completing a symptom quiz first.
  const [step, setStep] = useState<Step>(3);
  const [symptom, setSymptom] = useState<string | null>(initialSymptom);
  const [urgency, setUrgency] = useState<string | null>(activeDraft?.urgency ?? null);
  const [message, setMessage] = useState(initialMessage);
  const [messageDirty, setMessageDirty] = useState(activeDraft?.messageDirty ?? false);
  const [fields, setFields] = useState<ContactFields>(draft?.fields ?? EMPTY_FIELDS);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [dakotaCaptureId, setDakotaCaptureId] = useState("");
  const [dakotaSubmittedAt, setDakotaSubmittedAt] = useState("");
  // Payoff beat — plays once when step 3 is REACHED with both choices made
  // (not when a saved draft restores straight into step 3).
  const [payoff, setPayoff] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const mountedRef = useRef(false);
  const auditStartedRef = useRef(false);
  const attribution = readAttribution();
  const contactRoute = techAuditContactRoute(fields.contact);
  const preferredRoute = contactRoute
    ? techAuditPreferredRoute(contactRoute, fields.follow_up)
    : null;
  const confirmationPath = techAuditConfirmationPath({
    intent: leadIntent,
    replyRoute: preferredRoute,
    reportId,
  });
  // Tactile feedback on the intake (Android/Chrome; a no-op elsewhere): a light
  // tap as each step advances, a confident triple on a clean submit, a longer
  // buzz when validation blocks it.
  const hapticStep = useHaptic(8);
  const hapticSubmit = useHaptic([12, 40, 12]);
  const hapticError = useHaptic([26, 40, 26]);
  // Move focus to the step heading on step change (not on first paint).
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  // Keep the draft current — progress survives navigate-away-and-back.
  useEffect(() => {
    writeDraft({ intent: intentMode, step, symptom, urgency, message, messageDirty, fields });
  }, [intentMode, step, symptom, urgency, message, messageDirty, fields]);

  // The beat is one-shot: disarm after it has played so re-renders and
  // later step changes can never replay it.
  useEffect(() => {
    if (!payoff) return undefined;
    const id = window.setTimeout(() => setPayoff(false), 1600);
    return () => window.clearTimeout(id);
  }, [payoff]);

  // If the page is restored from the back/forward cache (e.g. the user hit
  // Back after a failed native POST), un-stick the loading state so the
  // submit button works again and the preserved draft can be re-sent.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setSubmitting(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  function setField<Name extends keyof ContactFields>(name: Name, value: ContactFields[Name]) {
    if (value.trim()) trackAuditStarted(`field_${name}`);
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function trackAuditStarted(entryPoint: string) {
    if (auditStartedRef.current) return;
    auditStartedRef.current = true;
    trackEvent("tech_audit_started", {
      entry_point: entryPoint,
      intent: leadIntent,
      page_path: "/tech-audit/",
    });
  }

  /* Inline validation (§6.2): check a required field when the user leaves it,
   * and clear its error the moment they fix it — never wait for submit. */
  function validateField(name: FieldName, value: string) {
    if (name === "contact") {
      const contactIssue = techAuditContactProblem(value);
      const followUpIssue = contactIssue
        ? null
        : techAuditFollowUpProblem(value, fields.follow_up);
      setErrors((prev) => {
        const next = { ...prev };
        if (contactIssue) next.contact = contactIssue;
        else delete next.contact;
        if (followUpIssue) next.follow_up = followUpIssue;
        else delete next.follow_up;
        return next;
      });
      return;
    }
    const rule = REQUIRED_FIELDS.find((f) => f.name === name);
    if (!rule) return;
    const problem = value.trim() === "" ? rule.message : null;
    setErrors((prev) => {
      const next = { ...prev };
      if (problem) next[name] = problem;
      else delete next[name];
      return next;
    });
  }

  function setFollowUpPreference(value: string) {
    const preference = normalizeTechAuditFollowUpPreference(value);
    setField("follow_up", preference);
    const problem = techAuditFollowUpProblem(fields.contact, preference);
    setErrors((prev) => {
      if (!problem && !prev.follow_up) return prev;
      const next = { ...prev };
      if (problem) next.follow_up = problem;
      else delete next.follow_up;
      return next;
    });
  }

  function clearErrorIfFilled(name: FieldName, value: string) {
    if (value.trim() === "") return;
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function fieldClass(name: FieldName, value: string) {
    if (errors[name]) return " is-error";
    if (value.trim()) return " is-valid";
    return "";
  }

  function pickSymptom(label: string) {
    trackAuditStarted("symptom");
    trackEvent("intake_step_1", {
      selection: label,
      intent: leadIntent,
    });
    setSymptom(label);
    if (!messageDirty) {
      setMessage(composeContextMessage(label, urgency, websiteUrl));
    }
    hapticStep();
    setStep(2);
  }

  function pickUrgency(label: string) {
    trackAuditStarted("urgency");
    trackEvent("intake_step_2", {
      selection: label,
      intent: leadIntent,
    });
    setUrgency(label);
    if (!messageDirty) {
      setMessage(composeContextMessage(symptom, label, websiteUrl));
    }
    if (symptom) setPayoff(true);
    hapticStep();
    setStep(3);
  }

  function skipToForm(fromStep: 1 | 2) {
    trackAuditStarted(`skip_step_${fromStep}`);
    trackEvent(`intake_step_${fromStep}`, {
      skipped: true,
      intent: leadIntent,
    });
    hapticStep();
    setStep(3);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const nextErrors: Partial<Record<FieldName, string>> = {};

    for (const name of ["name", "business", "contact", "follow_up", "message"] as const) {
      const el = form.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
        | null;
      const value = el?.value ?? "";
      if (name === "contact") {
        const problem = techAuditContactProblem(value);
        if (problem) nextErrors.contact = problem;
      } else if (name === "follow_up") {
        const preference = normalizeTechAuditFollowUpPreference(value);
        const contact = (form.elements.namedItem("contact") as HTMLInputElement | null)?.value ?? "";
        const problem = value !== preference
          ? "Choose how you want us to reply."
          : techAuditFollowUpProblem(contact, preference);
        if (problem) nextErrors.follow_up = problem;
      } else {
        const field = REQUIRED_FIELDS.find((candidate) => candidate.name === name);
        if (value.trim() === "" && field) nextErrors[name] = field.message;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setErrors(nextErrors);
      hapticError();
      const first = form.elements.namedItem(
        Object.keys(nextErrors)[0],
      ) as HTMLElement | null;
      first?.focus();
      return;
    }

    trackAuditStarted("valid_submit");

    const captureId = dakotaCaptureId || createDakotaCaptureId();
    const submittedAt = new Date().toISOString();
    const submittedContact = (
      form.elements.namedItem("contact") as HTMLInputElement | null
    )?.value ?? "";
    const submittedPreference = normalizeTechAuditFollowUpPreference(
      (form.elements.namedItem("follow_up") as HTMLSelectElement | null)?.value,
    );
    const submittedContactRoute = techAuditContactRoute(submittedContact);
    const submittedReplyRoute = submittedContactRoute
      ? techAuditPreferredRoute(submittedContactRoute, submittedPreference)
      : null;
    setDakotaCaptureId(captureId);
    setDakotaSubmittedAt(submittedAt);
    // Keep the native form payload correct before React flushes this discrete
    // event, then retain the same values through the submitting re-render.
    const captureInput = form.elements.namedItem("dakota_capture_id") as HTMLInputElement | null;
    const submittedAtInput = form.elements.namedItem("dakota_submitted_at") as HTMLInputElement | null;
    if (captureInput) captureInput.value = captureId;
    if (submittedAtInput) submittedAtInput.value = submittedAt;
    // Re-resolve from the submitted DOM values so the native redirect always
    // carries the exact, consented response route even before React re-renders.
    form.setAttribute("action", techAuditConfirmationPath({
      intent: leadIntent,
      replyRoute: submittedReplyRoute,
      reportId,
    }));

    hapticSubmit();

    // Valid — let the native Netlify POST proceed, show the loading state.
    // The draft is deliberately NOT cleared here: if the POST fails (offline,
    // server error) the user's answers survive a Back navigation. /thanks/
    // clears it on confirmed success instead.
    setErrors({});
    try {
      window.sessionStorage.setItem(
        TECH_AUDIT_SESSION_KEYS.intent,
        leadIntent,
      );
      if (submittedReplyRoute) {
        window.sessionStorage.setItem(
          TECH_AUDIT_SESSION_KEYS.replyRoute,
          submittedReplyRoute,
        );
      } else {
        window.sessionStorage.removeItem(TECH_AUDIT_SESSION_KEYS.replyRoute);
      }
      if (reportId) {
        window.sessionStorage.setItem(REPORT_CONTEXT_KEY, reportId);
      } else {
        window.sessionStorage.removeItem(REPORT_CONTEXT_KEY);
      }
    } catch {
      /* Storage can be unavailable; submission still proceeds. */
    }
    setSubmitting(true);
  }

  return (
    <>
      {websiteIntent ? (
        <section className="lf-audit-intro" aria-labelledby="lf-audit-intro-title">
          <div className="lf-audit-intro__inner">
            <div className="lf-audit-intro__copy">
              <p className="lf-audit-intro__eyebrow">
                <ClipboardCheck size={18} strokeWidth={1.8} aria-hidden="true" />
                Free website plan
              </p>
              <h1 id="lf-audit-intro-title">Get a clear website plan.</h1>
              <p>You get what to keep and what to fix first. Tell us what the site needs to do. A real person reviews it and replies with a next move.</p>
              <p className="lf-audit-intro__meta">A short form. Reviewed by a person during 9am–9pm Eastern.</p>

              {/* Every website lead from the nav, the audit report, the contact
                  block, and the case studies lands here. This branch replaces
                  PageHero, so it has to carry the same first-screen contract:
                  all four channels and the hours line, before the form. */}
              <div className="lf-audit-intro__reach" data-lf-contact-rail="true">
                <div className="lf-audit-intro__channels" aria-label="Reach Little Fight NYC now">
                  <a href={PHONE_HREF} data-lf-label="audit_intro_phone">
                    <Phone size={16} strokeWidth={2} aria-hidden="true" />
                    Call {PHONE_DISPLAY}
                  </a>
                  <a href={SMS_HREF} data-lf-label="audit_intro_sms">
                    <MessageSquare size={16} strokeWidth={2} aria-hidden="true" />
                    Text
                  </a>
                  <a href={`mailto:${HELLO_EMAIL}`} data-lf-label="audit_intro_email">
                    <Mail size={16} strokeWidth={2} aria-hidden="true" />
                    Email
                  </a>
                  <a href="#fit-step-title" data-lf-label="audit_intro_form">
                    <Send size={16} strokeWidth={2} aria-hidden="true" />
                    Form
                  </a>
                </div>
                <p className="lf-audit-intro__hours">
                  9am–9pm Eastern: a human answers. After hours: leave a message.
                </p>
              </div>
            </div>
            <article className="lf-audit-intro__proof">
              <Link
                className="lf-audit-intro__proof-image"
                to="/case-studies/hair-by-rachel-charles/"
                aria-label="Read the Hair By Rachel Charles case study"
              >
                <img
                  {...skelImg}
                  src="/assets/case-hair-by-rachel-charles.webp"
                  {...responsiveImageProps(
                    "/assets/case-hair-by-rachel-charles.webp",
                    "(min-width: 1200px) 34vw, 42vw",
                    [480, 640, 900],
                  )}
                  alt="The Hair By Rachel Charles booking website as it shipped"
                  width={1600}
                  height={1200}
                  fetchPriority="high"
                  decoding="async"
                />
              </Link>
              {/* Was "100 Lighthouse scores". Measured 2026-07-30, Lighthouse 13.4.1,
                    mobile: performance 96, accessibility 100, best practices 100, SEO 100.
                    Artifact: .lifi/evidence/lighthouse/hairbyrachelcharles-2026-07-30.md */}
              <span className="lf-audit-intro__caption">Hair By Rachel Charles: checked on a phone on July 30, 2026. Fast to load, easy to use, built carefully, and easy for search to read.</span>
              {/* Same verified 2026-07-30 measurement as the caption, restated as
                  instruments. Values must track the evidence artifact above. */}
              <span className="lf-audit-intro__scores" aria-hidden="true">
                {AUDIT_PROOF_SCORES.map((score) => (
                  <span key={score.label} className="lf-audit-intro__score">
                    <ScoreGauge value={score.value} className="lf-gauge--sm" />
                    <span className="lf-audit-intro__score-label">{score.label}</span>
                  </span>
                ))}
              </span>
              <span className="lf-audit-intro__proof-links">
                <Link to="/case-studies/hair-by-rachel-charles/">Read the case study</Link>
                <a
                  href="https://github.com/omgitsthedm/littlefightnyc-website/blob/main/.lifi/evidence/lighthouse/hairbyrachelcharles-2026-07-30.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  How we checked it
                </a>
              </span>
            </article>
          </div>
        </section>
      ) : (
        <PageHero
          eyebrow="Free second opinion"
          icon={ClipboardCheck}
          title={(
          <>
            Tell us what is<br />
            {" "}
            <span className="lf-em">getting in the way.</span>
          </>
          )}
          dek="A free look at your website, tools, and monthly bills. We name what to keep and what to fix first. One short form. A person reads it and replies."
          action={{
            href: "#fit-step-title",
            kicker: "About two minutes",
            label: "Start the free review",
          }}
          image={{
            src: "/images/brand-scenes/shop-back-office.webp",
            alt: "A small business back office with the everyday tools that keep the day moving",
            width: 1672,
            height: 941,
          }}
        />
      )}

      <section className={`lf-audit${websiteIntent ? " lf-audit--website" : ""}`}>
        <div className="lf-audit__inner">
          <div className="lf-audit__flow">
            {step === 1 && (
              <div className="lf-audit__step">
                <h2
                  className="lf-audit__step-title"
                  id="fit-step-title"
                  tabIndex={-1}
                  ref={headingRef}
                >
                  {websiteIntent ? "What needs to change on your website?" : STEP_TITLES[1]}
                </h2>
                <p className="lf-audit__step-sub">
                  {websiteIntent
                    ? "We opened the website path. Keep it, or choose the problem that sounds closest."
                    : "Pick the closest fit. It helps us understand the problem. You can say more later."}
                </p>
                <div
                  className="lf-audit__cards"
                  role="group"
                  aria-labelledby="fit-step-title"
                >
                  {auditRoutes.map((route) => {
                    const Icon = route.icon;
                    const active = symptom === route.label;
                    return (
                      <button
                        key={route.label}
                        type="button"
                        className={`lf-audit__card${active ? " is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => pickSymptom(route.label)}
                      >
                        <span className="lf-audit__card-chip" aria-hidden="true">
                          <Icon size={20} strokeWidth={1.75} />
                        </span>
                        <span className="lf-audit__card-label">{route.label}</span>
                        <span className="lf-audit__card-check" aria-hidden="true">
                          <Check size={14} strokeWidth={2.5} />
                        </span>
                        <span className="lf-audit__card-copy">{route.copy}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="lf-audit__step-nav">
                  {websiteIntent && symptom && (
                    <button
                      type="button"
                      className="lf-audit__continue"
                      onClick={() => pickSymptom(symptom)}
                    >
                      Continue <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="lf-audit__skip"
                    onClick={() => skipToForm(1)}
                  >
                    Write a brief instead <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="lf-audit__step">
                <h2
                  className="lf-audit__step-title"
                  id="fit-step-title"
                  tabIndex={-1}
                  ref={headingRef}
                >
                  {STEP_TITLES[2]}
                </h2>
                <p className="lf-audit__step-sub">
                  An honest answer is fine. It sets how fast we move.
                </p>
                <div
                  className="lf-audit__cards lf-audit__cards--three"
                  role="group"
                  aria-labelledby="fit-step-title"
                >
                  {URGENCY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = urgency === option.label;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        className={`lf-audit__card${active ? " is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => pickUrgency(option.label)}
                      >
                        <span className="lf-audit__card-chip" aria-hidden="true">
                          <Icon size={20} strokeWidth={1.75} />
                        </span>
                        <span className="lf-audit__card-label">{option.label}</span>
                        <span className="lf-audit__card-check" aria-hidden="true">
                          <Check size={14} strokeWidth={2.5} />
                        </span>
                        <span className="lf-audit__card-copy">{option.copy}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="lf-audit__step-nav">
                  <button
                    type="button"
                    className="lf-audit__back"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" /> Back
                  </button>
                  <button
                    type="button"
                    className="lf-audit__skip"
                    onClick={() => skipToForm(2)}
                  >
                    Skip to the form <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="lf-audit__step">
                <h2
                  className={`lf-audit__step-title${
                    payoff ? " lf-audit__step-title--payoff" : ""
                  }`}
                  id="fit-step-title"
                  tabIndex={-1}
                  ref={headingRef}
                >
                  {websiteIntent ? "Where should we send your plan?" : STEP_TITLES[3]}
                </h2>
                <p className="lf-audit__step-sub">
                  {websiteIntent
                    ? "A short note is enough. A real person reads every message."
                    : "Free, and no obligation. We only need enough to reply."}
                </p>

                {/* This list used to sit below the submit button, so an owner
                    gave us a name, a business, a contact and a problem before
                    learning what came back. Answer first, then ask. */}
                <p className="lf-audit__outcomes lf-audit__outcomes--lead">
                  You get back:{" "}
                  {OUTCOMES.map((o, i) => (
                    <span key={o}>
                      <strong>{o}</strong>
                      {i < OUTCOMES.length - 1 ? "; " : "."}
                    </span>
                  ))}
                </p>

                <form
                  className="lf-audit__form"
                  name="tech-audit-scratch"
                  method="POST"
                  action={confirmationPath}
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <input type="hidden" name="form-name" value="tech-audit-scratch" />
                  <input type="hidden" name="subject" value="New Little Fight NYC Tech Audit" />
                  <input type="hidden" name="source" value="littlefightnyc.com/tech-audit" />
                  <input
                    type="hidden"
                    name="dakota_capture_id"
                    value={dakotaCaptureId}
                    readOnly
                  />
                  <input
                    type="hidden"
                    name="dakota_submitted_at"
                    value={dakotaSubmittedAt}
                    readOnly
                  />
                  <input type="hidden" name="intent" value={leadIntent} />
                  <input type="hidden" name="lead_origin" value={leadOrigin} />
                  {/* Always render the field so Netlify's build-time form
                      detector registers it; malformed or absent context posts
                      an empty value, never unchecked query input. */}
                  <input type="hidden" name="report_id" value={reportId} />
                  {websiteUrl && <input type="hidden" name="website_url" value={websiteUrl} />}
                  {symptom && <input type="hidden" name="symptom" value={symptom} />}
                  {urgency && <input type="hidden" name="urgency" value={urgency} />}
                  {Object.entries(attribution).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value} />
                  ))}
                  <p className="lf-audit__honeypot" aria-hidden="true">
                    <label htmlFor="bot-field">Do not fill this out</label>
                    <input id="bot-field" name="bot-field" tabIndex={-1} autoComplete="off" />
                  </p>

                  <div className={`lf-audit__field${fieldClass("name", fields.name)}`}>
                    <label htmlFor="fit-name">Your name</label>
                    <input
                      id="fit-name"
                      name="name"
                      autoComplete="name"
                      required
                      value={fields.name}
                      onChange={(e) => {
                        setField("name", e.target.value);
                        clearErrorIfFilled("name", e.target.value);
                      }}
                      onBlur={(e) => validateField("name", e.target.value)}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "fit-name-error" : undefined}
                    />
                    {errors.name && (
                      <p className="lf-audit__error" role="alert" id="fit-name-error">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className={`lf-audit__field${fieldClass("business", fields.business)}`}>
                    <label htmlFor="fit-business">Business</label>
                    <input
                      id="fit-business"
                      name="business"
                      autoComplete="organization"
                      required
                      value={fields.business}
                      onChange={(e) => {
                        setField("business", e.target.value);
                        clearErrorIfFilled("business", e.target.value);
                      }}
                      onBlur={(e) => validateField("business", e.target.value)}
                      aria-invalid={errors.business ? true : undefined}
                      aria-describedby={errors.business ? "fit-business-error" : undefined}
                    />
                    {errors.business && (
                      <p className="lf-audit__error" role="alert" id="fit-business-error">
                        {errors.business}
                      </p>
                    )}
                  </div>

                  <div className={`lf-audit__field${fieldClass("contact", fields.contact)}`}>
                    <label htmlFor="fit-contact">
                      {fields.follow_up === "email"
                        ? "Email"
                        : fields.follow_up === "text" || fields.follow_up === "phone"
                          ? "Phone"
                          : "Phone or email"}
                    </label>
                    <input
                      id="fit-contact"
                      name="contact"
                      autoComplete={
                        fields.follow_up === "text" || fields.follow_up === "phone"
                          ? "tel"
                          : "email"
                      }
                      inputMode={
                        fields.follow_up === "text" || fields.follow_up === "phone"
                          ? "tel"
                          : "email"
                      }
                      autoCapitalize="none"
                      spellCheck={false}
                      maxLength={254}
                      required
                      placeholder={
                        fields.follow_up === "email"
                          ? "hello@yourshop.com"
                          : fields.follow_up === "text" || fields.follow_up === "phone"
                            ? "(646) 555-0118"
                            : "(646) 555-0118 or hello@yourshop.com"
                      }
                      value={fields.contact}
                      onChange={(e) => {
                        setField("contact", e.target.value);
                        clearErrorIfFilled("contact", e.target.value);
                      }}
                      onBlur={(e) => validateField("contact", e.target.value)}
                      aria-invalid={errors.contact ? true : undefined}
                      aria-describedby={errors.contact ? "fit-contact-error" : undefined}
                    />
                    {errors.contact && (
                      <p className="lf-audit__error" role="alert" id="fit-contact-error">
                        {errors.contact}
                      </p>
                    )}
                  </div>

                  <div className={`lf-audit__field${errors.follow_up ? " is-error" : ""}`}>
                    <label htmlFor="fit-follow-up">Best way to reach you</label>
                    <select
                      id="fit-follow-up"
                      name="follow_up"
                      value={fields.follow_up}
                      onChange={(e) => setFollowUpPreference(e.target.value)}
                      aria-invalid={errors.follow_up ? true : undefined}
                      aria-describedby={
                        errors.follow_up
                          ? "fit-follow-up-note fit-follow-up-error"
                          : "fit-follow-up-note"
                      }
                    >
                      <option value="fastest">Whatever’s fastest</option>
                      <option value="text" disabled={contactRoute === "email"}>Text me</option>
                      <option value="phone" disabled={contactRoute === "email"}>Call me</option>
                      <option value="email" disabled={contactRoute === "phone"}>Email me</option>
                    </select>
                    <p className="lf-audit__note" id="fit-follow-up-note">
                      We use only the route you choose. Text and phone need a phone number;
                      email needs an email address.
                    </p>
                    {errors.follow_up && (
                      <p className="lf-audit__error" role="alert" id="fit-follow-up-error">
                        {errors.follow_up}
                      </p>
                    )}
                  </div>

                  <div
                    className={`lf-audit__field lf-audit__field--full${
                      fieldClass("message", message)
                    }`}
                  >
                    <label htmlFor="fit-message">
                      {websiteIntent
                        ? "What should your website do better?"
                        : "What feels broken, expensive, slow, or disconnected?"}
                    </label>
                    <textarea
                      id="fit-message"
                      name="message"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => {
                        if (e.target.value.trim()) trackAuditStarted("field_message");
                        setMessage(e.target.value);
                        setMessageDirty(true);
                        clearErrorIfFilled("message", e.target.value);
                      }}
                      onBlur={(e) => validateField("message", e.target.value)}
                      placeholder={websiteIntent
                        ? "For example: customers cannot find what we offer, we need online booking, or the current site no longer reflects the business."
                        : "A short sentence is fine. We will ask the rest when we reply."}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={
                        errors.message ? "fit-message-error" : "fit-message-note"
                      }
                    />
                    <p className="lf-audit__note" id="fit-message-note">
                      No passwords or private customer data here. We do not need them to understand the job.
                    </p>
                    {errors.message && (
                      <p className="lf-audit__error" role="alert" id="fit-message-error">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    className="lf-audit__submit"
                    type="submit"
                    disabled={submitting}
                    aria-busy={submitting ? true : undefined}
                  >
                    {submitting ? (
                      <>
                        <span className="lf-audit__spinner" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      <>
                        {websiteIntent ? "Send my website plan request" : "Send my note"}{" "}
                        <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                      </>
                    )}
                  </button>
                  <p className="lf-audit__submit-status" aria-live="polite" aria-atomic="true">
                    {submitting ? "Sending securely. Keep this tab open for confirmation." : ""}
                  </p>
                  <p className="lf-audit__assurance">
                    Free first look / No obligation / We reply 9am-9pm Eastern /
                    Urgent? Call <a href={PHONE_HREF} data-lf-label="tech_audit_form_phone">{PHONE_DISPLAY}</a>
                  </p>
                  <p className="lf-audit__assurance lf-audit__assurance--data">
                    Your details stay with Little Fight NYC. We use them only to understand
                    the request and prepare the right response.
                  </p>
                </form>

              </div>
            )}

          </div>

          <aside className="lf-audit__aside">
            <p className="lf-audit__aside-label">Direct line</p>
            <PhoneAction
              className="lf-audit__aside-phone"
              analyticsLabel="tech_audit_aside_phone"
            >
              {PHONE_DISPLAY}
            </PhoneAction>
            <p className="lf-audit__aside-note">
              9am-9pm Eastern. Call or text Little Fight NYC about urgent support, a
              new website, or a complicated setup. After hours, leave a message and we will follow up.
            </p>

            <p className="lf-audit__aside-label lf-audit__aside-label--next">
              What happens next
            </p>
            <TimelineStrip
              vertical
              className="lf-audit__next"
              label="What happens after you send your message"
              summary="We read what is happening and reply with a clear next step."
              beats={[
                { label: "Send your message" },
                { label: "We read what is happening", sub: "9am-9pm ET", marker: true },
                { label: "Clear next step", sub: "Free consultation" },
              ]}
            />
          </aside>
        </div>
      </section>
    </>
  );
}
