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
      "The connected steps, tools, and records that move a customer from first question to finished work.",
    plain: "The way the work moves, not just the software you bought.",
    whenItMatters:
      "It matters when messages live in too many places, people copy the same details twice, or only the owner knows what happens next.",
    howItWorks:
      "Start with one customer path: a message comes in, someone sees it, the work is scheduled or quoted, payment is recorded, and the next person can see the status. A business system makes those handoffs visible. It can use tools you already have; the useful part is agreeing where each step belongs.",
    example:
      "A neighborhood plumber gets calls, texts, and website forms. A simple system can put each new request in one shared list, show who owns the callback, and flag a quote that still needs a decision. The owner chooses the timing and message before any rule goes live.",
    costOfIgnoring:
      "Without a shared path, a callback can sit in a text thread, a quote can wait on an answer, and the work can live in one person’s memory. Count the requests that need a second ask in a normal week. That is a better starting point than a mystery benchmark.",
    related: ["workflow-automation", "crm", "software-stack"],
    faq: [
      {
        question: "Isn’t a business system just more software I have to learn?",
        answer:
          "No. It can be a shared checklist, a better intake form, or a clearer handoff between tools you already use. The goal is fewer places to check, not more apps to log into.",
      },
      {
        question: "I’m a two-person shop. Am I too small for this?",
        answer:
          "No. A two-person shop may only need one clear list and a few agreed steps. Start when the same handoff keeps getting stuck, not because a vendor says it is time to upgrade.",
      },
    ],
  },
  {
    slug: "crm",
    term: "CRM",
    definition:
      "A CRM is a shared record for leads, customers, notes, and follow-up.",
    plain: "The list of people who asked for help, bought something, or need a reply.",
    whenItMatters:
      "It matters when customer notes are split between email, texts, spreadsheets, booking tools, and memory.",
    howItWorks:
      "A CRM gives each customer or lead one record. It can hold contact details, notes, status, and a next action. Some CRMs can create reminders or send messages, but the business still decides what information belongs there and who may see it.",
    example:
      "A contractor keeps inquiries in email, texts, and a spreadsheet. A CRM can put the customer name, job notes, estimate status, and next callback in one record. The team can agree which fields belong there before moving any existing list.",
    costOfIgnoring:
      "When customer details live in several places, people can repeat questions, miss a handoff, or lack the context to help. Before buying a CRM, check whether a shared list and a clear follow-up owner would solve the actual problem.",
    related: ["business-system", "workflow-automation", "software-stack"],
    faq: [
      {
        question: "Do I need an expensive CRM like the big companies use?",
        answer:
          "Not automatically. Choose the smallest setup that supports the work you repeat. A fancy CRM that nobody opens is just a very expensive filing cabinet.",
      },
      {
        question: "I already have my customers in a spreadsheet. Isn’t that enough?",
        answer:
          "A spreadsheet can be enough when it is current, shared appropriately, and has a clear owner. A CRM is worth considering when the team needs a repeatable next-action process or better context across several customer conversations.",
      },
    ],
  },
  {
    slug: "google-business-profile",
    term: "Google Business Profile",
    definition:
      "A free Google listing a verified business can manage in Google Search and Maps, including business details, hours, location, photos, and reviews.",
    plain: "The Google card people see before they ever reach your website.",
    whenItMatters:
      "It matters when your hours, phone, location, or business details are wrong or missing where local customers search.",
    howItWorks:
      "A verified owner can update the profile information Google shows in Search and Maps. Keep the details accurate, use the official tools for verification and reviews, and check the current rules before changing anything. Google describes the profile and verification process in its own help center.",
    example:
      "A corner florist notices its profile still shows old holiday hours. The owner checks the official profile, corrects the hours, and makes sure the website and phone number match. That is a practical first fix; it does not promise a placement in search.",
    costOfIgnoring:
      "Wrong hours, location, or phone details can send a customer to the wrong place or stop them from reaching you. Start with the business facts you can verify; rankings and customer choices are not something anyone can promise.",
    related: ["local-search", "business-system"],
    faq: [
      {
        question: "Is this the same as having a website?",
        answer:
          "They do different jobs. A profile helps people find basic business details in Google; a website gives you more room to explain offers, show work, and choose the customer path. Which comes first depends on what the business needs.",
      },
      {
        question: "How do I get more reviews without being pushy?",
        answer:
          "Ask for an honest review in a way that follows Google’s current review policies. Do not offer incentives or try to screen out unhappy customers. Check Google’s own rules before building a review request into a workflow.",
      },
    ],
  },
  {
    slug: "local-search",
    term: "Local search",
    definition:
      "The work of making accurate local business information easy to find in Google Search and Maps.",
    plain: "Showing up when someone nearby is already looking.",
    whenItMatters:
      "It matters when the business depends on local customers, appointments, walk-ins, or bookings.",
    howItWorks:
      "Google says local results use a range of factors. Start with information you control: correct business details, a useful profile, and pages that explain what you do and where you work. Google does not sell a guaranteed regular local ranking, so anyone promising a spot is selling fog with a tie on.",
    example:
      "A diner checks that its current hours, address, phone number, menu link, and website agree. It then makes a page that clearly explains the neighborhood and service it offers. Those updates make the information easier to verify; they do not guarantee a search result.",
    costOfIgnoring:
      "If the business facts are inconsistent, a customer may find an old number, wrong hours, or a confusing result. Fixing those basics is useful housekeeping; it is not a guarantee of traffic, calls, or sales.",
    related: ["google-business-profile", "business-system"],
    faq: [
      {
        question: "How long until local search actually helps me?",
        answer:
          "Some profile changes may appear quickly; others can need review or take longer to show. Search results also change over time. Set a maintenance habit, and do not accept a guaranteed timeline for rankings.",
      },
      {
        question: "Do I need to pay Google for ads to show up nearby?",
        answer:
          "No. Google Ads and regular local results are separate products. Ads can be useful for a defined campaign, but they do not buy a guaranteed regular local ranking.",
      },
    ],
  },
  {
    slug: "software-stack",
    term: "Software stack",
    definition:
      "All the tools a business uses to run the day: website, booking, point of sale, payments, email, spreadsheets, and reports.",
    plain: "All the apps you pay for, plus the work people still do around them.",
    whenItMatters:
      "It matters when the monthly bill keeps growing but the work still runs on workarounds.",
    howItWorks:
      "List every tool, what it costs, who uses it, what data it holds, and what it connects to. Then ask three plain questions: does it support an important step, does the team use it, and is there a safer simpler option? Keep what earns its place. Change one thing at a time.",
    example:
      "A salon lists its booking app, payment system, newsletter tool, and spreadsheet. The owner can see which tool owns each task and where staff copy information by hand. That makes it possible to compare options without guessing that a new app will solve everything.",
    costOfIgnoring:
      "A messy stack can hide unused subscriptions, overlapping features, and manual re-entry. Review the statements and ask the team what they actually use before cancelling anything that might hold customer records or business history.",
    related: ["business-system", "workflow-automation", "crm"],
    faq: [
      {
        question: "Does fixing my stack mean ripping everything out and starting over?",
        answer:
          "Usually not. Start with an inventory and one frustrating handoff. A replacement is worth considering only when the current tool cannot support a needed step, costs more than its value, or creates a real risk.",
      },
      {
        question: "How do I know if I’m paying for tools I don’t use?",
        answer:
          "Compare recurring charges with a current list of tools and ask who uses each one. Check export options, contract terms, and stored data before cancelling. The forgotten login might be holding something important. Sneaky little goblins do that.",
      },
    ],
  },
  {
    slug: "workflow-automation",
    term: "Workflow automation",
    definition:
      "A rule that moves a routine step forward on its own. It can send a lead to the right place, create a follow-up task, or update a record.",
    plain: "The boring repeatable step happens without someone remembering to do it.",
    whenItMatters:
      "It matters when staff spend time copying details, chasing reminders, or checking three places to answer one question.",
    howItWorks:
      "Automation is a simple “when this happens, do that” rule. For example: when a form comes in, add it to the shared list and create a follow-up task. Test the rule with a harmless example, decide who can see the data, and keep a person responsible for exceptions.",
    example:
      "A dog groomer wants appointment reminders to happen consistently. The business can test a reminder the evening before each appointment and keep an owner responsible for replies or changes. Whether it is worth keeping depends on the business’s own records and customer feedback.",
    costOfIgnoring:
      "Repeated copying and reminders can take attention away from customers, and a missed routine step can create extra cleanup. First measure the time and errors in one week. Automate only a step that is stable enough to trust.",
    related: ["business-system", "crm", "software-stack"],
    faq: [
      {
        question: "Will automation make my business feel cold or robotic to customers?",
        answer:
          "It can, if it sends the wrong message or hides a real question. Automate the repeatable reminder; leave choices, exceptions, and conversation with a person.",
      },
      {
        question: "Is this only for big companies with tech teams?",
        answer:
          "No. A small business can begin with one carefully tested rule. The right size depends on the task, the data involved, and who will own it after launch.",
      },
    ],
  },
];
