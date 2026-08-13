import {
  ClipboardCheck,
  CreditCard,
  FileSearch,
  Globe2,
  Laptop,
  MessagesSquare,
  MousePointerClick,
  Phone,
  ReceiptText,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CABINETRY_PROCESS_FILM,
  type CinematicMediaAsset,
} from "./cinematic-media";

/* Re-export the split-out content arrays so every existing `@/data/site`
 * import keeps working; Vite tree-shakes each consumer to just its slice. */
export type { AnswerGuide } from "./site-answers";
export { answerGuides, answerServiceBridge } from "./site-answers";
export type {
  CaseCaptureDevice,
  CaseProofStatus,
  CaseStudy,
} from "./site-cases";
export { caseStudies } from "./site-cases";
export type { GlossaryTerm } from "./site-glossary";
export { glossaryTerms } from "./site-glossary";
export type { AreaPage } from "./site-areas";
export { areaPages } from "./site-areas";

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
  video?: CinematicMediaAsset;
  accent: string;
  icon: LucideIcon;
  shortAnswer: string;
  whatItDoes: string[];
  commonIssues: Array<{ title: string; body: string }>;
  fallacies: Array<{ myth: string; reality: string }>;
  faq: Array<{ question: string; answer: string }>;
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
  imageWidth?: number;
  imageHeight?: number;
  imageFit?: "cover" | "contain";
  video?: CinematicMediaAsset;
  external?: string;
  body?: string[];
  metricsEyebrow?: string;
  metrics?: { label: string; value: string }[];
};




