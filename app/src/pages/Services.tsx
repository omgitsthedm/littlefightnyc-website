import CallToAction from "@/components/CallToAction";
import { Link } from "react-router-dom";
import { services } from "@/data/site";

export default function Services() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Services</p>
        <h1>Four areas. One operating partner.</h1>
        <p>
          Little Fight is the agency for the public-facing website, the daily
          tech, the local search layer, and the system behind the work.
        </p>
      </section>

      <section className="section">
        <div className="service-detail-stack">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <article className={`service-detail ${service.accent}`} key={service.title}>
                <div className="service-detail-media">
                  <img src={service.image} alt="" width="900" height="675" loading="lazy" decoding="async" />
                  <span>0{index + 1}</span>
                </div>
                <div className="service-detail-copy">
                  <p className="eyebrow">{service.eyebrow}</p>
                  <Icon size={32} />
                  <h2>{service.headline}</h2>
                  <h3>{service.title}</h3>
                  <p>{service.plain}</p>
                  <ul>
                    {service.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <strong>{service.outcome}</strong>
                  <Link className="button ghost" to={`/services/${service.slug}`}>
                    Open {service.eyebrow}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CallToAction compact />
    </>
  );
}
