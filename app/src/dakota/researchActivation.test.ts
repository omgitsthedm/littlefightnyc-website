import { describe, expect, it } from "vitest";
import {
  validateDakotaOperatorRecordInput,
  validateDakotaOperatorTransition,
} from "../../../netlify/functions/_shared/dakota/operator-state-schema";
import { EMPTY_OPERATOR_RECORD } from "./revenue";
import {
  assertResearchDispositionCompatible,
  commitResearchReview,
  planResearchPursuitActivation,
  RESEARCH_PURSUIT_TASK_TITLE,
} from "./researchActivation";
import type { Candidate, OperatorRecord } from "./types";
import { collectReadyActions } from "./workflow";

const now = new Date("2026-08-03T18:00:00.000Z");
const taskId = "550e8400-e29b-41d4-a716-446655440099";
const candidate: Candidate = {
  rank: 1,
  score: 70,
  business_name: "Signal Bakery LLC",
  dba: "Signal Bakery",
  source: "nys_dos",
  source_id: "123",
  filed_at: "2026-08-01",
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
  missing_pieces: "contact route",
  diagnosis: "A public signal that still requires human review.",
  score_version: "v2",
  score_reasons: "recent filing",
};

function savedRecord(overrides: Partial<OperatorRecord> = {}): OperatorRecord {
  return {
    ...EMPTY_OPERATOR_RECORD,
    identity: { businessName: "Signal Bakery LLC", dba: "Signal Bakery", source: "nys_dos", sourceId: "123" },
    updated_at: "2026-08-03T17:00:00.000Z",
    ...overrides,
  };
}

