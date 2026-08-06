import { describe, expect, it } from "vitest";

import { DAKOTA_CANDIDATE_FIELDS } from "./queue-schema";
import { validateQueuePayload } from "./queue-schema";

function candidate(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const defaults: Record<string, unknown> = {
    rank: 1,
    score: 0,
    business_name: "Example business",
    source: "nys_dos",
    source_id: "example-1",
    psi_mobile_performance: null,
  };

  return Object.fromEntries(
    DAKOTA_CANDIDATE_FIELDS.map((field) => [
      field,
      Object.hasOwn(overrides, field)
        ? overrides[field]
        : Object.hasOwn(defaults, field)
          ? defaults[field]
          : "",
    ]),
  );
}

function queue(records: unknown[]): Record<string, unknown> {
  return {
    schema_version: "dakota.queue.v1",
    generated_at: "2026-08-03T12:00:00Z",
    records,
  };
}

describe("validateQueuePayload", () => {
  it("accepts the exact v1 envelope and candidate fields", () => {
    const result = validateQueuePayload(
      queue([
        candidate({
          rank: 1,
          score: 87.5,
          business_name: "Example business",
          verified_url: "https://example.com/",
        }),
      ]),
    );

    expect(result.valid).toBe(true);
  });

  it("accepts an empty queue", () => {
    expect(validateQueuePayload(queue([])).valid).toBe(true);
  });

  it("rejects more than ten candidates", () => {
    expect(validateQueuePayload(queue(Array.from({ length: 11 }, () => candidate())))).toEqual(
      expect.objectContaining({ valid: false }),
    );
  });

  it("rejects unknown candidate and envelope fields", () => {
    expect(
      validateQueuePayload(queue([{ ...candidate(), extra: "not allowed" }])),
    ).toEqual(expect.objectContaining({ valid: false }));
    expect(validateQueuePayload({ ...queue([]), extra: true })).toEqual(
      expect.objectContaining({ valid: false }),
    );
  });

  it("rejects unsafe URLs and embedded credentials", () => {
    for (const verifiedUrl of [
      "javascript:alert(1)",
      "data:text/html,unsafe",
      "https://user:pass@example.com/",
      " https://example.com/",
      "https://example.com/\n",
    ]) {
      expect(
        validateQueuePayload(queue([candidate({ verified_url: verifiedUrl })])),
      ).toEqual(expect.objectContaining({ valid: false }));
    }
  });

  it("rejects oversized strings and non-finite numbers", () => {
    expect(
      validateQueuePayload(
        queue([candidate({ business_name: "x".repeat(241) })]),
      ),
    ).toEqual(expect.objectContaining({ valid: false }));
    expect(validateQueuePayload(queue([candidate({ score: Number.NaN })]))).toEqual(
      expect.objectContaining({ valid: false }),
    );
  });

  it("rejects schema-valid keys with invalid runtime field types", () => {
    for (const field of DAKOTA_CANDIDATE_FIELDS) {
      if (["rank", "score", "psi_mobile_performance"].includes(field)) continue;

      expect(
        validateQueuePayload(queue([candidate({ rank: 1, [field]: null })])),
      ).toEqual(expect.objectContaining({ valid: false }));
      expect(
        validateQueuePayload(queue([candidate({ rank: 1, [field]: 7 })])),
      ).toEqual(expect.objectContaining({ valid: false }));
    }

    expect(validateQueuePayload(queue([candidate({ rank: "1" })]))).toEqual(
      expect.objectContaining({ valid: false }),
    );
    expect(validateQueuePayload(queue([candidate({ rank: 1, score: "60" })]))).toEqual(
      expect.objectContaining({ valid: false }),
    );
    expect(
      validateQueuePayload(queue([candidate({ rank: 1, psi_mobile_performance: "42" })])),
    ).toEqual(expect.objectContaining({ valid: false }));
  });

  it("requires bounded numeric values and contiguous queue ranks", () => {
    for (const score of [-1, 101]) {
      expect(validateQueuePayload(queue([candidate({ rank: 1, score })]))).toEqual(
        expect.objectContaining({ valid: false }),
      );
    }

    for (const psi_mobile_performance of [-1, 101]) {
      expect(
        validateQueuePayload(queue([candidate({ rank: 1, psi_mobile_performance })])),
      ).toEqual(expect.objectContaining({ valid: false }));
    }

    expect(validateQueuePayload(queue([candidate({ rank: 2 })]))).toEqual(
      expect.objectContaining({ valid: false }),
    );
  });

  it("requires the core identity fields", () => {
    for (const field of ["business_name", "source", "source_id"]) {
      expect(
        validateQueuePayload(queue([candidate({ rank: 1, [field]: "   " })])),
      ).toEqual(expect.objectContaining({ valid: false }));
    }
  });

  it("accepts the optional two-score assessment fields", () => {
    const result = validateQueuePayload(
      queue([
        {
          ...candidate({ rank: 1 }),
          opportunity_score: 75,
          confidence_score: 95,
          category_tier: "A",
          queue_band: "priority_review",
        },
      ]),
    );
    expect(result.valid).toBe(true);
  });

  it("still accepts a queue published without them", () => {
    expect(validateQueuePayload(queue([candidate({ rank: 1 })])).valid).toBe(true);
  });

  it("rejects out-of-range or unknown assessment values", () => {
    const bad = [
      { opportunity_score: 101 },
      { confidence_score: -1 },
      { opportunity_score: 12.5 },
      { category_tier: "Z" },
      { queue_band: "send_it" },
    ];
    for (const patch of bad) {
      expect(
        validateQueuePayload(queue([{ ...candidate({ rank: 1 }), ...patch }])),
      ).toEqual(expect.objectContaining({ valid: false }));
    }
  });

  it("rejects any other extra field", () => {
    expect(
      validateQueuePayload(queue([{ ...candidate({ rank: 1 }), injected: "x" }])),
    ).toEqual(expect.objectContaining({ valid: false }));
  });

  it("still requires every v1 field to be present", () => {
    const record = candidate({ rank: 1 }) as Record<string, unknown>;
    delete record.diagnosis;
    expect(validateQueuePayload(queue([record]))).toEqual(
      expect.objectContaining({ valid: false }),
    );
  });
});
