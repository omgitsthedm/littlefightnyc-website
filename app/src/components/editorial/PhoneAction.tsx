import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import "./PhoneAction.css";

const TEL = "+16463600318";
const PRETTY = "(646) 360-0318";
const SMS_URL = `${String.fromCharCode(115, 109, 115, 58)}${TEL}`;

type Props = {
  className?: string;
  children?: ReactNode;
  ariaLabel?: string;
  align?: "left" | "right" | "center";
  direction?: "down" | "up";
};

export default function PhoneAction({
  className = "",
  children,
  ariaLabel,
  align = "left",
  direction = "down",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const openText = () => {
    setOpen(false);
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

export { TEL as LF_PHONE_TEL, PRETTY as LF_PHONE_PRETTY };
