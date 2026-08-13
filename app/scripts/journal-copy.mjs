/**
 * Render the owner-first Journal source into the same HTML consumed by the
 * browser chunk and the crawler snapshot. Content lives in
 * src/data/journal-copy.json; journal.json keeps dates and route identity.
 */

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeHref(value = "") {
  const href = String(value).trim();
  if (/^https:\/\//i.test(href) || /^\/[a-z0-9/_?=&%+.-]*$/i.test(href)) {
    return href;
  }
  throw new Error(`Journal copy contains an unsafe link: ${href || "(empty)"}`);
}

function list(items, ordered = false) {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
}

export const SOURCE_CATALOG = {
  nistSmallBusiness: {
    label: "NIST Small Business Cybersecurity Corner",
    href: "https://www.nist.gov/itl/smallbusinesscyber",
    note: "Government guidance selected for small-business use.",
  },
  cisaSmallBusiness: {
    label: "CISA small and midsize business resources",
    href: "https://www.cisa.gov/small-and-medium-sized-business-resources",
    note: "Official steps for phishing, passwords, MFA, updates, backups, and encryption.",
  },
  ftcKids: {
    label: "FTC: Protecting Kids Online",
    href: "https://consumer.ftc.gov/identity-theft-and-online-security/protecting-kids-online",
    note: "Parent-facing privacy and safety guidance.",
  },
  icannRegistrants: {
    label: "ICANN information for domain registrants",
    href: "https://www.icann.org/registrants",
    note: "Official rights, renewals, transfers, and registrar guidance.",
  },
  adaWeb: {
    label: "U.S. Department of Justice web accessibility guidance",
    href: "https://www.ada.gov/resources/web-guidance/",
    note: "Official ADA guidance for businesses open to the public.",
  },
  googleClaim: {
    label: "Google: Add or claim your Business Profile",
    href: "https://support.google.com/business/answer/2911778",
    note: "Official claim and verification instructions.",
  },
  googleReviews: {
    label: "Google: Manage customer reviews",
    href: "https://support.google.com/business/answer/3474050?hl=en",
    note: "Official reply, notification, and policy guidance.",
  },
  googleAi: {
    label: "Google Search: AI features and your website",
    href: "https://developers.google.com/search/docs/appearance/ai-features",
    note: "Google says AI search uses the same core search foundations; no magic markup is required.",
  },
  googleHelpful: {
    label: "Google Search: Helpful, reliable, people-first content",
    href: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    note: "Official content-quality guidance.",
  },
  openAiSearch: {
    label: "OpenAI: How ChatGPT search works",
    href: "https://help.openai.com/en/articles/9237897-chatgpt-search",
    note: "Official description of web search and cited sources in ChatGPT.",
  },
  airtablePricing: {
    label: "Airtable plans",
    href: "https://airtable.com/pricing",
    note: "Current plan and feature source.",
  },
  notionPricing: {
    label: "Notion plans",
    href: "https://www.notion.com/pricing",
    note: "Current plan and feature source.",
  },
  mondayPricing: {
    label: "monday.com plans",
    href: "https://monday.com/pricing",
    note: "Current plan and feature source.",
  },
  shopifyPos: {
    label: "Shopify POS features",
    href: "https://www.shopify.com/pos",
    note: "Official retail and inventory feature source.",
  },
  squarespaceCommerce: {
    label: "Squarespace commerce plans",
    href: "https://www.squarespace.com/pricing",
    note: "Current plan and commerce feature source.",
  },
  squarespaceExport: {
    label: "Squarespace: Exporting your site",
    href: "https://support.squarespace.com/hc/en-us/articles/206566687-Exporting-your-site",
    note: "Official export limits and instructions.",
  },
  squareAppointments: {
    label: "Square Appointments plans and features",
    href: "https://squareup.com/us/en/appointments/pricing",
    note: "Official scheduling, staff, deposit, and communication features.",
  },
  glossGeniusPricing: {
    label: "GlossGenius plans and features",
    href: "https://support.glossgenius.com/en/articles/189-glossgenius-pricing-and-subscription-plans",
    note: "Official plan comparison.",
  },
  squareRestaurants: {
    label: "Square for Restaurants",
    href: "https://squareup.com/us/en/point-of-sale/restaurants",
    note: "Official restaurant POS feature source.",
  },
  toastOverview: {
    label: "Toast platform overview",
    href: "https://pos.toasttab.com/how-toast-works",
    note: "Official restaurant workflow and product source.",
  },
  webflowPlans: {
    label: "Webflow: Choose a Site plan",
    href: "https://help.webflow.com/hc/en-us/articles/33961232582419-Choose-a-Site-plan",
    note: "Official hosting, CMS, custom-code, and plan guidance.",
  },
  googleWorkspace: {
    label: "Google Workspace: Gmail, business email, and domain-verified accounts",
    href: "https://knowledge.workspace.google.com/admin/domains/about-gmail-business-email-and-domain-verified-google-workspace-accounts",
    note: "Official account ownership and administration comparison.",
  },
  calendlyFeatures: {
    label: "Calendly features",
    href: "https://calendly.com/features",
    note: "Official calendar, meeting, workflow, and integration source.",
  },
  quickbooksPricing: {
    label: "QuickBooks Online plans",
    href: "https://quickbooks.intuit.com/pricing/",
    note: "Current official plan and feature source.",
  },
  wavePricing: {
    label: "Wave plans",
    href: "https://www.waveapps.com/pricing",
    note: "Current official plan and feature source.",
  },
  wordpressFeatures: {
    label: "WordPress features",
    href: "https://wordpress.org/about/features/",
    note: "Official open-source software feature source.",
  },
  squareOffline: {
    label: "Square: Process offline payments",
    href: "https://squareup.com/help/us/en/article/7777-process-card-payments-with-offline-mode",
    note: "Official preparation, limits, and risk guidance.",
  },
  squareNetwork: {
    label: "Square: Troubleshoot your network connection",
    href: "https://squareup.com/help/us/en/article/8305-troubleshooting-your-connection",
    note: "Official checks for device, router, internet, and Square service connectivity.",
  },
};

