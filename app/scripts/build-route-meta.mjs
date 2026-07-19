/**
 * Emit a slim `route-meta.json` (just {path,title,description,image} per route,
 * plus the site geo) from the full 97KB seo-pages.json. RouteMeta only needs
 * those fields to update the tab title / meta on client-side navigation (the
 * prerendered HTML already carries the correct tags on first load), so shipping
 * the whole file — with h1/shortAnswer/faq/matrix/glossary definitions — was
 * ~25KB gz of dead weight on every editorial page.
 *
 * The route derivation lives HERE (moved out of RouteMeta.tsx) so it runs once
 * at build. build-route-meta.mjs is wired into `npm run build` (and predev).
 * scripts/verify checks every generated title against the prerendered <title>.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "src", "data");
const seoData = JSON.parse(readFileSync(join(dataDir, "seo-pages.json"), "utf8"));

const journalMeta = [
  { slug: "cybersecurity-for-small-business", title: "Cybersecurity for Small Business", description: "Practical cybersecurity tips for small businesses. Learn how to protect your business from cyber threats with these actionable steps." },
  { slug: "nyc-small-business-digital", title: "NYC Small Business Digital Guide", description: "NYC small businesses need a digital presence to survive. Learn how going digital can increase foot traffic, customer loyalty, and sales for local shops." },
  { slug: "protecting-kids-from-ai", title: "Protecting Your Kids From AI", description: "A practical guide for parents on AI safety for children. Learn what AI really is, the real risks, and how to talk to your kids about using AI responsibly." },
  { slug: "airtable-vs-notion-vs-monday-small-business", title: "Airtable vs Notion vs Monday", description: "Compare Airtable, Notion, and Monday for small business operations, lead tracking, owner views, tasks, and workflows without overbuilding." },
  { slug: "custom-business-system-vs-saas-subscriptions", title: "Custom Systems vs SaaS", description: "When off-the-shelf software makes sense, when a practical custom help may be cleaner, and how to compare cost, workflow, and fit." },
  { slug: "shopify-vs-squarespace-nyc-retail", title: "Shopify vs Squarespace for NYC Retail", description: "A practical comparison for NYC shops choosing Shopify or Squarespace for local retail, e-commerce, inventory, Google visibility, and conversion." },
  { slug: "square-appointments-vs-glossgenius-nyc-salons", title: "Square vs GlossGenius for NYC Salons", description: "Compare Square Appointments and GlossGenius for NYC salons, stylists, and wellness operators choosing booking, payments, staff calendars, and follow-up." },
  { slug: "square-vs-toast-manhattan-restaurants", title: "Square vs Toast for Manhattan Restaurants", description: "Compare Square and Toast for Manhattan restaurants, bars, cafes, and hospitality teams choosing POS, payments, kitchen flow, and reporting." },
  { slug: "webflow-vs-squarespace-manhattan-small-business", title: "Webflow vs Squarespace for Manhattan", description: "A local guide to choosing Webflow or Squarespace for Manhattan small business websites, service pages, booking paths, Google visibility, and fit." },
  { slug: "ai-google-broke-the-internet-websites-survive", title: "AI & Google Broke the Internet", description: "AI and Google broke the old internet. Learn how small business websites survive in the age of zero-click searches and AI summaries." },
  { slug: "what-google-looks-for-business-website", title: "What Google Looks For on a Business Website", description: "Google evaluates trust, clarity, and specificity - not keyword density. Learn what actually matters for your business website." },
  { slug: "why-business-websites-will-be-invisible", title: "Why Business Websites Will Be Invisible", description: "Most business websites are fading from search results as AI decides trust before a click happens. Here's what needs to change." },
  { slug: "read-your-monthly-software-bill", title: "How to Read Your Monthly Software Bill", description: "A 6-step audit any NYC small business owner can run on a Sunday afternoon to find the software subscriptions silently bleeding cash every month." },
  { slug: "set-up-google-business-profile-nyc", title: "How to Set Up a Google Business Profile in 30 Minutes", description: "A 30-minute walkthrough for NYC small businesses claiming or rebuilding their Google Business Profile so neighbors can actually find the shop." },
  { slug: "migrate-off-squarespace-without-breaking-booking", title: "How to Migrate Off Squarespace Without Breaking Your Booking Page", description: "A safe migration sequence for NYC small businesses moving off Squarespace to a faster, cheaper, or more flexible platform without losing customers mid-jump." },
  { slug: "keep-connect-replace-build-framework", title: "How to Know When to Keep, Connect, Replace, or Build a Business Tool", description: "The four-question framework Little Fight NYC uses on every engagement to figure out whether the right move is to keep it, connect it, replace it, or build something new." },
  { slug: "spot-developer-about-to-ghost", title: "How to Spot a Developer Who's About to Ghost You", description: "Six early warning signs that the freelance developer or agency you hired is going to disappear mid-project - and what to do before it happens." },
];

const industryMeta = [
  { slug: "galleries-creative-studios", title: "Galleries and Creative Studios Help", description: "Portfolio, inquiry, proposal, local visibility, and lightweight workflow systems for galleries, studios, and creative firms.", image: "/assets/sign-groceries-snacks.webp" },
  { slug: "law-firms", title: "Law Firms Help", description: "Website, consult scheduling, intake, email on your own domain, referral tracking, and document flow for solo and small law firms across New York City.", image: "/assets/typing.webp" },
  { slug: "medical-wellness-practices", title: "Medical and Wellness Help", description: "Trust, booking, intake, local visibility, and workflow systems for small medical and wellness practices that need cleaner digital operations.", image: "/assets/storefront-health-foods.webp" },
  { slug: "professional-services", title: "Professional Services Help", description: "Service pages, lead qualification, customer list, proposals, reporting, and local visibility systems for small professional firms that need cleaner handoffs.", image: "/assets/coworking-laptops.webp" },
  { slug: "restaurants-bars", title: "Restaurants and Bars Help", description: "Website, POS, reservations, reviews, local search, and owner reporting systems for New York restaurants and bars running on tight margins.", image: "/assets/pizza-menu-chalkboard.webp" },
  { slug: "retail-ecommerce", title: "Retail and E-commerce Help", description: "Inventory, Shopify or Square, local pickup, product pages, email capture, and local search systems for NYC retail teams that need cleaner operations.", image: "/assets/interior-jeans-rack.webp" },
  { slug: "salons-wellness", title: "Salons and Wellness Help", description: "Booking, staff calendars, service pages, reviews, rebooking, and local search systems for salons and wellness teams that need cleaner flow.", image: "/assets/storefront-beauty-supply.webp" },
];

const journalSeoTitles = {
  "read-your-monthly-software-bill": "Audit Your Monthly Software Bill | Little Fight NYC",
  "set-up-google-business-profile-nyc": "Set Up Google Business Profile NYC | Little Fight NYC",
  "migrate-off-squarespace-without-breaking-booking": "Migrate Off Squarespace Safely | Little Fight NYC",
  "keep-connect-replace-build-framework": "Keep Connect Replace or Build | Little Fight NYC",
};

const journalSeoDescriptions = {
  "keep-connect-replace-build-framework":
    "A practical framework for deciding whether to keep, connect, replace, or build a business tool before spending on another platform.",
};

const journalImages = {
  "cybersecurity-for-small-business": "/assets/journal-cat-notebook.webp",
  "nyc-small-business-digital": "/assets/journal-cat-notebook.webp",
  "protecting-kids-from-ai": "/assets/journal-cat-notebook.webp",
  "airtable-vs-notion-vs-monday-small-business": "/assets/journal-cat-software-guide.webp",
  "custom-business-system-vs-saas-subscriptions": "/assets/journal-cat-software-guide.webp",
  "shopify-vs-squarespace-nyc-retail": "/assets/journal-cat-software-guide.webp",
  "square-appointments-vs-glossgenius-nyc-salons": "/assets/journal-cat-software-guide.webp",
  "square-vs-toast-manhattan-restaurants": "/assets/journal-cat-software-guide.webp",
  "webflow-vs-squarespace-manhattan-small-business": "/assets/journal-cat-software-guide.webp",
  "ai-google-broke-the-internet-websites-survive": "/assets/journal-cat-essay.webp",
  "what-google-looks-for-business-website": "/assets/journal-cat-essay.webp",
  "why-business-websites-will-be-invisible": "/assets/journal-cat-essay.webp",
  "read-your-monthly-software-bill": "/assets/journal-cat-how-to.webp",
  "set-up-google-business-profile-nyc": "/assets/journal-cat-how-to.webp",
  "migrate-off-squarespace-without-breaking-booking": "/assets/journal-cat-how-to.webp",
  "keep-connect-replace-build-framework": "/assets/journal-cat-how-to.webp",
  "spot-developer-about-to-ghost": "/assets/journal-cat-how-to.webp",
};

function brandedTitle(title, maxLength = 60) {
  const suffix = " | Little Fight NYC";
  const withBrand = `${title}${suffix}`;
  return withBrand.length <= maxLength ? withBrand : title;
}

const serviceMetaSentence = {
  websites: "Little Fight builds clear pages, working forms, and booking paths that turn local visitors into customers.",
  "it-support": "Little Fight fixes email, domains, Wi-Fi, POS, payments, and account access before they cost you a sale.",
  "local-search": "Little Fight sharpens Google Profile, Maps, reviews, and service pages so nearby customers find you.",
  "business-systems": "Little Fight cleans up lead intake, follow-up, dashboards, and software waste that slow daily work.",
};

function serviceAreaPages() {
  const matrix = seoData.matrix;
  return matrix.areas.flatMap((area) =>
    matrix.services.map((service) => {
      const secondSentence =
        serviceMetaSentence[service.slug] ??
        "Little Fight fixes the websites, tools, Google signals, and handoffs that slow daily work.";
      return {
        path: `/areas/${area.slug}/${service.slug}/`,
        title: `${service.label} in ${area.name} | Little Fight NYC`,
        description: `${service.label} help for ${area.name} businesses. ${secondSentence}`,
        image: service.image ?? area.image,
      };
    }),
  );
}

function glossaryPages() {
  const terms = seoData.glossaryTerms;
  return [
    {
      path: "/glossary/",
      title: "Small Business Tech Glossary | Little Fight NYC",
      description: "Plain-English definitions for small business websites, IT support, local search, software costs, and business systems for NYC owners.",
      image: "/assets/typing.webp",
    },
    ...terms.map((term) => ({
      path: `/glossary/${term.slug}/`,
      title: `${term.term} Definition | Little Fight NYC`,
      description: term.definition,
      image: "/assets/typing.webp",
    })),
  ];
}

function journalPages() {
  return journalMeta.map((post) => ({
    path: `/journal/${post.slug}/`,
    title: journalSeoTitles[post.slug] ?? brandedTitle(post.title),
    description: journalSeoDescriptions[post.slug] ?? post.description,
    image: journalImages[post.slug] ?? "/assets/manhattan.webp",
  }));
}

function industryPages() {
  return industryMeta.map((entry) => ({
    path: `/industries/${entry.slug}/`,
    title: `${entry.title.replace(" Help", "")} Tech Help | Little Fight NYC`,
    description: entry.description,
    image: entry.image ?? "/assets/manhattan.webp",
  }));
}

const pages = [
  ...seoData.pages.map((p) => ({ path: p.path, title: p.title, description: p.description, image: p.image })),
  ...serviceAreaPages(),
  ...glossaryPages(),
  ...journalPages(),
  ...industryPages(),
];

const out = {
  site: {
    url: seoData.site.url,
    latitude: seoData.site.latitude,
    longitude: seoData.site.longitude,
  },
  pages,
};

writeFileSync(join(dataDir, "route-meta.json"), JSON.stringify(out) + "\n");
console.log(`route-meta.json: ${pages.length} routes (flat meta, seo-pages.json stripped from the client)`);

// CoverageMatrix only needs the {slug,label} service columns — emit them alone
// so it doesn't pull the whole 97KB seo-pages.json into its chunk.
const matrixServices = (seoData.matrix?.services ?? []).map((s) => ({ slug: s.slug, label: s.label }));
writeFileSync(join(dataDir, "matrix-services.json"), JSON.stringify(matrixServices) + "\n");
console.log(`matrix-services.json: ${matrixServices.length} service columns`);