export const services: Service[] = [
  {
    slug: "tech-consulting",
    eyebrow: "Tech Consulting",
    verb: "Audit",
    title: "A free second opinion before you spend",
    headline: "Know what to keep, cut, fix, or build.",
    plain: "We look at the public website, Google presence, tools, recurring bills, and handoffs. Then we name what looks healthy, what needs a closer look, and the smallest useful next move.",
    outcome: "The first read is free. If paid work is not the useful next move, we say so.",
    includes: [
      "A plain inventory of the tools and recurring bills you choose to show us",
      "Website, Google profile, and lead path check",
      "A walk through how the work moves",
      "A written next-step list, ranked by what affects customers first",
    ],
    image: "/assets/interior-grocery.webp",
    accent: "gold",
    icon: Search,
    shortAnswer:
      "Short answer: Little Fight gives NYC small businesses a free first look at their website, Google profile, tools, bills, and daily work. You learn what to keep, connect, replace, or build.",
    whatItDoes: [
      "Most owners do not start with a tidy tech problem. They start with a strange bill, a quiet form, or a Google listing that looks wrong.",
      "The consult is the first read. We walk through the public site, the accounts you can see, recurring bills, and how customer messages reach you. Then we name what earns its place, what needs a closer look, and what can wait.",
      "It works the same for any trade. A bar’s POS. A law firm’s intake email. A clothing brand’s online store. A salon’s booking page. The tools change, the read is the same.",
      "You leave with a written next-step list. It is ranked by the customer path first. You can hand it to your own vendor, another developer, or back to us.",
      "The consult is a real read, not a trap door into a pitch. Sometimes the best answer is to leave a working thing alone.",
    ],
    commonIssues: [
      {
        title: "Software bills nobody can explain",
        body: "We often find two booking tools, old logins, and apps nobody opens. We list each tool, its cost, its owner, and what it earns.",
      },
      {
        title: "A website nobody can describe",
        body: "Many owners inherit a site they did not build and cannot edit. First we find what it says, where leads go, and who holds the login.",
      },
      {
        title: "A Google profile that sends mixed signals",
        body: "Wrong hours. Old photos. An address that does not match. Each one looks small. Together they make people trust you less.",
      },
      {
        title: "Work that lives in one person’s head",
        body: "Leads come in by phone, form, email, and walk-ins. Then they get tracked nowhere. Sometimes the fix is just writing the steps down so anyone can run them.",
      },
      {
        title: "Decisions made under pressure",
        body: "Owners get pitched by ad reps, SEO sellers, and software companies all day. A clear baseline helps you tell a real fix from a sales script.",
      },
    ],
    fallacies: [
      {
        myth: "An audit means I am going to get sold something at the end.",
        reality: "Not here. The consult is free. It ends with a written list you can take anywhere. We charge for the work, not the talk. If the right move is 'do not hire anyone yet,' we say that.",
      },
      {
        myth: "I should just trust whoever is already managing my tech.",
        reality: "Often they are doing fine, and we say so. A second look just checks that the setup still fits the business, the bill, and how customers reach you now.",
      },
      {
        myth: "AI tools will figure all this out for me.",
        reality: "AI helps where it earns its place. But it does not know which tools your staff open or which vendor holds the password. Local context still matters.",
      },
      {
        myth: "If it is not broken, it does not need an audit.",
        reality: "A working setup can still cost too much. We do not invent problems. We find the slow leaks before they get urgent.",
      },
    ],
    faq: [
      {
        question: "How long does a consult take?",
        answer:
          "A first call takes 20 to 30 minutes. If you need a deeper audit, we say what we will check and when your fix list arrives.",
      },
      {
        question: "What do I need to give you to get started?",
        answer:
          "Nothing private on the first call. Tell us what you pay for, what your website is, and what bugs you. If we need access later, we use a safe handoff. Never email or text passwords.",
      },
    ],
  },
  {
    slug: "it-support",
    eyebrow: "IT Support",
    verb: "Fix",
    title: "Computer broken, POS frozen, Wi-Fi down",
    headline: "Fast help when the basics break.",
    plain: "Email, domains, Wi-Fi, POS, booking, payments, accounts, and devices. We diagnose the customer-facing problem first, then leave a plain record of what changed.",
    outcome: "Call or text first. New York on-site help and response timing are confirmed from the actual problem and written scope.",
    includes: [
      "Fast help when something breaks",
      "Email, domain, and DNS repair",
      "POS, booking, and payment fixes",
      "Device, account, and Wi-Fi setup",
    ],
    image: "/assets/pos.webp",
    accent: "teal",
    icon: Wrench,
    shortAnswer:
      "Short answer: Little Fight gives NYC small businesses real local IT help. When email, Wi-Fi, POS, booking, payments, or devices stop working, we fix them.",
    whatItDoes: [
      "When a card reader, inbox, printer, or login breaks, you do not need a ticket number. You need a person who fixes the urgent thing first.",
      "We answer the phone. We come on-site when the fix needs hands. And we keep notes, so the next call does not start from zero.",
      "We work on the boring middle: email routing, domain renewals, DNS records, POS connections, booking links, Wi-Fi, payments, and locked accounts.",
      "The trade does not matter. A bar’s card reader on a Friday night. A law firm’s intake email. A clinic’s booking link. A shop’s printer. Broken is broken, and we fix it.",
      "The goal is not to make you depend on us. Every fix gets written down in plain words, so your business is safer next time something changes.",
    ],
    commonIssues: [
      {
        title: "Card reader is down on a Friday night",
        body: "Payments are stuck and customers are waiting. We check the network, the device, the payment account, and any recent changes before touching anything risky.",
      },
      {
        title: "Email stopped arriving (or stopped sending)",
        body: "Quotes never land, and customers think you ignored them. The cause is often a DNS record, a missed bill, a spam rule, or a full mailbox.",
      },
      {
        title: "An account nobody has the password to",
        body: "A staff member left. The domain sits with a company nobody can name. The Google profile is tied to an old email. We map who owns what, recover what we can, and write it down.",
      },
      {
        title: "Booking link or form is broken",
        body: "The worst way to find out is from a customer. We test the form, the confirmation, the email path, and where the lead is supposed to land.",
      },
      {
        title: "Wi-Fi drops in one part of the room",
        body: "Sometimes it is where the router sits. Sometimes it is old gear nobody revisited. We test it where staff and customers actually stand.",
      },
      {
        title: "A new device or account needs setup, and nobody has time",
        body: "New POS, printer, email, laptop, or login. The small jobs pile up. We do them, explain them, and leave the notes behind.",
      },
    ],
    fallacies: [
      {
        myth: "A big national IT firm will give us better support than a local shop.",
        reality: "A national help desk is fine for updates and monitoring. It is less useful when the POS is down, the counter is full, and someone needs to know the room.",
      },
      {
        myth: "Outsourced IT is fine if the price is right.",
        reality: "It can work for backups and updates. It falls short when a customer-facing tool breaks mid-service and the fix needs someone who knows your setup.",
      },
      {
        myth: "Geek Squad / corporate support is the same thing.",
        reality: "Retail support can fix one device. A business setup has POS, domains, payments, booking, staff accounts, Wi-Fi, and Google all touching each other.",
      },
      {
        myth: "I’ll just Google it.",
        reality: "You can Google a lot of it. The risk is changing the wrong record, locking an account, or making a small problem big. Some things are worth the call.",
      },
      {
        myth: "If we have a managed-services retainer, we don’t need anyone else.",
        reality: "Those are different jobs. A retainer handles updates and monitoring. Local support handles the moments that need a person in your business.",
      },
    ],
    faq: [
      {
        question: "Do you help when something is broken today?",
        answer:
          "Yes. Call first if customers, payments, bookings, email, or access are hurting now. We stop the bleeding before we talk about any bigger cleanup.",
      },
      {
        question: "Do you need passwords on the first call?",
        answer:
          "No. Never share passwords on a call or in a form. If we need access, we use a safer handoff. Never text, never email.",
      },
      {
        question: "Do you require a contract or retainer?",
        answer:
          "No. We work when you need us. Regular check-ins are there if you want them. The work is hourly, scoped, and written down. You do not pay us when you do not need us.",
      },
    ],
  },
  {
    slug: "custom-local-websites",
    eyebrow: "Custom Local Websites",
    verb: "Build",
    title: "A website built to help customers choose",
    headline: "Make the next customer’s step obvious.",
    plain: "Custom websites for NYC businesses. Clear service pages, calls, booking, orders, forms, maps, payments, and follow-up can all point to one understandable next step.",
    outcome: "Qualifying website scopes carry the written 14-day promise. The scope names the timing, dependencies, and remedy before work starts.",
    includes: [
      "Custom design and build around the real customer path",
      "Local search and Google profile basics where they fit",
      "Forms, booking, and payment connections",
      "Useful service and neighborhood pages",
      "Hosting and care options with a documented handoff",
    ],
    image: "/assets/nyc-hair-salon-street.webp",
    accent: "orange",
    icon: Laptop,
    shortAnswer:
      "Short answer: Little Fight builds custom local websites for NYC small businesses. The site explains the offer plainly, gives each customer a clear action, and gives search systems truthful business details.",
    whatItDoes: [
      "A custom local website is built around one business and its customers. It is not a theme with new colors. It does not sound like every other shop.",
      "The site works for people first, then for search. A visitor should know what you do, where you are, and what to do next. No hunting.",
      "The public facts should agree. Service pages, Maps details, reviews, booking links, and Google profile information should not make a customer guess which one is right.",
      "It works for any trade. A bar. A law firm. A clothing brand. A salon. A hardware store. The look changes. The job is the same: make the next step obvious.",
      "The process is tight: build, review, ship. The written scope says what each side needs to do before the launch date means anything.",
      "Hosting and care can keep the public path current when hours, offers, or tools change. The business keeps the accounts and the handoff notes.",
    ],
    commonIssues: [
      {
        title: "A site that looks fine but does not help people act",
        body: "The design may be pretty while the visitor still cannot tell whether to book, visit, order, call, or inquire. The fix might be the words, the layout, the forms, or the offer itself.",
      },
      {
        title: "A mobile page that makes people hunt",
        body: "The phone number is hidden. Booking sits six screens down. The form asks too much. On a phone, that loses the customer.",
      },
      {
        title: "Forms that quietly stopped working",
        body: "An update, a spam rule, or an expired connection can stop leads cold. If nobody tests the path, a customer finds out first.",
      },
      {
        title: "Local pages that sound like everybody else",
        body: "Local pages need real detail, not swapped neighborhood names. A SoHo shop, a Chelsea salon, a Midtown law firm, and a Lower East Side bar should not explain themselves the same way.",
      },
      {
        title: "A phone page that takes too long to become useful",
        body: "Heavy images and scripts can delay the first useful answer. We measure the public page before guessing at the fix.",
      },
      {
        title: "Hosting scattered across three vendors",
        body: "The domain is at one company. Hosting is somewhere else. Email has a third login. When something breaks, nobody knows who owns the fix.",
      },
    ],
    fallacies: [
      {
        myth: "Template platforms are always bad.",
        reality: "No. For a simple business with a simple offer, they can be right. The problem starts when you need stronger local search, faster pages, or tools the template fights.",
      },
      {
        myth: "Google doesn’t actually penalize template websites.",
        reality: "Think fit, not penalty. A template can be enough for a simple business. Trouble starts when it makes the real services, local facts, or customer action harder to explain.",
      },
      {
        myth: "AI website builders will replace agencies.",
        reality: "AI is great for drafts and speed. It cannot decide what to leave out, how your customers talk, or what your staff can keep running.",
      },
      {
        myth: "More pages = better SEO.",
        reality: "More pages do not automatically help. Add a page when it answers a real question and gives the reader a useful next step.",
      },
      {
        myth: "Once the site launches, we’re done.",
        reality: "A site nobody touches goes stale. Hours change. Staff change. Tools change. Google changes. Care keeps the path working.",
      },
      {
        myth: "A redesign will fix the leads problem.",
        reality: "Sometimes. Often the real problem is the Google profile, the phone path, the form, or the offer. Read first. Rebuild only if the read points there.",
      },
    ],
    faq: [
      {
        question: "Do I need a new website, or just a cleanup?",
        answer:
          "Often a cleanup. If the platform works and customers can use it, fix the message, mobile layout, and forms first. The free consult tells you which.",
      },
      {
        question: "Can you connect the site to booking or payments?",
        answer:
          "Yes. The site should connect to what makes you money: booking, calls, forms, payments, and follow-up. Custom code where it matters. Simple embeds where they win.",
      },
      {
        question: "What if I miss the 14-day window?",
        answer:
          "The written scope explains whether the 14-day promise applies, what we need from each side, and the remedy if our qualifying work is late. Review time is planned with you before the clock starts.",
      },
    ],
  },
  {
    slug: "business-systems",
    eyebrow: "Software You Own",
    verb: "Build",
    title: "A focused tool built around your business",
    headline: "Stop renting software that fights the way you work.",
    plain: "Lead tracking, follow-up, reports, and focused workflow tools. We first check whether a simpler tool can do the job. If a custom build earns its place, the business receives the code, data, and handoff notes.",
    outcome: "One focused build. You own the code, data, hosting, domain, and docs.",
    includes: [
      "A workflow and software cost read",
      "Custom lead tracking and internal tools",
      "Dashboards, reports, and clearly reviewed follow-up rules",
      "Documented technology another qualified developer can review",
      "Full ownership of the code, data, and docs",
    ],
    image: CABINETRY_PROCESS_FILM.poster,
    video: CABINETRY_PROCESS_FILM,
    accent: "green",
    icon: ClipboardCheck,
    shortAnswer:
      "Short answer: Little Fight builds focused software that NYC small businesses own. It replaces scattered spreadsheets, double typing, and bloated subscriptions when off-the-shelf tools no longer fit.",
    whatItDoes: [
      "Business systems are the work behind the storefront. The lead list. The job board. The quote path. The owner’s view of the week.",
      "Many small businesses run that layer on spreadsheets, inboxes, sticky notes, and memory. The work gets done, but one person becomes the memory for the whole business.",
      "We start by reading what you have. What earns its place? What costs too much? What should connect? What deserves a custom build?",
      "Custom tools are for work a generic app handles badly: intake, inventory, event deposits, or quoting with real-world rules. The small thing that fits can beat the big thing that fights every step.",
      "Everything we ship is written down and sized for the job. The code, data, hosting, domain, and instructions belong to the business.",
    ],
    commonIssues: [
      {
        title: "Leads come in 4 ways and get tracked in 0",
        body: "Calls, forms, DMs, walk-ins. Somewhere in the gaps, leads get lost. The fix is usually one simple intake list, not a giant CRM.",
      },
      {
        title: "Two people type the same data twice",
        body: "The front desk types it into booking. The bookkeeper types it again. The owner types it a third time. Three entries, three chances to miss.",
      },
      {
        title: "Reports that eat half a day",
        body: "The owner pulls numbers from five places and stitches them by hand. A simple dashboard shows the same view without killing Monday morning.",
      },
      {
        title: "A subscription that costs more than it saves",
        body: "A big platform for a tiny job becomes the bill nobody questions. The right move may be downgrade, connect, replace, or cancel.",
      },
      {
        title: "Work locked in one person’s head",
        body: "When that person is out, the business slows down. Writing the workflow down does not replace them. It makes the business less fragile.",
      },
      {
        title: "A workflow no off-the-shelf software will fit",
        body: "Quoting, specialty inventory, or scheduling around real-world limits can be too specific for generic tools. That is when custom earns its place.",
      },
    ],
    fallacies: [
      {
        myth: "We need the biggest CRM we can afford.",
        reality: "Maybe. A large platform can be useful when a business has the process, people, and administration to support it. Many small teams need a smaller shared list and a few dependable handoffs first.",
      },
      {
        myth: "We should just use Airtable or Notion for everything.",
        reality: "Sometimes yes. No-code tools are great at the right size. But they hit ceilings: complex data, permissions, and steps that involve customers, not just staff. Knowing when they are the answer, and when they are a stopgap, is part of the job.",
      },
      {
        myth: "Custom is too expensive.",
        reality: "Sometimes. Often the math surprises people. A subscription plus lost staff time can cost more than one focused build. The answer depends on the work, the cost, and how long you will use it.",
      },
      {
        myth: "Custom means we’re locked into one developer forever.",
        reality: "It should not. We document the code, data, accounts, and deployment path so another qualified developer can review or continue the work. The business owns those materials.",
      },
      {
        myth: "If we just had better software, the workflow would fix itself.",
        reality: "Software speeds up whatever you feed it. If the process is unclear, new software makes the confusion faster and pricier. Half the job is naming the steps before touching the tools.",
      },
      {
        myth: "Internal tools have to be ugly.",
        reality: "No. Tools staff want to use save time and prevent mistakes. Care matters when people rely on a screen every day.",
      },
    ],
    faq: [
      {
        question: "Is custom always better than software?",
        answer:
          "No. Good tools stay. The right move may be keep, connect, replace, or build. It depends on the work, the cost, and how specific the job is.",
      },
      {
        question: "What can a small business system include?",
        answer:
          "Lead tracking, follow-up, dashboards, forms, booking and payment handoffs, staff alerts, inventory, and reports. And when nothing fits, a fully custom internal app.",
      },
      {
        question: "Do I own the code if you build something custom?",
        answer:
          "Yes. You own the code, the data, the hosting, the domain, and the docs. We build on standard technology any developer can pick up. No lock-in. No hostage pricing.",
      },
    ],
  },
];

