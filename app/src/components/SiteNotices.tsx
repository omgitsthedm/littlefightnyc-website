import { useEffect, useRef, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  CONSENT_OPEN_EVENT,
  CONSENT_VISIBILITY_EVENT,
  getAdvertisingConsent,
  getAnalyticsConsent,
  saveAdvertisingConsent,
  saveAnalyticsConsent,
} from "@/lib/consent";
import "./SiteNotices.css";

type NoticeCopy = {
  ariaLabel: string;
  title: string;
  body: string;
  details: string;
  current: (analyticsOn: boolean) => string;
  allowAnalytics: string;
  essentialOnly: string;
};

const NOTICE_COPY: Record<"en" | "es" | "zh", NoticeCopy> = {
  en: {
    ariaLabel: "Privacy preferences",
    title: "Privacy choices",
    body: "Anonymous visit counts help us improve this website. Advertising tracking is off.",
    details: "Details",
    current: (analyticsOn) =>
      `Current choice: anonymous visit counting ${analyticsOn ? "on" : "off"}; advertising off`,
    allowAnalytics: "Allow visit counting",
    essentialOnly: "Essential only",
  },
  es: {
    ariaLabel: "Preferencias de privacidad",
    title: "Opciones de privacidad",
    body: "El conteo anónimo de visitas nos ayuda a mejorar este sitio. El seguimiento publicitario está desactivado.",
    details: "Detalles (en inglés)",
    current: (analyticsOn) =>
      `Opción actual: conteo anónimo ${analyticsOn ? "activado" : "desactivado"}; publicidad desactivada`,
    allowAnalytics: "Permitir conteo",
    essentialOnly: "Solo lo esencial",
  },
  zh: {
    ariaLabel: "隐私设置",
    title: "隐私选项",
    body: "匿名访问统计帮助我们改进这个网站。广告跟踪已关闭。",
    details: "详细说明（英文）",
    current: (analyticsOn) =>
      `当前选择：匿名访问统计${analyticsOn ? "已开启" : "已关闭"}；广告已关闭`,
    allowAnalytics: "允许访问统计",
    essentialOnly: "仅必要功能",
  },
};

function noticeLocale(pathname: string) {
  if (pathname === "/es" || pathname.startsWith("/es/")) return "es";
  if (pathname === "/zh" || pathname.startsWith("/zh/")) return "zh";
  return "en";
}

function getConsentChoices() {
  return {
    analytics: getAnalyticsConsent(),
    advertising: getAdvertisingConsent(),
  };
}

function ConsentNotice() {
  const { pathname } = useLocation();
  const copy = NOTICE_COPY[noticeLocale(pathname)];
  // Privacy-first: analytics and advertising remain denied until the visitor
  // makes a choice. Show the compact panel on a first visit so the opt-in path
  // is discoverable; returning visitors keep their saved choice without noise.
  const [visible, setVisible] = useState(false);
  const [choices, setChoices] = useState(getConsentChoices);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let firstVisitTimer: number | undefined;
    if (getAnalyticsConsent() === null) {
      firstVisitTimer = window.setTimeout(() => setVisible(true), 900);
    }

    const open = () => {
      setChoices(getConsentChoices());
      setVisible(true);
      window.setTimeout(() => panelRef.current?.focus(), 0);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => {
      if (firstVisitTimer !== undefined) window.clearTimeout(firstVisitTimer);
      window.removeEventListener(CONSENT_OPEN_EVENT, open);
    };
  }, []);

  useEffect(() => {
    if (visible) {
      document.documentElement.dataset.lfConsentNotice = "open";
    } else {
      delete document.documentElement.dataset.lfConsentNotice;
    }
    window.dispatchEvent(
      new CustomEvent(CONSENT_VISIBILITY_EVENT, { detail: { visible } }),
    );
  }, [visible]);

  useEffect(
    () => () => {
      delete document.documentElement.dataset.lfConsentNotice;
      window.dispatchEvent(
        new CustomEvent(CONSENT_VISIBILITY_EVENT, {
          detail: { visible: false },
        }),
      );
    },
    [],
  );

  if (!visible) return null;

  const finish = () => {
    setChoices(getConsentChoices());
    setVisible(false);
  };

  const allowAnalyticsOnly = () => {
    // Revoke advertising first so this action can never briefly start an ad
    // pixel when a visitor changes a previous broader choice.
    saveAdvertisingConsent("denied");
    if (choices.analytics !== "granted") saveAnalyticsConsent("granted");
    finish();
  };

  const allowEssentialOnly = () => {
    saveAdvertisingConsent("denied");
    if (choices.analytics !== "denied") saveAnalyticsConsent("denied");
    finish();
  };

  return (
    <div
      className="lf-notice lf-consent"
      role="region"
      aria-label={copy.ariaLabel}
      ref={panelRef}
      tabIndex={-1}
    >
      <span className="lf-notice__icon" aria-hidden="true">
        <ShieldCheck size={20} strokeWidth={1.8} />
      </span>
      <div className="lf-notice__copy">
        <h2>{copy.title}</h2>
        <p>
          {copy.body} <a href="/privacy/">{copy.details}</a>
        </p>
        {choices.analytics && (
          <p className="lf-consent__current">
            <Check size={14} aria-hidden="true" />
            {copy.current(choices.analytics === "granted")}
          </p>
        )}
      </div>
      <div className="lf-notice__actions">
        <button
          type="button"
          className="lf-notice__primary"
          onClick={allowAnalyticsOnly}
        >
          {copy.allowAnalytics}
        </button>
        <button
          type="button"
          className="lf-notice__secondary"
          onClick={allowEssentialOnly}
        >
          {copy.essentialOnly}
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
