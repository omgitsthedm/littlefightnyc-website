import { Link, Navigate, useParams } from "react-router-dom";
import CallToAction from "@/components/CallToAction";
import { areaPages, services } from "@/data/site";

export default function ServiceAreaDetail() {
  const { areaSlug, serviceSlug } = useParams();
  const area = areaPages.find((item) => item.slug === areaSlug);
  const service = services.find((item) => item.slug === serviceSlug);

  if (!area || !service) return <Navigate to="/services/" replace />;

  const Icon = service.icon;
  const related = services.filter((item) => item.slug !== service.slug);

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">
          {area.name} / {service.eyebrow}
        </p>
        <h1>
          {service.eyebrow} for {area.name} businesses.
        </h1>
        <p className="short-answer">
          Short answer: {area.name} businesses need {service.plain.toLowerCase()} Little Fight keeps the useful pieces,
          fixes the drag, and avoids another bloated monthly bill when a smaller move will do.
        </p>
      </section>

      <section className={`service-detail ${service.accent}`}>
        <div className="service-detail-media">
          <img
            src={service.image}
            alt={`${service.eyebrow} help for ${area.name} small businesses`}
            width="900"
            height="675"
            loading="eager"
            decoding="async"
          />
          <span>{area.zipCodes[0]}</span>
        </div>
        <div className="service-detail-copy">
          <Icon size={34} />
          <h2>What matters locally.</h2>
          <p>{area.localPattern}</p>
          <p>{service.outcome}</p>
          <strong>{area.firstMove}</strong>
        </div>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">First checks</p>
          <h2>Start with the things that affect money.</h2>
        </div>
        <div className="number-list">
          {service.includes.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item}</h3>
              <p>Check whether this is clear, working, visible, and connected to the next step.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">Local FAQ</p>
          <h2>Two fast answers.</h2>
        </div>
        <div className="faq-list">
          <article>
            <h3>Do you work with {area.name} businesses?</h3>
            <p>Yes. Little Fight works with New York small businesses that need practical help across websites, IT, search, tools, and workflow.</p>
          </article>
          <article>
            <h3>Should I start with this service or a Fit Check?</h3>
            <p>If the problem touches more than one tool, page, person, or monthly bill, start with a Fit Check so the first fix is not guessed.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Related in {area.name}</p>
          <h2>The other layers still matter.</h2>
        </div>
        <div className="service-grid">
          {related.map((item) => (
            <Link className={`service-card ${item.accent}`} key={item.slug} to={`/areas/${area.slug}/${item.slug}/`}>
              <item.icon size={26} />
              <h3>{item.eyebrow}</h3>
              <p>{item.outcome}</p>
            </Link>
          ))}
        </div>
      </section>

      <CallToAction compact />
    </>
  );
}
