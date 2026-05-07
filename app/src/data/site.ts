import {
  BadgeDollarSign,
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  Globe2,
  HeartHandshake,
  Laptop,
  MapPin,
  MessagesSquare,
  Phone,
  PlugZap,
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
  title: string;
  plain: string;
  outcome: string;
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
    title: "Fix what is broken",
    plain: "Website down, email failing, forms missing leads, booking not working, devices acting up.",
    outcome: "Stop the leak first.",
    icon: Wrench,
  },
  {
    title: "Build a clearer website",
    plain: "A site that tells customers who you help, what to do next, and why they can trust you.",
    outcome: "Turn visits into calls, bookings, and forms.",
    icon: Laptop,
  },
  {
    title: "Cut software waste",
    plain: "Find the tools worth keeping and the subscriptions quietly charging for features nobody uses.",
    outcome: "Lower monthly drag.",
    icon: BadgeDollarSign,
  },
  {
    title: "Connect the tools",
    plain: "Forms, booking, payment, email, Google, and spreadsheets should not live in separate rooms.",
    outcome: "Make the handoff cleaner.",
    icon: PlugZap,
  },
  {
    title: "Get found locally",
    plain: "Google profile, Maps, service pages, reviews, and answers customers can actually find.",
    outcome: "Show up when locals search.",
    icon: Search,
  },
  {
    title: "Build the simple system",
    plain: "Lead tracking, intake, follow-up, dashboards, reminders, and the workflow behind the work.",
    outcome: "Less memory work for the owner.",
    icon: ClipboardCheck,
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
