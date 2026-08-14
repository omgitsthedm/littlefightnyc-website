/* Split out of site.ts so content routes load ONLY their own data slice
 * (this array was part of the ~200KB shared site chunk). Pure data, no icons. */

import {
  CABINETRY_PROCESS_FILM,
  type CinematicMediaAsset,
} from "./cinematic-media";

export type CaseProofStatus =
  | "public-live"
  | "owned-live"
  | "case-only"
  | "private-client"
  | "private-concept";

export type CaseCaptureDevice = "desktop" | "tablet" | "mobile";

export type CaseFeatureProof = {
  label: string;
  ownerOutcome: string;
  whyItMatters: string;
  sourceUrl: string;
  sourceLabel: string;
  verifiedAt: string;
  steps: Array<{
    label: string;
    detail: string;
  }>;
  textAlternative: string;
};

type CaseMetric =
  | {
      value: string;
      label: string;
      evidence: "build" | "release";
      evidenceId?: never;
      verifiedAt?: never;
      approval?: never;
      approvedAt?: never;
    }
  | {
      value: string;
      label: string;
      evidence: "business-outcome";
      evidenceId: string;
      verifiedAt: string;
      approval: "client-approved";
      approvedAt: string;
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
  inventoryOnly?: boolean;
  video?: CinematicMediaAsset;
  services: string[];
  published?: string;
  updated?: string;
  body?: string[];
  metrics?: CaseMetric[];
  featureProof?: CaseFeatureProof;
  showcase: {
    label: string;
    kind: string;
    context: string;
    availability: "public" | "private";
    privacyLabel?: string;
    linkPolicy?: "custom-domain" | "case-only";
    proof: {
      status: CaseProofStatus;
      captureDate?: string;
      captureDevices?: CaseCaptureDevice[];
    };
    stages: Array<{ label: string; detail: string }>;
    heroPosition?: string;
    heroPositionMobile?: string;
  };
};

