import { ExternalLink, Headphones, Mail, MessageSquare, Phone } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import {
  BOOKING_HREF,
  GOOGLE_REVIEW_HREF,
  HELLO_EMAIL,
  PHONE_DISPLAY,
  PHONE_HREF,
  SMS_HREF,
} from "@/data/contact";
import "@/styles/editorial/revenue-pages.css";

export default function Clients() {
  return (
    <>
      <PageHero
        eyebrow="Current client desk"
        icon={Headphones}
        title={<>One clean door back in.</>}
        dek="Email one inbox with the details. Call or text when customers are blocked right now."
        image={{
          src: "/images/brand-scenes/restaurant-counter.webp",
          alt: "A restaurant counter ready for the business day",
          width: 1672,
          height: 941,
        }}
      />

      <section className="lf-revenue-page lf-revenue-page--clients" aria-labelledby="lf-client-title">
        <header className="lf-revenue-page__intro">
          <p>One inbox. No department maze.</p>
          <h2 id="lf-client-title">Tell us what needs attention.</h2>
          <div>
            <p>
              Use this address for support, project updates, billing questions,
              or anything else about current work. Include the business name
              and a plain description of what happened.
            </p>
          </div>
        </header>

        <ul className="lf-client-desk lf-client-desk--single">
          <li>
            <p>Current client email</p>
            <h3>Support, projects, and billing belong here.</h3>
            <a href={`mailto:${HELLO_EMAIL}?subject=Current%20client%20request`}>
              <Mail size={18} strokeWidth={1.8} aria-hidden="true" />
              {HELLO_EMAIL}
            </a>
          </li>
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
