/* Split out of site.ts so content routes load ONLY their own data slice
 * (this array was part of the ~200KB shared site chunk). Pure data, no icons. */

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
    headline: "Local SEO, websites, and support for Upper East Side businesses.",
    shortAnswer:
      "Short answer: Upper East Side businesses need high-trust websites, local SEO that keeps Google correct, and simple systems that make appointments and follow-up easy.",
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
      "An SEO bill that renews every month without showing what changed",
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
      {
        question: "What does a local SEO company actually do for an Upper East Side business?",
        answer:
          "Honest version: it makes sure Google understands who you are, where you are, and what you do. Correct name and hours everywhere, real reviews coming in, service pages that answer what patients and clients actually search, and a site fast enough that nobody gives up. That is most of it. We do all of that as part of the work — and the first look is free.",
      },
      {
        question: "Do I need a monthly SEO retainer?",
        answer:
          "Usually no. Most local SEO is setup done right, then habits — fresh reviews, correct hours, an update when something changes. A retainer that cannot tell you what changed this month is just another bill. We set it up, show you what we did, and you own it.",
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
  {
    slug: "greenwich-village",
    name: "Greenwich Village",
    zipCodes: ["10003", "10011", "10012"],
    headline: "Websites, tech help, and local search for Greenwich Village businesses.",
    shortAnswer:
      "Short answer: Greenwich Village businesses live on foot traffic, students, and reputation. They need websites that load mid-walk, hours that are never wrong, and booking that works at midnight.",
    localPattern:
      "Cafés, comedy rooms, music venues, bookshops, and student-serving services compete for a crowd that decides on the sidewalk.",
    firstMove: "Check what a first-time visitor sees: the Google profile, the hours, the menu or ticket link, and whether any of it works on a phone at night.",
    intro:
      "Greenwich Village runs on layers. Washington Square Park in the middle, NYU wrapped around it, MacDougal Street's comedy rooms and late-night counters, Bleecker's storefronts, and the quiet blocks in between where the neighborhood actually lives. Tourists come for the arch. Students come for four years. The regulars have been at the same café table for twenty. A Village business serves all three crowds at once, every single day.",
    businessLandscape:
      "This is café and venue country — comedy cellars, jazz rooms, indie theaters, late-night slices, bookshops, chess shops, and record stores that survived every era. Around NYU: tutors, therapists, test-prep, quick food, and every service a student needs. The pressure is real. Eighth Street keeps flipping to chains, NYU keeps expanding, and rents make every mediocre month dangerous. A room that seats sixty competes for attention with the entire internet. The Village institutions that last are the ones people can still FIND — the moment someone asks their phone where to go tonight.",
    localSearchReality:
      "Village search happens standing up. 'Comedy tonight.' 'Cafe near Washington Square open now.' 'Best slice MacDougal.' Tourists search mid-walk and pick from the map. Students search everything and trust reviews over signs. The crowd is already here — the only question is whose door they walk through. Wrong hours kill a Village business faster than anything, because the person standing outside a dark window at 9pm does not come back. Ticket links that break on a phone quietly empty a room that would have filled itself.",
    whatWeFixHere: [
      "Hours on Google that don't match the door — fatal in a walk-up neighborhood",
      "A ticket or reservation link that fails on a phone at 11pm",
      "A menu that lives in a blurry photo instead of a page Google can read",
      "A venue site that ranks below three aggregators for its own name",
      "Student-crowd reviews going unanswered while the room next door replies to every one",
    ],
    faq: [
      {
        question: "Half my customers are tourists who will never come back. Does local search even matter?",
        answer:
          "More, not less. A tourist has zero history with the neighborhood — the map IS their memory. Whoever looks best in that search wins the walk-in. Regulars forgive a stale listing; strangers never see you at all.",
      },
      {
        question: "My venue fills through word of mouth and Instagram. Why do I need a website?",
        answer:
          "Because word of mouth ends at a search box. Someone hears about you, looks you up, and finds either a real page with tonight's lineup — or a dead link and a competitor's ad. Instagram warms them up. The website closes.",
      },
      {
        question: "NYU students find everything themselves. What is there to fix?",
        answer:
          "Students find everything — including the fastest reason to pick somewhere else. Slow site, no online booking, unanswered reviews: each one is a swipe to the next option. Being findable isn't enough here. You have to be frictionless.",
      },
    ],
    nearby: ["west-village", "east-village", "soho"],
  },
  {
    slug: "financial-district",
    name: "Financial District",
    zipCodes: ["10004", "10005", "10006", "10007", "10038"],
    headline: "Websites, tech help, and local search for Financial District businesses.",
    shortAnswer:
      "Short answer: FiDi businesses serve two different neighborhoods — office workers on a clock and a residential boom that never leaves. They need search visibility and systems that work for both.",
    localPattern:
      "Delis, barbers, tailors, gyms, and street-level services survive on the lunch rush while a new residential crowd changes what the neighborhood needs.",
    firstMove: "Check when customers actually search — the 11:45am lunch scramble and the 8pm resident scroll — and whether the business shows up for either.",
    intro:
      "The Financial District is two neighborhoods in one zip code. By day: office towers and a lunch rush that decides in ninety seconds. By night and on weekends: one of the fastest-growing home neighborhoods in Manhattan. Families on Stone Street. Strollers by the Seaport. The businesses at street level — delis, barbers, tailors, dry cleaners, gyms — were built for the first crowd. Now they have to learn the second.",
    businessLandscape:
      "Under the towers it's counter businesses. Delis and salad lines. Shoe repair, tailors, barbers, quick pharmacies. The services an office block runs on. Stone Street and the Seaport carry the restaurants. The Oculus filled up with chains, and the chains have apps and preorder lines. The independents got squeezed twice. Hybrid work thinned the weekday crowd. And the thousands of new residents upstairs? Most shops have never said one word to them. The FiDi shop that learns nights and weekends stops living and dying by Tuesday lunch.",
    localSearchReality:
      "FiDi search runs on a clock. At 11:45am it's 'lunch near me' from ten thousand desks at once. That race goes to whoever loads fastest with the menu one tap away. Nights and weekends belong to the residents. 'Barber financial district.' 'Dry cleaner water street.' 'Kids haircut fidi.' Two different searches. Same storefront. Most street-level businesses here only show up for the first one — if they show up at all. The second crowd is searching from apartments two blocks away, and nobody answers.",
    whatWeFixHere: [
      "A lunch spot invisible at 11:45am because the menu is a PDF nobody can load",
      "A Google profile that says nothing about weekend hours — while ten thousand residents search from upstairs",
      "Preorder and pickup flows that lose the race against the chains in the Oculus",
      "A services business still marketing to office workers a neighborhood of families moved in around",
      "Listings that say 'temporarily closed' since 2021 — quietly killing walk-ins every day",
    ],
    faq: [
      {
        question: "My deli lives on the lunch rush. Hybrid work cut it in half. What now?",
        answer:
          "The neighborhood that replaced your Tuesday crowd lives upstairs — 60,000-plus residents who need dinner, weekend coffee, and everything a household runs on. Most FiDi counters have never said one word to them online. That is the growth sitting on your block.",
      },
      {
        question: "The chains in the Oculus have apps and preorder. How does an independent compete?",
        answer:
          "You don't out-app a chain — you out-neighbor it. Correct hours, a menu that loads instantly, online ordering that works, and reviews from people who actually know your name. The chain wins the tourist. You win the block, and blocks are loyal.",
      },
      {
        question: "Do weekends even matter down here anymore?",
        answer:
          "FiDi weekends stopped being dead years ago. Families on Stone Street, tourists at the Seaport, residents doing errands. If your hours, your listing, and your website still assume a Monday-to-Friday neighborhood, you're closed for the part of the week that's growing.",
      },
    ],
    nearby: ["soho", "lower-east-side"],
  },
  {
    slug: "the-bronx",
    name: "The Bronx",
    zipCodes: ["10451", "10453", "10458", "10462", "10467"],
    headline: "Websites, tech help, and local search for Bronx businesses.",
    shortAnswer:
      "Short answer: Bronx businesses have the most loyal customers in the city and the least tech help. A correct Google profile, a fast website, and simple tools change everything here.",
    localPattern:
      "Auto shops, bodegas, barbershops, bakeries, and family restaurants run on loyalty and word of mouth — and go digital late.",
    firstMove: "Check the Google profile first. Wrong hours and old phone numbers cost Bronx businesses more walk-ins than anything else.",
    intro:
      "The Bronx runs on family businesses. Fordham Road is one of the busiest shopping strips in the city. Arthur Avenue is the real Little Italy — butchers, pasta makers, and bakeries that go back four generations. Hunts Point feeds half of New York. And on every block in between: auto shops, barbershops, botánicas, and kitchens run by the same families for decades. The customers here are the most loyal in the city. The tech help never showed up.",
    businessLandscape:
      "This is the borough the agencies skip. Auto repair on Jerome Avenue. Dominican and Puerto Rican restaurants. West African markets. Albanian bakeries in Belmont. Most run cash-first, book by phone, and live on repeat customers. That loyalty is real power — but it doesn't reach new customers on its own. The chains on Fordham Road have apps and ad budgets. The family spots have better food, better service, and no website. That gap is the whole problem. It is also the whole opportunity.",
    localSearchReality:
      "Bronx search is mobile and it is bilingual. 'Mecánico cerca de mí.' 'Barbershop open now.' 'Dominican food grand concourse.' People search in Spanish and English, sometimes in the same sentence — and they call, they don't fill out forms. A business with a correct profile, real photos, and reviews in both languages owns its block. Most don't have any of that. Which means the first family business on each strip that gets it right wins big, fast.",
    whatWeFixHere: [
      "A Google profile with the old phone number — while the shop loses calls every day",
      "No website at all, so the chains take customers the family spot earned",
      "Reviews in Spanish going unanswered because nobody told the owner they matter",
      "A menu or price list that lives on paper only, invisible to every search",
      "Booking that only works by phone during work hours — when customers are also at work",
    ],
    faq: [
      {
        question: "My shop runs on regulars and word of mouth. Why would I need a website?",
        answer:
          "Word of mouth built your business. But when someone hears about you, they look you up before they come in. No website means that recommendation dies in a search box. One page with your hours, your prices, and your phone keeps every referral you earn.",
      },
      {
        question: "My customers speak Spanish. Can the website work in both languages?",
        answer:
          "Yes. We build pages that work in Spanish and English, and we help you answer reviews in both. Your customers already live in two languages. Your website should too.",
      },
      {
        question: "The chains on Fordham Road have apps and ads. How do I compete?",
        answer:
          "You don't need their budget. You need your block. A correct profile, real photos, reviews from your actual customers, and a site that loads fast on a phone. The chains can't fake forty years on the avenue. Make sure Google knows about yours.",
      },
    ],
    nearby: ["upper-west-side", "upper-east-side", "astoria"],
  },
  {
    slug: "staten-island",
    name: "Staten Island",
    zipCodes: ["10301", "10304", "10306", "10312", "10314"],
    headline: "Websites, tech help, and local search for Staten Island businesses.",
    shortAnswer:
      "Short answer: Staten Island runs on trades, family restaurants, and referrals. The businesses that win put their reputation online — correct profile, real reviews, a site that turns a referral into a call.",
    localPattern:
      "Contractors, plumbers, landscapers, pizzerias, salons, and family shops serve a borough that searches first and drives second.",
    firstMove: "Check what a referral sees: the Google profile, the reviews, and whether the website makes calling easy from a phone.",
    intro:
      "Staten Island is trades country. Vans with ladders, crews that start at seven, family names painted on truck doors. Hylan Boulevard is one of the longest commercial strips in the city. Victory and Forest carry the shops, the salons, and pizzerias people argue about at weddings. The ferry hauls commuters to Manhattan every morning, but the businesses here serve the island — house by house, job by job, referral by referral.",
    businessLandscape:
      "Contractors, plumbers, electricians, landscapers, HVAC crews — the borough practically runs on them. Add the pizzerias and Italian delis with lines out the door, the salons, the auto shops, the family restaurants that have fed three generations. Almost all of it is referral business. Somebody's cousin knows a guy. That system works — until the cousin's recommendation meets an empty Google profile with two reviews and no photos. On Staten Island, your reputation is your business. The only question is whether the internet can see it.",
    localSearchReality:
      "This is a car borough. People search, then drive. 'Plumber Staten Island.' 'Pizza near me.' 'Nail salon New Dorp.' For the trades, the search happens at the worst moment — a burst pipe, a dead furnace — and whoever looks trustworthy and answerable gets the call. Reviews decide it. Fifty good reviews with an owner who replies beats a bigger crew with silence. For shops and restaurants, the profile is the storefront: hours, photos, and a menu that loads before the light changes.",
    whatWeFixHere: [
      "A contractor doing $500K a year in work with a Google profile that shows two reviews",
      "Referrals that die because the recommendation leads to no website at all",
      "A 'service area' setup done wrong, so the business shows up in the wrong towns",
      "Booking and estimates that live on one phone — the owner's — and nowhere else",
      "Great work with zero photos online, while a worse crew posts every job",
    ],
    faq: [
      {
        question: "I get all my work through referrals. Why put money into a website?",
        answer:
          "Because referrals check you out first. Somebody gives your name at a barbecue, and that night the homeowner looks you up. A real site with your work, your reviews, and your number turns that referral into a call. No site, and the referral quietly goes to the next name.",
      },
      {
        question: "I run a service business with no storefront. Does local search still work?",
        answer:
          "Yes — Google has a setup for exactly that, called a service-area business. Done right, you show up across the island without publishing your home address. Done wrong, you show up nowhere. It's one of the most common things we fix.",
      },
      {
        question: "Do you actually come to Staten Island?",
        answer:
          "Yes. Phone and remote cover most days, and when a job needs hands on site, we show up — same as the rest of the city. The ferry and the bridge both work fine.",
      },
    ],
    nearby: ["financial-district", "west-village"],
  },
];
