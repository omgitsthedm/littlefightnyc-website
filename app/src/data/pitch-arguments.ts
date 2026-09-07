export const whyWebsiteArguments = [
  {
    title: "They decide before they call.",
    body: "Customers compare websites before choosing who to call. A missing, broken, or outdated site can cost you that call.",
  },
  {
    title: "Your site answers the everyday questions.",
    body: "Are you open? What does it cost? Can I book? Your website can answer those questions while you work.",
  },
  {
    title: "One company handles the whole setup.",
    body: "Your website, booking, email, and computers need to work together. We handle the whole setup, so you have one company to call.",
  },
] as const;

export const serviceOffers: Record<string, { what: string; who: string; get: string }> = {
  "custom-local-websites": {
    what: "A website built around your business.",
    who: "Independent businesses that need customers to find and choose them.",
    get: "Clear service pages, mobile booking or inquiries, and accounts you control.",
  },
  "it-support": {
    what: "Help with computers, Wi-Fi, email, and everyday tech.",
    who: "Businesses with a problem stopping the working day.",
    get: "Diagnosis, a clear repair plan, and help on-site or remotely.",
  },
  "business-systems": {
    what: "Custom software that takes repeated tasks off your plate.",
    who: "Businesses repeating work across spreadsheets and disconnected tools.",
    get: "A working tool, your code and data, and plain instructions.",
  },
  "tech-consulting": {
    what: "A free second opinion on your technology.",
    who: "Owners deciding what to fix, replace, or stop paying for.",
    get: "A short list of practical next steps before spending money.",
  },
  "new-business-launch": {
    what: "Website and technology setup for an opening or relaunch.",
    who: "Owners getting a new or changing business ready for customers.",
    get: "A coordinated plan for your website, listing, email, booking, and account access.",
  },
  "ongoing-care": {
    what: "Website upkeep after launch.",
    who: "Businesses with a live site that needs regular attention.",
    get: "Content updates, form checks, and clear notes on the agreed work.",
  },
};
