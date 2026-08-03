import { describe, expect, it } from "vitest";
import { validateDakotaOperatorRecordInput } from "../../../netlify/functions/_shared/dakota/operator-state-schema";
import { EMPTY_OPERATOR_RECORD } from "./revenue";
import type { Candidate, DakotaTask, DakotaVerifiedContact, OperatorRecord, OperatorRecordInput } from "./types";
import {
  BOOKING_HREF,
  FUTURE_COMMERCIAL_DATE_ERROR,
  NEW_TASK_FIRST_SAVE_ERROR,
  PAID_ONBOARDING_TASK_ERROR,
  buildGmailComposeHref,
  buildValueBrief,
  canUseGoogleVoice,
  collectReadyActions,
  hasAlignedPaidOnboardingTask,
  isCommercialDateBeyondUtcTomorrow,
  isPersistedOpenTask,
  selectedContact,
  selectedPersistedContact,
  validateAppendedTaskStates,
} from "./workflow";

const email: DakotaVerifiedContact = {
  contactId: "550e8400-e29b-41d4-a716-446655440001",
  name: "Ari",
  role: "Owner",
  channel: "email",
  value: "ari@example.com",
  sourceUrl: "https://example.com/contact",
  verifiedAt: "2026-08-03",
  consentClassification: "explicit_inquiry",
};

const phone: DakotaVerifiedContact = {
  ...email,
  contactId: "550e8400-e29b-41d4-a716-446655440002",
  channel: "phone",
  value: "+12125550100",
};

const sms: DakotaVerifiedContact = {
  ...phone,
  contactId: "550e8400-e29b-41d4-a716-446655440003",
  channel: "sms",
};

const candidate: Candidate = {
  rank: 1,
  score: 80,
  business_name: "Example Bakery LLC",
  dba: "Example Bakery",
  source: "inbound:tech-audit",
  source_id: "abc",
  filed_at: "2026-08-03",
  category: "Bakery",
  phone: "",
  address: "",
  city: "New York",
  state: "NY",
  postal_code: "10001",
  county_or_borough: "Manhattan",
  verified_url: "https://example.com",
  domain_status: "verified",
  psi_status: "not_run",
  psi_mobile_performance: null,
  missing_pieces: "",
  diagnosis: "Requested a website review.",
  score_version: "v2",
  score_reasons: "Explicit inquiry",
};

function task(overrides: Partial<DakotaTask> = {}): DakotaTask {
  return {
    taskId: "550e8400-e29b-41d4-a716-446655440010",
    type: "qualify",
    status: "open",
    title: "Review the requested website plan",
    dueAt: null,
    contactId: null,
    channel: "internal",
    createdAt: "2026-08-03T12:00:00.000Z",
    resolvedAt: null,
    resolutionNote: "",
    ...overrides,
  };
}

function record(overrides: Partial<OperatorRecord> = {}): OperatorRecord {
  return {
    ...EMPTY_OPERATOR_RECORD,
    identity: { businessName: "Example Bakery", category: "Bakery", source: "inbound:tech-audit", sourceId: "abc" },
    contacts: [email, phone],
    selectedContactId: email.contactId,
    tasks: [task({ type: "research", title: "Review the consented inquiry" })],
    status: "research_ready",
    updated_at: "2026-08-03T12:00:00.000Z",
    ...overrides,
  };
}

