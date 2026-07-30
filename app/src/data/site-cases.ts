/* Split out of site.ts so content routes load ONLY their own data slice
 * (this array was part of the ~200KB shared site chunk). Pure data, no icons. */

export type CaseProofStatus =
  | "public-live"
  | "owned-live"
  | "case-only"
  | "private-client"
  | "private-concept";

export type CaseCaptureDevice = "desktop" | "tablet" | "mobile";

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
  metrics?: Array<{
    value: string;
    label: string;
    evidence: "build" | "outcome";
  }>;
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
        label: "Structured data for local discovery",
        evidence: "build",
      },
      {
        value: "3 screens",
        label: "Desktop, iPad, and phone proof",
        evidence: "outcome",
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
            "A real map puts the store beside Katz's, Russ & Daughters, Yonah Schimmel's, and Essex Market, so it can become part of a Lower East Side day.",
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
      "Built a fast, phone-first field guide around a simple visit. Real shop photos show the place. Clear product groups explain what is inside. Store and FAQ schema clarify the facts. A neighborhood map places the shop beside five familiar stops, with directions always close.",
    result:
      "A private client concept designed to turn online curiosity into a real stop. It does not pretend the shop is a chain. It shows why Army & Navy Bags belongs on a Lower East Side walk, then proves the experience across desktop, iPad, and phone.",
    body: [
      "This is a private client concept, not a public client launch. Think of the old WordPress site like a faded paper sign: it said the shop existed, but it did not help a new person understand why to go. Army & Navy Bags is the opposite of a plain listing. The store is narrow, packed, useful, strange, and full of Lower East Side character. The website needed to make that feeling easy to understand on a phone.",
      "We kept the scuffed awning, the real shelves, the military bags, jackets, patches, hats, and the people inside. Then we made the path simple. First, see what kind of place this is. Next, see what it carries. Then check the hours, call, or get directions. There is no giant menu to learn and no shiny store template pretending the shop is something it is not.",
      "The neighborhood map does one extra job. It shows Army & Navy Bags beside Katz's, Russ & Daughters, Yonah Schimmel's, and Essex Market. If someone is already going there, the map says the bag shop is right around the corner. That turns the website from a digital business card into a reason to add one more stop. Clear local facts, Store and FAQ schema, and one-tap directions make the last few blocks easy.",
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
        label: "Lighthouse performance on mobile",
        evidence: "outcome",
      },
    ],
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
        { label: "Archive", detail: "A 224-photo premiere gallery stays fast and navigable from desktop through phone." },
        { label: "Publish", detail: "Structured data, headers, sitemap signals, and the existing release path keep every update credible." },
      ],
    },
    image: "/assets/case-cc-films.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-05-13",
    updated: "2026-07-27",
    title: "A debut horror feature got an official home that feels like cinema.",
    problem: "CC Films had the raw material for Marrow, but it needed one official source that could serve audiences, press, festivals, reviewers, and search systems without flattening the film into a generic entertainment template.",
    kept: "The analog horror mood, the Marrow poster and trailer, premiere photography, review coverage, core credits, and the existing GitHub-to-Netlify release path.",
    changed: "Reframed the site as an analog screening room across five focused pages. Organized 224 premiere photos into a usable archive, sharpened film and company context, and repaired schema, sitemap, header, privacy, and crawler signals.",
    result: "A fast official film source at ccfilms.net — 99 on mobile and 100 on desktop in a Lighthouse performance audit measured 29 July 2026. The experience holds its cinematic tone on desktop, iPad, and phone while giving every audience a clearer next step.",
    body: [
      "CC Films is the Dallas-based production company behind Marrow, a debut psychological horror feature. It was directed by Mitch McLeod and produced by CC Films under executive producer Carlos R. Cortez. The site has one narrow but important job. Give press, festival audiences, reviewers, and search systems one official place for the film. Watch the trailer. See the cast and credits. Browse premiere photos. Find the right next step.",
      "The site already had the right raw material. A strong poster. A trailer. Festival-premiere context. Review coverage. Known cast names. A deep gallery of premiere photos. We kept the analog, VHS-flavored mood and the existing release path. The work was making the site behave like an official source instead of a loose brochure, with fewer places where a visitor or crawler had to guess.",
      "We rebuilt the experience around five focused pages and treated the 224-photo archive like a real premiere record. We tightened press paths, added privacy and AI-readable context, repaired schema and sitemap signals, hardened headers, and cleared stale assets before launch. The result is a modern ccfilms.net that can carry the film through press, festival, and release news without losing its cinematic tone.",
    ],
  },
  {
    type: "Cruise social network",
    client: "DeckSpace",
    url: "https://www.getdeckspace.com",
    slug: "deckspace",
    metrics: [
      { value: "Live", label: "getdeckspace.com", evidence: "outcome" },
      {
        value: "3 jobs",
        label: "Onboard guide, social network, memory layer",
        evidence: "build",
      },
      {
        value: "Kept",
        label: "The nostalgic heart of cruising",
        evidence: "outcome",
      },
    ],
    showcase: {
      label: "Cruise guest network",
      kind: "Public product",
      context: "Life at sea",
      availability: "public",
      proof: { status: "public-live", captureDate: "2026-07-21" },
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
    url: "https://hairbyrachelcharles.com",
    slug: "hair-by-rachel-charles",
    metrics: [
      {
        value: "49 routes",
        label: "Services and local intent mapped clearly",
        evidence: "build",
      },
      {
        value: "5 share cards",
        label: "Art-directed social entry points",
        evidence: "build",
      },
      {
        value: "Square",
        label: "The booking habit clients already knew",
        evidence: "build",
      },
      {
        value: "Own domain",
        label: "Live at hairbyrachelcharles.com",
        evidence: "outcome",
      },
    ],
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
        { label: "Find", detail: "Forty-nine indexable routes give services and neighborhood searches a precise destination beyond Instagram." },
        { label: "Feel", detail: "Electric yellow, close-cropped work, and Rachel's own voice make the site feel like her chair, not a salon template." },
        { label: "Trust", detail: "Rachel's face, portfolio, location, service details, and policies answer the questions a first-time client has." },
        { label: "Book", detail: "The Square setup clients already knew stays in place inside a clear path that works on every screen." },
      ],
    },
    image: "/assets/case-hair-by-rachel-charles.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-05-13",
    updated: "2026-07-27",
    title: "An Instagram business became a searchable editorial booking system.",
    problem: "A solo stylist ran her whole business through Instagram and word of mouth. No website. No Google profile. No clear way to book.",
    kept: "Rachel's point of view, the work itself, and the Square Appointments setup her clients already knew.",
    changed: "Built a bold mobile-first site with 49 indexable routes, precise service and neighborhood context, five art-directed social cards, and a direct path into Square. Set up the Google Business Profile from scratch.",
    result: "A distinctive public home at hairbyrachelcharles.com. New clients can discover the studio, understand Rachel's work, and reach the familiar booking flow from desktop, iPad, or phone.",
    body: [
      "When we first sat down with Rachel, her whole business ran through Instagram DMs. She built her client base through word of mouth and showing up. But every booking took a back-and-forth in messages. Every confirmation lived in her thumbs. And Google had no idea she existed. The site started as a question. What if every new client could find her, see the work, and book without a single message?",
      "We kept the part that already worked: her Square Appointments setup, which her clients knew. The site became the front door. Electric yellow, confident type, close-cropped work, and Rachel's own voice give the experience a point of view before the booking button appears. We also set up her Google Business Profile from scratch and wired the site to support it.",
      "The finished system covers 49 indexable routes for services, questions, and local intent, with five art-directed social cards for the moments people share. Square remains the booking destination. The website does the work before it: discovery, recognition, trust, and a clean handoff from any screen.",
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
      { value: "1 day", label: "To ship a new product drop", evidence: "outcome" },
      {
        value: "Square + Printful",
        label: "Payments + fulfillment wired",
        evidence: "build",
      },
    ],
    showcase: {
      label: "Custom storefront",
      kind: "Website + commerce",
      context: "Independent streetwear",
      availability: "public",
      proof: { status: "owned-live", captureDate: "2026-07-23" },
      stages: [
        { label: "Catalog", detail: "One JSON master holds the products, prices, and drop details without hardcoded storefront content." },
        { label: "Sell", detail: "A custom Next.js experience keeps the brand intact while Square handles payment." },
        { label: "Fulfill", detail: "Paid orders move to Printful for shipping, so a new drop can ship without a platform rebuild." },
      ],
    },
    image: "/assets/case-after-hours-agenda.webp",
    services: ["custom-local-websites", "business-systems"],
    published: "2026-05-13",
    updated: "2026-07-12",
    title: "An online store that keeps the brand's character.",
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
      {
        value: "3 sites",
        label: "One shared Supabase backend",
        evidence: "build",
      },
      {
        value: "Per-site CI",
        label: "Independent deploys on push",
        evidence: "build",
      },
      {
        value: "Real-time",
        label: "Intake routing, no copying",
        evidence: "outcome",
      },
    ],
    showcase: {
      label: "Connected intake system",
      kind: "Connected system",
      context: "Help service",
      availability: "public",
      proof: { status: "public-live", captureDate: "2026-07-23" },
      stages: [
        { label: "Receive", detail: "The public site gives people a clear place to ask for help without exposing the working system behind it." },
        { label: "Route", detail: "Intake moves through one shared Supabase backend in real time, with no copying between tools." },
        { label: "Manage", detail: "A separate protected admin site lets the team work the queue while each site deploys independently." },
      ],
    },
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
    url: "",
    slug: "public-house-creative",
    metrics: [
      {
        value: "3 tools to 1",
        label: "Estimates in one source of truth",
        evidence: "outcome",
      },
      {
        value: "Every number",
        label: "Audits back to its source",
        evidence: "build",
      },
      {
        value: "In production",
        label: "Runs on the team's real bids",
        evidence: "outcome",
      },
    ],
    showcase: {
      label: "Private estimating software",
      kind: "Private software",
      context: "Custom cabinetry team",
      availability: "private",
      proof: { status: "private-client" },
      stages: [
        { label: "Collect", detail: "Site photos, blueprints, notes, and scope emails enter one structured project record." },
        { label: "Resolve", detail: "Rooms and price drivers get classified while the estimator keeps control of the final judgment." },
        { label: "Audit", detail: "The math checks itself and every number can be traced back to its source." },
        { label: "Export", detail: "A clean report leaves the system ready for the real bid, with no spreadsheet reconstruction." },
      ],
    },
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
        evidence: "outcome",
      },
    ],
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
        { label: "Reassure", detail: "Structured company, service, policy, and founder context creates a clearer public record." },
        { label: "Connect", detail: "Every route leads to a measured contact path while regulated language stays under client control." },
      ],
    },
    image: "/assets/case-grand-funding-llc.webp",
    services: ["custom-local-websites"],
    published: "2026-05-13",
    updated: "2026-07-27",
    title: "A finance landing page grew into a full answer system.",
    problem: "A funding LLC needed a credible public presence that could explain a complex category without the glass towers, stock handshakes, and vague promises that make finance sites look interchangeable.",
    kept: "The team's approved positioning, contact paths, policy boundaries, and the language they use to describe the business.",
    changed: "Built an 80-page desert-night editorial system for services, audiences, locations, questions, and reference content. Added structured company context, controlled conversion paths, and 18 route-specific social cards.",
    result: "A distinctive public resource at grandfundingllc.com. Partners and prospects can move from a broad question to a precise answer on any screen, while claims and regulated language remain explicitly client-controlled.",
    body: [
      "Grand Funding is a financial funding business. Finance sites have a template problem: glass towers, stock handshakes, the word 'solutions.' Those defaults exist because trust is hard to show. But to the exact partners this site must convince, a template reads as risk. The brief was to be credible without one borrowed cliche.",
      "We kept the team's approved positioning and the way they describe what they do. No invented mission statement and no unapproved lending claims. The design carries trust through typography, deep desert color, restrained motion, and visible structure. Company, service, policy, and founder context give both people and answer systems a cleaner public record.",
      "What began as a landing page became an 80-page library. Services, audiences, locations, questions, and references each get a clear route, with 18 art-directed cards for the pages people share. The result is a public site partners and prospects can navigate without a second thought, from a wide desktop to the phone in their hand.",
    ],
  },
  {
    type: "Live-event venue platform",
    client: "VenueCircuit",
    url: "https://venuecircuit.app",
    slug: "venuecircuit",
    metrics: [
      { value: "Live", label: "venuecircuit.app, open beta", evidence: "outcome" },
      { value: "~90 seconds", label: "To close a night", evidence: "outcome" },
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
        evidence: "outcome",
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
        { label: "Trust", detail: "Johnny's 1979 move west, the shop's 1998 opening, and real customer words arrive before the menu." },
        { label: "Order", detail: "Every price stays readable on a phone or tablet, and the call action remains one thumb-tap away." },
        { label: "Carry", detail: "A matching brand kit gives the client the logo, colors, type, voice, and facts for future menus, signs, and ads." },
      ],
    },
    image: "/assets/case-brothers-pizzeria.webp",
    services: ["custom-local-websites"],
    published: "2026-07-23",
    updated: "2026-07-27",
    title: "A digital menu became a family handbill.",
    problem: "The first proof worked as a digital menu, but it looked like a generic black restaurant template. It buried the family story, reduced the shop's history to badges, and squeezed the price grid on phones and tablets.",
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
        label: "Fresh Lighthouse performance audit",
        evidence: "outcome",
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
          detail: "The first screen establishes the label's atmosphere before it asks a visitor to choose a path.",
        },
        {
          label: "Sequence",
          detail: "Twenty-two routes separate artists, services, booking, company context, and supporting information.",
        },
        {
          label: "Prove",
          detail: "Metadata, structured context, responsive behavior, and a fresh performance audit make the release easier to verify.",
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
      "Legacy Music Group needed more than a dark landing page. Artists, services, booking, company context, and search systems all needed a coherent official source without sanding away the independent label's character.",
    kept:
      "The music-first identity, the independent spirit, the artist focus, and the sense that the company belongs in a control room after everyone else has gone home.",
    changed:
      "Built a 22-route editorial system with distinct paths for artists, services, booking, company information, and reference content. Added responsive layouts, structured metadata, and a cinematic control-room design that stays legible on every screen.",
    result:
      "A client release candidate with a fresh 97 Lighthouse performance audit and complete desktop, iPad, and phone proof. The case is public here, but an external link stays withheld until the approved build is on a client-owned domain.",
    body: [
      "Music-company sites often collapse into one of two defaults: a black poster with no useful path, or a corporate roster template with no atmosphere. Legacy Music Group needed both sides at once. Visitors should feel the label immediately, then find an artist, understand the services, or reach booking without decoding the page.",
      "We built the experience like a late-night control room. Deep contrast, precise type, luminous signals, and measured movement create the mood. Underneath it is a 22-route information system for the roster, services, booking, company details, policies, and answer-ready reference content. The visual world never has to carry information it cannot prove.",
      "The current release candidate has been checked across desktop, iPad, and phone, with a fresh 97 Lighthouse performance audit. Final approved photography, the production booking connection, and the client-owned domain remain release gates. Until that last gate is real, Little Fight shows the work inside this case study and does not send visitors to a temporary hosting address.",
    ],
  },
  {
    type: "Phoenix painting contractor",
    client: "Chromatic Painting & Design",
    url: "",
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
        value: "Review gated",
        label: "Deliberately noindex before approval",
        evidence: "outcome",
      },
    ],
    showcase: {
      label: "Phoenix, repainted",
      kind: "Client review build",
      context: "Painting and design",
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
          label: "Gate",
          detail: "Noindex and review controls keep the work out of search until the client facts and media are approved.",
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
      "Built an 18-page review experience around Phoenix color and light. Separated services, local intent, and common questions, then added three route-specific social cards, responsive proof, and deliberate noindex controls for the approval period.",
    result:
      "A distinctive client review build that reads clearly from desktop through phone while staying out of search until facts and media are approved. The work is shown here, with no temporary hosting link presented as a public launch.",
    body: [
      "A contractor does not become more trustworthy because a template puts a paint roller beside a rounded quote form. The useful proof is specificity. Where the company works, what it does, what a customer should expect, and whether the page feels considered before anyone asks for a project.",
      "The design starts with Phoenix rather than generic home-improvement imagery. Strong blocks of color, sun-washed surfaces, and direct typography make the site recognizable. Eighteen pages give services, local intent, project questions, and policy information their own clear destinations. Three art-directed social cards keep that identity intact when a page is shared.",
      "This is still a client review build. Noindex controls are intentional, and final facts and approved media remain gates before a public release. The responsive screenshots document the real work now. An external link will appear only when the approved site has a client-owned domain.",
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
        value: "48 indexable",
        label: "Focused pages available to search",
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
        evidence: "outcome",
      },
    ],
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
          detail: "Forty-eight indexable pages and extensive structured context help search and answer systems identify the right source.",
        },
      ],
    },
    image: "/assets/case-logan-loans.webp",
    services: ["custom-local-websites", "tech-consulting"],
    published: "2026-07-27",
    updated: "2026-07-27",
    title: "A financial website became a warm, structured Arizona guide.",
    problem:
      "Lending is dense, regulated, and full of repeated questions. Logan Loans needed a public site that could separate those questions cleanly, guide different visitors to the right form, and remain readable without leaning on generic blue-bank design.",
    kept:
      "The approved business facts, service boundaries, contact paths, and client-controlled policy language.",
    changed:
      "Built a 58-route financial editorial system with 48 indexable pages, five registered forms, extensive structured context, and a responsive Arizona visual language. Search, social, and answer-system entry points each lead to a specific source.",
    result:
      "A public custom-domain site at logan.loans that makes a large information set feel calm on desktop, iPad, and phone. The architecture improves clarity while regulated terms and claims remain under client control.",
    body: [
      "Financial websites often try to make a difficult category feel simple by hiding the detail. That can create a clean first screen and a confusing second step. Logan Loans needed the opposite: a warm entry point with enough structure to let a visitor find the exact page, question, policy, or form they came for.",
      "The visual system takes its cues from Arizona rather than a generic bank. Warm fields, editorial typography, calm spacing, and strong route labels make the experience feel human without turning the subject into lifestyle marketing. Underneath it are 58 routes, 48 of them intentionally indexable, plus extensive structured context for search and answer systems.",
      "Five registered forms keep different conversations from collapsing into one generic lead funnel. The work is architectural as much as visual: establish the question, show the relevant context, and provide a clear next step. The live site does that on its own domain while approved financial language remains explicitly client-controlled.",
    ],
  },
];
