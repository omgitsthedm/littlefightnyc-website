/* Split out of site.ts so content routes load ONLY their own data slice
 * (this array was part of the ~200KB shared site chunk). Pure data, no icons. */

export type AnswerGuide = {
  slug: string;
  question: string;
  short: string;
  published: string;
  updated: string;
  sections: Array<{ heading: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
};

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
