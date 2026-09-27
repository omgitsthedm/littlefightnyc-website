import { evidencedInvoiceAmount, isFullyPaidRecord } from "./revenue";
import {
  DAKOTA_PURSUIT_TEMPLATES,
  isValidPursuitAttribution,
} from "./pursuitKit";
import type {
  Candidate,
  DakotaPursuitSegment,
  DakotaPursuitTemplateId,
  DakotaRevenueBridgeEnvelope,
  OperatorRecord,
} from "./types";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const RESPONSE_TIME_ZONE = "America/New_York";
const RESPONSE_WINDOW_START_HOUR = 9;
const RESPONSE_WINDOW_END_HOUR = 21;
const INBOUND_PROOF_LABELS = [
  "Intent",
  "Lead origin",
  "UTM source",
  "UTM medium",
  "UTM campaign",
  "UTM term",
  "UTM content",
] as const;
const EASTERN_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: RESPONSE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** Internal operating target. It is not a claim that a provider sent or received a message. */
export const DAKOTA_INBOUND_RESPONSE_TARGET_MINUTES = 120;

export interface DakotaConversionRate {
  numerator: number;
  denominator: number;
  percentage: number | null;
}

export interface DakotaConversionRates {
  contact: DakotaConversionRate;
  reply: DakotaConversionRate;
  meeting: DakotaConversionRate;
  proposal: DakotaConversionRate;
  signed: DakotaConversionRate;
  paid: DakotaConversionRate;
}

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

export interface DakotaCommercialTruth {
  proposalValue: number;
  clearedRevenue: number;
  outstandingBalance: number;
  fullyPaidDeals: number;
  averagePaidDeal: number | null;
}

export interface DakotaResponseVelocity {
  targetMinutes: number;
  timeZone: string;
  windowStartHour: number;
  windowEndHour: number;
  inboundRecords: number;
  measurableInboundRecords: number;
  missingReceivedTimestamp: number;
  responded: number;
  pending: number;
  withinTarget: number;
  outsideTarget: number;
  responseRate: DakotaConversionRate;
  withinTargetRate: DakotaConversionRate;
  averageFirstResponseMinutes: number | null;
  medianFirstResponseMinutes: number | null;
  oldestPendingResponseMinutes: number | null;
}

export interface DakotaActionPressure {
  open: number;
  overdue: number;
  oldestActionableAgeMinutes: number | null;
}

export const DAKOTA_TEMPLATE_COMPARISON_MIN_SENDS = 5;

export interface DakotaTemplatePerformanceRow {
  templateId: DakotaPursuitTemplateId;
  templateVersion: string;
  segment: DakotaPursuitSegment;
  sends: number;
  replies: number;
  replyRate: DakotaConversionRate;
  comparisonReady: boolean;
  weakest: boolean;
}

export interface DakotaProvenanceRow {
  label: string;
  records: number;
  reviewed: number;
  pursue: number;
  contacted: number;
  replied: number;
  meetings: number;
  proposals: number;
  signed: number;
  paid: number;
  paidAmount: number;
  conversion: DakotaConversionRates;
}

