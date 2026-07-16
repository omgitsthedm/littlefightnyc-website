import { Link } from "react-router-dom";
import { Phone, MessageSquare, Mail, ClipboardCheck, ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import { trackEvent } from "@/lib/analytics";
import "./QuietContact.css";

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    label: "Call",
    detail: "(646) 360-0318",
    href: "tel:+16463600318",
    note: "When something is broken",
  },
  {
    icon: MessageSquare,
    label: "Text",
    detail: "(646) 360-0318",
    action: "text",
    note: "When you're at the counter",
  },
  {
    icon: Mail,
    label: "Email",
    detail: "hello@littlefightnyc.com",
    href: "mailto:hello@littlefightnyc.com",
    note: "For the longer version",
  },
  {
    icon: ClipboardCheck,
    label: "Form",
    detail: "Tech Audit",
    to: "/tech-audit/",
    note: "When the problem has parts",
    primary: true,
  },
] as const;

const SMS_URL = `${String.fromCharCode(115, 109, 115, 58)}+16463600318`;

function openTextMessage() {
  trackEvent("sms_click", { placement: "contact_block", link_url: SMS_URL });
  window.location.href = SMS_URL;
}

type Props = {
  /** Per-page closing line — e.g. "Want a build like this?" on a case page. */
  heading?: string;
  /** Per-page support line under the heading. */
  lede?: string;
};

export default function QuietContact({
  heading = "Start with the right next step.",
  lede = "Call, text, email, or send the details. We read every one and come back with a clear next step — what to fix now, what can wait.",
}: Props) {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section id="contact" ref={ref} className="lf-contact-block" aria-label="Contact Little Fight NYC">
      <div className="lf-contact-block__inner">
        <div className="lf-contact-block__head">
          <p className="lf-contact-block__eyebrow">Call. Text. Email. Form.</p>
          <h2 className="lf-contact-block__title">{heading}</h2>
          <p className="lf-contact-block__dek">{lede}</p>
        </div>

        <ul className="lf-contact-block__channels" aria-label="Contact options">
          {CONTACT_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const isPrimary = "primary" in channel && channel.primary;
            const inner = (
              <>
                <span className="lf-contact-block__channel-top">
                  <span className="lf-contact-block__channel-icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <span className="lf-contact-block__channel-label">{channel.label}</span>
                  <ArrowUpRight
                    className="lf-contact-block__channel-go"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
                <span className="lf-contact-block__channel-detail">{channel.detail}</span>
                <span className="lf-contact-block__channel-note">{channel.note}</span>
              </>
            );
            const cls = `lf-contact-block__channel${isPrimary ? " lf-contact-block__channel--primary" : ""}`;
            return (
              <li key={channel.label}>
                {"to" in channel ? (
                  <Link className={cls} to={channel.to}>{inner}</Link>
                ) : "action" in channel ? (
                  <button className={cls} type="button" onClick={openTextMessage}>{inner}</button>
                ) : (
                  <a className={cls} href={channel.href}>{inner}</a>
                )}
              </li>
            );
          })}
        </ul>

        <ul className="lf-contact-block__promises" aria-label="What you can expect">
          <li><span>Free consult</span><em>Always</em></li>
          <li><span>14-day websites</span><em>Or you don't pay</em></li>
          <li><span>24-hour on-sites</span><em>When something breaks</em></li>
          <li><span>2-hour callbacks</span><em>9am-9pm Eastern</em></li>
        </ul>

        <p className="lf-contact-block__fine">
          No pitch, no spam. Whatever you send goes straight to David, the person doing the work — never to a list.
        </p>
      </div>
    </section>
  );
}
