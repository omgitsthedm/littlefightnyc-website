import "./ProofStrip.css";

const PROOFS = [
  {
    title: "A human picks up",
    body: "Call the number on this page. No account managers. No ticket queue. No \"we'll route you.\"",
  },
  {
    title: "24-hour agent",
    body: "After 9pm, an AI takes the call, captures the issue, and routes urgent calls. Most NYC shops send you to voicemail.",
  },
  {
    title: "14 days or free",
    body: "Websites ship in two weeks. If we miss the deadline, you don't pay. Specific time-bound guarantees, in writing.",
  },
  {
    title: "Fair for small",
    body: "If we are not the fit, we refer to someone who is. We would rather lose the work than send a NYC shop to the wrong vendor.",
  },
] as const;

export default function ProofStrip() {
  return (
    <section className="lf-proof" aria-labelledby="lf-proof-heading">
      <div className="lf-container">
        <header className="lf-proof__head">
          <p className="lf-mono lf-proof__eyebrow">What different looks like</p>
          <h2 id="lf-proof-heading" className="lf-display lf-proof__title">
            Four reasons to call.
          </h2>
        </header>

        <ol className="lf-proof__grid">
          {PROOFS.map((p, i) => (
            <li key={i} className="lf-proof__item">
              <p className="lf-mono lf-proof__num">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="lf-display lf-proof__item-title">{p.title}</h3>
              <p className="lf-proof__body">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
