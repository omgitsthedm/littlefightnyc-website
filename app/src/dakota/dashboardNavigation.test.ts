import { describe, expect, it } from "vitest";

import { dashboardHrefForRecord, dashboardHrefForView, dashboardRecordKey, resolveDashboardLocation } from "./dashboardNavigation";

describe("Dakota dashboard navigation", () => {
  it.each([
    ["https://dakota.example/app/", "do-next"],
    ["https://dakota.example/app/?view=research", "research"],
    ["https://dakota.example/app/?view=pipeline", "pipeline"],
    ["https://dakota.example/app/?view=money", "money"],
  ] as const)("loads the direct URL %s as %s", (href, view) => {
    expect(resolveDashboardLocation(new URL(href))).toMatchObject({ view, shouldReplace: false });
  });

  it.each([
    ["today", "do-next", "/app/?campaign=august"],
    ["inbound", "do-next", "/app/?campaign=august"],
    ["queue", "research", "/app/?view=research&campaign=august"],
    ["revenue", "money", "/app/?view=money&campaign=august"],
  ] as const)("canonicalizes the %s alias without dropping other parameters", (alias, view, href) => {
    expect(resolveDashboardLocation(new URL(`https://dakota.example/app/?view=${alias}&campaign=august`))).toEqual({
      view,
      href,
      shouldReplace: true,
    });
  });

  it("removes an invalid view while preserving the rest of the URL", () => {
    expect(resolveDashboardLocation(new URL("https://dakota.example/app/?utm_source=voice&view=unknown#pipeline"))).toEqual({
      view: "do-next",
      href: "/app/?utm_source=voice#pipeline",
      shouldReplace: true,
    });
  });

  it("canonicalizes an explicit default view and keeps unrelated parameters", () => {
    expect(resolveDashboardLocation(new URL("https://dakota.example/app/?campaign=august&view=do-next"))).toEqual({
      view: "do-next",
      href: "/app/?campaign=august",
      shouldReplace: true,
    });
    expect(resolveDashboardLocation(new URL("https://dakota.example/app/?campaign=august"))).toEqual({
      view: "do-next",
      href: "/app/?campaign=august",
      shouldReplace: false,
    });
  });

  it("builds canonical history entries and preserves query parameters and hashes", () => {
    const current = new URL("https://dakota.example/app/?utm_source=voice&view=research#workspace");
    expect(dashboardHrefForView(current, "pipeline")).toBe("/app/?utm_source=voice&view=pipeline#workspace");
    expect(dashboardHrefForView(current, "do-next")).toBe("/app/?utm_source=voice#workspace");
    expect(current.href).toBe("https://dakota.example/app/?utm_source=voice&view=research#workspace");
  });

  it("deep-links an exact opportunity without dropping the active view", () => {
    const current = new URL("https://dakota.example/app/?view=pipeline&utm_source=voice#workspace");
    const opened = dashboardHrefForRecord(current, "NYS_DOS:ABC-123");
    expect(opened).toBe("/app/?view=pipeline&utm_source=voice&record=nys_dos%3Aabc-123#workspace");
    expect(dashboardRecordKey(new URL(`https://dakota.example${opened}`))).toBe("nys_dos:abc-123");
    expect(dashboardHrefForRecord(new URL(`https://dakota.example${opened}`), null)).toBe("/app/?view=pipeline&utm_source=voice#workspace");
  });
});
