import { useEffect, useRef, useState } from "react";
import { Check, RefreshCw, ShieldCheck, X } from "lucide-react";
import {
  CONSENT_OPEN_EVENT,
  getAnalyticsConsent,
  saveAnalyticsConsent,
} from "@/lib/consent";
import "./SiteNotices.css";

const SW_UPDATE_EVENT = "lf:sw-update-ready";

function ConsentNotice() {
  const [visible, setVisible] = useState(() => getAnalyticsConsent() === null);
  const [choice, setChoice] = useState(getAnalyticsConsent);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const open = () => {
      setChoice(getAnalyticsConsent());
      setVisible(true);
      window.setTimeout(() => panelRef.current?.focus(), 0);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
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
        <p className="lf-notice__eyebrow">Your privacy</p>
        <h2>Useful measurement. Your call.</h2>
        <p>
          Analytics helps us find broken pages and improve contact paths. We do
          not load Google Analytics, Clarity, or TikTok unless you say yes.
          Essential site features work either way. <a href="/privacy/">Details</a>
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

function ServiceWorkerUpdateNotice() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const ready = (event: Event) => {
      const detail = (event as CustomEvent<{ registration?: ServiceWorkerRegistration }>).detail;
      if (detail?.registration?.waiting) setRegistration(detail.registration);
    };
    window.addEventListener(SW_UPDATE_EVENT, ready);
    return () => window.removeEventListener(SW_UPDATE_EVENT, ready);
  }, []);

  if (!registration) return null;

  const activateUpdate = () => {
    const waiting = registration.waiting;
    if (!waiting || refreshing) return;
    setRefreshing(true);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true },
    );
    waiting.postMessage({ type: "ACTIVATE_UPDATE" });
    // skipWaiting normally triggers controllerchange. Keep an explicit-click
    // fallback for engines that activate the worker without emitting it.
    window.setTimeout(() => window.location.reload(), 1800);
  };

  return (
    <div className="lf-notice lf-update" role="region" aria-label="Site update" aria-live="polite">
      <span className="lf-notice__icon" aria-hidden="true">
        <RefreshCw size={19} strokeWidth={1.8} />
      </span>
      <div className="lf-notice__copy">
        <p className="lf-notice__eyebrow">Site update ready</p>
        <p>Your page stays put until you choose to refresh.</p>
      </div>
      <div className="lf-notice__actions lf-update__actions">
        <button
          type="button"
          className="lf-notice__primary"
          onClick={activateUpdate}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing…" : "Refresh now"}
        </button>
        <button
          type="button"
          className="lf-notice__dismiss"
          aria-label="Dismiss update notice"
          onClick={() => setRegistration(null)}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function SiteNotices() {
  return (
    <div className="lf-notices" aria-label="Site notices">
      <ServiceWorkerUpdateNotice />
      <ConsentNotice />
    </div>
  );
}
