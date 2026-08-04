import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

const [
  analytics,
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
  read("src/pages/ServiceDetail.tsx"),
  read("src/pages/Contact.tsx"),
  read("src/pages/Espanol.tsx"),
  read("src/pages/Zhongwen.tsx"),
  read("src/components/editorial/OwnerStories.tsx"),
  read("src/components/editorial/QuietContact.tsx"),
  read("src/pages/WebsiteCheck.tsx"),
  read("src/pages/CaseStudyDetail.tsx"),
]);

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
