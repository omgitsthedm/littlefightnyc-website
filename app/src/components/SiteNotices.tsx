import { useEffect, useRef, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import {
  CONSENT_OPEN_EVENT,
  getAnalyticsConsent,
  saveAnalyticsConsent,
} from "@/lib/consent";
import "./SiteNotices.css";

function ConsentNotice() {
  // Privacy-first: analytics remains denied until the visitor makes a choice.
  // Show the same compact preference panel on a first visit so the opt-in path
  // is discoverable; returning visitors keep their saved choice without noise.
  const [visible, setVisible] = useState(false);
  const [choice, setChoice] = useState(getAnalyticsConsent);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let firstVisitTimer: number | undefined;
    if (getAnalyticsConsent() === null) {
      firstVisitTimer = window.setTimeout(() => setVisible(true), 900);
    }

    const open = () => {
      setChoice(getAnalyticsConsent());
      setVisible(true);
      window.setTimeout(() => panelRef.current?.focus(), 0);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => {
      if (firstVisitTimer !== undefined) window.clearTimeout(firstVisitTimer);
      window.removeEventListener(CONSENT_OPEN_EVENT, open);
    };
  }, []);

  if (!visible) return null;

  const save = (next: "granted" | "denied") => {
    saveAnalyticsConsent(next);
    setChoice(next);
    setVisible(false);
  };

  return (
    <div
      className="lf-notice lf-consent"
      role="region"
      aria-label="Analytics preferences"
      ref={panelRef}
      tabIndex={-1}
    >
      <span className="lf-notice__icon" aria-hidden="true">
        <ShieldCheck size={20} strokeWidth={1.8} />
      </span>
      <div className="lf-notice__copy">
        <h2>Analytics?</h2>
        <p>
          Optional measurement helps us improve the site. It stays off unless
          you allow it. <a href="/privacy/">Details</a>
        </p>
        {choice && (
          <p className="lf-consent__current">
            <Check size={14} aria-hidden="true" /> Current setting: {choice === "granted" ? "analytics on" : "essential only"}
          </p>
        )}
      </div>
      <div className="lf-notice__actions">
        <button type="button" className="lf-notice__primary" onClick={() => save("granted")}>
          Allow analytics
        </button>
        <button type="button" className="lf-notice__secondary" onClick={() => save("denied")}>
          Essential only
        </button>
      </div>
    </div>
  );
}

export default function SiteNotices() {
  return (
    <div className="lf-notices">
      <ConsentNotice />
    </div>
  );
}
