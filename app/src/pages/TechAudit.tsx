import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ClipboardCheck, Clock, Flame } from "lucide-react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import PhoneAction from "@/components/editorial/PhoneAction";
import TimelineStrip from "@/components/dataviz/TimelineStrip";
import { auditRoutes } from "@/data/site";
import { useHaptic } from "@/hooks/useHaptic";
import { trackEvent } from "@/lib/analyticsClient";
import { readAttribution } from "@/lib/attribution";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import "@/styles/editorial/tech-audit.css";

type FieldName = "name" | "business" | "contact" | "message";
type Step = 1 | 2 | 3;

const OUTCOMES = [
  "What to keep",
  "What to fix first",
  "The clearest next move",
  "An honest answer if the work can wait",
];

const REQUIRED_FIELDS: { name: FieldName; message: string }[] = [
  { name: "name", message: "Tell us who you are." },
  { name: "business", message: "Add your business name." },
  { name: "contact", message: "Add a phone or email so we can reply." },
  { name: "message", message: "Tell us what you want to improve or build." },
];

const URGENCY_OPTIONS = [
  {
    label: "It's hurting customers right now",
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

/* Cleared by /thanks/ on confirmed success (Thanks.tsx uses the literal key
 * to avoid importing this chunk) — keep the two in sync. */
const DRAFT_KEY = "lf_tech_audit_draft";
const WEBSITE_INTENT = "website";
const WEBSITE_ROUTE = auditRoutes[0];

function queryValue(params: URLSearchParams, key: string, maxLength: number): string {
  return (params.get(key) ?? "").trim().slice(0, maxLength);
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
  follow_up: string;
};

const EMPTY_FIELDS: ContactFields = {
  name: "",
  business: "",
  contact: "",
  follow_up: "text",
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
    return {
      intent,
      step,
      symptom,
      urgency,
      message: typeof d.message === "string" ? d.message : "",
      messageDirty: d.messageDirty === true,
      fields: { ...EMPTY_FIELDS, ...(d.fields ?? {}) },
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft): void {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable — flow still works, it just won't remember */
  }
}

export default function TechAudit() {
  const [searchParams] = useSearchParams();
  const websiteUrl = sharedWebsiteUrl(searchParams);
  // A shared URL (from the PWA share target) is, by definition, a website the
  // owner wants us to look at — so it drops the form into website mode too.
  const websiteIntent =
    searchParams.get("intent") === WEBSITE_INTENT || Boolean(websiteUrl);
  // Attribute a lead that arrived via the PWA share target (no explicit source,
  // but the share sheet passed text/title) so shares are measurable.
  const explicitSource = queryValue(searchParams, "source", 80);
  const leadOrigin =
    explicitSource ||
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
  // Payoff beat — plays once when step 3 is REACHED with both choices made
  // (not when a saved draft restores straight into step 3).
  const [payoff, setPayoff] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const mountedRef = useRef(false);
  const attribution = readAttribution();
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

  function setField(name: keyof ContactFields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  /* Inline validation (§6.2): check a required field when the user leaves it,
   * and clear its error the moment they fix it — never wait for submit. */
  function validateField(name: FieldName, value: string) {
    const rule = REQUIRED_FIELDS.find((f) => f.name === name);
    if (!rule) return;
    setErrors((prev) => {
      const next = { ...prev };
      if (value.trim() === "") next[name] = rule.message;
      else delete next[name];
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
    trackEvent("intake_step_1", {
      selection: label,
      intent: websiteIntent ? WEBSITE_INTENT : "general",
    });
    setSymptom(label);
    if (!messageDirty) {
      setMessage(composeContextMessage(label, urgency, websiteUrl));
    }
    hapticStep();
    setStep(2);
  }

  function pickUrgency(label: string) {
    trackEvent("intake_step_2", {
      selection: label,
      intent: websiteIntent ? WEBSITE_INTENT : "general",
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
    trackEvent(`intake_step_${fromStep}`, {
      skipped: true,
      intent: websiteIntent ? WEBSITE_INTENT : "general",
    });
    hapticStep();
    setStep(3);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const nextErrors: Partial<Record<FieldName, string>> = {};

    for (const field of REQUIRED_FIELDS) {
      const el = form.elements.namedItem(field.name) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;
      if (!el || el.value.trim() === "") {
        nextErrors[field.name] = field.message;
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

    hapticSubmit();

    // Valid — let the native Netlify POST proceed, show the loading state.
    // The draft is deliberately NOT cleared here: if the POST fails (offline,
    // server error) the user's answers survive a Back navigation. /thanks/
    // clears it on confirmed success instead.
    setErrors({});
    try {
      window.sessionStorage.setItem(
        "lf_lead_intent",
        websiteIntent ? WEBSITE_INTENT : "general",
      );
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
              <p>Tell us what the site needs to do. A real person reviews it and replies with a practical next move.</p>
              <p className="lf-audit-intro__meta">About two minutes. Reviewed by a person. Replies 9am-9pm Eastern.</p>
            </div>
            <Link
              className="lf-audit-intro__proof"
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
              <span>Hair By Rachel Charles: live in two weeks, with 100 Lighthouse scores.</span>
            </Link>
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
          dek="One short form. Tell us what feels broken, expensive, slow, or confusing in your own words. A person reads it and replies with a clear next move."
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
                    ? "We opened the website path. Confirm it, or choose the issue closest to the work ahead."
                    : "Pick the closest fit. It helps us prep. You can say more later."}
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
                    ? "About two minutes. A real person reads every brief."
                    : "We only need enough to reply. The rest happens on the call."}
                </p>

                <form
                  className="lf-audit__form"
                  name="tech-audit-scratch"
                  method="POST"
                  action="/thanks/"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <input type="hidden" name="form-name" value="tech-audit-scratch" />
                  <input type="hidden" name="subject" value="New Little Fight NYC Tech Audit" />
                  <input type="hidden" name="source" value="littlefightnyc.com/tech-audit" />
                  <input type="hidden" name="intent" value={websiteIntent ? WEBSITE_INTENT : "general"} />
                  <input type="hidden" name="lead_origin" value={leadOrigin} />
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
                    <label htmlFor="fit-contact">Phone or email</label>
                    <input
                      id="fit-contact"
                      name="contact"
                      autoComplete="email"
                      required
                      placeholder="(646) 555-0118 or hello@yourshop.com"
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

                  <div className="lf-audit__field">
                    <label htmlFor="fit-follow-up">Best way to reach you</label>
                    <select
                      id="fit-follow-up"
                      name="follow_up"
                      value={fields.follow_up}
                      onChange={(e) => setField("follow_up", e.target.value)}
                    >
                      <option value="text">Text me</option>
                      <option value="phone">Call me</option>
                      <option value="email">Email me</option>
                      <option value="fastest">Whatever's fastest</option>
                    </select>
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
                        setMessage(e.target.value);
                        setMessageDirty(true);
                        clearErrorIfFilled("message", e.target.value);
                      }}
                      onBlur={(e) => validateField("message", e.target.value)}
                      placeholder={websiteIntent
                        ? "For example: customers cannot find what we offer, we need online booking, or the current site no longer reflects the business."
                        : "A short sentence is fine. We will ask the rest on the call."}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={
                        errors.message ? "fit-message-error" : "fit-message-note"
                      }
                    />
                    <p className="lf-audit__note" id="fit-message-note">
                      No passwords or private customer data here. We never need them to scope.
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
                    Free consultation / No obligation / Response window: 9am-9pm Eastern /
                    Urgent? Call <a href="tel:+16463600318">(646) 360-0318</a>
                  </p>
                  <p className="lf-audit__assurance lf-audit__assurance--data">
                    Your details stay with Little Fight NYC. We use them only to understand
                    the request and prepare the right response.
                  </p>
                </form>

              </div>
            )}

            <p className="lf-audit__outcomes">
              Here is what we will give you:{" "}
              {OUTCOMES.map((o, i) => (
                <span key={o}>
                  <strong>{o}</strong>
                  {i < OUTCOMES.length - 1 ? "; " : "."}
                </span>
              ))}
            </p>
          </div>

          <aside className="lf-audit__aside">
            <p className="lf-audit__aside-label">Direct line</p>
            <PhoneAction className="lf-audit__aside-phone">
              (646) 360-0318
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
              label="What happens after you send a Tech Audit brief"
              summary="Little Fight NYC reviews the request, confirms the context, and returns a clear recommended next step."
              beats={[
                { label: "Send the brief" },
                { label: "We review the context", sub: "9am-9pm ET", marker: true },
                { label: "Clear next step", sub: "Free consultation" },
              ]}
            />
          </aside>
        </div>
      </section>
    </>
  );
}
