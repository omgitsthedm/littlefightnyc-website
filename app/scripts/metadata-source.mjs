/**
 * Shared route-metadata builders.
 *
 * Both build-route-meta.mjs (hydrated navigation) and prerender-seo.mjs
 * (first response) consume these functions. Keep route copy here or in the
 * authored JSON sources passed into these functions; do not add a third
 * hand-maintained route list.
 */

const JOURNAL_SEO_TITLES = {
  "read-your-monthly-software-bill": "Audit Your Monthly Software Bill | Little Fight NYC",
  "set-up-google-business-profile-nyc": "Set Up Google Business Profile NYC | Little Fight NYC",
  "migrate-off-squarespace-without-breaking-booking": "Migrate Off Squarespace Safely | Little Fight NYC",
  "keep-connect-replace-build-framework": "Keep Connect Replace or Build | Little Fight NYC",
};

const JOURNAL_SEO_DESCRIPTIONS = {
  "keep-connect-replace-build-framework":
    "A practical framework for deciding whether to keep, connect, replace, or build a business tool before spending on another platform.",
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
    "This Little Fight NYC page moved. Book a free Tech Audit or contact Little Fight for small business website, IT, or systems help.",
  headingLead: "This page got",
  headingEmphasis: "knocked out.",
  h1: "This page got knocked out.",
  dek:
    "Probably our fault. The page may have moved, been retired, or never existed at all. The good stuff is below — or call (646) 360-0318 if you needed something specific.",
  shortAnswer:
    "Short answer: start with the messy setup and Little Fight will route you to the right help.",
  type: "WebPage",
  image: "/assets/og-tugboat.jpg",
  noindex: true,
};

function brandedTitle(title, maxLength = 60) {
  const suffix = " | Little Fight NYC";
  const withBrand = `${title}${suffix}`;
  return withBrand.length <= maxLength ? withBrand : title;
}

export function journalTitle(post) {
  return JOURNAL_SEO_TITLES[post.slug] ?? brandedTitle(post.title);
}

export function journalDescription(post) {
  return JOURNAL_SEO_DESCRIPTIONS[post.slug] ?? post.description;
}

export function journalImage(post, hasDedicatedImage = () => false) {
  if (hasDedicatedImage(post.slug)) {
    return `/assets/journal-${post.slug}.webp`;
  }
  return JOURNAL_CATEGORY_IMAGES[post.category] ?? "/assets/manhattan.webp";
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
    services.map((service) => ({
      path: `/areas/${area.slug}/${service.slug}/`,
      // These recombined pages remain out of the index until they carry
      // genuinely distinct local content.
      noindex: true,
      title: `${service.label} in ${area.name} | Little Fight NYC`,
      description: `${service.label} help for ${area.name} businesses. Little Fight fixes websites, tools, Google signals, and handoffs that slow daily work.`,
      h1: `${service.label} for ${area.name} businesses.`,
      shortAnswer: `Short answer: ${area.name} businesses need ${service.plain}. Little Fight keeps what works, fixes what drags, and avoids another bloated monthly bill when a smaller move will do.`,
      type: "Service",
      serviceName: `${service.serviceName} in ${area.name}`,
      image: service.image ?? area.image,
      faq: [
        {
          question: `Does Little Fight work with ${area.name} businesses?`,
          answer: `Yes. Little Fight helps ${area.name} businesses with websites, IT support, local search visibility, tool cleanup, and practical business systems.`,
        },
        {
          question: `Should I start with ${service.label} or a Tech Audit?`,
          answer:
            "If the problem touches more than one page, tool, person, or monthly bill, start with the free Tech Audit so the first fix is not guessed.",
        },
      ],
    })),
  );
}

export function glossaryPages(seoData) {
  const terms = seoData.glossaryTerms ?? [];
  return [
    {
      path: "/glossary/",
      title: "Small Business Tech Glossary | Little Fight NYC",
      description:
        "Plain-English definitions for small business websites, IT support, local search, software costs, and business systems for NYC owners.",
      h1: "Useful words. No vendor fog.",
      shortAnswer:
        "Short answer: these are the terms New York business owners run into when websites, tools, Google, and workflow start costing real money.",
      type: "CollectionPage",
      image: "/assets/typing.webp",
    },
    ...terms.map((term) => ({
      path: `/glossary/${term.slug}/`,
      title: `${term.term} Definition | Little Fight NYC`,
      description: term.definition,
      h1: term.term,
      shortAnswer: `Short answer: ${term.plain}`,
      type: "DefinedTerm",
      image: "/assets/typing.webp",
      faq: term.faq,
      term,
    })),
  ];
}

export function industryPage(entry) {
  return {
    path: `/industries/${entry.slug}/`,
    title: `${entry.title.replace(" Help", "")} Tech Help | Little Fight NYC`,
    description: entry.description,
    shortAnswer: entry.description,
    h1: entry.title.replace(" Help", ""),
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
      title: "Páginas web y tecnología en español | Little Fight NYC",
      description:
        "Páginas web, soporte técnico y software propio para pequeños negocios de Nueva York. Vea trabajo real, llame o empiece un plan gratis.",
      h1: "Su página web trae clientes. Nosotros la mantenemos andando.",
      shortAnswer:
        "Little Fight NYC en español: páginas web, soporte técnico, consultoría gratis y software propio para negocios pequeños de Nueva York.",
      type: "WebPage",
      image: "/assets/og-tugboat.jpg",
    },
    {
      path: "/zh/",
      locale: "zh",
      title: "Little Fight NYC 中文 | 纽约小生意的网站与技术支持",
      description:
        "Little Fight NYC 中文：为纽约小生意提供网站建设、技术支持、免费咨询和自有软件。14天上线，代码和数据归您；电话、短信或邮件都由真人回复。服务纽约五大区。",
      h1: "您的网站带来顾客。我们让它一直好用。",
      shortAnswer:
        "Little Fight NYC 中文：为纽约小生意提供网站建设、技术支持、免费咨询和自有软件。14天上线，代码归您。",
      type: "WebPage",
      image: "/assets/og-tugboat.jpg",
    },
  ];
}
