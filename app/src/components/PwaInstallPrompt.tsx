import { useEffect, useState } from "react";
import { X, Share2, PlusSquare } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import "./PwaInstallPrompt.css";

export default function PwaInstallPrompt() {
  const { state, dismiss } = usePwaInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.type !== "ios" && state.type !== "chrome") return;
    const timer = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, [state.type]);

  // Only ios/chrome states are actionable; unsupported/installed render nothing.
  if (!visible || state.type === "unsupported" || state.type === "installed") {
    return null;
  }

  const isIOS = state.type === "ios";

  return (
    <div className="lf-install-prompt" role="dialog" aria-label="Install this app">
      <div className="lf-install-prompt__content">
        <button
          type="button"
          className="lf-install-prompt__close"
          onClick={() => {
            setVisible(false);
            dismiss();
          }}
          aria-label="Dismiss install prompt"
        >
          <X size={18} />
        </button>

        <p className="lf-install-prompt__title">
          {isIOS ? "Add Little Fight to your Home Screen" : "Install Little Fight NYC"}
        </p>
        <p className="lf-install-prompt__body">
          {isIOS
            ? "Tap the Share button, then scroll down and tap Add to Home Screen for one-tap access."
            : "Install for faster access and an app-like experience."}
        </p>

        {isIOS && (
          <ol className="lf-install-prompt__steps">
            <li>
              <Share2 size={16} aria-hidden="true" />
              <span>Tap the Share button in Safari</span>
            </li>
            <li>
              <PlusSquare size={16} aria-hidden="true" />
              <span>Tap Add to Home Screen</span>
            </li>
          </ol>
        )}

        {!isIOS && (
          <button
            type="button"
            className="lf-install-prompt__cta"
            onClick={() => {
              if (state.type === "chrome") {
                state.prompt();
                setVisible(false);
              }
            }}
          >
            Install app
          </button>
        )}
      </div>
    </div>
  );
}
