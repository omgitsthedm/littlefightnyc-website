import { Link } from "react-router-dom";

export default function Thanks() {
  return (
    <section className="page-hero">
      <p className="eyebrow">Fit Check received</p>
      <h1>Thanks. We have the messy setup.</h1>
      <p className="short-answer">
        Short answer: Little Fight will review what you sent and look for the clearest next move:
        what to keep, connect, replace, or build.
      </p>
      <div className="route-stack">
        <article>
          <span>01</span>
          <div>
            <h3>We review the context.</h3>
            <p>Website, tools, urgency, local visibility, and workflow signals get checked together.</p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <h3>We find the first useful move.</h3>
            <p>The goal is not to sell the biggest project. It is to find the right first fix.</p>
          </div>
        </article>
        <article>
          <span>03</span>
          <div>
            <h3>David follows up.</h3>
            <p>Urgent issues get treated differently from planned website, search, or systems work.</p>
          </div>
        </article>
      </div>
      <Link className="button ghost" to="/answers/">
        Read owner answers
      </Link>
    </section>
  );
}
