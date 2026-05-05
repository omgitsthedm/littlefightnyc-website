type JsonRecord = Record<string, unknown>;

declare const Netlify:
  | {
      env?: {
        get?: (key: string) => string | undefined;
      };
    }
  | undefined;

const APPROVED_CATEGORIES = [
  "Quick Fix",
  "Website Cleanup",
  "Website Build / Rebuild",
  "Tool / Software Decision",
  "Business System Build",
  "Local Search / Visibility",
  "Not Sure Yet",
] as const;

const URGENCY_LEVELS = [
  "emergency",
  "urgent_but_not_emergency",
  "planned_improvement",
  "exploratory",
] as const;

const NEXT_STEPS = [
  "Human follow-up",
  "Emergency support",
  "Fit Check call",
  "Website audit",
  "Tool-stack audit",
  "Local search audit",
  "Systems mapping session",
  "Not a fit",
  "Needs more info",
] as const;

type ApprovedCategory = (typeof APPROVED_CATEGORIES)[number];
type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

type LeadScore = {
  fit: number;
  urgency: number;
  budget_clarity: number;
  system_opportunity: number;
  website_opportunity: number;
  search_opportunity: number;
  tool_opportunity: number;
};

type FitCheckResult = {
  primary_category: ApprovedCategory;
  secondary_categories: ApprovedCategory[];
  urgency_level: UrgencyLevel;
  client_facing_summary: string;
  internal_summary: string;
  business_snapshot: {
    business_type: string;
    location: string;
    team_size: string;
    customer_flow: string;
  };
  tools_mentioned: string[];
  pain_points: Array<{
    label: string;
    severity: number;
    evidence: string;
  }>;
  keep: string[];
  connect: string[];
  replace: string[];
  build: string[];
  obstacles: string[];
  lead_score: LeadScore;
  recommended_next_step: string;
  ballpark_type: string;
  disclaimer: string;
  follow_up_email: {
    subject: string;
    body: string;
  };
  missing_info: string[];
  human_review_flags: string[];
};

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const categoryLanguage: Record<ApprovedCategory, string> = {
  "Quick Fix":
    "an active support issue or focused fix. Little Fight should first confirm what is broken, what platform is involved, and whether customers, bookings, payments, email, or staff access are being affected.",
  "Website Cleanup":
    "a website cleanup. The foundation may still be usable, but the message, mobile experience, calls-to-action, forms, structure, or SEO basics need attention.",
  "Website Build / Rebuild":
    "a larger website project. If the platform, structure, content, and conversion paths are all working against the business, a cleanup may not be enough.",
  "Tool / Software Decision":
    "a tool-stack decision. The next step is to look at what you are paying for, what the team actually uses, what is disconnected, and whether to keep, connect, replace, or build around the tools.",
  "Business System Build":
    "a business system project. The issue is not just one tool. It is the workflow behind the work: intake, follow-up, tracking, handoffs, reporting, and the places where the team still works around the software.",
  "Local Search / Visibility":
    "a local search and visibility issue. Little Fight would review the Google profile, service pages, reviews, neighborhood relevance, analytics, and whether the site supports how customers search.",
  "Not Sure Yet":
    "unclear enough that it deserves human review. You do not need the perfect technical term before David looks at the setup.",
};

const ballparkLanguage: Record<string, string> = {
  "Level 1: On-demand support":
    "This likely starts as on-demand support. The first goal is to identify whether it is a quick fix or part of a larger systems issue.",
  "Level 2: Fit Check / Diagnostic":
    "The best next step is a Fit Check so David can review the setup before recommending scope.",
  "Level 3: Focused cleanup":
    "This sounds like a focused cleanup. The foundation may be usable, but one or more pieces need to be clarified, connected, or repaired.",
  "Level 4: Project build":
    "This sounds like a project build. David would need to scope the current setup, the tools involved, and what should be kept, connected, replaced, or built.",
  "Level 5: Custom system / operating layer":
    "This sounds like a larger business system opportunity, especially if the current platform is expensive, underused, or forcing the team into workarounds.",
};

const toolNames = [
  "Airtable",
  "Boulevard",
  "Calendly",
  "Fresha",
  "GlossGenius",
  "Google Business Profile",
  "Google Workspace",
  "HubSpot",
  "Instagram",
  "Make",
  "Microsoft 365",
  "Mindbody",
  "Monday",
  "Netlify",
  "Notion",
  "QuickBooks",
  "Shopify",
  "Square",
  "Square Appointments",
  "Squarespace",
  "Toast",
  "Webflow",
  "Wix",
  "WordPress",
  "Zapier",
];

const urgentTriggers = [
  "booking down",
  "booking is down",
  "booking not working",
  "can't log in",
  "cannot log in",
  "customers cannot",
  "dns",
  "domain",
  "email down",
  "email stopped",
  "form goes nowhere",
  "form not working",
  "google profile suspended",
  "lost access",
  "payment down",
  "payment not",
  "pos down",
  "site down",
  "website down",
];

const sensitiveTriggers = [
  "api key",
  "bank account",
  "credit card",
  "password",
  "private key",
  "recovery code",
  "secret key",
  "social security",
  "token",
];