export const agencyProcess = [
  {
    label: "Learn the business",
    copy: "We look at the website, the tools, and the way the day works before naming the fix.",
    icon: FileSearch,
  },
  {
    label: "Start with the stuck part",
    copy: "We name the customer step or staff handoff that is unclear, blocked, or taking too much attention, then decide what should move first.",
    icon: MousePointerClick,
  },
  {
    label: "Keep what works",
    copy: "Keep the useful tools. Check recurring costs with the owner. Connect only the parts that need to share a handoff.",
    icon: ReceiptText,
  },
  {
    label: "Build the missing piece",
    copy: "When ready-made software is too big or simply wrong, we build the smaller tool the team needs.",
    icon: Sparkles,
  },
];

export const auditRoutes = [
  {
    label: "I need a website that explains the business",
    copy: "The current site is missing, dated, hard to find, or unclear about what the right customer can do next: book, visit, order, call, or ask.",
    icon: Globe2,
  },
  {
    label: "Something is broken",
    copy: "Website, email, booking, payment, point of sale, or login access is blocked or behaving strangely.",
    icon: Phone,
  },
  {
    label: "The setup is messy",
    copy: "Leads, tools, and follow-up are scattered all over.",
    icon: MessagesSquare,
  },
  {
    label: "The monthly bill hurts",
    copy: "You pay for software your team does not really use.",
    icon: CreditCard,
  },
];

