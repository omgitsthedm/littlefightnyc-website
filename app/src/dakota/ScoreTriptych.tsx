import type { CandidateAssessment, ScoreLayer } from "./revenue";

function ScoreCell({ name, score, compact }: { name: string; score: ScoreLayer; compact: boolean }) {
  return (
    <div className="score-layer">
      <dt>{name}</dt>
      <dd>
        <strong>{score.value}</strong>
        <span>{score.label}</span>
      </dd>
      {compact ? null : <p>{score.note}</p>}
    </div>
  );
}

export function ScoreTriptych({
  assessment,
  compact = false,
}: {
  assessment: CandidateAssessment;
  compact?: boolean;
}) {
  return (
    <dl className={`score-triptych${compact ? " score-triptych--compact" : ""}`} aria-label="Evidence score layers">
      <ScoreCell name="Signal" score={assessment.signal} compact={compact} />
      <ScoreCell name="Identity" score={assessment.identity} compact={compact} />
      <ScoreCell name="Pursuit" score={assessment.pursuit} compact={compact} />
    </dl>
  );
}
