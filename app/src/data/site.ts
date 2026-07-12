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
