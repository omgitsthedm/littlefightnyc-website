import { Link } from "react-router-dom";
import { ArrowUpRight, Globe2, Mail, MessageSquare, Phone } from "lucide-react";
import { trackEvent } from "@/lib/analyticsClient";
import "./QuietContact.css";

const SMS_URL = `${String.fromCharCode(115, 109, 115, 58)}+16463600318`;

function openTextMessage() {
  trackEvent("sms_click", { placement: "contact_block", link_url: SMS_URL });
  window.location.href = SMS_URL;
}

type Props = {
  heading?: string;
  lede?: string;
};

export default function QuietContact({
  heading = "Show us what you have.",
  lede = "You do not need a brief or the right tech words. Tell us what the business needs to do, or what stopped working.",
}: Props) {
  return (
    <section id="contact" className="lf-contact-block" aria-label="Contact Little Fight NYC">
      <div className="lf-contact-block__inner">
        <header className="lf-contact-block__head">
          <p className="lf-contact-block__eyebrow">Talk to the person doing the work</p>
          <h2 className="lf-contact-block__title">{heading}</h2>
          <p className="lf-contact-block__dek">{lede}</p>
        </header>

        <div className="lf-contact-block__doors" aria-label="Choose how to start">
          <a className="lf-contact-block__door lf-contact-block__door--urgent" href="tel:+16463600318">
            <span className="lf-contact-block__door-icon" aria-hidden="true">
              <Phone size={23} strokeWidth={1.8} />
            </span>
            <span className="lf-contact-block__door-copy">
              <span className="lf-contact-block__door-label">Something is broken</span>
              <strong>Call about broken tech</strong>
              <span>(646) 360-0318</span>
            </span>
            <ArrowUpRight size={20} strokeWidth={2} aria-hidden="true" />
          </a>

          <Link
            className="lf-contact-block__door lf-contact-block__door--plan"
            to="/tech-audit/?intent=website&source=contact_block"
            data-lf-event="website_plan_intent"
            data-lf-label="contact_block"
          >
            <span className="lf-contact-block__door-icon" aria-hidden="true">
              <Globe2 size={23} strokeWidth={1.8} />
            </span>
            <span className="lf-contact-block__door-copy">
              <span className="lf-contact-block__door-label">I want a better setup</span>
              <strong>Get my website plan</strong>
              <span>The first look and recommendation are free.</span>
            </span>
            <ArrowUpRight size={20} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <div className="lf-contact-block__other" aria-label="More contact options">
          <button type="button" onClick={openTextMessage}>
            <MessageSquare size={18} strokeWidth={1.8} aria-hidden="true" />
            Text (646) 360-0318
          </button>
          <a href="mailto:hello@littlefightnyc.com">
            <Mail size={18} strokeWidth={1.8} aria-hidden="true" />
            hello@littlefightnyc.com
          </a>
        </div>

        <div className="lf-contact-block__next" aria-label="What happens next">
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
          Consulting is free. Website work carries our 14-day promise. Your
          domain, code, and business data stay yours.
        </p>
      </div>
    </section>
  );
}
