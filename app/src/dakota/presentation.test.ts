import { describe, expect, it } from "vitest";
import { formatDate } from "./presentation";

describe("formatDate", () => {
  it("renders date-only operator values as local calendar dates", () => {
    expect(formatDate("2026-08-03")).toBe("Aug 3, 2026");
  });

  it("preserves invalid source values for honest display", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});
