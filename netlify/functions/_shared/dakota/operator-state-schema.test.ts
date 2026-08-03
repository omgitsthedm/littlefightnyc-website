import { describe, expect, it } from "vitest";

import {
  createDakotaOperatorRecord,
  createDakotaOperatorStateEnvelope,
  createEmptyDakotaCommercialClose,
  DAKOTA_OPERATOR_RECORD_LIMIT,
  DAKOTA_OPERATOR_STATE_MAX_BYTES,
  DAKOTA_OPERATOR_STATUSES,
  isDakotaCandidateKey,
  validateDakotaOperatorPutPayload,
  validateDakotaOperatorRecordInput,
  validateDakotaOperatorStateEnvelope,
  validateDakotaOperatorTransition,
} from "./operator-state-schema";

const UPDATED_AT = "2026-08-03T12:00:00.000Z";

function identity(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    businessName: "Example Bakery",
    dba: "Example",
    category: "Bakery",
    city: "Brooklyn",
    borough: "Brooklyn",
    source: "nys_dos",
    sourceId: "nys-dos:12345",
    verifiedUrl: "https://example.com/",
    publicSourceUrl: "https://data.ny.gov/example",
    ...overrides,
  };
}

function record(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    identity: identity(),
    status: "early_signal",
    notes: "Needs a human identity review.",
    verifiedPain: "Mobile navigation obscures the booking path.",
    offerFit: "Conversion-focused website engagement.",
    nextAction: "Verify the storefront and decide whether to pursue.",
    dueDate: "2026-08-15",
    estimatedValue: 12_500,
    actualRevenue: null,
    winLossReason: "",
    proof: "Public filing and business site reviewed manually.",
    draft: "Hi [Business Name], I noticed a possible booking-path issue.",
    contacts: [{
      contactId: "550e8400-e29b-41d4-a716-446655440001",
      name: "Alex Owner",
      role: "Owner",
      channel: "email",
      value: "alex@example.com",
      sourceUrl: "https://example.com/contact",
      verifiedAt: "2026-08-03",
      consentClassification: "public_business",
    }],
    activities: [],
    commercialClose: createEmptyDakotaCommercialClose(),
    ...overrides,
  };
}

function storedRecord(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const {
    contacts: _contacts,
    activities: _activities,
    commercialClose: _commercialClose,
    ...legacy
  } = record(overrides);
  return { ...legacy, updated_at: UPDATED_AT };
}

function validatedInput(overrides: Record<string, unknown> = {}) {
  const validation = validateDakotaOperatorRecordInput(record(overrides));
  if (!validation.valid) throw new Error(validation.error);
  return validation.value;
}

