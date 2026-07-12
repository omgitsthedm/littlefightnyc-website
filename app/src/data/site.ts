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
  metrics?: Array<{ value: string; label: string }>;
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
  metricsEyebrow?: string;
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
  intro: string;
  businessLandscape: string;
  localSearchReality: string;
  whatWeFixHere: string[];
  faq: Array<{ question: string; answer: string }>;
  nearby: string[];
};

export type AnswerGuide = {
  slug: string;
  question: string;
  short: string;
  published: string;
  updated: string;
  sections: Array<{ heading: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
};

export type GlossaryTerm = {
  slug: string;
  term: string;
  definition: string;
  plain: string;
  whenItMatters: string;
  howItWorks: string;
  example: string;
  costOfIgnoring: string;
  related: string[];
  faq: Array<{ question: string; answer: string }>;
};

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
        myth: "We should just use Airtable or Notion for everything.",
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
    path: "/examples/#answers",
  },
  {
    question: "Why are we paying for software and still using spreadsheets?",
    short: "That usually means the tool is not fitting the workflow. Keep the useful parts, connect the gaps, replace the drag.",
    path: "/examples/#answers",
  },
  {
    question: "Why does a competitor show up on Google before us?",
    short: "Google needs a clear profile, real service pages, review signals, and local proof it can understand.",
    path: "/examples/#answers",
  },
  {
    question: "Can custom be cheaper than another subscription?",
    short: "Sometimes. Not always. The math starts with the monthly bill plus the staff time lost around it.",
    path: "/examples/#answers",
  },
];

