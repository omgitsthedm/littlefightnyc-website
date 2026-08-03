import type {
  Candidate,
  OperatorRecord,
  OperatorRecordInput,
  OperatorStatus,
} from "./types";

export const API_OPERATOR_STATE = "/api/dakota/operator-state";

export const EMPTY_OPERATOR_RECORD: OperatorRecordInput = {
  identity: { businessName: "", source: "", sourceId: "" },
  status: "early_signal",
  notes: "",
  verifiedPain: "",
  offerFit: "",
  nextAction: "",
  dueDate: "",
  estimatedValue: null,
  actualRevenue: null,
  winLossReason: "",
  proof: "",
  draft: "",
};

export const STATUS_LABELS: Record<OperatorStatus, string> = {
  early_signal: "Early signal",
  research_ready: "Research ready",
  pursuit_ready: "Pursuit ready — approved",
  pursuing: "Pursuing manually",
  replied: "Replied",
  meeting: "Meeting",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
  snoozed: "Snoozed",
  not_fit: "Not a fit",
  do_not_contact: "Do not contact",
};

export const HUMAN_APPROVED_STATUSES = new Set<OperatorStatus>([
  "pursuit_ready",
  "pursuing",
  "replied",
  "meeting",
  "proposal",
  "won",
  "lost",
]);

const CLOSED_STATUSES = new Set<OperatorStatus>([
  "won",
  "lost",
  "not_fit",
  "do_not_contact",
]);

const NON_PURSUIT_STATUSES = new Set<OperatorStatus>([
  "lost",
  "not_fit",
  "do_not_contact",
]);

export interface ScoreLayer {
  value: number;
  label: string;
  note: string;
}

export interface CandidateAssessment {
  signal: ScoreLayer;
  identity: ScoreLayer;
  pursuit: ScoreLayer;
  qualified: boolean;
  closed: boolean;
}

export interface SourceHealth {
  level: "current" | "aging" | "stale" | "unknown";
  title: string;
  message: string;
  ageHours: number | null;
}

export interface OfferSuggestion {
  name: string;
  reason: string;
}

export interface OperatorReference {
  label: string;
  url: string;
  note: string;
}

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function candidateKey(candidate: Candidate): string {
  return `${candidate.source}:${candidate.source_id}`.trim().toLowerCase();
}

export function isValidCandidateKey(value: string): boolean {
  return value.length > 2 && value.length <= 240 && /^[a-z0-9][a-z0-9._:-]*$/.test(value);
}

function scoreLabel(value: number): string {
  if (value >= 85) return "Strong";
  if (value >= 65) return "Usable";
  if (value >= 40) return "Partial";
  return "Thin";
}

