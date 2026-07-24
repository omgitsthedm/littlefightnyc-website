import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardCheck,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
} from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import { responsiveImageProps } from "@/lib/responsiveImages";
import "@/styles/editorial/contact.css";

const SMS_URL = `${String.fromCharCode(115, 109, 115, 58)}+16463600318`;

const NEXT_STEPS = [
  {
    title: "Tell us what changed",
    copy: "Use ordinary words. A website address, screenshot, bill, or the thing a customer could not do is enough to begin.",
  },
  {
    title: "We check the path",
    copy: "We look at the surrounding website, account, tool, or handoff before we name the fix.",
  },
  {
    title: "You get a clear next move",
    copy: "We explain what to keep, what needs attention, and what the work would involve before anything changes.",
  },
] as const;

const RESPONSE_PROMISES = [
  { value: "Free", label: "Consulting, always" },
  { value: "2 hours", label: "Missed-call callback, 9am-9pm ET" },
  { value: "24 hours", label: "Urgent on-site help" },
] as const;

export default function Contact() {
  const backOfficeScene = "/images/brand-scenes/shop-back-office.webp";

  return (
    <div className="lf-contact-page">
      <PageHero
        eyebrow="Contact"
        icon={MessageSquare}
        title={
          <>
            Tell us what feels <span className="lf-em">stuck.</span>
          </>
        }
        dek="Call or text now. For a website, send the address. You do not need the technical name."
        image={{
          src: "/assets/hero-contact-door.webp",
          alt: "A warm-lit shop doorway open at dusk in New York",
          width: 1600,
          height: 1200,
        }}
      />

      <section
        id="contact"
        className="lf-contact-choice"
        aria-labelledby="lf-contact-choice-title"
      >
        <div className="lf-contact-choice__inner">
          <header className="lf-contact-choice__head">
            <p>Start here</p>
            <h2 id="lf-contact-choice-title">Pick the easiest way to begin.</h2>
            <p>
              No account. No phone tree. No perfect brief. Choose the option
              that matches what is happening today.
            </p>
          </header>

          <nav className="lf-contact-choice__routes" aria-label="Ways to contact Little Fight NYC">
            <Link
              className="lf-contact-choice__route lf-contact-choice__route--primary"
              to="/tech-audit/?intent=website&source=contact"
              data-lf-event="website_plan_intent"
            >
              <span className="lf-contact-choice__route-top">
                <ClipboardCheck size={22} strokeWidth={1.9} aria-hidden="true" />
                Website review
              </span>
              <strong>Send us your website</strong>
              <small>
                Get a free first read on what to keep, what is unclear, and what
                should change first.
              </small>
              <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
            </Link>

            <a className="lf-contact-choice__route" href="tel:+16463600318">
              <span className="lf-contact-choice__route-top">
                <Phone size={22} strokeWidth={1.9} aria-hidden="true" />
                Call
              </span>
              <strong>(646) 360-0318</strong>
              <small>
                Best when email, booking, payments, Wi-Fi, access, or customers
                are blocked now.
              </small>
              <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
            </a>

            <a className="lf-contact-choice__route" href={SMS_URL}>
              <span className="lf-contact-choice__route-top">
                <MessageSquare size={22} strokeWidth={1.9} aria-hidden="true" />
                Text
              </span>
              <strong>(646) 360-0318</strong>
              <small>
                Best when you are at the counter and need to send a short note
                or screenshot.
              </small>
              <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
            </a>
          </nav>

          <p className="lf-contact-choice__email">
            <Mail size={19} strokeWidth={1.9} aria-hidden="true" />
            Prefer email?{" "}
            <a
              className="lf-contact-choice__email-link"
              href="mailto:hello@littlefightnyc.com"
            >
              hello@littlefightnyc.com
            </a>
          </p>
        </div>
      </section>

      <section className="lf-contact-next" aria-labelledby="lf-contact-next-title">
        <div className="lf-contact-next__inner">
          <header className="lf-contact-next__head">
            <p>What happens next</p>
            <h2 id="lf-contact-next-title">
              A short conversation. A clear next move.
            </h2>
            <p>
              You stay in control. We explain the problem and the options
              before any paid work or system change begins.
            </p>
          </header>

          <ol className="lf-contact-next__steps">
            {NEXT_STEPS.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </li>
            ))}
          </ol>

          <dl className="lf-contact-next__promises" aria-label="Response promises">
            {RESPONSE_PROMISES.map((promise) => (
              <div key={promise.label}>
                <dt>{promise.value}</dt>
                <dd>{promise.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="lf-contact-ready" aria-labelledby="lf-contact-ready-title">
        <div className="lf-contact-ready__inner">
          <figure className="lf-contact-ready__figure">
            <img
              src={backOfficeScene}
              {...responsiveImageProps(
                backOfficeScene,
                "(min-width: 1024px) 48vw, 100vw",
                [480, 640, 900, 1200],
              )}
              alt="A small shop back office with inventory notes, labels, and connected devices"
              width={1672}
              height={941}
              loading="lazy"
              decoding="async"
            />
            <figcaption>Illustrative business environment. Not client evidence.</figcaption>
          </figure>

          <div className="lf-contact-ready__copy">
            <p className="lf-contact-ready__eyebrow">Bring what you have</p>
            <h2 id="lf-contact-ready-title">A screenshot is enough to start.</h2>
            <p>
              If you have the website address, the exact error, a recent bill,
              or the time the problem happened, send it. If you do not, tell us
              what you or the customer tried to do.
            </p>

            <p className="lf-contact-ready__safety">
              <ShieldCheck size={21} strokeWidth={1.9} aria-hidden="true" />
              Never send passwords, recovery codes, payment details, or private
              customer information.
            </p>

            <div className="lf-contact-ready__coverage">
              <MapPin size={21} strokeWidth={1.9} aria-hidden="true" />
              <p>
                Based in Manhattan and working across New York City. When an
                urgent problem needs hands, on-site help is available within 24
                hours.{" "}
                <Link className="lf-contact-ready__coverage-link" to="/areas/">
                  See where we work.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
