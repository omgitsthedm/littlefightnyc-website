import { Link, Navigate, useParams } from "react-router-dom";
import CallToAction from "@/components/CallToAction";
import { areaPages, services } from "@/data/site";

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = services.find((item) => item.slug === slug);

  if (!service) return <Navigate to="/services/" replace />;

  const Icon = service.icon;
  const related = services.filter((item) => item.slug !== service.slug);
  const localPages = areaPages.slice(0, 6);

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">{service.eyebrow}</p>
        <h1>{service.headline}</h1>
        <p className="short-answer">{service.shortAnswer}</p>
      </section>

      <section className={`service-detail ${service.accent}`}>
        <div className="service-detail-media">
          <img
            src={service.image}
            alt={`${service.eyebrow} for New York small businesses`}
            width="900"
            height="675"
            loading="eager"
            decoding="async"
          />
          <span>LF</span>
        </div>
        <div className="service-detail-copy">
          <Icon size={34} />
          <h2>{service.title}</h2>
          <p>{service.plain}</p>
          <ul>
            {service.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <strong>{service.outcome}</strong>
        </div>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">Plain-English FAQ</p>
          <h2>What owners usually ask.</h2>
        </div>
        <div className="faq-list">
          {service.faq.map((item) => (
            <article key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Related services</p>
          <h2>The other pieces still matter.</h2>
        </div>
        <div className="service-grid large">
          {related.map((item) => (
            <Link className={`service-card ${item.accent}`} key={item.slug} to={`/services/${item.slug}/`}>
              <item.icon size={26} />
              <h3>{item.eyebrow}</h3>
              <p>{item.outcome}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">NYC neighborhoods</p>
          <h2>{service.eyebrow} help, tuned to the block.</h2>
        </div>
        <div className="answer-list">
          {localPages.map((area) => (
            <Link key={area.slug} to={`/areas/${area.slug}/${service.slug}/`}>
              <h3>
                {service.eyebrow} for {area.name}
              </h3>
              <p>{area.shortAnswer}</p>
            </Link>
          ))}
        </div>
      </section>

      <CallToAction compact />
    </>
  );
}
