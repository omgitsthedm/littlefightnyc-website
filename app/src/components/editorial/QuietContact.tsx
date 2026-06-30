import { Link } from "react-router-dom";
import { useScrollReveal } from "./useScrollReveal";
import "./QuietContact.css";

const CONTACT_CHANNELS = [
  {
    label: "Call",
    detail: "(646) 360-0318",
    href: "tel:+16463600318",
    note: "When something is broken",
  },
  {
    label: "Text",
    detail: "(646) 360-0318",
    action: "text",
    note: "When you are at the counter",
  },
  {
    label: "Email",
    detail: "hello@littlefightnyc.com",
    href: "mailto:hello@littlefightnyc.com",
    note: "For the longer version",
  },
  {
    label: "Form",
    detail: "Fit Check",
    to: "/fit-check/",
    note: "When the problem has parts",
  },
] as const;

const SMS_URL = `${String.fromCharCode(115, 109, 115, 58)}+16463600318`;

function openTextMessage() {
  window.location.href = SMS_URL;
}

export default function QuietContact() {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section id="contact" ref={ref} className="lf-contact-block" aria-label="Contact Little Fight NYC">
      <div className="lf-contact-block__inner">
        <div className="lf-contact-block__head">
          <p className="lf-contact-block__eyebrow">Call. Text. Email. Form.</p>
          <h2 className="lf-contact-block__title">Tell us what's broken.</h2>
          <p className="lf-contact-block__dek">
            9am-9pm Eastern: a human answers. After hours: AI takes the
            message and David calls back.
          </p>
        </div>

        <ul className="lf-contact-block__channels" aria-label="Contact options">
          {CONTACT_CHANNELS.map((channel) => (
            <li key={channel.label}>
              {"to" in channel ? (
                <Link className="lf-contact-block__channel" to={channel.to}>
                  <span className="lf-contact-block__channel-label">{channel.label}</span>
                  <span className="lf-contact-block__channel-detail">{channel.detail}</span>
                  <span className="lf-contact-block__channel-note">{channel.note}</span>
                </Link>
              ) : "action" in channel ? (
                <button className="lf-contact-block__channel" type="button" onClick={openTextMessage}>
                  <span className="lf-contact-block__channel-label">{channel.label}</span>
                  <span className="lf-contact-block__channel-detail">{channel.detail}</span>
                  <span className="lf-contact-block__channel-note">{channel.note}</span>
                </button>
              ) : (
                <a className="lf-contact-block__channel" href={channel.href}>
                  <span className="lf-contact-block__channel-label">{channel.label}</span>
                  <span className="lf-contact-block__channel-detail">{channel.detail}</span>
                  <span className="lf-contact-block__channel-note">{channel.note}</span>
                </a>
              )}
            </li>
          ))}
        </ul>

        <ul className="lf-contact-block__promises" aria-label="What you can expect">
          <li><span>Free consult</span><em>Always</em></li>
          <li><span>14-day websites</span><em>Or you don't pay</em></li>
          <li><span>24-hour on-sites</span><em>When something breaks</em></li>
          <li><span>2-hour callbacks</span><em>9am-9pm Eastern</em></li>
        </ul>
      </div>
    </section>
  );
}
