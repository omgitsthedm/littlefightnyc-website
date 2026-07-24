import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import routeMeta from "@/data/route-meta.json";
import { trackPageView } from "@/lib/analyticsClient";

/**
 * Updates the tab title + meta on client-side navigation. The correct tags are
 * already prerendered into every route's static HTML on first load, so this
 * only needs a slim {path,title,description,image} lookup — generated at build
 * by scripts/build-route-meta.mjs (see that file for why we don't ship the full
 * seo-pages.json to the client).
 */
type MetaPage = {
  path: string;
  title: string;
  description: string;
  h1?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  locale?: string;
  published?: string;
  updated?: string;
};

const site = routeMeta.site;
const pages = routeMeta.pages as MetaPage[];
const notFoundPage = routeMeta.notFound as MetaPage;
const siteUrl = site.url.replace(/\/$/, "");

function routePath(pathname: string) {
  if (pathname === "/") return "/";
  return `${pathname.replace(/\/$/, "")}/`;
}

function absoluteUrl(path: string) {
  return `${siteUrl}${path === "/" ? "/" : path}`;
}

function setMeta(name: string, content: string, property = false) {
  const attribute = property ? "property" : "name";
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

function removeMeta(name: string, property = false) {
  const attribute = property ? "property" : "name";
  document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)?.remove();
}

function setLink(rel: string, href: string) {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }

  link.href = href;
}

function removeLink(rel: string) {
  document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)?.remove();
}

function isoDate(value: string | undefined) {
  if (!value?.trim()) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function setAlternate(hreflang: string, href: string) {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hreflang}"]`);

  if (!link) {
    link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = hreflang;
    document.head.appendChild(link);
  }

  link.href = href;
}

function removeAlternate(hreflang: string) {
  document.head
    .querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hreflang}"]`)
    ?.remove();
}

export default function RouteMeta() {
  const location = useLocation();

  useEffect(() => {
    const path = routePath(location.pathname);
    const page = pages.find((item) => item.path === path) ?? notFoundPage;
    const canonical = absoluteUrl(page.path);
    const image = page.image?.startsWith("http") ? page.image : absoluteUrl(page.image ?? "/assets/og-tugboat.jpg");
    const isArticle = page.type === "Article";
    const published = isoDate(page.published);
    const modified = isoDate(page.updated) || published;
    const locale = page.locale === "zh" ? "zh_CN" : page.locale === "es" ? "es_US" : "en_US";

    document.documentElement.lang = page.locale === "zh" ? "zh" : page.locale === "es" ? "es" : "en";
    document.title = page.title;
    setMeta("description", page.description);
    if (isArticle) {
      setMeta("author", "Little Fight NYC");
      setMeta("article:author", "Little Fight NYC", true);
      setLink("author", `${siteUrl}/`);
    } else {
      removeMeta("author");
      removeMeta("article:author", true);
      removeLink("author");
    }
    if (isArticle && published) {
      setMeta("article:published_time", published, true);
      setMeta("datePublished", published);
    } else {
      removeMeta("article:published_time", true);
      removeMeta("datePublished");
    }
    if (isArticle && modified) {
      setMeta("article:modified_time", modified, true);
      setMeta("dateModified", modified);
    } else {
      removeMeta("article:modified_time", true);
      removeMeta("dateModified");
    }
    setMeta("robots", page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    setMeta("geo.region", "US-NY");
    setMeta("geo.placename", "New York");
    setMeta("geo.position", `${site.latitude};${site.longitude}`);
    setMeta("ICBM", `${site.latitude}, ${site.longitude}`);
    setMeta("og:title", page.title, true);
    setMeta("og:description", page.description, true);
    setMeta("og:url", canonical, true);
    setMeta("og:type", isArticle ? "article" : "website", true);
    setMeta("og:locale", locale, true);
    setMeta("og:image", image, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", page.title);
    setMeta("twitter:description", page.description);
    setMeta("twitter:image", image);
    setLink("canonical", canonical);
    setAlternate("en-US", canonical);
    setAlternate("x-default", canonical);
    if (page.path === "/") {
      setAlternate("es", `${siteUrl}/es/`);
      setAlternate("zh", `${siteUrl}/zh/`);
    } else {
      removeAlternate("es");
      removeAlternate("zh");
    }

    const sendPageView = () => trackPageView(canonical, page.title);
    if (window.requestIdleCallback) {
      window.requestIdleCallback(sendPageView);
    } else {
      window.setTimeout(sendPageView, 1);
    }
  }, [location.pathname]);

  return null;
}