export const answerGuides: AnswerGuide[] = [
  {
    slug: "website-form-not-working-small-business",
    published: "2026-05-13",
    updated: "2026-07-07",
    question: "Why are website form messages not reaching my small business?",
    short:
      "Short answer: start with the form settings, email routing, spam filters, and domain records. If people say they submitted a form but nothing arrives, treat it as an active revenue leak before redesigning the site.",
    sections: [
      {
        heading: "What to check first",
        body: "Check where the form sends messages, whether the inbox is filtering them, whether the form plugin is still connected, and whether the domain email records are healthy.",
      },
      {
        heading: "Test it like a real customer",
        body: "Open the site on your phone, not the office computer, and fill the form out end to end with a real message. Then check the main inbox, the spam and junk folders, and any shared inbox a staff member watches. If the confirmation screen says thank you but nothing lands, the problem is almost always the email path, not the form itself.",
      },
      {
        heading: "The usual culprits",
        body: "Most silent forms come from a short list: a notification address that belongs to a former employee, a mailbox that filled up, missing SPF or DKIM records so your host's mail gets marked as spam, or a plugin or website builder trial that quietly expired. Each one is fixable in an afternoon once you find which it is.",
      },
      {
        heading: "When it becomes a system issue",
        body: "If the form works but follow-up depends on memory, the fix is not only technical. The business needs a clearer lead path after the message lands.",
      },
      {
        heading: "When to call us",
        body: "Call if you are losing inquiries right now, if you cannot tell whether the form ever worked, or if messages land but nobody has a reliable way to answer them the same day. We check the whole path from the button to your inbox, confirm it with a live test, and set up a backup copy of every lead so one broken setting never costs you a customer again.",
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
    published: "2026-05-13",
    updated: "2026-07-07",
    question: "How can a small business cut monthly software costs?",
    short:
      "Short answer: list every tool, what it costs, who uses it, and what work still happens outside it. Keep the useful tools, connect the gaps, replace the waste, and build only what off-the-shelf software does badly.",
    sections: [
      {
        heading: "Find the hidden bill",
        body: "The subscription is only one cost. Staff time, double entry, missed leads, confusing onboarding, and manual reporting also count.",
      },
      {
        heading: "Make the list first",
        body: "Pull your last three months of bank and card statements and write down every software charge, including the annual ones that hide as a single yearly hit. Note what each tool is for, who actually opens it, and the login. Owners are regularly surprised to find two tools doing the same job, or a subscription nobody has used since a staff member left.",
      },
      {
        heading: "What it usually saves",
        body: "The fastest wins are duplicate tools, unused seats you are still paying per person for, and premium tiers you were upsold but never needed. Cutting three or four of those often frees real money each month with zero change to how the work gets done. Only after that do you look at whether a bigger tool can be swapped for something simpler.",
      },
      {
        heading: "Do not cut what works",
        body: "Some software earns its place. The goal is not to cancel everything. The goal is to stop paying for tools that do not fit the work.",
      },
      {
        heading: "When to call us",
        body: "Call when the list is long, the tools do not talk to each other, or the same information gets typed into three places. We map what you pay against what the work actually needs, tell you plainly what to keep, cancel, or connect, and only suggest building something custom when the math clearly beats one more subscription.",
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
    published: "2026-05-13",
    updated: "2026-07-07",
    question: "Why is my NYC business not showing on Google Maps?",
    short:
      "Short answer: Google needs a complete business profile, consistent contact details, real reviews, relevant service pages, and local proof that matches how customers search nearby.",
    sections: [
      {
        heading: "The profile is only one piece",
        body: "Google Business Profile matters, but the website, reviews, categories, service language, and neighborhood signals all support Maps visibility.",
      },
      {
        heading: "Start with the profile basics",
        body: "Sign in to Google Business Profile and confirm the business is verified, the address and hours are exact, and the primary category matches what you actually do. An unverified profile, a category that is close but wrong, or hours that changed after the holidays are common reasons a real business slips out of the local results.",
      },
      {
        heading: "Make your name, address, and phone match everywhere",
        body: "Google trusts a business it can confirm. Your name, address, and phone number should read the same way on the website, the Google profile, Yelp, and any old directory listing. Mismatched suite numbers, an old phone line, or a former address on a stale listing all make Google less sure where you are, and less likely to place you on the map for a nearby search.",
      },
      {
        heading: "Local language matters",
        body: "Google rewards specifics. A late-night bar, a Midtown clinic, and a SoHo boutique each serve a different customer, so the service language on each page should read differently too, not the same block with the neighborhood swapped.",
      },
      {
        heading: "When to call us",
        body: "Call if the profile looks correct but you still do not appear, if you have duplicate or hijacked listings, or if reviews and service pages need real work rather than a quick edit. We audit the whole local picture, fix the profile and the listings that feed it, and build service pages that tell Google clearly what you do and which neighborhoods you serve.",
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
    published: "2026-05-13",
    updated: "2026-07-07",
    question: "How can an NYC hair salon save money on booking software?",
    short:
      "Short answer: keep the booking tool if staff and clients actually use it. Cut costs by removing duplicate tools, cleaning service menus, connecting follow-up, and replacing spreadsheets only where they create real drag.",
    sections: [
      {
        heading: "Booking is not the whole system",
        body: "A salon still needs clear services, deposits or payments, reminders, reviews, lead tracking, and fast answers before a client books.",
      },
      {
        heading: "Know what you are really paying",
        body: "Booking platforms charge in more than one place: a monthly fee per stylist, a card processing rate on every payment, and sometimes a cut of new clients they send you. Add those up for a real month. A platform that felt cheap at the monthly price can quietly take a meaningful slice of each chair once the booking fees and card rates are counted.",
      },
      {
        heading: "The common leak",
        body: "Many salons pay for a platform but still track new leads through Instagram, phone calls, texts, and memory.",
      },
      {
        heading: "Clean the menu before you switch",
        body: "Before paying for anything new, tidy what you have. Retire services no one books, set deposits on the appointments that get no-showed, and turn on the reminder texts most tools already include. A cluttered service menu and missing deposits cost more in empty chairs than the software fee ever does, and fixing them costs nothing.",
      },
      {
        heading: "When to call us",
        body: "Call when you are paying for a platform but still chasing new clients by hand, running two tools that overlap, or unsure whether to switch or stay. We start by asking what to keep, not what to replace, then connect the follow-up and cut the overlap so the tools you already trust do more of the work.",
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
    published: "2026-05-13",
    updated: "2026-07-07",
    question: "How can a local pharmacy website better support its community?",
    short:
      "Short answer: make hours, services, refills, insurance notes, phone actions, local help, and trust signals easy to find. A pharmacy site should reduce confusion before the customer calls or walks in.",
    sections: [
      {
        heading: "Pharmacy customers need clarity fast",
        body: "People are often checking hours, availability, directions, services, vaccines, delivery, refill paths, and whether a real local person can help.",
      },
      {
        heading: "Put the everyday actions up front",
        body: "The homepage should answer the questions you get on the phone all day: are you open now, how do I refill, do you deliver, do you take my insurance, and how do I reach a real person. A tap-to-call button, clear hours, and a simple refill path near the top save the customer a phone call and save your staff the interruption.",
      },
      {
        heading: "Local trust beats generic polish",
        body: "The site should feel credible, helpful, and current, not like a national chain template with a different logo.",
      },
      {
        heading: "Keep it clear without crossing privacy lines",
        body: "A pharmacy site can be genuinely helpful without collecting sensitive health details through a plain web form. Point people to the safe way to share private information, whether that is a phone call, a secure portal, or an in-person visit, and keep any general contact form free of prescription or medical specifics. Clear beats clever, and safe beats both.",
      },
      {
        heading: "When to call us",
        body: "Call if the site buries hours and refills, looks like a chain template, or you want a delivery and refill path that fits how your counter actually runs. We build a fast, accessible pharmacy site focused on the actions customers take most, keep the trust signals local, and make sure private information has a safe home instead of an open web form.",
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
    published: "2026-05-13",
    updated: "2026-07-07",
    question: "When does a custom business system beat another subscription?",
    short:
      "Short answer: custom may make sense when a business pays for a big platform but still relies on spreadsheets, duplicate entry, manual follow-up, or reports nobody trusts.",
    sections: [
      {
        heading: "Use software when it fits",
        body: "If a tool solves most of the workflow, has strong support, and the team uses it every day, keep it.",
      },
      {
        heading: "The signs you have outgrown the subscription",
        body: "Watch for the tells: you pay for a platform but still keep the real numbers in a spreadsheet, the same job gets typed into two systems, staff work around the tool instead of through it, or the reports it produces are the ones nobody believes. When the software is fighting how you actually run, another subscription rarely fixes it.",
      },
      {
        heading: "Build when the missing piece is specific",
        body: "A right-sized dashboard, intake path, or follow-up workflow can be cleaner than paying every month for a platform built for someone else.",
      },
      {
        heading: "Weigh it honestly",
        body: "Custom is not automatically cheaper. It makes sense when the monthly subscription is real, the staff time lost to workarounds is real, and the system will be used for years, not months. If a tool mostly works and just needs to be connected to your other tools, that is the better and cheaper move, and we will tell you so.",
      },
      {
        heading: "When to call us",
        body: "Call when you cannot tell whether to keep paying, switch tools, or build. Start with a Fit Check so the workflow is mapped before anything is scoped. We only recommend building when the numbers clearly beat one more subscription, and we would rather connect what you own than sell you something you do not need.",
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
  {
    "slug": "best-web-designer-nyc-reddit",
    "question": "Best Web Designer NYC? What Reddit Actually Says",
    "short": "Short answer: Reddit's advice is to check real portfolios, ask who actually does the work, and walk away from anyone who talks in jargon. That holds up. What it misses is fit: the right designer for a Midtown law firm is the wrong one for a Bushwick coffee shop.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "The same questions come up again and again in small-business and NYC subreddits. How do I find a web designer I can trust? Is a freelancer safer than an agency, or the other way around? How do I know if the quote I got is fair? Did I get ripped off by the person who built my current site? And the classic: my nephew built my website years ago and now nobody can log into anything. Underneath every thread is the same worry — owners cannot judge the work, so they are really asking how to judge the person."
      },
      {
        "heading": "The consensus",
        "body": "When the threads settle, the advice is fairly consistent. Look at live sites the designer actually built, not just screenshots. Talk to a past client if you can. Get scope, timeline, and ownership in writing before money moves. Be suspicious of both extremes — the too-cheap offer that outsources everything, and the big-agency quote that buries you in strategy decks. And a point we agree with completely: the platform matters far less than the person. A careful builder on a modest tool beats a careless one on an expensive stack."
      },
      {
        "heading": "Where Reddit's advice breaks down for NYC",
        "body": "Most of that advice assumes anywhere-USA. New York adds problems the threads rarely cover. Your competition is not the whole internet, it is the ten businesses within walking distance that show up in the map results before you do. Your customers are searching on phones, standing on a sidewalk, deciding in seconds — so mobile speed and a working directions button matter more than a clever homepage. And the local market is full of agencies priced for funded startups, quoting timelines and budgets that make no sense for a storefront."
      },
      {
        "heading": "Our honest take",
        "body": "Full disclosure: we build websites for a living, so read this knowing we are one of the options. What we would tell a friend is this. Pick someone who asks about your business before your website — how customers find you, what a good week looks like, what breaks. Ask to see real NYC small-business sites they built that are still live. Get the promise in writing: for most small-business sites, ours is fourteen days from kickoff to launch. Anyone who cannot explain their plan in plain English will not explain problems in plain English either."
      },
      {
        "heading": "What to do next",
        "body": "Write down three websites you like and one sentence on what your site must actually do — get calls, take bookings, hand out directions. Then talk to two or three builders and compare how they listen. If you want one of those conversations to be with us, the consult is free and there is no pitch. If your current site already does its job, we will tell you to keep it — you might not need us, and that is a perfectly good outcome."
      }
    ],
    "faq": [
      {
        "question": "How do I check if a web designer is legit?",
        "answer": "Ask for live sites they built, contact one past client, and confirm the domain and hosting will be in your name. Anyone solid welcomes all three requests."
      },
      {
        "question": "Should I hire a freelancer or an agency?",
        "answer": "Neither label guarantees anything. Judge the actual person doing the work, their real portfolio, and whether the scope and timeline are in writing."
      },
      {
        "question": "What should I bring to a first conversation?",
        "answer": "One sentence on what the site must do, a few sites you like, and your current logins situation. That is enough for an honest scoping talk."
      }
    ]
  },
  {
    "slug": "best-web-design-agency-nyc-reddit",
    "question": "Best Web Design Agency NYC — a Reddit Roundup",
    "short": "Short answer: Reddit says most small businesses do not need a big agency, and that is mostly right. Agencies earn their keep on large scopes. For a storefront or small team, what matters is who personally does your work and what they promise in writing.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "The agency threads have a distinct flavor. Are the big-name shops worth it, or am I paying for their office? What is a realistic minimum budget before an agency takes you seriously? Why did the agency hand my account to a junior after the sales call? Owners also swap stories about being quietly deprioritized once a bigger client showed up, and about discovering the actual build was outsourced overseas without anyone saying so. The pattern in the questions is trust: who is really doing my work, and do I matter to them?"
      },
      {
        "heading": "The consensus",
        "body": "Reddit's collective answer is surprisingly consistent: match the size of the help to the size of the job. Big agencies make sense for big scopes — brand overhauls, campaigns, complex builds with many moving parts. For a small-business website, most commenters steer people toward small studios and independents, where the person you meet is the person who builds. The most-repeated vetting question is a good one: ask exactly who will touch your project, by name and role. If the answer is vague, the work will be too."
      },
      {
        "heading": "Where Reddit's advice breaks down for NYC",
        "body": "New York complicates the picture. The city's agency market skews toward venture-backed startups and corporate clients, so a small business walking into that world often gets quoted like a startup — long discovery phases, retainers, deliverables you did not ask for. Meanwhile the word agency itself means almost nothing here; a two-person shop and a two-hundred-person firm both use it. And the threads rarely mention the thing NYC owners actually need: someone who understands neighborhood-level competition, local search, and customers who decide on their phones mid-walk."
      },
      {
        "heading": "Our honest take",
        "body": "Bias named up front: we are a small studio that builds websites and systems for NYC small businesses, so we are on one side of this debate. Even so, we will say the unfashionable thing — some businesses genuinely need a big agency. If you need a national ad campaign, a rebrand across forty locations, or a complex product build, hire the firm with the bench for it. But if you need a site that gets your phone ringing, right-sized help wins: shorter timeline, one accountable person, promises in writing — our builds run fourteen days for most sites."
      },
      {
        "heading": "What to do next",
        "body": "Decide what job you are actually hiring for, then interview at the right weight class. Ask every candidate who does the work, what happens after launch, and what they promise in writing. If you want to sanity-check your situation with us, the consult is free and there is no pitch — and if what you truly need is a bigger firm or no change at all, we will say exactly that. You might not need us, and hearing that costs you nothing."
      }
    ],
    "faq": [
      {
        "question": "Do agencies have minimum budgets?",
        "answer": "Many do, formally or not. If your project is under their usual scope, you risk becoming the account nobody prioritizes. Ask directly before signing anything."
      },
      {
        "question": "How do I know who will actually build my site?",
        "answer": "Ask for names and roles of everyone touching the project, and whether any work is subcontracted. A trustworthy shop answers plainly."
      },
      {
        "question": "Is a small studio riskier than a big agency?",
        "answer": "Not inherently. The risk in both cases is the same: unclear scope, no written timeline, and accounts not in your name. Fix those and size matters much less."
      }
    ]
  },
  {
    "slug": "small-business-it-support-nyc-reddit-recommendations",
    "question": "Small Business IT Support NYC: Reddit Recommendations, Vetted",
    "short": "Short answer: Reddit's standard advice — find responsive local help, avoid long contracts, keep your own passwords — is solid. The part it undersells: in NYC, response time is everything. A remote-only provider cannot fix the dead router in your basement.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "The IT support threads are written mid-crisis or just after one. The wifi keeps dropping and the card reader will not connect — who do I even call? Do I need one of those managed service companies, or is that overkill for six employees? My IT person retired or vanished, and now nobody knows the passwords. Is it normal to be locked into a year-long contract before they have fixed anything? The questions come from owners who do not want to think about IT at all — they want it handled and to get back to work."
      },
      {
        "heading": "The consensus",
        "body": "The crowd's advice is decent. Find someone local and responsive rather than the cheapest remote option. Do not sign a long contract before a provider has earned trust on a few real jobs. Keep a documented list of every account, password, and renewal date in the business's own hands, so no single person's disappearance takes you down. Get response times in writing, not as a verbal promise. Threads consistently warn against enterprise-style managed service contracts sold to five-person shops — paying for a security operations center you will never use."
      },
      {
        "heading": "Where Reddit's advice breaks down for NYC",
        "body": "Most managed-IT advice online assumes an office with dozens of computers. A New York storefront is a different animal: one router in a damp basement, a POS terminal, a couple of laptops, and a business that loses real money every hour something is down. Remote-only support cannot swap a fried switch in Queens. National providers quote response windows measured in business days, which is a joke when your dinner rush starts at six. What NYC businesses actually need is someone who answers fast and can physically show up."
      },
      {
        "heading": "Our honest take",
        "body": "Disclosure first: IT support is part of what we sell, so weigh our words accordingly. Here is the honest checklist we would give a friend. Get the response promise in writing — ours is a callback within two hours between 9am and 9pm ET, and on-site within twenty-four hours when hands are needed. Insist on plain-English explanations of every fix. Refuse lock-in until trust is earned. And make sure every account — domain, email, router admin — is owned by the business, not the provider. Any provider offended by that list is telling you something."
      },
      {
        "heading": "What to do next",
        "body": "Write down your last three tech fires — what broke, how long it took to fix, what it cost you in lost business. Then ask any provider you are considering, including us, exactly how they would have handled each one. The consult with us is free and there is no pitch. If your current setup is stable and your existing IT person is good, keep them — you might not need us, and we will tell you so."
      }
    ],
    "faq": [
      {
        "question": "Do I need managed IT support for a small shop?",
        "answer": "Usually not the enterprise version. Most NYC storefronts need reliable on-call help, documented accounts, and fast on-site response — not a full managed contract."
      },
      {
        "question": "What response time should I expect from IT support?",
        "answer": "Get it in writing. Ours is a two-hour callback between 9am and 9pm ET and on-site within twenty-four hours. Vague promises like fast response mean nothing."
      },
      {
        "question": "What should I do before switching IT providers?",
        "answer": "Collect every password, account, and renewal into a list the business owns. Never switch while your only copy of the keys lives with the old provider."
      }
    ]
  },
  {
    "slug": "how-to-find-good-it-guy-reddit",
    "question": "How to Find a Good IT Guy — What Reddit Gets Right (and Wrong)",
    "short": "Short answer: Reddit is right that referrals and a small test job beat any directory. It is wrong to stop there. The real test of an IT person is whether your accounts stay in your name and whether they explain things you can repeat back.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "These threads are personal. How do I find an IT person who will not disappear on me? Is a solo guy safer than a company, or riskier? My old IT guy is the only one who knows how anything works and he stopped answering — what now? Should I pay hourly or a monthly rate? There is a whole genre of posts from owners whose former tech person still controls the domain, the email, or the router password, and every reply carries the same lesson: the relationship went wrong long before he stopped picking up."
      },
      {
        "heading": "What Reddit gets right",
        "body": "The good advice is genuinely good. Ask businesses like yours who they use — a referral from a shop with the same setup is worth more than any review site. Start with one small paid job and judge the communication, not just the fix. And the crown jewel of the genre: make sure you own your own accounts. Your domain, your email, your backups, your admin passwords — in the business's name, documented, where you can reach them. Owners who follow that one rule survive any provider's disappearance."
      },
      {
        "heading": "What Reddit gets wrong",
        "body": "The referral advice has a New York problem: everyone's good guy is already stretched thin, and a great technician with too many clients becomes an unreachable one. Threads also treat solo-versus-company as the big decision, when the real issue is single point of failure — one person with no backup, no documentation, and no coverage when they are sick or slammed is fragile no matter how skilled. And almost nobody mentions putting response times in writing, which is the difference between a promise and a hope."
      },
      {
        "heading": "Our honest take",
        "body": "We should be upfront: we are, functionally, the IT guy in this story — it is a service we sell, so season everything here accordingly. Whoever you pick, us or anyone: insist your domain, email, hosting, and hardware admin accounts live in your name. Get the response commitment on paper — ours is a callback within two hours, 9am to 9pm ET, and on-site inside twenty-four hours when the fix needs hands. And demand explanations in plain English. A tech who cannot explain the problem simply will quietly become the only person who understands your business."
      },
      {
        "heading": "What to do next",
        "body": "Before you interview anyone, spend twenty minutes making an inventory: every account, who has access, where the passwords live, what renews when. That list makes any conversation with any provider ten times more useful. If you want us to walk through it with you, the consult is free and there is no pitch. And if your current IT person is doing right by you, keep them — you might not need us, and we would rather say so than take over something that works."
      }
    ],
    "faq": [
      {
        "question": "Is a solo IT person riskier than an IT company?",
        "answer": "Only if they are a single point of failure. Documentation, accounts in your name, and written response times matter more than headcount."
      },
      {
        "question": "What if my old IT guy controls my accounts?",
        "answer": "Start recovery now, while things are calm. Domains, email, and hosting can usually be reclaimed with proof of ownership, but it takes longer under pressure."
      },
      {
        "question": "How should I test a new IT provider?",
        "answer": "Give them one small paid job and watch three things: how fast they respond, whether the fix holds, and whether you understood their explanation."
      }
    ]
  },
  {
    "slug": "squarespace-vs-hiring-web-designer-reddit",
    "question": "Squarespace vs Hiring a Designer: the Reddit Debate, Settled Honestly",
    "short": "Short answer: Reddit is right that Squarespace is enough for many simple businesses — and right that most owners never finish the DIY site they start. The honest question is not which tool wins. It is whether your evenings are the budget.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "This debate replays weekly. Is Squarespace enough for a small business, or do I need something custom? Why would I pay a designer thousands when the template looks fine? I have been building my own site for three months and it is still not live — should I give up and hire someone? And from the other side: I paid a designer and got something I cannot edit myself — was that a mistake? The honest subtext of most threads is time and confidence, not technology."
      },
      {
        "heading": "The consensus",
        "body": "The crowd lands in a sensible place. Squarespace is genuinely good for getting a clean site live fast, especially for portfolios, restaurants with simple menus, and service businesses that mostly need hours, photos, and a contact path. Designers earn their fee when you need custom features, serious local search work, integrations with booking or ordering tools — or when you have tried the DIY route and the site has sat half-finished for months. The most honest recurring comment: the tool was never the hard part; deciding what to say was."
      },
      {
        "heading": "Where Reddit's advice breaks down for NYC",
        "body": "Generic advice assumes a site just needs to exist. In New York, your website is competing block by block. Template defaults do not write neighborhood-specific pages, structure your services the way locals search, or connect cleanly to your Google Business Profile — the things that decide whether you appear when someone two blocks away searches for what you sell. And the DIY time math is different here: the average NYC owner is already working the floor, doing the books, and handling staff. The weekend the site was supposed to take does not exist."
      },
      {
        "heading": "Our honest take",
        "body": "We build websites for a living, so we are a biased referee — noted. Here is the honest split we use on real consults. If your business is simple, you have a decent eye, and you genuinely have the hours, Squarespace is fine and we will tell you exactly that. Hire someone when the site must produce revenue — calls, bookings, orders — and every week it underperforms costs you customers, or when your half-built draft has been quietly stealing your Sundays. Our small-business builds take fourteen days, and you keep the keys: your domain, your accounts, editable by you."
      },
      {
        "heading": "What to do next",
        "body": "Try this test tonight: write the five pages your site needs and the one action a visitor must take. If that flows easily and you have the time, build it yourself with our blessing. If you stall on page one — that is your answer, and it is nothing to be embarrassed about. Either way, the consult with us is free and there is no pitch. You might not need us. Plenty of owners leave that call with a plan to finish it themselves, and we count that as a win."
      }
    ],
    "faq": [
      {
        "question": "Is Squarespace good enough for a small business website?",
        "answer": "Often yes — if your needs are simple and you will actually finish and maintain it. The tool is rarely the bottleneck; owner time is."
      },
      {
        "question": "When is hiring a designer worth it?",
        "answer": "When the site must generate revenue and you would rather run your business than build web pages. A stalled DIY site has a real cost in missed customers."
      },
      {
        "question": "Can a designer build on Squarespace so I can edit it later?",
        "answer": "Yes, and it is a fair middle path: professional structure and local search setup, with day-to-day edits staying easy and in your hands."
      }
    ]
  },
  {
    "slug": "wix-vs-custom-website-reddit",
    "question": "Wix vs Custom Website — Reddit's Take vs Ours",
    "short": "Short answer: Reddit is right that the old Wix-is-bad-for-Google claim is outdated, and right that you cannot take a Wix site with you when you leave. Wix is fine as a starting point. Custom earns its cost when the website is a revenue channel.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "The Wix threads circle a few worries. Is Wix actually bad for showing up on Google, or is that an old myth? Am I stuck forever if I build on it — can I export my site later? Why does my Wix site feel slow on phones? Is paying for a custom build ever worth it for a small shop, or is that for companies with real budgets? And the recurring confession: I built it myself in a weekend, it looked fine, and a year later I have no idea if it is doing anything for me."
      },
      {
        "heading": "The consensus",
        "body": "Reddit has mostly caught up with reality. The claim that Wix sites cannot rank on Google is treated as outdated — the platform's basics are fine now, and commenters regularly point at local businesses ranking well on it. The lock-in complaint, though, is accurate and repeated constantly: a Wix site cannot be meaningfully exported, so leaving means rebuilding from scratch. On custom builds, the crowd is fairly wise — worth it when you need speed, integrations, or specific features; wasted money when a template covers the actual need."
      },
      {
        "heading": "Where Reddit's advice breaks down for NYC",
        "body": "The threads treat a website like a brochure. For a New York storefront it is closer to a front door. Your customers find you on a phone, often literally walking, and the difference between a site that loads instantly with a tap-to-call button and one that stutters through a template's extras is measured in missed customers. Neighborhood-level search is a knife fight here — the winners have pages structured around what locals actually type, tight connections to their Google profile, and real proof. Platform defaults, Wix or otherwise, do not do that work by themselves."
      },
      {
        "heading": "Our honest take",
        "body": "Bias on the table: custom builds are part of what we sell. The honest version anyway: if you need a presence this month and the budget is tight, a clean Wix site beats no site, and beats an expensive site that takes six months. Where custom pays is when the website is a revenue channel — bookings, orders, steady calls — and you need speed, local search structure, and integrations a template fights you on. One rule we hold either way: never rebuild out of shame. Rebuild when something measurable is broken: speed, visibility, conversions, or your ability to leave."
      },
      {
        "heading": "What to do next",
        "body": "Before touching any platform, answer two questions: what must this site do this year, and what happens if you outgrow the tool? If Wix covers both, use it with our blessing. If you are not sure, bring the questions to us — the consult is free and there is no pitch. Sometimes the honest answer is that your current site needs three fixes, not a rebuild, and sometimes it is that you do not need us at all. We are comfortable with both."
      }
    ],
    "faq": [
      {
        "question": "Is Wix bad for SEO?",
        "answer": "Not anymore in the way old threads claim. The platform basics are fine. Rankings depend far more on your content, local proof, and Google profile than the builder."
      },
      {
        "question": "Can I move my Wix site somewhere else later?",
        "answer": "Not really — content can be copied out by hand, but the site itself does not export. Leaving Wix means rebuilding, so factor that into the decision."
      },
      {
        "question": "When is a custom website worth it for a small business?",
        "answer": "When the site drives real revenue and a template is measurably costing you — slow pages, weak local visibility, or integrations that fight you."
      }
    ]
  },
  {
    "slug": "is-local-seo-worth-it-reddit",
    "question": "Is Local SEO Worth It? Reddit's Verdict for NYC",
    "short": "Short answer: Reddit's verdict is that SEO agencies are often a waste but local SEO itself is real — and that is basically correct. For NYC businesses, showing up in map results and neighborhood searches is worth serious effort. Much of it you can do yourself.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "The tone of these threads is burned-before. Is SEO just a scam? I paid an agency monthly for a year and cannot point to a single new customer — is that normal? Can I do local SEO myself, and where do I even start? How long before anything happens? The stories behind the questions are consistent: a contract with vague monthly reports, activity that never translated to the phone ringing, and an owner who cannot tell whether they bought something real. The skepticism is earned, and worth keeping."
      },
      {
        "heading": "The consensus",
        "body": "Reddit splits SEO into two piles, and it is a useful split. Pile one is the snake oil: guaranteed rankings, secret techniques, monthly retainers with reports nobody understands. Pile two is local SEO — the boring, legitimate work of a complete Google Business Profile, steady real reviews, accurate name and address everywhere, and pages that describe what you do and where. The crowd agrees pile two is real and mostly learnable. The most repeated advice is to fix your Google profile before paying anyone for anything, which is exactly right."
      },
      {
        "heading": "Where Reddit's advice breaks down for NYC",
        "body": "Just fill out your Google profile is table-stakes advice, and in New York the table is crowded. Every decent competitor within ten blocks filled theirs out too. Here the margins are won on specificity: pages that match how locals search — by neighborhood, by service, by problem — real photos over stock, review volume that keeps pace with foot traffic, and a website that backs up what the profile claims. NYC businesses also face density quirks the threads skip: shared buildings, similar business names, and category competition that barely exists in smaller markets."
      },
      {
        "heading": "Our honest take",
        "body": "Disclosure: local search help is one of our services, so we profit from one side of this argument. Honestly though — most owners can do the majority of local SEO themselves in a few focused weekends: complete the profile, add real photos, build a steady review habit, and make sure the website says what you do and where in plain language. Where paid help earns its keep is the remaining gap: competitive category, page structure, technical cleanup, and knowing which effort actually moves your specific needle instead of doing everything a checklist says."
      },
      {
        "heading": "What to do next",
        "body": "Search for your own business the way a stranger would — category plus neighborhood, on a phone — and see what shows up before you do. That single exercise tells you more than most audits. If you want a second pair of eyes on the results, the consult is free and there is no pitch. Often the honest outcome is a short list of fixes you can do yourself, and no reason to hire us at all. You might not need us — that answer is on the menu."
      }
    ],
    "faq": [
      {
        "question": "Can I do local SEO myself?",
        "answer": "Most of it, yes: complete your Google Business Profile, gather steady real reviews, use real photos, and describe your services and neighborhood plainly on your site."
      },
      {
        "question": "How long does local SEO take to show results?",
        "answer": "Profile fixes can move map visibility within weeks; content and review momentum builds over months. Anyone promising instant rankings is selling something."
      },
      {
        "question": "How do I know if an SEO provider is legit?",
        "answer": "They tie work to outcomes you can see — calls, direction requests, ranking for named searches — and can explain every task in plain English."
      }
    ]
  },
  {
    "slug": "google-business-profile-tips-reddit",
    "question": "Google Business Profile Tips Reddit Swears By — Checked by a Pro",
    "short": "Short answer: Reddit's favorite tips — complete every field, real photos, steady reviews, right category — are correct. The one it undersells: your primary category and review replies matter more than posting frequency. And keyword-stuffing your business name can get you suspended.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "Google Business Profile threads are a mix of tactics and mild panic. How do I get into the map results for my area? Do those weekly posts actually do anything? How many photos is enough? Should I put keywords in my business name since competitors seem to? Why did my views drop overnight? And the fearful ones — my profile got suspended and I do not know why, or a competitor seems to be reporting my listing. Owners sense the profile matters more than their website now, and they are often right."
      },
      {
        "heading": "The consensus",
        "body": "The standard advice stack that Reddit repeats: fill out every single field, choose your categories carefully, upload real photos regularly, collect reviews at a steady pace and reply to them, keep your name, address, and phone identical everywhere, and post updates now and then. It is a good list. The crowd is also rightly cynical about shortcuts — fake reviews and keyword-stuffed business names come up constantly, usually in threads that end with someone's profile suspended and a long reinstatement wait."
      },
      {
        "heading": "The pro check: what actually moves the needle",
        "body": "Checked against what we see managing real NYC profiles: the big levers are your primary category, your review velocity and replies, and the match between your profile and your website. Posting cadence is a minor signal at best — a weekly post habit will not rescue a wrong category. Photo authenticity beats photo volume. Review replies are underrated: they signal an active business and shape what future customers read. And the name-stuffing trick Reddit warns about is a genuine violation — it works until it triggers a suspension, and suspensions can take weeks to unwind."
      },
      {
        "heading": "Where it gets harder in NYC",
        "body": "Dense city, dense problems. Shared buildings and co-working addresses trip verification. Similar business names in the same category confuse Google's matching. Storefront-versus-service-area setup matters more here than the threads let on — configure it wrong and you can vanish from the neighborhoods you serve. And in crowded Manhattan and Brooklyn categories, a complete profile is just the entry fee; the ranking fight is won by reviews, proof, and the website behind the profile."
      },
      {
        "heading": "What to do next",
        "body": "Spend thirty minutes this week: confirm your primary category is the most specific true one, check your hours and phone, upload five real photos, reply to your last ten reviews, and make sure your website says what your profile says. That is most of the value, free, no vendor required. If something deeper is wrong — a suspension, a ranking mystery, a duplicate listing — the consult with us is free and there is no pitch. This is one area where you genuinely might not need us, and we will say so quickly if that is the case."
      }
    ],
    "faq": [
      {
        "question": "Do Google Business Profile posts help ranking?",
        "answer": "Barely, in our experience. They are worth doing for customers who read them, but category, reviews, and profile completeness matter far more."
      },
      {
        "question": "Is adding keywords to my business name a good idea?",
        "answer": "No. It violates Google's guidelines and is a common suspension trigger. Use your real business name and put keywords in your description and services instead."
      },
      {
        "question": "How many reviews do I need to compete in NYC?",
        "answer": "There is no magic number — steady pace beats totals. A profile gaining a few genuine reviews every month with replies outperforms a stale pile."
      }
    ]
  },
  {
    "slug": "web-developer-ghosted-me-reddit",
    "question": "Web Developer Ghosted You? Reddit's Advice, Improved",
    "short": "Short answer: Reddit says document everything, dispute the payment, and warn others. Fair — but the first move is different: secure what you own. Get control of your domain, hosting, and email today, before you spend one minute on blame.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "These threads read like breakup posts. My developer stopped answering three weeks ago and the site is half done — what now? I paid a deposit and got silence — can I get it back? The site is live but I have no logins to anything, and the only admin was his email address. Some askers are angry, most are embarrassed, and nearly all are asking the wrong first question — how do I punish this person — when the useful one is: what do I still control, and what do I need back?"
      },
      {
        "heading": "The consensus",
        "body": "Reddit's playbook: put everything in writing from now on, send one formal final notice, dispute the charge with your card company if the work was not delivered, consider small claims, and leave honest reviews. It is reasonable advice, and the preventive wisdom in the replies is genuinely good — pay by milestone, never let a contractor register your domain in their name, and keep your own copies of everything. We wrote about the warning signs in our Journal piece on spotting a developer who is about to ghost; the pattern is visible earlier than most owners think."
      },
      {
        "heading": "Where Reddit's advice breaks down",
        "body": "The threads jump straight to justice and skip triage. Blame does not get your website back. Before disputes and reviews, you need to know exactly what you own: is the domain registered in your name, your email address, your credit card? Who controls the hosting? Where does the site's email actually live? Chargebacks can even backfire — if the developer controls your hosting and you dispute the payment, the site can vanish mid-fight. Sequence matters: secure first, recover second, pursue the money last, if at all."
      },
      {
        "heading": "Our honest take",
        "body": "Disclosure: stranded projects come to us regularly, so we benefit when developers ghost — take our view with that in mind. Two honest observations from the takeover work. First, this happens to careful people; nice, competent-seeming developers disappear for their own life reasons, and it says nothing about you. Second, the fix is almost always smaller than the owner fears. Half-finished sites usually need weeks of work, not a restart, and domains and accounts can usually be recovered with proof of ownership. The panic is worse than the damage in most cases we see."
      },
      {
        "heading": "What to do next",
        "body": "Today: confirm who legally owns your domain, get admin access to hosting and email, change passwords on anything you control, and screenshot the current site. This week: send one calm, dated message with a deadline, then stop waiting. If you want help assessing what you have and what is missing, the consult is free and there is no pitch. Sometimes the honest answer is that your site is closer to done than you think and a cheaper freelancer can finish it — you might not need us, and we will say so."
      }
    ],
    "faq": [
      {
        "question": "My developer owns my domain. Can I get it back?",
        "answer": "Usually yes, with patience — registrars have transfer and dispute processes, and proof like business registration and payment records helps. Start before it becomes urgent."
      },
      {
        "question": "Should I dispute the payment right away?",
        "answer": "Not before securing access. If the developer still controls your hosting or domain, a dispute can escalate into your site going dark. Secure first."
      },
      {
        "question": "How do I stop this happening next time?",
        "answer": "Milestone payments, accounts registered in your name from day one, and your own copies of files and credentials. Our Journal guide covers the early warning signs."
      }
    ]
  },
  {
    "slug": "best-pos-system-small-business-reddit",
    "question": "Best POS for a Small Business: What Reddit Recommends",
    "short": "Short answer: Reddit's shorthand — Square for simplicity, Toast for restaurants, read the processing terms before signing anything — is a fine starting point. What the threads miss: the right POS depends on what it must connect to, not the logo on the terminal.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "POS threads are full of owners at decision points: opening a first location, outgrowing a cash box, or furious at their current provider. Which system is best for a small cafe, a boutique, a barbershop? Are the fees negotiable? Why does everyone hate their POS company's support line? Should I buy the hardware or lease it? And a steady stream of warnings about processing salespeople who cold-call promising lower rates and leave owners tangled in equipment leases and termination fees they never read."
      },
      {
        "heading": "The consensus",
        "body": "The crowd's shorthand is fairly stable. Square wins on simplicity: quick setup, transparent flat fees, decent free tier, hardware you own. Toast wins for full restaurants: kitchen screens, table management, online ordering built for food. Clover gets mixed reviews that usually trace back to whichever reseller sold it. Shopify POS makes sense when the online store is the anchor. The loudest agreement is negative: avoid long processing contracts and leased hardware from cold-callers, and read the early-termination terms before signing anything at all."
      },
      {
        "heading": "Where Reddit's advice breaks down for NYC",
        "body": "The threads pick a winner in a vacuum. A New York business picks a POS inside a web of other decisions: does it sync with your bookkeeping, your inventory, your website's online ordering, your booking system? High-volume, thin-margin city businesses feel fee structures differently — the right processing model for a slow boutique is wrong for a deli ringing up hundreds of small transactions a day. And nobody upstate is asking the NYC question: what happens when the terminal dies during Saturday rush and support is a phone queue?"
      },
      {
        "heading": "Our honest take",
        "body": "Where we sit: we do not sell POS systems and take no commission from any of them — our work is setting them up and connecting them to the rest of a business, which is its own bias worth naming. The pattern from that work: owners rarely suffer because they picked the wrong brand. They suffer because the POS is an island — sales retyped into spreadsheets, inventory counted twice, online orders on a separate tablet nobody reconciles. Pick the system that fits your service style, then spend real attention wiring it to everything else. That wiring is where the hours go."
      },
      {
        "heading": "What to do next",
        "body": "Write down your five most common transactions and everything that must happen after each one — receipt, inventory change, bookkeeping entry, follow-up. Any POS you audition, including the ones Reddit loves, should handle that list without manual patch-ups. If you want help mapping it, the consult is free and there is no pitch. Sometimes the honest outcome is that your current POS is fine and just needs two integrations — you might not need us, or a new system, at all."
      }
    ],
    "faq": [
      {
        "question": "Is Square good enough for a small business?",
        "answer": "For many, yes — simple setup, predictable fees, solid basics. Its limits show in complex restaurant service and deep inventory needs, where specialized systems earn their cost."
      },
      {
        "question": "What POS contract terms should I watch for?",
        "answer": "Early-termination fees, leased hardware you never own, and processing rates that can rise after an introductory period. Get every number in writing before signing."
      },
      {
        "question": "Should my POS connect to my website?",
        "answer": "If you sell online or take orders, yes — one inventory, one sales record. Running the website and register as separate worlds creates daily manual work."
      }
    ]
  },
  {
    "slug": "square-vs-toast-reddit",
    "question": "Square vs Toast — the Reddit Threads, Summarized",
    "short": "Short answer: Reddit's split decision is consistent — Square for counters, cafes, and simple service; Toast for full-service restaurants that live and die by kitchen flow. Both verdicts hold up. The contract terms and your service style decide it, not the brand.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "This matchup is a permanent fixture in restaurant and small-business threads. Is Toast worth it for a small spot, or is it built for bigger operations? Is Square too flimsy once you add a kitchen and servers? Owners trade stories in both directions — Toast's hardware and contracts feeling heavy for a counter-service cafe, Square straining when table service, coursing, and kitchen timing enter the picture. And underneath it all, the recurring practical questions: what do the fees really add up to, and what am I signing up for long-term?"
      },
      {
        "heading": "The consensus",
        "body": "The crowd verdict has barely moved in years: counter service, cafes, retail hybrids, and food trucks lean Square — simple, transparent, hardware you own outright. Full-service restaurants lean Toast — kitchen display, table and course management, online ordering that understands food. The consistent complaints are Toast's contract weight and add-on creep, and Square's ceiling in complex service. Support frustration shows up on both sides, which is worth internalizing: no POS choice buys you out of ever sitting in a phone queue."
      },
      {
        "heading": "Where Reddit's advice breaks down for NYC",
        "body": "Threads rarely account for New York realities. Manhattan margins make the fee structure math sharper — a busy spot ringing up small tickets all day feels percentage differences that a suburban restaurant shrugs off. Old buildings complicate everything: basement prep areas with dead wifi zones, multi-floor service, landlord wiring. And downtime costs scale with rent — a system outage during Friday dinner in the West Village is a different event than the same outage elsewhere. We keep a full comparison for Manhattan restaurants in the Journal, with the NYC-specific trade-offs spelled out."
      },
      {
        "heading": "Our honest take",
        "body": "Cards on the table: we set up and integrate both systems for restaurants, we sell neither, and we take no commission from either — but POS integration is work we get paid for, so factor that in. Our field view matches Reddit's split more than it contradicts it. Where we push back: owners fixate on picking the winner and underweight the setup — menu structure, printer routing, offline behavior, and how sales flow into bookkeeping decide daily sanity more than the logo does. A well-configured second choice beats a sloppily configured first choice every week."
      },
      {
        "heading": "What to do next",
        "body": "Define your service style honestly — counter, full table service, or hybrid — and read the full contract terms of whichever way you lean, including what leaving costs. Then read our Manhattan-specific comparison in the Journal for the local wrinkles. If you want to talk through your specific floor and volume, the consult is free and there is no pitch. If your current system is working and the pain is really a setup problem, we will say exactly that — you might not need to switch at all."
      }
    ],
    "faq": [
      {
        "question": "Is Toast overkill for a small cafe?",
        "answer": "Often, yes. Counter-service spots rarely use the kitchen and table features that justify Toast's weight. Square-style simplicity usually fits better."
      },
      {
        "question": "Can Square handle a full-service restaurant?",
        "answer": "Up to a point. It has restaurant features, but busy full-service spots with coursing and kitchen timing tend to outgrow it — which is where Toast earns its case."
      },
      {
        "question": "What should NYC restaurants check before committing?",
        "answer": "Total fee math at your real volume, contract exit terms, offline mode behavior, and whether the hardware suits your building. Our Journal comparison covers each."
      }
    ]
  },
  {
    "slug": "glossgenius-vs-square-appointments-reddit",
    "question": "GlossGenius vs Square Appointments: the Reddit Roundup",
    "short": "Short answer: Reddit's pattern is clear — solo stylists and chair renters lean GlossGenius for the polish and flat pricing; salons with staff and retail lean Square Appointments for the free tier and ecosystem. Both readings hold up in practice.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "In stylist and salon-owner threads the question is constant: which booking app should I run my chair on? Solo stylists ask whether GlossGenius is worth the monthly cost when Square Appointments starts free. Salon owners ask which handles multiple staff calendars without chaos. Everyone asks about the painful stuff: deposits and no-show protection, what happens to client cards on file if you switch, whether clients find the booking flow easy, and how badly a migration hurts when your whole book lives inside the old app."
      },
      {
        "heading": "The consensus",
        "body": "The crowd sorts itself neatly. Independent stylists and chair renters tend to praise GlossGenius — the booking pages look polished, the flat subscription is predictable, and the whole experience flatters a personal brand. Salons with employees, retail products, and higher volume lean Square Appointments — the free solo tier, cheap card hardware, and the fact that payments, payroll, and inventory can live in one ecosystem. The shared warnings: no-show policies matter more than app choice, and switching platforms mid-career is miserable enough that the first choice deserves real thought."
      },
      {
        "heading": "Where Reddit's advice breaks down for NYC",
        "body": "New York salon economics stress the generic advice. Chair renters here often run at volumes where a flat fee versus percentage-based processing changes the monthly math meaningfully — worth actually calculating, not vibing. Walk-in traffic still matters in city neighborhoods, so how the booking tool plays with your Google Business Profile can matter as much as the app's own booking page. And NYC no-show rates are their own legend — deposit settings are not an optional feature here, they are the feature. Our full comparison for NYC salons lives in the Journal with the details."
      },
      {
        "heading": "Our honest take",
        "body": "Bias disclosed: we set up booking systems for salons as paid work, and we sell neither product. From real setups: both tools are genuinely good, and the unhappy owners we meet are rarely on the wrong app — they are on the right app configured wrong. Deposits off, reminders default, services listed in a way clients misread, booking link buried on Instagram instead of wired into Google. Pick by your structure — solo polish versus team-and-retail ecosystem — then spend an afternoon on the settings that actually protect your income."
      },
      {
        "heading": "What to do next",
        "body": "Count your last month honestly: how many no-shows, how much retail, how many staff calendars. That data picks your platform better than any thread. Then read our NYC salon comparison in the Journal for the full breakdown. If you want a second opinion on your setup, the consult is free and there is no pitch — and if your current app just needs its deposit and reminder settings fixed, that is a ten-minute answer and you might not need us beyond it."
      }
    ],
    "faq": [
      {
        "question": "Is GlossGenius worth it for a solo stylist?",
        "answer": "Often yes — polished client-facing booking and predictable flat pricing suit independents. Do the fee math at your real volume before deciding."
      },
      {
        "question": "Is Square Appointments really free?",
        "answer": "The solo tier is, with processing fees per payment. Costs appear as you add staff and features — reasonable, but read the tier list before building your book on it."
      },
      {
        "question": "What matters more than which booking app I pick?",
        "answer": "Deposits, reminder settings, and a booking link connected to your Google profile. Misconfigured settings cost NYC stylists more than platform choice does."
      }
    ]
  },
  {
    "slug": "shopify-vs-squarespace-reddit",
    "question": "Shopify vs Squarespace — Reddit's Answers for NYC Retail",
    "short": "Short answer: Reddit's rule of thumb — Shopify when selling is the business, Squarespace when the site is mostly presence with some selling — is right. For NYC retail the deciding question is inventory: if the shop floor and the website must share stock, Shopify pulls ahead.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "Retail threads run this matchup constantly. I have a small shop and want to sell online — is Shopify overkill? Why does my Shopify bill keep creeping up with every app I add? Is Squarespace commerce a toy, or enough for a boutique? Can either handle in-store pickup properly? Store owners ask about syncing the register with the website, photographers and makers ask whether they even need real e-commerce, and everyone asks some version of: which one will not eat my evenings?"
      },
      {
        "heading": "The consensus",
        "body": "The crowd's split is stable and sensible. Shopify is the serious commerce engine: real inventory management, every payment and shipping integration, a POS that syncs with the online store — and costs that grow as apps stack up. Squarespace is the design-forward generalist: beautiful templates, simple setup, commerce that is perfectly fine for a modest catalog — and limits you will feel if selling becomes the main event. The most repeated wisdom: pick by where your revenue actually comes from, not by where you hope it might someday."
      },
      {
        "heading": "Where Reddit's advice breaks down for NYC",
        "body": "Most threads assume online-only sellers. NYC retail is different: the shop floor is the anchor, and the website orbits it. That flips the decision toward one question the threads barely touch — inventory sync. If a sweater sells on the floor, the website must know before a tourist orders the last one. Local pickup, neighborhood delivery, and showing stock to people searching nearby are NYC-relevant features, not nice-to-haves. Foot traffic plus Google visibility drives city retail in ways template galleries never mention. Our full NYC retail comparison in the Journal walks through this in detail."
      },
      {
        "heading": "Our honest take",
        "body": "Bias named: we build and fix retail sites on both platforms for a living. The honest sorting we use: if your shop's register and shelves must share truth with the website, Shopify with its POS is usually the cleaner path, and the app-fee creep is the toll you pay. If online selling is secondary — a presence, a catalog, occasional orders — Squarespace keeps life simpler and cheaper. The most common mistake we clean up is not the wrong platform; it is two disconnected systems and an owner reconciling them by hand at midnight."
      },
      {
        "heading": "What to do next",
        "body": "Answer one question first: does your inventory need to live in one place across floor and web? That answer picks your platform nine times out of ten. Then read our Shopify versus Squarespace comparison for NYC retail in the Journal. If you are still torn, the consult is free and there is no pitch — and if your current setup only needs a pickup flow and a stock sync rather than a migration, we will tell you that. You might not need to move at all."
      }
    ],
    "faq": [
      {
        "question": "Is Shopify too much for a small NYC boutique?",
        "answer": "Not if the floor and website share inventory — that sync is Shopify's strength. If online is a side channel, Squarespace's simplicity may serve you better."
      },
      {
        "question": "Why do Shopify costs keep growing?",
        "answer": "Apps. The base platform is predictable, but features often live in paid add-ons. Audit your app list quarterly and cut what the business stopped using."
      },
      {
        "question": "Can Squarespace handle in-store pickup?",
        "answer": "At a basic level, yes. If pickup, local delivery, and live stock visibility are core to your shop, that is the point where Shopify starts earning its complexity."
      }
    ]
  },
  {
    "slug": "does-my-small-business-need-a-website-reddit",
    "question": "Do I Even Need a Website? Reddit vs Reality in 2026",
    "short": "Short answer: Reddit is split — half say a Google profile and Instagram are enough, half say own your own ground. In 2026 the tiebreaker is that search engines and AI assistants answer customers by reading websites. If you are not there, someone else is the answer.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "This question shows up weekly, usually from busy owners hoping to be told no. All my work comes from word of mouth — why would I pay for a website? Is a Google Business Profile plus Instagram enough these days? Nobody visits websites anymore, right — everything is apps and maps? The honest current running through the threads: these owners are not lazy, they are booked. The website feels like homework for a class they are already passing. Sometimes they are right. Sometimes they are quietly capping their own growth."
      },
      {
        "heading": "The consensus",
        "body": "Reddit genuinely splits here. One camp: a complete Google profile, active Instagram, and full books — skip the website, spend the money elsewhere. The other camp answers with rented-land stories: accounts suspended with no appeal, algorithms burying pages that used to reach everyone, platforms changing rules overnight. Own your presence, they argue, because everything else is borrowed. Both camps agree on one floor: at minimum, keep your Google Business Profile complete and alive, because that is where local customers actually look first."
      },
      {
        "heading": "Where Reddit's advice breaks down in 2026",
        "body": "The threads are still arguing about 2019. The ground shifted: when a customer asks Google or an AI assistant who repairs espresso machines in Astoria or which salon nearby takes walk-ins, the answer is assembled from websites — their pages, their stated services, their neighborhoods. A business with no site gives these systems nothing to read, so the answer becomes a competitor. In NYC this bites harder: new residents, tourists, and anyone outside your word-of-mouth circle discover businesses through exactly these channels. Instagram alone is invisible to most of that machinery."
      },
      {
        "heading": "Our honest take",
        "body": "Obvious bias, named plainly: we build websites for a living, so we would say you need one. Here is the honest version anyway. A packed word-of-mouth business with no growth ambitions can genuinely skip it — if your books are full and your customers are loyal, a website changes little, and we tell owners that on consults. The real question is where your next customer comes from. If the answer is referrals forever, fine. If it is strangers searching — and in this city it usually is — you need ground you own that machines can read."
      },
      {
        "heading": "What to do next",
        "body": "Run the honest audit: are your books full, and would they stay full if two regulars moved away? Search your trade plus your neighborhood and see who owns the answers. If you want a plain read on whether a site would actually move anything for you, the consult is free and there is no pitch — and no is a real answer we give. You might not need us. But if you do need a site, ours take fourteen days, not four months."
      }
    ],
    "faq": [
      {
        "question": "Is a Google Business Profile enough without a website?",
        "answer": "It is the minimum, and for some full-book businesses it suffices. But profiles backed by real websites tend to rank better and give AI search something to cite."
      },
      {
        "question": "Do people still visit small business websites?",
        "answer": "Less as destinations, more as sources — search engines and AI assistants read them to answer customers. The site works even when nobody browses it."
      },
      {
        "question": "What is the smallest useful website?",
        "answer": "A fast page stating what you do, where, your hours, prices context, photos, and a way to call or book. Five sections done well beats twenty done badly."
      }
    ]
  },
  {
    "slug": "airtable-vs-notion-reddit-small-business",
    "question": "Airtable vs Notion for Small Business: Reddit Roundup",
    "short": "Short answer: Reddit's rule — Notion for documents and wikis, Airtable for structured records — is correct, and most fights start when someone forces one tool to do the other's job. For a small business the harder question is simpler: which one will your least techy person actually open?",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "The threads cycle through the same setups: can I run my whole business in Notion? Is Airtable a real database or a spreadsheet in a costume? Which should hold my client list, my orders, my content calendar? Why did my beautiful workspace turn into a junk drawer nobody updates? And the budget question, asked carefully: the per-person pricing looked fine for two people, so why does it sting at eight? Behind every question is a team that wants one tool to rule everything and keeps discovering there is no such tool."
      },
      {
        "heading": "The consensus",
        "body": "Reddit has settled this more cleanly than most matchups. Notion wins for documents, wikis, notes, and processes — anything you would explain or write down. Airtable wins for structured records — clients, orders, inventory, anything with fields you filter and count. The two loudest warnings repeat in every thread: forcing Notion to be a database ends in messy tables that hide errors, and any workspace without one person who owns its tidiness decays into a junk drawer within months. Both warnings are earned."
      },
      {
        "heading": "Where Reddit's advice breaks down for small business",
        "body": "Most advice comes from tech workers organizing their own information — people who enjoy tools. A shop, a salon, a contractor's office is a different world: the system must survive the least technical employee on their busiest day. A gorgeous linked workspace that only the owner understands is a liability with a subscription fee. There is also an NYC-flavored reality the threads skip: owner time. A setup demanding weekly gardening will not get it from someone working the floor sixty hours. We compare Airtable, Notion, and Monday for small teams in a full Journal guide."
      },
      {
        "heading": "Our honest take",
        "body": "Bias named: we set up and untangle these systems for small businesses as paid work. What that work teaches: the tool choice matters less than three design rules. Keep it boring — fewer views, fewer links, clearer names. Put one person in charge of structure. And only track what someone will act on; data collected for its own sake rots. Most failed setups we inherit did not pick the wrong app — they built something clever where they needed something durable. Clever impresses in week one; durable still works in month six."
      },
      {
        "heading": "What to do next",
        "body": "List the three pieces of information your business loses most often — quotes, follow-ups, stock counts, whatever hurts. Pick the tool whose shape fits those three, using the docs-versus-records rule, and build only that. Our Journal comparison of Airtable, Notion, and Monday goes deeper if you are weighing all three. If you want help designing something your whole team will actually use, the consult is free and there is no pitch — and if a shared spreadsheet honestly covers it, we will say that. You might not need either app, or us."
      }
    ],
    "faq": [
      {
        "question": "Can I run my whole business in Notion?",
        "answer": "You can, but structured records — orders, clients, inventory — get fragile in it. Most teams do better with Notion for docs and something table-shaped for data."
      },
      {
        "question": "Is Airtable worth paying for over a spreadsheet?",
        "answer": "When multiple people update the same records and you need views, filters, and forms — yes. For one person's simple list, a spreadsheet is honestly fine."
      },
      {
        "question": "Why do our workspaces always turn into junk drawers?",
        "answer": "No owner and no pruning. Someone must be in charge of structure, and anything nobody updated in a quarter should be archived without ceremony."
      }
    ]
  },
  {
    "slug": "nyc-small-business-tech-help-reddit",
    "question": "Where NYC Owners Actually Get Tech Help (Reddit Included)",
    "short": "Short answer: NYC owners get tech help from referrals, neighborhood groups, Reddit threads, city small-business programs, and whoever built the last thing that worked. Referrals are the best of these — and even they only work if you know what to ask for.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What people actually ask on Reddit",
        "body": "In the NYC subreddits, tech-help requests arrive raw: who do you use for your shop's website? My POS guy retired, who is good in Brooklyn? Any recommendations for someone who can fix our wifi and not disappear? The asks reveal the real search behavior — owners do not want a directory of providers, they want one name attached to a story from someone with a business like theirs. The replies are a lottery: sometimes a genuinely good referral, sometimes a self-promoting agency, often silence."
      },
      {
        "heading": "Where the help actually comes from",
        "body": "Piece the threads together and a map emerges. Personal referrals from neighboring businesses top the list — the deli owner asks the florist who fixed her card reader. Neighborhood WhatsApp and Facebook groups carry constant vendor chatter. The city itself runs real programs: NYC Small Business Services offers free courses and advising that many owners never discover. Business improvement districts sometimes broker help. And a large share of owners simply call whoever built the last thing — the cousin who knows computers, the friend's web guy — with results as mixed as you would expect."
      },
      {
        "heading": "Where the usual channels break down",
        "body": "Each channel has a failure mode the threads gloss over. Referrals inherit the referrer's standards — the florist's guy is only as good as what a florist knows to check, and a technician great at wifi may be wrong for your website. City programs are genuinely useful for education and planning but move at government speed; they cannot help when your site is down on a Friday. Group-chat vendors are unvetted by definition. And the cousin who knows computers becomes a single point of failure whose documentation lives nowhere."
      },
      {
        "heading": "Our honest take",
        "body": "Full disclosure: we are one of the options in this ecosystem — websites, IT, and business systems are what we sell — so this take promotes a game we play in. The honest advice regardless of who you hire: a fit test beats a brand name. Ask any candidate three things. What exactly will you do, in plain English? What do you promise in writing — ours is a free consult, fourteen-day website builds, callbacks within two hours from 9am to 9pm ET, and on-site within twenty-four hours. And who owns the accounts when we are done? The answer should always be you."
      },
      {
        "heading": "What to do next",
        "body": "Use the channels in the right order: referrals from businesses shaped like yours first, city resources for free education and planning, groups and threads for leads you then vet yourself. Bring the three fit-test questions to every conversation, including one with us if you like — the consult is free and there is no pitch. If your current setup is honestly fine, or your existing person is doing right by you, we will say exactly that. You might not need us, and knowing that for sure is worth a phone call."
      }
    ],
    "faq": [
      {
        "question": "Are the city's free small-business resources worth using?",
        "answer": "Yes — NYC Small Business Services runs free courses and advising that are genuinely useful for planning. They are not built for urgent technical fixes."
      },
      {
        "question": "How do I vet a tech provider a friend recommended?",
        "answer": "Ask what they will do in plain English, what response times they put in writing, and whether every account ends up owned by your business. Then test with one small job."
      },
      {
        "question": "Is asking on Reddit or neighborhood groups a bad idea?",
        "answer": "It is a fine way to gather names, not a way to vet them. Treat every group-chat recommendation as a lead that still needs the same three questions."
      }
    ]
  },
  {
    "slug": "google-business-profile-suspended",
    "question": "Google Business Profile Suspended? What to Do (NYC Guide)",
    "short": "Short answer: do not panic-edit and do not create a new profile. Figure out which rule you tripped, fix it fully, then file one complete reinstatement request with proof your business is real. Most suspensions are recoverable — repeat appeals without fixes are not.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What to check first",
        "body": "Confirm what kind of suspension you have. If your profile simply vanished from Maps and search but you can still log in, that is a soft suspension — the listing is unverified but alive. If you cannot manage the profile at all, the account itself is suspended, which is more serious. Then reconstruct the timeline: what changed in the days before? A new address, an edited business name, a category swap, a burst of changes, a new user added? Suspensions almost always follow an edit, and knowing which one guides everything after."
      },
      {
        "heading": "The usual culprits",
        "body": "The most common triggers we see on NYC profiles: keywords stuffed into the business name field, which violates guidelines even when competitors get away with it; address problems — virtual offices, co-working spaces, residential addresses on storefront listings, or a move handled as a sloppy edit; picking a category that does not match the actual business; too many edits in a short window; and running a service-area setup while displaying an address you do not staff. Dense city buildings with many similar businesses at one address make Google touchier here than the guides admit."
      },
      {
        "heading": "What to do right now",
        "body": "Resist the two panic moves: mass-deleting information and creating a fresh profile. A duplicate profile violates the rules and can sink both listings. Instead, fix the root cause completely — restore your real business name, use your actual address or correct service-area settings, choose the most specific true category. Then gather proof this business exists: photos of your storefront and signage, a utility bill or lease matching the address, business registration, and a working website that shows the same name and address. File one reinstatement request with everything attached. One complete request beats five thin ones."
      },
      {
        "heading": "While you wait",
        "body": "Reinstatement reviews take days to weeks, and the wait is the worst part. Keep the rest of your presence carrying the load: your website still ranks in regular search results, so make sure hours, phone, and services are current there. Reviews and photos on the suspended profile are normally restored with it, so do not rebuild elsewhere. Keep serving customers, keep collecting reviews the honest way for later, and do not submit new appeals on top of the pending one — stacking requests resets nothing and can slow the queue."
      },
      {
        "heading": "When to call for help",
        "body": "Call for help if the suspension is bleeding real revenue — you have gone quiet on Maps in a neighborhood that finds you there — or if a first reinstatement was denied and you cannot see why. We handle these for NYC businesses, and we return calls within two hours between 9am and 9pm ET. Honest framing, since we profit from saying otherwise: many owners get reinstated on their own with exactly the steps above, and the consult where we tell you that is free, with no pitch. You might not need us — bring the denial notice and we will give you a straight read either way."
      }
    ],
    "faq": [
      {
        "question": "How long does Google Business Profile reinstatement take?",
        "answer": "Typically several days to a few weeks. One complete request with strong proof moves fastest; repeated thin appeals can slow everything down."
      },
      {
        "question": "Will I lose my reviews after a suspension?",
        "answer": "Usually no — reviews and photos normally return when the profile is reinstated. That is one more reason not to start a new profile from scratch."
      },
      {
        "question": "Can I just create a new profile instead of appealing?",
        "answer": "No. Duplicate profiles violate Google's rules and can get both listings removed, turning a recoverable problem into a much longer one."
      }
    ]
  },
  {
    "slug": "website-down-emergency-nyc",
    "question": "Website Down? An Emergency Checklist for NYC Businesses",
    "short": "Short answer: first confirm it is down for everyone, not just you. Then check the three usual suspects in order — domain expiry, hosting billing, SSL certificate — before touching anything else. Most outages are a lapsed renewal, not a hack.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What to check first",
        "body": "Before anything, confirm the outage is real: load the site on your phone with wifi off, and ask someone outside your network to try. If it works for them, the problem is your connection, not the site. If it is down for everyone, note exactly what the screen says — a domain parking page, a security warning, a hosting error code, or an endless spinner each point somewhere different. Then ask the question that solves most cases: what changed recently? An update, a new plugin, an expired card, an email from your registrar you meant to read?"
      },
      {
        "heading": "The usual culprits",
        "body": "In rough order of frequency for small-business sites: the domain expired because a renewal notice went to an old email address; the hosting payment failed when a card expired and the account lapsed; the SSL certificate ran out, so browsers now show a scary warning that drives everyone away; an automatic update or plugin change broke the site overnight; or DNS settings were changed — often during an email migration — and the domain no longer points at the site. Actual hacks happen, but they are far rarer than a quiet billing failure nobody noticed."
      },
      {
        "heading": "What to do right now",
        "body": "Search your email, including spam, for your domain registrar and hosting company names — expiry and payment-failure notices are usually sitting right there. Log into the registrar first: if the domain lapsed, renew it immediately; recently expired domains usually restore within hours. Next, check the hosting account for billing holds and the host's own status page for outages on their end. If the site broke right after an update or edit, use the host's backup or restore point rather than trying to fix forward. And do not start a panicked rebuild — you will lose the version you had."
      },
      {
        "heading": "Stop the bleeding while it is down",
        "body": "Your website being down does not have to mean your business is invisible. Your Google Business Profile still shows in Maps and search — make sure hours and phone number are right, and post an update there if customers need to know anything. Phone lines, Instagram, and your booking tool keep working independently of the site. If your email runs on the same domain and has also gone quiet, treat the whole thing as one incident — that combination almost always means a domain or DNS problem, and it makes renewal step one."
      },
      {
        "heading": "When to call for help",
        "body": "Call in help if the domain or hosting account is locked to a person you cannot reach — a former developer, an old employee's email — or if you have restored and renewed and the site is still dark. That recovery work is exactly what we do: we return calls within two hours between 9am and 9pm ET, and when hardware or wiring is the issue we are on-site within twenty-four hours. Said honestly, because it is true: a solid share of these calls end with us pointing at a renew button and wishing the owner well, free, no pitch. You might not need us — but do not lose a week finding out."
      }
    ],
    "faq": [
      {
        "question": "How do I know if my website is down for everyone or just me?",
        "answer": "Load it on your phone with wifi off, or ask someone outside your building to try. If it loads for them, the issue is your network, not the website."
      },
      {
        "question": "My domain expired. Is the website gone forever?",
        "answer": "Almost never. Recently expired domains can usually be renewed and restored within hours. Act fast though — long-lapsed domains can be resold."
      },
      {
        "question": "Was my site hacked?",
        "answer": "Probably not — billing lapses and expired certificates cause far more outages than attacks. But if you see defaced pages or strange redirects, treat it as a hack and get help."
      }
    ]
  },
  {
    "slug": "pos-system-down-restaurant-nyc",
    "question": "POS Down During Service? A Restaurant Triage Guide",
    "short": "Short answer: figure out in sixty seconds whether it is your internet, your POS provider, or one dead device — the fixes are completely different. Then switch to offline mode or paper, keep serving, and do the real diagnosis after the rush, not during it.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What to check first",
        "body": "Triage fast, in this order. Is it one terminal or all of them? One device means hardware — grab the backup or restart it. All devices: can your phone load a website on the restaurant wifi? If not, your internet is down and the POS is an innocent victim. If the wifi works, check your POS provider's status page from your phone — cloud systems have outages, and during a big one the status page and their social accounts light up. Sixty seconds of this beats twenty minutes of rebooting things at random while tickets pile up."
      },
      {
        "heading": "The usual culprits",
        "body": "The repeat offenders in city restaurants: the internet connection itself — a failed router, an ISP outage on the block, or a cable someone kicked loose behind the bar; the POS provider's cloud having a bad day, which takes every restaurant on that platform down at once; a software update that ran overnight and left a terminal confused; hardware death — receipt printers and card readers lead the league; and power problems on overloaded circuits. Old NYC buildings add their own flavor: basement prep areas with weak wifi and wiring nobody has mapped since the previous tenant."
      },
      {
        "heading": "What to do right now, mid-service",
        "body": "Keep serving — the system failure does not have to become a service failure. Most major POS platforms have an offline mode that keeps taking card payments and syncs them later; know that it typically comes with risk on declined cards, and the setting must usually be enabled before you need it. If the internet is the problem, a phone hotspot can carry a terminal through a rush. Otherwise: paper tickets to the kitchen, a notepad for tabs, and one person appointed to track everything. Cash still works. Stay calm in front of guests — most will never know."
      },
      {
        "heading": "After service: make it never happen again",
        "body": "Once the night is over, do the real diagnosis: what exactly failed, and what would have kept you running? The fixes are unglamorous and cheap compared to one lost Friday: a backup internet source, whether a hotspot kept charged or a second connection; offline mode enabled and actually tested during a quiet shift; a spare card reader and printer in a drawer; the router on a small battery backup; and a one-page laminated sheet telling staff exactly what to do when screens go dark. Restaurants that do this lose minutes to outages. Restaurants that do not lose whole services."
      },
      {
        "heading": "When to call for help",
        "body": "Call for help when outages keep repeating and nobody can say why, when the wifi in your building has permanent dead zones, or when the honest answer is that nobody set the system up deliberately in the first place. This is core work for us with NYC restaurants: we return calls within two hours between 9am and 9pm ET, and we are on-site within twenty-four hours when hands are needed. The honest caveat, free of charge: if last night was your provider's cloud outage, no local fix would have saved you, and switching platforms in anger will not either. The consult is free, no pitch — you might not need us, just a backup plan."
      }
    ],
    "faq": [
      {
        "question": "Can I take card payments when the internet is down?",
        "answer": "Usually yes, through your POS's offline mode — payments queue and sync later, with some risk on declines. Enable and test it before the night you need it."
      },
      {
        "question": "Should I switch POS providers after an outage?",
        "answer": "Not in anger. Every provider has outages. Switch for repeated failures your setup cannot absorb, and only after checking whether the real weakness was your internet."
      },
      {
        "question": "What backup gear should a small restaurant keep?",
        "answer": "A charged hotspot or second internet source, a spare card reader and receipt printer, a battery backup on the router, and a printed what-to-do sheet for staff."
      }
    ]
  },
  {
    "slug": "business-email-going-to-spam",
    "question": "Your Business Email Is Going to Spam — Here's Why",
    "short": "Short answer: your domain is probably missing its ID papers — three DNS records called SPF, DKIM, and DMARC that prove your email is really from you. Since inbox providers tightened rules in 2024, mail without them lands in spam even when it is perfectly legitimate.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What to check first",
        "body": "Narrow the pattern before touching settings. Is everything going to spam, or only mail to certain places — say, everyone on Gmail? Is it one-to-one emails, or the newsletters and invoices your systems send in bulk? Did this start suddenly, and if so what changed around then — a new marketing tool, a website move, a new sender on the account? Then run one honest test: send a normal email to a friend on a different provider and see where it lands. Sudden, uniform spam placement usually means a technical record broke. Gradual decay usually means reputation."
      },
      {
        "heading": "The usual culprits",
        "body": "The big one: missing or broken authentication records. SPF, DKIM, and DMARC are three small DNS entries that act as your domain's ID papers — they tell Gmail and the rest that a message claiming to be from you actually is. Without them, honest mail looks forged. Other regulars: sending bulk mail like newsletters straight from a normal inbox instead of a proper sending service; a compromised account quietly blasting junk and torching your reputation; spammy habits like all-image emails, misleading subject lines, or big attachment blasts; and a mismatch where your website moved but your email records did not follow."
      },
      {
        "heading": "What to do right now",
        "body": "First, run your domain through one of the free email-authentication checkers online — they grade a test message and show which of the three records exist. Takes five minutes and turns guessing into a diagnosis. If records are missing, whoever manages your domain or email — your provider's support desk can usually do it — needs to add them; it is settings work, not a rebuild. Pause any newsletters and automated blasts until the records pass, because every send while broken digs the reputation hole deeper. And check your sent folder for mail you did not write — if you find any, change the password now."
      },
      {
        "heading": "Why this got suddenly stricter",
        "body": "In early 2024 the biggest inbox providers stopped treating authentication as optional. Google and Yahoo began requiring bulk senders to authenticate with these records, keep complaint rates low, and offer one-click unsubscribe — and mail failing the bar increasingly goes to spam or gets rejected outright. The change caught thousands of small businesses whose email had worked fine for a decade. Nothing was wrong with what they wrote; the ground rules moved. The records are now simply the cost of entry, the same way a padlock icon became mandatory for websites."
      },
      {
        "heading": "When to call for help",
        "body": "Call for help if the checker results read like alphabet soup, if your domain and email are split across providers nobody remembers choosing, or if a compromised account is in the mix — those need cleaning up quickly and properly. We set these records straight for NYC businesses routinely, and we return calls within two hours between 9am and 9pm ET. The honest version first, though: your email provider's own support can often fix this for nothing, and if that is your situation we will say so. The consult is free, there is no pitch, and you might not need us — you might need three DNS records and a password change."
      }
    ],
    "faq": [
      {
        "question": "What are SPF, DKIM, and DMARC in plain English?",
        "answer": "Three small settings on your domain that prove your email really comes from you. Inbox providers treat mail without them as suspicious, no matter how legitimate it is."
      },
      {
        "question": "Why did my email suddenly start going to spam in 2024?",
        "answer": "Google and Yahoo tightened requirements for senders — authentication records, low complaint rates, easy unsubscribe. Mail that misses the bar now gets filtered much harder."
      },
      {
        "question": "Can I send my newsletter from my regular inbox?",
        "answer": "You should not. Bulk mail from a normal inbox hurts your domain's reputation. Use a proper email service and keep your day-to-day address for conversations."
      }
    ]
  },
  {
    "slug": "google-reviews-not-showing-up",
    "question": "Google Reviews Not Showing Up? The Honest Reasons",
    "short": "Short answer: Google's filter removes or hides reviews it finds suspicious — bursts from one location, brand-new accounts, anything that smells incentivized — and it catches honest ones in the net. Most missing reviews were filtered, not lost, and prevention beats appeal.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What to check first",
        "body": "Pin down what missing means. Did the customer definitely post it — can they still see it in their own Google account? A review that exists there but not publicly has been filtered. Is your total count lower than yesterday, meaning something was removed, or did a new review simply never appear? Check your profile's health too: a suspended or flagged profile hides reviews wholesale, which is a different problem from a single filtered one. And ask what the last week looked like — a review station at the register, a staff push, an event — because timing is usually the clue."
      },
      {
        "heading": "The usual culprits",
        "body": "Google filters reviews by pattern, and the patterns that trip it are predictable: a burst of reviews in a short window, especially from the same wifi network — the classic tablet-at-the-counter setup; reviews from brand-new or barely used Google accounts, which weigh almost nothing; anything incentivized, since discounts-for-reviews violate policy outright; reviews from your own staff or family; text containing links or phone numbers; and gating — asking only your happy customers to post, which is also against the rules. None of this requires bad intent. A well-meaning review drive can trip every wire at once."
      },
      {
        "heading": "What to do right now",
        "body": "If a review push is running, pause it — every filtered burst makes the profile look more suspicious. For a specific legitimate review that vanished, the customer posting again from their normal connection, a few days later, in their own words, often sticks where the first attempt did not. You can raise genuinely missing reviews with Google's business support, but expectations matter: filtered reviews are rarely reinstated, and support will not explain the filter. Meanwhile, reply to the reviews you do have — it signals a real, attended business, which is quiet protection."
      },
      {
        "heading": "What not to do",
        "body": "Do not buy reviews — city businesses get burned on this constantly, the fake batches get detected and purged, and the profile carries the stain after. Do not organize review swaps with other businesses; the reciprocal pattern is exactly what the filter hunts. Do not have staff or relatives fill the gap. And do not spin up a new profile to escape a messy one — duplicates violate the rules and endanger both listings. The honest math: a steady trickle of real reviews, asked for politely and spread over time, outruns every shortcut, and it is the only approach with zero downside."
      },
      {
        "heading": "When to call for help",
        "body": "Get help if reviews are vanishing alongside other symptoms — ranking drops, profile warnings, a suspension — or if you suspect a competitor is mass-reporting your legitimate reviews, which happens in crowded NYC categories and is worth documenting properly. We work on these cases and return calls within two hours between 9am and 9pm ET. But the honest read costs nothing: if a handful of reviews from your counter tablet got filtered, the fix is changing how you ask, not hiring anyone. The consult is free, no pitch — you might not need us, just a better review habit."
      }
    ],
    "faq": [
      {
        "question": "Why did a real five-star review disappear?",
        "answer": "Most likely Google's filter — new reviewer account, same-network posting, or a burst pattern. The reviewer reposting later from their own connection often works."
      },
      {
        "question": "Can filtered reviews be restored?",
        "answer": "Rarely. Support can look into clearly missing legitimate reviews, but the filter's decisions mostly stand. Prevention — steady, unprompted-looking asks — is the real fix."
      },
      {
        "question": "Are QR codes asking for reviews against the rules?",
        "answer": "QR codes are fine. The trouble starts when many customers post from the same location and network in a burst, or when only happy customers get the code."
      }
    ]
  },
];

