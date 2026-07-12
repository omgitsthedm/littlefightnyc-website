import { useEffect, useRef, useState } from "react";
import { CalendarDays, ClipboardCheck, Clock, Flame } from "lucide-react";
import type { FormEvent } from "react";
import PageHero from "@/components/editorial/PageHero";
import PhoneAction from "@/components/editorial/PhoneAction";
import TimelineStrip from "@/components/dataviz/TimelineStrip";
import { fitRoutes } from "@/data/site";
import { readAttribution } from "@/lib/attribution";
import "@/styles/editorial/fitcheck.css";

type FieldName = "name" | "business" | "contact" | "message";
type Step = 1 | 2 | 3;

const OUTCOMES = [
  "An urgent fix plan",
  "A fix list, ranked by what hurts most",
  "An honest “you don’t need us yet”",
];

const REQUIRED_FIELDS: { name: FieldName; message: string }[] = [
  { name: "name", message: "Tell us who you are." },
  { name: "business", message: "Add your business name." },
  { name: "contact", message: "Add a phone or email so we can reply." },
  { name: "message", message: "Tell us what feels broken." },
];

const URGENCY_OPTIONS = [
  {
    label: "It's hurting customers right now",
    copy: "Broken checkout, dead site, missed calls — today.",
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
  1: "What's going on?",
  2: "How urgent is it?",
  3: "How do we reach you?",
};

function composeMessage(symptom: string | null, urgency: string | null): string {
  const lines: string[] = [];
  const route = fitRoutes.find((r) => r.label === symptom);
  if (route) lines.push(`${route.label} — ${route.copy}`);
  if (urgency) lines.push(`Timing: ${urgency}.`);
  return lines.join("\n");
}

export default function FitCheck() {
  const [step, setStep] = useState<Step>(1);
  const [symptom, setSymptom] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageDirty, setMessageDirty] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const mountedRef = useRef(false);
  const attribution = readAttribution();

  // Move focus to the step heading on step change (not on first paint).
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  function pickSymptom(label: string) {
    setSymptom(label);
    if (!messageDirty) setMessage(composeMessage(label, urgency));
    setStep(2);
  }

  function pickUrgency(label: string) {
    setUrgency(label);
    if (!messageDirty) setMessage(composeMessage(symptom, label));
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
      const first = form.elements.namedItem(
        Object.keys(nextErrors)[0],
      ) as HTMLElement | null;
      first?.focus();
      return;
    }

    // Valid — let the native Netlify POST proceed, show the loading state.
    setErrors({});
    setSubmitting(true);
  }

  return (
    <>
      <PageHero
        eyebrow="Tech Audit"
        icon={ClipboardCheck}
        title={
          <>
            Show us the<br />
            {" "}
            <span className="lf-em">moving parts.</span>
          </>
        }
        dek="Use this when the problem has parts. Tell us what feels broken, expensive, slow, or disconnected. We reply within two hours from 9am-9pm Eastern. The consult is free."
        image={{
          src: "/assets/manhattan.webp",
          alt: "Manhattan rooftops at golden hour",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-fit">
        <div className="lf-fit__inner">
          <div className="lf-fit__flow">
            <div className="lf-fit__progress">
              <p className="lf-fit__progress-label" aria-live="polite">
                Step {step} of 3 <span className="lf-fit__sr">— {STEP_TITLES[step]}</span>
              </p>
              <div className="lf-fit__progress-bar" aria-hidden="true">
                {([1, 2, 3] as const).map((s) => (
                  <span
                    key={s}
                    className={`lf-fit__progress-seg${s <= step ? " is-done" : ""}`}
                  />
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="lf-fit__step">
                <h2
                  className="lf-fit__step-title"
                  id="fit-step-title"
                  tabIndex={-1}
                  ref={headingRef}
                >
                  {STEP_TITLES[1]}
                </h2>
                <p className="lf-fit__step-sub">
                  Pick the closest fit. It helps us prep — you can say more later.
                </p>
                <div
                  className="lf-fit__cards"
                  role="group"
                  aria-labelledby="fit-step-title"
                >
                  {fitRoutes.map((route) => {
                    const Icon = route.icon;
                    const active = symptom === route.label;
                    return (
                      <button
                        key={route.label}
                        type="button"
                        className={`lf-fit__card${active ? " is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => pickSymptom(route.label)}
                      >
                        <span className="lf-fit__card-chip" aria-hidden="true">
                          <Icon size={20} strokeWidth={1.75} />
                        </span>
                        <span className="lf-fit__card-label">{route.label}</span>
                        <span className="lf-fit__card-copy">{route.copy}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="lf-fit__step-nav">
                  <button
                    type="button"
                    className="lf-fit__skip"
                    onClick={() => setStep(3)}
                  >
                    Skip to the form <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="lf-fit__step">
                <h2
                  className="lf-fit__step-title"
                  id="fit-step-title"
                  tabIndex={-1}
                  ref={headingRef}
                >
                  {STEP_TITLES[2]}
                </h2>
                <p className="lf-fit__step-sub">
                  An honest answer is fine. It sets how fast we move.
                </p>
                <div
                  className="lf-fit__cards lf-fit__cards--three"
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
                        className={`lf-fit__card${active ? " is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => pickUrgency(option.label)}
                      >
                        <span className="lf-fit__card-chip" aria-hidden="true">
                          <Icon size={20} strokeWidth={1.75} />
                        </span>
                        <span className="lf-fit__card-label">{option.label}</span>
                        <span className="lf-fit__card-copy">{option.copy}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="lf-fit__step-nav">
                  <button
                    type="button"
                    className="lf-fit__back"
                    onClick={() => setStep(1)}
                  >
                    <span aria-hidden="true">←</span> Back
                  </button>
                  <button
                    type="button"
                    className="lf-fit__skip"
                    onClick={() => setStep(3)}
                  >
                    Skip to the form <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="lf-fit__step">
                <h2
                  className="lf-fit__step-title"
                  id="fit-step-title"
                  tabIndex={-1}
                  ref={headingRef}
                >
                  {STEP_TITLES[3]}
                </h2>
                <p className="lf-fit__step-sub">
                  We only need enough to reply. The rest happens on the call.
                </p>

                <form
                  className="lf-fit__form"
                  name="fit-check-scratch"
                  method="POST"
                  action="/thanks/"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <input type="hidden" name="form-name" value="fit-check-scratch" />
                  <input type="hidden" name="subject" value="New Little Fight NYC Tech Audit" />
                  <input type="hidden" name="source" value="littlefightnyc.com/tech-audit" />
                  {symptom && <input type="hidden" name="symptom" value={symptom} />}
                  {urgency && <input type="hidden" name="urgency" value={urgency} />}
                  {Object.entries(attribution).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value} />
                  ))}
                  <p className="lf-fit__honeypot" aria-hidden="true">
                    <label htmlFor="bot-field">Do not fill this out</label>
                    <input id="bot-field" name="bot-field" tabIndex={-1} autoComplete="off" />
                  </p>

                  <div className={`lf-fit__field${errors.name ? " is-error" : ""}`}>
                    <label htmlFor="fit-name">Your name</label>
                    <input
                      id="fit-name"
                      name="name"
                      autoComplete="name"
                      required
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "fit-name-error" : undefined}
                    />
                    {errors.name && (
                      <p className="lf-fit__error" id="fit-name-error">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className={`lf-fit__field${errors.business ? " is-error" : ""}`}>
                    <label htmlFor="fit-business">Business</label>
                    <input
                      id="fit-business"
                      name="business"
                      autoComplete="organization"
                      required
                      aria-invalid={errors.business ? true : undefined}
                      aria-describedby={errors.business ? "fit-business-error" : undefined}
                    />
                    {errors.business && (
                      <p className="lf-fit__error" id="fit-business-error">
                        {errors.business}
                      </p>
                    )}
                  </div>

                  <div className={`lf-fit__field${errors.contact ? " is-error" : ""}`}>
                    <label htmlFor="fit-contact">Phone or email</label>
                    <input
                      id="fit-contact"
                      name="contact"
                      autoComplete="email"
                      required
                      placeholder="(646) 555-0118 or hello@yourshop.com"
                      aria-invalid={errors.contact ? true : undefined}
                      aria-describedby={errors.contact ? "fit-contact-error" : undefined}
                    />
                    {errors.contact && (
                      <p className="lf-fit__error" id="fit-contact-error">
                        {errors.contact}
                      </p>
                    )}
                  </div>

                  <div className="lf-fit__field">
                    <label htmlFor="fit-follow-up">Best way to reach you</label>
                    <select id="fit-follow-up" name="follow_up" defaultValue="text">
                      <option value="text">Text me</option>
                      <option value="phone">Call me</option>
                      <option value="email">Email me</option>
                      <option value="fastest">Whatever's fastest</option>
                    </select>
                  </div>

                  <div
                    className={`lf-fit__field lf-fit__field--full${
                      errors.message ? " is-error" : ""
                    }`}
                  >
                    <label htmlFor="fit-message">
                      What feels broken, expensive, slow, or disconnected?
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
                      }}
                      placeholder="A short sentence is fine. We'll ask the rest on the call."
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={
                        errors.message ? "fit-message-error" : "fit-message-note"
                      }
                    />
                    <p className="lf-fit__note" id="fit-message-note">
                      No passwords or private customer data here — we never need them to scope.
                    </p>
                    {errors.message && (
                      <p className="lf-fit__error" id="fit-message-error">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    className="lf-fit__submit"
                    type="submit"
                    disabled={submitting}
                    aria-busy={submitting ? true : undefined}
                  >
                    {submitting ? (
                      <>
                        <span className="lf-fit__spinner" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Book my free Tech Audit <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>
                  <p className="lf-fit__assurance">
                    Free consult · We reply within 2 hours, 9am–9pm ET · Urgent? Call{" "}
                    <a href="tel:+16463600318">(646) 360-0318</a>
                  </p>
                </form>

                <div className="lf-fit__step-nav lf-fit__step-nav--below">
                  <button
                    type="button"
                    className="lf-fit__back"
                    onClick={() => setStep(2)}
                  >
                    <span aria-hidden="true">←</span> Back
                  </button>
                </div>
              </div>
            )}

            <p className="lf-fit__outcomes">
              You’ll get one of three answers:{" "}
              {OUTCOMES.map((o, i) => (
                <span key={o}>
                  <strong>{o}</strong>
                  {i < OUTCOMES.length - 1 ? " · " : "."}
                </span>
              ))}
              {" "}No pitch either way.
            </p>
          </div>

          <aside className="lf-fit__aside">
            <p className="lf-fit__aside-label">Or reach us now</p>
            <PhoneAction className="lf-fit__aside-phone">
              (646) 360-0318
            </PhoneAction>
            <p className="lf-fit__aside-note">
              9am-9pm Eastern. A human picks up when available. After hours,
              AI takes the message and David calls back.
            </p>

            <p className="lf-fit__aside-label lf-fit__aside-label--next">
              What happens next
            </p>
            <TimelineStrip
              vertical
              className="lf-fit__next"
              label="What happens after you book the Tech Audit"
              summary="After you book the Tech Audit: you get a callback within 2 hours between 9am and 9pm Eastern, then a free consult — no pitch."
              beats={[
                { label: "Book the Tech Audit" },
                { label: "Callback within 2 hours", sub: "9am–9pm ET", marker: true },
                { label: "Free consult", sub: "No pitch" },
              ]}
            />
          </aside>
        </div>
      </section>
    </>
  );
}
