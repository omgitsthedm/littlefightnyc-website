import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import routeMeta from "@/data/route-meta.json";
import { trackPageView } from "@/lib/analytics";

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
  image?: string;
};

const site = routeMeta.site;
const pages = routeMeta.pages as MetaPage[];
const siteUrl = site.url.replace(/\/$/, "");

function routePath(pathname: string) {
  if (pathname === "/") return "/";
  return `${pathname.replace(/\/$/, "")}/`;
}

function absoluteUrl(path: string) {
  return `${siteUrl}${path === "/" ? "/" : path}`;
}

function fallbackPage(path: string): MetaPage | undefined {
  if (path.startsWith("/journal/")) {
    return {
      path,
      title: "Little Fight Journal Article | Little Fight NYC",
      description:
        "A Little Fight NYC journal article for New York small business owners comparing websites, IT support, software bills, search, and workflow.",
      image: "/assets/manhattan.webp",
    };
  }

  if (path.startsWith("/industries/")) {
    return {
      path,
      title: "NYC Industry Tech Help | Little Fight NYC",
      description:
        "Technology help for a New York City business type, including websites, local search, IT support, workflow cleanup, and practical systems.",
      image: "/assets/manhattan.webp",
    };
  }
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

export default function RouteMeta() {
  const location = useLocation();

  useEffect(() => {
    const path = routePath(location.pathname);
    const page = pages.find((item) => item.path === path) ?? fallbackPage(path) ?? pages[0];
    const canonical = absoluteUrl(page.path);
    const image = page.image?.startsWith("http") ? page.image : absoluteUrl(page.image ?? "/assets/og-tugboat.jpg");
    const isArticle = page.title.includes(" | Little Fight NYC") && (
      page.path.startsWith("/journal/") ||
      page.path.startsWith("/answers/") ||
      page.path.startsWith("/case-studies/")
    );

    document.documentElement.lang = "en";
    document.title = page.title;
    setMeta("description", page.description);
    if (isArticle) {
      setMeta("author", "Little Fight NYC");
    } else {
      removeMeta("author");
    }
    setMeta("robots", "index, follow, max-image-preview:large");
    setMeta("geo.region", "US-NY");
    setMeta("geo.placename", "New York");
    setMeta("geo.position", `${site.latitude};${site.longitude}`);
    setMeta("ICBM", `${site.latitude}, ${site.longitude}`);
    setMeta("og:title", page.title, true);
    setMeta("og:description", page.description, true);
    setMeta("og:url", canonical, true);
    setMeta("og:type", isArticle ? "article" : "website", true);
    setMeta("og:image", image, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", page.title);
    setMeta("twitter:description", page.description);
    setMeta("twitter:image", image);
    setLink("canonical", canonical);
    setAlternate("en-US", canonical);
    setAlternate("x-default", canonical);

    const sendPageView = () => trackPageView(canonical, page.title);
    if (window.requestIdleCallback) {
      window.requestIdleCallback(sendPageView);
    } else {
      window.setTimeout(sendPageView, 1);
    }
  }, [location.pathname]);

  return null;
}
