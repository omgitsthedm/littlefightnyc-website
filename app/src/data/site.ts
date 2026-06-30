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
  verb: "Audit" | "Fix" | "Build" | "Clean up";
  title: string;
  headline: string;
  plain: string;
  outcome: string;
  includes: string[];
  image: string;
  accent: string;
  icon: LucideIcon;
  shortAnswer: string;
  whatItDoes: string[];
  commonIssues: Array<{ title: string; body: string }>;
  fallacies: Array<{ myth: string; reality: string }>;
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
  client: string;
  url: string;
  slug: string;
  image: string;
  services: string[];
  published?: string;
  updated?: string;
  body?: string[];
};

export type StudioProject = {
  slug: string;
  name: string;
  kind: string;
  status: "Active" | "Live" | "Sandbox" | "Archived";
  oneline: string;
  description: string;
  stack: string[];
  image: string;
  external?: string;
  body?: string[];
  metrics?: { label: string; value: string }[];
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
  { label: "Work", path: "/services/" },
  { label: "Field Guide", path: "/field-guide/" },
  { label: "Audit", path: "/audit/" },
  { label: "Fit Check", path: "/fit-check/" },
];

export const services: Service[] = [
  {
    slug: "tech-consulting",
    eyebrow: "Tech Consulting",
    verb: "Audit",
    title: "Know what to keep, cut, fix, or build",
    headline: "Before you spend another dollar, let us read the setup.",
    plain: "We look at the website, Google listing, tools, costs, and daily workflow. Then we tell you what is fine, what is leaking money, and what to fix first.",
    outcome: "First hour free. If you do not need us, we will say so.",
    includes: [
      "Tool stack and monthly cost audit",
      "Website, Google profile, and lead path review",
      "Workflow walkthrough",
      "Written punch list ranked by risk, cost, and customer impact",
    ],
    image: "/assets/interior-grocery.webp",
    accent: "gold",
    icon: Search,
    shortAnswer:
      "Short answer: Little Fight gives NYC small businesses a free first read of their website, Google profile, tools, monthly costs, and workflow so the owner knows what to keep, connect, replace, or build.",
    whatItDoes: [
      "Most owners do not start with a clean problem. They start with a weird bill, a quiet form, a Google listing that feels wrong, or a workflow only one person understands.",
      "Tech consulting is the first read. We walk through the tools, costs, website, Google profile, lead path, and staff handoffs. Then we name what is earning its place, what is leaking money, what is a real risk, and what is actually fine.",
      "You leave with a written punch list. It is ranked by what hurts customers, what costs money, and what can wait. You can hand it to your existing vendor, another developer, or back to us.",
      "The consult is free on purpose. We are checking whether there is work worth doing. If the answer is no, we will tell you that before you spend more.",
    ],
    commonIssues: [
      {
        title: "Software bills nobody can explain",
        body: "It is common to find duplicate booking tools, old logins, and subscriptions nobody has opened in months. We list the tools, the cost, the owner, and what each one earns.",
      },
      {
        title: "A website nobody can describe",
        body: "Owners often inherit a site they did not build and cannot edit. The first job is finding what it says, where leads go, what ranks, and who controls the login.",
      },
      {
        title: "A Google profile that sends mixed signals",
        body: "Wrong hours, stale photos, generic categories, mismatched addresses, and weak service language do not look like one big issue. Together, they make the business harder to trust and recommend.",
      },
      {
        title: "Workflow that lives in one person's head",
        body: "Leads come in through phone, form, email, and walk-ins, then get tracked nowhere. The fix is not always software. Sometimes it starts by naming the steps so another person can run them.",
      },
      {
        title: "Decisions made under pressure",
        body: "Owners get pitched by ad reps, SEO vendors, redesign shops, booking platforms, and software companies. A clean baseline makes it easier to tell a real fix from a sales script.",
      },
    ],
    fallacies: [
      {
        myth: "An audit means I am going to get sold something at the end.",
        reality: "Not here. The consult is free and ends with a written punch list you can take anywhere. We charge for the work, not the conversation. If the right move is 'do not hire anyone yet,' that is what we will say.",
      },
      {
        myth: "I should just trust whoever is already managing my tech.",
        reality: "Often they are doing fine, and we will say so. A second read just checks whether the setup still matches the business, the bill, and the way customers reach you now.",
      },
      {
        myth: "AI tools will figure all this out for me.",
        reality: "AI is useful where it earns its place. It still does not know which tools your staff opens, which booking path customers use, or which vendor has the password. Local context still matters.",
      },
      {
        myth: "If it is not broken, it does not need an audit.",
        reality: "A working setup can still cost more than it should. The point is not to invent problems. The point is to find the slow leaks before they become urgent.",
      },
    ],
    faq: [
      {
        question: "How long does a consult take?",
        answer:
          "A first call is usually 20-30 minutes. If the setup needs a deeper audit, we say what we need, what we will check, and when you will get the written punch list.",
      },
      {
        question: "What do I need to give you to get started?",
        answer:
          "Nothing sensitive on the first call. We ask what tools you pay for, what your website is, and what is bothering you. If we need access later, we use a safer handoff. Never email or text passwords.",
      },
    ],
  },
  {
    slug: "it-support",
    eyebrow: "IT Support",
    verb: "Fix",
    title: "Computer broken, POS frozen, Wi-Fi down",
    headline: "Fast help when the basics break.",
    plain: "Email, domains, Wi-Fi, POS, booking, payments, accounts, and devices - fixed by someone who learns the setup and writes down what changed.",
    outcome: "Call or text first. On-site within 24 hours when needed, with 2-hour callbacks from 9am-9pm Eastern.",
    includes: [
      "On-demand troubleshooting",
      "Email, domain, and DNS repair",
      "POS, booking, and payment systems",
      "Device, account, and Wi-Fi setup",
    ],
    image: "/assets/pos.webp",
    accent: "teal",
    icon: Wrench,
    shortAnswer:
      "Short answer: Little Fight provides practical local IT support for NYC small businesses when email, domains, Wi-Fi, POS, booking, payments, accounts, or devices stop working.",
    whatItDoes: [
      "When a card reader, email inbox, printer, booking link, or staff login breaks, you do not need a ticket number. You need a person who can separate the urgent fix from the bigger mess.",
      "Little Fight answers the phone, comes on-site when the problem needs hands on hardware, and keeps notes so the next call does not start from zero.",
      "We work on the unglamorous middle of the stack: email routing, domain renewals, DNS records, POS connections, booking links, Wi-Fi coverage, payment handoffs, locked accounts, and devices the staff depends on.",
      "The goal is not to make you more dependent on us. Every fix gets documented in plain language so the business is safer the next time something changes.",
    ],
    commonIssues: [
      {
        title: "Card reader is down on a Friday night",
        body: "Payments are queueing, customers are waiting, and nobody wants a platform support script. We check the network, device, payment account, and recent changes before touching anything risky.",
      },
      {
        title: "Email stopped arriving (or stopped being sent)",
        body: "Quotes do not arrive, customers think you ignored them, and reviews suffer. The cause is often a DNS record, billing lapse, spam rule, mailbox limit, or routing change.",
      },
      {
        title: "Inherited an account nobody has the password to",
        body: "A previous staff member moved on. The domain is in a registrar nobody can name. The Google profile is tied to an old email. We map ownership, recover what we can, and document the new path.",
      },
      {
        title: "Booking link or form is broken",
        body: "The worst way to find out is from a customer. We check the embed, confirmation path, email routing, spam filtering, and the place the lead is supposed to land.",
      },
      {
        title: "Wi-Fi is unreliable in one part of the room",
        body: "Sometimes it is router placement. Sometimes interference. Sometimes an old setup no one revisited after the room changed. We test it where staff and customers actually use it.",
      },
      {
        title: "A device, account, or app needs to be set up — and nobody on staff has time",
        body: "New POS, printer, email account, staff laptop, or app login. The small setup jobs add up. We do them, explain them, and leave the notes behind.",
      },
    ],
    fallacies: [
      {
        myth: "A big national IT firm will give us better support than a local shop.",
        reality: "A national help desk can be useful for monitoring, patching, and routine support. It is less useful when the POS is down, the counter is full, and someone needs to understand the room.",
      },
      {
        myth: "Outsourced IT is fine if the price is right.",
        reality: "Outsourced IT can work for patching, backups, and monitoring. It is not the whole answer when a customer-facing tool breaks during service and the fix depends on local context.",
      },
      {
        myth: "Geek Squad / corporate support is the same thing.",
        reality: "Retail support can help with a single device. A business setup has POS, domains, payments, booking, staff accounts, Wi-Fi, and Google all touching each other.",
      },
      {
        myth: "I'll just Google it.",
        reality: "You can Google a lot of it. The risk is changing the wrong DNS record, locking an account, or turning a small problem into a bigger one. Some things are worth the call.",
      },
      {
        myth: "If we have a managed-services retainer, we don't need anyone else.",
        reality: "Managed services and local on-site support are different jobs. A retainer may handle patching and monitoring. Local support handles the moments that need a person in the business.",
      },
    ],
    faq: [
      {
        question: "Do you help when something is broken today?",
        answer:
          "Yes. Call first if customers, payments, bookings, email, or access are affected. We stop the immediate issue before we talk about any larger cleanup.",
      },
      {
        question: "Do you need passwords on the first call?",
        answer:
          "No. Never share sensitive information on a call or in a form. If access is needed, we use a safer handoff — never SMS, never email.",
      },
      {
        question: "Do you require a contract or retainer?",
        answer:
          "No. We work on-demand. We're happy to set up a regular check-in for clients who want it, but the work is hourly, scoped, and documented. You don't pay us when you don't need us.",
      },
    ],
  },
  {
    slug: "custom-local-websites",
    eyebrow: "Custom Local Websites",
    verb: "Build",
    title: "A site that makes the next action obvious",
    headline: "A local website people can understand and use.",
    plain: "Custom websites for NYC businesses where calls, booking, forms, maps, payments, service pages, and Google signals all have to work together.",
    outcome: "Usually ships within 14 days. If our side misses the date, you do not pay.",
    includes: [
      "Custom design + build (no templates)",
      "Local SEO + Google Business Profile setup",
      "Forms, booking, and payment connections",
      "Service-area + neighborhood pages",
      "Hosting, backups, and ongoing care",
    ],
    image: "/assets/storefront-blue-gift-shop.webp",
    accent: "orange",
    icon: Laptop,
    shortAnswer:
      "Short answer: Little Fight builds custom local websites for NYC small businesses that explain the offer quickly, support calls, bookings, forms, and payments, and give Google clear local signals.",
    whatItDoes: [
      "A custom local website is built around one business, one set of customers, and one local market. It is not a theme with new colors. It is not a template page trying to sound like every other shop.",
      "The site has to work for people before it works for search. A visitor should know what you do, where you are, why it is worth calling, and what to do next without hunting.",
      "The local search work belongs inside the build. Service pages, Maps signals, review paths, contact details, booking links, and the Google Business Profile should agree with each other.",
      "We keep the process tight. Build, review, ship. Websites usually ship within 14 days. If our side misses the date, you do not pay.",
      "Hosting and ongoing care are part of the setup. The site should stay fast, monitored, backed up, and easier to update when hours, offers, booking tools, or Google rules change.",
    ],
    commonIssues: [
      {
        title: "A site that looks fine but does not bring calls",
        body: "The design may look polished while the visitor still cannot tell what to do next. The fix might be copy, layout, forms, booking, Google signals, or the offer itself.",
      },
      {
        title: "A mobile page that makes people hunt",
        body: "The phone number is hidden, the service area is vague, booking is below six sections, and the form asks too much. On a phone, that is enough to lose the customer.",
      },
      {
        title: "Forms that quietly stopped working",
        body: "A platform update, spam rule, DNS issue, or expired connection can stop leads from arriving. If nobody tests the path, the owner may not find out until a customer says something.",
      },
      {
        title: "Service-area copy that sounds like everybody else",
        body: "Local pages need real business detail, not swapped neighborhood names. A SoHo shop, Chelsea salon, Midtown firm, and Lower East Side bar should not explain themselves the same way.",
      },
      {
        title: "A site that loads in 6 seconds on a phone",
        body: "Big image files, heavy scripts, old plugins, and tracker pileups slow the first impression. People do not wait because the business is local. They go back to search.",
      },
      {
        title: "Hosting and maintenance scattered across three vendors",
        body: "The domain is at one registrar. Hosting is somewhere else. Email has a third login. The site has a fourth. When something breaks, nobody knows who owns the fix.",
      },
    ],
    fallacies: [
      {
        myth: "Template platforms are always bad.",
        reality: "No. They can be the right answer for a simple business and a simple offer. The problem starts when the business needs stronger local search, faster pages, cleaner conversion paths, or integrations the template keeps fighting.",
      },
      {
        myth: "Google doesn't actually penalize template websites.",
        reality: "Do not think of it as a penalty. Think of it as a comparison. Google has to decide which business looks more specific, useful, consistent, and trustworthy. A generic template makes that harder.",
      },
      {
        myth: "AI website builders will replace agencies.",
        reality: "AI is useful for drafts, structure, research, and speed. It still cannot decide what your business should leave out, how your customers talk, or what your staff can actually maintain.",
      },
      {
        myth: "More pages = better SEO.",
        reality: "More weak pages can make the site worse. Useful pages win because they answer real questions, show real local proof, and help a customer act.",
      },
      {
        myth: "Once the site launches, we're done.",
        reality: "A site that never gets touched gets stale. Hours change. Staff change. Booking tools change. Google changes. Ongoing care keeps the path from quietly breaking.",
      },
      {
        myth: "A redesign will fix the leads problem.",
        reality: "Sometimes. Often the real problem is the Google profile, phone path, booking widget, form routing, or offer. Read the path first. Rebuild only if the read points there.",
      },
    ],
    faq: [
      {
        question: "Do I need a new website, or just a cleanup?",
        answer:
          "Often a cleanup. If the platform still works and customers can use it, start with the message, mobile layout, forms, and booking path before rebuilding. The consult will tell you which.",
      },
      {
        question: "Can you connect the site to booking or payments?",
        answer:
          "Yes. The website should connect to the action that makes the business money: booking, calls, forms, estimates, purchases, and follow-up. We use custom code where it matters and simple embeds where they are better.",
      },
      {
        question: "What if I miss the 14-day window?",
        answer:
          "We schedule launches around your availability. If you need more time to review, we hold the date. The 14-day promise is on us, not you. If we miss because of our side, you do not pay.",
      },
    ],
  },
  {
    slug: "business-systems",
    eyebrow: "Business Systems",
    verb: "Clean up",
    title: "The internal tools that keep the day moving",
    headline: "Less spreadsheet. Less memory. Less monthly waste.",
    plain: "Custom internal tools, lead intake, follow-up, dashboards, tool cleanup, and simple workflows built around the work your business actually does.",
    outcome: "Scoped to the business. Good tools stay. Bad fits go.",
    includes: [
      "Lead intake + CRM build",
      "Tool-stack cleanup + consolidation",
      "Dashboards + reporting",
      "Workflow automation",
      "Custom internal apps (when off-the-shelf doesn't fit)",
    ],
    image: "/assets/case-public-house-cockpit.webp",
    accent: "green",
    icon: ClipboardCheck,
    shortAnswer:
      "Short answer: Little Fight cleans up and builds right-sized business systems for NYC teams losing time to spreadsheets, scattered leads, duplicate entry, manual follow-up, and software bills that do not earn their place.",
    whatItDoes: [
      "Business systems are the work behind the storefront: the lead tracker, project board, dashboard, quote path, booking handoff, invoice step, and owner view.",
      "Most small businesses run that layer through spreadsheets, inboxes, sticky notes, group texts, and one or two tools that almost fit. The work happens, but the owner becomes the memory for the whole business.",
      "We start by reading the current stack. What earns its place? What costs too much? What needs to connect? What should be replaced? What deserves a custom build?",
      "Custom internal apps are for the work that no generic tool handles well. Estimating, quoting, specialty inventory, approvals, lead routing, field notes, or reporting can be cheaper and calmer when the tool fits the workflow instead of forcing the workflow to fit the tool.",
      "Everything we ship is documented and right-sized. The code, data, hosting, domain, and notes should belong to the business. No held-hostage pricing.",
    ],
    commonIssues: [
      {
        title: "Leads come in through 4 channels and get tracked in 0",
        body: "Phone calls, contact forms, Instagram DMs, walk-ins - and somewhere in the gaps, leads get forgotten. The fix is usually a single intake layer, not a giant CRM.",
      },
      {
        title: "Two people enter the same data into two systems",
        body: "Front desk types it into booking. Bookkeeper types it into accounting. Owner types it into a spreadsheet. Three entries, three chances to miss.",
      },
      {
        title: "Reports that take half a day to produce",
        body: "The owner pulls data from five places and stitches it together by hand. A simple dashboard can show the same view without making Monday morning disappear.",
      },
      {
        title: "A SaaS subscription that costs more than it saves",
        body: "A large platform for a tiny workflow can become the bill nobody wants to question. The right move may be downgrade, connect, replace, or cancel.",
      },
      {
        title: "Work that's locked inside one staff member's head",
        body: "When the senior person is out, the business slows down. Documenting the workflow is not about replacing them. It is about making the business less fragile.",
      },
      {
        title: "A custom workflow that no SaaS will ever fit",
        body: "Estimating, quoting, classification work, specialty inventory, and scheduling around physical constraints can be too specific for generic tools. That is when custom earns its place.",
      },
    ],
    fallacies: [
      {
        myth: "We need Salesforce.",
        reality: "Almost no small business needs Salesforce. It's an excellent platform for organizations with dedicated admins, complex sales orgs, and serious budgets. For a 5–50 person small business, it's typically more software than the team will ever use, at a price that makes it expensive to walk away from. There are right-sized alternatives — and often, a custom-built lead layer is both cheaper and a better fit.",
      },
      {
        myth: "We should just use Airtable / Notion / [favorite no-code tool] for everything.",
        reality: "Sometimes yes — for the right size and use case, no-code tools are excellent. But they hit ceilings: when the data model gets complex, when permissions matter, when the workflow involves customers (not just staff), when you need a real interface for a non-technical user. Knowing when a no-code tool is the right answer and when it's a temporary fix is a real part of the job.",
      },
      {
        myth: "Custom is too expensive.",
        reality: "Sometimes. Often the math is less obvious. A recurring subscription plus staff time can cost more than a focused build over the life of the tool. The right answer depends on the workflow, cost, and ownership.",
      },
      {
        myth: "Custom means we're locked into one developer forever.",
        reality: "If it's built right, no. We build on standard, widely-used technology (PostgreSQL, Next.js, Supabase, well-documented frameworks). The code is yours, the data is yours, the documentation is yours. Any competent developer can pick it up. We've handed off projects to clients' in-house teams without drama.",
      },
      {
        myth: "If we just had better software, the workflow would fix itself.",
        reality: "Software amplifies workflow — it doesn't replace it. If the underlying process is unclear, new software makes the confusion faster and more expensive. Half of business-systems work is naming the workflow before touching the tools.",
      },
      {
        myth: "Internal tools have to be ugly.",
        reality: "No. Internal tools that staff actually want to use save time and prevent errors. Dense, honest, careful interfaces matter when people rely on the tool every day.",
      },
    ],
    faq: [
      {
        question: "Is custom always better than software?",
        answer:
          "No. Good tools stay. The right move may be to keep, connect, replace, or build, depending on the workflow, monthly cost, and how specific the work is.",
      },
      {
        question: "What can a small business system include?",
        answer:
          "Lead intake, follow-up, dashboards, forms, booking and payment handoffs, staff notifications, inventory, project boards, simple reporting, and — when needed — a fully custom internal application.",
      },
      {
        question: "Do I own the code if you build something custom?",
        answer:
          "Yes. You own the code, the data, the hosting, the domain, and the documentation. We build on standard technology any developer can pick up. No platform lock-in, no held-hostage pricing.",
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
    path: "/field-guide/#answers",
  },
  {
    question: "Why are we paying for software and still using spreadsheets?",
    short: "That usually means the tool is not fitting the workflow. Keep the useful parts, connect the gaps, replace the drag.",
    path: "/field-guide/#answers",
  },
  {
    question: "Why does a competitor show up on Google before us?",
    short: "Google needs a clear profile, real service pages, review signals, and local proof it can understand.",
    path: "/field-guide/#answers",
  },
  {
    question: "Can custom be cheaper than another subscription?",
    short: "Sometimes. Not always. The math starts with the monthly bill plus the staff time lost around it.",
    path: "/field-guide/#answers",
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
    type: "Film production company",
    client: "CC Films",
    url: "https://ccfilms.net",
    slug: "cc-films",
    image: "/assets/case-cc-films.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-05-13",
    updated: "2026-05-13",
    title: "A clearer official home for a debut horror feature.",
    problem: "CC Films had a live site for Marrow, but the page needed to read as the film's official source: fast, structured, credible, and useful to press, festival audiences, and search systems.",
    kept: "The analog horror mood, Marrow poster and trailer, premiere photography, review coverage, core credits, and existing Netlify/GitHub setup.",
    changed: "Reworked the homepage and gallery hierarchy, sharpened the film and company story, added privacy and AI-readable reference pages, fixed schema/sitemap/header signals, and versioned assets to clear stale caches before deploying live.",
    result: "A production-ready official site at ccfilms.net with clearer press paths, stronger film proof, better crawler context, hardened headers, and a cleaner update path for future festival and release news.",
    body: [
      "CC Films is the Dallas-based production company behind Marrow, a debut psychological horror feature directed by Mitch McLeod and produced by CC Films under executive producer Carlos R. Cortez. The site has a narrow but important job: give press, festival audiences, reviewers, collaborators, and search systems one official place to understand the film, watch the trailer, see the cast and credits, browse premiere photography, and find the right next step.",
      "The site already had the right raw material: a strong poster, trailer, festival-premiere context, review coverage, recognizable cast names, and a gallery of premiere photos. We kept the analog, VHS-influenced mood and the existing Netlify/GitHub deployment path. The work was to make the site behave like an official source instead of a loose brochure: clearer sections, better first-screen proof, stronger navigation, and fewer places where a visitor or crawler had to guess.",
      "We rebuilt the homepage hierarchy around the film, tightened the gallery and press paths, added a privacy page and llms.txt, repaired schema and sitemap signals, hardened headers, and versioned CSS/JS so the live deploy did not keep serving stale assets. The result is a modernized ccfilms.net that can support the film through press, festival, and release updates without losing the cinematic tone that made the project recognizable.",
    ],
  },
  {
    type: "Cruise social network",
    client: "DeckSpace",
    url: "https://www.getdeckspace.com",
    slug: "deckspace",
    image: "/assets/case-deckspace.webp",
    services: ["custom-local-websites", "business-systems"],
    published: "2026-05-13",
    updated: "2026-05-13",
    title: "A nostalgic onboard social layer for life at sea.",
    problem: "DeckSpace needed to explain an internal cruise social network without making it feel like a generic travel app: guests need to find events, venue hours, shops, bars, restaurants, voyage details, photos, profiles, and each other while they are already moving around the ship.",
    kept: "The emotional center of cruising: shared plans, temporary community, onboard discovery, and the feeling of a trip people want to remember after they get home.",
    changed: "Framed the product around nostalgia, shipboard wayfinding, guest profiles, event discovery, venue context, and ultra-premium low-latency performance so the experience feels immediate instead of like another portal.",
    result: "A clearer product story for getdeckspace.com: part onboard guide, part social network, part cruise memory layer, with speed and atmosphere treated as core features.",
    body: [
      "DeckSpace is built for a strange, high-stakes little environment: a cruise ship. Guests are relaxed, distracted, moving between decks, and constantly asking the same questions. What is happening tonight? Where is the bar? What is open? Who else is on board? Where did that photo go? The site needed to make the product feel like a guest companion instead of a software dashboard.",
      "We kept the nostalgic heart of the idea. A cruise is part schedule, part wayfinding problem, and part temporary social world. DeckSpace turns that into a shared sailing page where guests can follow events, check venue context, keep up with the voyage, make a profile, find people, share photos, and leave with a short-lived archive of the trip.",
      "The product story also had to respect the performance reality. Onboard experiences punish slow interfaces, and guests will not wait through heavy screens just to find dinner hours or see who is going to an event. DeckSpace is positioned around fast, low-latency shipboard discovery with a premium retro signal: warm, useful, immediate, and specific to the sailing.",
    ],
  },
  {
    type: "Solo stylist salon",
    client: "Hair By Rachel Charles",
    url: "https://www.hairbyrachelcharles.com",
    slug: "hair-by-rachel-charles",
    image: "/assets/case-hair-by-rachel-charles.webp",
    services: ["custom-local-websites", "tech-consulting"],
    title: "From Instagram-only to a real booking flow.",
    problem: "A solo stylist running her whole business through Instagram and word-of-mouth — no website, no Google profile, no obvious way to book.",
    kept: "The existing Square Appointments setup the clients already knew.",
    changed: "Built a mobile-first website with a Square booking embed, set up the Google Business Profile from scratch, and wired neighborhood-specific SEO across the site.",
    result: "A real booking funnel that ranks for local searches. Lighthouse 100s across the board. Bookings now arrive without DM tag.",
    body: [
      "The first time we sat down with Rachel, her entire business was running through Instagram DMs. She had built a client base purely through word of mouth and showing up — but every booking required a back-and-forth in messages, every appointment confirmation lived in her thumbs, and Google had no idea she existed. The site started as a question: what if every potential client could find her, see the work, and book without a single message?",
      "We kept the part that was already working — her existing Square Appointments setup, which her clients already knew. The site became the front door: a mobile-first page with the portfolio, the location, a Square booking embed, and a clear path to the studio. We set up the Google Business Profile from scratch — address, hours, categories, photos, FAQs — and wired the site metadata to reinforce it. The whole engagement took two weeks.",
      "Three months in, bookings were arriving from searches like 'hair color near East Village' without any social mention. Lighthouse scores landed at 100 across the board. Rachel kept her DMs for client relationships, but the booking funnel moved off her phone.",
    ],
  },
  {
    type: "Streetwear brand",
    client: "After Hours Agenda",
    url: "https://www.afterhoursagenda.com",
    slug: "after-hours-agenda",
    image: "/assets/case-after-hours-agenda.webp",
    services: ["custom-local-websites", "business-systems"],
    title: "End-to-end e-commerce that doesn't drown the brand.",
    problem: "A streetwear brand with a real point of view needed a real storefront — but Shopify's templates were going to flatten everything that made the brand interesting.",
    kept: "Brand identity, product designs, and the NYC nightlife voice.",
    changed: "Custom Next.js 14 build with Square handling payments and Printful handling fulfillment. Product catalog wired through a JSON master, no hardcoded prices, no platform lock-in.",
    result: "A storefront that looks like the brand instead of like a Shopify theme. Cart-to-checkout-to-confirmation works end-to-end. Owner can ship a new drop in a day.",
    body: [
      "After Hours Agenda is Little Fight NYC's own streetwear experiment — the rare case where the agency is also the client, with all the dangers that come with it. The brand was tight, the designs were ready, the audience was building, but the storefront was Shopify, and Shopify was flattening the brand. Every product page looked like every other Shopify product page, regardless of what we put on it.",
      "The decision was: rebuild on Shopify with a custom theme, or rebuild off Shopify entirely. We rebuilt off — Next.js 14 with the App Router, Square for payments, Printful for fulfillment, the whole catalog wired through a single JSON master so nothing is hardcoded. No platform lock-in. No theme template gravity.",
      "The result is a storefront that looks like the brand instead of the platform. Cart-to-checkout-to-confirmation works end-to-end. Payment flows through Square; orders go to Printful for shipping. New product drops take a day, not a sprint. The site is the brand.",
    ],
  },
  {
    type: "Help service",
    client: "ClearHelp",
    url: "https://www.clearhelp.org",
    slug: "clearhelp",
    image: "/assets/case-clearhelp.webp",
    services: ["custom-local-websites", "business-systems"],
    title: "Multi-site setup with a real backend.",
    problem: "A help service that needed three connected sites — public-facing, intake, and admin — all sharing live data, all deploying independently.",
    kept: "The team's existing intake categories and naming.",
    changed: "Three-site Netlify topology with a shared Supabase backend, real-time intake routing, and per-site CI on push.",
    result: "Production multi-site with a database that the team can actually look at. Each site ships independently. Intake data flows where it should without copying.",
    body: [
      "ClearHelp is a help service that needed three sites — public-facing, intake, and admin — all sharing data, all deploying independently, all looking like one product. The shape of the challenge was simple to state and hard to solve: how do you ship three separate Netlify sites that act like one, with a real backend the team can actually look at?",
      "We kept the team's existing intake categories and naming so the human side of the work did not have to change. We built the database layer in Supabase. The public site is static HTML with Netlify Forms feeding into the intake site. The admin is a separate authenticated Netlify deploy. CI was wired per-site, so the team can push to one without rebuilding the others.",
      "The result is production: three sites, one database, real-time intake routing, per-site deploys on every push. ClearHelp's team can look at their data, edit it, and ship updates to any one of the three sites without breaking the others.",
    ],
  },
  {
    type: "Creative agency",
    client: "Public House Creative",
    url: "https://www.publichousecreative.com",
    slug: "public-house-creative",
    image: "/assets/case-public-house-cockpit.webp",
    services: ["business-systems"],
    title: "An internal cockpit for the work they actually run.",
    problem: "Public House Creative needed a single internal system to run their estimating, classification, and reporting work — replacing a stack of spreadsheets, documents, and tribal knowledge with one source of truth.",
    kept: "The estimator's judgment and the workflow categories the team already used.",
    changed: "Built Cockpit — a private web application where documents come in, rooms and drivers get classified, the math reconciles, and the report exports cleanly. Field-precision UI, dense without being condensed.",
    result: "The team runs the work through Cockpit. Estimates that used to live across three tools live in one. The math is honest. The team can audit any number back to its source. Currently active build.",
    body: [
      "Public House Creative came to Little Fight with a real internal-systems problem. The estimating work — the part that determines whether a job is profitable before it starts — was spread across documents, spreadsheets, email threads, and the head of the senior estimator. Every project re-discovered the same context. Every quote took longer than it should have. The team had outgrown the tools and was starting to feel it.",
      "We built Cockpit. It is a private web application that turns the messy first pass of an estimate — site photos, blueprints, hand-drawn notes, scope emails — into a structured, reconcilable artifact. Documents come in. Rooms get classified. Drivers (the variables that move the math) get resolved. The report exports. The interface is field-precision: dense data, never condensed, never lying about confidence. The estimator's judgment makes the final call; the system makes the call cheap.",
      "Cockpit is in active build. The team uses it on real estimates. The math is honest. New scope items, new room types, new export formats land in days, not sprints. The system is becoming what the senior estimator's head used to hold — but now it scales beyond one person."
    ],
  },
  {
    type: "Funding LLC",
    client: "Grand Funding LLC",
    url: "https://www.grandfundingllc.com",
    slug: "grand-funding-llc",
    image: "/assets/case-grand-funding-llc.webp",
    services: ["custom-local-websites"],
    title: "A clean public face for a finance business.",
    problem: "A funding LLC that needed a credible public landing — investor-grade presentation, clear product summary, easy contact path — without any of the boilerplate finance-site clichés.",
    kept: "The team's positioning and the calls-to-action they already use.",
    changed: "Built a quiet, type-led landing with a single clear lead capture, structured contact info, and meta + schema configured for trust signals.",
    result: "A site partners and prospects can actually share. Professional without sounding generic.",
    body: [
      "Grand Funding is a financial funding business. The needs were specific: investor-grade public presentation, clear product summary, professional contact path, real schema for trust signals — and none of the boilerplate finance-site decoration that signals 'we built this on a template at a different agency.'",
      "We kept the team's positioning and the way they describe what they do. We built a quiet, type-led landing page with a single clear lead capture, structured contact information, and schema markup configured for credibility (Organization, FinancialService, Person for the founder).",
      "The result is a public landing partners and prospects can share without a second thought. Professional, restrained, and intentional — without sounding like every other LLC website on the internet.",
    ],
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

export const studioProjects: StudioProject[] = [
  {
    slug: "dakota",
    name: "Dakota",
    kind: "Autonomous sales agent",
    status: "Active",
    oneline: "An AI agent that finds leads, drafts cold outreach, and routes responses — running on a Mac in the office.",
    description:
      "Dakota is the experiment that asks whether a small services business can replace traditional cold outreach with an autonomous agent. It runs locally on a Mac, identifies plausible leads, drafts contextually relevant emails, sends through Resend, and routes incoming replies to Little Fight NYC. The point is not to scale — it is to discover what good outreach looks like when nobody is rushing.",
    stack: ["Anthropic", "Resend", "TypeScript", "Mac mini", "LaunchAgent"],
    image: "/assets/coworking-laptops.webp",
    body: [
      "Dakota is the answer to a question: can a small services business run its outreach the way an enterprise sales team runs theirs, without hiring a sales team? The setup is a Mac sitting on a desk in the office running a LaunchAgent that fires the agent on a schedule. The agent identifies candidate businesses, drafts contextually relevant outreach emails using Claude, sends them through Resend, and routes responses back to the team.",
      "The point is not scale — it is discovery. What does good outreach look like when nobody is rushing to hit a quota? When the agent has access to the full context of what Little Fight does and does not do? When the only metric that matters is 'did this person have a real conversation?'",
      "Less volume than a traditional cold-outreach setup. But the conversations that do start tend to be qualified, not transactional. Dakota stays a sandbox until that ratio gets boring — which has not happened yet.",
    ],
    metrics: [
      { label: "Candidate leads sourced (week)", value: "84" },
      { label: "Outreach emails drafted (week)", value: "29" },
      { label: "Emails sent (week)", value: "14" },
      { label: "Real conversations started (week)", value: "2" },
      { label: "Average reply latency", value: "47 min" },
      { label: "Last agent run", value: "earlier today" },
    ],
  },
  {
    slug: "3d-schematics",
    name: "3D Schematics",
    kind: "Interactive systems diagrams",
    status: "Sandbox",
    oneline: "Three.js experiments for explaining systems architecture in a way 2D diagrams cannot.",
    description:
      "Three.js sketches built to test whether a moving, rotatable schematic does the work of a slide deck better than the slide deck does. Used for client onboarding explainers — what the system is, what is connected to what, what is missing. Some of these become production artifacts; most stay in the sandbox.",
    stack: ["Three.js", "TypeScript", "React Three Fiber"],
    image: "/assets/interior-spice-shop.webp",
    body: [
      "The Three.js sandbox started during a client engagement that needed an explainer. The traditional artifact would have been a slide deck — but the system we were explaining was inherently 3D (a paint-and-finish workflow with multiple zones, drivers, and reconciliation paths) and the deck was always going to be flat.",
      "The sandbox now includes about a dozen sketches: a paint-job estimator that rotates and lets you click through the stages, a CRM workflow visualized as orbiting nodes around a customer, a software-stack audit where each tool is a block you can scale up and down. Most stay in the sandbox. A few become production artifacts for client onboarding.",
      "The bet is that explaining systems three-dimensionally is more efficient than explaining them with bullet points. The bet is not proven. The sandbox is where we keep testing.",
    ],
  },
  {
    slug: "vera",
    name: "Vera",
    kind: "Listing intelligence pipeline",
    status: "Active",
    oneline: "A pipeline that watches and scores small-business listings across platforms.",
    description:
      "Vera is the internal data plumbing that asks: where is a business showing up, what is it being called, and what is the actual signal to Google? It scrapes, cross-references, scores, and watches. Some of what it learns ends up in client engagements as evidence; some of it goes into the Little Fight Journal as how-tos.",
    stack: ["Node", "Supabase", "Anthropic", "Cron"],
    image: "/assets/hand-donut-sprinkles.webp",
    body: [
      "Vera is the internal data plumbing that asks: where is a business showing up online, what is it being called, and what signal is it actually sending to Google? A small business often has six or seven different 'selves' across the internet — the website, the Google Business Profile, Yelp, Apple Maps, Bing Places, a Squarespace listing, an industry directory — and Google can only score what it can match.",
      "Vera scrapes those surfaces, cross-references the data, scores each match, and watches the deltas over time. The first dataset was for Little Fight's own clients, to know whose listings were drifting. The second became the basis for a few how-to articles in the Journal. The third is a tool we are working toward shipping for other agencies.",
      "Vera is what makes the Local Search service work without anyone having to manually check thirty sites every quarter.",
    ],
  },
  {
    slug: "cockpit",
    name: "Estimator's Cockpit",
    kind: "Field-precision web app",
    status: "Active",
    oneline: "An internal cockpit for Public House Creative — discovery, classification, and reporting in one premium UI.",
    description:
      "Built for Public House Creative, the Cockpit turns the messy first-pass of an estimate into a structured artifact: documents in, rooms classified, drivers reconciled, report out. Private to the team. The biggest non-public build Little Fight has shipped.",
    stack: ["Next.js", "Supabase", "Anthropic", "Netlify Functions"],
    image: "/assets/hero-laptop.webp",
    body: [
      "The Cockpit is the largest non-public build Little Fight has shipped. Built for Public House Creative, it turns the messy first pass of an estimate — site photos, blueprints, hand-drawn notes, scope emails — into a structured artifact: documents in, rooms classified, drivers reconciled, report out.",
      "The build is Next.js + Supabase + Anthropic for classification + Netlify Functions for the heavier processing. The interface is field-precision: dense information, never condensed. The data tells the truth. The estimator's judgment makes the call.",
      "Real estimates run through it. The math is honest. The team uses it on every project.",
    ],
  },
];
