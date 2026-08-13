import { ArrowRight, Check, Eye, Flag } from "lucide-react";
import "./JournalInsight.css";

type JournalSource = {
  label: string;
  href: string;
  note: string;
};

export type JournalInsightData = {
  answer: string;
  watch: string[];
  next: string[];
  fit: string;
  sources: JournalSource[];
};

type Props = {
  category: "blog" | "guide" | "essay" | "howto";
  slug: string;
  title: string;
  insight: JournalInsightData;
};

const LABELS: Record<Props["category"], string> = {
  blog: "Problem → useful move",
  guide: "Decision map",
  essay: "Idea → owner action",
  howto: "Do-this-next map",
};

export default function JournalInsight({ category, slug, title, insight }: Props) {
  const featuredTool =
    slug === "the-pen-and-paper-tax" ? "copy-paste" :
    slug === "read-your-monthly-software-bill" || slug === "custom-business-system-vs-saas-subscriptions" ? "subscriptions" :
    slug === "what-to-do-when-business-wifi-keeps-dropping" || slug === "signs-your-pos-is-about-to-fail" ? "downtime" :
    null;
  return (
    <section
      className="lf-journal-insight"
      aria-labelledby="journal-insight-title"
      data-lf-visual-proof="journal"
    >
      <header className="lf-journal-insight__head">
        <p className="lf-journal-insight__eyebrow">One-screen plan · {LABELS[category]}</p>
        <h2 id="journal-insight-title">The useful part, before the scroll.</h2>
        <p>{insight.answer}</p>
      </header>

      <div className="lf-journal-insight__flow" aria-label={`Visual summary for ${title}`}>
        <section className="lf-journal-insight__lane" data-tone="context">
          <div className="lf-journal-insight__lane-title">
            <Eye aria-hidden="true" />
            <h3>Notice this</h3>
          </div>
          <ol>
            {insight.watch.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="lf-journal-insight__bridge" aria-hidden="true">
          <ArrowRight />
          <span>turn the clue into a move</span>
        </div>

        <section className="lf-journal-insight__lane" data-tone="signal">
          <div className="lf-journal-insight__lane-title">
            <Check aria-hidden="true" />
            <h3>Do this next</h3>
          </div>
          <ol>
            {insight.next.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="lf-journal-insight__fit">
        <Flag aria-hidden="true" />
        <div>
          <h3>Where Little Fight fits</h3>
          <p>{insight.fit}</p>
        </div>
      </div>

      <footer className="lf-journal-insight__sources">
        <p>
          <strong>Truth type:</strong>{" "}
          {insight.sources.length > 0
            ? "Little Fight guidance checked against the sources below."
            : "Little Fight’s working framework. No outside benchmark or performance claim."}
        </p>
        <p>
          <strong>Source check:</strong> reviewed August 13, 2026. Scope: the definitions and context cited by this article. Limit: these sources do not measure your business or guarantee an outcome.
        </p>
        {insight.sources.length > 0 ? (
          <ul>
            {insight.sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noreferrer">
                  {source.label} ↗
                </a>
                {source.note ? <span>{source.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </footer>
      {featuredTool ? (
        <p className="lf-journal-insight__tool-note">
          Try the matching owner calculator below. Its starting values are labeled as an example,
          and the math stays in this browser.
        </p>
      ) : null}
    </section>
  );
}
