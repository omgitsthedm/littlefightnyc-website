declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: string, eventName: string, parameters?: Record<string, unknown>) => void;
  }
}

function track(eventName: string, parameters: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...parameters });

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, parameters);
  }
}

export function installAnalyticsHooks() {
  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target.closest("a") : null;
    if (!target) return;

    const href = target.getAttribute("href") ?? "";

    if (href.startsWith("tel:")) {
      track("phone_click", { link_url: href, link_text: target.textContent?.trim() });
    } else if (href.startsWith("mailto:")) {
      track("email_click", { link_url: href, link_text: target.textContent?.trim() });
    } else if (target.hostname && target.hostname !== window.location.hostname) {
      track("external_link_click", { link_url: target.href, link_text: target.textContent?.trim() });
    } else if (href.includes("fit-check")) {
      track("fit_check_intent", { link_url: href, link_text: target.textContent?.trim() });
    }
  };

  const onSubmit = (event: SubmitEvent) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    if (!form) return;
    track("form_submit", { form_name: form.getAttribute("name") ?? "unknown" });
  };

  window.addEventListener("click", onClick, { passive: true });
  window.addEventListener("submit", onSubmit);

  return () => {
    window.removeEventListener("click", onClick);
    window.removeEventListener("submit", onSubmit);
  };
}
