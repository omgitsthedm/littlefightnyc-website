import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const today = "2026-05-06";
const displayDate = "May 6, 2026";
const cssVersion = "20260505h";

const org = {
  "@type": "Organization",
  "@id": "https://littlefightnyc.com/#org",
  name: "Little Fight NYC",
  url: "https://littlefightnyc.com/",
  email: "hello@littlefightnyc.com",
  telephone: "+16463600318",
  logo: "https://littlefightnyc.com/apple-touch-icon.png",
  image: "https://littlefightnyc.com/images/og-image.jpg",
  founder: { "@type": "Person", name: "David Marsh", url: "https://littlefightnyc.com/about/" },
};

const localBusiness = {
  "@type": "LocalBusiness",
  "@id": "https://littlefightnyc.com/#business",
  name: "Little Fight NYC",
  description:
    "NYC websites, IT support, Google visibility, software cleanup, lead capture, and practical systems for local businesses.",
  url: "https://littlefightnyc.com/",
  telephone: "+16463600318",
  email: "hello@littlefightnyc.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "New York",
    addressRegion: "NY",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "City", name: "New York" },
    { "@type": "AdministrativeArea", name: "Manhattan" },
    { "@type": "AdministrativeArea", name: "Brooklyn" },
    { "@type": "AdministrativeArea", name: "Queens" },
    { "@type": "AdministrativeArea", name: "The Bronx" },
    { "@type": "AdministrativeArea", name: "Staten Island" },
  ],
  priceRange: "$$",
  logo: "https://littlefightnyc.com/apple-touch-icon.png",
  image: "https://littlefightnyc.com/images/og-image.jpg",
};

const nav = `<nav role="navigation" aria-label="Main navigation"><div class="nav-bg"></div><div class="nav-container"><a href="/" class="nav-brand"><div class="logo"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="28" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="24" letter-spacing="-1">LITTLE</text><text x="50" y="56" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="26" letter-spacing="-1">FIGHT</text><text x="50" y="82" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="24" letter-spacing="-1">NYC</text></svg></div><div class="nav-brand-text"><span class="nav-brand-name">Little Fight NYC</span><span class="nav-brand-tagline">Local Business Advantage</span></div></a><div class="nav-links" id="nav-links"><a href="/business-systems/">Save Money</a><a href="/websites/">Websites</a><a href="/it-support/">IT Support</a><a href="/local-search/">Get Found</a><a href="/answers/">Answers</a><a href="/software-guides/">Guides</a><a href="/work/">Work</a><a href="/fit-check/">Start Here</a></div><div class="nav-right"><a href="tel:+16463600318" class="nav-phone"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg><span class="nav-phone-dot"></span>(646) 360-0318</a><div class="nav-divider"></div><a href="/fit-check/" class="nav-cta-btn">Start Here &rarr;</a><button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button></div></div></nav>`;

const footer = `<footer role="contentinfo"><div class="footer-grid"><div class="footer-column"><div class="footer-logo"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="28" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="24" letter-spacing="-1">LITTLE</text><text x="50" y="56" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="26" letter-spacing="-1">FIGHT</text><text x="50" y="82" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="24" letter-spacing="-1">NYC</text></svg></div><h3>Little Fight NYC</h3><p>Better tech. Fewer bills. More customers.</p><p>Built for New York businesses that cannot waste time or money.</p></div><div class="footer-column"><h3>How We Help</h3><ul><li><a href="/nyc-websites-it-support/">NYC Websites and IT</a></li><li><a href="/business-systems/">Save Money</a></li><li><a href="/websites/">Websites</a></li><li><a href="/it-support/">IT Support</a></li><li><a href="/local-search/">Get Found</a></li><li><a href="/answers/">Owner Answers</a></li><li><a href="/software-guides/">Software Guides</a></li><li><a href="/software-cost-calculator/">Cost Calculator</a></li><li><a href="/pricing/">Pricing</a></li></ul></div><div class="footer-column"><h3>Company</h3><ul><li><a href="/about/">About</a></li><li><a href="/work/">Work</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/industries/">Industries</a></li><li><a href="/solutions/">Method</a></li><li><a href="/fit-check/">Start Here</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy/">Privacy Policy</a></li><li><a href="/terms/">Terms</a></li></ul></div><div class="footer-column"><h3>Contact</h3><ul><li><a href="tel:+16463600318" style="color:#fe5800;font-weight:700">(646) 360-0318</a></li><li><a href="mailto:hello@littlefightnyc.com" style="color:#fe5800;font-weight:700">hello@littlefightnyc.com</a></li></ul><p style="color:#8a8ea0;font-size:13px;margin-top:8px">New York City<br>Websites, IT support, and practical systems</p></div></div><div class="footer-bottom"><p>&copy; 2026 Little Fight NYC. Built in New York for local businesses with bills to lower and customers to win.</p><p style="margin-top:8px"><a href="https://littlefightnyc.com">Designed, hosted, and cared for by LittleFightNYC.com</a></p></div></footer>`;

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function head(page, schema) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="/js/lifi-tracking.min.js" defer data-ga4-id="G-0Q1TGWH0HL"></script>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="author" content="David Marsh">
  <link rel="canonical" href="${page.url}">
  <meta property="og:type" content="${page.ogType || "website"}">
  <meta property="og:title" content="${escapeHtml(page.ogTitle || page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${page.url}">
  <meta property="og:image" content="https://littlefightnyc.com/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.ogTitle || page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="https://littlefightnyc.com/images/og-image.jpg">
  <meta name="theme-color" content="#080b14">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/css/lifi-shared-page.min.css">
  <link rel="stylesheet" href="/css/lifi-motion-polish.css?v=20260325a">
  <link rel="stylesheet" href="/css/lifi-animations.css">
  <link rel="stylesheet" href="/css/lifi-core.css">
  <link rel="stylesheet" href="/css/lifi-nav-footer.css">
  <link rel="stylesheet" href="/css/lifi-dark-theme.css">
  <link rel="stylesheet" href="/css/lifi-overhaul.css?v=${cssVersion}">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>`;
}

function shell(page, schema, body) {
  return `${head(page, schema)}
<body>
${nav}
<main id="main-content">
${body}
</main>
${footer}
<script src="/js/main.min.js?v=20260505d" defer></script>
<script src="/js/reveal.js" defer></script>
</body>
</html>`;
}

function breadcrumb(url, items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function faqSchema(items) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function pageGraph(page, extra = []) {
  const publisher = {
    "@type": "Organization",
    name: "Little Fight NYC",
    url: "https://littlefightnyc.com/",
    logo: "https://littlefightnyc.com/apple-touch-icon.png",
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      localBusiness,
      {
        "@type": page.article ? "Article" : "WebPage",
        "@id": `${page.url}#webpage`,
        url: page.url,
        headline: page.article ? page.title : undefined,
        name: page.title,
        description: page.description,
        datePublished: today,
        dateModified: today,
        author: { "@type": "Person", name: "David Marsh", url: "https://littlefightnyc.com/about/" },
        publisher,
        image: "https://littlefightnyc.com/images/og-image.jpg",
        isPartOf: page.article ? undefined : { "@id": "https://littlefightnyc.com/#website" },
      },
      ...extra,
    ],
  };
}

function faqMarkup(items) {
  return `<section class="overhaul-section tight"><div class="container"><p class="overhaul-kicker">Fast answers</p><h2 class="overhaul-title sm">Questions owners ask next.</h2><div class="faq-list">${items
    .map(
      (item) =>
        `<div class="faq-item"><button class="faq-question" aria-expanded="false">${item.q} <span class="faq-icon" aria-hidden="true"><i class="mdi mdi-chevron-down"></i></span></button><div class="faq-answer"><div class="faq-answer-content">${item.a}</div></div></div>`,
    )
    .join("")}</div></div></section>`;
}

