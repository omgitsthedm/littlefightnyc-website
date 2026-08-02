import { getDatabase } from "@netlify/database";

export type AuditAnalysisSource = "netlify_ai_gateway" | "fallback";
export type AuditPageSpeedSource =
  | "google_pagespeed"
  | "unavailable"
  | "fallback";
export type AuditEmailDeliveryStatus =
  | "pending"
  | "sent"
  | "not_configured"
  | "failed";

export interface AuditLeadInput {
  auditSlug: string;
  email: string;
  domain: string;
  companyName: string;
  niche: string;
  city: string;
  state: string;
  overallScore: number | null;
  grade: string | null;
  reportUrl: string;
  reportExpiresAt: Date;
  analysisSource: AuditAnalysisSource;
  pagespeedSource: AuditPageSpeedSource;
  privacyNoticeVersion: string;
}

export type AuditDatabaseErrorLabel =
  | "configuration_error"
  | "connection_error"
  | "timeout_error"
  | "database_error";

const DATABASE_TIMEOUT_CODES = new Set([
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
]);
const DATABASE_CONNECTION_CODES = new Set([
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
]);

/** Durable CRM-style lead records belong only to the published production site. */
export function shouldPersistAuditLead(
  deployContext: string | undefined,
): boolean {
  return deployContext === "production";
}

/**
 * Return an operationally useful database failure label without ever returning
 * an exception message, SQL text, or query parameters. `@netlify/database`
 * wraps driver failures in WaddlerQueryError, whose message and `params`
 * property contain every bound value, including the requester's email address.
 */
export function safeDatabaseErrorLabel(
  error: unknown,
): AuditDatabaseErrorLabel {
  let current: unknown = error;
  for (let depth = 0; depth < 3; depth += 1) {
    if (!current || typeof current !== "object") break;

    try {
      const record = current as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name : "";
      const code = typeof record.code === "string" ? record.code : "";

      if (name === "MissingDatabaseConnectionError") {
        return "configuration_error";
      }
      if (
        name === "AbortError" ||
        name === "TimeoutError" ||
        DATABASE_TIMEOUT_CODES.has(code)
      ) {
        return "timeout_error";
      }
      if (DATABASE_CONNECTION_CODES.has(code)) return "connection_error";

      current = record.cause;
    } catch {
      return "database_error";
    }
  }

  return "database_error";
}

function boundedText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function scoreBand(
  overallScore: number | null,
): "hot" | "warm" | "cold" | null {
  if (overallScore === null) return null;
  if (overallScore >= 80) return "hot";
  if (overallScore >= 60) return "warm";
  return "cold";
}

/**
 * Persist the minimal follow-up record for an Audit Lab submission.
 *
 * The report HTML, view fingerprints, and engagement history stay in expiring
 * Blobs. This table is intentionally limited to the lead fields Little Fight
 * needs to follow up. A retry refreshes audit-derived fields but never resets
 * an operator's pipeline stage, notes, original submission time, or retention
 * deadline.
 */
export async function upsertAuditLead(input: AuditLeadInput): Promise<void> {
  const { sql } = getDatabase();
  const email = boundedText(input.email.toLowerCase(), 254);
  const domain = boundedText(input.domain.toLowerCase(), 253);
  const companyName = boundedText(input.companyName, 200) || domain;
  const niche = boundedText(input.niche, 120);
  const city = boundedText(input.city, 120);
  const state = boundedText(input.state, 40);
  const reportUrl = boundedText(input.reportUrl, 2048);
  const privacyNoticeVersion = boundedText(input.privacyNoticeVersion, 32);
  const band = scoreBand(input.overallScore);

  await sql`
    INSERT INTO audit_leads (
      audit_slug,
      email,
      domain,
      company_name,
      niche,
      city,
      state,
      overall_score,
      grade,
      score_band,
      report_url,
      report_expires_at,
      analysis_source,
      pagespeed_source,
      email_delivery_status,
      privacy_notice_version
    ) VALUES (
      ${input.auditSlug},
      ${email},
      ${domain},
      ${companyName},
      ${niche},
      ${city},
      ${state},
      ${input.overallScore},
      ${input.grade},
      ${band},
      ${reportUrl},
      ${input.reportExpiresAt},
      ${input.analysisSource},
      ${input.pagespeedSource},
      'pending',
      ${privacyNoticeVersion}
    )
    ON CONFLICT (audit_slug) DO UPDATE SET
      email = EXCLUDED.email,
      domain = EXCLUDED.domain,
      company_name = EXCLUDED.company_name,
      niche = EXCLUDED.niche,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      overall_score = EXCLUDED.overall_score,
      grade = EXCLUDED.grade,
      score_band = EXCLUDED.score_band,
      report_url = EXCLUDED.report_url,
      report_expires_at = EXCLUDED.report_expires_at,
      analysis_source = EXCLUDED.analysis_source,
      pagespeed_source = EXCLUDED.pagespeed_source,
      privacy_notice_version = EXCLUDED.privacy_notice_version
  `;
}

export async function updateAuditLeadEmailDelivery(
  auditSlug: string,
  status: Exclude<AuditEmailDeliveryStatus, "pending">,
): Promise<void> {
  const { sql } = getDatabase();
  await sql`
    UPDATE audit_leads
    SET
      email_delivery_status = ${status},
      email_sent_at = CASE
        WHEN ${status} = 'sent' THEN NOW()
        ELSE email_sent_at
      END
    WHERE audit_slug = ${auditSlug}
  `;
}

export async function purgeExpiredAuditLeads(
  now: Date = new Date(),
): Promise<number> {
  const { sql } = getDatabase();
  const deleted = await sql<{ audit_slug: string }>`
    DELETE FROM audit_leads
    WHERE retention_until <= ${now}
    RETURNING audit_slug
  `;
  return deleted.length;
}
