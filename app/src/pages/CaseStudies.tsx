import CallToAction from "@/components/CallToAction";
import { caseStudies } from "@/data/site";

export default function CaseStudies() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Case studies</p>
        <h1>Proof without fake numbers.</h1>
        <p>
          Names stay private until clients approve. The useful part is the
          pattern: what leaked time or money, what stayed, what changed, and what got easier.
        </p>
      </section>

      <section className="section case-grid">
        {caseStudies.map((study) => (
          <article className="case-card" key={study.type}>
            <p className="eyebrow">{study.type}</p>
            <h2>{study.title}</h2>
            <dl>
              <div>
                <dt>Problem</dt>
                <dd>{study.problem}</dd>
              </div>
              <div>
                <dt>Kept</dt>
                <dd>{study.kept}</dd>
              </div>
              <div>
                <dt>Changed</dt>
                <dd>{study.changed}</dd>
              </div>
              <div>
                <dt>Result</dt>
                <dd>{study.result}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <CallToAction compact />
    </>
  );
}