const scoreKeywords: Record<ApprovedCategory, string[]> = {
  "Quick Fix": [
    "broken",
    "down",
    "dns",
    "domain",
    "email stopped",
    "error",
    "fix",
    "freezing",
    "login",
    "not working",
    "payment",
    "pos",
    "urgent",
  ],
  "Website Cleanup": [
    "bad mobile",
    "cleanup",
    "copy",
    "cta",
    "form",
    "mobile",
    "polish",
    "seo basics",
    "site is okay",
    "slow",
    "website feels weak",
  ],
  "Website Build / Rebuild": [
    "business changed",
    "changed services",
    "conversion",
    "embarrassing",
    "new site",
    "no longer",
    "nothing converts",
    "old",
    "old developer",
    "platform is wrong",
    "rebuild",
    "site feels wrong",
    "starting over",
    "website is old",
  ],
  "Tool / Software Decision": [
    "alternatives",
    "crm",
    "expensive",
    "platform",
    "saas",
    "software",
    "subscription",
    "too much",
    "tool",
    "vs",
  ],
  "Business System Build": [
    "approval",
    "dashboard",
    "follow up",
    "follow-up",
    "handoff",
    "intake",
    "manual",
    "nobody knows",
    "spreadsheet",
    "tracking",
    "workflow",
    "workaround",
  ],
  "Local Search / Visibility": [
    "competitor",
    "customers find",
    "google",
    "google maps",
    "local",
    "maps",
    "near me",
    "reviews",
    "search",
    "seo",
    "visibility",
  ],
  "Not Sure Yet": ["mess", "messy", "not sure", "something feels off", "unclear"],
};

const entryCategoryMap: Record<string, ApprovedCategory> = {
  broken: "Quick Fix",
  website: "Website Cleanup",
  software: "Tool / Software Decision",
  workflow: "Business System Build",
  customers: "Local Search / Visibility",
  unsure: "Not Sure Yet",
};

function env(key: string): string {
  try {
    const netlifyValue =
      typeof Netlify !== "undefined" ? Netlify?.env?.get?.(key) : undefined;
    if (netlifyValue) return netlifyValue;
  } catch {
    // Ignore Netlify.env access issues during local testing.
  }

  return typeof process !== "undefined" ? process.env[key] || "" : "";
}

function cleanText(value: unknown, limit = 2000): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function cleanArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((item) => cleanText(item, 160))
        .filter(Boolean),
    ),
  ).slice(0, 12);
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function clampScore(value: unknown): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(5, Math.max(1, Math.round(number)));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function parseRequest(req: Request): Promise<JsonRecord> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return asRecord(await req.json());
  }

  const body = await req.text();
  const params = new URLSearchParams(body);
  const out: JsonRecord = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function flattenPayload(payload: JsonRecord): JsonRecord {
  const contact = asRecord(payload.contact);
  const answers = asRecord(payload.answers);
  const campaign = asRecord(payload.campaign);
  const selectedEntry = cleanText(payload.selected_entry || payload.selectedEntry, 80);
  const initialProblem = cleanText(
    payload.initial_problem || payload.initialProblem || answers.initial_problem,
    2400,
  );

  return {
    intake_mode: cleanText(payload.intake_mode || payload.intakeMode || "website", 80),
    selected_entry: selectedEntry,
    initial_problem: initialProblem,
    urgency_level: cleanText(payload.urgency_level || answers.urgency_level, 80),
    lead_name: cleanText(contact.name || payload.lead_name || payload.name, 180),
    business_name: cleanText(
      contact.business || payload.business_name || payload.business,
      220,
    ),
    email: cleanText(contact.email || payload.email, 220),
    phone: cleanText(contact.phone || payload.phone, 80),
    website_url: cleanText(contact.website || payload.website_url || payload.website, 260),
    industry: cleanText(contact.industry || payload.industry, 180),
    location: cleanText(contact.location || payload.location, 180),
    team_size: cleanText(contact.team_size || payload.team_size, 80),
    source: cleanText(payload.source || campaign.source || "fit-check-page", 120),
    answers,
    campaign,
    events: Array.isArray(payload.events) ? payload.events.slice(0, 120) : [],
    consent_ai_summary:
      payload.consent_ai_summary === true || payload.consent_ai_summary === "true",
    consent_recording:
      payload.consent_recording === true || payload.consent_recording === "true",
    bot_field: cleanText(payload["bot-field"] || payload.botField, 80),
    page_url: cleanText(payload.page_url || payload.pageUrl, 360),
  };
}

function allUserText(lead: JsonRecord): string {
  const answers = asRecord(lead.answers);
  return [
    lead.selected_entry,
    lead.initial_problem,
    lead.urgency_level,
    lead.business_name,
    lead.industry,
    lead.location,
    lead.website_url,
    ...Object.values(answers),
  ]
    .map((value) => {
      if (Array.isArray(value)) return value.join(" ");
      if (value && typeof value === "object") return JSON.stringify(value);
      return cleanText(value, 1000);
    })
    .join(" ")
    .toLowerCase();
}

function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

function detectTools(text: string, answers: JsonRecord): string[] {
  const detected = toolNames.filter((tool) => text.includes(tool.toLowerCase()));
  const explicit = cleanText(answers.tools || answers.current_tools || answers.software, 800)
    .split(/[,;\n]/)
    .map((item) => cleanText(item, 80))
    .filter(Boolean);
  return Array.from(new Set([...detected, ...explicit])).slice(0, 16);
}

