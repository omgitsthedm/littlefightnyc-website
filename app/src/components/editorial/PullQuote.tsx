import "./PullQuote.css";

type Props = {
  quote: string;
  attribution?: string;
  context?: string;
};

export default function PullQuote({ quote, attribution, context }: Props) {
  return (
    <aside className="lf-pull" aria-label="Pull quote">
      <div className="lf-container lf-pull__inner">
        <span className="lf-pull__mark lf-pull__mark--open" aria-hidden="true">
          “
        </span>
        <blockquote className="lf-pull__quote lf-display">{quote}</blockquote>
        <span className="lf-pull__mark lf-pull__mark--close" aria-hidden="true">
          ”
        </span>
        {(attribution || context) && (
          <p className="lf-mono lf-pull__attribution">
            {attribution && <span className="lf-pull__attribution-name">{attribution}</span>}
            {attribution && context && <span aria-hidden="true"> · </span>}
            {context && <span className="lf-pull__attribution-context">{context}</span>}
          </p>
        )}
      </div>
    </aside>
  );
}
