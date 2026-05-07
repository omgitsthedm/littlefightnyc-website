import { useLocation } from "react-router-dom";

export default function Legal() {
  const isTerms = useLocation().pathname.includes("terms");

  return (
    <section className="page-hero">
      <p className="eyebrow">{isTerms ? "Terms" : "Privacy"}</p>
      <h1>{isTerms ? "Simple terms." : "Privacy, plain and simple."}</h1>
      {isTerms ? (
        <>
          <p className="short-answer">
            Short answer: Little Fight scopes work before quoting it, avoids fake certainty, and expects safe
            access handoffs for any accounts, systems, or sensitive business tools.
          </p>
          <div className="article-body">
            <article>
              <h2>Work and scope</h2>
              <p>Project scope, pricing, access needs, and timelines should be confirmed in writing before work begins.</p>
            </article>
            <article>
              <h2>No sensitive information in forms</h2>
              <p>Do not send passwords, recovery codes, API keys, payment details, or private customer data through public forms.</p>
            </article>
          </div>
        </>
      ) : (
        <>
          <p className="short-answer">
            Short answer: Little Fight collects only the information needed to understand your business issue,
            follow up, and improve the site. Do not send sensitive information through public forms.
          </p>
          <div className="article-body">
            <article>
              <h2>What forms collect</h2>
              <p>Fit Check forms may collect your name, business, contact details, follow-up preference, and plain-English context about the issue.</p>
            </article>
            <article>
              <h2>What not to send</h2>
              <p>Do not send passwords, recovery codes, API keys, credit card numbers, bank details, or regulated private information.</p>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
