import { describe, expect, it } from "vitest";
import { isRealDateOnly, isSafePublicHttps, validateOperatorIdentity } from "./operatorValidation";

describe("operator validation", () => {
  it("accepts ordinary public HTTPS evidence URLs", () => {
    expect(isSafePublicHttps("https://example.com/research?id=1")).toBe(true);
  });

  it.each([
    " https://example.com",
    "https://example.com path",
    "http://example.com",
    "https://localhost/path",
    "https://127.0.0.1/path",
    "https://example.com:444/path",
  ])("rejects unsafe or server-incompatible URLs: %s", (value) => {
    expect(isSafePublicHttps(value)).toBe(false);
  });

  it("keeps identity prose plain and trimmed", () => {
    expect(validateOperatorIdentity({ businessName: "Acme", category: "Restaurant", source: "manual", sourceId: "abc" })).toBeNull();
    expect(validateOperatorIdentity({ businessName: " Acme", source: "manual", sourceId: "abc" })).toMatch(/spaces/);
    expect(validateOperatorIdentity({ businessName: "Acme <b>", source: "manual", sourceId: "abc" })).toMatch(/plain text/);
    expect(validateOperatorIdentity({ businessName: "Acme --!> comment", source: "manual", sourceId: "abc" })).toMatch(/plain text/);
    expect(validateOperatorIdentity({ businessName: "https://example.com", source: "manual", sourceId: "abc" })).toMatch(/dedicated URL/);
  });

  it("accepts only real calendar dates", () => {
    expect(isRealDateOnly("")).toBe(true);
    expect(isRealDateOnly("2026-08-03")).toBe(true);
    expect(isRealDateOnly("2026-02-30")).toBe(false);
  });
});
