/**
 * auditMapPaths — the per-industry customer-path stations drawn by
 * AuditMapDiagram AND emitted as a semantic ordered list in the prerendered
 * crawler HTML (scripts/prerender-seo.mjs bundles this module), so bots see
 * the same path users see. Every label quotes the industry's OWN page copy
 * in industries.json — the authored source is cited above each entry.
 * Nothing is invented.
 */
export const AUDIT_MAP_PATHS: Record<string, string[]> = {
  // "trace one real customer path: search, menu, booking or order, payment,
  //  reminder, review, and follow-up" — restaurants-bars fit-map copy.
  "restaurants-bars": ["Search", "Menu", "Book / order", "Payment", "Reminder", "Review", "Follow-up"],
  // "Trust-forward service pages", "Booking and intake that reduce phone tag",
  // "appointment interest, intake, reminders, staff handoffs, and follow-up
  //  with care" — medical-wellness-practices page copy.
  "medical-wellness-practices": ["Trust pages", "Booking", "Intake", "Reminder", "Staff handoff", "Follow-up"],
  // "Portfolio pages, inquiry types, visit requests, proposals, event
  //  interest, and collector or client follow-up" — galleries fit-map copy.
  "galleries-creative-studios": ["Portfolio", "Inquiry", "Visit request", "Proposal", "Follow-up"],
  // "search, consult request, conflict check, engagement, matter updates, and
  //  the review or referral at the end" — law-firms fit-map copy.
  "law-firms": ["Search", "Consult request", "Conflict check", "Engagement", "Matter updates", "Review / referral"],
  // "the service page to intake to consultation to proposal path" +
  // "proposals, follow-up, and reporting" — professional-services page copy.
  "professional-services": ["Service page", "Intake", "Consultation", "Proposal", "Reporting"],
  // "Product data, pickup options, POS inventory, email capture, return
  //  questions, and reporting" — retail-ecommerce fit-map copy.
  "retail-ecommerce": ["Product pages", "Pickup / shipping", "POS inventory", "Email capture", "Reporting"],
  // "discovery, services, staff calendars, deposits, reminders, reviews, and
  //  rebooking" — salons-wellness fit-map copy.
  "salons-wellness": ["Discovery", "Services", "Booking", "Deposit", "Reminder", "Review", "Rebooking"],
};

/* The shared read every industry page ends on: search → visit → book or buy →
 * return. Used only if a future industry ships without an authored path. */
export const GENERIC_AUDIT_PATH = ["Search", "Visit", "Book or buy", "Return"];