export interface DakotaAcquisitionRow extends DakotaProvenanceRow {
  identitySource: string;
  leadOrigin: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

export interface DakotaRevenueMetrics {
  funnel: DakotaRevenueFunnel;
  conversion: DakotaConversionRates;
  commercial: DakotaCommercialTruth;
  response: DakotaResponseVelocity;
  actions: DakotaActionPressure;
  templatePerformance: DakotaTemplatePerformanceRow[];
  sourceRows: DakotaProvenanceRow[];
  acquisitionRows: DakotaAcquisitionRow[];
  offerRows: DakotaProvenanceRow[];
}

export type DakotaWeeklyPeriod = "this_week" | "previous_week";

export interface DakotaWeeklyRange {
  period: DakotaWeeklyPeriod;
  start: number;
  end: number;
  label: string;
  timeZone: string;
  asOf: number;
  isPartial: boolean;
}

export interface DakotaWeeklyFunnel {
  inbound: number;
  contacted: number;
  replied: number;
  meetings: number;
  proposals: number;
  signed: number;
  paid: number;
  clearedRevenue: number;
}

/**
 * These are unique-record event counts for a bounded Eastern week. They do not
 * infer that a record entered a stage this week from its current status.
 */
export interface DakotaWeeklyRow extends DakotaWeeklyFunnel {
  label: string;
  records: number;
}

export interface DakotaWeeklyAcquisitionRow extends DakotaWeeklyRow {
  identitySource: string;
  leadOrigin: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

export interface DakotaWeeklyCoverage {
  operatorRecords: number;
  recordsWithTimestampEvidence: number;
  recordsInPeriod: number;
  invalidActivityTimestamps: number;
  paymentEvidenceWithoutAllocatableAmount: number;
}

export interface DakotaWeeklyMetrics {
  range: DakotaWeeklyRange;
  funnel: DakotaWeeklyFunnel;
  response: DakotaResponseVelocity;
  coverage: DakotaWeeklyCoverage;
  sourceRows: DakotaWeeklyRow[];
  acquisitionRows: DakotaWeeklyAcquisitionRow[];
  offerRows: DakotaWeeklyRow[];
}

interface DakotaPacketOutcome {
  templateId: DakotaPursuitTemplateId;
  templateVersion: string;
  segment: DakotaPursuitSegment;
  contactId: string;
  sentAt: number | null;
  repliedAt: number | null;
}

function outboundAttributionEvent(type: string, channel: string, outcome: string, taskType: string | null): boolean {
  if (taskType !== "outreach" && taskType !== "follow_up") return false;
  if (type === "outreach") return ["sent", "delivered", "connected", "voicemail", "no_response"].includes(outcome);
  if (type === "call") return ["connected", "voicemail", "completed", "no_response"].includes(outcome);
  return type === "follow_up" && taskType === "follow_up" && channel !== "internal" && ["sent", "delivered", "connected", "voicemail", "completed", "no_response"].includes(outcome);
}

export function buildDakotaTemplatePerformance(
  operatorRecords: Record<string, OperatorRecord>,
): DakotaTemplatePerformanceRow[] {
  const packets = new Map<string, DakotaPacketOutcome>();
  for (const [recordKey, record] of Object.entries(operatorRecords)) {
    for (const activity of record.activities) {
      const attribution = activity.pursuitAttribution;
      const occurredAt = validTimestamp(activity.occurredAt);
      const taskType = activity.taskId
        ? record.tasks.find((task) => task.taskId === activity.taskId)?.type ?? null
        : null;
      if (
        !isValidPursuitAttribution(attribution) ||
        occurredAt === null ||
        !activity.contactId ||
        !outboundAttributionEvent(activity.type, activity.channel, activity.outcome, taskType)
      ) continue;
      const packetKey = `${recordKey}:${attribution.packetId}`;
      const packet = packets.get(packetKey) ?? {
        templateId: attribution.templateId,
        templateVersion: attribution.templateVersion,
        segment: attribution.segment,
        contactId: activity.contactId,
        sentAt: null,
        repliedAt: null,
      };
      if (packet.contactId === activity.contactId) {
        packet.sentAt = packet.sentAt === null ? occurredAt : Math.min(packet.sentAt, occurredAt);
      }
      packets.set(packetKey, packet);
    }
  }
  for (const [recordKey, record] of Object.entries(operatorRecords)) {
    for (const activity of record.activities) {
      const attribution = activity.pursuitAttribution;
      const occurredAt = validTimestamp(activity.occurredAt);
      if (
        activity.type !== "reply" ||
        !["replied", "connected", "completed"].includes(activity.outcome) ||
        !isValidPursuitAttribution(attribution) ||
        occurredAt === null ||
        !activity.contactId
      ) continue;
      const packet = packets.get(`${recordKey}:${attribution.packetId}`);
      if (!packet || packet.contactId !== activity.contactId || packet.sentAt === null || occurredAt < packet.sentAt) continue;
      packet.repliedAt = packet.repliedAt === null ? occurredAt : Math.min(packet.repliedAt, occurredAt);
    }
  }

  const rows = new Map<string, DakotaTemplatePerformanceRow>();
  for (const template of DAKOTA_PURSUIT_TEMPLATES) {
    rows.set(`${template.id}:${template.version}`, {
      templateId: template.id,
      templateVersion: template.version,
      segment: template.segment,
      sends: 0,
      replies: 0,
      replyRate: rate(0, 0),
      comparisonReady: false,
      weakest: false,
    });
  }
  for (const packet of packets.values()) {
    if (packet.sentAt === null) continue;
    const key = `${packet.templateId}:${packet.templateVersion}`;
    const row = rows.get(key) ?? {
      templateId: packet.templateId,
      templateVersion: packet.templateVersion,
      segment: packet.segment,
      sends: 0,
      replies: 0,
      replyRate: rate(0, 0),
      comparisonReady: false,
      weakest: false,
    };
    row.sends += 1;
    if (packet.repliedAt !== null && packet.repliedAt >= packet.sentAt) row.replies += 1;
    rows.set(key, row);
  }
  const result = [...rows.values()].map((row) => ({
    ...row,
    replyRate: rate(row.replies, row.sends),
    comparisonReady: row.sends >= DAKOTA_TEMPLATE_COMPARISON_MIN_SENDS,
  }));
  const eligible = result.filter((row) => row.comparisonReady && row.replyRate.percentage !== null);
  if (eligible.length >= 2) {
    const minimum = Math.min(...eligible.map((row) => row.replyRate.percentage ?? Number.POSITIVE_INFINITY));
    const weakest = eligible.filter((row) => row.replyRate.percentage === minimum);
    if (weakest.length === 1) weakest[0]!.weakest = true;
  }
  return result.sort((left, right) => right.sends - left.sends || left.templateId.localeCompare(right.templateId));
}

function hasActivity(record: OperatorRecord | undefined, type: string): boolean {
  return Boolean(record?.activities.some(
    (activity) => activity.type === type && validTimestamp(activity.occurredAt) !== null,
  ));
}

function contacted(record: OperatorRecord | undefined): boolean {
  return Boolean(validTimestamp(record?.milestones?.firstContactedAt) !== null || hasActivity(record, "outreach") || hasActivity(record, "call"));
}

function replied(record: OperatorRecord | undefined): boolean {
  return Boolean(validTimestamp(record?.milestones?.repliedAt) !== null || hasActivity(record, "reply"));
}

function met(record: OperatorRecord | undefined): boolean {
  return Boolean(validTimestamp(record?.milestones?.meetingAt) !== null || hasActivity(record, "meeting"));
}

function proposed(record: OperatorRecord | undefined): boolean {
  return Boolean(
    validTimestamp(record?.milestones?.proposalAt) !== null
    || validTimestamp(record?.commercialClose.proposalSentDate) !== null
    || hasActivity(record, "proposal_sent"),
  );
}

function signed(record: OperatorRecord | undefined): boolean {
  return Boolean(
    validTimestamp(record?.milestones?.wonAt) !== null
    || validTimestamp(record?.commercialClose.signedDate) !== null
    || hasActivity(record, "contract_signed"),
  );
}

function reviewed(disposition: string | undefined): boolean {
  return Boolean(disposition && disposition !== "unreviewed");
}

function validTimestamp(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function earliestTimestamp(values: Array<string | null | undefined>): number | null {
  const timestamps = values
    .map(validTimestamp)
    .filter((value): value is number => value !== null);
  return timestamps.length ? Math.min(...timestamps) : null;
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function easternParts(timestamp: number): ZonedParts {
  const values = new Map(
    EASTERN_PARTS.formatToParts(timestamp)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: values.get("year") ?? 0,
    month: values.get("month") ?? 0,
    day: values.get("day") ?? 0,
    hour: values.get("hour") ?? 0,
    minute: values.get("minute") ?? 0,
    second: values.get("second") ?? 0,
  };
}

/** Converts an unambiguous daytime wall clock in New York to its real UTC instant. */
function easternWallClockToUtc(parts: Omit<ZonedParts, "minute" | "second"> & { minute?: number }): number {
  const target = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute ?? 0, 0);
  let candidate = target;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const rendered = easternParts(candidate);
    const renderedAsUtc = Date.UTC(
      rendered.year,
      rendered.month - 1,
      rendered.day,
      rendered.hour,
      rendered.minute,
      rendered.second,
    );
    const correction = target - renderedAsUtc;
    candidate += correction;
    if (correction === 0) break;
  }
  return candidate;
}

function dateLabel(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: RESPONSE_TIME_ZONE,
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

/**
 * Monday 00:00 through the following Monday 00:00 in America/New_York.
 * The current week is bounded by the report's as-of instant so a future event
 * cannot appear simply because its timestamp falls later in this calendar week.
 */
export function buildDakotaWeeklyRange(
  now = new Date(),
  period: DakotaWeeklyPeriod = "this_week",
): DakotaWeeklyRange {
  const nowMillis = Number.isFinite(now.getTime()) ? now.getTime() : Date.now();
  const local = easternParts(nowMillis);
  const localDay = Date.UTC(local.year, local.month - 1, local.day);
  const daysSinceMonday = (new Date(localDay).getUTCDay() + 6) % 7;
  const periodOffset = period === "previous_week" ? 7 : 0;
  const startDate = new Date(localDay - (daysSinceMonday + periodOffset) * DAY_MS);
  const endDate = new Date(startDate.getTime() + 7 * DAY_MS);
  const start = easternWallClockToUtc({
    year: startDate.getUTCFullYear(), month: startDate.getUTCMonth() + 1, day: startDate.getUTCDate(), hour: 0,
  });
  const weekEnd = easternWallClockToUtc({
    year: endDate.getUTCFullYear(), month: endDate.getUTCMonth() + 1, day: endDate.getUTCDate(), hour: 0,
  });
  const isPartial = period === "this_week" && nowMillis < weekEnd;
  const end = isPartial ? nowMillis : weekEnd;
  const lastDay = end - 1;
  return {
    period,
    start,
    end,
    label: `${dateLabel(start)}–${dateLabel(lastDay)} Eastern${isPartial ? " · as of now" : ""}`,
    timeZone: RESPONSE_TIME_ZONE,
    asOf: nowMillis,
    isPartial,
  };
}

function isInWeeklyRange(timestamp: number | null, range: DakotaWeeklyRange): boolean {
  return timestamp !== null && timestamp >= range.start && timestamp < range.end;
}

function isDateValueInWeeklyRange(value: string | null | undefined, range: DakotaWeeklyRange): boolean {
  if (!value?.trim()) return false;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value.trim());
  if (!dateOnly) return isInWeeklyRange(validTimestamp(value), range);
  const localStart = easternParts(range.start);
  const localEnd = easternParts(range.end - 1);
  const targetDay = Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  const firstDay = Date.UTC(localStart.year, localStart.month - 1, localStart.day);
  const lastDay = Date.UTC(localEnd.year, localEnd.month - 1, localEnd.day);
  return targetDay >= firstDay && targetDay <= lastDay;
}

/** Counts only the daily 09:00–21:00 America/New_York response window. */
function responseWindowMinutes(start: number, end: number): number {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  const first = easternParts(start);
  const last = easternParts(end);
  const firstDay = Date.UTC(first.year, first.month - 1, first.day);
  const lastDay = Date.UTC(last.year, last.month - 1, last.day);
  let milliseconds = 0;

  for (let dayCursor = firstDay; dayCursor <= lastDay; dayCursor += DAY_MS) {
    const day = new Date(dayCursor);
    const localDate = {
      year: day.getUTCFullYear(),
      month: day.getUTCMonth() + 1,
      day: day.getUTCDate(),
    };
    const windowStart = easternWallClockToUtc({ ...localDate, hour: RESPONSE_WINDOW_START_HOUR });
    const windowEnd = easternWallClockToUtc({ ...localDate, hour: RESPONSE_WINDOW_END_HOUR });
    milliseconds += Math.max(0, Math.min(end, windowEnd) - Math.max(start, windowStart));
  }

  return milliseconds / MINUTE_MS;
}

function safeAmount(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function exactInboundProofValue(proof: string, label: typeof INBOUND_PROOF_LABELS[number]): string | null {
  const nextLabelPattern = INBOUND_PROOF_LABELS.join("|").replaceAll(" ", "\\s");
  const exactLabel = label.replaceAll(" ", "\\s");
  const pattern = new RegExp(
    `(?:^|\\s)${exactLabel}: (.+?)\\.(?=\\s(?:(?:${nextLabelPattern}):|Paid-click marker supplied;)|$)`,
    "u",
  );
  const value = pattern.exec(proof)?.[1]?.trim() ?? "";
  return value || null;
}

function acquisitionAttribution(
  identitySource: string,
  record: OperatorRecord | undefined,
): Omit<DakotaAcquisitionRow, keyof DakotaProvenanceRow> {
  const canParseInboundProof = Boolean(record?.identity.source.toLowerCase().startsWith("inbound:"));
  return {
    identitySource,
    leadOrigin: canParseInboundProof ? exactInboundProofValue(record?.proof ?? "", "Lead origin") : null,
    utmSource: canParseInboundProof ? exactInboundProofValue(record?.proof ?? "", "UTM source") : null,
    utmMedium: canParseInboundProof ? exactInboundProofValue(record?.proof ?? "", "UTM medium") : null,
    utmCampaign: canParseInboundProof ? exactInboundProofValue(record?.proof ?? "", "UTM campaign") : null,
  };
}

function makeAcquisitionRow(
  attribution: Omit<DakotaAcquisitionRow, keyof DakotaProvenanceRow>,
): DakotaAcquisitionRow {
  const utm = attribution.utmSource
    ? `UTM ${[attribution.utmSource, attribution.utmMedium, attribution.utmCampaign].filter(Boolean).join(" / ")}`
    : null;
  const origin = attribution.leadOrigin ? `Origin ${attribution.leadOrigin}` : null;
  return {
    ...makeRow([attribution.identitySource, utm, origin].filter(Boolean).join(" · ")),
    ...attribution,
  };
}

function clearedAmount(record: OperatorRecord | undefined): number {
  if (!record) return 0;
  const paymentRecorded = record.activities.some(
    (activity) => activity.type === "payment_received"
      && activity.outcome === "paid"
      && validTimestamp(activity.occurredAt) !== null,
  );
  return paymentRecorded ? safeAmount(record.commercialClose.amountPaid) : 0;
}

function fullyPaid(record: OperatorRecord | undefined): boolean {
  return Boolean(
    record
    && isFullyPaidRecord(record)
    && validTimestamp(record.commercialClose.paidDate) !== null
    && clearedAmount(record) >= safeAmount(record.commercialClose.amountDue),
  );
}

function evidencedInvoiceValue(record: OperatorRecord): number {
  const hasTimedInvoiceEvidence = record.activities.some(
    (activity) => activity.type === "invoice_sent"
      && ["sent", "delivered", "completed"].includes(activity.outcome)
      && validTimestamp(activity.occurredAt) !== null,
  );
  return hasTimedInvoiceEvidence ? safeAmount(evidencedInvoiceAmount(record)) : 0;
}

function rate(numerator: number, denominator: number): DakotaConversionRate {
  return {
    numerator,
    denominator,
    percentage: denominator > 0 ? Math.round((numerator / denominator) * 1_000) / 10 : null,
  };
}

function conversionRates(counts: Pick<DakotaProvenanceRow, "records" | "contacted" | "replied" | "meetings" | "proposals" | "signed" | "paid">): DakotaConversionRates {
  return {
    contact: rate(counts.contacted, counts.records),
    reply: rate(counts.replied, counts.contacted),
    meeting: rate(counts.meetings, counts.replied),
    proposal: rate(counts.proposals, counts.meetings),
    signed: rate(counts.signed, counts.proposals),
    paid: rate(counts.paid, counts.signed),
  };
}

function makeRow(label: string): DakotaProvenanceRow {
  const row: DakotaProvenanceRow = {
    label,
    records: 0,
    reviewed: 0,
    pursue: 0,
    contacted: 0,
    replied: 0,
    meetings: 0,
    proposals: 0,
    signed: 0,
    paid: 0,
    paidAmount: 0,
    conversion: {
      contact: rate(0, 0),
      reply: rate(0, 0),
      meeting: rate(0, 0),
      proposal: rate(0, 0),
      signed: rate(0, 0),
      paid: rate(0, 0),
    },
  };
  return row;
}

function recordIntoRow(
  row: DakotaProvenanceRow,
  disposition: string | undefined,
  record: OperatorRecord | undefined,
): void {
  row.records += 1;
  if (reviewed(disposition)) row.reviewed += 1;
  if (disposition === "pursue") row.pursue += 1;
  if (contacted(record)) row.contacted += 1;
  if (replied(record)) row.replied += 1;
  if (met(record)) row.meetings += 1;
  if (proposed(record)) row.proposals += 1;
  if (signed(record)) row.signed += 1;
  if (fullyPaid(record)) row.paid += 1;
  row.paidAmount += clearedAmount(record);
  row.conversion = conversionRates(row);
}

function sortRows<Row extends DakotaProvenanceRow>(rows: Map<string, Row>): Row[] {
  return [...rows.values()].sort((left, right) =>
    right.paidAmount - left.paidAmount
    || right.pursue - left.pursue
    || right.reviewed - left.reviewed
    || left.label.localeCompare(right.label));
}

function buildCommercialTruth(operatorRecords: Record<string, OperatorRecord>): DakotaCommercialTruth {
  let proposalValue = 0;
  let clearedRevenue = 0;
  let outstandingBalance = 0;
  let fullyPaidDeals = 0;
  let fullyPaidRevenue = 0;

  for (const record of Object.values(operatorRecords)) {
    const paid = clearedAmount(record);
    const invoice = evidencedInvoiceValue(record);
    if (proposed(record)) proposalValue += safeAmount(record.commercialClose.proposalAmount);
    clearedRevenue += paid;
    outstandingBalance += Math.max(0, invoice - paid);
    if (fullyPaid(record)) {
      fullyPaidDeals += 1;
      fullyPaidRevenue += paid;
    }
  }

  return {
    proposalValue,
    clearedRevenue,
    outstandingBalance,
    fullyPaidDeals,
    averagePaidDeal: fullyPaidDeals ? fullyPaidRevenue / fullyPaidDeals : null,
  };
}

function inboundReceiptTimestamp(record: OperatorRecord): number | null {
  return earliestTimestamp(
    record.activities
      .filter((activity) => activity.type === "note"
        && activity.channel === "internal"
        && (activity.note.startsWith("Consented Tech Audit request received.")
          || activity.note.startsWith("Website Audit request received.")))
      .map((activity) => activity.occurredAt),
  );
}

function buildResponseVelocity(
  operatorRecords: Record<string, OperatorRecord>,
  nowMillis: number,
  range?: DakotaWeeklyRange,
): DakotaResponseVelocity {
  const responseMinutes: number[] = [];
  const pendingMinutes: number[] = [];
  const responseCutoff = range ? Math.min(nowMillis, range.end) : nowMillis;
  let inboundRecords = 0;
  let measurableInboundRecords = 0;
  let missingReceivedTimestamp = 0;
  let withinTarget = 0;
  let outsideTarget = 0;

  for (const record of Object.values(operatorRecords)) {
    if (!record.identity.source.toLowerCase().startsWith("inbound:")) continue;
    const receivedAt = inboundReceiptTimestamp(record);
    if (range && !isInWeeklyRange(receivedAt, range)) continue;
    inboundRecords += 1;
    if (receivedAt === null) {
      missingReceivedTimestamp += 1;
      continue;
    }
    measurableInboundRecords += 1;

    const outreachTimestamps = [
      record.milestones?.firstContactedAt,
      ...record.activities
        .filter((activity) => activity.type === "outreach" || activity.type === "call")
        .map((activity) => activity.occurredAt),
    ]
      .map(validTimestamp)
        .filter((value): value is number => value !== null && value >= receivedAt && value <= responseCutoff);
    const outreachAt = outreachTimestamps.length ? Math.min(...outreachTimestamps) : null;
    if (outreachAt === null) {
      if (receivedAt <= responseCutoff) pendingMinutes.push(responseWindowMinutes(receivedAt, responseCutoff));
      continue;
    }

    const duration = responseWindowMinutes(receivedAt, outreachAt);
    responseMinutes.push(duration);
    if (duration <= DAKOTA_INBOUND_RESPONSE_TARGET_MINUTES) withinTarget += 1;
    else outsideTarget += 1;
  }

  const sortedResponseMinutes = [...responseMinutes].sort((left, right) => left - right);
  const midpoint = Math.floor(sortedResponseMinutes.length / 2);
  const median = sortedResponseMinutes.length === 0
    ? null
    : sortedResponseMinutes.length % 2
      ? sortedResponseMinutes[midpoint]
      : ((sortedResponseMinutes[midpoint - 1] ?? 0) + (sortedResponseMinutes[midpoint] ?? 0)) / 2;

  return {
    targetMinutes: DAKOTA_INBOUND_RESPONSE_TARGET_MINUTES,
    timeZone: RESPONSE_TIME_ZONE,
    windowStartHour: RESPONSE_WINDOW_START_HOUR,
    windowEndHour: RESPONSE_WINDOW_END_HOUR,
    inboundRecords,
    measurableInboundRecords,
    missingReceivedTimestamp,
    responded: responseMinutes.length,
    pending: Math.max(0, measurableInboundRecords - responseMinutes.length),
    withinTarget,
    outsideTarget,
    responseRate: rate(responseMinutes.length, measurableInboundRecords),
    withinTargetRate: rate(withinTarget, responseMinutes.length),
    averageFirstResponseMinutes: responseMinutes.length
      ? responseMinutes.reduce((sum, value) => sum + value, 0) / responseMinutes.length
      : null,
    medianFirstResponseMinutes: median,
    oldestPendingResponseMinutes: pendingMinutes.length ? Math.max(...pendingMinutes) : null,
  };
}

function buildActionPressure(
  operatorRecords: Record<string, OperatorRecord>,
  nowMillis: number,
): DakotaActionPressure {
  let open = 0;
  let overdue = 0;
  let oldestActionableAgeMinutes: number | null = null;

  for (const record of Object.values(operatorRecords)) {
    for (const task of record.tasks) {
      if (task.status !== "open") continue;
      open += 1;
      const dueAt = validTimestamp(task.dueAt);
      if (dueAt !== null && dueAt <= nowMillis) overdue += 1;
      const createdAt = validTimestamp(task.createdAt);
      if (createdAt === null || createdAt > nowMillis) continue;
      const age = (nowMillis - createdAt) / MINUTE_MS;
      oldestActionableAgeMinutes = oldestActionableAgeMinutes === null
        ? age
        : Math.max(oldestActionableAgeMinutes, age);
    }
  }

  return { open, overdue, oldestActionableAgeMinutes };
}

interface DakotaWeeklyEventFlags extends Omit<DakotaWeeklyFunnel, "clearedRevenue"> {
  clearedRevenue: number;
  paymentNeedsAllocation: boolean;
}

function hasTimestampInRange(
  values: Array<string | null | undefined>,
  range: DakotaWeeklyRange,
): boolean {
  return values.some((value) => isDateValueInWeeklyRange(value, range));
}

function hasUsableTimestamp(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value.trim());
  if (!dateOnly) return validTimestamp(value) !== null;
  const year = Number(dateOnly[1]);
  const month = Number(dateOnly[2]);
  const day = Number(dateOnly[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day;
}

function hasActivityInRange(
  record: OperatorRecord,
  types: readonly string[],
  range: DakotaWeeklyRange,
  outcome?: string,
): boolean {
  return record.activities.some((activity) => activity.type !== undefined
    && types.includes(activity.type)
    && (outcome === undefined || activity.outcome === outcome)
    && isInWeeklyRange(validTimestamp(activity.occurredAt), range));
}

function weeklyEvents(record: OperatorRecord, range: DakotaWeeklyRange): DakotaWeeklyEventFlags {
  const inbound = record.identity.source.toLowerCase().startsWith("inbound:")
    && isInWeeklyRange(inboundReceiptTimestamp(record), range);
  const contactedThisWeek = hasTimestampInRange([record.milestones?.firstContactedAt], range)
    || hasActivityInRange(record, ["outreach", "call"], range);
  const repliedThisWeek = hasTimestampInRange([record.milestones?.repliedAt], range)
    || hasActivityInRange(record, ["reply"], range);
  const meetingsThisWeek = hasTimestampInRange([record.milestones?.meetingAt], range)
    || hasActivityInRange(record, ["meeting"], range);
  const proposalsThisWeek = hasTimestampInRange([record.milestones?.proposalAt, record.commercialClose.proposalSentDate], range)
    || hasActivityInRange(record, ["proposal_sent"], range);
  const signedThisWeek = hasTimestampInRange([record.milestones?.wonAt, record.commercialClose.signedDate], range)
    || hasActivityInRange(record, ["contract_signed"], range);
  const paymentActivityThisWeek = hasActivityInRange(record, ["payment_received"], range, "paid");
  const paidThisWeek = hasTimestampInRange([record.milestones?.paidAt, record.commercialClose.paidDate], range)
    || paymentActivityThisWeek;
  const paidDateThisWeek = isDateValueInWeeklyRange(record.commercialClose.paidDate, range);
  const validPaidAmount = typeof record.commercialClose.amountPaid === "number"
    && Number.isFinite(record.commercialClose.amountPaid)
    && record.commercialClose.amountPaid >= 0;
  const paymentEvidenceCount = record.activities.filter((activity) =>
    activity.type === "payment_received" && activity.outcome === "paid",
  ).length;
  // amountPaid is cumulative. It belongs to this week only when the notebook has
  // one dated paid event total; multiple partial payments need per-payment amounts.
  const hasAllocatablePayment = paymentActivityThisWeek
    && paidDateThisWeek
    && validPaidAmount
    && paymentEvidenceCount === 1;
  return {
    inbound: Number(inbound),
    contacted: Number(contactedThisWeek),
    replied: Number(repliedThisWeek),
    meetings: Number(meetingsThisWeek),
    proposals: Number(proposalsThisWeek),
    signed: Number(signedThisWeek),
    paid: Number(paidThisWeek),
    clearedRevenue: hasAllocatablePayment ? record.commercialClose.amountPaid ?? 0 : 0,
    paymentNeedsAllocation: paymentActivityThisWeek && !hasAllocatablePayment,
  };
}

function hasAnyTimestampEvidence(record: OperatorRecord): boolean {
  return record.activities.some((activity) => validTimestamp(activity.occurredAt) !== null)
    || [
      record.milestones?.firstContactedAt,
      record.milestones?.repliedAt,
      record.milestones?.meetingAt,
      record.milestones?.proposalAt,
      record.milestones?.wonAt,
      record.milestones?.paidAt,
      record.commercialClose.proposalSentDate,
      record.commercialClose.signedDate,
      record.commercialClose.paidDate,
    ].some(hasUsableTimestamp);
}

function makeWeeklyRow(label: string): DakotaWeeklyRow {
  return {
    label,
    records: 0,
    inbound: 0,
    contacted: 0,
    replied: 0,
    meetings: 0,
    proposals: 0,
    signed: 0,
    paid: 0,
    clearedRevenue: 0,
  };
}

function recordIntoWeeklyRow(row: DakotaWeeklyRow, events: DakotaWeeklyEventFlags): void {
  const hasEvent = events.inbound + events.contacted + events.replied + events.meetings
    + events.proposals + events.signed + events.paid > 0;
  if (!hasEvent) return;
  row.records += 1;
  row.inbound += events.inbound;
  row.contacted += events.contacted;
  row.replied += events.replied;
  row.meetings += events.meetings;
  row.proposals += events.proposals;
  row.signed += events.signed;
  row.paid += events.paid;
  row.clearedRevenue += events.clearedRevenue;
}

function makeWeeklyAcquisitionRow(
  attribution: Omit<DakotaAcquisitionRow, keyof DakotaProvenanceRow>,
): DakotaWeeklyAcquisitionRow {
  const utm = attribution.utmSource
    ? `UTM ${[attribution.utmSource, attribution.utmMedium, attribution.utmCampaign].filter(Boolean).join(" / ")}`
    : null;
  const origin = attribution.leadOrigin ? `Origin ${attribution.leadOrigin}` : null;
  return { ...makeWeeklyRow([attribution.identitySource, utm, origin].filter(Boolean).join(" · ")), ...attribution };
}

function sortWeeklyRows<Row extends DakotaWeeklyRow>(rows: Map<string, Row>): Row[] {
  return [...rows.values()].filter((row) => row.records > 0).sort((left, right) =>
    right.clearedRevenue - left.clearedRevenue
    || right.paid - left.paid
    || right.replied - left.replied
    || right.records - left.records
    || left.label.localeCompare(right.label));
}

export function buildDakotaWeeklyMetrics(
  operatorRecords: Record<string, OperatorRecord>,
  bridge: DakotaRevenueBridgeEnvelope | null,
  now = new Date(),
  period: DakotaWeeklyPeriod = "this_week",
): DakotaWeeklyMetrics {
  const range = buildDakotaWeeklyRange(now, period);
  const sourceRows = new Map<string, DakotaWeeklyRow>();
  const acquisitionRows = new Map<string, DakotaWeeklyAcquisitionRow>();
  const offerRows = new Map<string, DakotaWeeklyRow>();
  const funnel: DakotaWeeklyFunnel = {
    inbound: 0, contacted: 0, replied: 0, meetings: 0, proposals: 0, signed: 0, paid: 0, clearedRevenue: 0,
  };
  let recordsWithTimestampEvidence = 0;
  let recordsInPeriod = 0;
  let invalidActivityTimestamps = 0;
  let paymentEvidenceWithoutAllocatableAmount = 0;

  for (const [key, record] of Object.entries(operatorRecords)) {
    if (hasAnyTimestampEvidence(record)) recordsWithTimestampEvidence += 1;
    invalidActivityTimestamps += record.activities.filter((activity) => validTimestamp(activity.occurredAt) === null).length;
    const events = weeklyEvents(record, range);
    const hasEvent = events.inbound + events.contacted + events.replied + events.meetings
      + events.proposals + events.signed + events.paid > 0;
    if (!hasEvent) continue;
    recordsInPeriod += 1;
    if (events.paymentNeedsAllocation) paymentEvidenceWithoutAllocatableAmount += 1;
    funnel.inbound += events.inbound;
    funnel.contacted += events.contacted;
    funnel.replied += events.replied;
    funnel.meetings += events.meetings;
    funnel.proposals += events.proposals;
    funnel.signed += events.signed;
    funnel.paid += events.paid;
    funnel.clearedRevenue += events.clearedRevenue;

    const bridgeRecord = bridge?.records[key];
    const source = record.identity.source || key.split(":", 1)[0] || "unknown";
    const sourceRow = sourceRows.get(source) ?? makeWeeklyRow(source);
    recordIntoWeeklyRow(sourceRow, events);
    sourceRows.set(source, sourceRow);

    const attribution = acquisitionAttribution(source, record);
    const acquisitionKey = JSON.stringify(attribution);
    const acquisitionRow = acquisitionRows.get(acquisitionKey) ?? makeWeeklyAcquisitionRow(attribution);
    recordIntoWeeklyRow(acquisitionRow, events);
    acquisitionRows.set(acquisitionKey, acquisitionRow);

    if (bridgeRecord?.selected_offer) {
      const offerCode = bridgeRecord.selected_offer.offer_code;
      const offerRow = offerRows.get(offerCode) ?? makeWeeklyRow(offerCode);
      recordIntoWeeklyRow(offerRow, events);
      offerRows.set(offerCode, offerRow);
    }
  }

  const nowMillis = Number.isFinite(now.getTime()) ? now.getTime() : Date.now();
  return {
    range,
    funnel,
    response: buildResponseVelocity(operatorRecords, nowMillis, range),
    coverage: {
      operatorRecords: Object.keys(operatorRecords).length,
      recordsWithTimestampEvidence,
      recordsInPeriod,
      invalidActivityTimestamps,
      paymentEvidenceWithoutAllocatableAmount,
    },
    sourceRows: sortWeeklyRows(sourceRows),
    acquisitionRows: sortWeeklyRows(acquisitionRows),
    offerRows: sortWeeklyRows(offerRows),
  };
}

export function buildDakotaRevenueMetrics(
  queueRecords: readonly Candidate[],
  operatorRecords: Record<string, OperatorRecord>,
  bridge: DakotaRevenueBridgeEnvelope | null,
  now = new Date(),
): DakotaRevenueMetrics {
  const queueByKey = new Map(queueRecords.map((candidate) => [`${candidate.source}:${candidate.source_id}`.toLowerCase(), candidate]));
  const keys = new Set([...queueByKey.keys(), ...Object.keys(operatorRecords), ...Object.keys(bridge?.records ?? {})]);
  const sourceRows = new Map<string, DakotaProvenanceRow>();
  const acquisitionRows = new Map<string, DakotaAcquisitionRow>();
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
    if (fullyPaid(operator)) funnel.paid += 1;

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

    const attribution = acquisitionAttribution(source, operator);
    const acquisitionKey = JSON.stringify(attribution);
    const acquisitionRow = acquisitionRows.get(acquisitionKey) ?? makeAcquisitionRow(attribution);
    recordIntoRow(acquisitionRow, disposition, operator);
    acquisitionRows.set(acquisitionKey, acquisitionRow);

    if (bridgeRecord?.selected_offer) {
      const offerCode = bridgeRecord.selected_offer.offer_code;
      const offerRow = offerRows.get(offerCode) ?? makeRow(offerCode);
      recordIntoRow(offerRow, disposition, operator);
      offerRows.set(offerCode, offerRow);
    }
  }

  const nowMillis = Number.isFinite(now.getTime()) ? now.getTime() : Date.now();
  return {
    funnel,
    conversion: conversionRates({ records: funnel.signals, ...funnel }),
    commercial: buildCommercialTruth(operatorRecords),
    response: buildResponseVelocity(operatorRecords, nowMillis),
    actions: buildActionPressure(operatorRecords, nowMillis),
    templatePerformance: buildDakotaTemplatePerformance(operatorRecords),
    sourceRows: sortRows(sourceRows),
    acquisitionRows: sortRows(acquisitionRows),
    offerRows: sortRows(offerRows),
  };
}
