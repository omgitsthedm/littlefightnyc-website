import assert from "node:assert/strict";
import test from "node:test";
import {
  clearLeadExclusion,
  createManualLead,
  emptyLedger,
  ledgerCsv,
  leadList,
  leadSummary,
  mergeNetlifySubmissions,
  setLeadExclusion,
  updateLeadStage,
} from "./lead-reconciliation-lib.mjs";

const realReceipt = {
  id: "provider-1",
  created_at: "2026-10-05T12:00:00.000Z",
  ip: "203.0.113.4",
  user_agent: "private browser",
  form_name: "tech-audit-scratch",
  data: {
    name: "Private Person",
    business: "Private Business",
    contact: "private@example.com",
    message: "Private message",
    intent: "website",
    lead_origin: "anchor_websites",
    discovery_source: "google",
    utm_source: "google",
    utm_campaign: "website-search",
  },
};

test("provider import deduplicates by provider id and preserves source fields without provider metadata", () => {
  const ledger = emptyLedger("2026-10-05T13:00:00.000Z");
  const first = mergeNetlifySubmissions(ledger, [realReceipt], "2026-10-05T13:00:00.000Z");
  assert.deepEqual({ added: first.added, updated: first.updated }, { added: 1, updated: 0 });
  assert.equal(ledger.leads[0].id, "netlify:provider-1");
  assert.equal(ledger.leads[0].context.lead_origin, "anchor_websites");
  assert.equal(ledger.leads[0].attribution.utm_campaign, "website-search");
  assert.equal(ledger.leads[0].contact.email, undefined);
  assert.equal(JSON.stringify(ledger.leads[0]).includes("203.0.113.4"), false);
  assert.equal(JSON.stringify(ledger.leads[0]).includes("private browser"), false);

  const second = mergeNetlifySubmissions(ledger, [realReceipt], "2026-10-05T14:00:00.000Z");
  assert.deepEqual({ added: second.added, updated: second.updated }, { added: 0, updated: 1 });
  assert.equal(ledger.leads.length, 1);
});

test("only explicit QA and spam receipts are excluded from totals", () => {
  const ledger = emptyLedger();
  mergeNetlifySubmissions(ledger, [
    { ...realReceipt, id: "qa-1", data: { ...realReceipt.data, subject: "Internal Little Fight NYC test — not a lead" } },
    { ...realReceipt, id: "spam-1", spam: true },
    { ...realReceipt, id: "uncertain-1", data: { ...realReceipt.data, message: "Can we test a new site idea?" } },
  ]);
  const summary = leadSummary(ledger);
  assert.equal(summary.received, 1);
  assert.equal(summary.excluded, 2);
  assert.equal(ledger.leads.find((lead) => lead.id === "netlify:uncertain-1").exclusion, null);
});

test("manual lead and operator stage history feed a privacy-safe funnel summary", () => {
  const ledger = emptyLedger();
  const manual = createManualLead({ channel: "text", receivedAt: "2026-10-05T12:00:00.000Z", knownValue: "1800" });
  ledger.leads.push(manual);
  updateLeadStage(ledger, manual.id, "qualified", "2026-10-05T13:00:00.000Z");
  updateLeadStage(ledger, manual.id, "won", "2026-10-06T13:00:00.000Z", "1800");
  const summary = leadSummary(ledger);
  assert.deepEqual(summary.stages, { new: 0, contacted: 0, qualified: 0, proposal: 0, won: 1, lost: 0 });
  assert.equal(summary.wonValue, 1800);
  assert.deepEqual(summary.sources, { unknown: 1 });
  assert.deepEqual(summary.intents, { unknown: 1 });
  assert.equal(JSON.stringify(summary).includes("Private"), false);
  assert.deepEqual(manual.stageHistory.map((entry) => entry.stage), ["new", "qualified", "won"]);

  setLeadExclusion(ledger, manual.id, "duplicate");
  assert.equal(leadSummary(ledger).received, 0);
  clearLeadExclusion(ledger, manual.id);
  assert.equal(leadSummary(ledger).received, 1);
  assert.deepEqual(leadList(ledger)[0], {
    id: manual.id,
    receivedAt: "2026-10-05T12:00:00.000Z",
    stage: "won",
    excluded: false,
    exclusionReason: null,
    origin: "text",
    formName: null,
  });
});

test("summary groups arbitrary raw source strings into a bounded other bucket", () => {
  const ledger = emptyLedger();
  const lead = createManualLead({ channel: "call", context: { source: "owner@example.com" } });
  ledger.leads.push(lead);
  assert.deepEqual(leadSummary(ledger).sources, { other: 1 });
});

test("legacy form fields map into a private receipt without inventing a sales stage", () => {
  const ledger = emptyLedger();
  mergeNetlifySubmissions(ledger, [{
    id: "legacy-1",
    created_at: "2026-09-01T12:00:00.000Z",
    form_name: "legacy-fit-check",
    data: {
      business_name: "Legacy Business",
      email: "owner@example.com",
      phone: "+1 555 0100",
      website: "https://example.com",
      messy_now: "Need a better booking path.",
    },
  }]);
  const lead = ledger.leads[0];
  assert.deepEqual(lead.contact, {
    business: "Legacy Business",
    contact: "owner@example.com",
    email: "owner@example.com",
    phone: "+1 555 0100",
    website_url: "https://example.com",
    message: "Need a better booking path.",
  });
  assert.equal(lead.stage, "new");
});

test("private CSV preserves reconciliation fields and makes spreadsheet formulas literal", () => {
  const ledger = emptyLedger();
  const lead = createManualLead({
    channel: "email",
    receivedAt: "2026-10-05T12:00:00.000Z",
    context: { source: "referral", tile: "websites-anchor" },
    contact: { name: "=HYPERLINK(\"https://example.com\")", message: "+SUM(1,1)" },
  });
  ledger.leads.push(lead);
  updateLeadStage(ledger, lead.id, "contacted", "2026-10-05T13:00:00.000Z");
  const csv = ledgerCsv(ledger);
  assert.match(csv, /"stage"/);
  assert.match(csv, /"websites-anchor"/);
  assert.match(csv, /"'=HYPERLINK/);
  assert.match(csv, /"'\+SUM\(1,1\)"/);
});


test("missing attribution stays unknown instead of being reported as direct", () => {
  const ledger = emptyLedger();
  ledger.leads.push(createManualLead({ channel: "call" }));
  ledger.leads.push(createManualLead({ channel: "email", context: { source: "direct" } }));
  assert.deepEqual(leadSummary(ledger).sources, { unknown: 1, direct: 1 });
});
