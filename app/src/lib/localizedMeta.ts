import { trackPageView } from "./analyticsClient";

type LocalizedMeta = {
  lang: "es" | "zh";
  title: string;
  description: string;
  path: "/es/" | "/zh/";
};

export function installLocalizedMeta(meta: LocalizedMeta) {
  const canonicalUrl = `https://littlefightnyc.com${meta.path}`;
  const previousLang = document.documentElement.lang;
  const previousTitle = document.title;
  const targets: Array<[Element | null, string]> = [
    [document.querySelector('meta[name="description"]'), meta.description],
    [document.querySelector('meta[property="og:title"]'), meta.title],
    [document.querySelector('meta[property="og:description"]'), meta.description],
    [document.querySelector('meta[property="og:url"]'), canonicalUrl],
    [document.querySelector('meta[name="twitter:title"]'), meta.title],
    [document.querySelector('meta[name="twitter:description"]'), meta.description],
    [document.querySelector('link[rel="canonical"]'), canonicalUrl],
  ];
  const previous = targets.map(([element]) =>
    element?.getAttribute(element.tagName === "LINK" ? "href" : "content") ?? null,
  );

  document.documentElement.lang = meta.lang;
  document.title = meta.title;
  targets.forEach(([element, value]) => {
    if (!element) return;
    element.setAttribute(element.tagName === "LINK" ? "href" : "content", value);
  });

  const sendPageView = () => trackPageView(canonicalUrl, meta.title);
  if (window.requestIdleCallback) window.requestIdleCallback(sendPageView);
  else window.setTimeout(sendPageView, 1);

  return () => {
    document.documentElement.lang = previousLang || "en";
    document.title = previousTitle;
    targets.forEach(([element], index) => {
      const value = previous[index];
      if (!element || value === null) return;
      element.setAttribute(element.tagName === "LINK" ? "href" : "content", value);
    });
  };
}