export const caseStudies: CaseStudy[] = [
  {
    type: "Film production company",
    client: "CC Films",
    url: "https://ccfilms.net",
    slug: "cc-films",
    metrics: [
      { value: "Official source", label: "Behaves like one, not a brochure" },
      { value: "Schema + headers", label: "Hardened for search + crawlers" },
      { value: "Netlify + GitHub", label: "Existing deploy path kept" },
    ],
    image: "/assets/case-cc-films.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-05-13",
    updated: "2026-07-07",
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
    metrics: [
      { value: "Low-latency", label: "Speed treated as a core feature" },
      { value: "3-in-1", label: "Onboard guide · social · memory layer" },
      { value: "Live", label: "getdeckspace.com" },
    ],
    image: "/assets/case-deckspace.webp",
    services: ["custom-local-websites", "business-systems"],
    published: "2026-05-13",
    updated: "2026-07-07",
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
    metrics: [
      { value: "100", label: "Lighthouse, across the board" },
      { value: "2 weeks", label: "Instagram-only → real booking site" },
      { value: "Square", label: "Booking kept — clients already knew it" },
    ],
    image: "/assets/case-hair-by-rachel-charles.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-05-13",
    updated: "2026-07-07",
    title: "From Instagram-only to a real booking flow.",
    problem: "A solo stylist running her whole business through Instagram and word-of-mouth — no website, no Google profile, no obvious way to book.",
    kept: "The existing Square Appointments setup the clients already knew.",
    changed: "Built a mobile-first website with a Square booking embed, set up the Google Business Profile from scratch, and wired neighborhood-specific SEO across the site.",
    result: "A real booking funnel that ranks for local searches. Lighthouse 100s across the board. Bookings now arrive without DM tag.",
    body: [
      "The first time we sat down with Rachel, her entire business was running through Instagram DMs. She had built a client base purely through word of mouth and showing up — but every booking required a back-and-forth in messages, every appointment confirmation lived in her thumbs, and Google had no idea she existed. The site started as a question: what if every potential client could find her, see the work, and book without a single message?",
      "We kept the part that was already working — her existing Square Appointments setup, which her clients already knew. The site became the front door: a mobile-first page with the portfolio, the location, a Square booking embed, and a clear path to the studio. We set up the Google Business Profile from scratch — address, hours, categories, photos, FAQs — and wired the site metadata to reinforce it. The whole engagement took two weeks.",
      "Bookings now arrive through the site — found in search instead of tagged in DMs. Lighthouse scores landed at 100 across the board. Rachel kept her DMs for client relationships, but the booking funnel moved off her phone.",
    ],
  },
  {
    type: "Streetwear brand",
    client: "After Hours Agenda",
    url: "https://www.afterhoursagenda.com",
    slug: "after-hours-agenda",
    metrics: [
      { value: "Next.js 14", label: "Custom build, no platform lock-in" },
      { value: "1 day", label: "To ship a new product drop" },
      { value: "Square + Printful", label: "Payments + fulfillment wired" },
    ],
    image: "/assets/case-after-hours-agenda.webp",
    services: ["custom-local-websites", "business-systems"],
    published: "2026-05-13",
    updated: "2026-07-07",
    title: "E-commerce that doesn't drown the brand.",
    problem: "A streetwear brand with a real point of view needed a real storefront — but Shopify's templates were going to flatten everything that made the brand interesting.",
    kept: "Brand identity, product designs, and the NYC nightlife voice.",
    changed: "Custom Next.js 14 build with Square handling payments and Printful handling fulfillment. Product catalog wired through a JSON master, no hardcoded prices, no platform lock-in.",
    result: "A storefront that looks like the brand instead of like a Shopify theme. Square payments and Printful fulfillment wired in. Owner can ship a new drop in a day.",
    body: [
      "After Hours Agenda is Little Fight NYC's own streetwear experiment — the rare case where the agency is also the client, with all the dangers that come with it. The brand was tight, the designs were ready, the audience was building, but the storefront was Shopify, and Shopify was flattening the brand. Every product page looked like every other Shopify product page, regardless of what we put on it.",
      "The decision was: rebuild on Shopify with a custom theme, or rebuild off Shopify entirely. We rebuilt off — Next.js 14 with the App Router, Square for payments, Printful for fulfillment, the whole catalog wired through a single JSON master so nothing is hardcoded. No platform lock-in. No theme template gravity.",
      "The result is a storefront that looks like the brand instead of the platform. Payment flows through Square; orders go to Printful for shipping. New product drops take a day, not a sprint. The site is the brand.",
    ],
  },
  {
    type: "Help service",
    client: "ClearHelp",
    url: "https://www.clearhelp.org",
    slug: "clearhelp",
    metrics: [
      { value: "3 sites", label: "One shared Supabase backend" },
      { value: "Per-site CI", label: "Independent deploys on push" },
      { value: "Real-time", label: "Intake routing, no copying" },
    ],
    image: "/assets/case-clearhelp.webp",
    services: ["custom-local-websites", "business-systems"],
    published: "2026-05-13",
    updated: "2026-07-07",
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
    metrics: [
      { value: "3 tools → 1", label: "Estimates in one source of truth" },
      { value: "Every number", label: "Audits back to its source" },
      { value: "In production", label: "Runs on the team's real bids" },
    ],
    image: "/assets/case-public-house-cockpit.webp",
    services: ["business-systems"],
    published: "2026-05-13",
    updated: "2026-07-07",
    title: "An internal cockpit for the work they actually run.",
    problem: "Public House Creative needed a single internal system to run their estimating, classification, and reporting work — replacing a stack of spreadsheets, documents, and tribal knowledge with one source of truth.",
    kept: "The estimator's judgment and the workflow categories the team already used.",
    changed: "Built Cockpit — a private web application where documents come in, rooms and drivers get classified, the math reconciles, and the report exports cleanly. Field-precision UI, dense without being condensed.",
    result: "The team runs the work through Cockpit. Estimates that used to live across three tools live in one. The math is honest. The team can audit any number back to its source. In production and in daily use.",
    body: [
      "Public House Creative came to Little Fight with a real internal-systems problem. The estimating work — the part that determines whether a job is profitable before it starts — was spread across documents, spreadsheets, email threads, and the head of the senior estimator. Every project re-discovered the same context. Every quote took longer than it should have. The team had outgrown the tools and was starting to feel it.",
      "We built Cockpit. It is a private web application that turns the messy first pass of an estimate — site photos, blueprints, hand-drawn notes, scope emails — into a structured, reconcilable artifact. Documents come in. Rooms get classified. Drivers (the variables that move the math) get resolved. The report exports. The interface is field-precision: dense data, never condensed, never lying about confidence. The estimator's judgment makes the final call; the system makes the call cheap.",
      "Cockpit is in production. The team uses it on real estimates. The math is honest. New scope items, new room types, new export formats land in days, not sprints. The system is becoming what the senior estimator's head used to hold — but now it scales beyond one person."
    ],
  },
  {
    type: "Funding LLC",
    client: "Grand Funding LLC",
    url: "https://www.grandfundingllc.com",
    slug: "grand-funding-llc",
    metrics: [
      { value: "Type-led", label: "No finance-site cliches" },
      { value: "Schema", label: "Org · FinancialService · Person" },
      { value: "Live", label: "grandfundingllc.com" },
    ],
    image: "/assets/case-grand-funding-llc.webp",
    services: ["custom-local-websites"],
    published: "2026-05-13",
    updated: "2026-07-07",
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
    howItWorks:
      "Think of every job as a trip from a customer's first hello to the moment you get paid. A business system is the map for that trip: where a new inquiry lands, who picks it up, what happens next, and where the record of it is kept. When the steps are connected, a lead can't fall through a crack, because each step hands the work cleanly to the next. Most of the time you already own the tools to do this, they just aren't talking to each other yet.",
    example:
      "A neighborhood plumber gets calls, texts, and website forms all day. Right now each one lands somewhere different, and he only remembers to call people back when he's sitting in the truck. A business system funnels all three into one list, sends the customer an automatic 'got your message, we'll call within the hour' note, and reminds him if a job hasn't been quoted by end of day.",
    costOfIgnoring:
      "When there's no system, the leaks are invisible until you add them up: the callback that never happened, the quote that sat in a text thread, the repeat customer who booked the other guy because he answered first. None of these feel like a crisis on their own, but together they can quietly cost you a job or two a week. And the whole operation stays trapped in the owner's head, so you can never take a real day off.",
    related: ["workflow-automation", "crm", "software-stack"],
    faq: [
      {
        question: "Isn't a business system just more software I have to learn?",
        answer:
          "No. Usually it's connecting the tools you already pay for so they work together, plus cleaning up a few messy handoffs. The goal is fewer things to check, not more apps to log into.",
      },
      {
        question: "I'm a two-person shop. Am I too small for this?",
        answer:
          "Small shops benefit the most, because there's no big team to catch what falls through the cracks. When it's just you, a simple system is the difference between remembering everything and losing jobs you never knew you had.",
      },
    ],
  },
  {
    slug: "crm",
    term: "CRM",
    definition:
      "A customer relationship management system, usually the place where leads, customers, notes, follow-up, and sales history should live.",
    plain: "The list of people who asked for help, bought something, or need a reply.",
    whenItMatters:
      "It matters when customer notes are split between email, texts, spreadsheets, booking tools, and memory.",
    howItWorks:
      "A CRM is one shared list of everyone who's ever contacted you, with a little history attached to each name. When someone calls, emails, or books, their details go into that one place, along with notes on what they wanted and when you last talked. Then it reminds you who's waiting on a callback and who hasn't heard from you in a while. Instead of digging through your phone and inbox to remember a customer, you open one screen and it's all there.",
    example:
      "A dental office keeps patient reminders in a paper book, insurance notes on sticky pads, and 'call back about the crown' in someone's head. A CRM puts each patient's contact, last visit, and follow-up in one record, so when they call, whoever answers can see the whole picture, and nobody's six-month cleaning gets forgotten.",
    costOfIgnoring:
      "Without one place for people, the same customer gets asked the same question three times, and warm leads go cold because nobody remembered to follow up. Every repeat customer you lose track of is money you already earned once and let walk out the door. It also means the business lives in whoever's memory is best that day, which is fragile and impossible to hand off.",
    related: ["business-system", "workflow-automation", "software-stack"],
    faq: [
      {
        question: "Do I need an expensive CRM like the big companies use?",
        answer:
          "Almost never. Most small businesses are better off with something simple and cheap, set up to match how they actually work. A fancy CRM you don't use is worse than a plain one you do.",
      },
      {
        question: "I already have my customers in a spreadsheet. Isn't that enough?",
        answer:
          "A spreadsheet is a fine start, but it won't remind you to follow up or catch a lead the moment it comes in. A CRM adds the nudges and the shared access a growing shop needs.",
      },
    ],
  },
  {
    slug: "google-business-profile",
    term: "Google Business Profile",
    definition:
      "The free Google listing that controls how a local business appears in Search and Maps, including hours, phone, reviews, services, photos, and location.",
    plain: "The Google card people see before they ever reach your website.",
    whenItMatters:
      "It matters when competitors appear on Maps before you, hours are wrong, reviews are stale, or customers call with questions the profile should answer.",
    howItWorks:
      "When someone searches your business name, or 'florist near me,' Google shows a card with your hours, phone number, photos, reviews, and a map pin. That card is your Google Business Profile, and it's free to claim and control. You fill in the correct details, add real photos, list your services, and reply to reviews, and Google uses all of it to decide who to show and where. For a lot of local businesses, this card gets seen far more than the actual website.",
    example:
      "A corner florist has beautiful arrangements but a Google card with old hours and one blurry photo from years ago. A customer searching 'flower delivery near me' sees a competitor with fresh photos, 200 reviews, and a 'call' button, and picks them without a second thought. Fixing the florist's profile, real photos, current hours, a few review replies, puts them back in that first-glance comparison.",
    costOfIgnoring:
      "An ignored profile quietly sends your customers to whoever looks more alive on the map. Wrong hours cost you the person who drove over and found you closed, and that person often leaves a bad review on top of it. Since this is usually the very first thing a new customer sees, a stale card can lose the sale before they ever learn how good you are.",
    related: ["local-search", "business-system"],
    faq: [
      {
        question: "Is this the same as having a website?",
        answer:
          "No, and you need both. The website is your home; the Google profile is the sign on the busy street that points people to it. Many customers check the profile first and only visit the site if the card earns their trust.",
      },
      {
        question: "How do I get more reviews without being pushy?",
        answer:
          "The simplest way is to ask happy customers at the right moment, right after a good job, usually with a quick text or a link. A small, steady habit of asking beats any trick, and it keeps the card looking active.",
      },
    ],
  },
  {
    slug: "local-search",
    term: "Local search",
    definition:
      "The work that helps nearby customers find, trust, and choose a business through Google, Maps, service pages, reviews, and neighborhood signals.",
    plain: "Showing up when someone nearby is already looking.",
    whenItMatters:
      "It matters when the business depends on local customers, appointments, foot traffic, bookings, or service-area inquiries.",
    howItWorks:
      "When someone nearby searches for what you do, Google tries to answer with the businesses it trusts most for that area. Local search is the work of earning that trust: an accurate Google profile, clear pages that say what you do and where, steady reviews, and consistent name, address, and phone details everywhere you appear. Google reads all of those signals together to decide who shows up in the map and the top results. Do the signals well and you appear right when someone is ready to call or walk in.",
    example:
      "A diner two blocks away is packed, while an equally good diner around the corner is empty. The difference often isn't the food, it's that the busy one shows up first when someone types 'breakfast near me,' with photos, hours, and reviews all lined up. Getting the quiet diner's pages, profile, and reviews in order helps it appear in that same hungry-and-nearby moment.",
    costOfIgnoring:
      "If you're invisible in local search, you're paying rent on a spot customers can't find online, and handing those searches to the competitor down the block. The customers are actively looking and ready to buy, so every missed appearance is a sale that went to someone else for no good reason. Over a year, that's a steady stream of walk-ins and bookings you never even got the chance to win.",
    related: ["google-business-profile", "business-system"],
    faq: [
      {
        question: "How long until local search actually helps me?",
        answer:
          "The quick wins, fixing your profile and correcting wrong details, can help within weeks. The steadier gains from reviews and good pages build over a few months, so it's a habit, not a one-time switch.",
      },
      {
        question: "Do I need to pay Google for ads to show up nearby?",
        answer:
          "Not to appear in the regular map and search results, that part is earned, not bought. Ads can add reach on top, but a well-kept profile and honest pages do most of the heavy lifting for free.",
      },
    ],
  },
  {
    slug: "software-stack",
    term: "Software stack",
    definition:
      "The group of tools a business uses to run daily work, such as website platforms, booking tools, POS, payments, email, spreadsheets, CRMs, and reporting.",
    plain: "All the apps you pay for, plus the work people still do around them.",
    whenItMatters:
      "It matters when the monthly bill keeps growing but the business still runs through manual workarounds.",
    howItWorks:
      "Your software stack is simply every tool you use to run the business, the booking app, the card reader, the email, the spreadsheet, all of it. The trouble usually isn't any single tool, it's that they don't share information, so people become the glue, retyping the same details from one app into another. A good look at the stack asks three plain questions of each tool: is it earning its cost, does it talk to the others, and is anyone actually using it. From there you drop what's dead, connect what should link up, and keep what works.",
    example:
      "A busy salon pays for a booking app, a separate payment system, an email newsletter tool, and a spreadsheet the manager keeps by hand. Nothing connects, so the front desk copies each appointment into the spreadsheet and retypes new clients into the newsletter list. Trimming the dead tools and connecting the booking app to payments and the email list gives the manager back an hour a day.",
    costOfIgnoring:
      "An unmanaged stack leaks money two ways: the subscriptions nobody uses anymore, and the staff hours spent gluing mismatched tools together by hand. It's common to find a business paying for three tools that half-overlap while a person retypes data between them every morning. Left alone, the bill creeps up every year while the actual work still runs on the same tired workarounds.",
    related: ["business-system", "workflow-automation", "crm"],
    faq: [
      {
        question: "Does fixing my stack mean ripping everything out and starting over?",
        answer:
          "Usually not. Most of the win comes from cutting a couple of unused tools and connecting the good ones, not a rip-and-replace. We keep what works and only replace what's genuinely dragging you down.",
      },
      {
        question: "How do I know if I'm paying for tools I don't use?",
        answer:
          "A quick pass through your card statement for recurring charges almost always turns up a surprise or two. If you can't remember the last time you opened it, that's usually your answer.",
      },
    ],
  },
  {
    slug: "workflow-automation",
    term: "Workflow automation",
    definition:
      "A rule or system that moves routine work forward automatically, such as sending a lead to the right place, creating a follow-up task, or updating a dashboard.",
    plain: "The boring repeatable step happens without someone remembering to do it.",
    whenItMatters:
      "It matters when staff spend time copying details, chasing reminders, or checking three places to answer one simple question.",
    howItWorks:
      "Automation is just a simple 'when this happens, do that' rule that runs on its own. When a form comes in, add the person to your list and send a thank-you. When a job is marked done, create a reminder to ask for a review a week later. You decide the rule once, and then it happens every single time without anyone thinking about it. It's best aimed at the small, boring, repeatable steps, the ones humans forget exactly because they're dull.",
    example:
      "A dog groomer used to text every client the night before to confirm, when she remembered. Now an automatic reminder goes out the evening before each appointment, and a 'we'd love a review' note goes out the morning after. She didn't hire anyone, she just set two rules once, and no-shows dropped while reviews went up.",
    costOfIgnoring:
      "Doing the boring steps by hand costs you twice: the hours spent copying and reminding, and the times a human simply forgets and a customer slips away. Those forgotten follow-ups and un-sent confirmations are lost bookings that never show up as a bill, so the leak stays hidden. Meanwhile your best people spend their day on busywork a rule could handle, instead of on the customers in front of them.",
    related: ["business-system", "crm", "software-stack"],
    faq: [
      {
        question: "Will automation make my business feel cold or robotic to customers?",
        answer:
          "Done right, it does the opposite, customers get faster replies and never get forgotten, which feels more attentive, not less. You automate the reminder to follow up; the actual relationship stays human.",
      },
      {
        question: "Is this only for big companies with tech teams?",
        answer:
          "No. The most useful automations for a small shop are small and cheap, one confirmation text, one follow-up reminder. You don't need a tech team, just the right rule set up once.",
      },
    ],
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
    intro:
      "The Lower East Side runs on old tenement blocks that turned into one of the city's densest nightlife and small-shop corridors — Orchard, Ludlow, Rivington, Delancey, and the rebuilt Essex Market. The businesses here are mostly owner-run: the person who signs the lease is usually the one behind the bar, in the kitchen, or steaming vintage on the rack.",
    businessLandscape:
      "This is bar-and-restaurant country layered with vintage and thrift shops, tattoo studios, small galleries, music rooms, and cocktail dens, most of them single-location and hands-on. The pressure is real: the Essex Crossing development brought chain tenants and national restaurant groups onto blocks that used to be all independents, and delivery apps quietly take a cut of every kitchen's busiest hours. Vintage and record sellers now compete with Depop, eBay, and Instagram resellers who never pay LES rent. A one-room bar or gallery is going up against operators who have marketing staff and app deals it will never see.",
    localSearchReality:
      "Most people find a spot here by pulling up Google Maps and scanning what's open, close, and well-reviewed right now — often mid-walk down Orchard or after getting off the F at Delancey. Late-night 'open now' and 'happy hour near me' searches decide where a group of four ends up, and a stale hours listing or a menu that won't load on a phone loses that table instantly. Tourists lean on Maps ratings while locals lean on recent reviews and Instagram, so both signals have to be current. Chains win here because their listings are always accurate and their photos are fresh — not because the food or the room is better.",
    whatWeFixHere: [
      "A Google Business Profile that still shows pre-renovation hours or an old phone number",
      "A menu or events page that loads slowly or breaks on a phone during peak walk-in hours",
      "A reservation or guest-list link buried three taps deep instead of one tap from Maps",
      "Reviews from months ago with no owner replies, so the listing reads as neglected",
      "A payment or deposit flow for private events that lives in DMs and gets lost",
    ],
    faq: [
      {
        question: "My bar gets found on Maps, not Google search. Does a website still matter?",
        answer:
          "Yes, because the Maps listing links straight to it. When someone taps your profile for hours, the menu, or a reservation, a slow or broken page sends them to the next pin. The website is what closes the visit Maps started.",
      },
      {
        question: "Delivery apps take a big cut. Can you help me push people to order direct?",
        answer:
          "We set up a direct order and reservation path on your own site and profile so regulars have a reason to skip the app. We do not rip out what works overnight — we give you a channel you actually own alongside it.",
      },
      {
        question: "I run vintage and most of my sales start on Instagram. Where does a website fit?",
        answer:
          "Instagram starts the conversation; a simple site and an accurate Google profile close it for the people who search your name later or want your address and hours. It also keeps you findable when a post disappears down the feed.",
      },
    ],
    nearby: ["east-village", "soho", "west-village"],
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
    intro:
      "The East Village stretches from St. Marks Place through Alphabet City, and it kept more of its independent, lived-in character than most of Manhattan below 14th Street. The shops, dive bars, and studios here tend to be owned by people who live nearby and have run the same storefront for years, not by operators flown in from a head office.",
    businessLandscape:
      "This is a neighborhood of owner-run restaurants and ramen counters, record and book shops, tattoo studios, salons, and a heavy layer of yoga, wellness, and bodywork practices around the numbered avenues. The pressure shows up as chain drugstores and bank branches taking over corner retail, plus delivery apps thinning the margins on the small kitchens that define the area. Wellness studios in particular compete against national booking platforms and app-based classpasses that own the customer relationship and rent it back to them. An independent studio or café is often fighting operators who never actually set foot in the neighborhood.",
    localSearchReality:
      "Locals here search by habit — 'best ramen East Village,' 'nail salon near me,' 'yoga 10009' — and they trust recent reviews and photos over polished ads. Foot traffic on St. Marks and Avenue A is a mix of NYU students, longtime residents, and weekend visitors, so a business needs to read as both trustworthy and current at a glance. Where small shops lose is inconsistency: a name spelled differently across Google, Instagram, and Yelp, or class times that don't match between the profile and the booking app. Chains win on tidy, identical listings everywhere, not on being better neighbors.",
    whatWeFixHere: [
      "A studio schedule that says one thing on Google and another in the booking app",
      "A business name, address, or hours that don't match across Google, Yelp, and Instagram",
      "A service menu that lists treatments but never the price range people actually search for",
      "A booking button that opens a clunky third-party page instead of a clean flow",
      "A Google profile with no recent photos, so it looks closed or abandoned",
    ],
    faq: [
      {
        question: "I pay for a booking platform already. Do I need a website too?",
        answer:
          "The booking platform handles the transaction, but it does not help people find or trust you first. A simple site plus an accurate Google profile is what turns a 'near me' search into someone opening that booking link. They work together.",
      },
      {
        question: "My salon lives on Instagram. Is that enough?",
        answer:
          "Instagram shows your work, but it does not answer hours, address, and pricing for the person deciding right now. Those questions get asked on Google, and if the answer is missing or wrong, they book the shop that answered. We make sure both point to the same clear truth.",
      },
      {
        question: "How do I compete with the chain pharmacy or gym that moved in?",
        answer:
          "You will not out-spend them, so we make you easier to find and faster to act on for the people who want a local, owner-run option. Accurate search presence, real reviews, and a booking or contact path that just works is where independents actually win here.",
      },
    ],
    nearby: ["lower-east-side", "soho", "chelsea"],
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
    intro:
      "SoHo's cast-iron blocks went from an artists' loft district to the most expensive retail corridor in the country, but between the global flagships there are still independent boutiques, galleries, showrooms, and design studios run by their founders. In SoHo the bar for how a business looks and feels is set by the Prada and Chanel windows next door, whether the small operator likes it or not.",
    businessLandscape:
      "The owner-run businesses here are independent fashion and home boutiques, art galleries, architecture and design studios, showrooms, and high-end salons and skincare rooms. They sit shoulder to shoulder with brand flagships and rotating pop-ups that spend more on a single window display than a small shop spends in a year. The pressure is a mix of astronomical rent, global retailers who own the block's foot traffic, and e-commerce giants who intercept the search before anyone reaches Broadway or West Broadway. A founder-run boutique has to look as credible online as a brand with a whole creative department, or the browsing customer assumes the brand is safer.",
    localSearchReality:
      "SoHo runs on comparison shopping in real time — someone standing on Spring Street will search a boutique's name, check the gallery's current show, or compare three salons before committing, all in one session. Tourists and out-of-neighborhood shoppers drive a lot of this, and they judge fast on photos, reviews, and whether the site looks premium on a phone. Small shops lose when their online presence looks thinner than the experience in the store, or when a gallery's site never says what's on view this week. The flagships win on production value, so an independent's site has to feel intentional, not improvised.",
    whatWeFixHere: [
      "A boutique site that looks dated next to the brand flagships customers just walked past",
      "A gallery page that doesn't clearly show the current exhibition or opening dates",
      "An appointment or private-shopping request that has no clean path and gets missed",
      "Product or lookbook images that are heavy and slow, hurting the premium impression",
      "Client and lead details kept in a staffer's head or a scattered spreadsheet instead of one place",
    ],
    faq: [
      {
        question: "My rent is already brutal. Why invest in the website?",
        answer:
          "Because in SoHo the website is often the first impression, and a thin one makes an expensive store look less credible than it is. It is the cheapest part of your presence to fix and the one comparison shoppers judge you on before they ever walk in.",
      },
      {
        question: "I sell in-store, not online. Do I need e-commerce?",
        answer:
          "Not necessarily. Many SoHo shops do better with a beautiful, fast site that drives visits, appointments, and private-shopping requests rather than a full store. We build for how you actually sell instead of adding a platform you will resent.",
      },
      {
        question: "We're a small studio competing against firms with real marketing teams. Can we look as legit?",
        answer:
          "Yes. A focused site with strong work, clear contact, and a tidy Google presence closes the credibility gap without a marketing department. Clients judge the work and the ease of reaching you, and both of those we can make excellent.",
      },
    ],
    nearby: ["west-village", "lower-east-side", "east-village"],
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
    intro:
      "Chelsea holds the city's densest cluster of contemporary art galleries in the West 20s, the High Line running above 10th Avenue, and a long spine of fitness studios, restaurants, and salons serving a walk-everywhere residential base. Many of these are owner-operated, and they now sit in the shadow of Hudson Yards, the biggest private development in the country, rising a few blocks west.",
    businessLandscape:
      "The independents here are art galleries, boutique fitness and pilates studios, salons and wellness rooms, restaurants, and service firms — plus the remnants of the old Flower District around 28th Street. The pressure comes from several directions: Hudson Yards pulled retail energy and chain tenants to the far west side, national gym brands like Equinox and boutique-fitness chains compete on every block, and delivery apps squeeze the restaurants. Galleries face their own consolidation as bigger operations open multiple spaces and dominate the online listings collectors check. A single-location studio or gallery is up against operators with real ad budgets and app partnerships.",
    localSearchReality:
      "People find Chelsea businesses through 'near me' and neighborhood-plus-service searches — 'pilates Chelsea,' 'galleries open today,' 'dinner near the High Line' — often while walking the area or coming off the 1, C, or E trains. High Line and gallery-crawl foot traffic mixes tourists with locals, so a business needs to look current to both. Small shops lose when their class schedule or gallery hours are wrong online, or when a chain's spotless listing simply outranks them on Maps. The chains rarely win on quality here; they win on always-accurate, review-rich profiles.",
    whatWeFixHere: [
      "A fitness schedule that doesn't match between Google, the website, and the booking app",
      "A gallery site that doesn't surface the current show or hours for a Saturday crawl",
      "Service pages that describe everything but never answer what it costs or how to start",
      "An inquiry form that sends leads into an inbox where they sit unseen for days",
      "A Google profile outranked by a chain simply because it has more recent reviews and photos",
    ],
    faq: [
      {
        question: "Hudson Yards and the chains pulled attention west. How do I stay found?",
        answer:
          "By owning the neighborhood searches they don't care about — your specific service plus Chelsea, plus the blocks around the High Line. Tight local search presence and current reviews keep you visible to the people already near your door, which is who actually converts.",
      },
      {
        question: "I run a studio on a national booking app. Isn't that enough visibility?",
        answer:
          "The app captures people who already picked you; it does not win the person still deciding. That decision happens on Google and Maps, and if your profile and site are weak there, the chain studio gets the search. We strengthen the front door the app can't.",
      },
      {
        question: "We're a gallery — collectors already know us. Why worry about the website?",
        answer:
          "New collectors, visitors, and press check the site for the current show and hours before they walk over, and a stale page reads as a stale program. Keeping the exhibition and hours effortless to update is a small fix that protects a serious reputation.",
      },
    ],
    nearby: ["west-village", "midtown", "east-village"],
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
    intro:
      "Midtown is the working engine of the city — office towers, the Diamond District on 47th Street, the Garment District, and the lunch counters, tailors, and service shops that keep the workforce fed and dressed. The small businesses tucked between the skyscrapers are often family-run operations that have served the same office crowd for decades.",
    businessLandscape:
      "The owner-run businesses here are delis and lunch spots, dry cleaners, tailors and alteration shops, jewelers in the Diamond District, and small professional practices and service firms serving the office population. Their pressure is specific: fast-casual chains like Sweetgreen and Chipotle dominate the weekday lunch rush, foot traffic swings hard with return-to-office patterns, and delivery apps take a cut of the orders that used to be walk-ins. A deli or tailor here lives and dies on office workers who now split their week between the office and home, so every regular counts more than it used to. These are operators competing on service and speed against chains with corporate apps and loyalty programs.",
    localSearchReality:
      "Midtown search is fast and functional — 'lunch near me,' 'dry cleaner 10017,' 'watch repair near Grand Central' — typed by office workers with a narrow window and low patience. The crowd is weekday-heavy and commuter-driven, so a business is often found by someone who works nearby but doesn't live there and won't hunt. Small shops lose when their hours don't reflect the real office-hours reality, when there's no easy order-ahead or pickup path, or when a chain's app simply removes the friction first. The chains win on convenience and speed of action, not on quality.",
    whatWeFixHere: [
      "Google hours that don't reflect the real weekday, weekend, and holiday office-crowd pattern",
      "No order-ahead or pickup path, so the lunch rush goes to the chain with an app",
      "A phone number or contact form that quietly fails while calls are the main lead source",
      "Staff logins, POS, and tools that break and stall the shop with no reliable support",
      "A service business with no clear intake, so inquiries scatter across email, voicemail, and text",
    ],
    faq: [
      {
        question: "My customers are office workers whose schedules changed. How does that affect my setup?",
        answer:
          "It means your hours, your busiest windows, and your order-ahead options all have to match the new hybrid reality, or you miss the rush you still have. We tune your profile and site to when the office crowd is actually here instead of the old five-day pattern.",
      },
      {
        question: "The chains have apps for ordering ahead. Can a small shop offer that?",
        answer:
          "Yes, without a custom app. A clean order-ahead or pickup link on your site and Google profile gives the office worker the same one-tap convenience. You keep the margin and the relationship instead of renting both from a platform.",
      },
      {
        question: "My biggest issue is tech that breaks mid-day. Do you handle that?",
        answer:
          "Yes. Midtown support is often less about marketing and more about the POS, phone, or logins that stall the shop during the rush. We fix what's blocking the day first, then look at visibility, because a shop that can't take an order can't grow.",
      },
    ],
    nearby: ["chelsea", "upper-east-side", "upper-west-side"],
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
    intro:
      "The Upper East Side is affluent, residential, and appointment-driven, running from Museum Mile along Fifth Avenue to the hospital corridor near the East River — Lenox Hill, Weill Cornell, Hospital for Special Surgery, and Memorial Sloan Kettering. The small businesses here are heavy on private practices and personal-care services, most of them owner-operated professionals whose reputation is the business.",
    businessLandscape:
      "This is the neighborhood of solo and small-group dental and medical practices, dermatology and aesthetics, physical therapy, salons and blow-dry rooms, Madison Avenue boutiques, framers, and specialty food shops. The defining pressure is private-equity consolidation: dental service organizations and PE-backed medical groups are buying up independent practices, and urgent-care chains like CityMD and blow-dry and beauty chains compete for the same appointment-minded clientele. A solo dentist or independent salon is now up against roll-ups that share back-office marketing, centralized booking, and ad spend. Patients and clients here have high expectations and quiet loyalty, but they research before they call.",
    localSearchReality:
      "Upper East Side customers research carefully — 'best dentist Upper East Side,' 'dermatologist 10028,' 'facial near me' — and they weight reviews, credentials, and how professional the site feels before booking anything personal or medical. This is a less walk-in, more deliberate crowd; the search happens at home or on the phone, then leads to a call or an online booking. Independents lose when their site looks less credible than the PE-backed group's, when reviews are thin, or when there's no easy way to request an appointment. The chains and roll-ups win on polish and booking convenience, not on the actual care.",
    whatWeFixHere: [
      "A practice site that looks less credible than the PE-backed group down the block",
      "An appointment request that forces a phone call instead of a simple online option",
      "A Google profile missing services, credentials, insurance details, or recent reviews",
      "New-patient or new-client intake that's clunky, repetitive, or lost after the first contact",
      "A salon or practice name and address that read inconsistently across listings and reduce trust",
    ],
    faq: [
      {
        question: "A dental group backed by investors opened nearby. How do I compete as an independent?",
        answer:
          "You lead with what they can't fake: a credible site, real patient reviews, and a booking path as easy as theirs. Patients here choose the practice that looks trustworthy and is simple to reach, and an independent can win both without a corporate marketing budget.",
      },
      {
        question: "My patients are older and call to book. Do I still need online booking?",
        answer:
          "Keep the phone — but add an online request option, because the family members and newer patients who research you expect it. Offering both captures the caller and the researcher instead of forcing everyone through the channel that's convenient for you.",
      },
      {
        question: "Isn't a professional practice above worrying about Google reviews?",
        answer:
          "Not on the Upper East Side, where clients quietly check reviews before anything personal or medical. A handful of recent, genuine reviews and an owner who responds signals a practice that's present and cared-for, which is exactly what this clientele is looking for.",
      },
    ],
    nearby: ["upper-west-side", "midtown"],
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
    intro:
      "The Upper West Side is brownstone-lined and family-heavy, anchored by Lincoln Center, Central Park, and Riverside Park, with a long tradition of neighborhood institutions like Zabar's and the independent shops along Broadway, Amsterdam, and Columbus. The businesses here are largely owner-run and relationship-based, serving families and longtime residents who shop close to home.",
    businessLandscape:
      "The independents here are neighborhood restaurants and cafés, kids' enrichment and music programs, pediatric and wellness practices, bookstores, hardware and specialty food shops, salons, and dry cleaners. The pressure is quieter than downtown but real: chain pharmacies took over corner after corner and then left storefronts empty, delivery apps skim the local restaurants, and national fitness and enrichment brands compete for the family dollar. A family-run shop or a kids' program here depends on trust built over years, but new parents and new arrivals still find businesses by searching first. These owners are competing against chains and apps that never learned a single customer's name.",
    localSearchReality:
      "Search here is practical and family-driven — 'pediatric dentist Upper West Side,' 'kids music classes near me,' 'hardware store Amsterdam Avenue' — often run by a parent solving a problem quickly. The crowd is overwhelmingly local and repeat, so accurate hours, an easy phone tap, and current reviews matter more than flashy design. Small shops lose when their listing is stale, when a class or program schedule is impossible to find, or when a chain simply shows up first on Maps. The chains win on findability and consistency, not on the neighborhood knowledge these owners actually have.",
    whatWeFixHere: [
      "A class, camp, or program schedule that parents can't easily find or read on a phone",
      "A Google profile with outdated hours that sends a busy parent to a competitor",
      "A shop paying for tools it barely uses when it needs fewer, simpler ones",
      "A restaurant with no clean direct-order path, losing margin to the delivery apps",
      "A contact or registration form that fails quietly, so inquiries never reach the owner",
    ],
    faq: [
      {
        question: "Most of my customers are regulars. Why does search visibility matter?",
        answer:
          "Because the neighborhood keeps turning over — new families arrive constantly, and they find you by searching before they ever walk in. Strong local presence protects the flow of new regulars that keeps a relationship business healthy over time.",
      },
      {
        question: "I run a kids' program and registration is a mess. Can you simplify it?",
        answer:
          "Yes. We make the schedule easy to find and the sign-up path clean, so parents can register in a couple of taps instead of emailing back and forth. Less friction there usually means fewer dropped enrollments and far fewer admin headaches for you.",
      },
      {
        question: "I feel like I'm paying for software I don't use. Can you help?",
        answer:
          "That's common up here, and often the fix is fewer tools, not more. We look at what you actually use, cut what drags, and connect what's left so the shop runs cleaner and the monthly bill stops creeping.",
      },
    ],
    nearby: ["upper-east-side", "midtown"],
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
    intro:
      "The West Village is Manhattan's most walkable and picturesque quarter — winding, low-rise streets off the grid, tree-lined blocks, and famous corridors like Bleecker Street that draw locals and visitors in equal measure. The businesses here trade on charm and reputation, and most are owner-run restaurants, boutiques, and cafés where the founder is a fixture on the block.",
    businessLandscape:
      "The independents are intimate restaurants and wine bars, boutiques and design shops, salons, cafés, and specialty food and wine stores. The neighborhood's retail history is a cautionary tale: Bleecker Street swung from independent shops to luxury flagships and then to empty windows as rents outran everyone, and delivery apps now pressure the small kitchens that give the area its reputation. A boutique or restaurant here competes with both luxury brand spillover and the algorithmic pull of apps and e-commerce that intercept customers before they wander the block. The charm is the moat, but the online presence has to live up to the in-person experience or the visitor never makes the trip.",
    localSearchReality:
      "The West Village runs on discovery and destination searches — 'best restaurants West Village,' 'wine bar near me,' 'cute boutiques Bleecker Street' — from a heavy mix of tourists, date-nighters, and locals. Photos, recent reviews, and a reservation or hours answer decide where a visitor commits, often while wandering with their phone out. Small shops lose when the site looks thinner than the storefront, when the reservation or menu link is buried, or when a stale listing makes a beloved spot look closed. Nobody wins here on ad budget — they win on looking as good online as they do on the street, and being effortless to act on.",
    whatWeFixHere: [
      "A restaurant site where the reservation link or menu is buried instead of one tap away",
      "A boutique's online presence that looks thinner than the shop actually is",
      "A Google profile with old photos or hours that makes a loved spot look closed",
      "Delivery apps skimming every order with no direct-order alternative for regulars",
      "A stack of overlapping software subscriptions that could be fewer, cheaper tools",
    ],
    faq: [
      {
        question: "My spot is beloved locally. Why does the website matter?",
        answer:
          "Because the tourists and date-nighters who fill your tables don't know you yet — they find you by searching while they wander. A site and profile that match how good the place actually is turns that search into a reservation instead of a scroll-past.",
      },
      {
        question: "Reservations come through an app I pay for. Isn't that covered?",
        answer:
          "The app takes the booking, but the person still has to choose you first, and that choice happens on Google, Maps, and your site. If those look weak, the reservation app never gets the chance. We strengthen the step that comes before it.",
      },
      {
        question: "Rents here are brutal and I'm watching costs. Will this add another bill?",
        answer:
          "Usually the opposite. We often find overlapping subscriptions we can cut, then build a lean site and clean local presence that does more for less. The goal is fewer tools that actually work, not another platform on the pile.",
      },
    ],
    nearby: ["soho", "chelsea", "lower-east-side"],
  },
];

