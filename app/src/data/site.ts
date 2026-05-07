import {
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  Globe2,
  HeartHandshake,
  Laptop,
  MapPin,
  MessagesSquare,
  MousePointerClick,
  Phone,
  PlugZap,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RouteItem = {
  label: string;
  path: string;
};

export type Service = {
  slug: string;
  eyebrow: string;
  title: string;
  headline: string;
  plain: string;
  outcome: string;
  includes: string[];
  image: string;
  accent: string;
  icon: LucideIcon;
  shortAnswer: string;
  faq: Array<{ question: string; answer: string }>;
};

export type Answer = {
  question: string;
  short: string;
  path: string;
};

export type CaseStudy = {
  type: string;
  title: string;
  problem: string;
  kept: string;
  changed: string;
  result: string;
};

export type AreaPage = {
  slug: string;
  name: string;
  zipCodes: string[];
  headline: string;
  shortAnswer: string;
  localPattern: string;
  firstMove: string;
};

export type AnswerGuide = {
  slug: string;
  question: string;
  short: string;
  sections: Array<{ heading: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
};

export type GlossaryTerm = {
  slug: string;
  term: string;
  definition: string;
  plain: string;
  whenItMatters: string;
};

export const navItems: RouteItem[] = [
  { label: "Services", path: "/services/" },
  { label: "Answers", path: "/answers/" },
  { label: "Case Studies", path: "/case-studies/" },
  { label: "Fit Check", path: "/fit-check/" },
];

export const services: Service[] = [
  {
    slug: "websites",
    eyebrow: "Websites",
    title: "The website people see",
    headline: "A clearer front door.",
    plain: "A site that tells people what you do, why to trust you, and what to do next.",
    outcome: "More calls, bookings, forms, and sales.",
    includes: ["Website builds", "Landing pages", "Service pages", "Forms and booking"],
    image: "/assets/hero-laptop.webp",
    accent: "orange",
    icon: Laptop,
    shortAnswer:
      "Little Fight builds small business websites in NYC that explain the business quickly, earn trust, and make the next action obvious.",
    faq: [
      {
        question: "Do I need a new website or a cleanup?",
        answer:
          "If the platform still works and customers can use it, start with the message, mobile layout, forms, and booking path before rebuilding everything.",
      },
      {
        question: "Can you connect the site to booking or payments?",
        answer:
          "Yes. The website should connect to the action that makes the business money: booking, calls, forms, estimates, purchases, or follow-up.",
      },
    ],
  },
  {
    slug: "it-support",
    eyebrow: "IT Support",
    title: "The technology that has to work",
    headline: "Fast help when the basics break.",
    plain: "Email, domains, Wi-Fi, POS, booking, payments, accounts, and devices without the mystery.",
    outcome: "Keep the day moving.",
    includes: ["On-demand support", "Email and domain help", "POS and payment troubleshooting", "Device and account setup"],
    image: "/assets/typing.webp",
    accent: "teal",
    icon: Wrench,
    shortAnswer:
      "Little Fight provides practical IT support for NYC small businesses when email, domains, devices, Wi-Fi, POS, booking, or payment tools stop cooperating.",
    faq: [
      {
        question: "Do you help when something is broken today?",
        answer:
          "Yes. If customers, payments, bookings, email, or access are affected, call first so the immediate issue can be separated from any larger cleanup.",
      },
      {
        question: "Do you need passwords on the first call?",
        answer:
          "No. Do not share sensitive information on a call or form. If access is needed, Little Fight will use a safer handoff.",
      },
    ],
  },
  {
    slug: "local-search",
    eyebrow: "Local Search",
    title: "The way customers find you",
    headline: "Show up where locals look.",
    plain: "Google, Maps, reviews, service pages, neighborhood signals, and answers people can understand.",
    outcome: "Get found by people already nearby.",
    includes: ["Google profile cleanup", "Local SEO", "Review paths", "Search-ready service pages"],
    image: "/assets/local-business-base.webp",
    accent: "gold",
    icon: Search,
    shortAnswer:
      "Little Fight helps NYC local businesses improve Google visibility with clearer service pages, Google profile cleanup, review paths, and neighborhood signals.",
    faq: [
      {
        question: "Why does a competitor show up before us?",
        answer:
          "Google needs a clear business profile, matching website pages, local language, reviews, and proof that the business serves the area being searched.",
      },
      {
        question: "Is local SEO separate from the website?",
        answer:
          "No. The website, Google profile, reviews, and lead path all support each other. Search works better when the whole path is clear.",
      },
    ],
  },
  {
    slug: "business-systems",
    eyebrow: "Business Systems",
    title: "The system behind the work",
    headline: "Less spreadsheet. Less memory. Less waste.",
    plain: "Lead intake, follow-up, dashboards, tool cleanup, and simple workflows built around the real business.",
    outcome: "Spend less time chasing the work.",
    includes: ["Lead tracking", "Tool-stack cleanup", "Dashboards", "Workflow automation"],
    image: "/assets/manhattan.webp",
    accent: "green",
    icon: ClipboardCheck,
    shortAnswer:
      "Little Fight builds right-sized business systems for NYC teams that are losing time to spreadsheets, scattered leads, duplicate entry, and monthly software waste.",
    faq: [
      {
        question: "Is custom always better than software?",
        answer:
          "No. Good tools stay. The right move may be to keep, connect, replace, or build, depending on the workflow and monthly cost.",
      },
      {
        question: "What can a small business system include?",
        answer:
          "It can include lead intake, follow-up, dashboards, forms, booking or payment handoffs, staff notifications, and simple reporting.",
      },
    ],
  },
];

export const agencyProcess = [
  {
    label: "Read the business",
    copy: "We look at the site, tools, search presence, and workflow before naming the fix.",
    icon: FileSearch,
  },
  {
    label: "Fix the leak",
    copy: "If something is costing calls, bookings, payments, or trust, it moves first.",
    icon: MousePointerClick,
  },
  {
    label: "Clean the stack",
    copy: "Keep the useful tools. Cut the monthly drag. Connect what should already be talking.",
    icon: ReceiptText,
  },
  {
    label: "Build what fits",
    copy: "When off-the-shelf software is too big or too wrong, build the missing piece.",
    icon: Sparkles,
  },
];

export const fitRoutes = [
  {
    label: "Something is broken",
    copy: "Website, email, booking, payment, POS, or access is affecting customers now.",
    icon: Phone,
  },
  {
    label: "The setup is messy",
    copy: "Leads, tools, follow-up, and staff handoffs are scattered.",
    icon: MessagesSquare,
  },
  {
    label: "The monthly bill hurts",
    copy: "You are paying for software your team does not really use.",
    icon: CreditCard,
  },
  {
    label: "People cannot find us",
    copy: "Google, Maps, reviews, and service pages are not doing enough work.",
    icon: MapPin,
  },
];

export const ownerAnswers: Answer[] = [
  {
    question: "Do I need a new website or just a better path?",
    short: "If the site is trusted but the form, booking, or follow-up is broken, fix the path before buying a full rebuild.",
    path: "/answers/",
  },
  {
    question: "Why are we paying for software and still using spreadsheets?",
    short: "That usually means the tool is not fitting the workflow. Keep the useful parts, connect the gaps, replace the drag.",
    path: "/answers/",
  },
  {
    question: "Why does a competitor show up on Google before us?",
    short: "Google needs a clear profile, real service pages, review signals, and local proof it can understand.",
    path: "/answers/",
  },
  {
    question: "Can custom be cheaper than another subscription?",
    short: "Sometimes. Not always. The math starts with the monthly bill plus the staff time lost around it.",
    path: "/answers/",
  },
];

export const answerGuides: AnswerGuide[] = [
  {
    slug: "website-form-not-working-small-business",
    question: "Why are website form messages not reaching my small business?",
    short:
      "Short answer: start with the form settings, email routing, spam filters, and domain records. If people say they submitted a form but nothing arrives, treat it as an active revenue leak before redesigning the site.",
    sections: [
      {
        heading: "What to check first",
        body: "Check where the form sends messages, whether the inbox is filtering them, whether the form plugin is still connected, and whether the domain email records are healthy.",
      },
      {
        heading: "When it becomes a system issue",
        body: "If the form works but follow-up depends on memory, the fix is not only technical. The business needs a clearer lead path after the message lands.",
      },
    ],
    faq: [
      {
        question: "Is a broken form urgent?",
        answer: "Yes, if customers are using it now or the business depends on inquiries, quotes, bookings, or deposits.",
      },
      {
        question: "Do I need a full website rebuild?",
        answer: "Not usually. Fix the form path first, then decide whether the site itself needs deeper work.",
      },
    ],
  },
  {
    slug: "reduce-monthly-software-costs-small-business",
    question: "How can a small business cut monthly software costs?",
    short:
      "Short answer: list every tool, what it costs, who uses it, and what work still happens outside it. Keep the useful tools, connect the gaps, replace the waste, and build only what off-the-shelf software does badly.",
    sections: [
      {
        heading: "Find the hidden bill",
        body: "The subscription is only one cost. Staff time, double entry, missed leads, confusing onboarding, and manual reporting also count.",
      },
      {
        heading: "Do not cut what works",
        body: "Some software earns its place. The goal is not to cancel everything. The goal is to stop paying for tools that do not fit the work.",
      },
    ],
    faq: [
      {
        question: "Is custom software cheaper?",
        answer: "Sometimes. It depends on the monthly cost, staff time saved, workflow complexity, and how long the system will be used.",
      },
      {
        question: "What should I do before switching tools?",
        answer: "Map the work first. Changing software without understanding the workflow usually creates a new version of the same problem.",
      },
    ],
  },
  {
    slug: "business-not-showing-on-google-maps",
    question: "Why is my NYC business not showing on Google Maps?",
    short:
      "Short answer: Google needs a complete business profile, consistent contact details, real reviews, relevant service pages, and local proof that matches how customers search nearby.",
    sections: [
      {
        heading: "The profile is only one piece",
        body: "Google Business Profile matters, but the website, reviews, categories, service language, and neighborhood signals all support Maps visibility.",
      },
      {
        heading: "Local language matters",
        body: "A SoHo shop, Chelsea salon, Midtown firm, and Lower East Side bar should not all explain themselves the same way.",
      },
    ],
    faq: [
      {
        question: "Can a website help Maps rankings?",
        answer: "Yes. Clear service pages and consistent local language help Google understand what the business does and where it matters.",
      },
      {
        question: "Should I make fake neighborhood pages?",
        answer: "No. Neighborhood pages should be specific and useful, or they are not worth publishing.",
      },
    ],
  },
  {
    slug: "hair-salon-save-money-software",
    question: "How can an NYC hair salon save money on booking software?",
    short:
      "Short answer: keep the booking tool if staff and clients actually use it. Cut costs by removing duplicate tools, cleaning service menus, connecting follow-up, and replacing spreadsheets only where they create real drag.",
    sections: [
      {
        heading: "Booking is not the whole system",
        body: "A salon still needs clear services, deposits or payments, reminders, reviews, lead tracking, and fast answers before a client books.",
      },
      {
        heading: "The common leak",
        body: "Many salons pay for a platform but still track new leads through Instagram, phone calls, texts, and memory.",
      },
    ],
    faq: [
      {
        question: "Should salons use Square, GlossGenius, Fresha, or Mindbody?",
        answer: "It depends on staff calendars, services, memberships, payments, and how clients find the salon.",
      },
      {
        question: "Can Little Fight work with the booking tool we already use?",
        answer: "Yes. The first question is what to keep, not what to replace.",
      },
    ],
  },
  {
    slug: "local-pharmacy-website-community-support",
    question: "How can a local pharmacy website better support its community?",
    short:
      "Short answer: make hours, services, refills, insurance notes, phone actions, local help, and trust signals easy to find. A pharmacy site should reduce confusion before the customer calls or walks in.",
    sections: [
      {
        heading: "Pharmacy customers need clarity fast",
        body: "People are often checking hours, availability, directions, services, vaccines, delivery, refill paths, and whether a real local person can help.",
      },
      {
        heading: "Local trust beats generic polish",
        body: "The site should feel credible, helpful, and current, not like a national chain template with a different logo.",
      },
    ],
    faq: [
      {
        question: "Should a pharmacy site be complex?",
        answer: "No. It should be clear, fast, accessible, and focused on the actions customers need most often.",
      },
      {
        question: "Can local search help a pharmacy?",
        answer: "Yes. Service pages, Google profile accuracy, reviews, and neighborhood relevance all help customers find local care.",
      },
    ],
  },
  {
    slug: "when-custom-business-system-beats-saas",
    question: "When does a custom business system beat another subscription?",
    short:
      "Short answer: custom may make sense when a business pays for a big platform but still relies on spreadsheets, duplicate entry, manual follow-up, or reports nobody trusts.",
    sections: [
      {
        heading: "Use software when it fits",
        body: "If a tool solves most of the workflow, has strong support, and the team uses it every day, keep it.",
      },
      {
        heading: "Build when the missing piece is specific",
        body: "A right-sized dashboard, intake path, or follow-up workflow can be cleaner than paying every month for a platform built for someone else.",
      },
    ],
    faq: [
      {
        question: "Is Little Fight anti-software?",
        answer: "No. Good tools stay. Misfit software gets questioned.",
      },
      {
        question: "What is the first step?",
        answer: "Start with a Fit Check so the workflow is mapped before anything is scoped.",
      },
    ],
  },
];

export const caseStudies: CaseStudy[] = [
  {
    type: "Neighborhood pharmacy",
    title: "Make help easier to find.",
    problem: "Services, hours, calls, and trust signals were too hard to understand quickly.",
    kept: "Local trust, phone-first habits, and the owner’s practical language.",
    changed: "Clearer service pages, Google profile alignment, and simpler customer actions.",
    result: "Customers could understand what the pharmacy helps with before calling or walking in.",
  },
  {
    type: "Salon and wellness studio",
    title: "Cut booking confusion.",
    problem: "Services, booking links, and follow-up details lived across too many places.",
    kept: "Existing booking habits and the parts staff already knew.",
    changed: "Service decisions, booking paths, reminders, and follow-up prompts.",
    result: "Less front-desk explanation. Fewer dead ends before booking.",
  },
  {
    type: "Restaurant and bar",
    title: "Line up the busy-hour path.",
    problem: "Customers needed menu, hours, location, events, booking, and payment answers fast.",
    kept: "Room personality and the working POS/payment setup.",
    changed: "Website actions, local search signals, and guest decision paths.",
    result: "Fewer pauses before calling, booking, ordering, or showing up.",
  },
  {
    type: "Creative studio",
    title: "Move leads out of inbox fog.",
    problem: "Inquiries, notes, estimates, and follow-up were spread across messages and memory.",
    kept: "The owner’s review process and existing client language.",
    changed: "Intake, lead status, follow-up drafts, and owner notifications.",
    result: "The next action became visible without hunting through old threads.",
  },
];

export const proofSignals = [
  { label: "Keep", text: "The tools that still earn their place.", icon: ShieldCheck },
  { label: "Connect", text: "The pieces that work but do not talk.", icon: PlugZap },
  { label: "Replace", text: "The monthly drag and brittle workarounds.", icon: FileSearch },
  { label: "Build", text: "The missing page, path, dashboard, or workflow.", icon: Sparkles },
];

export const businessTypes = [
  { label: "Pharmacies", icon: HeartHandshake },
  { label: "Salons", icon: CalendarCheck },
  { label: "Restaurants", icon: Store },
  { label: "Shops", icon: Globe2 },
  { label: "Studios", icon: ClipboardCheck },
  { label: "Local services", icon: Wrench },
];

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "business-system",
    term: "Business system",
    definition:
      "A connected set of pages, tools, handoffs, reminders, records, and reports that helps the business move work from first contact to finished job.",
    plain: "The way the work actually moves, not just the software you bought.",
    whenItMatters:
      "It matters when leads live in too many places, staff copy the same details twice, or the owner is the only person who knows what happens next.",
  },
  {
    slug: "crm",
    term: "CRM",
    definition:
      "A customer relationship management system, usually the place where leads, customers, notes, follow-up, and sales history should live.",
    plain: "The list of people who asked for help, bought something, or need a reply.",
    whenItMatters:
      "It matters when customer notes are split between email, texts, spreadsheets, booking tools, and memory.",
  },
  {
    slug: "google-business-profile",
    term: "Google Business Profile",
    definition:
      "The free Google listing that controls how a local business appears in Search and Maps, including hours, phone, reviews, services, photos, and location.",
    plain: "The Google card people see before they ever reach your website.",
    whenItMatters:
      "It matters when competitors appear on Maps before you, hours are wrong, reviews are stale, or customers call with questions the profile should answer.",
  },
  {
    slug: "local-search",
    term: "Local search",
    definition:
      "The work that helps nearby customers find, trust, and choose a business through Google, Maps, service pages, reviews, and neighborhood signals.",
    plain: "Showing up when someone nearby is already looking.",
    whenItMatters:
      "It matters when the business depends on local customers, appointments, foot traffic, bookings, or service-area inquiries.",
  },
  {
    slug: "software-stack",
    term: "Software stack",
    definition:
      "The group of tools a business uses to run daily work, such as website platforms, booking tools, POS, payments, email, spreadsheets, CRMs, and reporting.",
    plain: "All the apps you pay for, plus the work people still do around them.",
    whenItMatters:
      "It matters when the monthly bill keeps growing but the business still runs through manual workarounds.",
  },
  {
    slug: "workflow-automation",
    term: "Workflow automation",
    definition:
      "A rule or system that moves routine work forward automatically, such as sending a lead to the right place, creating a follow-up task, or updating a dashboard.",
    plain: "The boring repeatable step happens without someone remembering to do it.",
    whenItMatters:
      "It matters when staff spend time copying details, chasing reminders, or checking three places to answer one simple question.",
  },
];

