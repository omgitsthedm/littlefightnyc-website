import { ExternalLink, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BOOKING_HREF,
  GOOGLE_REVIEW_HREF,
  HELLO_EMAIL,
} from "@/data/contact";
import "./ClientContinuity.css";

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
          <li>
            <a href={`mailto:${HELLO_EMAIL}?subject=Current%20client%20request`}>
              <Mail size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>
                <strong>Support, project, or billing question</strong>
                <small>{HELLO_EMAIL}</small>
              </span>
            </a>
          </li>
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
