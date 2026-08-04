import { GOOGLE_REVIEW_HREF } from "../data/contact";
import type { DakotaTask, DakotaVerifiedContact } from "./types";

export const DAKOTA_REVIEW_DELAY_MS = 24 * 60 * 60_000;
export const DAKOTA_REFERRAL_DELAY_MS = 7 * 24 * 60 * 60_000;

export const DAKOTA_REVIEW_TASK_TITLE = "Send the approved Little Fight NYC review request after the verified result";
export const DAKOTA_REFERRAL_TASK_TITLE = "Send the one-time referral ask after the verified positive outcome";

export function isRelationshipEmail(contact: DakotaVerifiedContact | null | undefined): contact is DakotaVerifiedContact {
  return Boolean(
    contact &&
    contact.channel === "email" &&
    (contact.consentClassification === "explicit_inquiry" || contact.consentClassification === "existing_relationship"),
  );
}

export function hasLifecycleTask(tasks: readonly DakotaTask[], type: "review_request" | "referral_request"): boolean {
  return tasks.some((task) => task.type === type);
}

function exactFutureIso(anchor: string, delay: number): string | null {
  const milliseconds = Date.parse(anchor);
  return Number.isFinite(milliseconds) ? new Date(milliseconds + delay).toISOString() : null;
}

export function buildReviewRequestTask({
  taskId,
  positiveOutcomeAt,
  contact,
  tasks,
}: {
  taskId: string;
  positiveOutcomeAt: string;
  contact: DakotaVerifiedContact | null;
  tasks: readonly DakotaTask[];
}): DakotaTask | null {
  const dueAt = exactFutureIso(positiveOutcomeAt, DAKOTA_REVIEW_DELAY_MS);
  if (!dueAt || !isRelationshipEmail(contact) || hasLifecycleTask(tasks, "review_request")) return null;
  return {
    taskId,
    type: "review_request",
    status: "open",
    title: DAKOTA_REVIEW_TASK_TITLE,
    dueAt,
    contactId: contact.contactId,
    channel: "email",
    createdAt: positiveOutcomeAt,
    resolvedAt: null,
    resolutionNote: "",
  };
}

export function buildReferralRequestTask({
  taskId,
  createdAt,
  reviewTask,
  tasks,
}: {
  taskId: string;
  createdAt: string;
  reviewTask: DakotaTask;
  tasks: readonly DakotaTask[];
}): DakotaTask | null {
  const dueAt = exactFutureIso(reviewTask.createdAt, DAKOTA_REFERRAL_DELAY_MS);
  if (
    !dueAt ||
    reviewTask.type !== "review_request" ||
    reviewTask.status === "open" ||
    reviewTask.channel !== "email" ||
    reviewTask.contactId === null ||
    hasLifecycleTask(tasks, "referral_request")
  ) return null;
  return {
    taskId,
    type: "referral_request",
    status: "open",
    title: DAKOTA_REFERRAL_TASK_TITLE,
    dueAt,
    contactId: reviewTask.contactId,
    channel: "email",
    createdAt,
    resolvedAt: null,
    resolutionNote: "",
  };
}

function compactJobLabel(value: string): string {
  const normalized = value.replace(/\s+/gu, " ").trim();
  if (!normalized) return "the work";
  if (normalized.length <= 96) return normalized;
  return `${normalized.slice(0, 95).replace(/\s+\S*$/u, "").trim()}…`;
}

export function buildReviewRequestMessage(jobLabel: string): string {
  return [
    `Thanks for trusting Little Fight NYC with ${compactJobLabel(jobLabel)}. If we earned it, a quick Google review helps other NYC owners find real help: ${GOOGLE_REVIEW_HREF}`,
    "Mentioning what we fixed and your neighborhood genuinely helps.",
    "— David, Little Fight NYC",
  ].join("\n\n");
}

export function buildReferralRequestMessage(): string {
  return [
    "Know another NYC owner who needs this? Send them my way — I’ll take care of them.",
    "— David, Little Fight NYC",
  ].join("\n\n");
}
