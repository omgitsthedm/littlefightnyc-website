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
  insight: JournalInsightData;
};

export default function JournalInsight({ category, slug, insight }: Props) {
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
        <p className="lf-journal-insight__eyebrow">
          {category === "howto" ? "Start here" : "The short answer"}
        </p>
        <h2 id="journal-insight-title">The plain version.</h2>
        <p>{insight.answer}</p>
      </header>
      {featuredTool ? (
        <p className="lf-journal-insight__tool-note">
          Try the owner calculator below. Its starting values are examples. The math stays in this browser.
        </p>
      ) : null}
      <footer className="lf-journal-insight__sources">
        <p>
          <strong>Source check:</strong> August 14, 2026. <strong>Scope:</strong>{" "}
          the public definitions and product facts used in this answer. <strong>Limit:</strong>{" "}
          these links do not measure your business or promise a result.
        </p>
        {insight.sources.length > 0 ? (
          <ul aria-label="Sources for this answer">
            {insight.sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noreferrer">
                  {source.label} ↗
                </a>
                {source.note ? <span>{source.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p>No outside benchmark is used for this answer.</p>
        )}
      </footer>
    </section>
  );
}
