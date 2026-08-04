import { describe, expect, it } from "vitest";

import {
  normalizeTechAuditFollowUpPreference,
  parseTechAuditLeadIntent,
  parseTechAuditPreferredRoute,
  readTechAuditConfirmation,
  safeTechAuditReportId,
  techAuditConfirmationPath,
  techAuditContactProblem,
  techAuditContactRoute,
  techAuditFollowUpProblem,
  techAuditPreferredRoute,
  techAuditReplyLanguage,
  type TechAuditContactRoute,
  type TechAuditFollowUpPreference,
  type TechAuditPreferredRoute,
} from "./techAuditContact";

describe("Tech Audit contact contract", () => {
  it.each([
    ["owner@example.com", "email"],
    ["JEN@SHOP.COM", "email"],
    ["(646) 555-0118", "phone"],
    ["+1 646 555 0118", "phone"],
    ["+1 (646) 555-0118 ext. 42", "phone"],
  ] satisfies [string, TechAuditContactRoute][]) (
    "recognizes %s as an exact %s route",
    (value, route) => {
      expect(techAuditContactRoute(value)).toBe(route);
      expect(techAuditContactProblem(value)).toBeNull();
    },
  );

  it.each([
    ["", /add a phone or email/i],
    ["hello@yourshop", /incomplete|typo/i],
    ["555-0118", /area code/i],
    ["2125550118 surprise", /characters.*dial/i],
    ["david marsh", /phone or email/i],
  ])("rejects an unreachable contact value: %s", (value, expected) => {
    expect(techAuditContactRoute(value)).toBeNull();
    expect(techAuditContactProblem(value)).toMatch(expected);
  });

  it.each([
    ["email", "email", "email"],
    ["email", "fastest", "email"],
    ["email", "text", null],
    ["email", "phone", null],
    ["phone", "phone", "phone"],
    ["phone", "text", "sms"],
    ["phone", "fastest", "phone"],
    ["phone", "email", null],
  ] satisfies [TechAuditContactRoute, TechAuditFollowUpPreference, TechAuditPreferredRoute | null][]) (
    "maps %s plus %s to %s without substituting consent",
    (contact, preference, expected) => {
      expect(techAuditPreferredRoute(contact, preference)).toBe(expected);
    },
  );

  it("explains how to repair an explicit route mismatch", () => {
    expect(techAuditFollowUpProblem("owner@example.com", "text")).toMatch(/phone number/i);
    expect(techAuditFollowUpProblem("owner@example.com", "phone")).toMatch(/phone number/i);
    expect(techAuditFollowUpProblem("(646) 555-0118", "email")).toMatch(/email address/i);
    expect(techAuditFollowUpProblem("owner@example.com", "fastest")).toBeNull();
  });

  it("uses the safe exact-route default for missing or stale drafts", () => {
    expect(normalizeTechAuditFollowUpPreference(undefined)).toBe("fastest");
    expect(normalizeTechAuditFollowUpPreference("unsupported")).toBe("fastest");
    expect(normalizeTechAuditFollowUpPreference("text")).toBe("text");
  });

  it("round-trips only allowlisted confirmation state through the redirect URL", () => {
    const path = techAuditConfirmationPath({
      intent: "website",
      replyRoute: "sms",
      reportId: "example-com-1a2b3c4d",
    });

    expect(path).toBe(
      "/thanks/?submitted=tech-audit&intent=website&reply=sms&report=example-com-1a2b3c4d",
    );
    expect(readTechAuditConfirmation(path.split("?")[1] ?? "")).toEqual({
      submitted: true,
      intent: "website",
      replyRoute: "sms",
      reportId: "example-com-1a2b3c4d",
    });
  });

  it("rejects forged confirmation categories and malformed report IDs", () => {
    expect(
      readTechAuditConfirmation(
        "?submitted=other&intent=owner%40example.com&reply=carrier-pigeon&report=..%2Fprivate",
      ),
    ).toEqual({
      submitted: false,
      intent: null,
      replyRoute: null,
      reportId: "",
    });
    expect(parseTechAuditLeadIntent("consulting")).toBe("consulting");
    expect(parseTechAuditLeadIntent("sales")).toBeNull();
    expect(parseTechAuditPreferredRoute("sms")).toBe("sms");
    expect(parseTechAuditPreferredRoute("text")).toBeNull();
    expect(safeTechAuditReportId(" example-com-1234 ")).toBe("example-com-1234");
  });

  it.each([
    ["email", "emails you", "an email"],
    ["sms", "texts you", "a text"],
    ["phone", "calls you", "a call"],
    [null, "replies", "a reply"],
  ] satisfies [TechAuditPreferredRoute | null, string, string][]) (
    "describes the %s confirmation route accurately",
    (route, action, expectation) => {
      expect(techAuditReplyLanguage(route)).toEqual({ action, expectation });
    },
  );
});
