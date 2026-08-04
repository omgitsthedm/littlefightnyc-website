import { describe, expect, it } from "vitest";
import { upcomingHolidayHoursFlags, weeklyGbpDraft } from "./growthOps";

describe("Dakota zero-cost visibility operations", () => {
  it("produces one bounded, claim-safe GBP draft per UTC week without tracking parameters", () => {
    const monday = weeklyGbpDraft(new Date("2026-08-03T12:00:00.000Z"));
    const sunday = weeklyGbpDraft(new Date("2026-08-09T23:59:00.000Z"));
    const nextMonday = weeklyGbpDraft(new Date("2026-08-10T00:01:00.000Z"));
    expect(monday).toEqual(sunday);
    expect(nextMonday.weekKey).not.toBe(monday.weekKey);
    expect(monday.body.length).toBeLessThan(1_500);
    expect(monday.ctaUrl).toMatch(/^https:\/\/www\.littlefightnyc\.com\//u);
    expect(monday.ctaUrl).not.toContain("?");
    expect(`${monday.title} ${monday.body}`).not.toMatch(/guaranteed customers|guaranteed revenue|more calls/iu);
  });

  it("flags upcoming observed federal holidays before hours can drift", () => {
    const flags = upcomingHolidayHoursFlags(new Date("2026-08-04T12:00:00.000Z"), 45);
    expect(flags).toContainEqual({
      name: "Labor Day",
      actualDate: "2026-09-07",
      observedDate: "2026-09-07",
      daysUntilObserved: 34,
    });
    const independence = upcomingHolidayHoursFlags(new Date("2026-06-01T12:00:00.000Z"), 40).find((flag) => flag.name === "Independence Day");
    expect(independence).toMatchObject({ actualDate: "2026-07-04", observedDate: "2026-07-03" });
  });
});