describe("Dakota exact-contact handoffs", () => {
  it("uses only the explicitly selected, unchanged persisted route", () => {
    const current = record();
    expect(selectedContact(current)?.value).toBe("ari@example.com");
    expect(selectedPersistedContact(current, current.contacts, email.contactId)?.contactId).toBe(email.contactId);
    expect(selectedPersistedContact(current, current.contacts, phone.contactId)).toBeNull();
    expect(selectedPersistedContact({ ...current, contacts: [{ ...email, value: "changed@example.com" }, phone] }, current.contacts, email.contactId)).toBeNull();
  });

  it("builds a human-opened Gmail compose handoff and never invents a recipient", () => {
    const href = buildGmailComposeHref(email, "One focused move", "Hello Ari");
    expect(href).toContain("mail.google.com/mail/u/hello%40littlefightnyc.com/");
    expect(href).toContain("to=ari%40example.com");
    expect(buildGmailComposeHref(phone, "One focused move", "Hello Ari")).toBeNull();
    expect(buildGmailComposeHref({ ...email, consentClassification: "public_business" }, "One focused move", "Hello Ari")).toBeNull();
  });

  it("keeps Google Voice limited to structurally consented SMS routes", () => {
    expect(canUseGoogleVoice(sms)).toBe(true);
    expect(canUseGoogleVoice(phone)).toBe(false);
    expect(canUseGoogleVoice({ ...sms, consentClassification: "public_business" })).toBe(false);
  });
});

describe("Dakota durable task lifecycle", () => {
  it("requires a new task to be saved open before it can be completed or skipped", () => {
    const savedOpenTask = task();
    const completedTask: DakotaTask = {
      ...savedOpenTask,
      status: "completed",
      resolvedAt: "2026-08-03T13:00:00.000Z",
      resolutionNote: "The requested review was completed.",
    };
    const skippedTask: DakotaTask = {
      ...savedOpenTask,
      status: "skipped",
      resolvedAt: "2026-08-03T13:00:00.000Z",
      resolutionNote: "The task was superseded by verified new information.",
    };

    expect(validateAppendedTaskStates([savedOpenTask], [])).toBeNull();
    expect(validateAppendedTaskStates([completedTask], [])).toBe(NEW_TASK_FIRST_SAVE_ERROR);
    expect(validateAppendedTaskStates([skippedTask], [])).toBe(NEW_TASK_FIRST_SAVE_ERROR);
    expect(validateAppendedTaskStates([completedTask], [savedOpenTask])).toBeNull();
    expect(isPersistedOpenTask(savedOpenTask.taskId, [savedOpenTask])).toBe(true);
    expect(isPersistedOpenTask(savedOpenTask.taskId, [completedTask])).toBe(false);
    expect(isPersistedOpenTask(savedOpenTask.taskId, [])).toBe(false);
  });

  it("allows local-date tolerance through UTC tomorrow but rejects later commercial dates", () => {
    const now = new Date("2026-08-03T23:30:00.000Z");
    expect(isCommercialDateBeyondUtcTomorrow("2026-08-04", now)).toBe(false);
    expect(isCommercialDateBeyondUtcTomorrow("2026-08-05", now)).toBe(true);
    expect(FUTURE_COMMERCIAL_DATE_ERROR).toContain("next UTC calendar day");
  });

  it("treats paid as an internal onboarding loop and surfaces legacy payment tasks for repair", () => {
    const commercialClose = {
      ...EMPTY_OPERATOR_RECORD.commercialClose,
      onboardingNextAction: "Schedule the paid kickoff.",
    };
    const healthyPaid = record({
      status: "paid",
      commercialClose,
      tasks: [task({
        type: "onboarding",
        channel: "internal",
        contactId: null,
        title: commercialClose.onboardingNextAction,
      })],
    });
    const legacyPaid = record({
      status: "paid",
      commercialClose,
      tasks: [task({
        type: "payment",
        channel: "payment",
        contactId: email.contactId,
        title: "Confirm cleared payment.",
      })],
    });

    expect(hasAlignedPaidOnboardingTask(healthyPaid)).toBe(true);
    expect(hasAlignedPaidOnboardingTask(legacyPaid)).toBe(false);
    expect(PAID_ONBOARDING_TASK_ERROR).toContain("onboarding task");
    expect(collectReadyActions({ legacy_paid: legacyPaid }, new Date("2026-08-03T14:00:00.000Z"))[0]).toMatchObject({
      key: "legacy_paid",
      lane: "repair",
    });
  });
});

