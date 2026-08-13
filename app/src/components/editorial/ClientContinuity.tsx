import { ExternalLink, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BILLING_EMAIL,
  BOOKING_HREF,
  GOOGLE_REVIEW_HREF,
  PROJECTS_EMAIL,
  SUPPORT_EMAIL,
} from "@/data/contact";
import "./ClientContinuity.css";

const CLIENT_DOORS = [
  {
    label: "Something needs attention",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}?subject=Client%20support%20request`,
  },
  {
    label: "A project is underway",
    value: PROJECTS_EMAIL,
    href: `mailto:${PROJECTS_EMAIL}?subject=Project%20update`,
  },
  {
    label: "A billing question",
    value: BILLING_EMAIL,
    href: `mailto:${BILLING_EMAIL}?subject=Billing%20question`,
  },
] as const;

export default function ClientContinuity() {
  return (
    <section className="lf-continuity" aria-labelledby="lf-continuity-title">
      <div className="lf-continuity__lead">
        <p className="lf-continuity__eyebrow">After launch</p>
        <h2 id="lf-continuity-title">The handoff should not become a disappearance.</h2>
        <p>
          A useful site changes with the business. We can keep the customer path
          current, test forms and booking routes, and write down what changed.
          You still own the code, domain, content, and data.
        </p>
        <div className="lf-continuity__lead-actions">
          <Link to="/services/ongoing-care/">See ongoing care</Link>
          <a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" data-lf-event="booking_started" data-lf-label="home_care">
            Book a check-in
            <ExternalLink size={15} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </div>
      </div>

      <aside className="lf-continuity__client" aria-label="Current client routes">
        <div className="lf-continuity__client-head">
          <p>Already working with Little Fight?</p>
          <Link to="/clients/">Current client desk</Link>
        </div>
        <ul>
          {CLIENT_DOORS.map((door) => (
            <li key={door.value}>
              <a href={door.href}>
                <Mail size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>
                  <strong>{door.label}</strong>
                  <small>{door.value}</small>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="lf-continuity__review">
          Completed real work with us?{" "}
          <a href={GOOGLE_REVIEW_HREF} target="_blank" rel="noreferrer">
            Leave an honest Google review
            <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
          </a>
          . No incentives and no rating gate.
        </p>
      </aside>
    </section>
  );
}