function listParts(value: string): string[] {
  return value
    .split(/[|;,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function identityScore(candidate: Candidate): number {
  let score = 0;
  if (candidate.source && candidate.source_id) score += 25;
  if (candidate.business_name) score += 20;
  if (candidate.city || candidate.county_or_borough || candidate.state) score += 15;
  if (candidate.filed_at) score += 10;
  if (candidate.category) score += 10;
  if (candidate.phone) score += 10;
  if (candidate.verified_url) score += 10;
  return clampScore(score);
}

function pursuitEvidenceScore(candidate: Candidate, record: OperatorRecordInput): number {
  let score = 0;
  if (candidate.verified_url) score += 12;
  if (candidate.phone) score += 8;
  if (candidate.diagnosis) score += 8;
  if (listParts(candidate.score_reasons).length > 0) score += 7;
  if (listParts(candidate.missing_pieces).length === 0) score += 5;
  if (candidate.psi_status && candidate.psi_status.toLowerCase() !== "not_run") score += 5;
  if (candidate.psi_mobile_performance !== null) score += 5;
  if (record.verifiedPain.trim()) score += 15;
  if (record.offerFit.trim()) score += 12;
  if (record.nextAction.trim()) score += 8;
  if (record.proof.trim()) score += 5;

  const statusWeight: Partial<Record<OperatorStatus, number>> = {
    research_ready: 5,
    pursuit_ready: 15,
    pursuing: 18,
    replied: 22,
    meeting: 26,
    proposal: 30,
    won: 35,
    snoozed: 2,
  };
  score += statusWeight[record.status] ?? 0;

  if (NON_PURSUIT_STATUSES.has(record.status)) return 0;
  if (!HUMAN_APPROVED_STATUSES.has(record.status)) return Math.min(49, clampScore(score));
  return clampScore(score);
}

export function assessCandidate(
  candidate: Candidate,
  record: OperatorRecordInput = EMPTY_OPERATOR_RECORD,
): CandidateAssessment {
  const signal = clampScore(candidate.score);
  const identity = identityScore(candidate);
  const pursuit = pursuitEvidenceScore(candidate, record);
  const qualified =
    HUMAN_APPROVED_STATUSES.has(record.status) &&
    Boolean(record.verifiedPain.trim()) &&
    Boolean(record.offerFit.trim());

  return {
    signal: {
      value: signal,
      label: scoreLabel(signal),
      note: "Upstream public-source ranking; not buyer intent.",
    },
    identity: {
      value: identity,
      label: scoreLabel(identity),
      note: "Record completeness; not identity verification.",
    },
    pursuit: {
      value: pursuit,
      label: qualified ? "Human approved" : CLOSED_STATUSES.has(record.status) ? "Closed" : "Not qualified",
      note: qualified
        ? "Evidence plus an explicit operator decision."
        : "Capped below 50 until verified pain, offer fit, and approval exist.",
    },
    qualified,
    closed: CLOSED_STATUSES.has(record.status),
  };
}

export function getSourceHealth(generatedAt: string, now = new Date()): SourceHealth {
  const generated = new Date(generatedAt);
  if (Number.isNaN(generated.getTime())) {
    return {
      level: "unknown",
      title: "Freshness unknown",
      message: "The queue did not provide a valid generation time. Verify the local run before acting.",
      ageHours: null,
    };
  }

  const ageHours = Math.max(0, (now.getTime() - generated.getTime()) / 3_600_000);
  if (ageHours <= 36) {
    return {
      level: "current",
      title: "Source snapshot current",
      message: "Generated within the last 36 hours. Individual evidence can still be incomplete.",
      ageHours,
    };
  }
  if (ageHours <= 72) {
    return {
      level: "aging",
      title: "Source snapshot aging",
      message: "More than 36 hours old. Refresh Dakota before treating time-sensitive details as current.",
      ageHours,
    };
  }
  return {
    level: "stale",
    title: "Source snapshot stale",
    message: "More than 72 hours old. Keep the desk in research-only mode until a fresh run arrives.",
    ageHours,
  };
}

export function sourceCoverage(records: Candidate[]): string {
  const sources = new Set(records.map((record) => record.source).filter(Boolean));
  if (sources.size === 0) return "No source labels were provided.";
  if (sources.size === 1) return "Single-source queue. No cross-source corroboration is implied.";
  return `${sources.size} public source systems represented. Records are still evaluated individually.`;
}

export function storefrontMoneyPath(category: string): string {
  const value = category.toLowerCase();
  if (/(restaurant|cafe|coffee|bar|bakery|food|cater)/.test(value)) return "Visits · reservations · orders";
  if (/(salon|spa|barber|beauty|nail|hair)/.test(value)) return "Bookings · repeat visits";
  if (/(retail|shop|store|boutique|jewel|apparel)/.test(value)) return "Visits · orders · repeat customers";
  if (/(medical|dental|health|therapy|clinic|wellness)/.test(value)) return "Appointments · calls · referrals";
  if (/(law|legal|account|consult|professional|financial|insurance)/.test(value)) return "Consultations · qualified inquiries";
  if (/(contract|plumb|electric|repair|construction|clean|home|moving)/.test(value)) return "Calls · quote requests · booked jobs";
  if (/(fitness|gym|studio|school|education|class)/.test(value)) return "Classes · memberships · inquiries";
  return "Inquiries · bookings · visits — verify the primary customer action";
}

export function offerSuggestions(candidate: Candidate): OfferSuggestion[] {
  if (!candidate.verified_url) {
    return [
      {
        name: "New business launch",
        reason: "No website is verified in the current queue. Confirm that gap before recommending a build.",
      },
      {
        name: "Google presence setup",
        reason: "A new public record can justify checking profile, hours, category, and customer-path readiness.",
      },
    ];
  }

  const suggestions: OfferSuggestion[] = [
    {
      name: "Operator website review",
      reason: "A verified URL exists. Inspect the real mobile customer path without submitting an inbound lead form.",
    },
  ];
  if (
    candidate.psi_mobile_performance !== null &&
    candidate.psi_mobile_performance < 60
  ) {
    suggestions.push({
      name: "Conversion repair",
      reason: `The queue records mobile performance at ${Math.round(candidate.psi_mobile_performance)}. Verify the current page before citing it.`,
    });
  }
  return suggestions;
}

export function proofReference(candidate: Candidate): OperatorReference {
  const category = candidate.category.toLowerCase();
  if (/(salon|spa|barber|beauty|nail|hair)/.test(category)) {
    return {
      label: "Hair By Rachel Charles case study",
      url: "https://www.littlefightnyc.com/case-studies/hair-by-rachel-charles/",
      note: "Possible salon proof match; verify that the observed problem is actually comparable.",
    };
  }
  const namedMatch: OperatorReference | null =
    /(restaurant|cafe|coffee|bar|bakery|food|cater)/.test(category)
      ? { label: "Brothers Pizzeria proof candidate", url: "https://www.littlefightnyc.com/case-studies/brothers-pizzeria/", note: "Category-based hypothesis only; verify the problem match before use." }
      : /(retail|shop|store|boutique|jewel|apparel)/.test(category)
        ? { label: "Army & Navy Bags proof candidate", url: "https://www.littlefightnyc.com/case-studies/army-navy-bags/", note: "Category-based hypothesis only; verify the problem match before use." }
        : /(contract|paint|plumb|electric|repair|construction|clean|home|moving)/.test(category)
          ? { label: "Chromatic Painting proof candidate", url: "https://www.littlefightnyc.com/case-studies/chromatic-painting-design/", note: "Category-based hypothesis only; verify the problem match before use." }
          : /(music|entertainment|record|artist|venue)/.test(category)
            ? { label: "Legacy Music Group proof candidate", url: "https://www.littlefightnyc.com/case-studies/legacy-music-group/", note: "Category-based hypothesis only; verify the problem match before use." }
            : /(operations|agency|consult|professional)/.test(category)
              ? { label: "Public House Creative proof candidate", url: "https://www.littlefightnyc.com/case-studies/public-house-creative/", note: "Category-based hypothesis only; verify the problem match before use." }
              : /(law|legal|account|financial|fund|insurance)/.test(category)
                ? { label: "Grand Funding proof candidate", url: "https://www.littlefightnyc.com/case-studies/grand-funding-llc/", note: "Category-based hypothesis only; verify the problem match before use." }
                : null;
  if (namedMatch) {
    return {
      ...namedMatch,
      note: `${namedMatch.note} Confirm public-release status and owner approval.`,
    };
  }
  return {
    label: "Case study library",
    url: "https://www.littlefightnyc.com/case-studies/",
    note: "No deterministic match. Choose only real, owner-approved proof that fits the verified problem.",
  };
}

export function isHumanApprovedRecord(record: OperatorRecordInput): boolean {
  return (
    HUMAN_APPROVED_STATUSES.has(record.status) &&
    Boolean(record.verifiedPain.trim()) &&
    Boolean(record.offerFit.trim())
  );
}

export function countsTowardWeeklyNorthStar(record: OperatorRecord, now = new Date()): boolean {
  const approvedAt = Date.parse(record.milestones?.humanApprovedAt ?? "");
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return Number.isFinite(approvedAt) && approvedAt >= sevenDaysAgo && approvedAt <= now.getTime();
}

export function currency(value: number | null): string {
  if (value === null) return "Not recorded";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function operatorRecordFor(
  records: Record<string, OperatorRecord>,
  candidate: Candidate,
): OperatorRecordInput {
  const saved = records[candidateKey(candidate)];
  if (saved) {
    return {
      identity: { ...saved.identity },
      status: saved.status,
      notes: saved.notes,
      verifiedPain: saved.verifiedPain,
      offerFit: saved.offerFit,
      nextAction: saved.nextAction,
      dueDate: saved.dueDate,
      estimatedValue: saved.estimatedValue,
      actualRevenue: saved.actualRevenue,
      winLossReason: saved.winLossReason,
      proof: saved.proof,
      draft: saved.draft,
    };
  }
  return {
    ...EMPTY_OPERATOR_RECORD,
    identity: {
      businessName: candidate.business_name,
      ...(candidate.dba ? { dba: candidate.dba } : {}),
      ...(candidate.category ? { category: candidate.category } : {}),
      ...(candidate.city ? { city: candidate.city } : {}),
      ...(candidate.county_or_borough ? { borough: candidate.county_or_borough } : {}),
      source: candidate.source,
      sourceId: candidate.source_id,
      ...(candidate.verified_url ? { verifiedUrl: candidate.verified_url } : {}),
    },
  };
}

export function candidateFromOperatorRecord(
  key: string,
  record: OperatorRecord,
): Candidate | null {
  const normalizedKey = key.toLowerCase();
  if (!isValidCandidateKey(normalizedKey)) return null;
  const expectedKey = `${record.identity.source}:${record.identity.sourceId}`.toLowerCase();
  if (expectedKey !== normalizedKey || !record.identity.businessName.trim()) return null;

  return {
    rank: 0,
    score: 0,
    business_name: record.identity.businessName,
    dba: record.identity.dba ?? "",
    source: record.identity.source,
    source_id: record.identity.sourceId,
    filed_at: "",
    category: record.identity.category ?? "",
    phone: "",
    address: "",
    city: record.identity.city ?? "",
    state: "",
    postal_code: "",
    county_or_borough: record.identity.borough ?? "",
    verified_url: record.identity.verifiedUrl ?? "",
    domain_status: record.identity.verifiedUrl ? "operator_verified" : "not_verified",
    psi_status: "not_run",
    psi_mobile_performance: null,
    missing_pieces: "No current queue record; re-verify time-sensitive public evidence",
    diagnosis: "Saved private operator record. Re-verify public evidence before the next manual step.",
    score_version: "saved_operator_record",
    score_reasons: "Saved by the authorized operator",
  };
}
