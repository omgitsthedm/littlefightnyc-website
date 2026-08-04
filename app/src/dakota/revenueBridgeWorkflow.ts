import { candidateKey } from "./revenue";
import type {
  Candidate,
  DakotaIngressReceiptSummary,
  DakotaRevenueBridgeRecord,
} from "./types";

export function ingressReceiptNeedsAttention(
  receipt: Pick<DakotaIngressReceiptSummary, "status">,
): boolean {
  return receipt.status !== "stored" && receipt.status !== "duplicate";
}

export function unreviewedResearchKeys(
  queueRecords: readonly Candidate[],
  bridgeRecords: Record<string, DakotaRevenueBridgeRecord> | undefined,
): string[] {
  return queueRecords.map(candidateKey).filter((key) => {
    const disposition = bridgeRecords?.[key]?.research_review.disposition;
    return !disposition || disposition === "unreviewed";
  });
}

export function nextUnreviewedResearchKey(
  queueRecords: readonly Candidate[],
  bridgeRecords: Record<string, DakotaRevenueBridgeRecord> | undefined,
  reviewedKey: string,
): string | null {
  return unreviewedResearchKeys(queueRecords, bridgeRecords).find((key) => key !== reviewedKey) ?? null;
}
