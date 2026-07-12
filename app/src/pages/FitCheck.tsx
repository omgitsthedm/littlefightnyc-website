import { useRef, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import type { FormEvent } from "react";
import PageHero from "@/components/editorial/PageHero";
import PhoneAction from "@/components/editorial/PhoneAction";
import TimelineStrip from "@/components/dataviz/TimelineStrip";
import { fitRoutes } from "@/data/site";
import { readAttribution } from "@/lib/attribution";
import "@/styles/editorial/fitcheck.css";

type FieldName = "name" | "business" | "contact" | "message";

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

export default function FitCheck() {
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [symptom, setSymptom] = useState<string | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const attribution = readAttribution();

  function pickSymptom(label: string, copy: string) {
    setSymptom(label);
    const el = messageRef.current;
    if (el && el.value.trim() === "") {
      el.value = `${label} — ${copy}`;
    }
    el?.focus();
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
          <div className="lf-fit__router" aria-label="Where does it hurt?">
            <p className="lf-fit__router-label">Start from the symptom</p>
            <div className="lf-fit__chips" role="group" aria-label="Pick what fits">
              {fitRoutes.map((route) => {
                const Icon = route.icon;
                const active = symptom === route.label;
                return (
                  <button
                    key={route.label}
                    type="button"
                    className={`lf-fit__chip${active ? " is-active" : ""}`}
                    aria-pressed={active}
                    onClick={() => pickSymptom(route.label, route.copy)}
                  >
                    <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                    {route.label}
                  </button>
                );
              })}
            </div>
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
                ref={messageRef}
                placeholder="A short sentence is fine. We'll ask the rest on the call."
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "fit-message-error" : "fit-message-note"}
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
