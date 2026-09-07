import { whyWebsiteArguments } from "@/data/why-website";

export default function WhyRealWebsite() {
  return (
    <section className="lf-website-reasons" aria-labelledby="why-real-website">
      <div className="lf-container">
        <h2 id="why-real-website">Why a real website</h2>
        <div className="lf-website-reasons__list">
          {whyWebsiteArguments.map((argument) => (
            <article key={argument.title}>
              <h3>{argument.title}</h3>
              <p>{argument.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