function detectUrgency(lead: JsonRecord, text: string): UrgencyLevel {
  const selected = cleanText(lead.selected_entry);
  const stated = cleanText(lead.urgency_level).toLowerCase();

  if (
    selected === "broken" ||
    stated.includes("emergency") ||
    stated.includes("actively") ||
    stated.includes("right now") ||
    includesAny(text, urgentTriggers)
  ) {
    if (
      text.includes("customer") ||
      text.includes("payment") ||
      text.includes("booking") ||
      text.includes("email") ||
      text.includes("down") ||
      text.includes("access") ||
      text.includes("right now")
    ) {
      return "emergency";
    }
    return "urgent_but_not_emergency";
  }

  if (stated.includes("planning") || stated.includes("exploring")) return "exploratory";
  return "planned_improvement";
}

function scoreCategories(lead: JsonRecord, text: string): Record<ApprovedCategory, number> {
  const scores = Object.fromEntries(
    APPROVED_CATEGORIES.map((category) => [category, 0]),
  ) as Record<ApprovedCategory, number>;

  const entry = cleanText(lead.selected_entry);
  const mapped = entryCategoryMap[entry];
  if (mapped) scores[mapped] += 5;

  APPROVED_CATEGORIES.forEach((category) => {
    scoreKeywords[category].forEach((keyword) => {
      if (text.includes(keyword)) scores[category] += 1;
    });
  });

  if (scores["Website Cleanup"] > 0 && scores["Website Build / Rebuild"] > 0) {
    if (
      text.includes("business changed") ||
      text.includes("changed services") ||
      text.includes("starting over") ||
      text.includes("platform is wrong") ||
      text.includes("embarrassing") ||
      text.includes("no longer") ||
      text.includes("site feels wrong") ||
      text.includes("old developer")
    ) {
      scores["Website Build / Rebuild"] += 6;
    } else {
      scores["Website Cleanup"] += 2;
    }
  }

  if (scores["Business System Build"] >= 3 && scores["Tool / Software Decision"] >= 3) {
    scores["Business System Build"] += 1;
  }

  return scores;
}

function pickCategories(scores: Record<ApprovedCategory, number>): {
  primary: ApprovedCategory;
  secondary: ApprovedCategory[];
} {
  const ranked = APPROVED_CATEGORIES
    .map((category) => ({ category, score: scores[category] }))
    .sort((a, b) => b.score - a.score);

  const primary = ranked[0]?.score > 0 ? ranked[0].category : "Not Sure Yet";
  const secondary = ranked
    .filter((item) => item.category !== primary && item.category !== "Not Sure Yet")
    .filter((item) => item.score >= 3)
    .slice(0, 3)
    .map((item) => item.category);

  return { primary, secondary };
}

function inferBallpark(
  primary: ApprovedCategory,
  secondary: ApprovedCategory[],
  urgency: UrgencyLevel,
  text: string,
): string {
  if (urgency === "emergency" || primary === "Quick Fix") {
    return "Level 1: On-demand support";
  }

  if (primary === "Not Sure Yet" || secondary.length >= 2) {
    return "Level 2: Fit Check / Diagnostic";
  }

  if (primary === "Website Cleanup" || primary === "Local Search / Visibility") {
    return "Level 3: Focused cleanup";
  }

  if (
    primary === "Business System Build" &&
    (text.includes("3000") ||
      text.includes("$3") ||
      text.includes("expensive") ||
      text.includes("dashboard") ||
      text.includes("custom") ||
      text.includes("platform"))
  ) {
    return "Level 5: Custom system / operating layer";
  }

  if (
    primary === "Website Build / Rebuild" ||
    primary === "Business System Build" ||
    primary === "Tool / Software Decision"
  ) {
    return "Level 4: Project build";
  }

  return "Level 2: Fit Check / Diagnostic";
}

function buildKeepConnectReplaceBuild(
  primary: ApprovedCategory,
  secondary: ApprovedCategory[],
  tools: string[],
  text: string,
) {
  const keep = new Set<string>();
  const connect = new Set<string>();
  const replace = new Set<string>();
  const build = new Set<string>();

  if (tools.length) {
    keep.add("Review which existing tools are working well enough to keep.");
  }

  if (tools.some((tool) => /square|toast|shopify|google/i.test(tool))) {
    keep.add("Core payment, booking, commerce, or workspace tools may be worth keeping if they support the workflow.");
  }

  if (
    text.includes("do not talk") ||
    text.includes("don't talk") ||
    text.includes("spreadsheet") ||
    text.includes("manual") ||
    text.includes("instagram") ||
    text.includes("form")
  ) {
    connect.add("Connect the website, forms, inboxes, booking tools, and lead tracking so work does not land in separate places.");
  }

  if (
    primary === "Tool / Software Decision" ||
    text.includes("too expensive") ||
    text.includes("barely use") ||
    text.includes("underused") ||
    text.includes("subscription")
  ) {
    replace.add("Review expensive or underused software before buying another platform.");
  }

  if (primary === "Website Build / Rebuild") {
    replace.add("Replace the website structure if the current foundation no longer matches the business.");
    build.add("Build a clearer service-page, CTA, and conversion structure.");
  }

  if (primary === "Website Cleanup") {
    build.add("Tighten copy, mobile flow, calls-to-action, forms, and basic SEO around the existing site if the foundation is usable.");
  }

  if (primary === "Business System Build" || secondary.includes("Business System Build")) {
    build.add("Build or tailor the intake, follow-up, dashboard, automation, or reporting layer around how the work actually moves.");
  }

  if (primary === "Local Search / Visibility" || secondary.includes("Local Search / Visibility")) {
    build.add("Build the local visibility foundation: Google profile, service pages, FAQs, reviews, schema, analytics, and reporting.");
  }

  if (!keep.size) keep.add("Preserve anything already working for customers or staff.");
  if (!connect.size) connect.add("Check whether working pieces are isolated from the rest of the workflow.");
  if (!replace.size) replace.add("Do not replace anything until David reviews fit, cost, usage, and risk.");
  if (!build.size) build.add("Build only the missing piece if a smaller fix will do.");

  return {
    keep: Array.from(keep).slice(0, 4),
    connect: Array.from(connect).slice(0, 4),
    replace: Array.from(replace).slice(0, 4),
    build: Array.from(build).slice(0, 4),
  };
}