export const studioProjects: StudioProject[] = [
  {
    slug: "dakota",
    name: "Dakota",
    kind: "AI client finder",
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
    metricsEyebrow: "One measured week, from the agent's own log",
    metrics: [
      { label: "Candidate leads sourced", value: "84" },
      { label: "Outreach emails drafted", value: "29" },
      { label: "Emails sent", value: "14" },
      { label: "Real conversations started", value: "2" },
      { label: "Average reply latency", value: "47 min" },
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
  {
    slug: "venuecircuit",
    name: "VenueCircuit",
    kind: "Financial OS for live-event venues",
    status: "Live",
    oneline:
      "A full product Little Fight shipped to the public: the operating system for independent live-event venues — close the night in 90 seconds and know every number down to the receipt.",
    description:
      "VenueCircuit is the most ambitious thing in the Studio — not a website or an internal tool, but a complete software product, live to the public. It's a financial operating system for independent music venues and event spaces: the GM closes the night in about 90 seconds, the venue's money stays separate from the promoter's, and the quarter is already reconciled. Live at venuecircuit.app.",
    stack: ["Next.js", "Supabase", "TypeScript", "Netlify"],
    image: "/assets/case-venuecircuit.webp",
    external: "https://venuecircuit.app",
    body: [
      "VenueCircuit answers a question independent venue owners live with every night: where did the money actually go? Bar, door, staff, promoter splits, and payouts all land in one place, and the night closes in about 90 seconds instead of a spreadsheet marathon the next morning.",
      "The core rule is that the venue's money and the promoter's money never blur together. Every number drills down to the receipt behind it, so a GM can answer a question at midnight and the owner can trust the quarter without a forensic audit.",
      "It's live at venuecircuit.app in open beta, with a free 45-day pilot — the same range Little Fight brings to a client's systems, turned all the way up.",
    ],
  },
];
