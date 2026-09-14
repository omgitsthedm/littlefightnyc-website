import { useEffect, useRef, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  CONSENT_OPEN_EVENT,
  CONSENT_VISIBILITY_EVENT,
  getAdvertisingConsent,
  getMetaConsent,
  saveMetaConsent,
  getAnalyticsConsent,
  saveAdvertisingConsent,
  saveAnalyticsConsent,
  getGoogleAdsConsent,
  saveGoogleAdsConsent,
} from "@/lib/consent";
import "./SiteNotices.css";

type NoticeCopy = {
  ariaLabel: string;
  title: string;
  body: string;
  details: string;
  current: (analyticsOn: boolean, metaOn: boolean, googleAdsOn: boolean) => string;
  allowAnalytics: string;
  allowMeta: string;
  allowGoogleAds: string;
  essentialOnly: string;
};

const NOTICE_COPY: Record<"en" | "es" | "zh", NoticeCopy> = {
  en: {
    ariaLabel: "Privacy preferences",
    title: "Privacy choices",
    body: "Choose optional Google visit counting. You can also allow Google Ads to connect ad clicks with inquiries, or Meta to measure Facebook and Instagram referrals. Google ad personalization stays off; Meta may use activity for personalized content and ads.",
    details: "Details",
    current: (analyticsOn, metaOn, googleAdsOn) =>
      `Current choice: visit counting ${analyticsOn ? "on" : "off"}; Meta ${metaOn ? "on" : "off"}; Google Ads ${googleAdsOn ? "on" : "off"}`,
    allowAnalytics: "Allow visit counting",
    allowMeta: "Allow visits + Meta",
    allowGoogleAds: "Allow visits + Google Ads",
    essentialOnly: "Essential only",
  },
  es: {
    ariaLabel: "Preferencias de privacidad",
    title: "Opciones de privacidad",
    body: "Puedes permitir el conteo de visitas de Google. También puedes permitir que Google Ads relacione clics en anuncios con consultas, o que Meta mida las referencias de Facebook e Instagram. La personalización de anuncios de Google sigue desactivada; Meta puede usar la actividad para personalizar contenido y anuncios.",
    details: "Detalles (en inglés)",
    current: (analyticsOn, metaOn, googleAdsOn) =>
      `Opción actual: conteo de visitas ${analyticsOn ? "activado" : "desactivado"}; Meta ${metaOn ? "activado" : "desactivado"}; Google Ads ${googleAdsOn ? "activado" : "desactivado"}`,
    allowAnalytics: "Permitir conteo",
    allowMeta: "Permitir conteo + Meta",
    allowGoogleAds: "Permitir conteo + Google Ads",
    essentialOnly: "Solo lo esencial",
  },
  zh: {
    ariaLabel: "隐私设置",
    title: "隐私选项",
    body: "您可以允许 Google 访问统计，也可以允许 Google Ads 将广告点击与咨询关联，或允许 Meta 衡量 Facebook 和 Instagram 带来的访问。Google 广告个性化保持关闭；Meta 可能将活动用于个性化内容和广告。",
    details: "详细说明（英文）",
    current: (analyticsOn, metaOn, googleAdsOn) =>
      `当前选择：访问统计${analyticsOn ? "已开启" : "已关闭"}；Meta ${metaOn ? "已开启" : "已关闭"}；Google Ads ${googleAdsOn ? "已开启" : "已关闭"}`,
    allowAnalytics: "允许访问统计",
    allowMeta: "允许统计和 Meta",
    allowGoogleAds: "允许统计和 Google Ads",
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
    meta: getMetaConsent(),
    googleAds: getGoogleAdsConsent(),
  };
}

function ConsentNotice() {
  const { pathname } = useLocation();
  const copy = NOTICE_COPY[noticeLocale(pathname)];
  // Privacy-first: analytics and advertising remain denied until the visitor
  // makes a choice. First-visit choices live after the page, in normal flow:
  // they never cover the work or interrupt an inquiry. Footer/legal controls
  // bring this same panel into view when the visitor asks to change a choice.
  const [visible, setVisible] = useState(() => getAnalyticsConsent() === null || getMetaConsent() === null || getGoogleAdsConsent() === null);
  const [choices, setChoices] = useState(getConsentChoices);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const open = (event: Event) => {
      const trigger = (event as CustomEvent<{ trigger?: unknown }>).detail?.trigger;
      returnFocusRef.current = trigger instanceof HTMLElement ? trigger
        : document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setChoices(getConsentChoices());
      setVisible(true);
      window.setTimeout(() => {
        panelRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
        panelRef.current?.focus({ preventScroll: true });
      }, 0);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, open);
    };
  }, []);

  useEffect(() => {
    const announceVisibility = (inView: boolean) => {
      if (inView) document.documentElement.dataset.lfConsentNotice = "open";
      else delete document.documentElement.dataset.lfConsentNotice;
      window.dispatchEvent(
        new CustomEvent(CONSENT_VISIBILITY_EVENT, {
          detail: { visible: inView },
        }),
      );
    };
    const observer = new IntersectionObserver(([entry]) => {
      announceVisibility(entry.isIntersecting);
    });
    if (visible && panelRef.current) observer.observe(panelRef.current);
    else announceVisibility(false);
    return () => {
      observer.disconnect();
      announceVisibility(false);
    };
  }, [visible]);

  if (!visible) return null;

  const finish = () => {
    setChoices(getConsentChoices());
    setVisible(false);
    const returnTarget = returnFocusRef.current?.isConnected
      ? returnFocusRef.current
      : document.querySelector<HTMLElement>(".lf-quiet-foot__privacy-button");
    returnTarget?.focus();
  };

  const allowAnalyticsOnly = () => {
    // Revoke advertising first so this action can never briefly start an ad
    // pixel when a visitor changes a previous broader choice.
    saveGoogleAdsConsent("denied");
    saveAdvertisingConsent("denied");
    saveMetaConsent("denied");
    if (choices.analytics !== "granted") saveAnalyticsConsent("granted");
    finish();
  };

  const allowVisitsAndMeta = () => {
    if (choices.googleAds !== "granted") saveGoogleAdsConsent("denied");
    saveAdvertisingConsent("denied");
    saveAnalyticsConsent("granted");
    saveMetaConsent("granted");
    finish();
  };

  const allowVisitsAndGoogleAds = () => {
    saveAdvertisingConsent("denied");
    if (choices.meta !== "granted") saveMetaConsent("denied");
    saveGoogleAdsConsent("granted");
    if (choices.analytics !== "granted") saveAnalyticsConsent("granted");
    finish();
  };

  const allowEssentialOnly = () => {
    saveGoogleAdsConsent("denied");
    saveAdvertisingConsent("denied");
    saveMetaConsent("denied");
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
            {copy.current(choices.analytics === "granted", choices.meta === "granted", choices.googleAds === "granted")}
          </p>
        )}
      </div>
      <div className="lf-notice__actions">
        <button
          type="button"
          className="lf-notice__secondary"
          onClick={allowAnalyticsOnly}
        >
          {copy.allowAnalytics}
        </button>
        <button type="button" className="lf-notice__secondary" onClick={allowVisitsAndMeta}>
          {copy.allowMeta}
        </button>
        <button type="button" className="lf-notice__secondary" onClick={allowVisitsAndGoogleAds}>
          {copy.allowGoogleAds}
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