function inferObstacles(text: string): string[] {
  const obstacles = new Set<string>();
  if (text.includes("budget") || text.includes("expensive") || text.includes("cost")) {
    obstacles.add("Budget clarity");
  }
  if (text.includes("old developer") || text.includes("vendor")) {
    obstacles.add("Bad previous vendor or unclear ownership");
  }
  if (text.includes("staff") || text.includes("team")) obstacles.add("Staff adoption");
  if (text.includes("platform") || text.includes("locked")) obstacles.add("Platform lock-in");
  if (text.includes("urgent") || text.includes("down") || text.includes("right now")) {
    obstacles.add("Urgency");
  }
  if (text.includes("not sure") || text.includes("confusing") || text.includes("messy")) {
    obstacles.add("Confusion around the real bottleneck");
  }
  return Array.from(obstacles).slice(0, 8);
}

function inferLeadScore(
  primary: ApprovedCategory,
  secondary: ApprovedCategory[],
  urgency: UrgencyLevel,
  text: string,
  lead: JsonRecord,
): LeadScore {
  const nySignal =
    text.includes("new york") ||
    text.includes("nyc") ||
    text.includes("manhattan") ||
    text.includes("brooklyn") ||
    text.includes("chelsea") ||
    text.includes("soho") ||
    text.includes("village") ||
    text.includes("lower east side");

  const hasBusinessContext = Boolean(cleanText(lead.business_name) || cleanText(lead.industry));
  const hasContact = Boolean(cleanText(lead.email) || cleanText(lead.phone));

  return {
    fit: clampScore((hasBusinessContext ? 3 : 2) + (nySignal ? 1 : 0) + (hasContact ? 1 : 0)),
    urgency: urgency === "emergency" ? 5 : urgency === "urgent_but_not_emergency" ? 4 : 2,
    budget_clarity:
      text.includes("budget") || text.match(/\$\d/) || text.includes("per month") ? 4 : 3,
    system_opportunity: clampScore(
      (primary === "Business System Build" ? 4 : 1) +
        (secondary.includes("Business System Build") ? 1 : 0) +
        (text.includes("manual") || text.includes("spreadsheet") ? 1 : 0),
    ),
    website_opportunity: clampScore(
      (primary.includes("Website") ? 4 : 1) +
        (secondary.some((category) => category.includes("Website")) ? 1 : 0),
    ),
    search_opportunity: clampScore(
      (primary === "Local Search / Visibility" ? 4 : 1) +
        (secondary.includes("Local Search / Visibility") ? 1 : 0),
    ),
    tool_opportunity: clampScore(
      (primary === "Tool / Software Decision" ? 4 : 1) +
        (secondary.includes("Tool / Software Decision") ? 1 : 0) +
        (text.includes("software") || text.includes("subscription") ? 1 : 0),
    ),
  };
}

function recommendedNextStep(primary: ApprovedCategory, urgency: UrgencyLevel): string {
  if (urgency === "emergency") return "Emergency support";
  if (primary === "Quick Fix") return "Human follow-up";
  if (primary === "Website Cleanup" || primary === "Website Build / Rebuild") {
    return "Website audit";
  }
  if (primary === "Tool / Software Decision") return "Tool-stack audit";
  if (primary === "Business System Build") return "Systems mapping session";
  if (primary === "Local Search / Visibility") return "Local search audit";
  return "Fit Check call";
}

function whatToCheckFirst(primary: ApprovedCategory, secondary: ApprovedCategory[]): string[] {
  const checks = new Set<string>();
  if (primary === "Quick Fix") {
    checks.add("what is broken right now");
    checks.add("the platform or account involved");
    checks.add("whether customers, bookings, payments, email, or access are affected");
  }
  if (primary.includes("Website") || secondary.some((item) => item.includes("Website"))) {
    checks.add("website structure, mobile flow, calls-to-action, and forms");
  }
  if (primary === "Tool / Software Decision" || secondary.includes("Tool / Software Decision")) {
    checks.add("current tools, subscription cost, usage, overlap, and workarounds");
  }
  if (primary === "Business System Build" || secondary.includes("Business System Build")) {
    checks.add("intake, follow-up, lead tracking, handoffs, dashboards, and reporting");
  }
  if (primary === "Local Search / Visibility" || secondary.includes("Local Search / Visibility")) {
    checks.add("Google Business Profile, service pages, reviews, analytics, and local search terms");
  }
  if (!checks.size) checks.add("website, tools, local visibility, and the workflow behind the first customer action");
  return Array.from(checks).slice(0, 5);
}

