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
  eyebrow: string;
  title: string;
  headline: string;
  plain: string;
  outcome: string;
  includes: string[];
  image: string;
  accent: string;
  icon: LucideIcon;
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

export const navItems: RouteItem[] = [
  { label: "Services", path: "/services" },
  { label: "Answers", path: "/answers" },
  { label: "Case Studies", path: "/case-studies" },
  { label: "Fit Check", path: "/fit-check" },
];

export const services: Service[] = [
  {
    eyebrow: "Websites",
    title: "The website people see",
    headline: "A clearer front door.",
    plain: "Design, copy, service pages, booking paths, forms, mobile polish, and the trust signals customers need before they call.",
    outcome: "Turn attention into action.",
    includes: ["Website builds", "Landing pages", "Service pages", "Forms and booking paths"],
    image: "/assets/websites.webp",
    accent: "orange",
    icon: Laptop,
  },
  {
    eyebrow: "IT Support",
    title: "The technology that has to work",
    headline: "Fast help when the basics break.",
    plain: "Email, domains, DNS, devices, Wi-Fi, POS, booking, payment, accounts, access, and the daily tech that cannot be mysterious.",
    outcome: "Protect the business day.",
    includes: ["On-demand support", "Email and domain help", "POS and payment troubleshooting", "Device and account setup"],
    image: "/assets/pos.webp",
    accent: "teal",
    icon: Wrench,
  },
  {
    eyebrow: "Local Search",
    title: "The way customers find you",
    headline: "Show up where locals look.",
    plain: "Google Business Profile, Maps, reviews, service pages, neighborhood signals, answer-first content, and simple reporting.",
    outcome: "Get found by people already looking.",
    includes: ["Google profile cleanup", "Local SEO", "Review paths", "Search-ready service pages"],
    image: "/assets/local-business.webp",
    accent: "gold",
    icon: Search,
  },
  {
    eyebrow: "Business Systems",
    title: "The system behind the work",
    headline: "Less spreadsheet. Less memory. Less waste.",
    plain: "Lead intake, follow-up, dashboards, automations, tool cleanup, software decisions, and lightweight workflows built around how the business actually runs.",
    outcome: "Make the back room easier to run.",
    includes: ["Lead tracking", "Tool-stack cleanup", "Dashboards", "Workflow automation"],
    image: "/assets/owner.webp",
    accent: "green",
    icon: ClipboardCheck,
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
    path: "/answers",
  },
  {
    question: "Why are we paying for software and still using spreadsheets?",
    short: "That usually means the tool is not fitting the workflow. Keep the useful parts, connect the gaps, replace the drag.",
    path: "/answers",
  },
  {
    question: "Why does a competitor show up on Google before us?",
    short: "Google needs a clear profile, real service pages, review signals, and local proof it can understand.",
    path: "/answers",
  },
  {
    question: "Can custom be cheaper than another subscription?",
    short: "Sometimes. Not always. The math starts with the monthly bill plus the staff time lost around it.",
    path: "/answers",
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