export const caseStudies: CaseStudy[] = [
  {
    type: "Proof-pending project record",
    client: "The Break Room",
    url: "",
    slug: "the-break-room",
    image: "/assets/hero-examples-market.webp",
    inventoryOnly: true,
    metrics: [
      { value: "Private", label: "Proof is not ready to share", evidence: "build" },
      { value: "No", label: "Temporary link presented as client proof", evidence: "release" },
    ],
    showcase: {
      label: "Project record, proof pending",
      kind: "Private project record",
      context: "Work kept private until public proof is ready",
      availability: "private",
      privacyLabel: "Proof pending",
      linkPolicy: "case-only",
      proof: { status: "case-only" },
      stages: [
        { label: "Record", detail: "The work exists. We will not call it a finished client result before it is ready." },
        { label: "Protect", detail: "Temporary links, client details, and unfinished proof stay private." },
        { label: "Next", detail: "When public proof is approved, this page can show the customer path and the outcome." },
      ],
    },
    services: [],
    title: "A project record that does not pretend unfinished work is public proof.",
    problem: "The work is real, but the client details and public proof are not ready to share.",
    kept: "The honest boundary: no invented launch story, no private details, and no temporary link dressed up as a client site.",
    changed: "Added a small record so a future client can see our standard: we show the work when the proof is ready, not before.",
    result: "An honest public summary. It shows how Little Fight protects a client while work is still private.",
    body: [
      "The Break Room is real work, but it is not public client proof yet. A future client should not have to wonder whether a temporary page is a finished launch, so we do not show one.",
      "When the owner approves public proof, this page can show the customer path, the date, and what changed. Until then, the useful promise is honesty: we protect the work before we promote it.",
    ],
  },
  {
    type: "Proof-pending project record",
    client: "Surviving Game",
    url: "",
    slug: "surviving-game",
    image: "/assets/hero-examples-market.webp",
    inventoryOnly: true,
    metrics: [
      { value: "Private", label: "Proof is not ready to share", evidence: "build" },
      { value: "No", label: "Temporary link presented as client proof", evidence: "release" },
    ],
    showcase: {
      label: "Project record, proof pending",
      kind: "Private project record",
      context: "Work kept private until public proof is ready",
      availability: "private",
      privacyLabel: "Proof pending",
      linkPolicy: "case-only",
      proof: { status: "case-only" },
      stages: [
        { label: "Record", detail: "The work exists. We will not call it a finished client result before it is ready." },
        { label: "Protect", detail: "Temporary links, client details, and unfinished proof stay private." },
        { label: "Next", detail: "When public proof is approved, this page can show the customer path and the outcome." },
      ],
    },
    services: [],
    title: "A project record that does not make up a launch story.",
    problem: "The work is real, but the client details and public proof are not ready to share.",
    kept: "The honest boundary: no invented launch story, no private details, and no temporary link dressed up as a client site.",
    changed: "Added a small record so a future client can see our standard: we show the work when the proof is ready, not before.",
    result: "An honest public summary. It shows how Little Fight protects a client while work is still private.",
    body: [
      "Surviving Game is real work, but it is not public client proof yet. A future client should not have to wonder whether a temporary page is a finished launch, so we do not show one.",
      "When the owner approves public proof, this page can show the customer path, the date, and what changed. Until then, the useful promise is honesty: we protect the work before we promote it.",
    ],
  },
  {
    type: "Proof-pending project record",
    client: "Pole Position IT",
    url: "",
    slug: "pole-position-it",
    image: "/assets/hero-examples-market.webp",
    inventoryOnly: true,
    metrics: [
      { value: "Private", label: "Proof is not ready to share", evidence: "build" },
      { value: "No", label: "Temporary link presented as client proof", evidence: "release" },
    ],
    showcase: {
      label: "Project record, proof pending",
      kind: "Private project record",
      context: "Work kept private until public proof is ready",
      availability: "private",
      privacyLabel: "Proof pending",
      linkPolicy: "case-only",
      proof: { status: "case-only" },
      stages: [
        { label: "Record", detail: "The work exists. We will not call it a finished client result before it is ready." },
        { label: "Protect", detail: "Temporary links, client details, and unfinished proof stay private." },
        { label: "Next", detail: "When public proof is approved, this page can show the customer path and the outcome." },
      ],
    },
    services: [],
    title: "A project record that does not use a temporary link as a shortcut.",
    problem: "The work is real, but the client details and public proof are not ready to share.",
    kept: "The honest boundary: no invented launch story, no private details, and no temporary link dressed up as a client site.",
    changed: "Added a small record so a future client can see our standard: we show the work when the proof is ready, not before.",
    result: "An honest public summary. It shows how Little Fight protects a client while work is still private.",
    body: [
      "Pole Position IT is real work, but it is not public client proof yet. A future client should not have to wonder whether a temporary page is a finished launch, so we do not show one.",
      "When the owner approves public proof, this page can show the customer path, the date, and what changed. Until then, the useful promise is honesty: we protect the work before we promote it.",
    ],
  },
  {
    type: "Proof-pending project record",
    client: "All Pets Animal Hospital",
    url: "",
    slug: "all-pets-animal-hospital",
    image: "/assets/hero-examples-market.webp",
    inventoryOnly: true,
    metrics: [
      { value: "Private", label: "Proof is not ready to share", evidence: "build" },
      { value: "No", label: "Temporary link presented as client proof", evidence: "release" },
    ],
    showcase: {
      label: "Project record, proof pending",
      kind: "Private project record",
      context: "Work kept private until public proof is ready",
      availability: "private",
      privacyLabel: "Proof pending",
      linkPolicy: "case-only",
      proof: { status: "case-only" },
      stages: [
        { label: "Record", detail: "The work exists. We will not call it a finished client result before it is ready." },
        { label: "Protect", detail: "Temporary links, client details, and unfinished proof stay private." },
        { label: "Next", detail: "When public proof is approved, this page can show the customer path and the outcome." },
      ],
    },
    services: [],
    title: "A project record that does not invent a client result.",
    problem: "The work is real, but the client details and public proof are not ready to share.",
    kept: "The honest boundary: no invented launch story, no private details, and no temporary link dressed up as a client site.",
    changed: "Added a small record so a future client can see our standard: we show the work when the proof is ready, not before.",
    result: "An honest public summary. It shows how Little Fight protects a client while work is still private.",
    body: [
      "All Pets Animal Hospital is real work, but it is not public client proof yet. A future client should not have to wonder whether a temporary page is a finished launch, so we do not show one.",
      "When the owner approves public proof, this page can show the customer path, the date, and what changed. Until then, the useful promise is honesty: we protect the work before we promote it.",
    ],
  },
  {
    type: "Lower East Side retail shop",
    client: "Army & Navy Bags",
    url: "",
    slug: "army-navy-bags",
    metrics: [
      {
        value: "5 landmarks",
        label: "Turn the shop into a neighborhood stop",
        evidence: "build",
      },
      {
        value: "Store + FAQ",
        label: "Clear facts for a first-time visitor",
        evidence: "build",
      },
      {
        value: "3 screens",
        label: "Desktop, iPad, and phone proof",
        evidence: "release",
      },
    ],
    showcase: {
      label: "The Lower East Side as a field guide",
      kind: "Private website concept",
      context: "Lower East Side retail",
      availability: "private",
      privacyLabel: "Private client concept",
      linkPolicy: "case-only",
      proof: {
        status: "private-concept",
        captureDate: "2026-07-27",
        captureDevices: ["desktop", "tablet", "mobile"],
      },
      heroPosition: "center 52%",
      heroPositionMobile: "56% center",
      stages: [
        {
          label: "Find",
          detail:
            "Clear search facts tell Google what the shop sells, where it is, and when it is open, so a new neighbor can find the right answer.",
        },
        {
          label: "Feel",
          detail:
            "Real store photos, gear, and the old awning make the page feel like the actual shop instead of a shiny template.",
        },
        {
          label: "Walk",
          detail:
            "A real map puts the store beside Katz’s, Russ & Daughters, Yonah Schimmel’s, and Essex Market, so it can become part of a Lower East Side day.",
        },
        {
          label: "Visit",
          detail:
            "The phone number, hours, address, and directions stay easy to reach on a phone, so looking can turn into walking through the door.",
        },
      ],
    },
    image: "/assets/case-army-navy-bags.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-07-23",
    updated: "2026-07-27",
    title: "A packed neighborhood shop became part of the walk.",
    problem:
      "A long-running Lower East Side shop had history, character, and shelves people could get lost in. Its old website mostly acted like a listing. It did not show a new neighbor or traveler why the store belonged in their day.",
    kept:
      "The weathered awning, the packed-in shop, the real products, the old-school personality, the address, the phone number, and the feeling that this place could only exist on the Lower East Side.",
    changed:
      "Built a phone-first field guide around one simple visit. Real shop photos show the place. Clear product groups explain what is inside. A neighborhood map puts the shop beside five familiar stops, with directions always close.",
    result:
      "A private client concept designed to turn online curiosity into a real stop. It does not pretend the shop is a chain. It shows why Army & Navy Bags belongs on a Lower East Side walk, then proves the experience across desktop, iPad, and phone.",
    body: [
      "This is a private client concept, not a public client launch. Think of the old WordPress site like a faded paper sign: it said the shop existed, but it did not help a new person understand why to go. Army & Navy Bags is the opposite of a plain listing. The store is narrow, packed, useful, strange, and full of Lower East Side character. The website needed to make that feeling easy to understand on a phone.",
      "We kept the scuffed awning, the real shelves, the military bags, jackets, patches, hats, and the people inside. Then we made the path simple. First, see what kind of place this is. Next, see what it carries. Then check the hours, call, or get directions. There is no giant menu to learn and no shiny store template pretending the shop is something it is not.",
      "The neighborhood map does one extra job. It shows Army & Navy Bags beside Katz’s, Russ & Daughters, Yonah Schimmel’s, and Essex Market. If someone is already going there, the map says the bag shop is right around the corner. That turns the website from a digital business card into a reason to add one more stop. Clear local facts and one-tap directions make the last few blocks easier.",
    ],
  },
  {
    type: "Film production company",
    client: "CC Films",
    url: "https://ccfilms.net",
    slug: "cc-films",
    metrics: [
      {
        value: "5 pages",
        label: "One official path through the film",
        evidence: "build",
      },
      {
        value: "224 photos",
        label: "Premiere archive kept cinematic",
        evidence: "build",
      },
      {
        // Measured 2026-07-29, Lighthouse 13.4.1: 99 mobile, 100 desktop.
        // Artifact: .lifi/evidence/lighthouse/ccfilms-2026-07-29.md
        // The published figure is the mobile one — desktop scores are the
        // easy half and say little about how the site actually feels.
        value: "99",
        label: "Dated phone-page check",
        evidence: "release",
      },
    ],
    featureProof: {
      label: "The official film path",
      ownerOutcome:
        "Press, festival audiences, and viewers have one official place to watch, read, and find the next step.",
      whyItMatters:
        "When the facts live in one clear home, a release does not depend on a scavenger hunt through social posts.",
      sourceUrl: "https://ccfilms.net",
      sourceLabel: "ccfilms.net",
      verifiedAt: "2026-08-13",
      steps: [
        { label: "Watch", detail: "The trailer and film context arrive before a visitor has to hunt for them." },
        { label: "Verify", detail: "Credits, reviews, and release facts have one official place to live." },
        { label: "Remember", detail: "The premiere archive keeps a large photo record usable from phone through desktop." },
      ],
      textAlternative:
        "The live site gives visitors one official path: watch the trailer, verify the film facts, then explore the premiere archive.",
    },
    showcase: {
      label: "An analog screening room for Marrow",
      kind: "Website",
      context: "Independent film company",
      availability: "public",
      linkPolicy: "custom-domain",
      proof: {
        status: "public-live",
        captureDate: "2026-07-27",
        captureDevices: ["desktop", "tablet", "mobile"],
      },
      stages: [
        { label: "Gather", detail: "Trailer, credits, reviews, premiere photos, and release facts come together in one official source." },
        { label: "Screen", detail: "Five focused pages and an analog theater atmosphere give the film room to feel like a film." },
        { label: "Archive", detail: "A 224-photo premiere gallery stays easy to explore from desktop through phone." },
        { label: "Publish", detail: "The official facts stay together, so a new update does not send people hunting through old posts." },
      ],
    },
    image: "/assets/case-cc-films.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-05-13",
    updated: "2026-07-27",
    title: "A debut horror feature got an official home that feels like cinema.",
    problem: "CC Films had the raw material for Marrow, but it needed one official home for audiences, press, festivals, and reviewers without flattening the film into a generic entertainment template.",
    kept: "The analog horror mood, the Marrow poster and trailer, premiere photography, review coverage, core credits, and the way the team already publishes updates.",
    changed: "Made one official home with five focused pages. The trailer, credits, reviews, and premiere photos now have clear places to live, so viewers know where to look next.",
    result: "A live official home at ccfilms.net. Press, festival audiences, and viewers can watch, verify the facts, and keep exploring on a phone, tablet, or desktop. The dated build check appears beside the live source; it is not a sales result.",
    body: [
      "CC Films is the Dallas-based production company behind Marrow, a debut psychological horror feature. The site has one important job: give press, festival audiences, reviewers, and viewers one official place for the film. Watch the trailer. See the cast and credits. Browse premiere photos. Find the right next step.",
      "The team already had the good parts: a strong poster, a trailer, festival context, reviews, cast names, and a deep premiere gallery. We kept the analog, VHS-flavored mood. Then we made the site easier to use as the official answer instead of a loose brochure.",
      "The finished site gives each important thing a clear home. It can carry press, festival, and release news without losing the film’s tone or making a visitor guess where the facts live.",
    ],
  },
  {
    type: "Cruise social network",
    client: "DeckSpace",
    url: "",
    slug: "deckspace",
    metrics: [
      { value: "Archived", label: "Case walkthrough only", evidence: "release" },
      {
        value: "3 jobs",
        label: "Onboard guide, social network, memory layer",
        evidence: "build",
      },
      {
        value: "Kept",
        label: "The nostalgic heart of cruising",
        evidence: "release",
      },
    ],
    showcase: {
      label: "Cruise guest network",
      kind: "Archived product walkthrough",
      context: "Life at sea",
      availability: "private",
      privacyLabel: "Archived walkthrough",
      linkPolicy: "case-only",
      proof: {
        status: "case-only",
        captureDate: "2026-07-21",
        captureDevices: ["desktop", "mobile"],
      },
      stages: [
        { label: "Orient", detail: "Guests find voyage details, venue hours, shops, bars, restaurants, and what is happening next." },
        { label: "Connect", detail: "Profiles and shared events turn a ship full of strangers into a temporary neighborhood." },
        { label: "Remember", detail: "Photos and voyage history give the trip a useful memory layer after everyone gets home." },
      ],
    },
    image: "/assets/case-deckspace.webp",
    services: ["custom-local-websites", "business-systems"],
    published: "2026-05-13",
    updated: "2026-07-12",
    title: "A nostalgic onboard social layer for life at sea.",
    problem: "DeckSpace needed to explain a cruise-ship social network without feeling like a generic travel app. Guests need events, venue hours, shops, bars, restaurants, voyage details, photos, profiles, and each other, all while moving around the ship.",
    kept: "The emotional center of cruising. Shared plans, temporary community, onboard discovery, and a trip people want to remember after they get home.",
    changed: "Framed the product around nostalgia, finding your way on the ship, guest profiles, and event discovery. The experience aims to feel like a helpful companion, not another portal.",
    result: "An archived product walkthrough that explains the onboard guide, social network, and cruise-memory idea without presenting an old host as current client proof.",
    body: [
      "DeckSpace is built for a strange little world: a cruise ship. Guests are relaxed, distracted, and moving between decks. They keep asking the same questions. What is happening tonight? Where is the bar? What is open? Who else is on board? Where did that photo go? The site had to make the product feel like a guest companion, not a software dashboard.",
      "We kept the nostalgic heart of the idea. A cruise is part schedule, part map problem, and part temporary social world. DeckSpace turns that into a shared sailing page. Guests can follow events, check venues, keep up with the voyage, make a profile, find people, and share photos. They leave with a short-lived archive of the trip.",
      "The story also had to make quick questions feel easy. A guest should not have to dig through a maze just to find dinner hours or see who is going to an event. The retained captures show the intended discovery path; this page does not present the former host as a current launch.",
    ],
  },
  {
    type: "Solo stylist salon",
    client: "Hair By Rachel Charles",
    url: "https://hairbyrachelcharles.com",
    slug: "hair-by-rachel-charles",
    metrics: [
      {
        // Measured 2026-07-30, Lighthouse 13.4.1.
        // Artifact: .lifi/evidence/lighthouse/hairbyrachelcharles-2026-07-30.md
        value: "96",
        label: "Dated phone-page check · 30 Jul 2026",
        evidence: "release",
      },
      {
        value: "3 scores of 100",
        label: "Three dated quality checks",
        evidence: "release",
      },
      {
        value: "49 routes",
        label: "Services and local intent mapped clearly",
        evidence: "build",
      },
      {
        value: "Square",
        label: "The booking habit clients already knew",
        evidence: "build",
      },
    ],
    featureProof: {
      label: "The booking handoff",
      ownerOutcome:
        "A new client can understand Rachel's work and reach the booking tool they already know without a DM detour.",
      whyItMatters:
        "The website does the explaining first, so the booking step is a handoff instead of another back-and-forth.",
      sourceUrl: "https://hairbyrachelcharles.com",
      sourceLabel: "hairbyrachelcharles.com",
      verifiedAt: "2026-08-13",
      steps: [
        { label: "See", detail: "The work and point of view show what kind of chair a first-time client is booking." },
        { label: "Choose", detail: "Service and neighborhood pages answer the practical questions before a visitor asks." },
        { label: "Book", detail: "The path hands off to Square Appointments, the booking habit existing clients already know." },
      ],
      textAlternative:
        "The live site shows the stylist's work, answers service questions, and sends a ready visitor into Square Appointments.",
    },
    showcase: {
      label: "A bright editorial chair in Chelsea",
      kind: "Website",
      context: "Independent stylist",
      availability: "public",
      linkPolicy: "custom-domain",
      proof: {
        status: "public-live",
        captureDate: "2026-07-27",
        captureDevices: ["desktop", "tablet", "mobile"],
      },
      heroPosition: "center 10%",
      heroPositionMobile: "82% 10%",
      stages: [
        { label: "Find", detail: "Service and neighborhood pages give a new client a clear place to land beyond Instagram." },
        { label: "Feel", detail: "Electric yellow, close-cropped work, and Rachel’s own voice make the site feel like her chair, not a salon template." },
        { label: "Trust", detail: "Rachel’s face, portfolio, location, service details, and policies answer the questions a first-time client has." },
        { label: "Book", detail: "The Square setup clients already knew stays in place inside a clear path that works on every screen." },
      ],
    },
    image: "/assets/case-hair-by-rachel-charles.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-05-13",
    updated: "2026-08-04",
    title: "An Instagram business became a searchable editorial booking system.",
    problem: "A solo stylist ran her whole business through Instagram and word of mouth. No website. No Google profile. No clear way to book.",
    kept: "Rachel’s point of view, the work itself, and the Square Appointments setup her clients already knew.",
    changed: "Built a bold phone-first site that explains services, location, and what a new client should do next. The booking habit stayed the same: the site leads clearly into Square. We also set up the studio’s Google Business Profile.",
    result: "A public home at hairbyrachelcharles.com where a new client can find the studio, understand Rachel’s work, and book from a desktop, tablet, or phone. The dated build checks are shown beside the live source; they are not booking or revenue claims.",
    body: [
      "When we first sat down with Rachel, her whole business ran through Instagram DMs. She built her client base through word of mouth and showing up. But every booking took a back-and-forth in messages. Every confirmation lived in her thumbs. And Google had no idea she existed. The site started as a question. What if every new client could find her, see the work, and book without a single message?",
      "We kept the part that already worked: her Square Appointments setup, which her clients knew. The site became the front door. Electric yellow, confident type, close-cropped work, and Rachel’s own voice give the experience a point of view before the booking button appears. We also set up her Google Business Profile from scratch and wired the site to support it.",
      "The finished site gives services, common questions, and neighborhood details their own clear pages. Square remains the booking destination. The website does the work before it: help a new client recognize the right fit, trust the work, and book without a long message chain.",
    ],
  },
  {
    type: "Streetwear brand",
    client: "After Hours Agenda",
    url: "https://www.afterhoursagenda.com",
    slug: "after-hours-agenda",
    metrics: [
      {
        value: "Custom",
        label: "Built for the brand, not a template",
        evidence: "build",
      },
      { value: "1 day", label: "To ship a new product drop", evidence: "release" },
      {
        value: "Square + Printful",
        label: "Payments + fulfillment wired",
        evidence: "build",
      },
    ],
    featureProof: {
      label: "From drop to delivery",
      ownerOutcome:
        "The owner can launch a product drop without rebuilding the storefront or sacrificing the brand to a template.",
      whyItMatters:
        "One clear product source, a payment handoff, and fulfillment routing reduce the number of places a small store has to babysit.",
      sourceUrl: "https://afterhoursagenda.com",
      sourceLabel: "afterhoursagenda.com",
      verifiedAt: "2026-08-13",
      steps: [
        { label: "Choose", detail: "The catalog presents a product drop in the brand's own visual language." },
        { label: "Pay", detail: "The customer moves through a clear Square payment handoff." },
        { label: "Ship", detail: "Fulfillment is routed to Printful so the owner is not rebuilding an order by hand." },
      ],
      textAlternative:
        "The storefront presents a product drop, hands payment to Square, and routes paid orders to fulfillment without a platform-themed customer experience.",
    },
    showcase: {
      label: "Custom storefront",
      kind: "Website + commerce",
      context: "Independent streetwear",
      availability: "public",
      linkPolicy: "custom-domain",
      proof: { status: "owned-live", captureDate: "2026-07-23" },
      stages: [
        { label: "Catalog", detail: "One source keeps the products, prices, and drop details together." },
        { label: "Sell", detail: "The storefront keeps the brand intact while Square handles the payment step." },
        { label: "Fulfill", detail: "Paid orders go to Printful for shipping, so a new drop does not mean rebuilding the store." },
      ],
    },
    image: "/assets/case-after-hours-agenda.webp",
    services: ["custom-local-websites", "business-systems"],
    published: "2026-05-13",
    updated: "2026-07-12",
    title: "An online store that keeps the brand’s character.",
    problem: "A streetwear brand with a real point of view needed a real storefront. But Shopify’s templates were going to flatten everything that made the brand interesting.",
    kept: "The brand identity, the product designs, and the NYC nightlife voice.",
    changed: "Made one storefront that keeps product details together, sends payment through Square, and sends paid orders to Printful for shipping. The owner does not have to rebuild the store for every drop.",
    result: "A storefront that looks like the brand, not like a Shopify theme. Payment and shipping have clear handoffs, and a new product drop can go out in a day.",
    body: [
      "After Hours Agenda is Little Fight NYC’s own streetwear experiment. It is the rare case where the agency is also the client, with all the dangers that brings. The brand was tight. The designs were ready. The audience was building. But the storefront was Shopify, and Shopify was flattening the brand. Every product page looked like every other Shopify product page, no matter what we put on it.",
      "The choice was to keep patching a template or make a store that fit the brand from the start. We made the second one. Product details live in one place. Square takes payment. Printful handles shipping. The owner does not have to babysit a pile of disconnected tools to put out a new drop.",
      "The result is a storefront that looks like the brand instead of the platform. A customer can choose a product, pay, and wait for shipping without seeing the machinery behind it. New product drops can take a day, not a long rebuild.",
    ],
  },
  {
    type: "Help service",
    client: "ClearHelp",
    url: "https://www.clearhelp.org",
    slug: "clearhelp",
    metrics: [
      {
        value: "One shared record",
        label: "The request and staff work stay together",
        evidence: "build",
      },
      {
        value: "Separate updates",
        label: "One update does not disturb the other work",
        evidence: "build",
      },
      {
        value: "One handoff",
        label: "The request reaches the right place without copying",
        evidence: "release",
      },
    ],
    featureProof: {
      label: "One intake, a clear handoff",
      ownerOutcome:
        "Someone asking for help gets a clear public starting point while the team receives the request in the protected system built to handle it.",
      whyItMatters:
        "A customer should not have to know how the tools work behind the scenes. The business should not have to copy the same request between them.",
      sourceUrl: "https://clearhelp.org",
      sourceLabel: "clearhelp.org",
      verifiedAt: "2026-08-13",
      steps: [
        { label: "Ask", detail: "The public site gives a person a clear, calm place to start." },
        { label: "Route", detail: "The request reaches the connected intake layer without an exposed admin detour." },
        { label: "Handle", detail: "The team works from its protected environment, separate from the public experience." },
      ],
      textAlternative:
        "The public site lets someone ask for help, routes the request into a connected intake system, and keeps the team workspace protected.",
    },
    showcase: {
      label: "Connected intake system",
      kind: "Connected system",
      context: "Help service",
      availability: "public",
      linkPolicy: "custom-domain",
      proof: { status: "public-live", captureDate: "2026-07-23" },
      stages: [
        { label: "Receive", detail: "The public site gives people a clear place to ask for help without exposing the working system behind it." },
        { label: "Route", detail: "A request enters once, then reaches the right staff view without anyone copying it between tools." },
        { label: "Manage", detail: "The team has a protected place to work through requests, while each public part can be updated without disturbing the others." },
      ],
    },
    image: "/assets/case-clearhelp.webp",
    services: ["custom-local-websites", "business-systems"],
    published: "2026-05-13",
    updated: "2026-07-12",
    title: "One clear path for a request, even when several teams need it.",
    problem: "A help service needed three connected sites. One public, one for intake, one for admin. All sharing live data. All shipping on their own.",
    kept: "The team’s existing intake categories and naming.",
    changed: "Made the public, intake, and staff parts work together without forcing the team to copy a request from place to place.",
    result: "A working setup where a request reaches the right place, the team can see its information, and updates do not make the other parts fall over.",
    body: [
      "ClearHelp needed three connected places: one for the public, one for requests, and one for the staff who handle them. They needed to feel like one service, not three unrelated tabs.",
      "We kept the team’s own categories and names, so the human work did not have to change. A request now starts in one clear place and reaches the right staff view without someone retyping it.",
      "The result is a connected setup the team can use and update with confidence. The useful proof is not the plumbing. It is that a request can reach the right place without extra copying.",
    ],
  },
  {
    type: "Creative agency",
    client: "Public House Creative",
    url: "",
    slug: "public-house-creative",
    metrics: [
      {
        value: "3 tools to 1",
        label: "Estimates in one source of truth",
        evidence: "release",
      },
      {
        value: "Every number",
        label: "Audits back to its source",
        evidence: "build",
      },
      {
        value: "In production",
        label: "Runs on the team’s real bids",
        evidence: "release",
      },
    ],
    showcase: {
      label: "Private estimating software",
      kind: "Private software",
      context: "Custom cabinetry team",
      availability: "private",
      proof: { status: "private-client" },
      heroPosition: "right center",
      heroPositionMobile: "center center",
      stages: [
        { label: "Collect", detail: "Site photos, blueprints, notes, and scope emails enter one structured project record." },
        { label: "Resolve", detail: "Rooms and price drivers get classified while the estimator keeps control of the final judgment." },
        { label: "Audit", detail: "The math checks itself and every number can be traced back to its source." },
        { label: "Export", detail: "A clean report leaves the system ready for the real bid, with no spreadsheet reconstruction." },
      ],
    },
    image: CABINETRY_PROCESS_FILM.poster,
    video: CABINETRY_PROCESS_FILM,
    services: ["business-systems"],
    published: "2026-05-13",
    updated: "2026-07-12",
    title: "An internal cockpit for the work they actually run.",
    problem: "Public House Creative needed one internal system for their estimating, classification, and reporting work. It had to replace a pile of spreadsheets, documents, and know-how that lived in people’s heads.",
    kept: "The estimator’s judgment and the workflow categories the team already used.",
    changed: "Built Cockpit, a private web app. Documents come in. Rooms and price drivers get sorted. The math checks itself. The report exports cleanly. The screens are dense but never cramped.",
    result: "The team runs the work through Cockpit. Estimates that lived in three tools now live in one. The math is honest. Any number can be traced back to its source. In production and in daily use.",
    body: [
      "Public House Creative came to Little Fight with a real internal-systems problem. Estimating decides whether a job makes money before it starts. That work was spread across documents, spreadsheets, email threads, and the senior estimator’s head. Every project dug up the same context again. Every quote took longer than it should. The team had outgrown the tools and was starting to feel it.",
      "We built Cockpit. It is a private web app that turns the messy first pass of an estimate into something structured and checkable. Site photos, blueprints, hand-drawn notes, and scope emails come in. Rooms get sorted. Drivers, the variables that move the math, get resolved. The report exports. The screens show dense data without hiding anything, and never lie about confidence. The estimator’s judgment makes the final call. The system just makes that call cheap.",
      "Cockpit is in production. The team uses it on real estimates. The math is honest. New scope items, room types, and export formats land in days, not sprints. The system is becoming what the senior estimator’s head used to hold. Now it scales past one person.",
    ],
  },
  {
    type: "Funding LLC",
    client: "Grand Funding LLC",
    url: "https://www.grandfundingllc.com",
    slug: "grand-funding-llc",
    metrics: [
      {
        value: "80 pages",
        label: "A complete search and answer system",
        evidence: "build",
      },
      {
        value: "18 share cards",
        label: "Route-specific social previews",
        evidence: "build",
      },
      {
        value: "Own domain",
        label: "Live at grandfundingllc.com",
        evidence: "release",
      },
    ],
    featureProof: {
      label: "From broad question to clear answer",
      ownerOutcome:
        "A partner or prospect can find the right service, policy, or contact path without decoding finance-speak or a generic funnel.",
      whyItMatters:
        "Complex businesses earn trust by answering the next real question clearly, not by making someone fill out a form before they understand the basics.",
      sourceUrl: "https://www.grandfundingllc.com",
      sourceLabel: "grandfundingllc.com",
      verifiedAt: "2026-08-13",
      steps: [
        { label: "Start", detail: "A broad question begins with plain, client-approved context." },
        { label: "Narrow", detail: "Services, audiences, locations, and reference pages give the question a precise home." },
        { label: "Connect", detail: "A visitor reaches a measured contact path after they have the context to use it." },
      ],
      textAlternative:
        "The live library moves a visitor from a broad funding question to a clear service or policy page, then to the appropriate contact path.",
    },
    showcase: {
      label: "A desert-night lending library",
      kind: "Website",
      context: "Arizona funding business",
      availability: "public",
      linkPolicy: "custom-domain",
      proof: {
        status: "public-live",
        captureDate: "2026-07-27",
        captureDevices: ["desktop", "tablet", "mobile"],
      },
      stages: [
        { label: "Orient", detail: "A desert-night visual system gives the firm a recognizable Arizona point of view without borrowed finance imagery." },
        { label: "Explain", detail: "Eighty pages separate services, audiences, locations, questions, and reference material into answerable paths." },
        { label: "Reassure", detail: "Company, service, policy, and founder details give a careful visitor a clearer public record." },
        { label: "Connect", detail: "Each route gives a visitor a clear way to continue while regulated language stays under client control." },
      ],
    },
    image: "/assets/case-grand-funding-llc.webp",
    services: ["custom-local-websites"],
    published: "2026-05-13",
    updated: "2026-07-27",
    title: "A finance landing page grew into a full answer system.",
    problem: "A funding LLC needed a credible public presence that could explain a complex category without the glass towers, stock handshakes, and vague promises that make finance sites look interchangeable.",
    kept: "The team’s approved positioning, contact paths, policy boundaries, and the language they use to describe the business.",
    changed: "Built a clear library for services, audiences, locations, questions, and reference material. Each page gives a partner or prospect the next useful answer instead of a vague sales push.",
    result: "A distinctive public resource at grandfundingllc.com. Partners and prospects can move from a broad question to a precise answer on any screen, while claims and regulated language remain explicitly client-controlled.",
    body: [
      "Grand Funding is a financial funding business. Finance sites have a template problem: glass towers, stock handshakes, the word 'solutions.' Those defaults exist because trust is hard to show. But to the exact partners this site must convince, a template reads as risk. The brief was to be credible without one borrowed cliche.",
      "We kept the team’s approved positioning and their own words. No invented mission statement and no unapproved lending claims. The design builds trust by making company, service, policy, and founder information easier to find.",
      "What began as a landing page became a library. Services, audiences, locations, questions, and references each get a clear route. The result is a public site a partner or prospect can use on a desktop or a phone without having to decode finance language.",
    ],
  },
  {
    type: "Live-event venue platform",
    client: "VenueCircuit",
    url: "https://venuecircuit.app",
    slug: "venuecircuit",
    metrics: [
      { value: "Live", label: "venuecircuit.app, open beta", evidence: "release" },
      { value: "~90 seconds", label: "To close a night", evidence: "release" },
      {
        value: "Every number",
        label: "Drills to the receipt behind it",
        evidence: "build",
      },
    ],
    showcase: {
      label: "Venue financial software",
      kind: "Public product",
      context: "Independent venues",
      availability: "public",
      proof: { status: "owned-live", captureDate: "2026-07-23" },
      stages: [
        { label: "Close", detail: "Bar, door, staff, splits, and payouts enter one nightly close that takes about 90 seconds." },
        { label: "Separate", detail: "Venue money and promoter money stay distinct instead of blurring together in a spreadsheet." },
        { label: "Verify", detail: "Every report number drills down to the receipt behind it, from midnight questions to quarter review." },
      ],
    },
    image: "/assets/case-venuecircuit.webp",
    services: ["business-systems", "custom-local-websites"],
    published: "2026-07-12",
    updated: "2026-07-12",
    title: "Our own product: a financial OS for independent venues.",
    problem:
      "Independent music venues close their nights in spreadsheets the next morning. Bar, door, staff, and promoter splits sit in different systems. The venue’s money and the promoter’s money blur together.",
    kept: "The way GMs actually run a night. Bar, door, staff, splits. Modeled as it happens, not as software wishes it happened.",
    changed:
      "Built the whole product. A nightly close that takes about 90 seconds. Split tracking that keeps venue money and promoter money separate. Reports where every number drills down to the receipt behind it.",
    result:
      "Live to the public at venuecircuit.app in open beta. The GM closes the night in about 90 seconds instead of a spreadsheet marathon. The owner can trust the quarter without a forensic audit.",
    body: [
      "VenueCircuit is the most ambitious thing Little Fight has shipped. Not a website. Not an internal tool. A complete software product, live to the public. Like After Hours Agenda, the agency is also the client here, with all the dangers that brings. Nobody to blame for scope. No one else’s deadline to hide behind.",
      "The product answers a question venue owners live with every night. Where did the money actually go? Bar, door, staff, promoter splits, and payouts all land in one place. The core rule: the venue’s money and the promoter’s money never blur together. Every number drills down to the receipt behind it. A GM can answer a question at midnight. The owner can trust the quarter.",
      "It is live at venuecircuit.app in open beta. For a future client, this is the useful part. It is the same range Little Fight brings to a client’s systems, turned all the way up. Proof the team can carry a system from first sketch to a public product people run their money through.",
    ],
  },
  {
    type: "Neighborhood pizzeria",
    client: "The Original #1 Brothers Pizzeria",
    url: "",
    slug: "brothers-pizzeria",
    metrics: [
      {
        value: "1998",
        label: "Shop history corrected and centered",
        evidence: "build",
      },
      {
        value: "3 screens",
        label: "Desktop, iPad, and phone proof",
        evidence: "build",
      },
      {
        value: "Every price",
        label: "Carried into the new experience",
        evidence: "release",
      },
    ],
    showcase: {
      label: "Heritage built into the order",
      kind: "Private website concept",
      context: "Family pizzeria · Peoria",
      availability: "private",
      privacyLabel: "Private client concept",
      linkPolicy: "case-only",
      proof: {
        status: "private-concept",
        captureDate: "2026-07-27",
        captureDevices: ["desktop", "tablet", "mobile"],
      },
      stages: [
        { label: "Recognize", detail: "Butcher paper, tomato red, basil green, and a real slice make the first screen feel like a neighborhood pizzeria instead of a restaurant template." },
        { label: "Trust", detail: "Johnny’s 1979 move west, the shop’s 1998 opening, and real customer words arrive before the menu." },
        { label: "Order", detail: "Every price stays readable on a phone or tablet, and the call action remains one thumb-tap away." },
        { label: "Carry", detail: "A matching brand kit gives the client the logo, colors, type, voice, and facts for future menus, signs, and ads." },
      ],
    },
    image: "/assets/case-brothers-pizzeria.webp",
    services: ["custom-local-websites"],
    published: "2026-07-23",
    updated: "2026-07-27",
    title: "A digital menu became a family handbill.",
    problem: "The first proof worked as a digital menu, but it looked like a generic black restaurant template. It buried the family story, reduced the shop’s history to badges, and squeezed the price grid on phones and tablets.",
    kept: "The logo, full menu, every price, hours, contact facts, phone-first ordering, real food photography, and the true family story: Johnny came west in 1979 and opened this shop in 1998.",
    changed: "Rebuilt the whole experience as a printed neighborhood handbill. The family story and customer voices now lead. Butcher paper, tomato red, basil green, heavy sign-painter type, and a real slice carry the character. The menu stacks cleanly on small screens, reading text stays at sixteen points or larger, and the call action remains thumb-sized.",
    result: "A private client concept with a recognizable point of view: family story first, menu second, phone ordering always close. It stays composed across desktop, iPad, and phone, carries every price, and includes a matching brand kit for future materials.",
    body: [
      "This is a private client concept, not a public storefront. Johnny brought his pizza passion to Arizona in 1979 and opened the Cactus Road shop in 1998. The first proof got the menu online, but not the feeling of the place. It was a dark digital menu with a few history badges attached. The family story, the regulars, and the New York-to-Peoria journey were doing none of the work.",
      "The second pass treated the whole page like something that could have been taped in the shop window. Aged butcher paper replaced the black canvas. Tomato red and basil green came from the language of old pizzeria signs. Heavy block type, a real slice on a paper plate, and customer quotes made the first screen recognizable before anyone reached the menu. The story moved ahead of specials and ordering because heritage only matters when people can feel it.",
      "The operational work stayed underneath the character. Every menu item and price carried over. Long price lines stack instead of pushing the phone page sideways. Reading text stays at sixteen points or larger, visible controls clear a forty-four-pixel target, and the call action remains close throughout the page. The client also gets a matching brand kit for future signs, menus, ads, and social work without having to reverse-engineer the website.",
    ],
  },
  {
    type: "Independent music company",
    client: "Legacy Music Group",
    url: "",
    slug: "legacy-music-group",
    metrics: [
      {
        value: "22 routes",
        label: "Artists, services, booking, and company context",
        evidence: "build",
      },
      {
        value: "97",
        label: "Dated phone-page check",
        evidence: "release",
      },
      {
        value: "3 screens",
        label: "Desktop, iPad, and phone proof",
        evidence: "build",
      },
    ],
    showcase: {
      label: "The control room after dark",
      kind: "Client release candidate",
      context: "Independent music company",
      availability: "private",
      privacyLabel: "Case study only",
      linkPolicy: "case-only",
      proof: {
        status: "case-only",
        captureDate: "2026-07-27",
        captureDevices: ["desktop", "tablet", "mobile"],
      },
      stages: [
        {
          label: "Listen",
          detail: "The first screen establishes the label’s atmosphere before it asks a visitor to choose a path.",
        },
        {
          label: "Sequence",
          detail: "Twenty-two routes separate artists, services, booking, company context, and supporting information.",
        },
        {
          label: "Prove",
          detail: "The public pages make the artist, service, booking, and company details easier to verify.",
        },
        {
          label: "Release",
          detail: "The full build is ready for its final approved photography, booking connection, and client-owned domain.",
        },
      ],
    },
    image: "/assets/case-legacy-music-group.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-07-27",
    updated: "2026-07-27",
    title: "A music company got a real world, not a record-label template.",
    problem:
      "Legacy Music Group needed more than a dark landing page. Artists, services, booking, company context, and search systems all needed a coherent official source without sanding away the independent label’s character.",
    kept:
      "The music-first identity, the independent spirit, the artist focus, and the sense that the company belongs in a control room after everyone else has gone home.",
    changed:
      "Built clear paths for artists, services, booking, company information, and reference material. The control-room look sets the mood, while the important information remains readable on every screen.",
    result:
      "A reviewed client release candidate with desktop, tablet, and phone proof. The case stays inside Little Fight until the approved build is on a client-owned domain.",
    body: [
      "Music-company sites often collapse into one of two defaults: a black poster with no useful path, or a corporate roster template with no atmosphere. Legacy Music Group needed both sides at once. Visitors should feel the label immediately, then find an artist, understand the services, or reach booking without decoding the page.",
      "We built the experience like a late-night control room. Deep contrast, precise type, luminous signals, and measured movement create the mood. Underneath it are clear paths for the roster, services, booking, company details, and policies. The visual world never has to carry information it cannot prove.",
      "The current release candidate has been checked across desktop, tablet, and phone. Final approved photography, the production booking connection, and the client-owned domain remain release gates. Until that last gate is real, Little Fight shows the work inside this case study and does not send visitors to a temporary hosting address.",
    ],
  },
  {
    type: "Phoenix painting contractor",
    client: "Chromatic Painting & Design",
    url: "https://chromaticaz.com",
    slug: "chromatic-painting-design",
    metrics: [
      {
        value: "18 pages",
        label: "Services, questions, and local intent mapped",
        evidence: "build",
      },
      {
        value: "3 share cards",
        label: "Art-directed social entry points",
        evidence: "build",
      },
      {
        value: "Own domain",
        label: "Live at chromaticaz.com",
        evidence: "release",
      },
    ],
    featureProof: {
      label: "A local question gets a useful path",
      ownerOutcome:
        "A Phoenix customer can recognize the work, find the relevant service, and start a project conversation without a generic contractor maze.",
      whyItMatters:
        "Specific service and location pages give a customer a better answer than a single quote button trying to do every job.",
      sourceUrl: "https://chromaticaz.com",
      sourceLabel: "chromaticaz.com",
      verifiedAt: "2026-08-13",
      steps: [
        { label: "Recognize", detail: "Phoenix color and place make the first screen feel specific to the business." },
        { label: "Find", detail: "Service and local-intent paths give a question its own clear destination." },
        { label: "Ask", detail: "The visitor reaches the right project conversation after seeing the relevant context." },
      ],
      textAlternative:
        "The live site helps a Phoenix customer recognize the contractor, find the relevant service information, and begin the right project conversation.",
    },
    showcase: {
      label: "Phoenix, repainted",
      kind: "Website",
      context: "Painting and design",
      availability: "public",
      linkPolicy: "custom-domain",
      proof: {
        status: "public-live",
        captureDate: "2026-07-27",
        captureDevices: ["desktop", "tablet", "mobile"],
      },
      stages: [
        {
          label: "Locate",
          detail: "Phoenix light, color, and place give the contractor a specific world instead of another neutral service template.",
        },
        {
          label: "Explain",
          detail: "Eighteen pages separate services, questions, and local intent into clear customer paths.",
        },
        {
          label: "Share",
          detail: "Three art-directed social cards make the first impression intentional wherever a route appears.",
        },
        {
          label: "Connect",
          detail: "A clear project path gives a ready customer a direct next step after the relevant service context.",
        },
      ],
    },
    image: "/assets/case-chromatic-painting-design.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-07-27",
    updated: "2026-07-27",
    title: "A painting contractor site began with Phoenix itself.",
    problem:
      "Painting websites tend to look interchangeable: white rooms, a row of service cards, and a quote button. Chromatic needed a useful customer path with a visual identity rooted in the city and enough structure to answer real service questions.",
    kept:
      "The approved business identity, the real service scope, the Phoenix market, and the practical path from a question to a project conversation.",
    changed:
      "Built a Phoenix-specific site that gives services, local questions, and common concerns their own clear paths. The visual direction stays useful on a phone, not only in a portfolio screenshot.",
    result:
      "A live custom-domain site at chromaticaz.com that gives Phoenix customers a specific service path from desktop through phone, without reducing the business to another generic contractor template.",
    body: [
      "A contractor does not become more trustworthy because a template puts a paint roller beside a rounded quote form. The useful proof is specificity. Where the company works, what it does, what a customer should expect, and whether the page feels considered before anyone asks for a project.",
      "The design starts with Phoenix rather than generic home-improvement imagery. Strong blocks of color, sun-washed surfaces, and direct type make the site recognizable. Services, project questions, and policy information each have clear destinations.",
      "The site is now live on the client-owned domain. The public path has one job: help a Phoenix customer find the relevant service and start the right project conversation from a desktop, tablet, or phone.",
    ],
  },
  {
    type: "Arizona lending website",
    client: "Logan Loans",
    url: "https://logan.loans",
    slug: "logan-loans",
    metrics: [
      {
        value: "58 routes",
        label: "A complete public information system",
        evidence: "build",
      },
      {
        value: "48 question pages",
        label: "Focused answers available to find",
        evidence: "build",
      },
      {
        value: "5 forms",
        label: "Registered paths for distinct questions",
        evidence: "build",
      },
      {
        value: "Own domain",
        label: "Live at logan.loans",
        evidence: "release",
      },
    ],
    featureProof: {
      label: "The right question finds the right form",
      ownerOutcome:
        "A visitor can understand the relevant lending question and choose a specific next step instead of being pushed through one generic funnel.",
      whyItMatters:
        "Clear paths reduce confusion for customers and keep a regulated business from making broad claims just to collect a lead.",
      sourceUrl: "https://logan.loans",
      sourceLabel: "logan.loans",
      verifiedAt: "2026-08-13",
      steps: [
        { label: "Orient", detail: "The page begins with plain, approved context instead of a vague promise." },
        { label: "Answer", detail: "Routes for services, locations, questions, and policies let a visitor narrow the subject." },
        { label: "Choose", detail: "Five distinct forms give different conversations a deliberate next step." },
      ],
      textAlternative:
        "The live site begins with approved lending context, helps a visitor narrow the question, and routes them to a specific form.",
    },
    showcase: {
      label: "A warmer way through lending questions",
      kind: "Website",
      context: "Arizona lending information",
      availability: "public",
      linkPolicy: "custom-domain",
      proof: {
        status: "public-live",
        captureDate: "2026-07-27",
        captureDevices: ["desktop", "tablet", "mobile"],
      },
      stages: [
        {
          label: "Orient",
          detail: "A warm Arizona editorial system replaces the cold blue visual shorthand common to financial websites.",
        },
        {
          label: "Answer",
          detail: "Fifty-eight routes separate services, locations, questions, policies, and supporting information.",
        },
        {
          label: "Route",
          detail: "Five registered forms give different customer questions a specific next step without forcing one generic funnel.",
        },
        {
          label: "Clarify",
          detail: "Different questions have their own clear pages, so a visitor can find the right source instead of a generic sales pitch.",
        },
      ],
    },
    image: "/assets/case-logan-loans.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-07-27",
    updated: "2026-07-27",
    title: "A financial website became a warm Arizona guide with clear next steps.",
    problem:
      "Lending is dense, regulated, and full of repeated questions. Logan Loans needed a public site that could separate those questions cleanly, guide different visitors to the right form, and remain readable without leaning on generic blue-bank design.",
    kept:
      "The approved business facts, service boundaries, contact paths, and client-controlled policy language.",
    changed:
      "Built a clear Arizona guide where services, locations, questions, policies, and forms each have their own useful place. A visitor can start broad, then choose the right next step.",
    result:
      "A public custom-domain site at logan.loans that makes a large information set feel calm on desktop, iPad, and phone. The architecture improves clarity while regulated terms and claims remain under client control.",
    body: [
      "Financial websites often try to make a difficult category feel simple by hiding the detail. That can create a clean first screen and a confusing second step. Logan Loans needed the opposite: a warm entry point with enough structure to let a visitor find the exact page, question, policy, or form they came for.",
      "The visual system takes its cues from Arizona rather than a generic bank. Warm fields, editorial typography, calm spacing, and clear route labels make the experience feel human without turning the subject into lifestyle marketing. Services, locations, questions, policies, and forms each have their own useful place.",
      "Different forms keep different conversations from collapsing into one generic request. The work is practical: name the question, show the relevant context, and give the visitor a clear next step. The live site does that on its own domain while approved financial language remains client-controlled.",
    ],
  },
];