export function resolveJournalSources(record) {
  return (record?.sources ?? []).map((sourceRef) => {
    const source = typeof sourceRef === "string" ? SOURCE_CATALOG[sourceRef] : sourceRef;
    if (!source) throw new Error(`Unknown Journal source key: ${sourceRef}`);
    return {
      label: String(source.label),
      href: safeHref(source.href),
      note: source.note ? String(source.note) : "",
    };
  });
}

export function renderJournalCopy(record) {
  if (!record?.slug || !record?.answer || !record?.next?.length) {
    throw new Error(`Incomplete Journal copy record: ${record?.slug ?? "(unknown)"}`);
  }

  const sources = resolveJournalSources(record)
    .map((source) => {
      const href = source.href;
      const external = href.startsWith("https://");
      const attributes = external ? ' target="_blank" rel="noreferrer"' : "";
      return `<li><a href="${escapeHtml(href)}"${attributes}>${escapeHtml(source.label)}</a>${source.note ? ` — ${escapeHtml(source.note)}` : ""}</li>`;
    })
    .join("");

  const fitHref = safeHref(record.cta?.href ?? "/tech-audit/");
  const fitLabel = record.cta?.label ?? "Get a plain-English second opinion";

  return [
    `<p class="lf-post__answer"><strong>Short answer:</strong> ${escapeHtml(record.answer)}</p>`,
    `<h2>What this means for your business</h2>`,
    `<p>${escapeHtml(record.meaning)}</p>`,
    record.watch?.length ? `<h2>What to watch</h2>${list(record.watch)}` : "",
    `<h2>Do this next</h2>`,
    list(record.next, true),
    `<h2>When Little Fight fits</h2>`,
    `<p>${escapeHtml(record.fit)}</p>`,
    `<p><a href="${escapeHtml(fitHref)}">${escapeHtml(fitLabel)}</a></p>`,
    sources
      ? `<section class="lf-post__sources" aria-labelledby="journal-sources"><h2 id="journal-sources">Sources and further reading</h2><p>Checked August 13, 2026. Product features and rules can change, so use the linked source as the current word.</p><ul>${sources}</ul></section>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function copyBySlug(copyFile) {
  const records = copyFile?.posts ?? [];
  const map = new Map();
  for (const record of records) {
    if (map.has(record.slug)) throw new Error(`Duplicate Journal copy slug: ${record.slug}`);
    map.set(record.slug, record);
  }
  return map;
}