function makeInternalBrief(lead: JsonRecord, result: FitCheckResult): string {
  const lines = [
    "Lead Summary",
    `Name: ${cleanText(lead.lead_name) || "Unknown"}`,
    `Business: ${cleanText(lead.business_name) || "Unknown"}`,
    `Email: ${cleanText(lead.email) || "Unknown"}`,
    `Phone: ${cleanText(lead.phone) || "Unknown"}`,
    `Website: ${cleanText(lead.website_url) || "Unknown"}`,
    `Industry: ${cleanText(lead.industry) || "Unknown"}`,
    `Location: ${cleanText(lead.location) || "Unknown"}`,
    `Team size: ${cleanText(lead.team_size) || "Unknown"}`,
    `Urgency: ${result.urgency_level}`,
    "",
    "Primary Problem",
    result.internal_summary,
    "",
    "Category",
    `${result.primary_category}${
      result.secondary_categories.length
        ? ` + ${result.secondary_categories.join(", ")}`
        : ""
    }`,
    "",
    "Tools Mentioned",
    result.tools_mentioned.length ? result.tools_mentioned.join(", ") : "Unknown",
    "",
    "Keep",
    ...result.keep.map((item) => `- ${item}`),
    "",
    "Connect",
    ...result.connect.map((item) => `- ${item}`),
    "",
    "Replace",
    ...result.replace.map((item) => `- ${item}`),
    "",
    "Build",
    ...result.build.map((item) => `- ${item}`),
    "",
    "Lead Score",
    `Fit: ${result.lead_score.fit}`,
    `Urgency: ${result.lead_score.urgency}`,
    `Budget clarity: ${result.lead_score.budget_clarity}`,
    `System opportunity: ${result.lead_score.system_opportunity}`,
    `Website opportunity: ${result.lead_score.website_opportunity}`,
    `Search opportunity: ${result.lead_score.search_opportunity}`,
    `Tool opportunity: ${result.lead_score.tool_opportunity}`,
    "",
    "Recommended Next Step",
    result.recommended_next_step,
  ];

  return lines.join("\n");
}

function makeFollowUpEmail(lead: JsonRecord, result: FitCheckResult): {
  subject: string;
  body: string;
} {
  const firstName = cleanText(lead.lead_name).split(" ")[0] || "there";
  const business = cleanText(lead.business_name) || "your business";
  const subject = `Re: Little Fight Fit Check for ${business}`;

  const body = [
    `Hi ${firstName},`,
    "",
    "Thanks for walking through the setup. Based on what you shared, this looks like a Fit Check problem worth reviewing before we talk scope.",
    "",
    `Right now I would classify it as ${result.primary_category.toLowerCase()}${
      result.secondary_categories.length
        ? ` with ${result.secondary_categories.join(", ").toLowerCase()} also in the mix`
        : ""
    }. The first thing I would look at is what should be kept, connected, replaced, or built so we do not sell you a bigger move when a focused fix will do.`,
    "",
    "The best next step is for me to review the current site, tools, and workflow context, then recommend the clearest next move.",
    "",
    "Best,",
    "David",
  ];

  return { subject, body: body.join("\n") };
}

function buildDeterministicResult(lead: JsonRecord): FitCheckResult {
  const text = allUserText(lead);
  const answers = asRecord(lead.answers);
  const urgency = detectUrgency(lead, text);
  const scores = scoreCategories(lead, text);
  const { primary, secondary } = pickCategories(scores);
  const tools = detectTools(text, answers);
  const ballparkType = inferBallpark(primary, secondary, urgency, text);
  const kcrb = buildKeepConnectReplaceBuild(primary, secondary, tools, text);
  const obstacles = inferObstacles(text);
  const leadScore = inferLeadScore(primary, secondary, urgency, text, lead);
  const checks = whatToCheckFirst(primary, secondary);
  const nextStep = recommendedNextStep(primary, urgency);
  const sensitive = includesAny(text, sensitiveTriggers);
  const disclaimer =
    "This is not a quote. It is a fast first read based on what you shared. David needs to review the setup before scope, timeline, or pricing can be confirmed.";

  const clientSummary = [
    `Based on what you shared, this sounds like ${categoryLanguage[primary]}`,
    ballparkLanguage[ballparkType],
    sensitive
      ? "Please do not share passwords, recovery codes, payment details, private keys, or API tokens here. David can explain the safest way to grant access if this moves forward."
      : "",
    disclaimer,
  ]
    .filter(Boolean)
    .join(" ");

  const result: FitCheckResult = {
    primary_category: primary,
    secondary_categories: secondary,
    urgency_level: urgency,
    client_facing_summary: clientSummary,
    internal_summary:
      cleanText(lead.initial_problem, 700) ||
      "The lead did not provide a detailed initial description yet.",
    business_snapshot: {
      business_type: cleanText(lead.industry),
      location: cleanText(lead.location),
      team_size: cleanText(lead.team_size),
      customer_flow: cleanText(answers.customer_flow || answers.after_contact, 500),
    },
    tools_mentioned: tools,
    pain_points: [
      {
        label:
          cleanText(lead.initial_problem, 180) ||
          "The lead needs help identifying the real bottleneck.",
        severity: urgency === "emergency" ? 5 : primary === "Not Sure Yet" ? 2 : 3,
        evidence: cleanText(lead.initial_problem, 360),
      },
    ],
    keep: kcrb.keep,
    connect: kcrb.connect,
    replace: kcrb.replace,
    build: kcrb.build,
    obstacles,
    lead_score: leadScore,
    recommended_next_step: nextStep,
    ballpark_type: ballparkType,
    disclaimer,
    follow_up_email: { subject: "", body: "" },
    missing_info: missingInfo(lead),
    human_review_flags: [
      ...(urgency === "emergency" ? ["Urgent issue affecting business operations"] : []),
      ...(sensitive ? ["Sensitive credential or payment language mentioned"] : []),
      ...(primary === "Not Sure Yet" ? ["Classification unclear"] : []),
    ],
  };

  result.follow_up_email = makeFollowUpEmail(lead, result);
  return {
    ...result,
    internal_summary: makeInternalBrief(lead, result),
  };
}

