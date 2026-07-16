/* Split out of site.ts so content routes load ONLY their own data slice
 * (this array was part of the ~200KB shared site chunk). Pure data, no icons. */

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
    problem: "DeckSpace needed to explain a cruise-ship social network without feeling like a generic travel app. Guests need tonight's events, the bars and shops, voyage details, and each other — all while moving around the ship.",
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
    kept: "The team's positioning and how they already ask people to make contact.",
    changed: "Built a quiet, type-led landing page. One clear contact form. Clean contact details. Search tags so the page reads as credible.",
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
