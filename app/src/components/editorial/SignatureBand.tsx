import AmbientField from "./AmbientField";
import { useCountUp } from "@/components/dataviz/useCountUp";
import { useScrollReveal } from "./useScrollReveal";
import "./SignatureBand.css";

/**
 * SignatureBand — the home page's signature beat. A full-bleed statement over
 * the living blue constellation, with four honest facts revealing in sequence.
 * Orange is the signal (eyebrow + accent); the burst behind is blue. The
 * ambient canvas pauses off-screen and never runs under reduced-motion.
 *
 * Only "14-day" counts up — a year counting up ("2012") reads gimmicky, and
 * "Free"/"Custom" are words. Judgment call, on purpose.
 */
const STATS: Array<{
  value: string;
  label: string;
  count?: { n: number; suffix: string };
}> = [
  { value: "2021", label: "In New York's corner since" },
  { value: "14-day", label: "Typical website ship", count: { n: 14, suffix: "-day" } },
  { value: "Free", label: "Every consult" },
  { value: "Custom", label: "Coded, never templated" },
];

function BandCount({ n, delay }: { n: number; delay: number }) {
  const { ref, value } = useCountUp<HTMLSpanElement>(n, { duration: 900, delay });
  return <span ref={ref}>{value}</span>;
}

export default function SignatureBand() {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.25 });

  return (
    <section className="lf-signature" aria-label="Little Fight NYC, by the numbers">
      <div className="lf-signature__ambient" aria-hidden="true">
        <AmbientField />
      </div>
      <div ref={ref} className="lf-signature__inner" data-revealed="true">
        <p className="lf-mono lf-signature__eyebrow">The record</p>
        <h2 className="lf-signature__title">
          Punching above our weight for New York&rsquo;s{" "}
          <span className="lf-signature__em">small businesses.</span>
        </h2>
        <dl className="lf-signature__stats">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="lf-signature__stat"
              style={{ ["--lf-i" as string]: i }}
            >
              <dt className="lf-signature__value">
                {s.count ? (
                  <>
                    <BandCount n={s.count.n} delay={i * 90} />
                    {s.count.suffix}
                  </>
                ) : (
                  s.value
                )}
              </dt>
              <dd className="lf-signature__label">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
