import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import seoData from "@/data/seo-pages.json";

type SeoPage = {
  description: string;
  image?: string;
  path: string;
  shortAnswer: string;
  title: string;
};

type MatrixService = {
  slug: string;
  label: string;
  plain: string;
  description: string;
  image?: string;
};

type MatrixArea = {
  slug: string;
  name: string;
  shortNeed: string;
  image?: string;
};

type GlossaryTerm = {
  slug: string;
  term: string;
  definition: string;
  plain: string;
};

const siteUrl = seoData.site.url.replace(/\/$/, "");

function serviceAreaPages(): SeoPage[] {
  const matrix = seoData.matrix as { services: MatrixService[]; areas: MatrixArea[] };

  return matrix.areas.flatMap((area) =>
    matrix.services.map((service) => ({
      path: `/areas/${area.slug}/${service.slug}/`,
      title: `${service.label} for ${area.name} Businesses | Little Fight NYC`,
      description: `${service.description} Built for ${area.name} businesses that need ${area.shortNeed}.`,
      shortAnswer: `Short answer: ${area.name} businesses need ${service.plain}.`,
      image: service.image ?? area.image,
    }))
  );
}

function glossaryPages(): SeoPage[] {
  const terms = seoData.glossaryTerms as GlossaryTerm[];

  return [
    {
      path: "/glossary/",
      title: "Small Business Tech Glossary | Little Fight NYC",
      description: "Plain-English definitions for small business websites, IT support, local search, software costs, and business systems.",
      shortAnswer:
        "Short answer: these are the terms New York business owners run into when websites, tools, Google, and workflow start costing real money.",
      image: "/assets/typing.webp",
    },
    ...terms.map((term) => ({
      path: `/glossary/${term.slug}/`,
      title: `${term.term} Meaning for Small Business | Little Fight NYC`,
      description: `${term.definition} A plain-English Little Fight NYC definition for New York small business owners.`,
      shortAnswer: `Short answer: ${term.plain}`,
      image: "/assets/typing.webp",
    })),
  ];
}

const pages = [...(seoData.pages as SeoPage[]), ...serviceAreaPages(), ...glossaryPages()];

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

function setLink(rel: string, href: string) {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }

  link.href = href;
}

export default function RouteMeta() {
  const location = useLocation();

  useEffect(() => {
    const path = routePath(location.pathname);
    const page = pages.find((item) => item.path === path) ?? pages[0];
    const canonical = absoluteUrl(page.path);
    const image = page.image?.startsWith("http") ? page.image : absoluteUrl(page.image ?? "/assets/og-image.jpg");

    document.documentElement.lang = "en";
    document.title = page.title;
    setMeta("description", page.description);
    setMeta("robots", "index, follow, max-image-preview:large");
    setMeta("geo.region", "US-NY");
    setMeta("geo.placename", "New York");
    setMeta("geo.position", `${seoData.site.latitude};${seoData.site.longitude}`);
    setMeta("ICBM", `${seoData.site.latitude}, ${seoData.site.longitude}`);
    setMeta("og:title", page.title, true);
    setMeta("og:description", page.description, true);
    setMeta("og:url", canonical, true);
    setMeta("og:type", "website", true);
    setMeta("og:image", image, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", page.title);
    setMeta("twitter:description", page.description);
    setMeta("twitter:image", image);
    setLink("canonical", canonical);
  }, [location.pathname]);

  return null;
}
