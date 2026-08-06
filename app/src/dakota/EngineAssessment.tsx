import type { Candidate } from "./types";

const BAND_COPY: Record<
  NonNullable<Candidate["queue_band"]>,
  { label: string; note: string }
> = {
  priority_review: {
    label: "Priority review",
    note: "Strong opportunity and the evidence holds up.",
  },
  standard_review: {
    label: "Standard review",
    note: "Worth a look. Evidence is good enough to reason from.",
  },
  research_identity_review: {
    label: "Identity research first",
    note: "The opportunity may be real, but we have not proven whose site this is.",
  },
  low_priority_archive: {
    label: "Low priority",
    note: "Little visible opportunity for this category.",
  },
  insufficient_evidence: {
    label: "Insufficient evidence",
    note: "Do not diagnose strongly. Verify the business first.",
  },
};

const TIER_COPY: Record<NonNullable<Candidate["category_tier"]>, string> = {
  A: "Tier A — appointment-driven, website usually central to booking",
  B: "Tier B — urgent search intent, usually decided on a phone",
  C: "Tier C — real value, but third-party platforms soften the urgency",
  eligible: "Consumer-facing, but no tiered category was matched",
  unknown: "Category not established from the public record",
};

/**
 * The engine's own assessment, kept visually distinct from the desk's derived
 * triptych. Renders nothing when the queue predates scoring v3.
 */
export function EngineAssessment({ candidate }: { candidate: Candidate }) {
  const opportunity = candidate.opportunity_score;
  const confidence = candidate.confidence_score;
  if (opportunity === undefined && confidence === undefined) return null;

  const band = candidate.queue_band;
  const tier = candidate.category_tier;

  return (
    <section
      className={`engine-assessment${band ? ` engine-assessment--${band}` : ""}`}
      aria-label="Engine assessment"
    >
      <div className="engine-assessment__scores">
        <div className="engine-score">
          <p>Opportunity</p>
          <strong>{opportunity ?? "—"}</strong>
          <span>likely value and visible web problem</span>
        </div>
        <div className="engine-score">
          <p>Confidence</p>
          <strong>{confidence ?? "—"}</strong>
          <span>how far the evidence can be trusted</span>
        </div>
      </div>
      {band ? (
        <p className="engine-assessment__band">
          <strong>{BAND_COPY[band].label}.</strong> {BAND_COPY[band].note}
        </p>
      ) : null}
      {tier && tier !== "unknown" ? (
        <p className="engine-assessment__tier">{TIER_COPY[tier]}</p>
      ) : null}
    </section>
  );
}
