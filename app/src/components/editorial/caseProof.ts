import type { CaseProofStatus, CaseStudy } from "@/data/site";

const PROOF_STATUS_LABELS: Record<CaseProofStatus, string> = {
  "public-live": "Public work, live",
  "owned-live": "Little Fight product, live",
  "case-only": "Client work, case study only",
  "private-client": "Private client system",
  "private-concept": "Private client concept",
};

const PROOF_STATUS_PRIORITY: Record<CaseProofStatus, number> = {
  "public-live": 0,
  "owned-live": 1,
  "case-only": 2,
  "private-client": 3,
  "private-concept": 4,
};

const PROOF_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function caseProofLabel(study: CaseStudy) {
  return PROOF_STATUS_LABELS[study.showcase.proof.status];
}

export function caseProofPriority(study: CaseStudy) {
  return PROOF_STATUS_PRIORITY[study.showcase.proof.status];
}

export function formatCaseProofDate(date?: string) {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : PROOF_DATE_FORMATTER.format(parsed);
}

export function hasCaseCapture(study: CaseStudy) {
  return Boolean(study.showcase.proof.captureDate);
}