function missingInfo(lead: JsonRecord): string[] {
  const missing = [];
  if (!cleanText(lead.lead_name)) missing.push("lead_name");
  if (!cleanText(lead.business_name)) missing.push("business_name");
  if (!cleanText(lead.email) && !cleanText(lead.phone)) missing.push("email_or_phone");
  if (!cleanText(lead.website_url)) missing.push("website_url");
  if (!cleanText(lead.location)) missing.push("location");
  return missing;
}

function normalizeAiResult(raw: JsonRecord, fallback: FitCheckResult): FitCheckResult {
  let primary = APPROVED_CATEGORIES.includes(raw.primary_category as ApprovedCategory)
    ? (raw.primary_category as ApprovedCategory)
    : fallback.primary_category;

  let secondary = cleanArray(raw.secondary_categories).filter((category) =>
    APPROVED_CATEGORIES.includes(category as ApprovedCategory),
  ) as ApprovedCategory[];

  let urgency = URGENCY_LEVELS.includes(raw.urgency_level as UrgencyLevel)
    ? (raw.urgency_level as UrgencyLevel)
    : fallback.urgency_level;

  if (fallback.urgency_level === "emergency") {
    urgency = "emergency";
    if (fallback.primary_category === "Quick Fix") {
      primary = "Quick Fix";
    }
  }

  const lockedFallbackCategories: ApprovedCategory[] = [
    "Quick Fix",
    "Website Build / Rebuild",
    "Tool / Software Decision",
    "Business System Build",
    "Local Search / Visibility",
  ];

  let primaryWasLocked = false;
  const aiPrimary = primary;

  if (
    lockedFallbackCategories.includes(fallback.primary_category) &&
    primary !== fallback.primary_category
  ) {
    primaryWasLocked = true;
    primary = fallback.primary_category;
  }

  if (primaryWasLocked) {
    secondary = [
      ...(aiPrimary !== "Not Sure Yet" ? [aiPrimary] : []),
      ...fallback.secondary_categories,
    ].filter((category) => category !== primary);
  }

  const leadScoreRaw = asRecord(raw.lead_score);
  const result: FitCheckResult = {
    ...fallback,
    primary_category: primary,
    secondary_categories: secondary.filter((category) => category !== primary).slice(0, 3),
    urgency_level: urgency,
    client_facing_summary:
      cleanText(raw.client_facing_summary, 2000) || fallback.client_facing_summary,
    internal_summary: cleanText(raw.internal_summary, 4000) || fallback.internal_summary,
    business_snapshot: {
      ...fallback.business_snapshot,
      ...asRecord(raw.business_snapshot),
    } as FitCheckResult["business_snapshot"],
    tools_mentioned: cleanArray(raw.tools_mentioned).length
      ? cleanArray(raw.tools_mentioned)
      : fallback.tools_mentioned,
    pain_points: Array.isArray(raw.pain_points)
      ? raw.pain_points.slice(0, 8).map((point) => {
          const record = asRecord(point);
          return {
            label: cleanText(record.label, 180),
            severity: clampScore(record.severity),
            evidence: cleanText(record.evidence, 360),
          };
        })
      : fallback.pain_points,
    keep: cleanArray(raw.keep).length ? cleanArray(raw.keep) : fallback.keep,
    connect: cleanArray(raw.connect).length ? cleanArray(raw.connect) : fallback.connect,
    replace: cleanArray(raw.replace).length ? cleanArray(raw.replace) : fallback.replace,
    build: cleanArray(raw.build).length ? cleanArray(raw.build) : fallback.build,
    obstacles: cleanArray(raw.obstacles).length
      ? cleanArray(raw.obstacles)
      : fallback.obstacles,
    lead_score: {
      fit: clampScore(leadScoreRaw.fit ?? fallback.lead_score.fit),
      urgency: clampScore(leadScoreRaw.urgency ?? fallback.lead_score.urgency),
      budget_clarity: clampScore(
        leadScoreRaw.budget_clarity ?? fallback.lead_score.budget_clarity,
      ),
      system_opportunity: clampScore(
        leadScoreRaw.system_opportunity ?? fallback.lead_score.system_opportunity,
      ),
      website_opportunity: clampScore(
        leadScoreRaw.website_opportunity ?? fallback.lead_score.website_opportunity,
      ),
      search_opportunity: clampScore(
        leadScoreRaw.search_opportunity ?? fallback.lead_score.search_opportunity,
      ),
      tool_opportunity: clampScore(
        leadScoreRaw.tool_opportunity ?? fallback.lead_score.tool_opportunity,
      ),
    },
    recommended_next_step:
      cleanText(raw.recommended_next_step, 160) || fallback.recommended_next_step,
    ballpark_type: cleanText(raw.ballpark_type, 160) || fallback.ballpark_type,
    disclaimer: cleanText(raw.disclaimer, 400) || fallback.disclaimer,
    follow_up_email: {
      subject:
        cleanText(asRecord(raw.follow_up_email).subject, 220) ||
        fallback.follow_up_email.subject,
      body:
        cleanText(asRecord(raw.follow_up_email).body, 2400) ||
        fallback.follow_up_email.body,
    },
    missing_info: cleanArray(raw.missing_info).length
      ? cleanArray(raw.missing_info)
      : fallback.missing_info,
    human_review_flags: Array.from(
      new Set([
        ...fallback.human_review_flags,
        ...(cleanArray(raw.human_review_flags).length
          ? cleanArray(raw.human_review_flags)
          : []),
      ]),
    ).slice(0, 10),
  };

  if (!result.client_facing_summary.toLowerCase().includes("not a quote")) {
    result.client_facing_summary = `${result.client_facing_summary} ${fallback.disclaimer}`;
  }

  result.recommended_next_step = recommendedNextStep(
    result.primary_category,
    result.urgency_level,
  );

  return result;
}