describe("Dakota revenue work", () => {
  it("generates a storefront-specific value brief with one booking action", () => {
    const savedRecord = record();
    const operatorInput: OperatorRecordInput & { updated_at?: string } = { ...savedRecord };
    delete operatorInput.updated_at;
    const valueBrief = buildValueBrief(candidate, {
      ...operatorInput,
      status: "pursuit_ready",
      verifiedPain: "The mobile order button opens a dead page.",
      offerFit: "Repair the mobile menu-to-order path and verify it on real phones.",
      proof: "Relevant approved restaurant conversion work.",
    });
    expect(valueBrief?.customerImpact).toContain("orders");
    expect(valueBrief?.plainText).not.toContain(BOOKING_HREF);
    expect(valueBrief?.outboundText.match(new RegExp(BOOKING_HREF.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).toHaveLength(1);
    expect(validateDakotaOperatorRecordInput({
      ...operatorInput,
      status: "pursuit_ready",
      verifiedPain: "The mobile order button opens a dead page.",
      offerFit: "Repair the mobile menu-to-order path and verify it on real phones.",
      proof: "Relevant approved restaurant conversion work.",
      draft: valueBrief?.plainText ?? "",
      tasks: [task({ type: "value_brief" })],
    }).valid).toBe(true);
  });

  it("returns every ready inbound, approved pursuit, and due task without hiding extras", () => {
    const records = {
      inbound_a: record(),
      inbound_b: record({ identity: { businessName: "Second", source: "inbound:website-check", sourceId: "def" }, updated_at: "2026-08-03T13:00:00.000Z" }),
      pursuit: record({ identity: { businessName: "Public", source: "nys_dos", sourceId: "123" }, status: "pursuit_ready", contacts: [{ ...email, consentClassification: "public_business" }], selectedContactId: email.contactId, tasks: [task({ type: "value_brief" })] }),
      due: record({ identity: { businessName: "Due", source: "manual", sourceId: "ghi" }, contacts: [{ ...email, consentClassification: "existing_relationship" }], tasks: [task({ type: "follow_up", dueAt: "2026-08-03T10:00:00.000Z" })] }),
    };
    const actions = collectReadyActions(records, new Date("2026-08-03T14:00:00.000Z"));
    expect(actions).toHaveLength(4);
    expect(actions[0]?.lane).toBe("due");
    expect(new Set(actions.map((action) => action.key))).toEqual(new Set(Object.keys(records)));
  });

  it("surfaces taskless migrated live records as repair work instead of dropping them", () => {
    const actions = collectReadyActions({ legacy: record({ status: "pursuit_ready", tasks: [] }) }, new Date("2026-08-03T14:00:00.000Z"));
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({ key: "legacy", lane: "repair", task: null });
  });

  it("wakes a snoozed record from its durable wake date even if legacy task timing is incomplete", () => {
    const actions = collectReadyActions({
      snoozed: record({ identity: { businessName: "Snoozed", source: "manual", sourceId: "snoozed" }, status: "snoozed", dueDate: "2026-08-03", tasks: [task({ type: "research", dueAt: null })] }),
    }, new Date("2026-08-03T14:00:00.000Z"));
    expect(actions[0]?.lane).toBe("due");
  });

  it("stops treating inbound source history as permanent urgency after triage", () => {
    const future = "2026-08-04T14:00:00.000Z";
    const actions = collectReadyActions({
      untouched_future: record({ tasks: [task({ type: "research", dueAt: future })] }),
      triaged: record({
        status: "pursuit_ready",
        tasks: [
          task({ status: "completed", resolvedAt: "2026-08-03T14:00:00.000Z", resolutionNote: "Inquiry reviewed." }),
          task({ taskId: "550e8400-e29b-41d4-a716-446655440011", type: "value_brief", dueAt: future }),
        ],
      }),
      snoozed: record({ status: "snoozed", dueDate: "2026-08-04", tasks: [task({ type: "research", dueAt: future })] }),
    }, new Date("2026-08-03T14:00:00.000Z"));
    expect(actions).toEqual([]);
  });
});
