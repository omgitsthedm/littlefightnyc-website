import { Phone } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import "./FounderCard.css";

/**
 * FounderCard — the "how we work" block (About page only). Leads with the
 * operating standard and the company's ambition, with David attributed as
 * founder rather than positioned as a one-person help line. A branded
 * monogram panel (display Inter over an orange-to-blue ambient wash) sits
 * beside the copy and the real phone number. When a real founder photo
 * exists, pass `photoSrc` and it drops into the same slot.
 */
export default function FounderCard({ photoSrc }: { photoSrc?: string }) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  return (
    <aside ref={ref} className="lf-founder" aria-label="How Little Fight NYC works">
      <div className="lf-founder__panel" aria-hidden={photoSrc ? undefined : true}>
        {photoSrc ? (
          <img
            className="lf-founder__photo"
            src={photoSrc}
            alt="David Marsh, founder of Little Fight NYC"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <>
            <span className="lf-founder__monogram">DM</span>
            <span className="lf-founder__panel-label">Little Fight NYC</span>
          </>
        )}
      </div>

      <div className="lf-founder__body">
        <p className="lf-founder__eyebrow">How we work</p>
        <p className="lf-founder__name">
          David Marsh
          <span className="lf-founder__role"> · Founder</span>
        </p>
        <p className="lf-founder__line">
          Little Fight runs on a real standard: one accountable owner on every
          project, a two-hour callback window, and on-site help within a day
          when it's urgent. We're building the tech service company New York's
          small businesses deserve — the one the chains never sent.
        </p>
        <p className="lf-founder__meta">
          <a className="lf-founder__tel" href="tel:+16463600318">
            <Phone size={15} strokeWidth={2} aria-hidden="true" />
            (646) 360-0318
          </a>
          <span className="lf-founder__since">Since 2012</span>
        </p>
      </div>
    </aside>
  );
}
