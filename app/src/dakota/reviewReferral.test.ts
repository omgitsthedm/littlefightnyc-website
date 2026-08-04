import { describe, expect, it } from "vitest";
import { GOOGLE_REVIEW_HREF } from "../data/contact";
import {
  DAKOTA_REFERRAL_DELAY_MS,
  DAKOTA_REVIEW_DELAY_MS,
  buildReferralRequestMessage,
  buildReferralRequestTask,
  buildReviewRequestMessage,
  buildReviewRequestTask,
  isRelationshipEmail,
} from "./reviewReferral";
import type { DakotaTask, DakotaVerifiedContact } from "./types";

const contact: DakotaVerifiedContact = {
  contactId: "550e8400-e29b-41d4-a716-446655440001",
  name: "Alex",
  role: "Owner",
  channel: "email",
  value: "alex@example.com",
  sourceUrl: "https://example.com/contact",
  verifiedAt: "2026-08-04",
  consentClassification: "existing_relationship",
};

describe("Dakota review and referral compounding loop", () => {
  it("queues one exact relationship-email review task 24 hours after an explicit positive outcome", () => {
    const positiveOutcomeAt = "2026-08-04T14:00:00.000Z";
    const review = buildReviewRequestTask({
      taskId: "550e8400-e29b-41d4-a716-446655440101",
      positiveOutcomeAt,
      contact,
      tasks: [],
    });
    expect(review).toMatchObject({
      type: "review_request",
      channel: "email",
      contactId: contact.contactId,
      createdAt: positiveOutcomeAt,
      dueAt: new Date(Date.parse(positiveOutcomeAt) + DAKOTA_REVIEW_DELAY_MS).toISOString(),
    });
    expect(buildReviewRequestTask({
      taskId: "550e8400-e29b-41d4-a716-446655440102",
      positiveOutcomeAt,
      contact,
      tasks: [review!],
    })).toBeNull();
  });

  it("never treats a public-business route, SMS number, or paid date as review permission", () => {
    expect(isRelationshipEmail({ ...contact, consentClassification: "public_business" })).toBe(false);
    expect(isRelationshipEmail({ ...contact, channel: "sms", value: "+12125550100" })).toBe(false);
    expect(buildReviewRequestTask({
      taskId: "550e8400-e29b-41d4-a716-446655440101",
      positiveOutcomeAt: "2026-08-04",
      contact: { ...contact, consentClassification: "public_business" },
      tasks: [],
    })).toBeNull();
  });

  it("anchors the one-time referral seven days after the same positive outcome", () => {
    const positiveOutcomeAt = "2026-08-04T14:00:00.000Z";
    const review = buildReviewRequestTask({
      taskId: "550e8400-e29b-41d4-a716-446655440101",
      positiveOutcomeAt,
      contact,
      tasks: [],
    });
    if (!review) throw new Error("review fixture did not build");
    const resolvedReview: DakotaTask = {
      ...review,
      status: "completed",
      resolvedAt: "2026-08-05T14:05:00.000Z",
      resolutionNote: "Review request sent manually by email.",
    };
    const referral = buildReferralRequestTask({
      taskId: "550e8400-e29b-41d4-a716-446655440102",
      createdAt: resolvedReview.resolvedAt!,
      reviewTask: resolvedReview,
      tasks: [resolvedReview],
    });
    expect(referral).toMatchObject({
      type: "referral_request",
      channel: "email",
      contactId: contact.contactId,
      dueAt: new Date(Date.parse(positiveOutcomeAt) + DAKOTA_REFERRAL_DELAY_MS).toISOString(),
    });
    expect(buildReferralRequestTask({
      taskId: "550e8400-e29b-41d4-a716-446655440103",
      createdAt: resolvedReview.resolvedAt!,
      reviewTask: resolvedReview,
      tasks: [resolvedReview, referral!],
    })).toBeNull();
  });

  it("uses the canonical review link once, no incentive, and a one-question referral ask", () => {
    const review = buildReviewRequestMessage("booking-path repair");
    expect(review.match(new RegExp(GOOGLE_REVIEW_HREF.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "gu"))).toHaveLength(1);
    expect(review).toContain("If we earned it");
    expect(review).not.toMatch(/discount|gift|reward|five.star/iu);
    const referral = buildReferralRequestMessage();
    expect((referral.match(/\?/gu) ?? [])).toHaveLength(1);
    expect(referral).toContain("— David, Little Fight NYC");
  });
});
