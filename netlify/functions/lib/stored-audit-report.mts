import type { AuditData, AuditMetric } from "./templates.mts";

export interface StoredAuditReportMeta {
  domain?: unknown;
  companyName?: unknown;
  grade?: unknown;
  overallScore?: unknown;
  metrics?: unknown;
  measurementStatus?: unknown;
  createdAt?: unknown;
  expiresAt?: unknown;
}

const metricNames = ["performance", "seo", "accessibility", "bestPractices"] as const;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function auditDate(createdAt: unknown): string {
  const date = new Date(text(createdAt));
  if (Number.isNaN(date.getTime())) return "the original request";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function unavailableMetric(observedAt: string): AuditMetric {
  return {
    value: null,
    source: "google_pagespeed_lighthouse",
    observedAt,
    availability: "unavailable",
  };
}

function storedMetric(value: unknown, fallbackObservedAt: string): AuditMetric {
  if (!value || typeof value !== "object") return unavailableMetric(fallbackObservedAt);
  const candidate = value as Record<string, unknown>;
  const score = candidate.value;
  const observedAt = text(candidate.observedAt) || fallbackObservedAt;
  if (
    candidate.availability === "measured"
    && typeof score === "number"
    && Number.isFinite(score)
    && score >= 0
    && score <= 100
  ) {
    return {
      value: score,
      source: "google_pagespeed_lighthouse",
      observedAt,
      availability: "measured",
    };
  }
  return unavailableMetric(observedAt);
}

/**
 * Rebuilds only incomplete legacy reports at read time. The caller must retain
 * stored complete HTML, and this helper never writes to a Blob store.
 */
export function currentIncompleteReportData(
  meta: StoredAuditReportMeta | null,
  slug: string,
): AuditData | null {
  if (!meta || (meta.measurementStatus !== "unavailable" && meta.measurementStatus !== "partial")) {
    return null;
  }

  const domain = text(meta.domain);
  if (!domain) return null;

  const observedAt = text(meta.createdAt);
  const metaMetrics = meta.metrics && typeof meta.metrics === "object"
    ? meta.metrics as Record<string, unknown>
    : null;

  if (meta.measurementStatus === "partial" && !metaMetrics) return null;

  const metrics = Object.fromEntries(
    metricNames.map((name) => [
      name,
      meta.measurementStatus === "unavailable"
        ? unavailableMetric(observedAt)
        : storedMetric(metaMetrics?.[name], observedAt),
    ]),
  ) as AuditData["metrics"];

  if (meta.measurementStatus === "partial" && !Object.values(metrics).some((metric) => metric.availability === "measured")) {
    return null;
  }

  return {
    companyName: text(meta.companyName) || domain,
    domain,
    city: "",
    state: "",
    niche: "",
    email: "",
    slug,
    overallScore: null,
    grade: null,
    metrics,
    brandColors: {
      primary: "#F97316",
      accent: "#3B82F6",
      background: "#050507",
    },
    findings: [],
    ctaText: "",
    auditDate: auditDate(meta.createdAt),
    expiresAt: text(meta.expiresAt) || undefined,
  };
}
