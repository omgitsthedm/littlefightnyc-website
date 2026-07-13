import {
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
  Scale,
  Scissors,
  Search,
  ShieldCheck,
  Shirt,
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
    plain: "We look at your website, Google listing, tools, bills, and how the day runs. Then we tell you what is fine, what wastes money, and what to fix first.",
    outcome: "First hour free. If you do not need us, we say so.",
    includes: [
      "A list of every tool and what it costs",
      "Website, Google profile, and lead path check",
      "A walk through how the work moves",
      "A written fix list, ranked by what hurts most",
    ],
    image: "/assets/interior-grocery.webp",
    accent: "gold",
    icon: Search,
    shortAnswer:
      "Short answer: Little Fight gives NYC small businesses a free first look at their website, Google profile, tools, bills, and daily work. You learn what to keep, connect, replace, or build.",
    whatItDoes: [
      "Most owners do not start with a clean problem. They start with a strange bill. A form that went quiet. A Google listing that looks wrong.",
      "The consult is the first read. We walk through your tools, bills, website, Google profile, and how leads reach you. Then we name what earns its place, what wastes money, and what can wait.",
      "It works the same for any trade. A bar's POS. A law firm's intake email. A clothing brand's online store. A salon's booking page. The tools change, the read is the same.",
      "You leave with a written fix list. It is ranked by what hurts customers and what costs money. You can hand it to your own vendor, another developer, or back to us.",
      "The consult is free on purpose. We are checking if there is real work to do. If the answer is no, we tell you before you spend more.",
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
        title: "Work that lives in one person's head",
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
    plain: "Email, domains, Wi-Fi, POS, booking, payments, accounts, and devices. Fixed by someone who learns your setup and writes down what changed.",
    outcome: "Call or text first. On-site within 24 hours when needed. Callbacks within 2 hours, 9am to 9pm Eastern.",
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
      "The trade does not matter. A bar's card reader on a Friday night. A law firm's intake email. A clinic's booking link. A shop's printer. Broken is broken, and we fix it.",
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
        myth: "I'll just Google it.",
        reality: "You can Google a lot of it. The risk is changing the wrong record, locking an account, or making a small problem big. Some things are worth the call.",
      },
      {
        myth: "If we have a managed-services retainer, we don't need anyone else.",
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
    title: "A site that makes the next action obvious",
    headline: "A local website people can understand and use.",
    plain: "Custom websites for NYC businesses. Calls, booking, forms, maps, payments, and Google signals, all working together.",
    outcome: "Usually ships in 14 days. If we miss the date, you do not pay.",
    includes: [
      "Custom design and build, no templates",
      "Local SEO and Google profile setup",
      "Forms, booking, and payment connections",
      "Service and neighborhood pages",
      "Hosting, backups, and ongoing care",
    ],
    image: "/assets/storefront-blue-gift-shop.webp",
    accent: "orange",
    icon: Laptop,
    shortAnswer:
      "Short answer: Little Fight builds custom local websites for NYC small businesses. The site explains your offer fast, takes calls and bookings, and gives Google clear local signals.",
    whatItDoes: [
      "A custom local website is built around one business and its customers. It is not a theme with new colors. It does not sound like every other shop.",
      "The site works for people first, then for search. A visitor should know what you do, where you are, and what to do next. No hunting.",
      "The local search work is part of the build. Service pages, Maps signals, reviews, booking links, and your Google profile should all agree.",
      "It works for any trade. A bar. A law firm. A clothing brand. A salon. A hardware store. The look changes. The job is the same: make the next step obvious.",
      "The process is tight. Build, review, ship. Most sites go live in 14 days. If we miss the date, you do not pay.",
      "Hosting and care come with it. The site stays fast, backed up, and easy to update when hours, offers, or tools change.",
    ],
    commonIssues: [
      {
        title: "A site that looks fine but does not bring calls",
        body: "The design may be pretty while the visitor still cannot tell what to do. The fix might be the words, the layout, the forms, or the offer itself.",
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
        title: "A site that takes 6 seconds to load on a phone",
        body: "Big images and heavy scripts slow the first look. People do not wait just because you are local. They go back to search.",
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
        myth: "Google doesn't actually penalize template websites.",
        reality: "Think comparison, not penalty. Google has to pick which business looks more real, useful, and trusted. A generic template makes that harder.",
      },
      {
        myth: "AI website builders will replace agencies.",
        reality: "AI is great for drafts and speed. It cannot decide what to leave out, how your customers talk, or what your staff can keep running.",
      },
      {
        myth: "More pages = better SEO.",
        reality: "More weak pages can hurt. Useful pages win because they answer real questions and help a customer act.",
      },
      {
        myth: "Once the site launches, we're done.",
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
          "We plan the launch around you. Need more review time? We hold the date. The 14-day promise is on us, not you. If we miss on our side, you do not pay.",
      },
    ],
  },
  {
    slug: "business-systems",
    eyebrow: "Business Systems",
    verb: "Clean up",
    title: "The internal tools that keep the day moving",
    headline: "Less spreadsheet. Less memory. Less monthly waste.",
    plain: "Custom internal tools, lead tracking, follow-up, dashboards, and tool cleanup. Built around the work your business actually does.",
    outcome: "Sized to the business. Good tools stay. Bad fits go.",
    includes: [
      "Lead tracking and simple CRM setup",
      "Tool cleanup and cost cuts",
      "Dashboards and reports",
      "Automatic follow-up and reminders",
      "Custom internal apps when nothing fits",
    ],
    image: "/assets/case-public-house-cockpit.webp",
    accent: "green",
    icon: ClipboardCheck,
    shortAnswer:
      "Short answer: Little Fight cleans up and builds right-sized systems for NYC teams. For anyone losing time to spreadsheets, scattered leads, double typing, and software bills that earn nothing.",
    whatItDoes: [
      "Business systems are the work behind the storefront. The lead list. The job board. The quote path. The owner's view of the week.",
      "Most small businesses run that layer on spreadsheets, inboxes, sticky notes, and memory. The work gets done, but the owner becomes the memory for the whole business.",
      "We start by reading what you have. What earns its place? What costs too much? What should connect? What deserves a custom build?",
      "Custom tools are for work no generic app handles well. Intake for a law firm. Inventory for a clothing brand. Event deposits for a bar. Quoting for a contractor. When the tool fits the work, the day gets calmer.",
      "Everything we ship is written down and sized right. The code, data, hosting, and domain belong to you. No hostage pricing.",
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
        title: "Work locked in one person's head",
        body: "When that person is out, the business slows down. Writing the workflow down does not replace them. It makes the business less fragile.",
      },
      {
        title: "A workflow no off-the-shelf software will fit",
        body: "Quoting, specialty inventory, or scheduling around real-world limits can be too specific for generic tools. That is when custom earns its place.",
      },
    ],
    fallacies: [
      {
        myth: "We need Salesforce.",
        reality: "Almost no small business does. It is a great platform for big teams with full-time admins and big budgets. For a 5 to 50 person team, it is usually too much software at a price that is hard to leave. Smaller tools, or a simple custom lead layer, often fit better and cost less.",
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
        myth: "Custom means we're locked into one developer forever.",
        reality: "Not if it is built right. We use standard, widely-used technology like PostgreSQL, Next.js, and Supabase. The code, data, and docs are yours. Any good developer can pick it up. We have handed projects to clients' own teams without drama.",
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
    copy: "Website, email, booking, payment, POS, or logins are hurting customers right now.",
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
  {
    label: "People cannot find us",
    copy: "Google, Maps, and reviews are not doing enough work.",
    icon: MapPin,
  },
];

export const ownerAnswers: Answer[] = [
  {
    question: "Do I need a new website or just a better path?",
    short: "If people trust the site but the form or booking is broken, fix the path first. A full rebuild can wait.",
    path: "/examples/#answers",
  },
  {
    question: "Why are we paying for software and still using spreadsheets?",
    short: "The tool does not fit the work. Keep the useful parts, connect the gaps, replace the drag.",
    path: "/examples/#answers",
  },
  {
    question: "Why does a competitor show up on Google before us?",
    short: "Google needs a clear profile, real service pages, steady reviews, and local proof it can read.",
    path: "/examples/#answers",
  },
  {
    question: "Can custom be cheaper than another subscription?",
    short: "Sometimes. Not always. Start the math with the monthly bill plus the staff hours lost around it.",
    path: "/examples/#answers",
  },
];

export const answerGuides: AnswerGuide[] = [
  {
    slug: "website-form-not-working-small-business",
    published: "2026-05-13",
    updated: "2026-07-12",
    question: "Why are website form messages not reaching my small business?",
    short:
      "Short answer: check the form settings, email path, spam filters, and domain records first. If people say they sent a form and nothing arrived, you are losing money right now. Fix that before any redesign.",
    sections: [
      {
        heading: "What to check first",
        body: "Check where the form sends messages. Check if the inbox filters them out. Check if the form plugin is still connected. Check if the domain email records are healthy.",
      },
      {
        heading: "Test it like a real customer",
        body: "Open the site on your phone, not the office computer. Fill out the form with a real message. Then check the main inbox, the spam folder, and any shared inbox staff watch. If the screen says thank you but nothing lands, the problem is almost always the email path, not the form.",
      },
      {
        heading: "The usual culprits",
        body: "Most silent forms come from a short list. The alert goes to someone who left. The mailbox filled up. Missing SPF or DKIM records send your mail to spam. Or a plugin or trial quietly expired. Each one can be fixed in an afternoon once you find which it is.",
      },
      {
        heading: "When it becomes a system issue",
        body: "If the form works but follow-up runs on memory, the fix is only partly technical. The business needs a clear path for the lead after it lands.",
      },
      {
        heading: "When to call us",
        body: "Call if you are losing messages right now. Call if you cannot tell whether the form ever worked. Call if messages land but nobody answers them the same day. We check the whole path from the button to your inbox and prove it with a live test. Then we set up a backup copy of every lead, so one broken setting never costs you a customer again.",
      },
    ],
    faq: [
      {
        question: "Is a broken form urgent?",
        answer: "Yes, if customers use it now. Or if the business depends on quotes, bookings, or deposits.",
      },
      {
        question: "Do I need a full website rebuild?",
        answer: "Not usually. Fix the form path first. Then decide if the site needs deeper work.",
      },
    ],
  },
  {
    slug: "reduce-monthly-software-costs-small-business",
    published: "2026-05-13",
    updated: "2026-07-12",
    question: "How can a small business cut monthly software costs?",
    short:
      "Short answer: list every tool, what it costs, and who uses it. Keep the useful tools. Connect the gaps. Cut the waste. Build only what store-bought software does badly.",
    sections: [
      {
        heading: "Find the hidden bill",
        body: "The subscription is only one cost. Staff time, double typing, missed leads, and hand-made reports cost money too.",
      },
      {
        heading: "Make the list first",
        body: "Pull your last three months of bank and card statements. Write down every software charge, including yearly ones that hide as one big hit. Note what each tool is for, who opens it, and where the login lives. Owners are often surprised. Two tools doing the same job. A subscription nobody has touched since a staff member left.",
      },
      {
        heading: "What it usually saves",
        body: "The fastest wins are simple. Duplicate tools. Seats you pay for that nobody uses. Premium tiers you were upsold and never needed. Cutting three or four of those frees real money each month. Nothing about the work has to change. Only then do you ask if a big tool can be swapped for something simpler.",
      },
      {
        heading: "Do not cut what works",
        body: "Some software earns its place. The goal is not to cancel everything. The goal is to stop paying for tools that do not fit the work.",
      },
      {
        heading: "When to call us",
        body: "Call when the list is long, the tools do not talk, or the same info gets typed into three places. We match what you pay against what the work needs. We tell you plainly what to keep, cancel, or connect. We only suggest building custom when the math clearly beats one more subscription.",
      },
    ],
    faq: [
      {
        question: "Is custom software cheaper?",
        answer: "Sometimes. It depends on the monthly cost, the staff time saved, and how long you will use it.",
      },
      {
        question: "What should I do before switching tools?",
        answer: "Map the work first. New software on top of a confusing process just makes the same problem again.",
      },
    ],
  },
  {
    slug: "business-not-showing-on-google-maps",
    published: "2026-05-13",
    updated: "2026-07-12",
    question: "Why is my NYC business not showing on Google Maps?",
    short:
      "Short answer: Google needs a complete profile, matching contact details, real reviews, and clear service pages. It has to see proof that matches how people search nearby.",
    sections: [
      {
        heading: "The profile is only one piece",
        body: "The Google Business Profile matters. But the website, reviews, categories, and neighborhood signals all help you show up on Maps too.",
      },
      {
        heading: "Start with the profile basics",
        body: "Sign in to Google Business Profile. Check that the business is verified. Check that the address and hours are exact. Check that the main category matches what you really do. A profile that is not verified, a category that is close but wrong, or hours that changed after the holidays can all push a real business out of the local results.",
      },
      {
        heading: "Make your name, address, and phone match everywhere",
        body: "Google trusts a business it can confirm. Your name, address, and phone should read the same on your website, your Google profile, Yelp, and any old listing. A mismatched suite number, an old phone line, or a former address makes Google less sure where you are. Less sure means less likely to show you on the map.",
      },
      {
        heading: "Local language matters",
        body: "Google rewards specifics. A late-night bar, a Midtown clinic, and a SoHo boutique serve different people. Each page should sound different too. Not the same words with the neighborhood swapped.",
      },
      {
        heading: "When to call us",
        body: "Call if the profile looks right but you still do not appear. Call if you have duplicate or hijacked listings. Call if reviews and service pages need real work, not a quick edit. We check the whole local picture, fix the profile and the listings that feed it, and build pages that tell Google what you do and where.",
      },
    ],
    faq: [
      {
        question: "Can a website help Maps rankings?",
        answer: "Yes. Clear service pages and matching local details help Google understand what the business does and where.",
      },
      {
        question: "Should I make fake neighborhood pages?",
        answer: "No. Neighborhood pages should be real and useful, or not published at all.",
      },
    ],
  },
  {
    slug: "hair-salon-save-money-software",
    published: "2026-05-13",
    updated: "2026-07-12",
    question: "How can an NYC hair salon save money on booking software?",
    short:
      "Short answer: keep the booking tool if staff and clients really use it. Save by cutting duplicate tools, cleaning the service menu, and connecting follow-up. Replace spreadsheets only where they slow you down.",
    sections: [
      {
        heading: "Booking is not the whole system",
        body: "A salon still needs clear services, deposits, reminders, reviews, and fast answers before a client books.",
      },
      {
        heading: "Know what you are really paying",
        body: "Booking platforms charge in more than one place. A monthly fee per stylist. A card rate on every payment. Sometimes a cut of new clients they send you. Add it all up for a real month. A platform that felt cheap can quietly take a real slice of each chair.",
      },
      {
        heading: "The common leak",
        body: "Many salons pay for a platform but still chase new leads through Instagram, calls, texts, and memory.",
      },
      {
        heading: "Clean the menu before you switch",
        body: "Before paying for anything new, tidy what you have. Retire services nobody books. Set deposits on the appointments that get no-shows. Turn on the reminder texts most tools already include. A messy menu and missing deposits cost more in empty chairs than the software fee. Fixing them costs nothing.",
      },
      {
        heading: "When to call us",
        body: "Call when you pay for a platform but still chase clients by hand. Or when two tools overlap. Or when you cannot tell whether to switch or stay. We start by asking what to keep, not what to replace. Then we connect the follow-up and cut the overlap, so the tools you trust do more of the work.",
      },
    ],
    faq: [
      {
        question: "Should salons use Square, GlossGenius, Fresha, or Mindbody?",
        answer: "It depends on staff calendars, services, memberships, payments, and how clients find you.",
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
    updated: "2026-07-12",
    question: "How can a local pharmacy website better support its community?",
    short:
      "Short answer: make hours, services, refills, insurance notes, and the phone number easy to find. A pharmacy site should clear up confusion before the customer calls or walks in.",
    sections: [
      {
        heading: "Pharmacy customers need clarity fast",
        body: "People check hours, directions, services, vaccines, delivery, and refills. They also want to know a real local person can help.",
      },
      {
        heading: "Put the everyday actions up front",
        body: "The homepage should answer the questions you get on the phone all day. Are you open now? How do I refill? Do you deliver? Do you take my insurance? How do I reach a real person? A tap-to-call button, clear hours, and a simple refill path near the top save everyone a phone call.",
      },
      {
        heading: "Local trust beats generic polish",
        body: "The site should feel real, helpful, and current. Not like a national chain template with a different logo.",
      },
      {
        heading: "Keep it clear without crossing privacy lines",
        body: "A pharmacy site can help without collecting private health details in a plain web form. Point people to the safe way to share private info. That can be a phone call, a secure portal, or a visit. Keep the general contact form free of prescription and medical details. Clear beats clever, and safe beats both.",
      },
      {
        heading: "When to call us",
        body: "Call if the site buries hours and refills. Call if it looks like a chain template. Call if you want a delivery and refill path that fits how your counter really runs. We build a fast, accessible pharmacy site focused on the actions customers take most. Private info gets a safe home, not an open web form.",
      },
    ],
    faq: [
      {
        question: "Should a pharmacy site be complex?",
        answer: "No. It should be clear, fast, easy to use, and focused on what customers need most.",
      },
      {
        question: "Can local search help a pharmacy?",
        answer: "Yes. Service pages, a correct Google profile, reviews, and neighborhood detail all help people find local care.",
      },
    ],
  },
  {
    slug: "when-custom-business-system-beats-saas",
    published: "2026-05-13",
    updated: "2026-07-12",
    question: "When does a custom business system beat another subscription?",
    short:
      "Short answer: custom may make sense when you pay for a big platform but still lean on spreadsheets, double typing, hand-done follow-up, or reports nobody trusts.",
    sections: [
      {
        heading: "Use software when it fits",
        body: "If a tool handles most of the work, has good support, and the team uses it daily, keep it.",
      },
      {
        heading: "The signs you have outgrown the subscription",
        body: "Watch for the tells. You pay for a platform but keep the real numbers in a spreadsheet. The same job gets typed into two systems. Staff work around the tool instead of through it. The reports it makes are the ones nobody believes. When software fights how you really run, another subscription rarely fixes it.",
      },
      {
        heading: "Build when the missing piece is specific",
        body: "A right-sized dashboard, intake path, or follow-up flow can be cleaner than renting a platform built for someone else.",
      },
      {
        heading: "Weigh it honestly",
        body: "Custom is not always cheaper. It makes sense when the monthly bill is real, the lost staff time is real, and you will use the system for years, not months. If a tool mostly works and just needs connecting, that is the better and cheaper move. We will tell you so.",
      },
      {
        heading: "When to call us",
        body: "Call when you cannot tell whether to keep paying, switch, or build. Start with a Tech Audit, so the work is mapped before anything is scoped. We only suggest building when the numbers clearly beat one more subscription. We would rather connect what you own than sell you something you do not need.",
      },
    ],
    faq: [
      {
        question: "Is Little Fight anti-software?",
        answer: "No. Good tools stay. Misfit software gets questioned.",
      },
      {
        question: "What is the first step?",
        answer: "Start with a Tech Audit so the workflow is mapped before anything is scoped.",
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
    "short": "Short answer: Reddit's standard advice is solid. Find responsive local help, avoid long contracts, keep your own passwords. The part it undersells: in NYC, response time is everything. A remote-only provider cannot fix the dead router in your basement.",
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
        "body": "Disclosure first: IT support is part of what we sell, so weigh our words accordingly. Here is the honest checklist we would give a friend. Get the response promise in writing — ours is a callback within two hours between 9am and 9pm ET, and on-site within twenty-four hours when hands are needed. Insist on plain-English explanations of every fix. Refuse lock-in until trust is earned. And make sure every account is owned by the business, not the provider. That means the domain, email, and router admin. Any provider offended by that list is telling you something."
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
        "body": "We build websites for a living, so we are a biased referee — noted. Here is the honest split we use on real consults. If your business is simple, you have a decent eye, and you genuinely have the hours, Squarespace is fine and we will tell you exactly that. Hire someone when the site must produce revenue from calls, bookings, or orders, and every week it underperforms costs you customers. Or hire someone when your half-built draft has been quietly stealing your Sundays. Our small-business builds take fourteen days, and you keep the keys: your domain, your accounts, editable by you."
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
        "body": "Bias on the table: custom builds are part of what we sell. The honest version anyway: if you need a presence this month and the budget is tight, a clean Wix site beats no site, and beats an expensive site that takes six months. Custom pays when the website is a revenue channel: bookings, orders, steady calls. That is when you need speed, local search structure, and integrations a template fights you on. One rule we hold either way: never rebuild out of shame. Rebuild when something measurable is broken: speed, visibility, conversions, or your ability to leave."
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
        "body": "Just fill out your Google profile is table-stakes advice, and in New York the table is crowded. Every decent competitor within ten blocks filled theirs out too. Here the margins are won on specificity. Build pages that match how locals search: by neighborhood, by service, by problem. Add real photos over stock, review volume that keeps pace with foot traffic, and a website that backs up what the profile claims. NYC businesses also face density quirks the threads skip: shared buildings, similar business names, and category competition that barely exists in smaller markets."
      },
      {
        "heading": "Our honest take",
        "body": "Disclosure: local search help is one of our services, so we profit from one side of this argument. Honestly though — most owners can do the majority of local SEO themselves in a few focused weekends: complete the profile, add real photos, build a steady review habit, and make sure the website says what you do and where in plain language. Where paid help earns its keep is the remaining gap: competitive category, page structure, technical cleanup, and knowing which effort actually moves your specific needle instead of doing everything a checklist says."
      },
      {
        "heading": "What to do next",
        "body": "Search for your own business the way a stranger would: category plus neighborhood, on a phone. See what shows up before you do. That single exercise tells you more than most audits. If you want a second pair of eyes on the results, the consult is free and there is no pitch. Often the honest outcome is a short list of fixes you can do yourself, and no reason to hire us at all. You might not need us — that answer is on the menu."
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
        "answer": "They tie work to outcomes you can see: calls, direction requests, ranking for named searches. And they can explain every task in plain English."
      }
    ]
  },
  {
    "slug": "google-business-profile-tips-reddit",
    "question": "Google Business Profile Tips Reddit Swears By — Checked by a Pro",
    "short": "Short answer: Reddit's favorite tips are correct. Complete every field, use real photos, keep reviews steady, and pick the right category. The one it undersells: your primary category and review replies matter more than posting frequency. And keyword-stuffing your business name can get you suspended.",
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
        "body": "Spend thirty minutes this week: confirm your primary category is the most specific true one, check your hours and phone, upload five real photos, reply to your last ten reviews, and make sure your website says what your profile says. That is most of the value, free, no vendor required. If something deeper is wrong, like a suspension, a ranking mystery, or a duplicate listing, the consult with us is free and there is no pitch. This is one area where you genuinely might not need us, and we will say so quickly if that is the case."
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
        "body": "These threads read like breakup posts. My developer stopped answering three weeks ago and the site is half done — what now? I paid a deposit and got silence — can I get it back? The site is live but I have no logins to anything, and the only admin was his email address. Some askers are angry, most are embarrassed, and nearly all are asking the wrong first question: how do I punish this person? The useful one is: what do I still control, and what do I need back?"
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
    "short": "Short answer: Reddit's shorthand is a fine starting point. Square for simplicity, Toast for restaurants, and read the processing terms before signing anything. What the threads miss: the right POS depends on what it must connect to, not the logo on the terminal.",
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
        "body": "Define your service style honestly: counter, full table service, or hybrid. Then read the full contract terms of whichever way you lean, including what leaving costs. Then read our Manhattan-specific comparison in the Journal for the local wrinkles. If you want to talk through your specific floor and volume, the consult is free and there is no pitch. If your current system is working and the pain is really a setup problem, we will say exactly that — you might not need to switch at all."
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
        "body": "Bias disclosed: we set up booking systems for salons as paid work, and we sell neither product. From real setups: both tools are genuinely good, and the unhappy owners we meet are rarely on the wrong app — they are on the right app configured wrong. Deposits off, reminders default, services listed in a way clients misread, booking link buried on Instagram instead of wired into Google. Pick by your structure: solo polish versus team-and-retail ecosystem. Then spend an afternoon on the settings that actually protect your income."
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
    "short": "Short answer: Reddit's rule of thumb is right. Shopify when selling is the business, Squarespace when the site is mostly presence with some selling. For NYC retail the deciding question is inventory: if the shop floor and the website must share stock, Shopify pulls ahead.",
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
        "body": "Bias named: we build and fix retail sites on both platforms for a living. The honest sorting we use: if your shop's register and shelves must share truth with the website, Shopify with its POS is usually the cleaner path, and the app-fee creep is the toll you pay. If online selling is secondary, Squarespace keeps life simpler and cheaper. Think a presence, a catalog, occasional orders. The most common mistake we clean up is not the wrong platform; it is two disconnected systems and an owner reconciling them by hand at midnight."
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
        "body": "Obvious bias, named plainly: we build websites for a living, so we would say you need one. Here is the honest version anyway. A packed word-of-mouth business with no growth ambitions can genuinely skip it — if your books are full and your customers are loyal, a website changes little, and we tell owners that on consults. The real question is where your next customer comes from. If the answer is referrals forever, fine. In this city it is usually strangers searching. When it is, you need ground you own that machines can read."
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
    "short": "Short answer: Reddit's rule is correct. Notion for documents and wikis, Airtable for structured records. Most fights start when someone forces one tool to do the other's job. For a small business the harder question is simpler: which one will your least techy person actually open?",
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
        "answer": "You can, but structured records like orders, clients, and inventory get fragile in it. Most teams do better with Notion for docs and something table-shaped for data."
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
        "body": "Piece the threads together and a map emerges. Personal referrals from neighboring businesses top the list — the deli owner asks the florist who fixed her card reader. Neighborhood WhatsApp and Facebook groups carry constant vendor chatter. The city itself runs real programs: NYC Small Business Services offers free courses and advising that many owners never discover. Business improvement districts sometimes broker help. And a large share of owners simply call whoever built the last thing: the cousin who knows computers, the friend's web guy. The results are as mixed as you would expect."
      },
      {
        "heading": "Where the usual channels break down",
        "body": "Each channel has a failure mode the threads gloss over. Referrals inherit the referrer's standards — the florist's guy is only as good as what a florist knows to check, and a technician great at wifi may be wrong for your website. City programs are genuinely useful for education and planning but move at government speed; they cannot help when your site is down on a Friday. Group-chat vendors are unvetted by definition. And the cousin who knows computers becomes a single point of failure whose documentation lives nowhere."
      },
      {
        "heading": "Our honest take",
        "body": "Full disclosure: we are one of the options in this ecosystem. Websites, IT, and business systems are what we sell, so this take promotes a game we play in. The honest advice regardless of who you hire: a fit test beats a brand name. Ask any candidate three things. What exactly will you do, in plain English? What do you promise in writing — ours is a free consult, fourteen-day website builds, callbacks within two hours from 9am to 9pm ET, and on-site within twenty-four hours. And who owns the accounts when we are done? The answer should always be you."
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
        "body": "Call for help if the suspension is bleeding real revenue, meaning you have gone quiet on Maps in a neighborhood that finds you there. Also call if a first reinstatement was denied and you cannot see why. We handle these for NYC businesses, and we return calls within two hours between 9am and 9pm ET. Honest framing, since we profit from saying otherwise: many owners get reinstated on their own with exactly the steps above, and the consult where we tell you that is free, with no pitch. You might not need us — bring the denial notice and we will give you a straight read either way."
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
    "short": "Short answer: first confirm it is down for everyone, not just you. Then check the three usual suspects in order before touching anything else: domain expiry, hosting billing, SSL certificate. Most outages are a lapsed renewal, not a hack.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What to check first",
        "body": "Before anything, confirm the outage is real: load the site on your phone with wifi off, and ask someone outside your network to try. If it works for them, the problem is your connection, not the site. If it is down for everyone, note exactly what the screen says — a domain parking page, a security warning, a hosting error code, or an endless spinner each point somewhere different. Then ask the question that solves most cases: what changed recently? An update, a new plugin, an expired card, an email from your registrar you meant to read?"
      },
      {
        "heading": "The usual culprits",
        "body": "In rough order of frequency for small-business sites: the domain expired because a renewal notice went to an old email address; the hosting payment failed when a card expired and the account lapsed; the SSL certificate ran out, so browsers now show a scary warning that drives everyone away; an automatic update or plugin change broke the site overnight; or DNS settings were changed, often during an email migration, and the domain no longer points at the site. Actual hacks happen, but they are far rarer than a quiet billing failure nobody noticed."
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
        "body": "Call in help if the domain or hosting account is locked to a person you cannot reach, like a former developer or an old employee's email. Or call if you have restored and renewed and the site is still dark. That recovery work is exactly what we do: we return calls within two hours between 9am and 9pm ET, and when hardware or wiring is the issue we are on-site within twenty-four hours. Said honestly, because it is true: a solid share of these calls end with us pointing at a renew button and wishing the owner well, free, no pitch. You might not need us — but do not lose a week finding out."
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
        "body": "The repeat offenders in city restaurants: the internet connection itself (a failed router, an ISP outage on the block, or a cable someone kicked loose behind the bar); the POS provider's cloud having a bad day, which takes every restaurant on that platform down at once; a software update that ran overnight and left a terminal confused; hardware death, where receipt printers and card readers lead the league; and power problems on overloaded circuits. Old NYC buildings add their own flavor: basement prep areas with weak wifi and wiring nobody has mapped since the previous tenant."
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
        "body": "First, run your domain through one of the free email-authentication checkers online — they grade a test message and show which of the three records exist. Takes five minutes and turns guessing into a diagnosis. If records are missing, whoever manages your domain or email needs to add them. Your provider's support desk can usually do it. It is settings work, not a rebuild. Pause any newsletters and automated blasts until the records pass, because every send while broken digs the reputation hole deeper. And check your sent folder for mail you did not write — if you find any, change the password now."
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
    "short": "Short answer: Google's filter removes or hides reviews it finds suspicious. Bursts from one location, brand-new accounts, anything that smells incentivized. And it catches honest ones in the net. Most missing reviews were filtered, not lost, and prevention beats appeal.",
    "published": "2026-07-12",
    "updated": "2026-07-12",
    "sections": [
      {
        "heading": "What to check first",
        "body": "Pin down what missing means. Did the customer definitely post it — can they still see it in their own Google account? A review that exists there but not publicly has been filtered. Is your total count lower than yesterday, meaning something was removed, or did a new review simply never appear? Check your profile's health too: a suspended or flagged profile hides reviews wholesale, which is a different problem from a single filtered one. And ask what the last week looked like: a review station at the register, a staff push, an event. Timing is usually the clue."
      },
      {
        "heading": "The usual culprits",
        "body": "Google filters reviews by pattern, and the patterns that trip it are predictable: a burst of reviews in a short window, especially from the same wifi network (the classic tablet-at-the-counter setup); reviews from brand-new or barely used Google accounts, which weigh almost nothing; anything incentivized, since discounts-for-reviews violate policy outright; reviews from your own staff or family; text containing links or phone numbers; and gating, meaning asking only your happy customers to post, which is also against the rules. None of this requires bad intent. A well-meaning review drive can trip every wire at once."
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
        "body": "Get help if reviews are vanishing alongside other symptoms like ranking drops, profile warnings, or a suspension. Or get help if you suspect a competitor is mass-reporting your legitimate reviews, which happens in crowded NYC categories and is worth documenting properly. We work on these cases and return calls within two hours between 9am and 9pm ET. But the honest read costs nothing: if a handful of reviews from your counter tablet got filtered, the fix is changing how you ask, not hiring anyone. The consult is free, no pitch — you might not need us, just a better review habit."
      }
    ],
    "faq": [
      {
        "question": "Why did a real five-star review disappear?",
        "answer": "Most likely Google's filter — new reviewer account, same-network posting, or a burst pattern. The reviewer reposting later from their own connection often works."
      },
      {
        "question": "Can filtered reviews be restored?",
        "answer": "Rarely. Support can look into clearly missing legitimate reviews, but the filter's decisions mostly stand. Prevention is the real fix: steady, unprompted-looking asks."
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
    updated: "2026-07-12",
    title: "A clearer official home for a debut horror feature.",
    problem: "CC Films had a live site for Marrow. But the page needed to read as the film's official source. Fast, structured, credible, and useful to press, festival audiences, and search systems.",
    kept: "The analog horror mood, the Marrow poster and trailer, premiere photos, review coverage, core credits, and the existing Netlify/GitHub setup.",
    changed: "Reworked the homepage and gallery order. Sharpened the film and company story. Added privacy and AI-readable reference pages. Fixed schema, sitemap, and header signals. Versioned assets to clear stale caches before going live.",
    result: "A production-ready official site at ccfilms.net. Clearer press paths, stronger film proof, better crawler context, hardened headers, and an easier update path for festival and release news.",
    body: [
      "CC Films is the Dallas-based production company behind Marrow, a debut psychological horror feature. It was directed by Mitch McLeod and produced by CC Films under executive producer Carlos R. Cortez. The site has one narrow but important job. Give press, festival audiences, reviewers, and search systems one official place for the film. Watch the trailer. See the cast and credits. Browse premiere photos. Find the right next step.",
      "The site already had the right raw material. A strong poster. A trailer. Festival-premiere context. Review coverage. Known cast names. A gallery of premiere photos. We kept the analog, VHS-flavored mood and the existing Netlify/GitHub deploy path. The work was making the site behave like an official source instead of a loose brochure. Clearer sections. Better first-screen proof. Fewer places where a visitor or crawler had to guess.",
      "We rebuilt the homepage around the film. We tightened the gallery and press paths. We added a privacy page and llms.txt, repaired schema and sitemap signals, hardened headers, and versioned the CSS/JS so the live deploy stopped serving stale files. The result is a modern ccfilms.net that can carry the film through press, festival, and release news without losing its cinematic tone.",
    ],
  },
  {
    type: "Cruise social network",
    client: "DeckSpace",
    url: "https://www.getdeckspace.com",
    slug: "deckspace",
    metrics: [
      { value: "Live", label: "getdeckspace.com" },
      { value: "3 jobs", label: "Onboard guide · social · memory layer" },
      { value: "Kept", label: "The nostalgic heart of cruising" },
    ],
    image: "/assets/case-deckspace.webp",
    services: ["custom-local-websites", "business-systems"],
    published: "2026-05-13",
    updated: "2026-07-12",
    title: "A nostalgic onboard social layer for life at sea.",
    problem: "DeckSpace needed to explain a cruise-ship social network without feeling like a generic travel app. Guests need events, venue hours, shops, bars, restaurants, voyage details, photos, profiles, and each other, all while moving around the ship.",
    kept: "The emotional center of cruising. Shared plans, temporary community, onboard discovery, and a trip people want to remember after they get home.",
    changed: "Framed the product around nostalgia, finding your way on the ship, guest profiles, event discovery, and ultra-fast performance. The experience feels immediate, not like another portal.",
    result: "getdeckspace.com now tells the whole product in one pass. Part onboard guide, part social network, part cruise memory layer. The public site is built to the same speed bar the product promises.",
    body: [
      "DeckSpace is built for a strange little world: a cruise ship. Guests are relaxed, distracted, and moving between decks. They keep asking the same questions. What is happening tonight? Where is the bar? What is open? Who else is on board? Where did that photo go? The site had to make the product feel like a guest companion, not a software dashboard.",
      "We kept the nostalgic heart of the idea. A cruise is part schedule, part map problem, and part temporary social world. DeckSpace turns that into a shared sailing page. Guests can follow events, check venues, keep up with the voyage, make a profile, find people, and share photos. They leave with a short-lived archive of the trip.",
      "The story also had to respect speed. Ship life punishes slow screens. Guests will not wait just to find dinner hours or see who is going to an event. So DeckSpace is built around fast, low-lag onboard discovery with a warm retro feel. Useful, immediate, and specific to the sailing.",
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
    updated: "2026-07-12",
    title: "From Instagram-only to a real booking flow.",
    problem: "A solo stylist ran her whole business through Instagram and word of mouth. No website. No Google profile. No clear way to book.",
    kept: "The Square Appointments setup her clients already knew.",
    changed: "Built a mobile-first website with a Square booking embed. Set up the Google Business Profile from scratch. Wired neighborhood-specific SEO across the site.",
    result: "A real booking funnel that shows up in local searches. Lighthouse 100s across the board. Bookings now arrive without a DM tag.",
    body: [
      "When we first sat down with Rachel, her whole business ran through Instagram DMs. She built her client base through word of mouth and showing up. But every booking took a back-and-forth in messages. Every confirmation lived in her thumbs. And Google had no idea she existed. The site started as a question. What if every new client could find her, see the work, and book without a single message?",
      "We kept the part that already worked: her Square Appointments setup, which her clients knew. The site became the front door. A mobile-first page with her portfolio, the location, a Square booking embed, and a clear path to the studio. We set up her Google Business Profile from scratch. Address, hours, categories, photos, FAQs. Then we wired the site to back it up. The whole job took two weeks.",
      "Bookings now arrive through the site. Clients find her in search instead of tagging her in DMs. Lighthouse scores landed at 100 across the board. Rachel kept her DMs for client relationships. The booking funnel moved off her phone.",
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
    updated: "2026-07-12",
    title: "E-commerce that doesn't drown the brand.",
    problem: "A streetwear brand with a real point of view needed a real storefront. But Shopify's templates were going to flatten everything that made the brand interesting.",
    kept: "The brand identity, the product designs, and the NYC nightlife voice.",
    changed: "A custom Next.js 14 build. Square handles payments. Printful handles shipping. The whole catalog runs through one JSON master. No hardcoded prices. No platform lock-in.",
    result: "A storefront that looks like the brand, not like a Shopify theme. Square payments and Printful shipping wired in. The owner can ship a new drop in a day.",
    body: [
      "After Hours Agenda is Little Fight NYC's own streetwear experiment. It is the rare case where the agency is also the client, with all the dangers that brings. The brand was tight. The designs were ready. The audience was building. But the storefront was Shopify, and Shopify was flattening the brand. Every product page looked like every other Shopify product page, no matter what we put on it.",
      "The choice was rebuild on Shopify with a custom theme, or rebuild off Shopify entirely. We rebuilt off. Next.js 14 with the App Router. Square for payments. Printful for shipping. The whole catalog runs through a single JSON master, so nothing is hardcoded. No platform lock-in. No theme pulling everything toward sameness.",
      "The result is a storefront that looks like the brand instead of the platform. Payments flow through Square. Orders go to Printful for shipping. New product drops take a day, not a sprint. The site is the brand.",
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
    updated: "2026-07-12",
    title: "Multi-site setup with a real backend.",
    problem: "A help service needed three connected sites. One public, one for intake, one for admin. All sharing live data. All shipping on their own.",
    kept: "The team's existing intake categories and naming.",
    changed: "Three Netlify sites sharing one Supabase backend. Intake routes in real time. Each site deploys on its own when the team pushes.",
    result: "A production multi-site with a database the team can actually look at. Each site ships on its own. Intake data flows where it should, with no copying.",
    body: [
      "ClearHelp is a help service that needed three sites. Public-facing, intake, and admin. All sharing data. All deploying on their own. All looking like one product. The challenge was simple to say and hard to solve. How do you ship three separate Netlify sites that act like one, with a real backend the team can see?",
      "We kept the team's intake categories and naming, so the human side of the work did not change. We built the database layer in Supabase. The public site is static HTML with Netlify Forms feeding the intake site. The admin is a separate, login-protected Netlify deploy. Each site has its own CI, so the team can push to one without rebuilding the others.",
      "The result is production. Three sites. One database. Real-time intake routing. Per-site deploys on every push. ClearHelp's team can look at their data, edit it, and ship updates to any site without breaking the others.",
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
    updated: "2026-07-12",
    title: "An internal cockpit for the work they actually run.",
    problem: "Public House Creative needed one internal system for their estimating, classification, and reporting work. It had to replace a pile of spreadsheets, documents, and know-how that lived in people's heads.",
    kept: "The estimator's judgment and the workflow categories the team already used.",
    changed: "Built Cockpit, a private web app. Documents come in. Rooms and price drivers get sorted. The math checks itself. The report exports cleanly. The screens are dense but never cramped.",
    result: "The team runs the work through Cockpit. Estimates that lived in three tools now live in one. The math is honest. Any number can be traced back to its source. In production and in daily use.",
    body: [
      "Public House Creative came to Little Fight with a real internal-systems problem. Estimating decides whether a job makes money before it starts. That work was spread across documents, spreadsheets, email threads, and the senior estimator's head. Every project dug up the same context again. Every quote took longer than it should. The team had outgrown the tools and was starting to feel it.",
      "We built Cockpit. It is a private web app that turns the messy first pass of an estimate into something structured and checkable. Site photos, blueprints, hand-drawn notes, and scope emails come in. Rooms get sorted. Drivers, the variables that move the math, get resolved. The report exports. The screens show dense data without hiding anything, and never lie about confidence. The estimator's judgment makes the final call. The system just makes that call cheap.",
      "Cockpit is in production. The team uses it on real estimates. The math is honest. New scope items, room types, and export formats land in days, not sprints. The system is becoming what the senior estimator's head used to hold. Now it scales past one person.",
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
    updated: "2026-07-12",
    title: "A clean public face for a finance business.",
    problem: "A funding LLC needed a credible public landing page. Investor-grade look, a clear product summary, and an easy contact path. And none of the tired finance-site cliches.",
    kept: "The team's positioning and the calls-to-action they already use.",
    changed: "Built a quiet, type-led landing page. One clear lead capture. Structured contact info. Meta and schema set up for trust signals.",
    result: "A site partners and prospects can actually share. Professional without sounding generic.",
    body: [
      "Grand Funding is a financial funding business. Finance sites have a template problem: glass towers, stock handshakes, the word 'solutions.' Those defaults exist because trust is hard to show. But to the exact partners this site must convince, a template reads as risk. The brief was to be credible without one borrowed cliche.",
      "We kept the team's positioning and the way they describe what they do. No invented mission statement. The design carries the trust with typography instead of decoration. A quiet, type-led landing with one clear lead capture and structured contact info. The schema markup backs it up: Organization, FinancialService, and Person for the founder.",
      "The result is a public landing page partners and prospects can share without a second thought. Professional, restrained, and intentional. It does not sound like every other LLC website on the internet.",
    ],
  },
  {
    type: "Live-event venue platform",
    client: "VenueCircuit",
    url: "https://venuecircuit.app",
    slug: "venuecircuit",
    metrics: [
      { value: "Live", label: "venuecircuit.app · open beta" },
      { value: "~90 seconds", label: "To close a night" },
      { value: "Every number", label: "Drills to the receipt behind it" },
    ],
    image: "/assets/case-venuecircuit.webp",
    services: ["business-systems", "custom-local-websites"],
    published: "2026-07-12",
    updated: "2026-07-12",
    title: "Our own product: a financial OS for independent venues.",
    problem:
      "Independent music venues close their nights in spreadsheets the next morning. Bar, door, staff, and promoter splits sit in different systems. The venue's money and the promoter's money blur together.",
    kept: "The way GMs actually run a night. Bar, door, staff, splits. Modeled as it happens, not as software wishes it happened.",
    changed:
      "Built the whole product. A nightly close that takes about 90 seconds. Split tracking that keeps venue money and promoter money separate. Reports where every number drills down to the receipt behind it.",
    result:
      "Live to the public at venuecircuit.app in open beta. The GM closes the night in about 90 seconds instead of a spreadsheet marathon. The owner can trust the quarter without a forensic audit.",
    body: [
      "VenueCircuit is the most ambitious thing Little Fight has shipped. Not a website. Not an internal tool. A complete software product, live to the public. Like After Hours Agenda, the agency is also the client here, with all the dangers that brings. Nobody to blame for scope. No one else's deadline to hide behind.",
      "The product answers a question venue owners live with every night. Where did the money actually go? Bar, door, staff, promoter splits, and payouts all land in one place. The core rule: the venue's money and the promoter's money never blur together. Every number drills down to the receipt behind it. A GM can answer a question at midnight. The owner can trust the quarter.",
      "It is live at venuecircuit.app in open beta. For a future client, this is the useful part. It is the same range Little Fight brings to a client's systems, turned all the way up. Proof the team can carry a system from first sketch to a public product people run their money through.",
    ],
  },
];

export const proofSignals = [
  { label: "Keep", text: "The tools that still earn their place.", icon: ShieldCheck },
  { label: "Connect", text: "The pieces that work but do not talk.", icon: PlugZap },
  { label: "Replace", text: "The costly tools and shaky workarounds.", icon: FileSearch },
  { label: "Build", text: "The missing page, dashboard, or workflow.", icon: Sparkles },
];

export const businessTypes = [
  { label: "Law firms", icon: Scale },
  { label: "Bars & restaurants", icon: Store },
  { label: "Clothing brands", icon: Shirt },
  { label: "Salons & barbershops", icon: Scissors },
  { label: "Clinics & pharmacies", icon: HeartHandshake },
  { label: "Shops & bodegas", icon: Globe2 },
  { label: "Gyms & studios", icon: ClipboardCheck },
  { label: "Local services", icon: Wrench },
];

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "business-system",
    term: "Business system",
    definition:
      "The connected set of pages, tools, reminders, and records that moves work from first hello to finished job.",
    plain: "The way the work actually moves, not just the software you bought.",
    whenItMatters:
      "It matters when leads live in too many places. Or when staff copy the same details twice. Or when only the owner knows what happens next.",
    howItWorks:
      "Think of every job as a trip. It starts with a customer's first hello and ends when you get paid. A business system is the map for that trip. Where does a new message land? Who picks it up? What happens next? Where is the record kept? When the steps connect, a lead cannot fall through a crack. Each step hands the work to the next one. Most of the time you already own the tools. They just are not talking to each other yet.",
    example:
      "A neighborhood plumber gets calls, texts, and website forms all day. Each one lands somewhere different. He only remembers to call people back when he is sitting in the truck. A business system puts all three into one list. It sends the customer a 'got your message, we'll call within the hour' note. And it reminds him if a job has no quote by end of day.",
    costOfIgnoring:
      "Without a system, the leaks are invisible until you add them up. The callback that never happened. The quote stuck in a text thread. The repeat customer who booked the other guy because he answered first. None of these feel like a crisis alone. Together they can quietly cost you a job or two a week. And the whole business stays trapped in the owner's head, so you can never take a real day off.",
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
      "One place where leads, customers, notes, follow-up, and sales history live.",
    plain: "The list of people who asked for help, bought something, or need a reply.",
    whenItMatters:
      "It matters when customer notes are split between email, texts, spreadsheets, booking tools, and memory.",
    howItWorks:
      "A CRM is one shared list of everyone who ever contacted you. Each name carries a little history. When someone calls, emails, or books, their details go into that one place. So do notes on what they wanted and when you last talked. Then it reminds you who is waiting on a callback and who has not heard from you in a while. You stop digging through your phone and inbox. You open one screen and it is all there.",
    example:
      "A dental office keeps patient reminders in a paper book. Insurance notes live on sticky pads. 'Call back about the crown' lives in someone's head. A CRM puts each patient's contact, last visit, and follow-up in one record. When they call, whoever answers sees the whole picture. Nobody's six-month cleaning gets forgotten.",
    costOfIgnoring:
      "Without one place for people, the same customer gets asked the same question three times. Warm leads go cold because nobody remembered to follow up. Every repeat customer you lose track of is money you already earned once and let walk out the door. The business also lives in whoever's memory is best that day. That is fragile, and you cannot hand it off.",
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
      "It matters when competitors show on Maps before you. Or when hours are wrong, reviews are stale, or customers keep calling with questions the card should answer.",
    howItWorks:
      "Someone searches your business name, or 'florist near me.' Google shows a card with your hours, phone, photos, reviews, and a map pin. That card is your Google Business Profile. It is free to claim and control. Fill in the right details. Add real photos. List your services. Reply to reviews. Google uses all of it to decide who to show and where. For many local businesses, this card gets seen far more than the website.",
    example:
      "A corner florist makes beautiful arrangements. But the Google card shows old hours and one blurry photo from years ago. A customer searching 'flower delivery near me' sees a competitor with fresh photos, 200 reviews, and a call button. They pick the competitor without a second thought. Fixing the florist's profile puts them back in that first-glance race. Real photos. Current hours. A few review replies.",
    costOfIgnoring:
      "An ignored profile quietly sends your customers to whoever looks more alive on the map. Wrong hours cost you the person who drove over and found you closed. That person often leaves a bad review on top. This card is usually the first thing a new customer sees. A stale one can lose the sale before they ever learn how good you are.",
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
      "The work that helps nearby customers find, trust, and pick your business on Google and Maps.",
    plain: "Showing up when someone nearby is already looking.",
    whenItMatters:
      "It matters when the business depends on local customers, appointments, walk-ins, or bookings.",
    howItWorks:
      "When someone nearby searches for what you do, Google answers with the businesses it trusts most for that area. Local search is the work of earning that trust. A correct Google profile. Clear pages that say what you do and where. Steady reviews. The same name, address, and phone everywhere you appear. Google reads all those signals together to pick who shows on the map. Do them well and you appear right when someone is ready to call or walk in.",
    example:
      "A diner two blocks away is packed. An equally good diner around the corner is empty. The difference often is not the food. The busy one shows up first when someone types 'breakfast near me.' Photos, hours, and reviews all lined up. Getting the quiet diner's pages, profile, and reviews in order puts it in that same hungry-and-nearby moment.",
    costOfIgnoring:
      "If you are invisible in local search, you are paying rent on a spot customers cannot find online. Those searches go to the competitor down the block. These customers are looking right now and ready to buy. Every missed appearance is a sale that went to someone else for no good reason. Over a year, that is a steady stream of walk-ins and bookings you never got the chance to win.",
    related: ["google-business-profile", "business-system"],
    faq: [
      {
        question: "How long until local search actually helps me?",
        answer:
          "Quick wins like fixing your profile can help within weeks. Reviews and good pages build over a few months. It is a habit, not a one-time switch.",
      },
      {
        question: "Do I need to pay Google for ads to show up nearby?",
        answer:
          "No. The regular map and search results are earned, not bought. Ads can add reach on top. A well-kept profile and honest pages do most of the work for free.",
      },
    ],
  },
  {
    slug: "software-stack",
    term: "Software stack",
    definition:
      "All the tools a business uses to run the day. Website, booking, POS, payments, email, spreadsheets, and reports.",
    plain: "All the apps you pay for, plus the work people still do around them.",
    whenItMatters:
      "It matters when the monthly bill keeps growing but the work still runs on workarounds.",
    howItWorks:
      "Your software stack is every tool you use to run the business. The booking app. The card reader. The email. The spreadsheet. The trouble is usually not one tool. It is that they do not share information. So people become the glue, retyping the same details from one app into another. A good look at the stack asks three plain questions of each tool. Is it earning its cost? Does it talk to the others? Is anyone actually using it? Then you drop what is dead, connect what should link up, and keep what works.",
    example:
      "A busy salon pays for a booking app, a separate payment system, a newsletter tool, and a hand-kept spreadsheet. Nothing connects. The front desk copies each appointment into the spreadsheet and retypes new clients into the newsletter list. Trimming the dead tools and connecting the rest gives the manager back an hour a day.",
    costOfIgnoring:
      "A messy stack leaks money two ways. Subscriptions nobody uses anymore. And staff hours spent gluing tools together by hand. We often find a business paying for three tools that half-overlap while a person retypes data between them every morning. Left alone, the bill creeps up every year while the work still runs on the same tired workarounds.",
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
      "A rule that moves routine work forward on its own. It can send a lead to the right place, make a follow-up task, or update a dashboard.",
    plain: "The boring repeatable step happens without someone remembering to do it.",
    whenItMatters:
      "It matters when staff spend time copying details, chasing reminders, or checking three places to answer one question.",
    howItWorks:
      "Automation is a simple 'when this happens, do that' rule that runs on its own. When a form comes in, add the person to your list and send a thank-you. When a job is marked done, set a reminder to ask for a review a week later. You decide the rule once. Then it happens every single time without anyone thinking about it. Aim it at the small, boring, repeatable steps. Those are the ones humans forget, exactly because they are dull.",
    example:
      "A dog groomer used to text every client the night before to confirm. When she remembered. Now a reminder goes out the evening before each appointment. A 'we'd love a review' note goes out the morning after. She did not hire anyone. She set two rules once. No-shows dropped and reviews went up.",
    costOfIgnoring:
      "Doing the boring steps by hand costs you twice. First, the hours spent copying and reminding. Second, the times a human forgets and a customer slips away. Those lost bookings never show up as a bill, so the leak stays hidden. Meanwhile your best people spend the day on busywork a rule could handle, instead of on the customers in front of them.",
    related: ["business-system", "crm", "software-stack"],
    faq: [
      {
        question: "Will automation make my business feel cold or robotic to customers?",
        answer:
          "Done right, it does the opposite. Customers get faster replies and never get forgotten. That feels more caring, not less. You automate the reminder. The relationship stays human.",
      },
      {
        question: "Is this only for big companies with tech teams?",
        answer:
          "No. The best automations for a small shop are small and cheap. One confirmation text. One follow-up reminder. You do not need a tech team. Just the right rule, set up once.",
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
      "Short answer: Lower East Side businesses need fast mobile websites, clear local search signals, and tools that keep up with busy nights and small teams.",
    localPattern:
      "Bars, restaurants, galleries, shops, and studios compete in a packed neighborhood where people search nearby and decide fast.",
    firstMove: "Check the website, the Google profile, the booking or payment flow, and the follow-up.",
    intro:
      "The Lower East Side runs on old tenement blocks that became one of the city's busiest nightlife and small-shop corridors. Orchard, Ludlow, Rivington, Delancey, and the rebuilt Essex Market. The businesses here are mostly owner-run. The person who signs the lease is usually the one behind the bar, in the kitchen, or steaming vintage on the rack.",
    businessLandscape:
      "This is bar and restaurant country. Add vintage and thrift shops, tattoo studios, small galleries, music rooms, and cocktail dens. Most are one location, run hands-on. The pressure is real. Essex Crossing brought chain tenants and national restaurant groups onto blocks that used to be all independents. Delivery apps quietly take a cut of every kitchen's busiest hours. Vintage and record sellers now compete with Depop, eBay, and Instagram resellers who never pay LES rent. A one-room bar or gallery is up against operators with marketing staff and app deals it will never see.",
    localSearchReality:
      "Most people find a spot here on Google Maps. They scan what is open, close, and well-reviewed right now. Often mid-walk down Orchard, or after getting off the F at Delancey. Late-night 'open now' and 'happy hour near me' searches decide where a group of four ends up. Stale hours or a menu that will not load on a phone loses that table instantly. Tourists lean on Maps ratings. Locals lean on recent reviews and Instagram. Both have to be current. Chains win here because their listings are always right and their photos are fresh. Not because the food or the room is better.",
    whatWeFixHere: [
      "A Google profile that still shows old hours or an old phone number",
      "A menu or events page that loads slowly or breaks on a phone at peak hours",
      "A reservation or guest-list link buried three taps deep instead of one tap from Maps",
      "Months-old reviews with no owner replies, so the listing looks ignored",
      "A payment or deposit flow for private events that lives in DMs and gets lost",
    ],
    faq: [
      {
        question: "My bar gets found on Maps, not Google search. Does a website still matter?",
        answer:
          "Yes, because the Maps listing links straight to it. Someone taps your profile for hours, the menu, or a table. A slow or broken page sends them to the next pin. The website closes the visit Maps started.",
      },
      {
        question: "Delivery apps take a big cut. Can you help me push people to order direct?",
        answer:
          "Yes. We set up a direct order and reservation path on your own site and profile. Regulars get a reason to skip the app. We do not rip out what works overnight. We give you a channel you actually own next to it.",
      },
      {
        question: "I run vintage and most of my sales start on Instagram. Where does a website fit?",
        answer:
          "Instagram starts the conversation. A simple site and a correct Google profile close it. That is where people go when they search your name later or need your hours. It also keeps you findable when a post sinks down the feed.",
      },
    ],
    nearby: ["east-village", "soho", "west-village", "williamsburg"],
  },
  {
    slug: "east-village",
    name: "East Village",
    zipCodes: ["10003", "10009"],
    headline: "Right-sized websites and systems for East Village local businesses.",
    shortAnswer:
      "Short answer: East Village businesses win when locals can find them, get the offer fast, and act without chasing broken links or confusing booking paths.",
    localPattern:
      "Restaurants, salons, wellness studios, shops, and service businesses need clear pages and practical systems without corporate bloat.",
    firstMove: "Clean up the service pages, Google visibility, booking path, and tools before buying more software.",
    intro:
      "The East Village stretches from St. Marks Place through Alphabet City. It kept more of its independent, lived-in character than most of Manhattan below 14th Street. The shops, dive bars, and studios here tend to be owned by people who live nearby. Many have run the same storefront for years. They are not operators flown in from a head office.",
    businessLandscape:
      "This is a neighborhood of owner-run restaurants and ramen counters, record and book shops, tattoo studios, and salons. There is also a heavy layer of yoga, wellness, and bodywork studios around the numbered avenues. The pressure shows up as chain drugstores and bank branches taking corner retail. Delivery apps thin the margins on the small kitchens that define the area. Wellness studios fight national booking platforms and class-pass apps that own the customer and rent them back. An independent studio or cafe is often fighting operators who never set foot in the neighborhood.",
    localSearchReality:
      "Locals here search by habit. 'Best ramen East Village.' 'Nail salon near me.' 'Yoga 10009.' They trust recent reviews and photos over polished ads. Foot traffic on St. Marks and Avenue A mixes NYU students, longtime residents, and weekend visitors. A business has to look trusted and current at a glance. Small shops lose on mismatches. A name spelled differently on Google, Instagram, and Yelp. Class times that differ between the profile and the booking app. Chains win on tidy, identical listings everywhere. Not on being better neighbors.",
    whatWeFixHere: [
      "A studio schedule that says one thing on Google and another in the booking app",
      "A name, address, or hours that do not match across Google, Yelp, and Instagram",
      "A service menu that lists treatments but never the price range people search for",
      "A booking button that opens a clunky third-party page instead of a clean flow",
      "A Google profile with no recent photos, so the place looks closed",
    ],
    faq: [
      {
        question: "I pay for a booking platform already. Do I need a website too?",
        answer:
          "The booking platform handles the sale. It does not help people find or trust you first. A simple site plus a correct Google profile turns a 'near me' search into someone opening that booking link. They work together.",
      },
      {
        question: "My salon lives on Instagram. Is that enough?",
        answer:
          "Instagram shows your work. But it does not answer hours, address, and pricing for the person deciding right now. Those questions get asked on Google. If the answer is missing or wrong, they book the shop that answered. We make both point to the same clear truth.",
      },
      {
        question: "How do I compete with the chain pharmacy or gym that moved in?",
        answer:
          "You will not out-spend them. So we make you easier to find and faster to act on for people who want a local, owner-run option. Correct search presence, real reviews, and a booking path that just works. That is where independents win here.",
      },
    ],
    nearby: ["lower-east-side", "soho", "chelsea", "williamsburg"],
  },
  {
    slug: "soho",
    name: "SoHo",
    zipCodes: ["10012", "10013"],
    headline: "Premium websites and business systems for SoHo shops and studios.",
    shortAnswer:
      "Short answer: SoHo businesses need polished public pages and simple back-office systems that protect leads, appointments, payments, and follow-up.",
    localPattern:
      "Retail, galleries, design studios, and premium services need trust fast. Customers compare several options in one walk or one search.",
    firstMove: "Review the website, the local proof, the contact path, and whether staff still run on memory and spreadsheets.",
    intro:
      "SoHo's cast-iron blocks went from artists' lofts to the most expensive retail corridor in the country. But between the global flagships, founder-run boutiques, galleries, showrooms, and design studios are still here. In SoHo, the bar for how a business looks is set by the Prada and Chanel windows next door. Whether the small operator likes it or not.",
    businessLandscape:
      "The owner-run businesses here are fashion and home boutiques, art galleries, design studios, showrooms, and high-end salons and skincare rooms. They sit shoulder to shoulder with brand flagships and pop-ups that spend more on one window display than a small shop spends in a year. The pressure is heavy rent, global retailers who own the block's foot traffic, and e-commerce giants who catch the search before anyone reaches Broadway or West Broadway. A founder-run boutique has to look as credible online as a brand with a whole creative department. Otherwise the browsing customer assumes the big brand is safer.",
    localSearchReality:
      "SoHo runs on live comparison shopping. Someone standing on Spring Street searches a boutique's name, checks a gallery's current show, or compares three salons in one session. Tourists and visitors drive a lot of this. They judge fast, on photos, reviews, and whether the site looks premium on a phone. Small shops lose when the online presence looks thinner than the store. Or when a gallery's site never says what is on view this week. The flagships win on polish. An independent's site has to feel intentional, not improvised.",
    whatWeFixHere: [
      "A boutique site that looks dated next to the flagships customers just walked past",
      "A gallery page that does not clearly show the current show or opening dates",
      "An appointment or private-shopping request with no clean path, so it gets missed",
      "Heavy, slow product images that hurt the premium impression",
      "Client and lead details kept in one staffer's head or a scattered spreadsheet",
    ],
    faq: [
      {
        question: "My rent is already brutal. Why invest in the website?",
        answer:
          "Because in SoHo the website is often the first impression. A thin one makes an expensive store look less credible than it is. It is the cheapest part of your presence to fix. And it is what comparison shoppers judge before they ever walk in.",
      },
      {
        question: "I sell in-store, not online. Do I need e-commerce?",
        answer:
          "Not always. Many SoHo shops do better with a beautiful, fast site that drives visits, appointments, and private-shopping requests. We build for how you actually sell. Not a platform you will resent.",
      },
      {
        question: "We're a small studio competing against firms with real marketing teams. Can we look as legit?",
        answer:
          "Yes. A focused site with strong work, clear contact, and a tidy Google presence closes the gap. No marketing department needed. Clients judge the work and how easy you are to reach. We can make both excellent.",
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
      "Short answer: Chelsea businesses need strong search visibility, sharp service pages, and systems that keep inquiries, bookings, and follow-up easy to see.",
    localPattern:
      "Studios, galleries, salons, fitness, restaurants, and service firms compete for customers who search locally and expect fast answers.",
    firstMove: "Line up Google visibility, service pages, intake forms, booking, and follow-up into one clean path.",
    intro:
      "Chelsea holds the city's densest cluster of contemporary art galleries in the West 20s. The High Line runs above 10th Avenue. A long spine of fitness studios, restaurants, and salons serves a walk-everywhere residential base. Many are owner-run. And they now sit in the shadow of Hudson Yards, the biggest private development in the country, a few blocks west.",
    businessLandscape:
      "The independents here are art galleries, boutique fitness and pilates studios, salons and wellness rooms, restaurants, and service firms. Plus what remains of the old Flower District around 28th Street. The pressure comes from several sides. Hudson Yards pulled retail energy and chain tenants to the far west side. National gym brands like Equinox and boutique-fitness chains compete on every block. Delivery apps squeeze the restaurants. Bigger gallery operations open multiple spaces and dominate the online listings collectors check. A single-location studio or gallery is up against operators with real ad budgets and app deals.",
    localSearchReality:
      "People find Chelsea businesses through 'near me' and neighborhood searches. 'Pilates Chelsea.' 'Galleries open today.' 'Dinner near the High Line.' Often while walking the area or coming off the 1, C, or E trains. High Line and gallery-crawl traffic mixes tourists with locals, so a business must look current to both. Small shops lose when the class schedule or gallery hours are wrong online. Or when a chain's spotless listing simply outranks them on Maps. The chains rarely win on quality here. They win on always-correct, review-rich profiles.",
    whatWeFixHere: [
      "A fitness schedule that differs between Google, the website, and the booking app",
      "A gallery site that does not show the current show or hours for a Saturday crawl",
      "Service pages that describe everything but never say how to start",
      "An inquiry form that drops leads into an inbox where they sit unseen for days",
      "A Google profile outranked by a chain just because it has fresher reviews and photos",
    ],
    faq: [
      {
        question: "Hudson Yards and the chains pulled attention west. How do I stay found?",
        answer:
          "Own the neighborhood searches they do not care about. Your specific service plus Chelsea, plus the blocks around the High Line. Tight local search and current reviews keep you visible to people already near your door. Those are the people who actually buy.",
      },
      {
        question: "I run a studio on a national booking app. Isn't that enough visibility?",
        answer:
          "The app catches people who already picked you. It does not win the person still deciding. That decision happens on Google and Maps. If your profile and site are weak there, the chain studio gets the search. We strengthen the front door the app cannot.",
      },
      {
        question: "We're a gallery — collectors already know us. Why worry about the website?",
        answer:
          "New collectors, visitors, and press check the site for the current show and hours before they walk over. A stale page reads as a stale program. Making the show and hours easy to update is a small fix that protects a serious reputation.",
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
      "Short answer: Midtown businesses need tech that works every day, fast website actions, and workflows that cut interruptions for busy teams.",
    localPattern:
      "Law firms, practices, studios, retailers, and lunch spots need practical support without enterprise overhead.",
    firstMove: "Start with what is blocking calls, bookings, staff access, payments, or customer trust.",
    intro:
      "Midtown is the working engine of the city. Office towers. The Diamond District on 47th Street. The Garment District. And the lunch counters, tailors, and service shops that keep the workforce fed and dressed. The small businesses tucked between the skyscrapers are often family-run. Many have served the same office crowd for decades.",
    businessLandscape:
      "The owner-run businesses here are delis and lunch spots, dry cleaners, tailors, and jewelers in the Diamond District. Plus small law firms, practices, and service firms serving the office crowd. Their pressure is specific. Fast-casual chains like Sweetgreen and Chipotle own the weekday lunch rush. Foot traffic swings hard with return-to-office patterns. Delivery apps take a cut of orders that used to be walk-ins. A deli or tailor here lives on office workers who now split the week between office and home. Every regular counts more than it used to. These operators compete on service and speed against chains with corporate apps and loyalty programs.",
    localSearchReality:
      "Midtown search is fast and practical. 'Lunch near me.' 'Dry cleaner 10017.' 'Watch repair near Grand Central.' Typed by office workers with a narrow window and low patience. The crowd is weekday-heavy and commuter-driven. You are often found by someone who works nearby, does not live here, and will not hunt. Small shops lose when hours do not match the real office pattern. Or when there is no order-ahead or pickup path. Or when a chain's app simply removes the friction first. The chains win on convenience and speed. Not on quality.",
    whatWeFixHere: [
      "Google hours that do not match the real weekday, weekend, and holiday pattern",
      "No order-ahead or pickup path, so the lunch rush goes to the chain with an app",
      "A phone number or contact form that quietly fails while calls are the main lead source",
      "Staff logins, POS, and tools that break and stall the shop with no reliable support",
      "A service business with no clear intake, so inquiries scatter across email, voicemail, and text",
    ],
    faq: [
      {
        question: "My customers are office workers whose schedules changed. How does that affect my setup?",
        answer:
          "Your hours, your busiest windows, and your order-ahead options have to match the new hybrid week. Otherwise you miss the rush you still have. We tune your profile and site to when the office crowd is actually here. Not the old five-day pattern.",
      },
      {
        question: "The chains have apps for ordering ahead. Can a small shop offer that?",
        answer:
          "Yes, and without a custom app. A clean order-ahead or pickup link on your site and Google profile gives the office worker the same one-tap ease. You keep the margin and the relationship. No renting both from a platform.",
      },
      {
        question: "My biggest issue is tech that breaks mid-day. Do you handle that?",
        answer:
          "Yes. Midtown support is often less about marketing and more about the POS, phone, or logins that stall the shop during the rush. We fix what is blocking the day first. Then we look at visibility. A shop that cannot take an order cannot grow.",
      },
    ],
    nearby: ["chelsea", "upper-east-side", "upper-west-side", "long-island-city"],
  },
  {
    slug: "upper-east-side",
    name: "Upper East Side",
    zipCodes: ["10021", "10028", "10065", "10128"],
    headline: "Local search, websites, and support for Upper East Side businesses.",
    shortAnswer:
      "Short answer: Upper East Side businesses need high-trust websites, correct Google visibility, and simple systems that make appointments and follow-up easy.",
    localPattern:
      "Salons, wellness practices, clinics, shops, and professional offices need clarity and trust before customers call.",
    firstMove: "Review the service pages, the profile, the reviews, the booking, and what happens after a customer reaches out.",
    intro:
      "The Upper East Side is affluent, residential, and appointment-driven. It runs from Museum Mile along Fifth Avenue to the hospital corridor near the East River. Lenox Hill, Weill Cornell, Hospital for Special Surgery, and Memorial Sloan Kettering. The small businesses here are heavy on private practices and personal care. Most are owner-run professionals whose reputation is the business.",
    businessLandscape:
      "This is the neighborhood of solo and small-group dental and medical practices, dermatology, physical therapy, salons and blow-dry rooms, Madison Avenue boutiques, framers, and specialty food shops. The defining pressure is private-equity roll-ups. Dental groups and PE-backed medical groups are buying up independent practices. Urgent-care chains like CityMD and beauty chains chase the same appointment-minded clients. A solo dentist or independent salon now faces roll-ups that share marketing, central booking, and ad spend. Patients here have high expectations and quiet loyalty. But they research before they call.",
    localSearchReality:
      "Upper East Side customers research carefully. 'Best dentist Upper East Side.' 'Dermatologist 10028.' 'Facial near me.' They weigh reviews, credentials, and how professional the site feels before booking anything personal or medical. This is a less walk-in, more careful crowd. The search happens at home or on the phone, then leads to a call or a booking. Independents lose when the site looks less credible than the PE-backed group's. Or when reviews are thin. Or when there is no easy way to request an appointment. The chains win on polish and booking ease. Not on the actual care.",
    whatWeFixHere: [
      "A practice site that looks less credible than the PE-backed group down the block",
      "An appointment request that forces a phone call instead of a simple online option",
      "A Google profile missing services, credentials, insurance details, or recent reviews",
      "New-patient intake that is clunky, repeats questions, or gets lost after first contact",
      "A name and address that read differently across listings and chip away at trust",
    ],
    faq: [
      {
        question: "A dental group backed by investors opened nearby. How do I compete as an independent?",
        answer:
          "Lead with what they cannot fake. A credible site, real patient reviews, and a booking path as easy as theirs. Patients here pick the practice that looks trustworthy and is simple to reach. An independent can win both without a corporate budget.",
      },
      {
        question: "My patients are older and call to book. Do I still need online booking?",
        answer:
          "Keep the phone. But add an online request option too. The family members and newer patients who research you expect it. Offering both captures the caller and the researcher. Nobody gets forced through one channel.",
      },
      {
        question: "Isn't a professional practice above worrying about Google reviews?",
        answer:
          "Not on the Upper East Side. Clients here quietly check reviews before anything personal or medical. A few recent, genuine reviews and an owner who replies signal a practice that is present and cared for. That is exactly what this clientele looks for.",
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
      "Short answer: Upper West Side businesses need clear websites, reliable support, and search visibility that helps nearby customers pick them.",
    localPattern:
      "Neighborhood shops, studios, restaurants, practices, and service teams often need fewer tools and cleaner customer paths.",
    firstMove: "Find the biggest leak across the website, Google visibility, booking, payments, or follow-up.",
    intro:
      "The Upper West Side is brownstone-lined and family-heavy. It is anchored by Lincoln Center, Central Park, and Riverside Park. It has a long tradition of neighborhood institutions like Zabar's and the independent shops along Broadway, Amsterdam, and Columbus. The businesses here are largely owner-run and built on relationships. They serve families and longtime residents who shop close to home.",
    businessLandscape:
      "The independents here are neighborhood restaurants and cafes, kids' enrichment and music programs, pediatric and wellness practices, bookstores, hardware and specialty food shops, salons, and dry cleaners. The pressure is quieter than downtown but real. Chain pharmacies took corner after corner, then left storefronts empty. Delivery apps skim the local restaurants. National fitness and enrichment brands chase the family dollar. A family-run shop or kids' program here depends on trust built over years. But new parents and new arrivals still search first. These owners compete against chains and apps that never learned a single customer's name.",
    localSearchReality:
      "Search here is practical and family-driven. 'Pediatric dentist Upper West Side.' 'Kids music classes near me.' 'Hardware store Amsterdam Avenue.' Often it is a parent solving a problem quickly. The crowd is local and repeat. So correct hours, an easy phone tap, and current reviews matter more than flashy design. Small shops lose when the listing is stale. Or when a class schedule is impossible to find. Or when a chain simply shows up first on Maps. The chains win on being easy to find. Not on the neighborhood knowledge these owners actually have.",
    whatWeFixHere: [
      "A class, camp, or program schedule parents cannot find or read on a phone",
      "A Google profile with old hours that sends a busy parent to a competitor",
      "A shop paying for tools it barely uses when it needs fewer, simpler ones",
      "A restaurant with no clean direct-order path, losing margin to the delivery apps",
      "A contact or sign-up form that fails quietly, so inquiries never reach the owner",
    ],
    faq: [
      {
        question: "Most of my customers are regulars. Why does search visibility matter?",
        answer:
          "Because the neighborhood keeps turning over. New families arrive all the time. They search before they ever walk in. A strong local presence keeps the flow of new regulars coming. That is what keeps a relationship business healthy.",
      },
      {
        question: "I run a kids' program and registration is a mess. Can you simplify it?",
        answer:
          "Yes. We make the schedule easy to find and the sign-up path clean. Parents register in a couple of taps instead of emailing back and forth. Less friction means fewer dropped sign-ups and far fewer admin headaches for you.",
      },
      {
        question: "I feel like I'm paying for software I don't use. Can you help?",
        answer:
          "That is common up here. Often the fix is fewer tools, not more. We look at what you actually use, cut what drags, and connect what is left. The shop runs cleaner and the monthly bill stops creeping.",
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
      "Short answer: West Village businesses need elegant, fast websites and practical systems that help customers act. No new expensive platform required.",
    localPattern:
      "Restaurants, boutiques, salons, studios, and service businesses run on neighborhood trust and fast customer decisions.",
    firstMove: "Check the public website, local search signals, booking or contact path, and software bills.",
    intro:
      "The West Village is Manhattan's most walkable and picture-perfect quarter. Winding, low-rise streets off the grid. Tree-lined blocks. Famous corridors like Bleecker Street that draw locals and visitors alike. The businesses here trade on charm and reputation. Most are owner-run restaurants, boutiques, and cafes where the founder is a fixture on the block.",
    businessLandscape:
      "The independents are intimate restaurants and wine bars, boutiques and design shops, salons, cafes, and specialty food and wine stores. The neighborhood's retail history is a warning. Bleecker Street swung from independent shops to luxury flagships to empty windows as rents outran everyone. Delivery apps now squeeze the small kitchens that give the area its name. A boutique or restaurant here fights luxury brand spillover on one side. On the other, apps and e-commerce catch customers before they ever wander the block. The charm is the moat. But the online presence has to live up to the in-person experience, or the visitor never makes the trip.",
    localSearchReality:
      "The West Village runs on discovery and destination searches. 'Best restaurants West Village.' 'Wine bar near me.' 'Cute boutiques Bleecker Street.' The crowd is a heavy mix of tourists, date-nighters, and locals. Photos, recent reviews, and a clear reservation or hours answer decide where a visitor commits. Often while wandering with their phone out. Small shops lose when the site looks thinner than the storefront. Or when the reservation or menu link is buried. Or when a stale listing makes a loved spot look closed. Nobody wins here on ad budget. They win by looking as good online as they do on the street, and being effortless to act on.",
    whatWeFixHere: [
      "A restaurant site where the reservation link or menu is buried instead of one tap away",
      "A boutique's online presence that looks thinner than the shop actually is",
      "A Google profile with old photos or hours that makes a loved spot look closed",
      "Delivery apps skimming every order with no direct-order option for regulars",
      "A stack of overlapping subscriptions that could be fewer, cheaper tools",
    ],
    faq: [
      {
        question: "My spot is beloved locally. Why does the website matter?",
        answer:
          "Because the tourists and date-nighters who fill your tables do not know you yet. They find you by searching while they wander. A site and profile that match how good the place really is turn that search into a reservation. Not a scroll-past.",
      },
      {
        question: "Reservations come through an app I pay for. Isn't that covered?",
        answer:
          "The app takes the booking. But the person still has to pick you first. That choice happens on Google, Maps, and your site. If those look weak, the reservation app never gets the chance. We strengthen the step before it.",
      },
      {
        question: "Rents here are brutal and I'm watching costs. Will this add another bill?",
        answer:
          "Usually the opposite. We often find overlapping subscriptions to cut. Then we build a lean site and a clean local presence that does more for less. Fewer tools that actually work. Not another platform on the pile.",
      },
    ],
    nearby: ["soho", "chelsea", "lower-east-side"],
  },
  {
    slug: "williamsburg",
    name: "Williamsburg",
    zipCodes: ["11211", "11249"],
    headline: "Websites, local search, and weekend-proof systems for Williamsburg businesses.",
    shortAnswer:
      "Short answer: Williamsburg businesses need fast mobile pages, correct Google listings, and booking and ordering paths that hold up when the weekend crowd arrives.",
    localPattern:
      "Boutiques, restaurants, bars, venues, and studios ride heavy weekend foot traffic and compete for people who decide on their phones mid-walk.",
    firstMove: "Check the website on a phone, the Google profile, the reservation or ticket link, and what breaks when the weekend rush hits.",
    intro:
      "Williamsburg is Brooklyn's busiest small-business strip. Bedford Avenue, North 6th, Grand Street, and the waterfront around Domino Park. The L train drops a crowd at Bedford Avenue all day, and the ferry adds more. Most businesses here are owner-run. The person who picked the records, hung the clothes, or built the menu is usually in the room.",
    businessLandscape:
      "This is boutiques, vintage shops, record stores, restaurants, bars, music venues, coffee roasters, and small design studios. The pressure is heavy. National brands took storefronts on Bedford and North 6th, so an independent shop now sits next to a flagship with a whole marketing team. Delivery apps take a cut of every busy kitchen. Vintage sellers compete with online resale apps that never pay Brooklyn rent. And the week is lopsided. A huge share of the money walks in between Friday night and Sunday evening. If something online is broken on a Saturday, the week is hurt.",
    localSearchReality:
      "People decide here with a phone in hand. Standing on Bedford, off the L, or walking up from the ferry. 'Brunch near me.' 'Vintage Williamsburg.' 'Tickets tonight.' The weekend crush means hundreds of these little searches happen at once, and the spot with correct hours, fresh photos, and a one-tap reservation or ticket link wins the group. A menu that loads slowly or a listing with old hours loses the table to the place next door. Locals check Instagram. Visitors check Maps. Both have to say the same, current thing.",
    whatWeFixHere: [
      "A website that slows down or breaks on phones exactly when Saturday traffic peaks",
      "A Google profile with old hours, so weekend visitors think the shop is closed",
      "A ticket, reservation, or waitlist link buried three taps deep instead of one tap from Maps",
      "A boutique whose Instagram looks great while its Google listing looks abandoned",
      "Delivery apps taking a cut of every order with no direct path for regulars",
    ],
    faq: [
      {
        question: "My shop lives or dies on the weekend. What does that change?",
        answer:
          "It means your online setup has to be strongest exactly when you are busiest. We check that the site stays fast, the hours are right, and the booking or order link works on a phone on a Saturday. A weekday test is not enough here.",
      },
      {
        question: "I run a venue. People find shows on Instagram and ticket apps. Why fix the rest?",
        answer:
          "Because the person deciding tonight searches your name to check the address, the time, and what the room is like. If Google shows old info or the site buries the ticket link, they stall and pick something else. We make the search answer match the post.",
      },
      {
        question: "Big brands moved onto my block. How does a small shop stay visible?",
        answer:
          "You will not outspend them, so we make you easier to find and act on for people who want the independent option. A correct profile, recent photos, real reviews, and a fast site. That is how the small shop stays on the map next to the flagship.",
      },
    ],
    nearby: ["bushwick", "dumbo", "lower-east-side"],
  },
  {
    slug: "bushwick",
    name: "Bushwick",
    zipCodes: ["11221", "11237"],
    headline: "Websites, Google visibility, and simple systems for Bushwick businesses.",
    shortAnswer:
      "Short answer: Bushwick businesses need to be easy to find at night, easy to check on a phone, and easy to book or order from without a big platform bill.",
    localPattern:
      "Art studios, bars, music spots, food counters, and family shops draw a crowd that looks everything up on a phone first, often after dark.",
    firstMove: "Check how the business looks in a late-night search, then the hours, the photos, and the way people order or book.",
    intro:
      "Bushwick grew around the L train stops at Jefferson Street, Morgan Avenue, and DeKalb Avenue. Warehouses became art studios and music rooms. Blocks are covered in murals. New bars and food spots opened next to family businesses that have served the neighborhood for decades. Almost everything here is independent, and the owner is usually working the counter.",
    businessLandscape:
      "This is artist studios and small galleries, bars and late-night music spots, tacos and food counters, coffee shops, tattoo studios, and longtime family-run groceries, bakeries, and botanicas. The pressure is uneven. The new crowd arrives mostly at night and on weekends, so a bar or venue earns its week in a few hours. Delivery apps skim the kitchens. Event platforms and ticket apps own the customer list for shows. Rents climb as the neighborhood gets discovered. A studio or bar here competes for attention with all of Brooklyn, on a phone screen, without a marketing budget.",
    localSearchReality:
      "Search here is night-heavy. 'Bars open late Bushwick.' 'Tacos near me.' 'Shows tonight.' People plan a whole night out from a phone on the L. They check Maps for what is open and Instagram for what it feels like, and both have to look alive. A place with no recent photos or an unclaimed listing reads as closed, even with a line out the door. Daytime, the searches turn practical. Groceries, laundry, a haircut. The family businesses that never needed a website now lose new neighbors to whichever listing looks complete.",
    whatWeFixHere: [
      "A bar or venue whose Google listing looks dead while the room is full every weekend",
      "Late-night hours that are wrong online, so 'open now' searches skip the place",
      "A food counter losing margin to delivery apps with no direct way to order",
      "A studio or gallery with no simple page showing what is on and how to visit",
      "A longtime family shop that new neighbors cannot find because it was never put online",
    ],
    faq: [
      {
        question: "My crowd finds us by word of mouth and Instagram. Why does Google matter?",
        answer:
          "Because the person who heard about you still searches your name before coming. They want the address, the hours, and proof it is open. If Google shows nothing or something stale, some of them quietly give up. We make the search confirm what the word of mouth started.",
      },
      {
        question: "I have run my shop for twenty years without a website. Why now?",
        answer:
          "Your longtime customers know you. The new people moving in do not. They pick shops from their phone. A simple page and a correct Google listing let the new neighbors find what everyone else already knows. It does not have to be fancy or expensive.",
      },
      {
        question: "Most of my sales happen Friday to Sunday nights. Can you work around that?",
        answer:
          "Yes. We test the setup the way your customers use it. At night, on a phone. And we do not change anything during your busy window. Fixes land on the quiet days, so the weekend is never at risk.",
      },
    ],
    nearby: ["williamsburg", "east-village"],
  },
  {
    slug: "park-slope",
    name: "Park Slope",
    zipCodes: ["11215", "11217"],
    headline: "Clear websites and reliable systems for Park Slope's family businesses.",
    shortAnswer:
      "Short answer: Park Slope businesses need correct hours, easy booking, and pages that answer a parent's questions fast, because families here research before they walk in.",
    localPattern:
      "Family-facing services, medical and dental practices, kids' programs, boutiques, and cafes serve parents who check everything online first.",
    firstMove: "Check the schedule, the booking path, the Google reviews, and whether a parent can get every answer on a phone in one minute.",
    intro:
      "Park Slope is brownstone Brooklyn at its most family-heavy. The shopping runs along Fifth Avenue and Seventh Avenue, with Prospect Park at the top of the hill. The customers are mostly households within a few blocks. Strollers, school pickups, weekend errands. The businesses are owner-run, and many have served the same families for years.",
    businessLandscape:
      "This is pediatric, dental, and therapy practices, kids' classes and enrichment programs, boutiques, bookshops, toy stores, cafes and restaurants, vets, and salons. The pressure is quiet but constant. Chains and investor-backed practice groups chase the same family dollar. Delivery and booking apps put themselves between the shop and the customer. And the customers here are researchers. Parents compare, read reviews, and ask other parents online before trying anywhere new. A great local business with a thin online presence loses to a weaker one that simply answers questions better.",
    localSearchReality:
      "Search here is a parent solving a problem. 'Pediatric dentist Park Slope.' 'Toddler music class near me.' 'Vet open Saturday.' It happens from home, the playground, or mid-errand, and it ends in a booking or a visit. Reviews carry serious weight, because recommendations are how this neighborhood decides. A wrong opening time is expensive here. Nobody re-walks a stroller twice. The businesses that win make the schedule, the booking, and the reviews all easy to check in one quick look, with nothing hidden.",
    whatWeFixHere: [
      "A class or program schedule that parents cannot find or read on a phone",
      "Booking that requires a phone call when half the neighborhood books everything online",
      "A practice site that looks less trustworthy than the investor-backed group nearby",
      "Google hours that miss the real weekend and school-holiday pattern",
      "A sign-up or intake form that quietly fails, so inquiries never reach the owner",
    ],
    faq: [
      {
        question: "My business runs on neighborhood word of mouth. Why invest online?",
        answer:
          "Because the recommendation now gets checked. A parent hears your name, then searches it. If the site is confusing or the reviews are thin, the recommendation loses power. A clear site and a healthy profile make every word-of-mouth mention count.",
      },
      {
        question: "Registration for my kids' program is a mess of emails. Can that be simpler?",
        answer:
          "Yes. We put the schedule where parents can find it and make sign-up a couple of taps instead of an email chain. Fewer dropped registrations, fewer repeated questions, and much less admin time for you.",
      },
      {
        question: "A big practice group opened nearby. How does a solo practice compete?",
        answer:
          "With trust and ease. Your site has to look as credible as theirs, your reviews have to be real and recent, and booking has to be just as easy. Families here often prefer the independent option. We make sure choosing you is not the harder path.",
      },
    ],
    nearby: ["dumbo", "williamsburg"],
  },
  {
    slug: "dumbo",
    name: "DUMBO",
    zipCodes: ["11201"],
    headline: "Polished websites and clean systems for DUMBO studios, galleries, and brands.",
    shortAnswer:
      "Short answer: DUMBO businesses need an online presence as sharp as the neighborhood, because the offices, galleries, and shops here get judged on polish fast.",
    localPattern:
      "Galleries, design studios, small product brands, and cafes serve a mix of office workers, clients, and weekend visitors who all judge on the first screen.",
    firstMove: "Review the website against the neighborhood's standard, then the Google profile, the contact path, and how leads are tracked.",
    intro:
      "DUMBO is cobblestone streets and converted warehouses between the Brooklyn and Manhattan bridges. Brooklyn Bridge Park wraps the waterfront. Tech companies and design studios fill the lofts. Weekends bring crowds to photograph the bridge down Washington Street. It is one of the few neighborhoods where a small business's customers might be a Fortune 500 client and a tourist in the same hour.",
    businessLandscape:
      "This is art galleries, design and creative studios, small direct-to-consumer product brands with office space, photographers, event spaces, cafes, and a handful of shops and restaurants serving both office workers and visitors. The pressure is the standard. The neighbors are funded startups and established studios with real design budgets, so a thin website stands out here the way a broken window would. Studios and brands compete for clients citywide, not just on the block. And the foot traffic splits in two. Weekday office people, weekend tourists. A cafe or shop has to be findable and current for both.",
    localSearchReality:
      "Two kinds of search happen here. Visitors search on the spot. 'Coffee near Brooklyn Bridge Park.' 'Galleries open today.' They pick from Maps in seconds, standing on the cobblestones. Clients search from a desk. They look up a studio or brand by name, read the site, and judge whether it looks like the level they want to hire. Both searches are won or lost on polish and correctness. A gallery whose site does not show the current show, or a studio whose portfolio is a year stale, reads as less serious than it is.",
    whatWeFixHere: [
      "A studio or brand site that looks below the level of the work it shows",
      "A gallery page that does not say what is on view right now or when to come",
      "A portfolio or case page that takes too long to load and loses the busy client",
      "A cafe or shop invisible on Maps while thousands walk past on a Saturday",
      "Leads from the site landing in an inbox with no owner and no follow-up",
    ],
    faq: [
      {
        question: "Our clients come by referral. Does the website really matter?",
        answer:
          "Yes, because every referral checks the site before replying. In DUMBO the bar is set by your neighbors, and clients notice. A site that matches the quality of your work makes the referral land. A stale one plants doubt you never hear about.",
      },
      {
        question: "We are a small brand with an office here, not a storefront. What applies to us?",
        answer:
          "The same fight at a different door. Your customers judge the site, the search results, and how fast you respond. We tighten the pages, the product story, and the follow-up path so the brand looks as considered online as the product is.",
      },
      {
        question: "Weekend tourists walk past my shop all day. How do I turn that into business?",
        answer:
          "Be the answer when they search. Correct pins and hours on Maps, fresh photos, and a page that loads instantly on a phone. Visitors decide in seconds. The shop that shows up clean gets the walk-in.",
      },
    ],
    nearby: ["williamsburg", "park-slope", "lower-east-side"],
  },
  {
    slug: "astoria",
    name: "Astoria",
    zipCodes: ["11102", "11103", "11105", "11106"],
    headline: "Websites, Google listings, and honest tech help for Astoria's family businesses.",
    shortAnswer:
      "Short answer: Astoria businesses need correct listings, simple websites, and help in plain language, so loyal neighborhood customers and new arrivals can both find them.",
    localPattern:
      "Greek and Middle Eastern restaurants, bakeries, groceries, family shops, and medical offices run on loyalty but win new customers through search.",
    firstMove: "Check what a new neighbor sees when they search, then the hours, the menu or services, and the phone number on every listing.",
    intro:
      "Astoria runs along 30th Avenue, Broadway, Ditmars Boulevard, and Steinway Street, at the ends of the N and W trains. It is one of the most mixed neighborhoods in the country. Greek tavernas and bakeries, Middle Eastern restaurants and groceries along Steinway, and family businesses from everywhere in between. Many shops here are second- or third-generation, and the owner's family is often behind the counter.",
    businessLandscape:
      "This is restaurants and tavernas, bakeries, butchers and groceries, barbershops and salons, hardware stores, tailors, and a solid layer of medical, dental, and pharmacy offices serving the neighborhood. The pressure comes from two directions. Chains and delivery apps squeeze the food businesses the same way they do everywhere. And the neighborhood itself is changing. New residents arrive every year who do not know the old names. They find everything by phone. A beloved taverna with a wrong phone number online, or a bakery with no listing at all, is invisible to the exact people who would become its next regulars.",
    localSearchReality:
      "The old customers do not need Google. The new ones use nothing else. 'Greek food Astoria.' 'Halal butcher near me.' 'Dentist 11103.' Searches here happen in more than one language, and the results decide which family business the new neighbor tries first. Reviews matter because the new arrival has no history here to lean on. The chains win when their listing is complete and the local legend's is empty. Not because anyone prefers the chain. Getting the listing right is how a forty-year-old business introduces itself to someone who moved in last month.",
    whatWeFixHere: [
      "A restaurant or bakery whose Google listing has a wrong number, old hours, or no menu",
      "A family shop with no website at all, invisible to new neighbors who search first",
      "A listing with no recent photos, so a busy, loved place looks closed or forgotten",
      "A medical or dental office with no simple way to request an appointment online",
      "Delivery apps taking a cut from kitchens that could take direct orders",
    ],
    faq: [
      {
        question: "My customers have come here for decades. Do I really need this?",
        answer:
          "Your regulars will keep coming. This is about the people moving in who have never heard of you. They pick by phone. A correct listing and a simple page put you in front of them the same way your storefront always has. It protects the next twenty years, not the last.",
      },
      {
        question: "English is not my first language. Is working with you going to be hard?",
        answer:
          "No. We explain everything in plain words, show you instead of lecturing you, and never bury anything in contracts or jargon. You will understand what we are doing and why before we do it. Bring a family member to translate if that is more comfortable. That is normal for us.",
      },
      {
        question: "I do not want a fancy website. Just customers finding the right information.",
        answer:
          "That is the right instinct. Most Astoria businesses need a correct Google listing, real photos, current hours and menu, and a simple page that loads fast. We start there. Nobody sells you a big platform you do not need.",
      },
    ],
    nearby: ["long-island-city"],
  },
  {
    slug: "long-island-city",
    name: "Long Island City",
    zipCodes: ["11101", "11109"],
    headline: "Local search, websites, and systems for Long Island City businesses.",
    shortAnswer:
      "Short answer: Long Island City businesses serve thousands of brand-new residents who have no habits yet. Whoever shows up best in search wins them first.",
    localPattern:
      "Gyms, vets, daycares, cafes, and ground-floor services under new towers compete for residents who pick everything by phone because everything is new to them.",
    firstMove: "Check how the business ranks in a 'near me' search, then the reviews, the booking path, and whether new residents can become regulars in one visit.",
    intro:
      "Long Island City grew a skyline in a decade. Towers rose around Court Square, Queens Plaza, and the Hunters Point waterfront by Gantry Plaza State Park, and the ground floors filled in with the businesses a new neighborhood needs. The 7, E, M, and G trains make it one stop from Manhattan. Most customers here are new. So are most of the businesses serving them.",
    businessLandscape:
      "This is gyms and fitness studios, vets and groomers, daycares, dental and medical offices, cafes and restaurants, dry cleaners, and salons. The ground-floor service layer of a tower neighborhood. The pressure is unusual. There is little old word of mouth, because almost everyone arrived recently. National chains take the prime tower retail with corporate budgets. And every new lease nearby is another wave of residents choosing a gym, a vet, and a coffee spot from scratch. The independents that win are the ones a new arrival finds first and trusts fast.",
    localSearchReality:
      "Search is the front door here more than anywhere else we work. A new resident unpacks and searches. 'Gym near me.' 'Vet Long Island City.' 'Daycare 11101.' They have no neighbor to ask yet, so reviews and photos carry all the trust. The results of those first-week searches turn into habits that last for years. A business that is hard to find online is not losing one sale. It is losing a resident's entire routine to whoever showed up first and looked credible.",
    whatWeFixHere: [
      "A business invisible in 'near me' searches while new towers fill up around it",
      "Thin or old reviews, when reviews are the only trust signal new residents have",
      "A gym, studio, or daycare with no clear schedule, pricing path, or trial sign-up online",
      "A vet or medical office where booking means a phone call during work hours",
      "No follow-up after a first visit, in a neighborhood where routines are still forming",
    ],
    faq: [
      {
        question: "My storefront faces heavy foot traffic. Isn't that enough?",
        answer:
          "Foot traffic helps, but new residents here decide by phone before they walk. They search, compare, and read reviews from the couch. The storefront closes the deal that search starts. If you are weak online, they walk past you to the place they already picked.",
      },
      {
        question: "Everyone in my building seems to use the big chain gym. How do I compete?",
        answer:
          "The chain wins on default, not on fit. We make you the easy alternative to find. A sharp profile, real reviews, a clear schedule, and a trial sign-up that takes one minute. New residents want a place that knows their name. They just have to find it.",
      },
      {
        question: "My customers move away and new ones arrive constantly. How do I keep up?",
        answer:
          "Turnover means winning new people has to be a system, not luck. We make sure every wave of arrivals finds you, and we set up simple follow-up so a first visit becomes a routine. In LIC, the setup that welcomes newcomers best owns the block.",
      },
    ],
    nearby: ["astoria", "midtown", "williamsburg"],
  },
];

export const studioProjects: StudioProject[] = [
  {
    slug: "dakota",
    name: "Dakota",
    kind: "AI client finder",
    status: "Active",
    oneline: "Our own AI that finds the right businesses to talk to, writes to them like a person, and hands real conversations to the team.",
    description:
      "Dakota is an experiment. Can a small services business reach new clients the way a big sales team does, without hiring a sales team? Dakota finds likely businesses, writes to each one like a person, and hands real replies to the team. The point is not scale. It is learning what good outreach looks like when nobody is rushing.",
    stack: ["AI", "Custom build"],
    image: "/assets/coworking-laptops.webp",
    body: [
      "Dakota answers a question. Can a small services business reach new clients the way a big sales team does, without hiring a sales team? Dakota studies a business first, writes to it like a person would, and hands any real reply straight to the team.",
      "The point is not scale. It is discovery. What does good outreach look like when nobody is chasing a quota? When the agent knows exactly what Little Fight does and does not do? When the only measure that matters is 'did this person have a real conversation?'",
      "Less volume than a normal cold-outreach setup. But the conversations that do start tend to be real, not transactional. Dakota stays a sandbox until that ratio gets boring. It has not happened yet.",
    ],
    // Internal ops telemetry (weekly funnel counts, reply latency) removed
    // from the public site 2026-07-12 — David: "nothing internal should
    // show." The story stays; the log numbers don't.
  },
  {
    slug: "cockpit",
    name: "Estimator's Cockpit",
    kind: "Field-precision web app",
    status: "Active",
    oneline: "An internal cockpit for Public House Creative. Discovery, sorting, and reporting in one premium UI.",
    description:
      "Built for Public House Creative. The Cockpit turns the messy first pass of an estimate into a structured record. Documents in. Rooms sorted. Price drivers checked. Report out. Private to the team. The biggest non-public build Little Fight has shipped.",
    stack: ["Next.js", "Supabase", "Anthropic", "Netlify Functions"],
    image: "/assets/hero-laptop.webp",
    body: [
      "The Cockpit is the largest non-public build Little Fight has shipped. It was built for Public House Creative. It turns the messy first pass of an estimate into a structured record. Site photos, blueprints, hand-drawn notes, and scope emails come in. Rooms get sorted. Drivers get checked. The report goes out.",
      "The build is Next.js, Supabase, Anthropic for classification, and Netlify Functions for the heavy processing. The screens show dense information without hiding anything. The data tells the truth. The estimator's judgment makes the call.",
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
      "VenueCircuit is the most ambitious thing in the Studio. Not a website. Not an internal tool. A complete software product, live to the public. It is a financial operating system for independent music venues and event spaces. The GM closes the night in about 90 seconds. The venue's money stays separate from the promoter's. The quarter is already reconciled. Live at venuecircuit.app.",
    stack: ["Next.js", "Supabase", "TypeScript", "Netlify"],
    image: "/assets/case-venuecircuit.webp",
    external: "https://venuecircuit.app",
    body: [
      "VenueCircuit answers a question venue owners live with every night. Where did the money actually go? Bar, door, staff, promoter splits, and payouts all land in one place. The night closes in about 90 seconds instead of a spreadsheet marathon the next morning.",
      "The core rule: the venue's money and the promoter's money never blur together. Every number drills down to the receipt behind it. A GM can answer a question at midnight. The owner can trust the quarter without a forensic audit.",
      "It is live at venuecircuit.app in open beta, with a free 45-day pilot. It is the same range Little Fight brings to a client's systems, turned all the way up.",
    ],
  },
];
