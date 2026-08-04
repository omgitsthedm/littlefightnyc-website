import { createHash } from "node:crypto";

import {
  type DakotaAuditArea,
  type DakotaEmailDeliveryStatus,
  type DakotaRevenueBridgeServerMutation,
  type DakotaWebsiteAuditFinding,
  type DakotaWebsiteAuditGeneratedPatch,
  type DakotaWebsiteAuditReconciliationPatch,
} from "./revenue-bridge-schema.ts";
import {
  applyDakotaRevenueBridgeServerMutations,
  type DakotaRevenueBridgeMutationResult,
  type DakotaRevenueBridgeStoreDependencies,
} from "./revenue-bridge-store.ts";

const WEBSITE_AUDIT_SOURCE = "inbound:website-audit";
export const WEBSITE_AUDIT_CONFIDENT_ENGAGEMENT_MIN_SCROLL = 25;
export const WEBSITE_AUDIT_CONFIDENT_ENGAGEMENT_MIN_SECONDS = 20;

export function isConfidentWebsiteAuditEngagement(input: {
  maxScrollDepth: number;
  maxTimeOnPageSeconds: number;
}): boolean {
  return Number.isFinite(input.maxScrollDepth) &&
    Number.isFinite(input.maxTimeOnPageSeconds) &&
    input.maxScrollDepth >= WEBSITE_AUDIT_CONFIDENT_ENGAGEMENT_MIN_SCROLL &&
    input.maxTimeOnPageSeconds >= WEBSITE_AUDIT_CONFIDENT_ENGAGEMENT_MIN_SECONDS;
}

export interface WebsiteAuditFindingInput {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
}

function plain(value: string, maximumLength: number): string {
  return value
    .replace(/[\u0000-\u001f\u007f<>]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, maximumLength);
}

function stableId(kind: string, slug: string, value = ""): string {
  return createHash("sha256")
    .update(`${kind}\u0000${slug}\u0000${value}`)
    .digest("hex")
    .slice(0, 32);
}

function findingArea(value: string): DakotaAuditArea {
  const text = value.toLowerCase();
  if (/access|contrast|aria|label|keyboard/u.test(text)) return "accessibility";
  if (/search|seo|title|description|canonical|index/u.test(text)) return "seo";
  if (/performance|speed|image|javascript|css|render|cache/u.test(text)) return "performance";
  if (/conversion|contact|booking|cta|checkout|customer/u.test(text)) return "conversion";
  if (/content|copy|message|headline/u.test(text)) return "content";
  if (/workflow|support|operation|process/u.test(text)) return "operations";
  return "best_practices";
}

export function mapWebsiteAuditFindings(
  findings: readonly WebsiteAuditFindingInput[],
): DakotaWebsiteAuditFinding[] {
  return findings.slice(0, 16).map((finding) => {
    const summary = plain(
      [finding.title, finding.description].filter(Boolean).join(": "),
      1_000,
    ) || "The audit returned a finding that needs operator review.";
    return {
      finding_id: stableId("finding", summary, finding.severity),
      area: findingArea(summary),
      severity: finding.severity === "critical"
        ? "high"
        : finding.severity === "warning"
          ? "medium"
          : "low",
      summary,
    };
  });
}

export function normalizedWebsiteAuditGrade(
  grade: string | null,
): DakotaWebsiteAuditGeneratedPatch["grade"] {
  const letter = grade?.trim().toUpperCase().slice(0, 1) ?? "";
  return ["A", "B", "C", "D", "F"].includes(letter)
    ? letter as DakotaWebsiteAuditGeneratedPatch["grade"]
    : null;
}

export function websiteAuditCandidateKey(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{6,126}$/u.test(normalized)) {
    throw new TypeError("Website Audit report ID is invalid.");
  }
  return `${WEBSITE_AUDIT_SOURCE}:${normalized}`;
}

function providerState(
  provider: "website_audit",
  health: "healthy" | "degraded" | "blocked",
  detail: string,
  checkedAt: string,
  consecutiveFailures: number,
): DakotaRevenueBridgeServerMutation {
  return {
    type: "update_provider",
    provider_state: {
      provider,
      health,
      detail,
      cursor: null,
      checked_at: checkedAt,
      consecutive_failures: consecutiveFailures,
    },
  };
}

function patchMutation(
  slug: string,
  patch: DakotaWebsiteAuditReconciliationPatch,
): DakotaRevenueBridgeServerMutation {
  return {
    type: "reconcile_website_audit",
    candidate_key: websiteAuditCandidateKey(slug),
    patch,
  };
}

export function reconcileWebsiteAuditRequested(
  input: { slug: string; domain: string; requestedAt: string },
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  return applyDakotaRevenueBridgeServerMutations([
    patchMutation(input.slug, {
      patch_type: "requested",
      report_id: input.slug,
      domain: input.domain,
      requested_at: input.requestedAt,
    }),
    providerState(
      "website_audit",
      "healthy",
      "Audit request accepted; report generation is in progress.",
      input.requestedAt,
      0,
    ),
  ], dependencies);
}