export const studioProjects: StudioProject[] = [
  {
    slug: "dakota",
    name: "Dakota",
    kind: "Sales operating system",
    status: "Active",
    oneline: "An evidence-backed sales operating system that turns public research and consented inquiries into a deliberate next action—without contacting anyone automatically.",
    description:
      "Dakota helps a small services firm work like a careful sales team without pretending a lead is a client. It brings consented inquiries and verified public research into one bounded review queue, prepares pursuit kits for an operator to approve, and tracks real activity from follow-up through proposal and cleared payment. Nothing sends from Dakota.",
    stack: ["React", "Netlify", "Operator-controlled"],
    image: "/assets/dakota-operator-access.webp",
    imageWidth: 1200,
    imageHeight: 675,
    imageFit: "contain",
    body: [
      "Dakota answers a practical question. Can a small services business work a real acquisition process without buying a heavyweight CRM or pretending public research is a warm lead? The system starts with either a consented inquiry or a business found through public sources, then keeps evidence, fit, contact route, offer, and next action attached to the same record.",
      "Dakota can prepare an operator-approved pursuit kit, but it cannot send an email, text, call, or form. A person chooses the contact route, checks the evidence, approves the words, and records what actually happened. Opening Gmail, Google Voice, or Calendar never counts as outreach, a reply, or a meeting.",
      "The commercial record stays equally strict. A proposal is not revenue. A signature is not payment. Cleared cash is recorded only after a person verifies it, with the next onboarding action already assigned. The product runs inside Little Fight’s existing site and hosting stack, with no separate CRM or outreach-platform bill.",
    ],
    // Internal ops telemetry (weekly funnel counts, reply latency) removed
    // from the public site 2026-07-12 - editorial directive: "nothing internal should
    // show." The story stays; the log numbers don’t.
  },
  {
    slug: "cockpit",
    name: "Estimator’s Cockpit",
    kind: "Field-precision web app",
    status: "Active",
    oneline: "Private estimating software for a custom cabinetry team. Discovery, sorting, and reporting in one working system.",
    description:
      "The Cockpit turns the messy first pass of a cabinetry estimate into a structured record. Documents in. Rooms sorted. Price drivers checked. Report out. Private to the team. The biggest non-public build Little Fight has shipped.",
    stack: ["Next.js", "Supabase", "Anthropic", "Netlify Functions"],
    image: CABINETRY_PROCESS_FILM.poster,
    video: CABINETRY_PROCESS_FILM,
    body: [
      "The Cockpit is the largest non-public build Little Fight has shipped. It turns the messy first pass of a custom cabinetry estimate into a structured record. Site photos, blueprints, hand-drawn notes, and scope emails come in. Rooms get sorted. Drivers get checked. The report goes out.",
      "The build is Next.js, Supabase, Anthropic for classification, and Netlify Functions for the heavy processing. The screens show dense information without hiding anything. The data tells the truth. The estimator’s judgment makes the call.",
      "Real estimates run through it. The math is honest. The team uses it on every project.",
    ],
  },
  {
    slug: "venuecircuit",
    name: "VenueCircuit",
    kind: "Financial OS for live-event venues",
    status: "Live",
    oneline:
      "A full product Little Fight shipped to the public. The operating system for independent live-event venues. Close the night in 90 seconds and know every number down to the receipt.",
    description:
      "VenueCircuit is the most ambitious thing in the Studio. Not a website. Not an internal tool. A complete software product, live to the public. It is a financial operating system for independent music venues and event spaces. The GM closes the night in about 90 seconds. The venue’s money stays separate from the promoter’s. The quarter is already reconciled. Live at venuecircuit.app.",
    stack: ["Next.js", "Supabase", "TypeScript", "Netlify"],
    image: "/assets/case-venuecircuit.webp",
    external: "https://venuecircuit.app",
    body: [
      "VenueCircuit answers a question venue owners live with every night. Where did the money actually go? Bar, door, staff, promoter splits, and payouts all land in one place. The night closes in about 90 seconds instead of a spreadsheet marathon the next morning.",
      "The core rule: the venue’s money and the promoter’s money never blur together. Every number drills down to the receipt behind it. A GM can answer a question at midnight. The owner can trust the quarter without a forensic audit.",
      "It is live at venuecircuit.app in open beta, with a free 45-day pilot. It is the same range Little Fight brings to a client’s systems, turned all the way up.",
    ],
  },
];
