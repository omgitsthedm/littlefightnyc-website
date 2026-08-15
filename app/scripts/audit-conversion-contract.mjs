import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

const [
  analytics,
  consent,
  thanks,
  auditAnalytics,
  serviceDetail,
  contact,
  espanol,
  zhongwen,
  ownerStories,
  quietContact,
  websiteCheck,
  caseStudyDetail,
] = await Promise.all([
  read("src/lib/analytics.ts"),
  read("src/lib/consent.ts"),
  read("src/pages/Thanks.tsx"),
  read("public/examples/audit/analytics.js"),
  read("src/pages/ServiceDetail.tsx"),
  read("src/pages/Contact.tsx"),
  read("src/pages/Espanol.tsx"),
  read("src/pages/Zhongwen.tsx"),
  read("src/components/editorial/OwnerStories.tsx"),
  read("src/components/editorial/QuietContact.tsx"),
  read("src/pages/WebsiteCheck.tsx"),
  read("src/pages/CaseStudyDetail.tsx"),
]);

for (const [label, source] of [
  ["analytics", analytics],
  ["consent", consent],
]) {
  assert.match(
    source,
    /function gtag\(\) \{[\s\S]{0,600}?dataLayer\?\.push\(arguments\)/u,
    `${label} must queue Google's native Arguments command shape`,
  );
  assert.doesNotMatch(
    source,
    /function gtag\(\.\.\.args[\s\S]{0,160}?dataLayer\?\.push\(args\)/u,
    `${label} must not turn gtag commands into inert arrays`,
  );
}

assert.match(
  analytics,
  /function setGoogleAnalyticsDisabled[\s\S]{0,180}?GA_DISABLE_KEY/u,
  "main site analytics must own Google's property-level disable switch",
);
assert.match(
  analytics,
  /setGoogleAnalyticsDisabled\(false\)/u,
  "main site analytics must re-enable GA4 only after consent",
);
assert.match(
  analytics,
  /setGoogleAnalyticsDisabled\(true\)/u,
  "main site analytics must disable GA4 on withdrawal",
);
assert.match(
  auditAnalytics,
  /GA_DISABLE_KEY[\s\S]{0,3200}?global\[GA_DISABLE_KEY\] = true[\s\S]{0,2400}?global\[GA_DISABLE_KEY\] = false/u,
  "Website Check analytics must disable GA4 on withdrawal and re-enable it only after consent",
);

// Analytics is deliberately a direct, consent-gated GA4 transport. A GTM
// container cannot be the only bridge here: it made a successful first-party
// event dependent on unpublished container configuration. Keep the canonical
// measurement ID and manual SPA page-view ownership in both public surfaces.
for (const [label, source] of [
  ["main site analytics", analytics],
  ["Website Check analytics", auditAnalytics],
]) {
  assert.match(
    source,
    /(?:const|var) GA_MEASUREMENT_ID\s*=\s*"G-0Q1TGWH0HL"/u,
    `${label} must use the controlled GA4 measurement ID directly`,
  );
  assert.match(
    source,
    /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/u,
    `${label} must load the direct gtag.js transport`,
  );
  assert.match(
    source,
    /gtag(?:\?\.)?\([\s\S]{0,120}?"config"[\s\S]{0,160}?send_page_view:\s*false/u,
    `${label} must leave SPA page-view delivery to the application`,
  );
  assert.doesNotMatch(
    source,
    /(?:const|var) GTM_ID\s*=/u,
    `${label} must not fall back to a GTM-only event bridge`,
  );
  assert.doesNotMatch(
    source,
    /bootGoogleTagManager/u,
    `${label} must not boot a retired GTM-only bridge`,
  );
}

// A successful Tech Audit form has exactly one submit event and exactly one
// lead event. Counting the generic and specialized events together quietly
// doubled the funnel, which makes real owner demand look better than it is.
const onSubmit = analytics.match(
  /const onSubmit = \(event: SubmitEvent\) => \{([\s\S]*?)\n {2}\};\n\n {2}const onScroll/u,
);
assert.ok(onSubmit, "analytics hooks must retain the bounded submit handler");
const techAuditBranch = onSubmit[1].match(
  /if \(formName === "tech-audit-scratch"\) \{([\s\S]*?)\n {4}\}\n\n {4}track\("form_submit"/u,
);
assert.ok(
  techAuditBranch,
  "the Tech Audit form must return before the generic form_submit event",
);
assert.match(
  techAuditBranch[1],
  /track\("tech_audit_submit"/u,
  "the Tech Audit form must retain its dedicated submit event",
);
assert.match(
  techAuditBranch[1],
  /return;/u,
  "the dedicated Tech Audit submit must stop the generic form_submit event",
);
assert.doesNotMatch(
  techAuditBranch[1],
  /track\("form_submit"/u,
  "the Tech Audit branch must never emit generic form_submit too",
);
assert.match(
  thanks,
  /trackEvent\("generate_lead"/u,
  "a confirmed Tech Audit handoff must record GA4's standard generate_lead event",
);
assert.doesNotMatch(
  thanks,
  /trackEvent\("lead_success"/u,
  "a confirmed Tech Audit handoff must not duplicate generate_lead with lead_success",
);
assert.match(
  analytics,
  /function sendGaEvent\(eventName: string, parameters: Record<string, unknown>\) \{[\s\S]{0,260}?hasRealGaMeasurementId\(\)[\s\S]{0,160}?window\.gtag\("event", eventName, parameters\)/u,
  "a consented first-party event must be handed to GA4's direct gtag transport",
);
assert.match(
  analytics,
  /export function trackFirstPartyEvent[\s\S]{0,900}?track\(eventName, safeParameters\)/u,
  "website_check_started and every typed first-party event must enter the GA4 event path",
);
assert.match(
  analytics,
  /const ANALYTICS_EVENT_NAMES = new Set\([\s\S]{0,900}?"generate_lead"[\s\S]{0,900}?\);/u,
  "the public site must allowlist event names before vendor delivery",
);
assert.match(
  analytics,
  /const ANALYTICS_PARAMETER_KEYS = new Set\([\s\S]{0,1200}?"failure_category"[\s\S]{0,1200}?\);/u,
  "the public site must allowlist event parameters before vendor delivery",
);
assert.match(
  analytics,
  /if \(!ANALYTICS_EVENT_NAMES\.has\(eventName\)\) return;/u,
  "unknown DOM or component event names must never reach a measurement vendor",
);
assert.match(
  analytics,
  /const BUSINESS_PROFILE_CAMPAIGN = Object\.freeze\([\s\S]{0,260}?utm_source: "google"[\s\S]{0,260}?utm_campaign: "business_profile"[\s\S]{0,260}?BUSINESS_PROFILE_BOOKING_CONTENT = "booking"/u,
  "only the approved Business Profile main and booking campaigns may survive URL sanitization",
);
assert.match(
  analytics,
  /function safeAnalyticsLocation[\s\S]{0,1200}?location\.origin !== window\.location\.origin[\s\S]{0,1200}?\.every\([\s\S]{0,500}?BUSINESS_PROFILE_BOOKING_CONTENT[\s\S]{0,500}?safeLocation\.href\.slice\(0, 512\)/u,
  "page_location must be exact-origin, bounded, and query-sanitized",
);
assert.match(
  analytics,
  /page_location:\s*window\.location\.href/u,
  "GA4 page views must enter sanitization with the current absolute location",
);
assert.match(
  analytics,
  /deferVendorBoot && analyticsAllowed && !gaBooted && hasRealGaMeasurementId\(\)/u,
  "production may defer a page view for GA4 boot, while previews keep a testable local event",
);
assert.match(
  analytics,
  /if \(signature === lastTrackedPageViewSignature\) return;/u,
  "the consent listener and route metadata must not duplicate the same page view",
);

assert.match(
  analytics,
  /website_plan_intent:\s*FirstPartyEventContext;/u,
  "website_plan_intent must remain in the typed, privacy-bounded event contract",
);
assert.match(
  analytics,
  /const FIRST_PARTY_EVENT_NAMES[\s\S]*?"website_plan_intent"/u,
  "website_plan_intent must use the first-party sanitizer instead of the generic event path",
);
for (const placement of ["case_proof", "owner_stories", "website_thanks"]) {
  assert.match(
    analytics,
    new RegExp(`\\| "${placement}"`, "u"),
    `${placement} must remain a recognized conversion placement`,
  );
}

for (const [label, source] of [
  ["website service proof", serviceDetail],
  ["contact website route", contact],
  ["Spanish website route", espanol],
  ["Chinese website route", zhongwen],
  ["owner stories website route", ownerStories],
]) {
  const matches = [
    ...source.matchAll(
      /to="\/tech-audit\/\?intent=website[^"]*"[\s\S]{0,260}?data-lf-event="([^"]+)"/gu,
    ),
  ];
  assert.ok(matches.length > 0, `${label} must expose a measurable website-intent CTA`);
  for (const match of matches) {
    assert.equal(
      match[1],
      "website_plan_intent",
      `${label} must record website_plan_intent, not ${match[1]}`,
    );
  }
}

assert.match(
  ownerStories,
  /data-lf-event="website_plan_intent"\s*data-lf-label="owner_stories"/u,
  "owner stories CTA must retain its attributable placement",
);
assert.match(
  quietContact,
  /intent === "website"[\s\S]{0,120}?"website_plan_intent"/u,
  "website-specific contact blocks must record website plan intent",
);
assert.doesNotMatch(
  websiteCheck,
  /data-lf-event="booking_started"\s*data-lf-label="website_check"/u,
  "website booking must not fall through to the unknown placement",
);
assert.match(
  websiteCheck,
  /data-lf-event="booking_started"\s*data-lf-label="website_check_page"/u,
  "website booking must retain the website_check_page placement",
);
assert.match(
  caseStudyDetail,
  /techAuditHref\(caseIntent, `case_\$\{study\.slug\}`\)[\s\S]{0,360}?data-lf-label="case_proof"/u,
  "case-study proof must hand off to an attributable, intent-matched plan request",
);

console.log(
  "Conversion contract audit passed: website-plan and booking actions stay typed, privacy-bounded, and attributable.",
);