async function callOpenAi(lead: JsonRecord, fallback: FitCheckResult): Promise<FitCheckResult | null> {
  const apiKey = env("OPENAI_API_KEY");
  const model = env("OPENAI_MODEL") || "gpt-4.1-mini";
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are the Little Fight NYC Fit Check assistant. You help New York business owners quickly understand whether their issue is urgent support, website cleanup, website rebuild, software/tool decision, local visibility, or a business system problem. Be direct, warm, practical, and human. Ask the fewest useful questions possible when you are writing recommendations. Never provide firm quotes. Never ask for passwords, recovery codes, API keys, private tokens, payment details, or sensitive credentials. Never pretend to be David. Always preserve uncertainty and say human review is required before scope, timeline, or pricing is confirmed. Map every issue to Keep / Connect / Replace / Build.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Return only valid JSON using the Fit Check output contract.",
              approved_categories: APPROVED_CATEGORIES,
              urgency_levels: URGENCY_LEVELS,
              required_shape: {
                primary_category: "Business System Build",
                secondary_categories: ["Website Cleanup"],
                urgency_level: "planned_improvement",
                client_facing_summary: "Must include the phrase 'not a quote'.",
                internal_summary: "Internal brief for David.",
                business_snapshot: {
                  business_type: "",
                  location: "",
                  team_size: "",
                  customer_flow: "",
                },
                tools_mentioned: [],
                pain_points: [{ label: "", severity: 1, evidence: "" }],
                keep: [],
                connect: [],
                replace: [],
                build: [],
                obstacles: [],
                lead_score: {
                  fit: 1,
                  urgency: 1,
                  budget_clarity: 1,
                  system_opportunity: 1,
                  website_opportunity: 1,
                  search_opportunity: 1,
                  tool_opportunity: 1,
                },
                recommended_next_step: "Fit Check call",
                ballpark_type: "Level 2: Fit Check / Diagnostic",
                disclaimer: "This is not a quote.",
                follow_up_email: { subject: "", body: "" },
                missing_info: [],
                human_review_flags: [],
              },
              lead,
              deterministic_first_read: fallback,
            }),
          },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = asRecord(await response.json());
    const content = cleanText(
      asRecord(asRecord((data.choices as unknown[])?.[0]).message).content,
      9000,
    );
    if (!content) return null;
    const parsed = JSON.parse(content) as JsonRecord;
    return normalizeAiResult(parsed, fallback);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function supabaseLeadRecord(lead: JsonRecord, result: FitCheckResult, id: string, now: string) {
  const status = result.urgency_level === "emergency" ? "new_urgent" : "new";
  return {
    id,
    created_at: now,
    updated_at: now,
    status,
    source: cleanText(lead.source) || "fit-check-page",
    intake_mode: cleanText(lead.intake_mode) || "website",
    lead_name: cleanText(lead.lead_name),
    business_name: cleanText(lead.business_name),
    email: cleanText(lead.email),
    phone: cleanText(lead.phone),
    website_url: cleanText(lead.website_url),
    industry: cleanText(lead.industry),
    location: cleanText(lead.location),
    team_size: cleanText(lead.team_size),
    initial_problem: cleanText(lead.initial_problem, 2400),
    urgency_level: result.urgency_level,
    primary_category: result.primary_category,
    secondary_categories: result.secondary_categories,
    tools_mentioned: result.tools_mentioned,
    raw_answers: lead.answers,
    ai_client_summary: result.client_facing_summary,
    ai_internal_brief: result.internal_summary,
    ai_followup_email: result.follow_up_email.body,
    keep_notes: result.keep.join("\n"),
    connect_notes: result.connect.join("\n"),
    replace_notes: result.replace.join("\n"),
    build_notes: result.build.join("\n"),
    obstacles: result.obstacles,
    lead_score: result.lead_score,
    recommended_next_step: result.recommended_next_step,
    consent_ai_summary: Boolean(lead.consent_ai_summary),
    consent_recording: Boolean(lead.consent_recording),
    transcript_text: "",
    call_recording_url: "",
    error_log: {},
  };
}