describe("research pursue activation", () => {
  it("creates a due internal qualification task before a new signal can be marked pursue", () => {
    const plan = planResearchPursuitActivation(candidate, undefined, now, taskId);
    expect(plan.outcome).toBe("save_required");
    if (plan.outcome !== "save_required") return;

    expect(plan.expectedUpdatedAt).toBeNull();
    expect(plan.record).toMatchObject({
      status: "research_ready",
      activities: [],
      nextAction: RESEARCH_PURSUIT_TASK_TITLE,
      tasks: [expect.objectContaining({
        taskId,
        type: "qualify",
        status: "open",
        channel: "internal",
        contactId: null,
        dueAt: now.toISOString(),
      })],
    });
    expect(validateDakotaOperatorRecordInput(plan.record).valid).toBe(true);
    expect(validateDakotaOperatorTransition(plan.record, undefined, now).valid).toBe(true);
    const persisted = { ...plan.record, updated_at: now.toISOString() };
    expect(collectReadyActions({ "nys_dos:123": persisted }, now)[0]).toMatchObject({ lane: "due" });
  });

  it("reuses an already-visible durable action without inventing a second task", () => {
    const existing = savedRecord({
      status: "research_ready",
      tasks: [{ taskId, type: "qualify", status: "open", title: RESEARCH_PURSUIT_TASK_TITLE, dueAt: now.toISOString(), contactId: null, channel: "internal", createdAt: now.toISOString(), resolvedAt: null, resolutionNote: "" }],
    });
    const plan = planResearchPursuitActivation(candidate, existing, now, "550e8400-e29b-41d4-a716-446655440098");
    expect(plan.outcome).toBe("already_ready");
    if (plan.outcome !== "already_ready") return;
    expect(plan.record.tasks).toHaveLength(1);
    expect(plan.expectedUpdatedAt).toBe(existing.updated_at);
  });

  it("CAS-verifies an existing ready task before saving the bridge decision", async () => {
    const existing = savedRecord({
      status: "research_ready",
      tasks: [{ taskId, type: "qualify", status: "open", title: RESEARCH_PURSUIT_TASK_TITLE, dueAt: now.toISOString(), contactId: null, channel: "internal", createdAt: now.toISOString(), resolvedAt: null, resolutionNote: "" }],
    });
    const plan = planResearchPursuitActivation(candidate, existing, now, "550e8400-e29b-41d4-a716-446655440098");
    const calls: string[] = [];
    await commitResearchReview("pursue", plan, async () => { calls.push("core-cas"); }, async () => { calls.push("bridge"); });
    expect(calls).toEqual(["core-cas", "bridge"]);
  });

  it("blocks the bridge decision when an immutable open task would stay hidden", () => {
    const existing = savedRecord({
      status: "research_ready",
      tasks: [{ taskId, type: "research", status: "open", title: "Continue research next week", dueAt: "2026-08-10T18:00:00.000Z", contactId: null, channel: "internal", createdAt: "2026-08-03T17:00:00.000Z", resolvedAt: null, resolutionNote: "" }],
    });
    expect(planResearchPursuitActivation(candidate, existing, now, "550e8400-e29b-41d4-a716-446655440098")).toMatchObject({ outcome: "blocked" });
  });

  it("does not mistake an unrelated visible task for the required research review", () => {
    const existing = savedRecord({
      status: "research_ready",
      tasks: [{ taskId, type: "research", status: "open", title: "Verify the public source", dueAt: now.toISOString(), contactId: null, channel: "internal", createdAt: "2026-08-03T17:00:00.000Z", resolvedAt: null, resolutionNote: "" }],
    });
    expect(collectReadyActions({ "nys_dos:123": existing }, now)).toHaveLength(1);
    expect(planResearchPursuitActivation(candidate, existing, now, "550e8400-e29b-41d4-a716-446655440098")).toMatchObject({ outcome: "blocked" });
  });

  it("does not reopen closed or do-not-contact core outcomes", () => {
    expect(planResearchPursuitActivation(candidate, savedRecord({ status: "do_not_contact" }), now, taskId)).toMatchObject({ outcome: "blocked" });
    expect(planResearchPursuitActivation(candidate, savedRecord({ status: "paid" }), now, taskId)).toMatchObject({ outcome: "blocked" });
  });

  it("does not let a later bridge disposition orphan the durable pursuit task", () => {
    const existing = savedRecord({
      status: "research_ready",
      tasks: [{ taskId, type: "qualify", status: "open", title: RESEARCH_PURSUIT_TASK_TITLE, dueAt: now.toISOString(), contactId: null, channel: "internal", createdAt: now.toISOString(), resolvedAt: null, resolutionNote: "" }],
    });
    expect(() => assertResearchDispositionCompatible("not_fit", existing)).toThrow("Resolve the durable pursuit-review task");
    expect(() => assertResearchDispositionCompatible("pursue", existing)).not.toThrow();
  });

  it("commits the core task before the bridge pursue decision", async () => {
    const plan = planResearchPursuitActivation(candidate, undefined, now, taskId);
    const calls: string[] = [];
    await commitResearchReview(
      "pursue",
      plan,
      async () => { calls.push("core"); },
      async () => { calls.push("bridge"); },
    );
    expect(calls).toEqual(["core", "bridge"]);
  });

  it("never stores pursue when the durable core task fails", async () => {
    const plan = planResearchPursuitActivation(candidate, undefined, now, taskId);
    let bridgeCalls = 0;
    await expect(commitResearchReview(
      "pursue",
      plan,
      async () => { throw new Error("core conflict"); },
      async () => { bridgeCalls += 1; },
    )).rejects.toThrow("core conflict");
    expect(bridgeCalls).toBe(0);
  });

  it("reports the recoverable core-first state when the bridge save fails", async () => {
    const plan = planResearchPursuitActivation(candidate, undefined, now, taskId);
    let coreSaved = false;
    await expect(commitResearchReview(
      "pursue",
      plan,
      async () => { coreSaved = true; },
      async () => { throw new Error("bridge conflict"); },
    )).rejects.toThrow("core human-review task is saved and CAS-verified");
    expect(coreSaved).toBe(true);
  });
});