const answers = [
  {
    slug: "website-form-not-working-small-business",
    category: "Website help",
    title: "Website Form Not Working? Small Business Fix Guide",
    description: "What to check when a small business website form stops sending leads, from form settings and spam folders to DNS and inbox routing.",
    h1: "Website form not working?",
    deck: "Start with the simple stuff before blaming the whole website.",
    answer:
      "If a website form is not sending leads, first test the form yourself, check the notification email, look in spam, confirm the form destination, and make sure the domain email records are healthy. If leads are actively missing, treat it as urgent because the business may be losing customers without seeing it.",
    checks: ["Submit a test lead from mobile and desktop.", "Check spam, promotions, and any shared inbox rules.", "Confirm the form recipient and reply-to settings.", "Check domain email records if the inbox rejects mail.", "Add a backup lead log so submissions are not only sent by email."],
    moneyLeak: "Lost form submissions are silent. The customer thinks they reached you. The business never sees the lead.",
    keep: "Keep the current site if the page and offer still work.",
    connect: "Connect the form to email and a simple lead log.",
    replace: "Replace form plugins or widgets that fail quietly.",
    build: "Build a backup lead capture path with owner notification.",
    cta: "If customers say they filled out the form and nobody got it, call or start a Fit Check.",
    links: [["/websites/", "Website help"], ["/fit-check/", "Start a Fit Check"], ["/answers/connect-website-form-to-crm/", "Connect forms to a lead list"]],
  },
  {
    slug: "business-not-showing-on-google-maps",
    category: "Google help",
    title: "Why Is My Business Not Showing on Google Maps?",
    description: "Plain-English reasons a local business may not show on Google Maps and what to fix first in Google profile, website, reviews, and categories.",
    h1: "Not showing on Google Maps?",
    deck: "Usually it is not one mystery. It is a trust trail Google cannot read clearly.",
    answer:
      "If your business is not showing on Google Maps, check whether the Google Business Profile is verified, the category is right, the address or service area is accurate, reviews are active, and the website clearly supports the services and neighborhood you want to rank for.",
    checks: ["Confirm the profile is verified and not suspended.", "Check primary and secondary categories.", "Match name, phone, website, and service area across the web.", "Add service pages that match real customer searches.", "Keep reviews coming in naturally and consistently."],
    moneyLeak: "If competitors show before you, customers may never compare your better service.",
    keep: "Keep a good Google profile with real photos and reviews.",
    connect: "Connect Google profile services to matching website pages.",
    replace: "Replace vague website pages that do not mention the real service.",
    build: "Build neighborhood and service answers customers actually search.",
    cta: "Start with local search help if Google is where customers should find you.",
    links: [["/local-search/", "Local search help"], ["/answers/google-business-profile-suspended-nyc/", "Profile suspended?"], ["/fit-check/", "Start a Fit Check"]],
  },
  {
    slug: "small-business-website-cost-nyc",
    category: "Website costs",
    title: "How Much Should a Small Business Website Cost in NYC?",
    description: "A plain-English guide to small business website cost in NYC and what changes the price: pages, copy, booking, e-commerce, SEO, and support.",
    h1: "What should a small business website cost in NYC?",
    deck: "Enough to make customers trust you. Not enough to fund someone else's sales deck.",
    answer:
      "A small business website in NYC can be a focused cleanup, a full rebuild, or a larger website plus booking, payment, local search, and lead tracking setup. The right price depends on what the site has to do, what already works, and whether the problem is really the website or the system behind it.",
    checks: ["How many real customer actions does the site need?", "Does the copy explain the offer clearly?", "Do forms, booking, and payments work?", "Does Google understand the services and neighborhood?", "Who updates the site after launch?"],
    moneyLeak: "A cheap site that loses customers is expensive. A large build when one page needs fixing is expensive too.",
    keep: "Keep pages, photos, tools, and brand pieces that still earn trust.",
    connect: "Connect calls, forms, booking, payments, and lead tracking.",
    replace: "Replace unclear copy, weak mobile layouts, and dead-end CTAs.",
    build: "Build only the pages and paths customers need to act.",
    cta: "Use a Fit Check before paying for a rebuild you may not need.",
    links: [["/websites/", "Website services"], ["/pricing/", "Starting points"], ["/software-cost-calculator/", "Cost calculator"]],
  },
  {
    slug: "reduce-monthly-software-costs-small-business",
    category: "Software savings",
    title: "How Can a Small Business Reduce Monthly Software Costs?",
    description: "How small businesses can find software waste, cut duplicate tools, connect what works, and avoid paying monthly for features nobody uses.",
    h1: "Paying too much for software?",
    deck: "The monthly bill is only the obvious part.",
    answer:
      "To reduce monthly software costs, list every tool, who uses it, what job it does, what data lives inside it, and what staff still do outside the tool. Then keep the tools that earn their place, connect useful tools that sit alone, replace duplicate or oversized subscriptions, and build small missing pieces where cheaper tools cannot fit the workflow.",
    checks: ["List monthly and annual subscriptions.", "Ask staff what they actually use.", "Find duplicate tools doing the same job.", "Find manual work still happening outside paid software.", "Compare the three-year cost against a smaller custom setup."],
    moneyLeak: "A tool can be good and still be wrong for your business.",
    keep: "Keep software your team uses every day.",
    connect: "Connect tools that work but do not share the right information.",
    replace: "Replace oversized subscriptions with smaller fit-for-purpose tools.",
    build: "Build lightweight dashboards or workflows when the paid platform is mostly unused.",
    cta: "Start with the software cost calculator or Fit Check.",
    links: [["/business-systems/", "Save money"], ["/software-cost-calculator/", "Cost calculator"], ["/software-guides/custom-business-system-vs-saas-subscriptions/", "Custom vs SaaS"]],
  },
  {
    slug: "square-vs-toast-nyc-restaurant-pos",
    category: "Restaurant tools",
    title: "Square vs Toast for NYC Restaurants: Fast Answer",
    description: "Square vs Toast for NYC restaurants, bars, and cafes: when each POS fits, what to watch, what costs can creep up, and how to avoid overpaying.",
    h1: "Square or Toast for a NYC restaurant?",
    deck: "Pick the register that fits the room, not the sales pitch.",
    answer:
      "Square can fit smaller restaurants, cafes, bars, pop-ups, and simpler operations that need quick setup and flexible payments. Toast can fit more restaurant-heavy operations with complex menus, kitchen workflows, staff roles, and reporting. The right choice depends on volume, service style, hardware, integrations, and how much the team will actually use.",
    checks: ["What happens during the busiest hour?", "Do orders need kitchen routing?", "How many stations and staff roles are involved?", "What reporting does the owner actually read?", "What is the full monthly and hardware cost?"],
    moneyLeak: "The wrong POS slows the line and keeps charging after the rush ends.",
    keep: "Keep the POS if staff trust it and it handles the room.",
    connect: "Connect online ordering, deposits, forms, and reporting where needed.",
    replace: "Replace a POS that breaks service or costs too much for unused features.",
    build: "Build a lighter owner view if the POS has data but not clarity.",
    cta: "Read the full Square vs Toast guide or start with a tool review.",
    links: [["/software-guides/square-vs-toast-manhattan-restaurants/", "Full Square vs Toast guide"], ["/services/pos-and-register-setup-nyc/", "POS setup"], ["/fit-check/", "Tool review"]],
  },
  {
    slug: "best-booking-software-nyc-salons",
    category: "Salon booking",
    title: "Best Booking Software for NYC Salons: Plain Answer",
    description: "How NYC salons should choose booking software without overpaying: Square Appointments, GlossGenius, Fresha, Boulevard, Mindbody, and more.",
    h1: "Best booking software for a NYC salon?",
    deck: "The best tool is the one clients use and staff do not fight.",
    answer:
      "For many small NYC salons, Square Appointments or GlossGenius can be enough if booking, payments, reminders, and simple client records are the core need. Larger salons may need deeper staff calendars, deposits, memberships, inventory, or reporting. The best choice is the one that reduces missed appointments and admin work without adding a bill nobody understands.",
    checks: ["How many stylists or providers need calendars?", "Do deposits, cancellation rules, or memberships matter?", "Do clients book from Instagram, Google, or the website?", "What reminders prevent no-shows?", "What data does the owner need weekly?"],
    moneyLeak: "A booking tool that does not match staff behavior creates more front-desk work.",
    keep: "Keep a booking tool clients already use easily.",
    connect: "Connect booking from site, Google, Instagram, reminders, and follow-up.",
    replace: "Replace tools that charge for features the salon does not use.",
    build: "Build a simple lead and rebooking view if the tool does not show what matters.",
    cta: "Compare the salon booking guide before switching platforms.",
    links: [["/software-guides/square-appointments-vs-glossgenius-nyc-salons/", "Salon booking guide"], ["/industries/salons-wellness/", "Salon systems"], ["/fit-check/", "Start a Fit Check"]],
  },
  {
    slug: "connect-website-form-to-crm",
    category: "Lead capture",
    title: "How Do I Connect Website Forms to a CRM?",
    description: "A simple guide to connecting website forms to a CRM, spreadsheet, inbox, or dashboard so small business leads stop disappearing.",
    h1: "How do you connect a website form to a CRM?",
    deck: "Start with where the lead should live, not the fanciest tool.",
    answer:
      "To connect a website form to a CRM, decide what information the business needs, send every submission into one lead record, notify the right person, and create a follow-up status. The CRM can be a real CRM, Airtable, a spreadsheet, or a simple dashboard if that is what the team will actually use.",
    checks: ["What fields are truly needed to follow up?", "Who should get notified first?", "Where should the lead live after the email is sent?", "What statuses show whether follow-up happened?", "What backup exists if email fails?"],
    moneyLeak: "A form-to-email setup is not lead tracking. It is just a message that can get lost.",
    keep: "Keep the form if customers understand it.",
    connect: "Connect submissions to a lead table and owner notification.",
    replace: "Replace forms that fail silently or ask too much.",
    build: "Build a simple lead dashboard with status and source.",
    cta: "Start with a Fit Check if leads are scattered across email, phone, and DMs.",
    links: [["/business-systems/", "Lead systems"], ["/answers/website-form-not-working-small-business/", "Form not working"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "replace-spreadsheet-with-business-dashboard",
    category: "Dashboards",
    title: "When Should a Small Business Replace a Spreadsheet?",
    description: "When a small business spreadsheet should become a dashboard, CRM, or lightweight workflow instead of another fragile manual process.",
    h1: "When should a spreadsheet become a dashboard?",
    deck: "When the sheet is now the business memory.",
    answer:
      "A spreadsheet should become a dashboard or lightweight workflow when staff enter the same information twice, nobody trusts the latest version, follow-up gets missed, or one person has to remember what every row means. The goal is not to shame spreadsheets. The goal is to stop using them for jobs they were never meant to hold alone.",
    checks: ["Does more than one person update it?", "Are rows tied to revenue, leads, jobs, or customer promises?", "Does anyone know which version is right?", "Is follow-up based on memory?", "Would status, alerts, and filters save owner time?"],
    moneyLeak: "A spreadsheet becomes expensive when it hides work until something is late.",
    keep: "Keep spreadsheet thinking if it helps the team understand the work.",
    connect: "Connect forms, tasks, status, and notifications.",
    replace: "Replace manual copy-paste and unclear ownership.",
    build: "Build a simple dashboard that shows open loops.",
    cta: "Use a systems Fit Check before buying a giant platform.",
    links: [["/business-systems/", "Business systems"], ["/software-guides/airtable-vs-notion-vs-monday-small-business/", "Airtable vs Notion vs Monday"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "pos-system-keeps-freezing",
    category: "IT support",
    title: "POS System Keeps Freezing? What to Check First",
    description: "What small businesses should check when a POS system freezes: Wi-Fi, hardware, updates, printers, payments, and vendor lock-in.",
    h1: "POS keeps freezing?",
    deck: "Do not wait until the line is staring at you.",
    answer:
      "If a POS keeps freezing, check the network, device health, software updates, payment reader, printer connection, and whether the issue happens at certain times or stations. If it affects customers or payments right now, treat it as urgent support first and a deeper setup review second.",
    checks: ["Does it happen on one device or every station?", "Does Wi-Fi drop at the same time?", "Are printers or card readers involved?", "Did an update or hardware change happen recently?", "Is the team using workarounds during rush?"],
    moneyLeak: "A frozen register turns technology into a line of impatient customers.",
    keep: "Keep the POS if the core platform fits the business.",
    connect: "Connect hardware, network, and payment pieces correctly.",
    replace: "Replace failing devices or setups that break repeatedly.",
    build: "Build a support checklist so staff know what to do first.",
    cta: "Call if payments or service are affected now.",
    links: [["/it-support/", "IT support"], ["/services/pos-and-register-setup-nyc/", "POS setup"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "business-email-not-working",
    category: "Email help",
    title: "Business Email Not Working? Small Business Checklist",
    description: "A simple checklist for business email problems: DNS, Google Workspace, Microsoft 365, spam, domain records, and account access.",
    h1: "Business email not working?",
    deck: "Email is boring until money stops moving.",
    answer:
      "If business email is not working, check whether sending, receiving, login, or only form notifications are affected. Then inspect account access, domain DNS records, spam settings, storage limits, billing, and whether Google Workspace or Microsoft 365 is configured correctly.",
    checks: ["Can you send email?", "Can you receive email?", "Is one account affected or the whole domain?", "Are website forms failing too?", "Were DNS, billing, or admin settings changed recently?"],
    moneyLeak: "Email problems can look small while leads, invoices, bookings, and staff access pile up behind the scenes.",
    keep: "Keep the email platform if ownership and records are clean.",
    connect: "Connect forms and notifications to a reliable inbox path.",
    replace: "Replace risky forwarding chains and old account ownership.",
    build: "Build a clean admin handoff and recovery path.",
    cta: "Call if email is actively blocking customers or staff.",
    links: [["/it-support/", "IT support"], ["/answers/domain-dns-help-small-business/", "DNS help"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "domain-dns-help-small-business",
    category: "Domain help",
    title: "Domain and DNS Help for Small Business Owners",
    description: "Plain-English domain and DNS help for small business owners dealing with email, websites, forms, ownership, redirects, and launch issues.",
    h1: "Domain or DNS problem?",
    deck: "This is the invisible plumbing. It still decides whether people can reach you.",
    answer:
      "A domain or DNS issue can break a website, email, forms, redirects, or verification. The first step is to confirm who owns the domain, where DNS is hosted, what records changed, and which service stopped working.",
    checks: ["Who owns the domain account?", "Where are DNS records managed?", "What service is broken: website, email, forms, or verification?", "Was anything changed before the issue started?", "Is there safe access without sharing passwords in the intake?"],
    moneyLeak: "When DNS is wrong, the business can look closed online even when the doors are open.",
    keep: "Keep the domain and provider if access is clean.",
    connect: "Connect DNS records to website, email, analytics, and verification.",
    replace: "Replace old vendors or inaccessible accounts when ownership is risky.",
    build: "Build a safe access and recovery record for the business.",
    cta: "Do not share sensitive information on the call. David can explain safe access if needed.",
    links: [["/it-support/", "IT support"], ["/answers/business-email-not-working/", "Email help"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "google-business-profile-suspended-nyc",
    category: "Google profile",
    title: "Google Business Profile Suspended in NYC? What Now",
    description: "What to do if a Google Business Profile is suspended: check accuracy, category, address, documents, website match, and appeal path.",
    h1: "Google profile suspended?",
    deck: "Do not panic-click through it. Get the facts clean first.",
    answer:
      "If a Google Business Profile is suspended, check the suspension reason, business name, category, address or service area, website match, phone, documents, and whether any recent edit triggered the issue. A rushed appeal with messy information can make recovery harder.",
    checks: ["Was the profile recently edited?", "Does the business name match real-world signage and website?", "Is the address or service area accurate?", "Are categories appropriate?", "Do you have documents or proof ready?"],
    moneyLeak: "A suspended profile can remove a business from the exact searches customers use when they are ready to act.",
    keep: "Keep accurate real-world business information.",
    connect: "Connect website, phone, services, and profile details.",
    replace: "Replace keyword-stuffed names or confusing categories.",
    build: "Build a clean appeal packet before submitting.",
    cta: "Start a local visibility Fit Check if Maps visibility matters.",
    links: [["/local-search/", "Local search"], ["/answers/business-not-showing-on-google-maps/", "Maps help"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "local-pharmacy-website-community-support",
    category: "Pharmacy websites",
    title: "Local Pharmacy Website Help for Community Trust",
    description: "How local pharmacies can use a clearer website and Google presence to support their community, answer common questions, and compete locally.",
    h1: "How can a local pharmacy compete online?",
    deck: "By making trust easier to see before the customer walks in.",
    answer:
      "A local pharmacy website should clearly show services, hours, insurance basics, refill paths, delivery or pickup options, phone number, neighborhood, and trust signals. The goal is not a giant app. It is helping the community find reliable answers and choose the local pharmacy over a faceless chain.",
    checks: ["Are services clear without calling first?", "Are hours, phone, address, and refill steps obvious?", "Does Google show accurate information?", "Can older or busy customers find what they need fast?", "Are community services explained in plain language?"],
    moneyLeak: "If the website does not show what the pharmacy does, customers assume the chain is easier.",
    keep: "Keep local trust, staff knowledge, and community service.",
    connect: "Connect website, Google profile, phone, refill path, and reviews.",
    replace: "Replace thin pages that say less than the storefront sign.",
    build: "Build service pages for the questions customers already ask.",
    cta: "Start with a website and local search Fit Check for pharmacy visibility.",
    links: [["/websites/", "Website help"], ["/local-search/", "Google visibility"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "hair-salon-save-money-software",
    category: "Salon savings",
    title: "How Can a Hair Salon Save Money on Software?",
    description: "How hair salons can reduce software costs by reviewing booking, payments, reminders, customer records, marketing, and staff workarounds.",
    h1: "How can a hair salon save money on software?",
    deck: "Stop paying for a beauty empire if you need a clean chair schedule.",
    answer:
      "A hair salon can save money by comparing booking, payments, reminders, client records, marketing, and reporting against what the staff actually uses. If the salon pays for advanced features but still handles follow-up manually, the expensive tool may need connecting, replacing, or a smaller system around it.",
    checks: ["What does the booking tool cost per month?", "Are deposits and reminders reducing no-shows?", "Do staff actually use client notes?", "Are rebooking and follow-up visible?", "Is marketing handled by the tool or somewhere else?"],
    moneyLeak: "Salon software gets expensive when it charges like a platform but works like a calendar.",
    keep: "Keep easy booking and payment flows clients already trust.",
    connect: "Connect website, Google, Instagram, booking, reminders, and rebooking.",
    replace: "Replace tools that cost too much for basic scheduling.",
    build: "Build a small owner view for leads, rebooking, and follow-up.",
    cta: "Compare booking tools before switching.",
    links: [["/industries/salons-wellness/", "Salon systems"], ["/software-guides/square-appointments-vs-glossgenius-nyc-salons/", "Booking guide"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "restaurant-website-booking-payments",
    category: "Restaurant websites",
    title: "Restaurant Website, Booking, and Payments Checklist",
    description: "What a restaurant website needs to handle menus, reservations, ordering, deposits, calls, Google visibility, and customer trust.",
    h1: "What should a restaurant website actually do?",
    deck: "Make people hungry, informed, and able to act.",
    answer:
      "A restaurant website should show the menu, hours, address, phone, reservation or ordering path, private event details if relevant, payment or deposit rules, accessibility basics, and Google-friendly service information. The site should not make customers hunt while they are deciding where to spend money.",
    checks: ["Can customers find the menu in one tap?", "Can they reserve, order, call, or get directions quickly?", "Does Google understand cuisine, neighborhood, and services?", "Are private events or catering explained?", "Do deposits, ordering, and payments connect cleanly?"],
    moneyLeak: "A restaurant can spend on ads and still lose customers at the menu, reservation, or payment step.",
    keep: "Keep real photos, personality, menu clarity, and direct contact.",
    connect: "Connect website, Google, reservations, orders, deposits, and analytics.",
    replace: "Replace PDF-only menus or confusing third-party dead ends.",
    build: "Build clean event, catering, or service pages when they drive revenue.",
    cta: "Start with restaurant website or POS help if the path leaks.",
    links: [["/industries/restaurants-bars/", "Restaurant systems"], ["/software-guides/square-vs-toast-manhattan-restaurants/", "POS guide"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "service-business-lead-tracking-nyc",
    category: "Lead tracking",
    title: "Lead Tracking for NYC Service Businesses",
    description: "How NYC service businesses can track leads from Google, phone, forms, Instagram, referrals, and email without a bloated CRM.",
    h1: "How should a service business track leads?",
    deck: "Every lead needs a place to land and a next step.",
    answer:
      "A service business should track where the lead came from, what the customer needs, who owns follow-up, current status, next action, and value if known. The system can be simple. The important part is that website forms, phone calls, Google, referrals, and DMs do not all disappear into different corners.",
    checks: ["Where do leads come from now?", "Who follows up first?", "What status shows whether the lead is alive?", "What gets forgotten?", "What does the owner need to see weekly?"],
    moneyLeak: "More leads do not help if follow-up depends on memory.",
    keep: "Keep channels that bring real customers.",
    connect: "Connect Google, website forms, phone notes, email, and referrals into one view.",
    replace: "Replace scattered lists and inbox-only tracking.",
    build: "Build a lightweight lead dashboard with source and status.",
    cta: "Start with a lead tracking Fit Check.",
    links: [["/business-systems/", "Business systems"], ["/answers/connect-website-form-to-crm/", "Form to CRM"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "shopify-vs-squarespace-local-retail",
    category: "Retail websites",
    title: "Shopify vs Squarespace for Local Retail Shops",
    description: "Shopify vs Squarespace for local retail: when a shop needs inventory and online selling versus a simpler website with clear local trust.",
    h1: "Shopify or Squarespace for a local shop?",
    deck: "It depends whether the website is a storefront, a catalog, or a cash register.",
    answer:
      "Shopify is usually stronger when online selling, inventory, pickup, shipping, and product operations matter. Squarespace can fit local shops that mainly need a polished website, light commerce, events, services, or brand trust. The right choice depends on how much of the business actually runs through online sales.",
    checks: ["How many products need inventory?", "Is online checkout a real sales channel?", "Do pickup, shipping, or variants matter?", "Who updates products?", "Does the shop need content, events, or local pages more than commerce?"],
    moneyLeak: "A store can overpay for commerce tools when customers mostly need trust, hours, and a reason to visit.",
    keep: "Keep the platform if updates are easy and sales happen.",
    connect: "Connect products, Google, email, pickup, and customer follow-up.",
    replace: "Replace platforms that are too hard for the team to maintain.",
    build: "Build local landing pages around profitable categories or neighborhoods.",
    cta: "Read the full retail platform guide before rebuilding.",
    links: [["/software-guides/shopify-vs-squarespace-nyc-retail/", "Full retail guide"], ["/industries/retail-ecommerce/", "Retail systems"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "webflow-vs-squarespace-small-business",
    category: "Website platforms",
    title: "Webflow vs Squarespace for Small Business Websites",
    description: "Webflow vs Squarespace for small business websites: when each platform fits, what owners should watch, and what impacts local search.",
    h1: "Webflow or Squarespace?",
    deck: "Choose the platform around updates, trust, and customer action.",
    answer:
      "Squarespace can fit small businesses that need a clean site, fast setup, simple updates, and modest customization. Webflow can fit businesses that need more custom design, stronger structure, richer landing pages, or a more flexible marketing site. The platform matters less than whether the site explains the business and captures the lead.",
    checks: ["Who updates the site after launch?", "Does the business need custom layouts or simple edits?", "How many service pages are needed?", "Do forms, booking, and analytics work?", "Does the platform support local search cleanly?"],
    moneyLeak: "The wrong website platform costs money every time a simple update becomes a project.",
    keep: "Keep the platform if the owner can maintain it and customers act.",
    connect: "Connect forms, booking, analytics, Google profile, and follow-up.",
    replace: "Replace platforms that block updates, speed, or clear page structure.",
    build: "Build a page system that can grow without turning messy.",
    cta: "Read the full Webflow vs Squarespace guide.",
    links: [["/software-guides/webflow-vs-squarespace-manhattan-small-business/", "Full website platform guide"], ["/websites/", "Website services"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "when-custom-business-system-beats-saas",
    category: "Custom vs SaaS",
    title: "When Does a Custom Business System Beat SaaS?",
    description: "When small businesses should use off-the-shelf software and when a lighter custom system may beat another expensive SaaS subscription.",
    h1: "When does custom beat another subscription?",
    deck: "Not always. But sometimes the math gets loud.",
    answer:
      "A custom or lightweight business system may beat SaaS when the business only uses a small part of an expensive platform, staff keep working around the software, data lives in too many places, and the same manual workflow happens every week. SaaS still wins when the workflow is standard, compliance is high, support is mature, and the team uses most of the tool.",
    checks: ["What is the three-year subscription cost?", "What work still happens outside the platform?", "How many seats are paid for but barely used?", "Does the workflow need a platform or one clean path?", "Would a smaller build reduce admin hours?"],
    moneyLeak: "The real cost is subscription plus staff time plus lost visibility.",
    keep: "Keep SaaS when it solves the job well.",
    connect: "Connect the good tool to missing lead, task, or reporting paths.",
    replace: "Replace oversized platforms when smaller tools do the job.",
    build: "Build the missing workflow if standard tools keep forcing workarounds.",
    cta: "Use the calculator before another annual contract renews.",
    links: [["/software-guides/custom-business-system-vs-saas-subscriptions/", "Custom vs SaaS guide"], ["/software-cost-calculator/", "Cost calculator"], ["/business-systems/", "Business systems"]],
  },
  {
    slug: "urgent-it-support-small-business-nyc",
    category: "Urgent support",
    title: "Urgent IT Support for NYC Small Business",
    description: "When NYC small businesses should treat an IT problem as urgent, including website, email, booking, payments, POS, and account access issues.",
    h1: "Is this urgent IT support?",
    deck: "If customers, staff, payments, or access are blocked, yes.",
    answer:
      "A small business IT issue is urgent when it affects customers, payments, bookings, email, website access, POS, staff access, or account ownership right now. The first move is to stabilize the immediate problem, then decide whether the visible break is part of a larger setup issue.",
    checks: ["Are customers unable to buy, book, call, or contact you?", "Are staff unable to access core tools?", "Are payments, POS, or booking affected?", "Is email or the website down?", "Is this one issue or a repeat problem?"],
    moneyLeak: "Urgent tech issues cost more the longer staff invent workarounds.",
    keep: "Keep the tools that can be stabilized quickly.",
    connect: "Connect the broken piece back to the daily workflow.",
    replace: "Replace failing devices, plugins, or brittle account chains when needed.",
    build: "Build a prevention checklist after the fire is out.",
    cta: "If it is active, call Little Fight now.",
    links: [["/it-support/", "IT support"], ["tel:+16463600318", "Call Little Fight"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "google-business-profile-help-nyc-small-business",
    category: "Google profile",
    title: "Google Business Profile Help for NYC Small Business",
    description: "Google Business Profile help for NYC small businesses: categories, services, photos, reviews, posts, website match, and local visibility.",
    h1: "What should a Google Business Profile include?",
    deck: "The profile should make the business easy to trust and easy to choose.",
    answer:
      "A strong Google Business Profile should have accurate categories, services, phone, website, hours, photos, service area or address, review activity, and details that match the website. The goal is to help Google and customers understand exactly what the business does and where it serves.",
    checks: ["Is the primary category accurate?", "Are services complete and plain-English?", "Do hours, phone, and website match everywhere?", "Are photos recent and real?", "Do website pages support the services listed?"],
    moneyLeak: "A weak profile can make a strong local business look invisible or uncertain.",
    keep: "Keep real reviews, photos, and accurate details.",
    connect: "Connect profile services to website service pages.",
    replace: "Replace vague categories, outdated photos, and mismatched phone or URL details.",
    build: "Build service and neighborhood pages that support the profile.",
    cta: "Start with local search help if Maps should bring customers.",
    links: [["/local-search/", "Local search"], ["/answers/business-not-showing-on-google-maps/", "Maps visibility"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "website-designer-disappeared-what-now",
    category: "Website rescue",
    title: "Website Designer Disappeared? What to Do Next",
    description: "What small businesses should do when a website designer disappears: domain access, hosting, admin accounts, files, backups, and safe recovery.",
    h1: "Website person disappeared?",
    deck: "First recover control. Then decide what is worth keeping.",
    answer:
      "If a website designer or vendor disappeared, first confirm who owns the domain, hosting, website admin, email, analytics, and payment accounts. Do not start a rebuild until the business knows what it controls and what can be recovered.",
    checks: ["Who owns the domain login?", "Where is the website hosted?", "Who has admin access?", "Are backups available?", "What accounts are tied to the old vendor's email?"],
    moneyLeak: "A missing vendor can turn a simple update into a forced rebuild.",
    keep: "Keep content, photos, pages, domain, and tools that can be recovered.",
    connect: "Connect accounts to business-owned email and clean admin access.",
    replace: "Replace vendor-controlled hosting or risky login chains.",
    build: "Build a cleaner site only after control is clear.",
    cta: "Start with a recovery Fit Check before paying for a rebuild.",
    links: [["/websites/", "Website help"], ["/answers/domain-dns-help-small-business/", "Domain help"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "local-seo-for-neighborhood-businesses-nyc",
    category: "Local SEO",
    title: "Local SEO for NYC Neighborhood Businesses",
    description: "Local SEO for NYC neighborhood businesses: Google Maps, service pages, reviews, neighborhoods, photos, FAQs, and clear website proof.",
    h1: "What matters for local SEO in NYC?",
    deck: "Show Google and customers why this business fits this search in this place.",
    answer:
      "Local SEO in NYC depends on a clean Google profile, accurate business information, strong service pages, neighborhood relevance, reviews, useful photos, internal links, and a website that answers buyer questions clearly. It is less about tricks and more about making the real business easier to understand.",
    checks: ["Does each important service have a useful page?", "Does the site mention real neighborhoods only when relevant?", "Are reviews active and natural?", "Are FAQs visible on the page?", "Does the contact path match Google profile details?"],
    moneyLeak: "A business can be nearby, trusted, and still lose because the web cannot prove it fast enough.",
    keep: "Keep real local proof and customer language.",
    connect: "Connect Google profile, service pages, reviews, and answer content.",
    replace: "Replace thin pages that only repeat city names.",
    build: "Build useful neighborhood and service answers over time.",
    cta: "Start with local search if Google should drive customers.",
    links: [["/local-search/", "Local search"], ["/answers/google-business-profile-help-nyc-small-business/", "Google profile help"], ["/fit-check/", "Start Here"]],
  },
  {
    slug: "small-business-ai-tools-worth-it",
    category: "AI tools",
    title: "Are AI Tools Worth It for Small Businesses?",
    description: "When AI tools are useful for small businesses and when they become another distracting subscription instead of real operational help.",
    h1: "Are AI tools worth it for a small business?",
    deck: "Only when they save real work, not when they add another tab.",
    answer:
      "AI tools can be useful for drafting replies, summarizing leads, sorting intake, planning content, and reducing admin work. They are not worth it when nobody owns the workflow, outputs are not reviewed, or the tool creates another monthly bill without a clear job.",
    checks: ["What exact task should AI reduce?", "Who reviews the output?", "Where does the AI result go next?", "Does it save staff time every week?", "Can the business avoid sensitive data exposure?"],
    moneyLeak: "AI becomes expensive when it is bought as magic instead of placed inside a real workflow.",
    keep: "Keep AI use cases that save time safely.",
    connect: "Connect AI output to intake, follow-up, drafts, or notes.",
    replace: "Replace generic AI subscriptions that nobody uses.",
    build: "Build AI-assisted steps only where human review stays clear.",
    cta: "Start with a workflow Fit Check before adding AI tools.",
    links: [["/business-systems/", "Business systems"], ["/fit-check/", "Start Here"], ["/answers/service-business-lead-tracking-nyc/", "Lead tracking"]],
  },
];

const caseStudies = [
  {
    slug: "neighborhood-pharmacy",
    type: "Neighborhood pharmacy",
    headline: "Making a local pharmacy easier to find and trust.",
    problem: "The business needed a clearer public path for services, hours, calls, and community trust without turning the site into a corporate portal.",
    kept: ["Local knowledge", "Phone-first customer habits", "Existing community trust"],
    connected: ["Website service pages", "Google profile details", "Calls and directions", "Review and trust signals"],
    replaced: ["Thin service explanations", "Generic local copy", "Dead-end customer paths"],
    built: ["A clearer service structure", "Plain-English answer sections", "Local visibility checklist"],
    changed: "Customers could understand what the pharmacy helps with before calling or walking in.",
    stack: "Static website, Google Business Profile, service pages, local schema, analytics",
  },
  {
    slug: "salon-booking-cleanup",
    type: "Salon and wellness studio",
    headline: "Cutting booking confusion before it becomes front-desk work.",
    problem: "Booking, services, reminders, and customer questions were scattered across the site, social channels, and daily staff memory.",
    kept: ["Working booking habits", "Existing client trust", "Visual brand cues"],
    connected: ["Service pages", "Booking links", "Google visibility", "Follow-up prompts"],
    replaced: ["Vague service copy", "Soft calls-to-action", "Unclear booking routes"],
    built: ["A simpler booking path", "Service decision copy", "Owner-facing follow-up notes"],
    changed: "The salon had a cleaner path from interest to booking without buying a larger platform first.",
    stack: "Website pages, Square/Appointments-style booking path, Google profile, analytics",
  },
  {
    slug: "restaurant-pos-path",
    type: "Restaurant and bar",
    headline: "Lining up the site, Google, POS, and guest action.",
    problem: "Customers needed fast answers: menu, hours, location, reservation, ordering, events, and payment details. The digital path had too many pauses.",
    kept: ["Brand warmth", "Existing POS/payment workflow", "Real room personality"],
    connected: ["Website actions", "Google profile", "Booking or ordering path", "Analytics"],
    replaced: ["Unclear buttons", "Weak service/event explanations", "Detached third-party links"],
    built: ["A tighter customer route", "Better event/private-party prompts", "POS and site review notes"],
    changed: "Customers had fewer decisions to make before calling, booking, or ordering.",
    stack: "Static website, Google Business Profile, POS links, booking/order paths, analytics",
  },
  {
    slug: "medical-wellness-visibility",
    type: "Medical and wellness practice",
    headline: "Turning a quiet website into a clearer trust surface.",
    problem: "The practice needed service clarity, local visibility, and a better route from search to inquiry without making regulated claims or fake proof.",
    kept: ["Professional tone", "Care standards", "Existing service expertise"],
    connected: ["Service pages", "FAQs", "Google profile signals", "Contact path"],
    replaced: ["Thin trust cues", "Unclear page hierarchy", "Missing answer-first sections"],
    built: ["Service explainers", "FAQ-backed pages", "Local search structure"],
    changed: "The site became easier for search engines and cautious patients to understand.",
    stack: "Website audit, service pages, FAQ schema, LocalBusiness schema, analytics",
  },
  {
    slug: "creative-studio-lead-flow",
    type: "Creative studio",
    headline: "Moving project interest out of inbox fog.",
    problem: "New inquiries, estimates, approvals, and follow-up details lived in too many places, making owner review slower than it needed to be.",
    kept: ["Studio language", "Owner review process", "Existing documents"],
    connected: ["Inquiry form", "Qualification notes", "Estimate draft", "Owner notification"],
    replaced: ["Manual copying", "Unclear lead status", "Scattered notes"],
    built: ["A lightweight intake path", "Lead status view", "Follow-up draft structure"],
    changed: "The owner could see what needed attention without hunting across messages.",
    stack: "Website form, Google Workspace, lead table, notification flow",
  },
  {
    slug: "retail-platform-fit",
    type: "Local retail shop",
    headline: "Choosing the smaller tool before the bigger bill.",
    problem: "The shop needed to decide whether the site was mainly a trust surface, product catalog, or e-commerce engine before committing to another monthly platform.",
    kept: ["Product photos", "Local customer trust", "Storefront identity"],
    connected: ["Website", "Google visibility", "Product or service pages", "Customer action"],
    replaced: ["Platform-first thinking", "Unclear online sales assumptions", "Unneeded software weight"],
    built: ["A platform decision matrix", "Simpler customer paths", "Cost review notes"],
    changed: "The business could choose based on actual sales behavior, not software marketing.",
    stack: "Shopify/Squarespace review, Google profile, service pages, analytics",
  },
];

const defaultSource = {
  href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
  label: "Google Search Central SEO Starter Guide",
};

const sourceByCategory = new Map([
  ["Google help", { href: "https://support.google.com/business/", label: "Google Business Profile Help" }],
  ["Google profile", { href: "https://support.google.com/business/", label: "Google Business Profile Help" }],
  ["Local SEO", { href: "https://developers.google.com/search/docs/appearance/ai-overviews", label: "Google guidance on AI features and websites" }],
  ["Restaurant tools", { href: "https://squareup.com/us/en/point-of-sale/restaurants", label: "Square for Restaurants" }],
  ["Salon booking", { href: "https://squareup.com/us/en/appointments", label: "Square Appointments" }],
  ["Salon savings", { href: "https://squareup.com/us/en/appointments", label: "Square Appointments" }],
  ["Retail websites", { href: "https://developers.google.com/search/docs/specialty/ecommerce", label: "Google ecommerce SEO guidance" }],
  ["Website platforms", { href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", label: "Google Search Central SEO Starter Guide" }],
  ["IT support", { href: "https://www.cisa.gov/audiences/small-and-medium-businesses", label: "CISA small and medium business cybersecurity resources" }],
  ["Email help", { href: "https://www.cisa.gov/audiences/small-and-medium-businesses", label: "CISA small and medium business cybersecurity resources" }],
  ["Domain help", { href: "https://www.cisa.gov/audiences/small-and-medium-businesses", label: "CISA small and medium business cybersecurity resources" }],
  ["Urgent support", { href: "https://www.cisa.gov/audiences/small-and-medium-businesses", label: "CISA small and medium business cybersecurity resources" }],
  ["AI tools", { href: "https://developers.google.com/search/docs/appearance/ai-overviews", label: "Google guidance on AI features and websites" }],
]);

function answerSchema(page, answer) {
  const questions = [
    { q: answer.h1, a: answer.answer },
    { q: "What should Little Fight check first?", a: answer.checks.join(" ") },
    { q: "What is the next best step?", a: answer.cta },
  ];
  return pageGraph(
    { ...page, article: true, ogType: "article" },
    [
      faqSchema(questions),
      breadcrumb(page.url, [
        { name: "Home", url: "https://littlefightnyc.com/" },
        { name: "Answers", url: "https://littlefightnyc.com/answers/" },
        { name: answer.h1, url: page.url },
      ]),
    ],
  );
}

function answerPage(answer, index) {
  const page = {
    title: answer.title,
    description: answer.description,
    url: `https://littlefightnyc.com/answers/${answer.slug}/`,
    ogType: "article",
  };
  const source = sourceByCategory.get(answer.category) || defaultSource;
  const previous = answers[(index - 1 + answers.length) % answers.length];
  const next = answers[(index + 1) % answers.length];

  const body = `<section class="page-hero overhaul-page-hero"><div class="container"><p class="overhaul-kicker">${answer.category}</p><h1 class="overhaul-title">${answer.h1}</h1><p class="overhaul-deck">${answer.deck}</p><div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="tel:+16463600318">Call if it is broken</a></div><div class="page-updated content-meta">By <a class="author" rel="author" href="/about/">David Marsh</a> · Published <time class="published" itemprop="datePublished" datetime="${today}">${displayDate}</time></div></div></section>
<article class="overhaul-section"><div class="container"><div class="pain-strip"><div><p class="overhaul-kicker">Direct answer</p><h2 class="overhaul-title sm">${answer.answer}</h2></div><ul class="mess-list">${answer.checks.map((item) => `<li>${item}</li>`).join("")}</ul></div></div></article>
<section class="overhaul-section method-band"><div class="container"><p class="overhaul-kicker">Money leak</p><h2 class="overhaul-title sm">${answer.moneyLeak}</h2><div class="overhaul-grid"><article class="method-step"><strong>Keep</strong><p>${answer.keep}</p></article><article class="method-step"><strong>Connect</strong><p>${answer.connect}</p></article><article class="method-step"><strong>Replace</strong><p>${answer.replace}</p></article><article class="method-step"><strong>Build</strong><p>${answer.build}</p></article></div></div></section>
<section class="overhaul-section tight"><div class="container"><p class="overhaul-kicker">Related paths</p><h2 class="overhaul-title sm">Go deeper from here.</h2><div class="overhaul-grid three">${answer.links.map(([href, label]) => `<article class="system-card"><h3><a href="${href}">${label}</a></h3><p>${href.startsWith("tel:") ? "Use this when the issue is actively blocking customers, payments, access, or staff." : "Open this next if that sounds like the problem behind the problem."}</p></article>`).join("")}</div></div></section>
<section class="overhaul-section tight"><div class="container"><p class="overhaul-kicker">More owner answers</p><h2 class="overhaul-title sm">Keep following the leak.</h2><div class="overhaul-grid three"><article class="system-card"><h3><a href="/answers/${previous.slug}/">${previous.h1}</a></h3><p>${previous.deck}</p></article><article class="system-card"><h3><a href="/answers/">All owner answers</a></h3><p>Open the full answer library for website, IT, Google, software, booking, payment, and lead questions.</p></article><article class="system-card"><h3><a href="/answers/${next.slug}/">${next.h1}</a></h3><p>${next.deck}</p></article></div></div></section>
<section class="overhaul-section tight"><div class="container"><p class="overhaul-kicker">Outside reference</p><h2 class="overhaul-title sm">Useful source to check next.</h2><p class="overhaul-deck">For a broader reference, see <a href="${source.href}" target="_blank" rel="noopener">${source.label}</a>.</p></div></section>
${faqMarkup([
    { q: answer.h1, a: answer.answer },
    { q: "What should I check first?", a: answer.checks.join(" ") },
    { q: "When should I call Little Fight?", a: answer.cta },
  ])}
<section class="overhaul-section tight"><div class="container"><div class="fit-check-band"><p class="overhaul-kicker">Next move</p><h2 class="overhaul-title sm">${answer.cta}</h2><p class="overhaul-deck">Tell us what is broken, expensive, slow, or hard to explain. We will find the smallest useful next step.</p><div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="/answers/">Back to answers</a></div></div></div></section>`;

  return shell(page, answerSchema(page, answer), body);
}

function answersHub() {
  const page = {
    title: "Small Business Tech Answers NYC | Little Fight NYC",
    description:
      "Plain-English answers for NYC small businesses dealing with websites, IT support, Google Maps, software costs, booking, payments, and lost leads.",
    url: "https://littlefightnyc.com/answers/",
  };
  const faqItems = [
    {
      q: "What is this answer hub for?",
      a: "It gives NYC small business owners fast, plain-English answers before they know whether they need website help, IT support, Google visibility, software savings, or a bigger workflow fix.",
    },
    {
      q: "Are these final quotes or diagnoses?",
      a: "No. These answers help place the problem. A human review is needed before scope, timeline, or pricing is confirmed.",
    },
    {
      q: "What should I do if something is broken right now?",
      a: "Call Little Fight if the issue is actively affecting customers, payments, bookings, email, website access, POS, or staff access.",
    },
  ];
  const body = `<section class="page-hero overhaul-page-hero"><div class="container"><p class="overhaul-kicker">Owner answers</p><h1 class="overhaul-title">Fast answers for expensive little problems.</h1><p class="overhaul-deck">Websites, Google, booking, payments, email, POS, software bills, and leads. Plain English first. Sales pitch never.</p><div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="tel:+16463600318">Call if it is broken</a></div><div class="page-updated content-meta">By <a class="author" rel="author" href="/about/">David Marsh</a> · Published <time class="published" itemprop="datePublished" datetime="${today}">${displayDate}</time></div></div></section>
<section class="overhaul-section tight"><div class="container"><div class="pain-strip"><div><p class="overhaul-kicker">Direct answer</p><h2 class="overhaul-title sm">If a tool, page, form, payment path, or Google listing is costing customers or staff time, it deserves a clear first read.</h2><p class="overhaul-deck">These pages are built for owners who know the symptom, not the software category.</p></div><ul class="mess-list"><li>What is broken?</li><li>What is costing money?</li><li>What should customers do next?</li><li>What should staff stop doing by hand?</li></ul></div></div></section>
<section class="overhaul-section"><div class="container"><p class="overhaul-kicker">Answer library</p><h2 class="overhaul-title sm">Start with the sentence already in your head.</h2><div class="overhaul-grid three">${answers
    .map(
      (answer, index) =>
        `<article class="guide-card"><span class="num">${String(index + 1).padStart(2, "0")}</span><p class="overhaul-kicker">${answer.category}</p><h3><a href="/answers/${answer.slug}/">${answer.h1}</a></h3><p>${answer.deck}</p></article>`,
    )
    .join("")}</div></div></section>
${faqMarkup(faqItems)}
<section class="overhaul-section tight"><div class="container"><div class="fit-check-band"><p class="overhaul-kicker">Not sure?</p><h2 class="overhaul-title sm">Bring us the messy setup.</h2><p class="overhaul-deck">You do not need the right tech term. Tell us what is slow, expensive, broken, confusing, or disconnected.</p><div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start a Fit Check</a><a class="btn-ghost" href="/case-studies/">See case studies</a></div></div></div></section>`;

  return shell(page, pageGraph(page, [faqSchema(faqItems), breadcrumb(page.url, [{ name: "Home", url: "https://littlefightnyc.com/" }, { name: "Answers", url: page.url }])]), body);
}

function caseStudyMarkup(study, index) {
  return `<article class="proof-card" id="${study.slug}"><span class="num">${String(index + 1).padStart(2, "0")}</span><p class="overhaul-kicker">${study.type}</p><h3>${study.headline}</h3><p><strong>Problem:</strong> ${study.problem}</p><div class="overhaul-grid two"><div><h4>Kept</h4><ul>${study.kept.map((item) => `<li>${item}</li>`).join("")}</ul></div><div><h4>Connected</h4><ul>${study.connected.map((item) => `<li>${item}</li>`).join("")}</ul></div><div><h4>Replaced</h4><ul>${study.replaced.map((item) => `<li>${item}</li>`).join("")}</ul></div><div><h4>Built</h4><ul>${study.built.map((item) => `<li>${item}</li>`).join("")}</ul></div></div><p><strong>What changed:</strong> ${study.changed}</p><p><strong>Stack:</strong> ${study.stack}</p></article>`;
}

function caseStudiesPage() {
  const page = {
    title: "Small Business Case Studies NYC | Little Fight NYC",
    description:
      "Anonymized Little Fight NYC case studies showing website cleanup, software savings, local search, IT support, lead capture, and business systems work.",
    url: "https://littlefightnyc.com/case-studies/",
  };
  const body = `<section class="page-hero overhaul-page-hero"><div class="container"><p class="overhaul-kicker">Case studies</p><h1 class="overhaul-title">Proof without the victory-lap fog.</h1><p class="overhaul-deck">Names stay private until clients approve. The work does not need fake numbers: fewer leaks, clearer paths, better trust, and owners who can see what is happening.</p><div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="/work/">Open work overview</a></div><div class="page-updated content-meta">By <a class="author" rel="author" href="/about/">David Marsh</a> · Published <time class="published" itemprop="datePublished" datetime="${today}">${displayDate}</time></div></div></section>
<section class="overhaul-section tight"><div class="container"><div class="pain-strip"><div><p class="overhaul-kicker">How to read these</p><h2 class="overhaul-title sm">Every case is framed around business relief.</h2><p class="overhaul-deck">What was costing time, money, customers, or trust? What stayed? What got connected? What was replaced? What got built?</p></div><ul class="mess-list"><li>No unsupported percentage claims.</li><li>No pretend enterprise transformation.</li><li>No client names without permission.</li><li>Just the work pattern and the practical result.</li></ul></div></div></section>
<section class="overhaul-section"><div class="container"><p class="overhaul-kicker">Project library</p><h2 class="overhaul-title sm">Six ways the money leaks.</h2><div class="overhaul-grid three">${caseStudies
    .map(
      (study) =>
        `<article class="system-card"><h3><a href="#${study.slug}">${study.type}</a></h3><p>${study.headline}</p></article>`,
    )
    .join("")}</div></div></section>
<section class="overhaul-section method-band"><div class="container"><p class="overhaul-kicker">The case notes</p><h2 class="overhaul-title sm">Specific beats loud.</h2><div class="overhaul-grid">${caseStudies.map(caseStudyMarkup).join("")}</div></div></section>
<section class="overhaul-section tight"><div class="container"><div class="fit-check-band"><p class="overhaul-kicker">Next move</p><h2 class="overhaul-title sm">Have a version of one of these problems?</h2><p class="overhaul-deck">Bring the messy setup. We will sort what to keep, connect, replace, or build.</p><div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="/answers/">Read owner answers</a></div></div></div></section>`;

  const creativeWork = caseStudies.map((study) => ({
    "@type": "CreativeWork",
    name: study.headline,
    about: study.type,
    text: `${study.problem} ${study.changed}`,
  }));
  return shell(
    page,
    pageGraph(page, [
      breadcrumb(page.url, [{ name: "Home", url: "https://littlefightnyc.com/" }, { name: "Case Studies", url: page.url }]),
      { "@type": "ItemList", name: "Little Fight NYC case studies", itemListElement: creativeWork.map((item, index) => ({ "@type": "ListItem", position: index + 1, item })) },
    ]),
    body,
  );
}

async function writePage(relativePath, html) {
  const file = path.join(root, relativePath);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html, "utf8");
}

async function listHtmlFiles(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if ([".git", "backup", "dist", "docs", "node_modules", "tmp"].includes(entry.name) || /^dist(?:-.+)?$/.test(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await listHtmlFiles(absolute, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(absolute);
    }
  }
  return files;
}

async function wireExistingPages() {
  const files = await listHtmlFiles(root);
  for (const file of files) {
    let html = await readFile(file, "utf8");
    const original = html;

    html = html.replaceAll(
      '<a href="/local-search/">Get Found</a><a href="/software-guides/">Guides</a>',
      '<a href="/local-search/">Get Found</a><a href="/answers/">Answers</a><a href="/software-guides/">Guides</a>',
    );
    html = html.replaceAll(
      '<li><a href="/local-search/">Get Found</a></li><li><a href="/software-guides/">Software Guides</a></li>',
      '<li><a href="/local-search/">Get Found</a></li><li><a href="/answers/">Owner Answers</a></li><li><a href="/software-guides/">Software Guides</a></li>',
    );
    html = html.replaceAll(
      '<li><a href="/work/">Our Work</a></li>',
      '<li><a href="/work/">Our Work</a></li><li><a href="/case-studies/">Case Studies</a></li>',
    );
    html = html.replaceAll(
      '<li><a href="/work/">Work</a></li>',
      '<li><a href="/work/">Work</a></li><li><a href="/case-studies/">Case Studies</a></li>',
    );
    html = html.replaceAll(
      '<a href="/software-guides/">Software Guides</a></li><li><a href="/software-cost-calculator/">Cost Calculator</a>',
      '<a href="/software-guides/">Software Guides</a></li><li><a href="/answers/">Owner Answers</a></li><li><a href="/software-cost-calculator/">Cost Calculator</a>',
    );
    html = html.replaceAll(
      '<a tabindex="-1" href="/software-guides/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">05</span><span class="drawer-link-text">Guides</span></a>',
      '<a tabindex="-1" href="/answers/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">05</span><span class="drawer-link-text">Answers</span></a><a tabindex="-1" href="/software-guides/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">06</span><span class="drawer-link-text">Guides</span></a>',
    );
    html = html.replaceAll(
      '<a tabindex="-1" href="/work/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">06</span><span class="drawer-link-text">Work</span></a><a tabindex="-1" href="/fit-check/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">07</span><span class="drawer-link-text">Start Here</span></a>',
      '<a tabindex="-1" href="/work/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">07</span><span class="drawer-link-text">Work</span></a><a tabindex="-1" href="/fit-check/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">08</span><span class="drawer-link-text">Start Here</span></a>',
    );

    if (file.endsWith(path.join("index.html")) && !file.includes(`${path.sep}answers${path.sep}`) && !html.includes('href="/answers/" class="btn btn-outline">Owner Answers</a>')) {
      html = html.replace(
        '<a href="/it-support/" class="btn btn-outline">IT Support</a>',
        '<a href="/it-support/" class="btn btn-outline">IT Support</a><a href="/answers/" class="btn btn-outline">Owner Answers</a>',
      );
    }

    if (file.endsWith(path.join("work", "index.html")) && !html.includes("Open the full case-study page")) {
      html = html.replace(
        '<a class="btn-ghost" href="/business-systems/">See savings work</a>',
        '<a class="btn-ghost" href="/business-systems/">See savings work</a><a class="btn-ghost" href="/case-studies/">Open case studies</a>',
      );
      html = html.replace(
        '<p class="overhaul-kicker">Case studies</p><h2 class="overhaul-title sm">Examples framed around relief, not a sales pitch.</h2>',
        '<p class="overhaul-kicker">Case studies</p><h2 class="overhaul-title sm">Examples framed around relief, not a sales pitch.</h2><p class="overhaul-deck">Open the full case-study page for six anonymized project patterns with what stayed, what connected, what changed, and what got built. <a href="/case-studies/">Open the full case-study page</a>.</p>',
      );
    }

    if (file.endsWith(path.join("software-guides", "index.html")) && !html.includes("Owner answers hub")) {
      html = html.replace(
        '<a class="btn-ghost" href="/software-cost-calculator/">Use the calculator</a>',
        '<a class="btn-ghost" href="/software-cost-calculator/">Use the calculator</a><a class="btn-ghost" href="/answers/">Owner answers hub</a>',
      );
    }

    html = html.replaceAll(
      '<li><a href="/answers/">Owner Answers</a></li><li><a href="/software-guides/">Software Guides</a></li><li><a href="/answers/">Owner Answers</a></li>',
      '<li><a href="/answers/">Owner Answers</a></li><li><a href="/software-guides/">Software Guides</a></li>',
    );
    html = html.replaceAll(
      '<li><a href="/work/">Work</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/case-studies/">Case Studies</a></li>',
      '<li><a href="/work/">Work</a></li><li><a href="/case-studies/">Case Studies</a></li>',
    );
    html = html.replaceAll(
      '<li><a href="/work/">Our Work</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/case-studies/">Case Studies</a></li>',
      '<li><a href="/work/">Our Work</a></li><li><a href="/case-studies/">Case Studies</a></li>',
    );

    if (html !== original) {
      await writeFile(file, html, "utf8");
    }
  }
}

async function updateSitemap() {
  const sitemapPath = path.join(root, "sitemap.xml");
  let sitemap = await readFile(sitemapPath, "utf8");
  const urls = [
    ["https://littlefightnyc.com/answers/", "0.8"],
    ["https://littlefightnyc.com/case-studies/", "0.7"],
    ...answers.map((answer) => [`https://littlefightnyc.com/answers/${answer.slug}/`, "0.5"]),
  ];

  for (const [loc, priority] of urls) {
    if (!sitemap.includes(`<loc>${loc}</loc>`)) {
      sitemap = sitemap.replace(
        "</urlset>",
        `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>\n</urlset>`,
      );
    }
  }
  sitemap = sitemap.replaceAll("<lastmod>2026-05-05</lastmod>", `<lastmod>${today}</lastmod>`);
  await writeFile(sitemapPath, sitemap, "utf8");
}

async function updateLlms() {
  const llmsPath = path.join(root, "llms.txt");
  let llms = await readFile(llmsPath, "utf8");
  const block = `## Owner Answer Engine

- Owner answers hub: https://littlefightnyc.com/answers/
- Case studies: https://littlefightnyc.com/case-studies/
- Website form not working: https://littlefightnyc.com/answers/website-form-not-working-small-business/
- Not showing on Google Maps: https://littlefightnyc.com/answers/business-not-showing-on-google-maps/
- Small business website cost in NYC: https://littlefightnyc.com/answers/small-business-website-cost-nyc/
- Reduce monthly software costs: https://littlefightnyc.com/answers/reduce-monthly-software-costs-small-business/
- Urgent IT support: https://littlefightnyc.com/answers/urgent-it-support-small-business-nyc/
- Local pharmacy website help: https://littlefightnyc.com/answers/local-pharmacy-website-community-support/
- Hair salon software savings: https://littlefightnyc.com/answers/hair-salon-save-money-software/

Direct answer: Little Fight NYC is building an answer-first library for NYC small business owners who know the symptom before they know the technical category. Each answer maps the problem to what to keep, connect, replace, or build.

`;
  if (!llms.includes("## Owner Answer Engine")) {
    llms = llms.replace("## Contact", `${block}## Contact`);
  }
  await writeFile(llmsPath, llms, "utf8");
}

async function updateNetlifyRedirects() {
  const netlifyPath = path.join(root, "netlify.toml");
  let config = await readFile(netlifyPath, "utf8");
  if (config.includes('from = "/answers"')) {
    return;
  }

  const routes = [
    "answers",
    "case-studies",
    ...answers.map((answer) => `answers/${answer.slug}`),
  ];
  const block = `# Answer-engine and case-study direct route rewrites.
${routes
    .map(
      (route) => `[[redirects]]
from = "/${route}"
to = "/${route}/"
status = 200
force = true
`,
    )
    .join("\n")}`;

  config = config.replace("# Slashless route rewrites for crawl probes and direct typed URLs.", `${block}\n# Slashless route rewrites for crawl probes and direct typed URLs.`);
  await writeFile(netlifyPath, config, "utf8");
}

async function updateChangeLog() {
  const logPath = path.join(root, "work", "ai-change-log.txt");
  const entry =
    "2026-05-06 00:00:00 UTC | Created: answers hub, 24 answer-first AEO pages, case-studies page, IndexNow helper | Modified: public nav/footer links, sitemap.xml, llms.txt, netlify.toml | Deleted: none | Reason: Built the next SEO/AEO content-engine sprint around plain-English owner questions, anonymized proof patterns, and faster search discovery.\n";
  let current = await readFile(logPath, "utf8");
  current = current.replace(
    /^2026-05-06 00:00:00 UTC \| Created: answers hub, 20 answer-first AEO pages, case-studies page, IndexNow helper \| Modified: public nav\/footer links, sitemap\.xml, llms\.txt, netlify\.toml \| Deleted: none \| Reason: Built the next SEO\/AEO content-engine sprint around plain-English owner questions, anonymized proof patterns, and faster search discovery\.\n/m,
    "",
  );
  if (!current.includes("24 answer-first AEO pages")) {
    await writeFile(logPath, `${current}${entry}`, "utf8");
  }
}

await writePage("answers/index.html", answersHub());
for (const answer of answers) {
  await writePage(`answers/${answer.slug}/index.html`, answerPage(answer, answers.indexOf(answer)));
}
await writePage("case-studies/index.html", caseStudiesPage());
await wireExistingPages();
await updateSitemap();
await updateLlms();
await updateNetlifyRedirects();
await updateChangeLog();

console.log(`Generated ${answers.length} answer pages plus answers hub and case studies.`);
