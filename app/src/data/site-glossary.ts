/* Split out of site.ts so content routes load ONLY their own data slice
 * (this array was part of the ~200KB shared site chunk). Pure data, no icons. */

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
      "A dog groomer used to text every client the night before to confirm. When she remembered. Now a reminder goes out the evening before each appointment. A 'mind leaving a review?' note goes out the morning after. She did not hire anyone. She set two rules once. No-shows dropped and reviews went up.",
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