describe("Dakota operator-state schema", () => {
  it("accepts every approved human status and exact record fields", () => {
    for (const status of DAKOTA_OPERATOR_STATUSES) {
      expect(validateDakotaOperatorRecordInput(record({ status }))).toEqual(
        expect.objectContaining({ valid: true }),
      );
    }
  });

  it("requires pursuit evidence in the server transition gate", () => {
    for (const status of [
      "pursuit_ready",
      "pursuing",
      "replied",
      "meeting",
      "proposal",
      "won",
      "lost",
    ]) {
      expect(
        validateDakotaOperatorTransition(
          record({ status, verifiedPain: "", offerFit: "" }) as unknown as Parameters<typeof validateDakotaOperatorTransition>[0],
          undefined,
          new Date(UPDATED_AT),
        ).valid,
        status,
      ).toBe(false);
    }
    expect(
      validateDakotaOperatorTransition(
        record({ status: "research_ready", verifiedPain: "", offerFit: "" }) as unknown as Parameters<typeof validateDakotaOperatorTransition>[0],
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
  });

  it("keeps milestone timestamps server-owned", () => {
    expect(
      validateDakotaOperatorRecordInput(
        record({
          milestones: {
            humanApprovedAt: UPDATED_AT,
            repliedAt: null,
            meetingAt: null,
            proposalAt: null,
            wonAt: null,
          },
        }),
      ).valid,
    ).toBe(false);
  });

  it("stamps each bounded milestone once and preserves it across later edits", () => {
    const approvedAt = "2026-08-01T12:00:00.000Z";
    const repliedAt = "2026-08-02T12:00:00.000Z";
    const laterEditAt = "2026-08-03T12:00:00.000Z";
    const approved = createDakotaOperatorRecord(
      record({ status: "pursuit_ready" }) as unknown as Parameters<typeof createDakotaOperatorRecord>[0],
      approvedAt,
    );
    expect(approved.milestones).toEqual({
      humanApprovedAt: approvedAt,
      firstContactedAt: null,
      repliedAt: null,
      meetingAt: null,
      proposalAt: null,
      wonAt: null,
      lostAt: null,
      paidAt: null,
    });

    const replied = createDakotaOperatorRecord(
      record({ status: "replied" }) as unknown as Parameters<typeof createDakotaOperatorRecord>[0],
      repliedAt,
      approved,
    );
    const edited = createDakotaOperatorRecord(
      record({ status: "research_ready", notes: "Later research note." }) as unknown as Parameters<typeof createDakotaOperatorRecord>[0],
      laterEditAt,
      replied,
    );
    expect(edited.milestones.humanApprovedAt).toBe(approvedAt);
    expect(edited.milestones.repliedAt).toBe(repliedAt);
    expect(edited.updated_at).toBe(laterEditAt);
  });

  it("accepts stable feed keys and only UUID-shaped manual keys", () => {
    expect(isDakotaCandidateKey("nys_dos:nys-dos:12345")).toBe(true);
    expect(isDakotaCandidateKey("manual:550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    for (const key of [
      "manual:not-a-uuid",
      "NYS_DOS:nys-dos:12345",
      "nys_dos/../../state:123",
      "https://example.com:123",
      "nys_dos:",
      "__proto__",
    ]) {
      expect(isDakotaCandidateKey(key)).toBe(false);
    }
  });

  it("requires exact request and record shapes", () => {
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nys_dos:nys-dos:12345",
        record: record(),
      }).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nys_dos:nys-dos:12345",
        record: record(),
        extra: true,
      }).valid,
    ).toBe(false);
    expect(validateDakotaOperatorRecordInput({ ...record(), extra: true }).valid).toBe(false);

    const { draft: _draft, ...missing } = record();
    expect(validateDakotaOperatorRecordInput(missing).valid).toBe(false);
  });

  it("requires a bounded identity snapshot and rejects mismatched feed identity", () => {
    expect(validateDakotaOperatorRecordInput(record({ identity: { businessName: "Bakery" } })).valid).toBe(
      true,
    );
    expect(validateDakotaOperatorRecordInput(record({ identity: {} })).valid).toBe(false);
    expect(
      validateDakotaOperatorRecordInput(
        record({ identity: identity({ businessName: "x".repeat(241) }) }),
      ).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorRecordInput(
        record({ identity: identity({ city: "x".repeat(160) }) }),
      ).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorRecordInput(
        record({ identity: identity({ city: "x".repeat(161) }) }),
      ).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorRecordInput(record({ identity: identity({ rawPayload: {} }) })).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nyc_dcwp:nys-dos:12345",
        record: record(),
      }).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nys_dos:nys-dos:abc123",
        record: record({
          identity: identity({ source: "NYS_DOS", sourceId: "NYS-DOS:ABC123" }),
        }),
      }).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nys_dos:nys-dos:12345",
        record: record({
          identity: {
            businessName: "Example Bakery",
            source: "nys_dos",
          },
        }),
      }).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "manual:550e8400-e29b-41d4-a716-446655440000",
        record: record({
          identity: {
            businessName: "Manual Bakery",
            source: "manual",
            sourceId: "550e8400-e29b-41d4-a716-446655440000",
          },
        }),
      }).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "manual:550e8400-e29b-41d4-a716-446655440000",
        record: record({ identity: { businessName: "Manual Bakery" } }),
      }).valid,
    ).toBe(false);
  });

  it("allows only safe public HTTPS URLs in the two identity URL fields", () => {
    for (const verifiedUrl of [
      "javascript:alert(1)",
      "data:text/html,unsafe",
      "http://example.com/path",
      "https://user:pass@example.com/",
      "https://localhost/path",
      "http://127.0.0.1/path",
      "https://example.com:8443/path",
      " https://example.com/",
    ]) {
      expect(
        validateDakotaOperatorRecordInput(
          record({ identity: identity({ verifiedUrl }) }),
        ).valid,
      ).toBe(false);
    }

    expect(
      validateDakotaOperatorRecordInput(
        record({
          identity: identity({
            verifiedUrl: "https://example.com/path?q=1",
            publicSourceUrl: "https://www.google.com/maps/place/example",
          }),
        }),
      ).valid,
    ).toBe(true);
  });

  it("rejects URLs, HTML, controls, and oversized operator prose", () => {
    for (const notes of [
      "Review https://example.com",
      "<strong>unsafe</strong>",
      "unsafe\u0000text",
      "x".repeat(4_001),
    ]) {
      expect(validateDakotaOperatorRecordInput(record({ notes })).valid).toBe(false);
    }
    expect(validateDakotaOperatorRecordInput(record({ draft: "x".repeat(6_001) })).valid).toBe(false);
  });

  it("validates real date-only values and bounded two-decimal money values", () => {
    expect(validateDakotaOperatorRecordInput(record({ dueDate: "", estimatedValue: 0 })).valid).toBe(
      true,
    );
    expect(validateDakotaOperatorRecordInput(record({ dueDate: "2028-02-29" })).valid).toBe(true);
    for (const dueDate of ["2026-02-29", "2026-13-01", "08/15/2026", null]) {
      expect(validateDakotaOperatorRecordInput(record({ dueDate })).valid).toBe(false);
    }
    for (const estimatedValue of [-1, 100_000_001, 12.345, Number.NaN, "1000"]) {
      expect(validateDakotaOperatorRecordInput(record({ estimatedValue })).valid).toBe(false);
    }
  });

  it("validates stored timestamps, record keys, limits, and envelope size", () => {
    const valid = createDakotaOperatorStateEnvelope(
      {
        "nys_dos:nys-dos:12345": createDakotaOperatorRecord(
          record() as unknown as Parameters<typeof createDakotaOperatorRecord>[0],
          UPDATED_AT,
        ),
      },
      UPDATED_AT,
    );
    expect(validateDakotaOperatorStateEnvelope(valid).valid).toBe(true);
    const legacy = validateDakotaOperatorStateEnvelope({
      schema_version: "dakota.operator-state.v1",
      updated_at: UPDATED_AT,
      records: {
        "nys_dos:nys-dos:12345": storedRecord({ status: "proposal" }),
      },
    });
    expect(legacy.valid).toBe(true);
    if (legacy.valid) {
      expect(legacy.value.records["nys_dos:nys-dos:12345"]?.milestones).toEqual({
        humanApprovedAt: UPDATED_AT,
        firstContactedAt: UPDATED_AT,
        repliedAt: null,
        meetingAt: null,
        proposalAt: UPDATED_AT,
        wonAt: null,
        lostAt: null,
        paidAt: null,
      });
    }
    expect(
      validateDakotaOperatorStateEnvelope({
        ...valid,
        records: {
          "nys_dos:nys-dos:12345": {
            ...valid.records["nys_dos:nys-dos:12345"],
            milestones: {
              ...valid.records["nys_dos:nys-dos:12345"]?.milestones,
              wonAt: "not-a-timestamp",
            },
          },
        },
      }).valid,
    ).toBe(false);
    expect(validateDakotaOperatorStateEnvelope({ ...valid, updated_at: "yesterday" }).valid).toBe(
      false,
    );
    expect(
      validateDakotaOperatorStateEnvelope({
        ...valid,
        records: { "bad/key": storedRecord() },
      }).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorStateEnvelope({
        ...valid,
        records: {
          "nyc_dcwp:nyc-dcwp:12345": storedRecord(),
        },
      }).valid,
    ).toBe(false);

    const tooMany = Object.fromEntries(
      Array.from({ length: DAKOTA_OPERATOR_RECORD_LIMIT + 1 }, (_, index) => [
        `nys_dos:nys-dos:${index}`,
        storedRecord(),
      ]),
    );
    expect(
      validateDakotaOperatorStateEnvelope({
        schema_version: "dakota.operator-state.v1",
        updated_at: UPDATED_AT,
        records: tooMany,
      }).valid,
    ).toBe(false);

    const oversized = Object.fromEntries(
      Array.from({ length: DAKOTA_OPERATOR_RECORD_LIMIT }, (_, index) => [
        `nys_dos:nys-dos:${index}`,
        storedRecord({
          identity: identity({ sourceId: `nys-dos:${index}` }),
          draft: "x".repeat(6_000),
        }),
      ]),
    );
    const oversizedResult = validateDakotaOperatorStateEnvelope({
      schema_version: "dakota.operator-state.v1",
      updated_at: UPDATED_AT,
      records: oversized,
    });
    expect(new TextEncoder().encode(JSON.stringify({
      schema_version: "dakota.operator-state.v1",
      updated_at: UPDATED_AT,
      records: oversized,
    })).byteLength).toBeGreaterThan(DAKOTA_OPERATOR_STATE_MAX_BYTES);
    expect(oversizedResult).toEqual({
      valid: false,
      error: "Operator-state envelope is oversized.",
    });
  });

  it("normalizes historical realized revenue into one cleared-cash truth", () => {
    const migrated = validateDakotaOperatorStateEnvelope({
      schema_version: "dakota.operator-state.v1",
      updated_at: UPDATED_AT,
      records: {
        "nys_dos:nys-dos:12345": storedRecord({ status: "won", actualRevenue: 2_500 }),
      },
    });
    expect(migrated.valid).toBe(true);
    if (!migrated.valid) return;
    const migratedRecord = migrated.value.records["nys_dos:nys-dos:12345"];
    expect(migrated.value.schema_version).toBe("dakota.operator-state.v2");
    expect(migratedRecord?.commercialClose).toEqual(
      expect.objectContaining({ amountDue: 2_500, amountPaid: 2_500, balance: 0, paidDate: "2026-08-03" }),
    );
    expect(migratedRecord?.actualRevenue).toBe(2_500);
    expect(migratedRecord?.milestones.paidAt).toBe(UPDATED_AT);
  });

  it("enforces durable contacts and immutable append-only activities", () => {
    const firstActivity = {
      activityId: "550e8400-e29b-41d4-a716-446655440010",
      channel: "internal",
      type: "note",
      outcome: "recorded",
      note: "Initial operator note.",
      occurredAt: UPDATED_AT,
      followUpAt: null,
    };
    const previous = createDakotaOperatorRecord(
      validatedInput({ activities: [firstActivity] }),
      UPDATED_AT,
    );
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ contacts: [], activities: [firstActivity] }),
        previous,
        new Date(UPDATED_AT),
      ),
    ).toEqual(expect.objectContaining({ valid: false }));
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ activities: [{ ...firstActivity, note: "Rewritten note." }] }),
        previous,
        new Date(UPDATED_AT),
      ),
    ).toEqual(expect.objectContaining({ valid: false }));
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ activities: [firstActivity, {
          ...firstActivity,
          activityId: "550e8400-e29b-41d4-a716-446655440011",
          note: "Appended note.",
        }] }),
        previous,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
  });

  it("keeps unknown and do-not-contact routes research-only and protects DNC transitions", () => {
    const unknownContact = {
      ...(record().contacts as Record<string, unknown>[])[0],
      consentClassification: "unknown",
    };
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "pursuit_ready", contacts: [unknownContact] }),
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);

    const dnc = createDakotaOperatorRecord(
      validatedInput({ status: "do_not_contact" }),
      UPDATED_AT,
    );
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "pursuit_ready" }),
        dnc,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "research_ready" }),
        dnc,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
    const reclassified = validatedInput({
      status: "pursuit_ready",
      contacts: [{
        ...(record().contacts as Record<string, unknown>[])[0],
        consentClassification: "explicit_inquiry",
      }],
    });
    expect(validateDakotaOperatorTransition(reclassified, dnc, new Date(UPDATED_AT)).valid).toBe(true);
    expect(
      validateDakotaOperatorTransition(
        { ...reclassified, status: "research_ready" },
        dnc,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
  });

  it("requires evidence wherever commercial truth is recorded and reserves lost for pursuit", () => {
    const cashWithoutEvidence = validatedInput({
      commercialClose: {
        ...createEmptyDakotaCommercialClose(),
        amountPaid: 500,
        paidDate: "2026-08-03",
      },
    });
    expect(validateDakotaOperatorTransition(cashWithoutEvidence, undefined, new Date(UPDATED_AT)).valid).toBe(false);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "lost", winLossReason: "Budget changed." }),
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "snoozed", dueDate: "" }),
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
  });
});
