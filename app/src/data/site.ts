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
  /**
   * Two or three checkable reasons, shown directly under the answer in the
   * hero. Every entry must restate a fact this page already makes elsewhere —
   * these are the pyramid's middle layer, not new claims.
   */
  pillars?: string[];
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
    plain: "We look at what a customer sees, what you pay for, and where the day gets stuck. Then we tell you what is fine, what needs attention, and what to do first.",
    outcome: "The first read is free. If paid work is not the useful next move, we say so.",
    pillars: [
      "The first read is free",
      "We say so when paid work is not the answer",
      "You keep the accounts and the notes",
    ],
    includes: [
      "A plain list of the tools and monthly bills you want us to see",
      "A check of your website, Google listing, and customer path",
      "A walk through of how a question becomes booked, paid, or finished work",
      "A written next-step list, ranked by what affects customers first",
    ],
    image: "/assets/interior-grocery.webp",
    accent: "gold",
    icon: Search,
    shortAnswer:
      "Short answer: A free first look at your website, Google profile, tools, and bills. You learn what to keep, fix, replace, or skip.",
    whatItDoes: [
      "You leave with a written next-step list, ranked by what affects customers first. Use it yourself, hand it to your current help, or bring it back to us.",
      "The first look is simple. We check the public site, the accounts you can see, the monthly bills, and how customer messages reach you. Then we name what earns its place, what needs attention, and what can wait.",
      "It works for every kind of shop. A bar’s card reader. A law office’s new-client email. A clothing store’s online order. A salon’s booking page. The details change. The read does not.",
      "You do not need a neat little problem to start. A strange bill, a form nobody answers, or Google showing the wrong thing is enough.",
      "The consult is a real read, not a trap door into a pitch. Sometimes the best answer is to leave a working thing alone.",
    ],
    commonIssues: [
      {
        title: "Software bills nobody can explain",
        body: "We often find two booking tools, old logins, and apps nobody opens. We list what each one costs, who can get in, and whether it still helps.",
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
        body: "Questions arrive by phone, form, email, and walk-in. Then they disappear. Sometimes the fix is one clear list so anyone can see what happens next.",
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
        reality: "They may be doing fine, and we say so. A second look checks that the setup still fits the business, the bill, and the way customers reach you now.",
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
          "Nothing private on the first call. Tell us what you pay for, what your website is, and what bugs you. If we need access later, we show you a safer way to share it. Never email or text passwords.",
      },
    ],
  },
  {
    slug: "it-support",
    eyebrow: "IT Support",
    verb: "Fix",
    title: "Computer broken, card reader frozen, Wi-Fi down",
    headline: "Fast help when the basics break.",
    plain: "We fix what is stopping the day first. Then we write down what changed. Email, Wi-Fi, card readers, booking, payments, logins, and devices.",
    outcome: "Call or text first. Urgent New York jobs: we can be on site within 24 hours. The written scope names the rest.",
    pillars: [
      "Call or text first — a human answers 9am–9pm Eastern",
      "Urgent New York jobs: usually on-site within 24 hours",
      "We fix what is stopping the day, then write down what changed",
    ],
    includes: [
      "Urgent New York jobs: usually on-site within 24 hours",
      "Email and website-address fixes",
      "Card reader, booking, and payment fixes",
      "Device, login, and Wi-Fi setup",
    ],
    image: "/assets/pos.webp",
    accent: "teal",
    icon: Wrench,
    shortAnswer:
      "Short answer: When email, Wi-Fi, the card reader, booking, or a device stops working, we fix it. Real local help, same day where we can.",
    whatItDoes: [
      "You get a person who starts with the urgent thing. No ticket number, no queue. We answer the phone, come on-site when the fix needs hands, and keep notes so the next call does not start from zero.",
      "We fix the parts that make the day run: email, website addresses, card readers, booking links, Wi-Fi, payments, and locked accounts.",
      "The trade does not matter. A bar’s card reader on a Friday night. A law firm’s intake email. A clinic’s booking link. A shop’s printer. Broken is broken, and we fix it.",
      "The goal is not to make you depend on us. Every fix gets written down in plain words, so the next change is less scary.",
    ],
    commonIssues: [
      {
        title: "Card reader is down on a Friday night",
        body: "Payments are stuck and customers are waiting. We check the network, the device, the payment account, and any recent changes before touching anything risky.",
      },
      {
        title: "Email stopped arriving (or stopped sending)",
        body: "Quotes never land, and customers think you ignored them. The cause may be a missed bill, a mail rule, or a full mailbox. We find it before guessing.",
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
        reality: "Retail support can fix one device. Your business has payments, booking, email, Wi-Fi, Google, and staff logins touching each other.",
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
          "No. Never share passwords on a call or in a form. If we need access, we show you a safer way to share it. Never text, never email.",
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
    headline: "Websites that make the next step obvious.",
    plain: "Custom websites for NYC businesses. Your services, phone, booking, orders, forms, map, payments, and follow-up can all point to one clear next step.",
    outcome: "A qualifying website launches in 14 days. The written scope names the start date and what each side provides. It names the remedy if we are late.",
    pillars: [
      "Built for one business, not a theme",
      "Every page ends in a clear next step",
      "A written 14-day promise on qualifying scopes",
    ],
    includes: [
      "A custom website built around what customers need to do",
      "Clear Google and map basics where they help",
      "Working forms, booking, and payment links",
      "Useful service and neighborhood pages",
      "Care options with plain notes about what changed",
    ],
    image: "/assets/nyc-hair-salon-street.webp",
    accent: "orange",
    icon: Laptop,
    shortAnswer:
      // "You get…", not "Little Fight builds…". The first sentence is what
      // changes for the owner; who built it is the second-screen detail.
      "Short answer: You get a custom website built around your business, so customers find you, see what you do, and book without calling. Built for one business, not a theme.",
    whatItDoes: [
      "You get a website built around one business and its customers, so a visitor knows what you do, where you are, and what to do next. No hunting. Not a theme with new colors.",
      "The public facts agree. Service pages, Maps details, reviews, booking links, and Google profile information should not make a customer guess which one is right.",
      "It works for any trade. A bar. A law firm. A clothing brand. A salon. A hardware store. The look changes. The job is the same: make the next step obvious.",
      "We build, you review, then we launch. Before we start, the written plan says what we need from each other and what happens next.",
      "Care can keep the public path current when hours, offers, or tools change. You keep the accounts and the notes.",
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
        body: "A slow page can hide the answer people came for. We check what the customer sees before guessing at the fix.",
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
        reality: "AI can help with a first draft. It cannot decide what your customers need to know, what to leave out, or what your staff can keep current.",
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
          "Yes. The site should connect to what makes you money: booking, calls, forms, payments, and follow-up. We use the simplest dependable connection that fits.",
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
    // Solved state first. The old headline led with the problem ("Stop
    // renting software that fights the way you work"); the reader is already
    // living it. The headline is now what they get, the short answer says it in
    // "you" terms, and the hero carries three pillars like the other services.
    headline: "Software you own, built around your day.",
    plain: "One clear place for customer questions, follow-up, reports, and daily work. We first check whether a simpler tool can do the job. If we build one for you, you keep the files, data, accounts, and notes.",
    outcome: "One focused tool. You own it, the data, the accounts, the website address, and the instructions.",
    pillars: [
      "One place for customers, jobs, and follow-up",
      "You own the code, data, and accounts",
      "We check first whether a simpler tool can do it",
    ],
    includes: [
            "A clear place to track customer questions and work",
      "Full ownership of the files, data, accounts, and instructions",
      "Simple reports and follow-up reminders you approve",
      "Plain notes another qualified person can use if you ever need them",
      "A look at the steps and software bills that slow the day down",
    ],
    image: CABINETRY_PROCESS_FILM.poster,
    video: CABINETRY_PROCESS_FILM,
    accent: "green",
    icon: ClipboardCheck,
    shortAnswer:
      "Short answer: You get one focused tool built around how your business already works, and you own it. It replaces the scattered spreadsheets, double typing, and monthly tools that no longer fit.",
    whatItDoes: [
      "You get one focused tool for the work behind the storefront: the customer list, the job board, the quote, and the owner’s view of the week. You own the files, data, accounts, website address, and instructions.",
      "We start with what you have. What helps? What costs too much? What needs to share information? What truly needs a custom build?",
      "Custom tools are for work a generic app handles badly: new customer questions, inventory, event deposits, or quotes with real rules. The small thing that fits can beat the big thing that fights every step.",
      "Many small businesses run that layer on spreadsheets, inboxes, sticky notes, and memory. The work gets done, but one person becomes the memory for the whole business. One written-down tool makes it less fragile.",
      "Everything we deliver is written down and sized for the job.",
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
        body: "You pull numbers from five places and stitch them together by hand. One simple view can save Monday morning.",
      },
      {
        title: "A subscription that costs more than it saves",
        body: "A big platform for a tiny job becomes the bill nobody questions. The right move may be downgrade, connect, replace, or cancel.",
      },
      {
        title: "Work locked in one person’s head",
        body: "When that person is out, the business slows down. Writing the steps down does not replace them. It makes the business less fragile.",
      },
      {
        title: "A job no ready-made tool can handle",
        body: "Quoting, specialty inventory, or tricky scheduling can be too specific for generic tools. That is when custom earns its place.",
      },
    ],
    fallacies: [
      {
        myth: "We need the biggest CRM we can afford.",
        reality: "Usually not. Most small teams need one shared list and a few dependable next steps. A big platform earns its keep only if you keep it current. That takes people and time.",
      },
      {
        myth: "We should just use Airtable or Notion for everything.",
        reality: "Sometimes. Simple tools can be great at the right size. But they have limits when customer details, access, or tricky steps get involved. We tell you when one is enough and when it is only buying time.",
      },
      {
        myth: "Custom is too expensive.",
        reality: "Sometimes. Often the math surprises people. A subscription plus lost staff time can cost more than one focused build. The answer depends on the work, the cost, and how long you will use it.",
      },
      {
        myth: "Custom means we’re stuck with one company forever.",
        reality: "It should not. We write down the files, data, accounts, and how the tool runs so another qualified person can take over if you want. The business owns it all.",
      },
      {
        myth: "If we buy better software, the mess will fix itself.",
        reality: "Software makes every step faster. If the steps are unclear, it makes the confusion faster and pricier. First we name the steps. Then we choose the tool.",
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
          "Customer questions, follow-up, simple reports, forms, booking, payments, staff reminders, inventory, and quotes. And when nothing fits, a small custom tool built around the job.",
      },
      {
        question: "Do I own what you build for my business?",
        answer:
          "Yes. You own the files, data, accounts, website address, and notes. Another qualified person can take it over if you ever want a change. No lock-in. No hostage pricing.",
      },
    ],
  },
];

export const agencyProcess = [
  {
    label: "Learn the business",
    copy: "We look before we name the fix. What customers see. What the day needs. What keeps getting stuck.",
    icon: FileSearch,
  },
  {
    label: "Start with the stuck part",
    copy: "We name the customer step or staff step that is unclear, blocked, or taking too much attention. Then we decide what to fix first.",
    icon: MousePointerClick,
  },
  {
    label: "Keep what works",
    copy: "Keep the useful tools. Check the monthly costs. Connect only the parts that need to share the same information.",
    icon: ReceiptText,
  },
  {
    label: "Build the missing piece",
    copy: "When a ready-made tool is too big or simply wrong, we build the smaller tool you need.",
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
