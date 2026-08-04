import { isFullyPaidRecord } from "./revenue";
import type {
  Candidate,
  DakotaRevenueBridgeEnvelope,
  OperatorRecord,
} from "./types";

export interface DakotaRevenueFunnel {
  signals: number;
  reviewed: number;
  pursue: number;
  contacted: number;
  replied: number;
  meetings: number;
  proposals: number;
  signed: number;
  paid: number;
  pendingExternalReview: number;
  confirmedExternalEvents: number;
  suggestedEvidence: number;
  confirmedEvidence: number;
  openAlerts: number;
  criticalAlerts: number;
  auditsReady: number;
  offersSelected: number;
}

export interface DakotaProvenanceRow {
  label: string;
  records: number;
  reviewed: number;
  pursue: number;
  proposals: number;
  signed: number;
  paid: number;
  paidAmount: number;
}

export interface DakotaRevenueMetrics {
  funnel: DakotaRevenueFunnel;
  sourceRows: DakotaProvenanceRow[];
  offerRows: DakotaProvenanceRow[];
}

function hasActivity(record: OperatorRecord | undefined, type: string): boolean {
  return Boolean(record?.activities.some((activity) => activity.type === type));
}

function contacted(record: OperatorRecord | undefined): boolean {
  return Boolean(record?.milestones?.firstContactedAt || hasActivity(record, "outreach"));
}

function replied(record: OperatorRecord | undefined): boolean {
  return Boolean(record?.milestones?.repliedAt || hasActivity(record, "reply"));
}

function met(record: OperatorRecord | undefined): boolean {
  return Boolean(record?.milestones?.meetingAt || hasActivity(record, "meeting"));
}

function proposed(record: OperatorRecord | undefined): boolean {
  return Boolean(record?.milestones?.proposalAt || record?.commercialClose.proposalSentDate || hasActivity(record, "proposal_sent"));
}

function signed(record: OperatorRecord | undefined): boolean {
  return Boolean(record?.milestones?.wonAt || record?.commercialClose.signedDate || hasActivity(record, "contract_signed"));
}

function reviewed(disposition: string | undefined): boolean {
  return Boolean(disposition && disposition !== "unreviewed");
}

function makeRow(label: string): DakotaProvenanceRow {
  return { label, records: 0, reviewed: 0, pursue: 0, proposals: 0, signed: 0, paid: 0, paidAmount: 0 };
}

function recordIntoRow(
  row: DakotaProvenanceRow,
  disposition: string | undefined,
  record: OperatorRecord | undefined,
): void {
  row.records += 1;
  if (reviewed(disposition)) row.reviewed += 1;
  if (disposition === "pursue") row.pursue += 1;
  if (proposed(record)) row.proposals += 1;
  if (signed(record)) row.signed += 1;
  if (record && isFullyPaidRecord(record)) row.paid += 1;
  row.paidAmount += record?.commercialClose.amountPaid ?? 0;
}

function sortRows(rows: Map<string, DakotaProvenanceRow>): DakotaProvenanceRow[] {
  return [...rows.values()].sort((left, right) =>
    right.paidAmount - left.paidAmount
    || right.pursue - left.pursue
    || right.reviewed - left.reviewed
    || left.label.localeCompare(right.label));
}

export function buildDakotaRevenueMetrics(
  queueRecords: readonly Candidate[],
  operatorRecords: Record<string, OperatorRecord>,
  bridge: DakotaRevenueBridgeEnvelope | null,
): DakotaRevenueMetrics {
  const queueByKey = new Map(queueRecords.map((candidate) => [`${candidate.source}:${candidate.source_id}`.toLowerCase(), candidate]));
  const keys = new Set([...queueByKey.keys(), ...Object.keys(operatorRecords), ...Object.keys(bridge?.records ?? {})]);
  const sourceRows = new Map<string, DakotaProvenanceRow>();
  const offerRows = new Map<string, DakotaProvenanceRow>();
  const funnel: DakotaRevenueFunnel = {
    signals: keys.size,
    reviewed: 0,
    pursue: 0,
    contacted: 0,
    replied: 0,
    meetings: 0,
    proposals: 0,
    signed: 0,
    paid: 0,
    pendingExternalReview: 0,
    confirmedExternalEvents: 0,
    suggestedEvidence: 0,
    confirmedEvidence: 0,
    openAlerts: 0,
    criticalAlerts: 0,
    auditsReady: 0,
    offersSelected: 0,
  };

  for (const key of keys) {
    const candidate = queueByKey.get(key);
    const operator = operatorRecords[key];
    const bridgeRecord = bridge?.records[key];
    const disposition = bridgeRecord?.research_review.disposition;

    if (reviewed(disposition)) funnel.reviewed += 1;
    if (disposition === "pursue") funnel.pursue += 1;
    if (contacted(operator)) funnel.contacted += 1;
    if (replied(operator)) funnel.replied += 1;
    if (met(operator)) funnel.meetings += 1;
    if (proposed(operator)) funnel.proposals += 1;
    if (signed(operator)) funnel.signed += 1;
    if (operator && isFullyPaidRecord(operator)) funnel.paid += 1;

    if (bridgeRecord) {
      funnel.pendingExternalReview += bridgeRecord.external_events.filter((event) => event.review_state === "needs_review").length;
      funnel.confirmedExternalEvents += bridgeRecord.external_events.filter((event) => event.review_state === "confirmed").length;
      funnel.suggestedEvidence += bridgeRecord.evidence.filter((item) => item.review_state === "suggested").length;
      funnel.confirmedEvidence += bridgeRecord.evidence.filter((item) => item.review_state === "confirmed").length;
      funnel.openAlerts += bridgeRecord.alerts.filter((alert) => alert.status !== "resolved").length;
      funnel.criticalAlerts += bridgeRecord.alerts.filter((alert) => alert.status !== "resolved" && alert.severity === "critical").length;
      if (bridgeRecord.website_audit?.status === "generated") funnel.auditsReady += 1;
      if (bridgeRecord.selected_offer) funnel.offersSelected += 1;
    }

    const source = candidate?.source || operator?.identity.source || key.split(":", 1)[0] || "unknown";
    const sourceRow = sourceRows.get(source) ?? makeRow(source);
    recordIntoRow(sourceRow, disposition, operator);
    sourceRows.set(source, sourceRow);

    if (bridgeRecord?.selected_offer) {
      const offerCode = bridgeRecord.selected_offer.offer_code;
      const offerRow = offerRows.get(offerCode) ?? makeRow(offerCode);
      recordIntoRow(offerRow, disposition, operator);
      offerRows.set(offerCode, offerRow);
    }
  }

  return { funnel, sourceRows: sortRows(sourceRows), offerRows: sortRows(offerRows) };
}
