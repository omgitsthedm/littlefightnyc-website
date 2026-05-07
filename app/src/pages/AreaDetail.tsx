import { Link, Navigate, useParams } from "react-router-dom";
import CallToAction from "@/components/CallToAction";
import { areaPages, services } from "@/data/site";

export default function AreaDetail() {
  const { slug } = useParams();
  const area = areaPages.find((item) => item.slug === slug);

  if (!area) return <Navigate to="/contact/" replace />;

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">NYC service area</p>
        <h1>{area.headline}</h1>
        <p className="short-answer">{area.shortAnswer}</p>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">{area.name}</p>
          <h2>Built for the way this neighborhood moves.</h2>
          <p>{area.localPattern}</p>
          <p>
            ZIP codes served: <strong>{area.zipCodes.join(", ")}</strong>
          </p>
        </div>
        <article className="soft-card highlight-card">
          <h3>Suggested first move</h3>
          <p>{area.firstMove}</p>
          <Link className="button primary" to="/fit-check/">
            Start with a Fit Check
          </Link>
        </article>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Services in {area.name}</p>
          <h2>Four parts. One local path.</h2>
        </div>
        <div className="service-grid agency-grid">
          {services.map((service) => (
            <Link className={`service-card agency-card ${service.accent}`} key={service.slug} to={`/areas/${area.slug}/${service.slug}/`}>
              <div className="service-image">
                <img
                  src={service.image}
                  alt={`${service.eyebrow} help in ${area.name}`}
                  width="900"
                  height="675"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="eyebrow">{service.eyebrow}</p>
              <h3>{service.headline}</h3>
              <p>{service.outcome}</p>
            </Link>
          ))}
        </div>
      </section>

      <CallToAction compact />
    </>
  );
}