async function saveToSupabase(lead: JsonRecord, result: FitCheckResult, id: string, now: string) {
  const url = env("SUPABASE_URL").replace(/\/$/, "");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return { configured: false, saved: false };

  const record = supabaseLeadRecord(lead, result, id, now);
  const response = await fetch(`${url}/rest/v1/fit_check_leads`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    return {
      configured: true,
      saved: false,
      status: response.status,
    };
  }

  await saveEventToSupabase(url, serviceKey, id, "lead_submitted", {
    primary_category: result.primary_category,
    urgency_level: result.urgency_level,
  });

  return { configured: true, saved: true };
}

async function saveEventToSupabase(
  url: string,
  serviceKey: string,
  leadId: string,
  eventType: string,
  eventPayload: JsonRecord,
) {
  try {
    await fetch(`${url}/rest/v1/fit_check_events`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        lead_id: leadId,
        event_type: eventType,
        event_payload: eventPayload,
      }),
    });
  } catch {
    // Event logging should never block the lead response.
  }
}

function emailText(lead: JsonRecord, result: FitCheckResult): string {
  return [
    `Primary category: ${result.primary_category}`,
    `Secondary: ${result.secondary_categories.join(", ") || "None"}`,
    `Urgency: ${result.urgency_level}`,
    `Next step: ${result.recommended_next_step}`,
    "",
    `Name: ${cleanText(lead.lead_name) || "Unknown"}`,
    `Business: ${cleanText(lead.business_name) || "Unknown"}`,
    `Email: ${cleanText(lead.email) || "Unknown"}`,
    `Phone: ${cleanText(lead.phone) || "Unknown"}`,
    `Website: ${cleanText(lead.website_url) || "Unknown"}`,
    `Location: ${cleanText(lead.location) || "Unknown"}`,
    "",
    "Client-facing summary",
    result.client_facing_summary,
    "",
    "Internal brief",
    result.internal_summary,
    "",
    "Suggested follow-up email",
    `Subject: ${result.follow_up_email.subject}`,
    result.follow_up_email.body,
  ].join("\n");
}

async function sendNotification(lead: JsonRecord, result: FitCheckResult) {
  const apiKey = env("RESEND_API_KEY");
  if (!apiKey) return { configured: false, sent: false };

  const notifyTo = env("FIT_CHECK_NOTIFY_EMAIL") || "hello@littlefightnyc.com";
  const from =
    env("FIT_CHECK_EMAIL_FROM") || "Little Fight Fit Check <onboarding@resend.dev>";
  const business = cleanText(lead.business_name) || "Unknown business";
  const urgentPrefix = result.urgency_level === "emergency" ? "URGENT " : "";
  const subject = `${urgentPrefix}Fit Check: ${business} - ${result.primary_category}`;
  const text = emailText(lead, result);
  const html = `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;line-height:1.55">${escapeHtml(
    text,
  )}</pre>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: notifyTo.split(",").map((item) => item.trim()).filter(Boolean),
      subject,
      text,
      html,
    }),
  });

  return {
    configured: true,
    sent: response.ok,
    status: response.status,
  };
}

function spamResponse() {
  return new Response(
    JSON.stringify({
      ok: true,
      status: "received",
    }),
    { headers: jsonHeaders },
  );
}

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...jsonHeaders,
        Allow: "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: {
        ...jsonHeaders,
        Allow: "POST, OPTIONS",
      },
    });
  }

  try {
    const payload = await parseRequest(req);
    const lead = flattenPayload(payload);
    if (cleanText(lead.bot_field)) return spamResponse();

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `fit_${Date.now()}`;
    const now = new Date().toISOString();
    const deterministic = buildDeterministicResult(lead);
    const aiResult = await callOpenAi(lead, deterministic);
    const result = aiResult || deterministic;

    const persistence = await saveToSupabase(lead, result, id, now).catch((error) => ({
      configured: true,
      saved: false,
      error: cleanText((error as Error).message, 160),
    }));

    const notification = await sendNotification(lead, result).catch((error) => ({
      configured: true,
      sent: false,
      error: cleanText((error as Error).message, 160),
    }));

    return new Response(
      JSON.stringify({
        ok: true,
        id,
        mode: aiResult ? "ai" : "rules",
        result,
        persistence,
        notification,
      }),
      { headers: jsonHeaders },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "The Fit Check could not be processed cleanly. A human review is needed.",
        detail: cleanText((error as Error).message, 160),
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
};

export const config = {
  path: "/api/fit-check/submit",
  method: ["POST", "OPTIONS"],
};
