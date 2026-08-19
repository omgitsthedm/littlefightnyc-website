/**
 * Shared route-metadata builders.
 *
 * Both build-route-meta.mjs (hydrated navigation) and prerender-seo.mjs
 * (first response) consume these functions. Keep route copy here or in the
 * authored JSON sources passed into these functions; do not add a third
 * hand-maintained route list.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
);

/**
 * Real pixel dimensions for a share image, read from the file itself.
 *
 * og:image:width and og:image:height used to be emitted only when the path
 * happened to start with /assets/social/ or /assets/og-, in which case they
 * were hardcoded to 1200x630. Every other page — 177 of 231 — shipped an
 * og:image with no dimensions at all, and the assumed 1200x630 would have
 * been wrong for them anyway: the answers art is 1600x1200.
 *
 * Reading the header keeps the numbers honest for whatever image a page
 * actually uses. Returns null for anything unreadable, and the tags are then
 * omitted rather than guessed.
 */
const dimensionCache = new Map();

function imageDimensions(imagePath) {
  if (!imagePath.startsWith("/")) return null;
  if (dimensionCache.has(imagePath)) return dimensionCache.get(imagePath);

  const clean = imagePath.split(/[?#]/, 1)[0];
  const file = path.join(PUBLIC_ROOT, clean.replace(/^\//, ""));
  let result = null;

  try {
    const buf = fs.readFileSync(file);

    if (buf.length >= 24 && buf.toString("ascii", 1, 4) === "PNG") {
      result = { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    } else if (buf.length >= 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
      const format = buf.toString("ascii", 12, 16);
      if (format === "VP8X") {
        result = {
          width: 1 + buf.readUIntLE(24, 3),
          height: 1 + buf.readUIntLE(27, 3),
        };
      } else if (format === "VP8 ") {
        result = {
          width: buf.readUInt16LE(26) & 0x3fff,
          height: buf.readUInt16LE(28) & 0x3fff,
        };
      } else if (format === "VP8L") {
        const bits = buf.readUInt32LE(21);
        result = {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      }
    } else if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      // JPEG: walk the segment chain to the first frame header.
      let offset = 2;
      while (offset < buf.length - 9) {
        if (buf[offset] !== 0xff) { offset += 1; continue; }
        const marker = buf[offset + 1];
        const size = buf.readUInt16BE(offset + 2);
        // SOF0-SOF15, excluding the non-frame DHT/JPG/DAC markers.
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          result = {
            height: buf.readUInt16BE(offset + 5),
            width: buf.readUInt16BE(offset + 7),
          };
          break;
        }
        offset += 2 + size;
      }
    }
  } catch {
    result = null;
  }

  dimensionCache.set(imagePath, result);
  return result;
}

const JOURNAL_SEO_TITLES = {
  "read-your-monthly-software-bill": "Read Your Monthly Software Bill | Little Fight NYC",
  "set-up-google-business-profile-nyc": "Set Up Your Google Business Profile | Little Fight NYC",
  "migrate-off-squarespace-without-breaking-booking": "Leave Squarespace Without Breaking Booking | Little Fight NYC",
  "keep-connect-replace-build-framework": "Keep, Connect, Replace, or Build | Little Fight NYC",
};

const JOURNAL_SEO_DESCRIPTIONS = {
  "keep-connect-replace-build-framework":
    "Before you buy another tool, decide whether to keep, connect, replace, or build. Start with the part of the day that keeps getting stuck.",
};

const JOURNAL_CATEGORY_IMAGES = {
  blog: "/assets/journal-cat-notebook.webp",
  guide: "/assets/journal-cat-software-guide.webp",
  essay: "/assets/journal-cat-essay.webp",
  howto: "/assets/journal-cat-how-to.webp",
};

export const NOT_FOUND_PAGE = {
  path: "/404.html",
  title: "Page Not Found | Little Fight NYC",
  description:
    "That page is gone or moved. Tell us what you need, and we will point you to the right way to get help.",
  headingLead: "This page got",
  headingEmphasis: "knocked out.",
  h1: "This page got knocked out.",
  dek:
    "Probably our fault. The page may have moved, retired, or never existed. Tell us what you were trying to do and we will help you find the right next step.",
  shortAnswer:
    "Short answer: tell us what you were trying to do, and we will help you find the right next step.",
  type: "WebPage",
  image: "/assets/og-tugboat.jpg",
  noindex: true,
};

export function shareForPage(page, siteName = "Little Fight NYC") {
  const authored = page.share ?? {};
  const image = authored.image || page.image || "/assets/og-tugboat.jpg";
  const extension = image.split(/[?#]/, 1)[0].split(".").pop()?.toLowerCase();
  const type =
    authored.type ||
    (extension === "jpg" || extension === "jpeg"
      ? "image/jpeg"
      : extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "application/octet-stream");
  const measured = imageDimensions(image);

  return {
    image,
    type,
    // Authored values win, then the file's own header. Nothing is assumed:
    // the old fallback hardcoded 1200x630 for two path prefixes and left
    // everything else undefined.
    width: authored.width || measured?.width,
    height: authored.height || measured?.height,
    alt: authored.alt || `${siteName}: ${page.h1 || page.title}`,
  };
}

function brandedTitle(title, maxLength = 60) {
  const suffix = " | Little Fight NYC";
  const withBrand = `${title}${suffix}`;
  return withBrand.length <= maxLength ? withBrand : title;
}

function plainText(value) {
  return String(value ?? "")
    .replace(/^Short answer:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Search snippets need to be complete thoughts. Never saw a word in half just
 * to cram it under a character budget; use the last whole-word boundary and
 * only add an ellipsis when there is room for it.
 */
export function clampDescription(value, limit = 160) {
  const text = plainText(value);
  if (text.length <= limit) return text;
  const available = text.slice(0, limit + 1);
  const sentenceEnds = [...available.matchAll(/[.!?](?=\s|$)/g)];
  const lastSentenceEnd = sentenceEnds.at(-1)?.index;
  if (typeof lastSentenceEnd === "number" && lastSentenceEnd >= 60) {
    return available.slice(0, lastSentenceEnd + 1).trim();
  }
  const boundary = text.lastIndexOf(" ", limit - 1);
  const safeEnd = boundary > 0 ? boundary : limit;
  const clipped = text.slice(0, safeEnd).replace(/[,:;\-–—]+$/, "").trim();
  return clipped.length <= limit - 1 ? `${clipped}…` : clipped;
}

function sourceShare(page, siteName) {
  return {
    ...(page.share ?? {}),
    // Route copy is the source for a dynamic page's visible headline. Its
    // social alt must name that same page, not a former SEO-only headline.
    alt: `${siteName}: ${page.h1}`,
  };
}

function sourcePage(page, patch, siteName) {
  const next = { ...page, ...patch };
  return { ...next, share: sourceShare(next, siteName) };
}

/**
 * The app's typed data is the public copy source for dynamic route families.
 * This derives the route catalog from it for both client navigation and the
 * prerender instead of letting seo-pages.json keep a second, stale version of
 * the title, lead, or FAQ. Curated title fields remain when they still name the
 * current page truthfully; visible H1, description, short answer, and FAQ do
 * not have a competing source.
 */
export function enrichAuthoredRoutePages(seoPages, siteContent, siteName = "Little Fight NYC") {
  const answers = new Map((siteContent.answerGuides ?? []).map((guide) => [guide.slug, guide]));
  const areas = new Map((siteContent.areaPages ?? []).map((area) => [area.slug, area]));
  const cases = new Map((siteContent.caseStudies ?? []).map((study) => [study.slug, study]));
  const services = new Map((siteContent.services ?? []).map((service) => [service.slug, service]));
  const studio = new Map((siteContent.studioProjects ?? []).map((project) => [project.slug, project]));

  const pages = seoPages.map((page) => {
    const answerMatch = page.path.match(/^\/answers\/([^/]+)\/$/);
    if (answerMatch && answers.has(answerMatch[1])) {
      const guide = answers.get(answerMatch[1]);
      return sourcePage(page, {
        h1: guide.question,
        description: clampDescription(guide.short),
        shortAnswer: guide.short,
        faq: guide.faq,
        published: guide.published,
        updated: guide.updated,
      }, siteName);
    }

    const areaMatch = page.path.match(/^\/areas\/([^/]+)\/$/);
    if (areaMatch && areas.has(areaMatch[1])) {
      const area = areas.get(areaMatch[1]);
      return sourcePage(page, {
        h1: area.headline,
        description: clampDescription(area.shortAnswer),
        shortAnswer: area.shortAnswer,
        faq: area.faq,
      }, siteName);
    }

    const caseMatch = page.path.match(/^\/case-studies\/([^/]+)\/$/);
    if (caseMatch && cases.has(caseMatch[1])) {
      const study = cases.get(caseMatch[1]);
      return sourcePage(page, {
        h1: study.showcase.label,
        description: clampDescription(study.title),
        shortAnswer: study.title,
        published: study.published ?? page.published,
        updated: study.updated ?? page.updated,
        // Case studies have no public FAQ in the rendered app. Do not carry a
        // retired seo-pages.json FAQ into JSON-LD or the no-JS response.
        faq: undefined,
      }, siteName);
    }

    const serviceMatch = page.path.match(/^\/services\/([^/]+)\/$/);
    if (serviceMatch && services.has(serviceMatch[1])) {
      const service = services.get(serviceMatch[1]);
      return sourcePage(page, {
        h1: service.headline,
        description: clampDescription(service.shortAnswer),
        shortAnswer: service.shortAnswer,
        faq: service.faq,
      }, siteName);
    }

    const studioMatch = page.path.match(/^\/studio\/([^/]+)\/$/);
    if (studioMatch && studio.has(studioMatch[1])) {
      const project = studio.get(studioMatch[1]);
      return sourcePage(page, {
        h1: project.name,
        description: clampDescription(project.description),
        shortAnswer: project.oneline,
        faq: undefined,
      }, siteName);
    }

    return page;
  });

  // Fleet-inventory entries are real Little Fight records, not public client
  // launches. Publish their internal case routes inside this site, but keep
  // them out of the index until public-safe evidence exists.
  const knownPaths = new Set(pages.map((page) => page.path));
  for (const study of cases.values()) {
    if (!study.inventoryOnly) continue;
    const routePath = `/case-studies/${study.slug}/`;
    if (knownPaths.has(routePath)) continue;
    const record = {
      path: routePath,
      title: `${study.client} Project Record | ${siteName}`,
      description: clampDescription(study.title),
      shortAnswer: study.title,
      h1: study.showcase.label,
      type: "Article",
      image: study.image || "/assets/og-tugboat.jpg",
      noindex: true,
      published: study.published,
      updated: study.updated,
    };
    pages.push(sourcePage(record, {}, siteName));
    knownPaths.add(routePath);
  }

  return pages;
}

export function journalTitle(post) {
  return JOURNAL_SEO_TITLES[post.slug] ?? brandedTitle(post.title);
}

export function journalDescription(post) {
  return clampDescription(JOURNAL_SEO_DESCRIPTIONS[post.slug] ?? post.description);
}

export function journalImage(post, hasDedicatedImage = () => false) {
  if (hasDedicatedImage(post.slug)) {
    return `/assets/journal-${post.slug}.webp`;
  }
  return JOURNAL_CATEGORY_IMAGES[post.category] ?? "/assets/manhattan.webp";
}

/**
 * Turn an authored calendar date into an ISO day, independent of build zone.
 *
 * Authors write a bare date ("March 4, 2026") — no time, no offset. new Date()
 * reads that as local midnight and toISOString() then converts to UTC, so a
 * build machine east of UTC moved every date a day earlier: Berlin turned
 * March 4 into 2026-03-03 in <time datetime>, JSON-LD datePublished and
 * sitemap lastmod alike. Netlify builds in UTC so it never showed, but the
 * same commit produced different HTML depending on where it ran.
 *
 * Re-anchoring the parsed Y/M/D to UTC gives back the date the author wrote,
 * from any zone. The app-side twin of this lives in src/lib/authoredDate.ts —
 * the .ts/.mjs boundary keeps them from sharing one module.
 */
export function authoredIsoDate(value) {
  const label = typeof value === "string" ? value.trim() : "";
  if (!label) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) return label;
  const parsed = new Date(label);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Date(
    Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()),
  )
    .toISOString()
    .slice(0, 10);
}

function validDateLabel(value) {
  const label = typeof value === "string" ? value.trim() : "";
  if (!label) return "";
  return Number.isNaN(new Date(label).getTime()) ? "" : label;
}

function explicitHtmlDate(html, itemprop) {
  if (typeof html !== "string") return "";
  for (const match of html.matchAll(/<time\b([^>]*)>([\s\S]*?)<\/time>/gi)) {
    const attrs = Object.fromEntries(
      [...match[1].matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/g)].map((attribute) => [
        attribute[1].toLowerCase(),
        attribute[3],
      ]),
    );
    if (attrs.itemprop !== itemprop) continue;
    const visibleLabel = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return validDateLabel(visibleLabel) || validDateLabel(attrs.datetime);
  }
  return "";
}

/**
 * Resolve only dates the post actually states. Older imported articles may
 * have an empty top-level `published` field while retaining an explicit
 * schema-marked publication <time> in their authored HTML. That is safe to
 * recover; an update date is never substituted for a publication date.
 */
export function journalDates(post) {
  return {
    published:
      validDateLabel(post.published) ||
      explicitHtmlDate(post.html, "datePublished"),
    updated:
      validDateLabel(post.updated) ||
      explicitHtmlDate(post.html, "dateModified"),
  };
}

export function journalPage(post, hasDedicatedImage = () => false) {
  const description = journalDescription(post);
  const dates = journalDates(post);
  return {
    path: `/journal/${post.slug}/`,
    title: journalTitle(post),
    description,
    shortAnswer: description,
    h1: post.title,
    type: "Article",
    image: journalImage(post, hasDedicatedImage),
    faq: post.faq,
    published: dates.published,
    updated: dates.updated,
    journalPost: post,
  };
}

export function serviceAreaPages(seoData) {
  const services = seoData.matrix?.services ?? [];
  const areas = seoData.matrix?.areas ?? [];

  return areas.flatMap((area) =>
    services.map((service) => {
      // "The Bronx" drops its article as an adjective (Bronx businesses) and
      // takes a locative that reads like a New Yorker wrote it (in the Bronx,
      // on the Upper East Side, in the East Village, in SoHo).
      const attributive = area.name.replace(/^The\s+/, "");
      const article = /^[AEIOU]/.test(attributive) ? "an" : "a";
      const locative = /^(Upper|Lower) /.test(area.name)
        ? `on the ${area.name}`
        : area.name === "The Bronx"
          ? "in the Bronx"
          : /Village$|District$/.test(area.name)
            ? `in the ${area.name}`
            : `in ${area.name}`;
      return {
      path: `/areas/${area.slug}/${service.slug}/`,
      // These recombined pages remain out of the index until they carry
      // genuinely distinct local content.
      noindex: true,
      title: `${service.label} for ${attributive} Businesses | Little Fight NYC`,
      description: `${service.label} for ${attributive} businesses. Help people find you, reach you, and take the next step without extra runaround.`,
      h1: `${service.label} for ${attributive} businesses.`,
      // Answer first, in the owner's terms: what they get in their neighborhood,
      // then how we work. (Was "{Area} businesses need …".)
      shortAnswer: `Short answer: For ${article} ${attributive} business, you get ${service.plain}. We keep what works, fix what gets in the way, and start with the smallest useful move.`,
      type: "Service",
      serviceName: `${service.serviceName} ${locative}`,
      image: service.image ?? area.image,
      faq: [
        {
          question: `Does Little Fight work with ${attributive} businesses?`,
          answer: `Yes. Little Fight helps ${attributive} businesses with websites, everyday tech help, Google listings, and simpler ways to keep the work moving.`,
        },
        {
          question: `Should I start with ${service.label} or a Tech Audit?`,
          answer:
            "If the problem touches more than one part of the day—website, booking, email, payments, or bills—start with the free Tech Audit. It helps name the first useful fix.",
        },
      ],
      };
    }),
  );
}

export function glossaryPages(seoData, authoredTerms = seoData.glossaryTerms ?? []) {
  const terms = authoredTerms;
  return [
    {
      path: "/glossary/",
      title: "Plain-English Small Business Tech Glossary | Little Fight NYC",
      description:
        "Simple explanations for the words that get in the way of a busy business day. Find the term, see what it means, and choose the next move.",
      // Keep the no-JavaScript first response on the same owner-first question
      // the hydrated Glossary page asks. This is visible copy, not SEO-only
      // metadata, so a visitor should never see it rewrite on load.
      h1: "What does that word mean for your business?",
      shortAnswer:
        "Short answer: find the word that is slowing the day down, see what it means, and choose one useful next step.",
      type: "CollectionPage",
      image: "/assets/sign-more-shops.webp",
    },
    ...terms.map((term) => ({
      path: `/glossary/${term.slug}/`,
      title: `What Is ${term.term}? | Little Fight NYC`,
      description: clampDescription(`${term.term}: ${term.plain}`),
      h1: term.term,
      shortAnswer: `Short answer: ${term.plain}`,
      type: "DefinedTerm",
      image: "/assets/typing.webp",
      faq: term.faq,
      term,
    })),
  ];
}

function firstAuthoredH1(html, fallback) {
  const match = typeof html === "string" ? html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) : null;
  if (!match) return fallback;

  return match[1]
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&rsquo;", "’")
    .replaceAll("&lsquo;", "‘")
    .replaceAll("&rdquo;", "”")
    .replaceAll("&ldquo;", "“")
    .replaceAll("&mdash;", "—")
    .replaceAll("&ndash;", "–")
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function industryPage(entry) {
  const fallbackH1 = entry.title.replace(" Help", "");
  return {
    path: `/industries/${entry.slug}/`,
    title: `Websites & Everyday Help for ${fallbackH1} | Little Fight NYC`,
    description: clampDescription(entry.description),
    shortAnswer: clampDescription(entry.description),
    h1: firstAuthoredH1(entry.html, fallbackH1),
    type: "WebPage",
    image: entry.image || "/assets/manhattan.webp",
    industry: entry,
  };
}

export function localePages() {
  return [
    {
      path: "/es/",
      locale: "es",
      title: "Páginas web y ayuda diaria en español | Little Fight NYC",
      description:
        "Páginas web y ayuda diaria para pequeños negocios de Nueva York. Vea ejemplos reales, llame o empiece un plan gratis.",
      h1: "Una página web hecha para su negocio. Ayuda real cuando algo falla.",
      shortAnswer:
        "Little Fight NYC en español: páginas web, ayuda cuando algo falla, una primera consulta gratis y herramientas que se adaptan a su negocio.",
      type: "WebPage",
      image: "/assets/og-tugboat.jpg",
    },
    {
      path: "/zh/",
      locale: "zh",
      title: "Little Fight NYC 中文 | 纽约小生意的网站与技术支持",
      description:
        "Little Fight NYC 中文：为纽约小生意提供网站、技术支持和免费咨询。计划写清时间，网站和资料归您；真人回复。",
      h1: "网站按您的生意来做。技术出问题时，有真人帮您。",
      shortAnswer:
        "Little Fight NYC 中文：为纽约小生意提供网站、技术支持、免费咨询和适合您生意的工具。网站和资料归您。",
      type: "WebPage",
      image: "/assets/og-tugboat.jpg",
    },
  ];
}