export const areaPages: AreaPage[] = [
  {
    slug: "lower-east-side",
    name: "Lower East Side",
    zipCodes: ["10002"],
    headline: "Tech support, websites, and local search for Lower East Side businesses.",
    shortAnswer:
      "Short answer: Lower East Side businesses need fast mobile websites, clear local search signals, and tools that keep up with busy nights, small teams, and quick decisions.",
    localPattern:
      "Bars, restaurants, galleries, shops, studios, and local services compete in a dense neighborhood where people search nearby and decide quickly.",
    firstMove: "Check the website action path, Google profile, booking or payment flow, and follow-up process.",
  },
  {
    slug: "east-village",
    name: "East Village",
    zipCodes: ["10003", "10009"],
    headline: "Right-sized websites and systems for East Village local businesses.",
    shortAnswer:
      "Short answer: East Village businesses win when locals can find them, understand the offer fast, and take action without chasing broken links or confusing booking paths.",
    localPattern:
      "Restaurants, salons, wellness studios, retail shops, and service businesses need clear pages and practical systems without corporate bloat.",
    firstMove: "Clean up the service pages, Google visibility, booking path, and tool stack before buying more software.",
  },
  {
    slug: "soho",
    name: "SoHo",
    zipCodes: ["10012", "10013"],
    headline: "Premium websites and business systems for SoHo shops and studios.",
    shortAnswer:
      "Short answer: SoHo businesses need polished public-facing pages and simple behind-the-scenes systems that protect leads, appointments, payments, and follow-up.",
    localPattern:
      "Retail, galleries, design studios, and premium local services need trust quickly, especially when customers compare multiple options in one walk or search session.",
    firstMove: "Review the website, local proof, contact path, and whether staff are still using memory or spreadsheets.",
  },
  {
    slug: "chelsea",
    name: "Chelsea",
    zipCodes: ["10001", "10011"],
    headline: "Websites, local SEO, and workflow cleanup for Chelsea businesses.",
    shortAnswer:
      "Short answer: Chelsea businesses need strong search visibility, sharp service pages, and systems that make inquiries, bookings, and follow-up easy to see.",
    localPattern:
      "Studios, galleries, salons, fitness, hospitality, and service firms compete for customers who search locally and expect fast answers.",
    firstMove: "Align Google visibility, service pages, intake forms, booking, and follow-up into one cleaner path.",
  },
  {
    slug: "midtown",
    name: "Midtown",
    zipCodes: ["10016", "10017", "10018", "10019", "10022"],
    headline: "IT support and digital systems for Midtown small businesses.",
    shortAnswer:
      "Short answer: Midtown businesses need reliable daily tech, fast website actions, and workflows that reduce interruptions for teams already moving under pressure.",
    localPattern:
      "Professional services, practices, studios, retailers, and operators need practical support without enterprise overhead.",
    firstMove: "Start with what is blocking calls, bookings, staff access, payments, or customer trust.",
  },
  {
    slug: "upper-east-side",
    name: "Upper East Side",
    zipCodes: ["10021", "10028", "10065", "10128"],
    headline: "Local search, websites, and support for Upper East Side businesses.",
    shortAnswer:
      "Short answer: Upper East Side businesses need high-trust websites, accurate Google visibility, and simple systems that make appointments and follow-up easy.",
    localPattern:
      "Salons, wellness practices, medical-adjacent services, shops, and professional offices need clarity and trust before customers call.",
    firstMove: "Review service pages, profile accuracy, reviews, booking, and the intake path after a customer reaches out.",
  },
  {
    slug: "upper-west-side",
    name: "Upper West Side",
    zipCodes: ["10023", "10024", "10025"],
    headline: "Better websites and practical tech help for Upper West Side businesses.",
    shortAnswer:
      "Short answer: Upper West Side local businesses need clear websites, reliable support, and search visibility that helps nearby customers choose them.",
    localPattern:
      "Neighborhood shops, wellness studios, restaurants, practices, and service teams often need fewer tools and cleaner customer paths.",
    firstMove: "Find the biggest leak across the website, Google visibility, booking, payments, or follow-up.",
  },
  {
    slug: "west-village",
    name: "West Village",
    zipCodes: ["10014"],
    headline: "Premium local websites and systems for West Village businesses.",
    shortAnswer:
      "Short answer: West Village businesses need elegant, fast websites and practical systems that help customers act without adding another expensive platform.",
    localPattern:
      "Restaurants, boutiques, salons, studios, and service businesses rely on neighborhood trust and fast customer decisions.",
    firstMove: "Check the public website, local search signals, booking or contact path, and software bills.",
  },
];
