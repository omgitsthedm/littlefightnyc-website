import { ExternalLink, Headphones, Mail, MessageSquare, Phone } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import {
  BILLING_EMAIL,
  BOOKING_HREF,
  GOOGLE_REVIEW_HREF,
  PHONE_DISPLAY,
  PHONE_HREF,
  PROJECTS_EMAIL,
  SMS_HREF,
  SUPPORT_EMAIL,
} from "@/data/contact";
import "@/styles/editorial/revenue-pages.css";

const CLIENT_ROUTES = [
  {
    label: "Support",
    email: SUPPORT_EMAIL,
    subject: "Client support request",
    detail: "Something broke, changed, or needs attention.",
  },
  {
    label: "Projects",
    email: PROJECTS_EMAIL,
    subject: "Project update",
    detail: "Send content, feedback, an approval, or a project question.",
  },
  {
    label: "Billing",
    email: BILLING_EMAIL,
    subject: "Billing question",
    detail: "Ask about an invoice, receipt, scope, or payment record.",
  },
] as const;

export default function Clients() {
  return (
    <>
      <PageHero
        eyebrow="Current client desk"
        icon={Headphones}
        title={<>One clean door back in.</>}
        dek="Pick the route that matches the need. Each one reaches Little Fight with enough context to start in the right place."
        image={{
          src: "/images/brand-scenes/restaurant-counter.webp",
          alt: "A restaurant counter ready for the business day",
          width: 1672,
          height: 941,
        }}
      />

      <section className="lf-revenue-page lf-revenue-page--clients" aria-labelledby="lf-client-title">
        <header className="lf-revenue-page__intro">
          <p>Choose the real need</p>
          <h2 id="lf-client-title">A person should understand the first message.</h2>
          <div>
            <p>
              These addresses are routing labels, not separate departments.
              They reach the same Little Fight inbox and make the reason for
              the message clear before a reply.
            </p>
          </div>
        </header>

        <ul className="lf-client-desk">
          {CLIENT_ROUTES.map((route) => (
            <li key={route.email}>
              <p>{route.label}</p>
              <h3>{route.detail}</h3>
              <a href={`mailto:${route.email}?subject=${encodeURIComponent(route.subject)}`}>
                <Mail size={18} strokeWidth={1.8} aria-hidden="true" />
                {route.email}
              </a>
            </li>
          ))}
        </ul>

        <div className="lf-client-now">
          <div>
            <p>Customer-facing problem right now?</p>
            <h2>Call or text first.</h2>
            <span>Daily, 9am–9pm Eastern · {PHONE_DISPLAY}</span>
          </div>
          <div>
            <a href={PHONE_HREF} data-lf-label="client_desk_phone">
              <Phone size={18} strokeWidth={1.8} aria-hidden="true" />
              Call
            </a>
            <a href={SMS_HREF} data-lf-label="client_desk_sms">
              <MessageSquare size={18} strokeWidth={1.8} aria-hidden="true" />
              Text
            </a>
          </div>
        </div>

        <div className="lf-client-followup">
          <article>
            <p>Review the setup together</p>
            <h2>Book a check-in.</h2>
            <p>The booking page shows the current availability and meeting details.</p>
            <a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" data-lf-event="booking_started" data-lf-label="client_desk">
              Open the booking page
              <ExternalLink size={15} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </article>
          <article>
            <p>Completed real work with us?</p>
            <h2>Tell the next owner what happened.</h2>
            <p>An honest review helps. There is no incentive, review gate, or preferred rating.</p>
            <a href={GOOGLE_REVIEW_HREF} target="_blank" rel="noreferrer">
              Leave a Google review
              <ExternalLink size={15} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>
    </>
  );
}
