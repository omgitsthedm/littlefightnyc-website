import { Link } from "react-router-dom";
import CallToAction from "@/components/CallToAction";

export default function About() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">About Little Fight</p>
        <h1>Built for the businesses that keep New York human.</h1>
        <p className="short-answer">
          Short answer: Little Fight NYC helps local businesses get a fairer shot at better websites, working tech,
          stronger Google visibility, and practical systems without enterprise pricing or endless monthly waste.
        </p>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">Why this exists</p>
          <h2>Small businesses should not have to buy giant software to run cleanly.</h2>
        </div>
        <div className="article-body">
          <article>
            <h2>The advantage should not only belong to chains.</h2>
            <p>
              Local pharmacies, salons, restaurants, shops, studios, and service teams know their customers better than
              any national platform ever will. What they often lack is the technical layer: a clearer website, a working
              form, a Google profile that tells the truth, or a simple way to track leads without paying for a giant tool.
            </p>
          </article>
          <article>
            <h2>The first move is usually smaller than people fear.</h2>
            <p>
              Little Fight starts by looking for the practical fix: what to keep, what to connect, what to replace, and
              what to build only if the business actually needs it. A good tool stays. A bad monthly bill gets questioned.
            </p>
          </article>
        </div>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">Founder</p>
          <h2>David Marsh, Little Fight NYC.</h2>
        </div>
        <article className="soft-card highlight-card">
          <p>
            David works with New York operators who need technical help explained plainly and handled carefully. The
            work crosses websites, support, local search, software choices, workflow cleanup, and the small systems that
            help owners see what is happening before a lead, booking, payment, or follow-up gets lost.
          </p>
          <Link className="button primary" to="/fit-check/">
            Start with the messy setup
          </Link>
        </article>
      </section>

      <CallToAction compact />
    </>
  );
}
