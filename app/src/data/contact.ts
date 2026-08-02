/**
 * The business phone, in one place.
 *
 * The authoritative record is `site` in src/data/seo-pages.json, which the
 * build scripts read directly. That file is deliberately not shipped to the
 * client (see scripts/build-route-meta.mjs), so components cannot import it —
 * they were each retyping the number instead, twice over: once as digits for
 * the tel: href and once as punctuation for the visible label. Changing the
 * number meant finding every one of them.
 *
 * These two constants are the client-side copy. audit-brand-system.mjs asserts
 * they still match seo-pages.json, so the duplication cannot drift silently.
 */

/** E.164, for tel: hrefs. Never shown to a reader. */
export const PHONE_E164 = "+16463600318";

/** How the number is written wherever a person reads it. */
export const PHONE_DISPLAY = "(646) 360-0318";

/** Ready-made href, so callers never rebuild the tel: scheme by hand. */
export const PHONE_HREF = `tel:${PHONE_E164}`;

/**
 * The sms: scheme is assembled from char codes rather than written out, which
 * is how QuietContact and Contact already built it — cheap cover against
 * scrapers that pattern-match the literal prefix. Kept verbatim so this
 * consolidation doesn't quietly drop a deliberate behavior.
 */
export const SMS_HREF = `${String.fromCharCode(115, 109, 115, 58)}${PHONE_E164}`;

/** Public Google Calendar appointment page configured for the business. */
export const BOOKING_HREF =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3xaOTCBZD_hYbfstbYXJHhzYATKpTsnUAMNCwsSaAZlORb9H9UE1-v5SS1C5I_BlTBXHRsAOPb";

/** Public review destination. Use only after genuine completed work. */
export const GOOGLE_REVIEW_HREF = "https://g.page/r/CRb0vlSFW_48EBM/review";

/** Workspace aliases that route into the staffed hello@ inbox. */
export const SUPPORT_EMAIL = "support@littlefightnyc.com";
export const PROJECTS_EMAIL = "projects@littlefightnyc.com";
export const BILLING_EMAIL = "billing@littlefightnyc.com";
