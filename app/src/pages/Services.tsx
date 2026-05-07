import CallToAction from "@/components/CallToAction";
import { services } from "@/data/site";

export default function Services() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Services</p>
        <h1>Help by problem, not by jargon.</h1>
        <p>
          You do not need the perfect tech term. Tell us what is broken,
          expensive, invisible, slow, or scattered.
        </p>
      </section>

      <section className="section">
        <div className="service-grid large">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className="service-card" key={service.title}>
                <Icon size={30} />
                <h2>{service.title}</h2>
                <p>{service.plain}</p>
                <strong>{service.outcome}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <CallToAction compact />
    </>
  );
}
