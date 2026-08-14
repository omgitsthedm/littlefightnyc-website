import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Globe2, Mail, MessageSquare, Phone } from "lucide-react";
import "./QuietContact.css";
import { BOOKING_HREF, PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";
import {
  techAuditHref,
  type AcquisitionIntent,
} from "@/lib/acquisitionIntent";

const PLAN_COPY: Record<AcquisitionIntent, {
  label: string;
  title: string;
  detail: string;
}> = {
  website: {
    label: "I want a stronger website",
    title: "Get a free website plan",
    detail: "A human review before any paid work.",
  },
  support: {
    label: "I need a practical fix",
    title: "Get a clear tech plan",
    detail: "A human review before any paid work.",
  },
  consulting: {
    label: "I want a clearer next move",
    title: "Get a free second opinion",
    detail: "A human review before any paid work.",
  },
  systems: {
    label: "The tools do not fit",
    title: "Plan a system you own",
    detail: "A human review before any paid work.",
  },
  clients: {
    label: "I am already a client",
    title: "Open the client desk",
    detail: "Requests, access, and care in one place.",
  },
  general: {
    label: "I want a clearer next move",
    title: "Get a free second opinion",
    detail: "A human review before any paid work.",
  },
};

type Props = {
  heading?: string;
  lede?: string;
  intent?: AcquisitionIntent;
  showBooking?: boolean;
};

export default function QuietContact({
  heading = "Show us what you have.",
  lede = "You do not need a brief or the right tech words. Tell us what the business needs to do, or what stopped working.",
  intent = "general",
  showBooking = true,
}: Props) {
  const plan = PLAN_COPY[intent];
  const planHref = intent === "clients"
    ? "/clients/"
    : techAuditHref(intent, "contact_block");
  const PlanIcon = intent === "website" ? Globe2 : MessageSquare;

  return (
    <section id="contact" className="lf-contact-block" aria-label="Contact Little Fight NYC">
      <div className="lf-contact-block__inner">
        <header className="lf-contact-block__head">
          <p className="lf-contact-block__eyebrow">Talk to the person doing the work</p>
          <h2 className="lf-contact-block__title">{heading}</h2>
          <p className="lf-contact-block__dek">{lede}</p>
        </header>

        <div className="lf-contact-block__doors" role="group" aria-label="Choose how to start">
          <a
            className="lf-contact-block__door lf-contact-block__door--urgent"
            href={PHONE_HREF}
            data-lf-label="contact_block_phone"
          >
            <span className="lf-contact-block__door-icon" aria-hidden="true">
              <Phone size={23} strokeWidth={1.8} />
            </span>
            <span className="lf-contact-block__door-copy">
              <span className="lf-contact-block__door-label">Something is broken</span>
              <strong>Call about broken tech</strong>
              <span>{PHONE_DISPLAY}</span>
            </span>
            <ArrowUpRight size={20} strokeWidth={2} aria-hidden="true" />
          </a>

          <Link
            className="lf-contact-block__door lf-contact-block__door--plan"
            to={planHref}
            data-lf-event={
              intent === "clients"
                ? undefined
                : intent === "website"
                  ? "website_plan_intent"
                  : "human_review_requested"
            }
            data-lf-label="contact_block"
          >
            <span className="lf-contact-block__door-icon" aria-hidden="true">
              <PlanIcon size={23} strokeWidth={1.8} />
            </span>
            <span className="lf-contact-block__door-copy">
              <span className="lf-contact-block__door-label">{plan.label}</span>
              <strong>{plan.title}</strong>
              <span>{plan.detail}</span>
            </span>
            <ArrowUpRight size={20} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <div className="lf-contact-block__other" role="group" aria-label="More contact options">
          <a href={SMS_HREF} data-lf-label="contact_block_sms">
            <MessageSquare size={18} strokeWidth={1.8} aria-hidden="true" />
            Text {PHONE_DISPLAY}
          </a>
          <a href="mailto:hello@littlefightnyc.com">
            <Mail size={18} strokeWidth={1.8} aria-hidden="true" />
            hello@littlefightnyc.com
          </a>
          {showBooking && (
            <a
              href={BOOKING_HREF}
              target="_blank"
              rel="noopener noreferrer"
              data-lf-event="booking_started"
              data-lf-label="contact_block"
            >
              <CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" />
              Book a free 30-minute second opinion
            </a>
          )}
        </div>

        <div className="lf-contact-block__next" role="group" aria-label="What happens next">
          <p className="lf-contact-block__next-label">What happens next</p>
          <ol>
            <li>
              <span>1</span>
              <p><strong>We listen.</strong> You explain the business in your words.</p>
            </li>
            <li>
              <span>2</span>
              <p><strong>We look.</strong> We check what exists and what is getting in the way.</p>
            </li>
            <li>
              <span>3</span>
              <p><strong>You decide.</strong> You get a clear next move before any paid work.</p>
            </li>
          </ol>
        </div>

        <p className="lf-contact-block__fine">
          {intent === "website"
            ? "The first conversation is free. Qualifying website scopes explain the 14-day promise in writing before work starts. Your domain, code, and business data stay yours."
            : "The first conversation is free. You approve any paid work before it begins. Your accounts, code, and business data stay yours."}
        </p>
      </div>
    </section>
  );
}