export function reconcileWebsiteAuditGenerated(
  input: {
    slug: string;
    patch: Omit<DakotaWebsiteAuditGeneratedPatch, "patch_type" | "report_id">;
  },
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  const candidateKey = websiteAuditCandidateKey(input.slug);
  const generatedAt = input.patch.generated_at;
  return applyDakotaRevenueBridgeServerMutations([
    patchMutation(input.slug, {
      patch_type: "generated",
      report_id: input.slug,
      ...input.patch,
    }),
    {
      type: "append_external_event",
      candidate_key: candidateKey,
      event: {
        event_id: stableId("generated", input.slug),
        provider: "website_audit",
        kind: "audit_completed",
        summary: "Website Audit report generated and ready for operator review.",
        external_ref: input.slug,
        occurred_at: generatedAt,
      },
    },
    {
      type: "append_alert",
      candidate_key: candidateKey,
      alert: {
        alert_id: stableId("generated-alert", input.slug),
        provider: "website_audit",
        kind: "audit_ready",
        severity: "warning",
        message: "A requested Website Audit is ready. Review the report and the exact reply route.",
      },
    },
    providerState(
      "website_audit",
      "healthy",
      "The latest Website Audit report was generated successfully.",
      generatedAt,
      0,
    ),
  ], dependencies);
}

export function reconcileWebsiteAuditFailed(
  input: { slug: string; domain: string; failedAt: string; reason?: string },
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  const candidateKey = websiteAuditCandidateKey(input.slug);
  return applyDakotaRevenueBridgeServerMutations([
    patchMutation(input.slug, {
      patch_type: "failed",
      report_id: input.slug,
      domain: input.domain,
      failed_at: input.failedAt,
      failure_reason: plain(input.reason || "audit_pipeline_failed", 1_000),
    }),
    {
      type: "append_alert",
      candidate_key: candidateKey,
      alert: {
        alert_id: stableId("failed-alert", input.slug),
        provider: "website_audit",
        kind: "provider_degraded",
        severity: "critical",
        message: "A requested Website Audit failed to finish. Review the retained inbound record and retry manually.",
      },
    },
    providerState(
      "website_audit",
      "degraded",
      "The latest Website Audit pipeline did not finish.",
      input.failedAt,
      1,
    ),
  ], dependencies);
}

export function reconcileWebsiteAuditDelivery(
  input: {
    slug: string;
    domain: string;
    status: Exclude<DakotaEmailDeliveryStatus, "unknown" | "pending">;
    updatedAt: string;
    failureReason?: string;
  },
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  const failed = input.status === "failed";
  const sent = input.status === "sent";
  return applyDakotaRevenueBridgeServerMutations([
    patchMutation(input.slug, {
      patch_type: "delivery",
      report_id: input.slug,
      domain: input.domain,
      status: input.status,
      updated_at: input.updatedAt,
      sent_at: sent ? input.updatedAt : null,
      failed_at: failed ? input.updatedAt : null,
      failure_reason: failed
        ? plain(input.failureReason || "email_delivery_failed", 1_000)
        : "",
    }),
  ], dependencies);
}

export function reconcileWebsiteAuditEngagement(
  input: {
    slug: string;
    domain: string;
    observedAt: string;
    firstViewAt: string;
    lastViewAt: string;
    totalViews: number;
    maxScrollDepth: number;
    maxTimeOnPageSeconds: number;
  },
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  if (!isConfidentWebsiteAuditEngagement(input)) {
    throw new TypeError(
      "Website Audit engagement did not meet the sustained browser-confidence threshold.",
    );
  }
  const candidateKey = websiteAuditCandidateKey(input.slug);
  const mutations: DakotaRevenueBridgeServerMutation[] = [
    patchMutation(input.slug, {
      patch_type: "engagement",
      report_id: input.slug,
      domain: input.domain,
      observed_at: input.observedAt,
      first_view_at: input.firstViewAt,
      last_view_at: input.lastViewAt,
      total_views: input.totalViews,
      max_scroll_depth: Math.round(input.maxScrollDepth),
      max_time_on_page_seconds: Math.round(input.maxTimeOnPageSeconds),
    }),
  ];

  mutations.push(
    {
      type: "append_external_event",
      candidate_key: candidateKey,
      event: {
        event_id: stableId("confident-browser-engagement", input.slug),
        provider: "website_audit",
        kind: "provider_notice",
        summary: "A same-origin Website Audit browser beacon crossed the sustained-engagement threshold. This is observed activity, not verified identity or buying intent.",
        external_ref: input.slug,
        occurred_at: input.observedAt,
      },
    },
    {
      type: "append_alert",
      candidate_key: candidateKey,
      alert: {
        alert_id: stableId("confident-browser-engagement-alert", input.slug),
        provider: "website_audit",
        kind: "new_external_event",
        severity: "warning",
        message: "A Website Audit report showed sustained browser engagement. Review the consented follow-up task; identity and intent remain unverified.",
      },
    },
  );

  return applyDakotaRevenueBridgeServerMutations(mutations, dependencies);
}
