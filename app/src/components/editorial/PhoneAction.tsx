import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { PHONE_DISPLAY, PHONE_E164, SMS_HREF } from "@/data/contact";
import { trackEvent } from "@/lib/analyticsClient";
import "./PhoneAction.css";

const TEL = PHONE_E164;
const PRETTY = PHONE_DISPLAY;
const SMS_URL = SMS_HREF;

type Props = {
  className?: string;
  children?: ReactNode;
  ariaLabel?: string;
  align?: "left" | "right" | "center";
  direction?: "down" | "up";
  analyticsLabel?: string;
};

export default function PhoneAction({
  className = "",
  children,
  ariaLabel,
  align = "left",
  direction = "down",
  analyticsLabel = "phone_action",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const openText = () => {
    setOpen(false);
    trackEvent("sms_click", { placement: analyticsLabel, link_url: SMS_URL });
    window.location.href = SMS_URL;
  };

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={wrapRef} className="lf-phone-action">
      <button
        ref={triggerRef}
        type="button"
        className={className}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
      >
        {children ?? PRETTY}
      </button>

      {open && (
        <span
          id={panelId}
          className={`lf-phone-action__menu lf-phone-action__menu--${align} lf-phone-action__menu--${direction}`}
        >
          <a
            className="lf-phone-action__item"
            href={`tel:${TEL}`}
            data-lf-label={analyticsLabel}
            onClick={() => setOpen(false)}
          >
            <span className="lf-phone-action__verb">Call</span>
            <span className="lf-phone-action__number">{PRETTY}</span>
          </a>
          <button
            type="button"
            className="lf-phone-action__item"
            onClick={openText}
          >
            <span className="lf-phone-action__verb">Text</span>
            <span className="lf-phone-action__number">{PRETTY}</span>
          </button>
        </span>
      )}
    </span>
  );
}
