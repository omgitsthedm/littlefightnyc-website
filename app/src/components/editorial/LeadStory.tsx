import { Link } from "react-router-dom";
import { useScrollReveal } from "./useScrollReveal";
import "./LeadStory.css";

export default function LeadStory() {
  const figureRef = useScrollReveal<HTMLElement>({ threshold: 0.1 });
  const headlineRef = useScrollReveal<HTMLHeadingElement>({ threshold: 0.25 });
  const dekRef = useScrollReveal<HTMLParagraphElement>({ threshold: 0.4 });
  const bodyRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const quoteRef = useScrollReveal<HTMLElement>({ threshold: 0.3 });

  return (
    <article className="lf-lead" aria-labelledby="lf-lead-heading">
      {/* Full-bleed cover photograph — the cinematic anchor */}
      <figure ref={figureRef as React.Ref<HTMLElement>} className="lf-lead__cover">
        <div className="lf-lead__cover-frame">
          <img
            src="/assets/manhattan.webp"
            alt="A view of Manhattan at night"
            width={2400}
            height={1350}
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <figcaption className="lf-lead__cover-caption">
          <span className="lf-mono lf-lead__cover-tag">Cover</span>
          <span className="lf-italic lf-lead__cover-text">
            A view of the block that pays the bills. Manhattan, May 2026.
          </span>
        </figcaption>
      </figure>

      <div className="lf-container lf-lead__body-wrap">
        <p className="lf-mono lf-lead__kicker">
          <span className="lf-lead__kicker-mark" aria-hidden="true">★</span>
          Featured Essay <span className="lf-lead__kicker-divider" aria-hidden="true">·</span>{" "}
          <span className="lf-lead__kicker-issue">№01</span>
        </p>

        <h2
          ref={headlineRef}
          id="lf-lead-heading"
          className="lf-display lf-lead__headline"
        >
          Spend less<br className="lf-lead__br" />
          on software.<br />
          <span className="lf-italic lf-lead__headline-italic">
            Keep what works.
          </span>
        </h2>

        <p ref={dekRef} className="lf-italic lf-lead__dek">
          Most NYC shops are bleeding $300 to $800 a month on tools that don't
          earn their keep. Here is how to find out which ones — and what to do
          without ripping the whole stack apart.
        </p>

        <p className="lf-mono lf-lead__byline">
          <span className="lf-lead__byline-name">Little Fight NYC</span>
          <span className="lf-lead__byline-divider" aria-hidden="true">·</span>
          <span>5 minute read</span>
          <span className="lf-lead__byline-divider" aria-hidden="true">·</span>
          <span>Small business field note</span>
        </p>

        <div ref={bodyRef} className="lf-lead__body">
          <p className="lf-lead__paragraph lf-lead__paragraph--dropcap">
            Most owners we meet are not paying for software. They are paying
            for habits. A subscription that was the right call two years ago.
            A tool that no one on staff actually uses anymore. A vendor that
            quietly raised prices three times since you signed up — and the
            invoice still gets paid every month because no one wants to be the
            one who broke it.
          </p>

          <p className="lf-lead__paragraph">
            The first job is not "rip it out." The first job is to map what
            you have, what it costs, and what it actually does. Keep what
            works. Connect what matters. Replace what drags. Build only what
            fits. In that order — never any other.
          </p>

          {/* Pull quote woven into the article body — magazine craft */}
          <aside ref={quoteRef as React.Ref<HTMLElement>} className="lf-lead__inline-quote" aria-label="Pull quote">
            <span className="lf-lead__inline-quote-mark" aria-hidden="true">"</span>
            <blockquote className="lf-display lf-lead__inline-quote-text">
              Fourteen days. Or you don't pay.
            </blockquote>
            <p className="lf-mono lf-lead__inline-quote-attr">
              Little Fight NYC <span aria-hidden="true">·</span> on every website build, in writing
            </p>
          </aside>

          <p className="lf-lead__paragraph">
            Most of the savings show up in the first month. Most of the growth
            shows up by month three. None of it requires a contract, a
            retainer, or a giant overhaul. We pick up the phone.
            We tell you what is broken. We fix the math.
          </p>

          <Link to="/fit-check/" className="lf-mono lf-lead__continue">
            Get the math on your stack <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
