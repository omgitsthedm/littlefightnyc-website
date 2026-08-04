import { describe, expect, it } from "vitest";
import {
  DAKOTA_PURSUIT_TEMPLATES,
  activityNeedsPursuitAttribution,
  buildPursuitPacket,
  canOpenPursuitChannel,
  countWords,
  createPursuitAttribution,
  isCompliantPursuitNote,
  isValidPursuitAttribution,
  latestPursuitAttribution,
  pursuitArtifactFingerprint,
  pursuitPacketIdForFingerprint,
  recommendPursuitTemplateId,
} from "./pursuitKit";
import type { DakotaActivity } from "./types";

const packetId = "550e8400-e29b-41d4-a716-446655440200";
const evidence = [
  { label: "Saved operator verification", detail: "The verified mobile booking route stops before a reservation can be completed." },
];
const contact = {
  contactId: "550e8400-e29b-41d4-a716-446655440001",
  name: "Alex",
  role: "Owner",
  channel: "email" as const,
  value: "alex@example.com",
  sourceUrl: "https://example.com/contact",
  verifiedAt: "2026-08-04",
  consentClassification: "existing_relationship" as const,
};

describe("Dakota attributable reciprocity pursuit kit", () => {
  it("ships exactly three deterministic human-authored templates with bounded action plans", () => {
    expect(DAKOTA_PURSUIT_TEMPLATES.map((template) => template.id)).toEqual([
      "restaurant_booking_fix_sop",
      "salon_google_profile_sop",
      "new_business_launch_checklist",
    ]);
    for (const template of DAKOTA_PURSUIT_TEMPLATES) {
      expect(template.version).toBe("1.0.0");
      expect(template.actionSteps.length).toBeGreaterThanOrEqual(3);
      expect(template.actionSteps.length).toBeLessThanOrEqual(5);
      expect(JSON.stringify(template)).not.toMatch(/https?:|www\.|@/u);
    }
  });

  it("uses only supplied verified evidence and produces a compliant human-sent note", () => {
    for (const template of DAKOTA_PURSUIT_TEMPLATES) {
      const packet = buildPursuitPacket({
        templateId: template.id,
        packetId,
        businessName: "Signal Bakery",
        contactName: "Alex",
        offerFit: "Repair the verified mobile customer path and leave the owner a repeatable check.",
        evidence,
        preparedAt: "2026-08-04T12:00:00.000Z",
      });
      expect(packet).not.toBeNull();
      expect(packet?.evidence).toEqual(evidence);
      expect(packet?.plainText).toContain(evidence[0]!.detail);
      expect(packet?.plainText).not.toContain("buyer intent");
      expect(packet?.note).toContain("I attached a one-page");
      expect(packet?.note).toContain("Which step would be most useful to tackle first?");
      expect(packet?.note).not.toContain("if I sent it over");
      expect(countWords(packet?.note ?? "")).toBeLessThanOrEqual(75);
      expect((packet?.note.match(/\?/gu) ?? [])).toHaveLength(1);
      expect(packet?.note.endsWith("— David, Little Fight NYC")).toBe(true);
      expect(isCompliantPursuitNote(packet?.note ?? "")).toBe(true);
      expect(packet?.plainText.length).toBeLessThan(5_000);
    }
  });

  it("refuses a packet without saved evidence, offer fit, a real packet ID, or a valid date", () => {
    const base = {
      templateId: "restaurant_booking_fix_sop" as const,
      packetId,
      businessName: "Signal Bakery",
      contactName: "Alex",
      contactRoute: contact,
      offerFit: "Booking-path repair.",
      evidence,
      preparedAt: "2026-08-04T12:00:00.000Z",
    };
    expect(buildPursuitPacket({ ...base, evidence: [] })).toBeNull();
    expect(buildPursuitPacket({ ...base, offerFit: "" })).toBeNull();
    expect(buildPursuitPacket({ ...base, packetId: "signal-bakery" })).toBeNull();
    expect(buildPursuitPacket({ ...base, preparedAt: "not-a-date" })).toBeNull();
    const longNames = buildPursuitPacket({ ...base, businessName: "A ".repeat(100), contactName: "B ".repeat(100) });
    expect(longNames).not.toBeNull();
    expect(countWords(longNames?.note ?? "")).toBeLessThanOrEqual(75);
  });

  it("recommends storefront-sensitive templates without claiming the recommendation is evidence", () => {
    expect(recommendPursuitTemplateId("Restaurant")).toBe("restaurant_booking_fix_sop");
    expect(recommendPursuitTemplateId("Hair Salon")).toBe("salon_google_profile_sop");
    expect(recommendPursuitTemplateId("Professional services")).toBe("new_business_launch_checklist");
  });

  it("invalidates approval when any artifact-defining dossier field changes", () => {
    const base = {
      templateId: "restaurant_booking_fix_sop" as const,
      businessName: "Signal Bakery",
      contactName: "Alex",
      contactRoute: contact,
      offerFit: "Booking-path repair.",
      evidence,
    };
    const fingerprint = pursuitArtifactFingerprint(base);
    expect(pursuitArtifactFingerprint({ ...base })).toBe(fingerprint);
    expect(pursuitArtifactFingerprint({ ...base, contactName: "Jordan" })).not.toBe(fingerprint);
    expect(pursuitArtifactFingerprint({ ...base, contactRoute: { ...contact, contactId: "550e8400-e29b-41d4-a716-446655440002" } })).not.toBe(fingerprint);
    expect(pursuitArtifactFingerprint({ ...base, contactRoute: { ...contact, value: "another@example.com" } })).not.toBe(fingerprint);
    expect(pursuitArtifactFingerprint({ ...base, offerFit: "Profile repair." })).not.toBe(fingerprint);
    expect(pursuitArtifactFingerprint({ ...base, evidence: [{ ...evidence[0]!, detail: "Different verified fact." }] })).not.toBe(fingerprint);
    expect(pursuitPacketIdForFingerprint(fingerprint)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/u);
    expect(pursuitPacketIdForFingerprint(fingerprint)).not.toBe(pursuitPacketIdForFingerprint(pursuitArtifactFingerprint({ ...base, contactName: "Jordan" })));
  });

  it("opens only human-operated channels allowed by the saved consent route", () => {
    expect(canOpenPursuitChannel(contact)).toBe(true);
    expect(canOpenPursuitChannel({ ...contact, consentClassification: "public_business" })).toBe(true);
    expect(canOpenPursuitChannel({ ...contact, channel: "phone", value: "+12125550100", consentClassification: "public_business" })).toBe(true);
    expect(canOpenPursuitChannel({ ...contact, channel: "sms", value: "+12125550100", consentClassification: "public_business" })).toBe(false);
    expect(canOpenPursuitChannel({ ...contact, consentClassification: "unknown" })).toBe(false);
  });

  it("creates immutable versioned attribution from the exact approved packet", () => {
    const packet = buildPursuitPacket({
      templateId: "restaurant_booking_fix_sop",
      packetId,
      businessName: "Signal Bakery",
      contactName: "Alex",
      offerFit: "Booking-path repair.",
      evidence,
      preparedAt: "2026-08-04T12:00:00.000Z",
    });
    if (!packet) throw new Error("fixture did not produce a packet");
    const attribution = createPursuitAttribution(packet, "2026-08-04T12:01:00.000Z");
    expect(attribution).toEqual({
      templateId: "restaurant_booking_fix_sop",
      templateVersion: "1.0.0",
      packetId,
      packetVersion: "1.0.0",
      segment: "restaurant",
      approvedAt: "2026-08-04T12:01:00.000Z",
    });
    expect(isValidPursuitAttribution(attribution)).toBe(true);
    expect(isValidPursuitAttribution({ ...attribution, segment: "salon" })).toBe(false);
  });

  it("requires packet attribution only for acquisition outreach tasks", () => {
    const externalFollowUp = { type: "follow_up", channel: "email" } as const;
    expect(activityNeedsPursuitAttribution(externalFollowUp, "follow_up")).toBe(true);
    expect(activityNeedsPursuitAttribution(externalFollowUp, "review_request")).toBe(false);
    expect(activityNeedsPursuitAttribution(externalFollowUp, "referral_request")).toBe(false);
    expect(activityNeedsPursuitAttribution(externalFollowUp, "client_success")).toBe(false);
    expect(activityNeedsPursuitAttribution({ type: "follow_up", channel: "internal" }, "follow_up")).toBe(false);
  });

  it("reuses attribution only from an earlier outbound on the exact contact route", () => {
    const attributed = {
      templateId: "restaurant_booking_fix_sop",
      templateVersion: "1.0.0",
      packetId,
      packetVersion: "1.0.0",
      segment: "restaurant",
      approvedAt: "2026-08-04T12:01:00.000Z",
    } as const;
    const activity = (activityId: string, contactId: string, occurredAt: string): DakotaActivity => ({
      activityId,
      taskId: "550e8400-e29b-41d4-a716-446655440010",
      contactId,
      channel: "email",
      type: "outreach",
      outcome: "sent",
      note: "Sent manually.",
      occurredAt,
      followUpAt: null,
      pursuitAttribution: attributed,
    });
    const activities = [
      activity("550e8400-e29b-41d4-a716-446655440011", contact.contactId, "2026-08-04T12:02:00.000Z"),
      activity("550e8400-e29b-41d4-a716-446655440012", "550e8400-e29b-41d4-a716-446655440002", "2026-08-04T12:03:00.000Z"),
    ];
    expect(latestPursuitAttribution(activities, contact.contactId, "2026-08-04T12:04:00.000Z")).toEqual(attributed);
    expect(latestPursuitAttribution(activities, "550e8400-e29b-41d4-a716-446655440099", "2026-08-04T12:04:00.000Z")).toBeNull();
    expect(latestPursuitAttribution(activities, contact.contactId, "2026-08-04T12:00:00.000Z")).toBeNull();
  });
});
