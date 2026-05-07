import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import CallToAction from "@/components/CallToAction";
import HeroCanvas from "@/components/HeroCanvas";
import { agencyProcess, businessTypes, fitRoutes, proofSignals, services } from "@/data/site";

export default function Home() {
  return (
    <>
      <section className="hero cinematic-hero">
        <HeroCanvas />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Serving NYC small businesses</p>
          <h1>
            Better tech.
            <span>Fewer bills.</span>
            <strong>More customers.</strong>
          </h1>
          <p className="hero-lede">
            Websites, IT support, Google visibility, and simple business systems
            for New York shops, salons, pharmacies, restaurants, studios, and local teams.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/fit-check">
              Start a Fit Check <ArrowRight size={18} />
            </Link>
            <a className="button ghost" href="tel:+16463600318">
              <Phone size={18} /> Call if it is broken now
            </a>
          </div>
        </div>

        <div className="hero-board agency-board" aria-label="Little Fight four service areas">
          <div className="board-photo">
            <img src="/assets/local-business-base.jpg" alt="New York local business storefront" />
          </div>
          <div className="service-map">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <article key={service.eyebrow} className={`map-card ${service.accent}`}>
                  <span>0{index + 1}</span>
                  <Icon size={22} />
                  <h3>{service.eyebrow}</h3>
                  <p>{service.outcome}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="strip">
        {services.map((service) => (
          <p key={service.eyebrow}>{service.eyebrow}</p>
        ))}
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">Why owners call</p>
          <h2>You are not alone. We have heard all four.</h2>
        </div>
        <div className="pain-grid">
          {fitRoutes.map((card) => {
            const Icon = card.icon;
            return (
              <article className="soft-card" key={card.label}>
                <Icon size={24} />
                <h3>{card.label}</h3>
                <p>{card.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="cinema-band">
        <img src="/assets/nyc-street.jpg" alt="New York City street at dusk" />
        <div>
          <p className="eyebrow">Neighborhood advantage</p>
          <h2>Your neighbors are your customers.</h2>
          <p>We build for the people who walk past your storefront, search nearby, compare quickly, and decide fast.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">The four areas</p>
          <h2>One agency for the whole digital side.</h2>
        </div>
        <div className="service-grid agency-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className={`service-card agency-card ${service.accent}`} key={service.title}>
                <div className="service-image">
                  <img src={service.image} alt="" />
                </div>
                <p className="eyebrow">{service.eyebrow}</p>
                <Icon size={28} />
                <h3>{service.title}</h3>
                <p>{service.plain}</p>
                <strong>{service.outcome}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section split process-section">
        <div>
          <p className="eyebrow">Agency method</p>
          <h2>Not a menu of random services. A sequence.</h2>
          <p>
            A business owner should not have to guess whether the problem is the
            site, Google, software, or the back-office workflow. We map the chain,
            fix the leak, and build around what still works.
          </p>
        </div>
        <div className="process-list">
          {agencyProcess.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.label}>
                <span>{index + 1}</span>
                <Icon size={22} />
                <div>
                  <h3>{step.label}</h3>
                  <p>{step.copy}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="image-band">
        <img src="/assets/manhattan.jpg" alt="Manhattan skyline at night" />
        <div>
          <p className="eyebrow">Built for New York time</p>
          <h2>Local businesses do not need mystery software.</h2>
          <p>
            They need calls to go through, forms to land, payments to work, customers
            to find them, and staff to know what happens next.
          </p>
          <div className="type-row">
            {businessTypes.map((type) => {
              const Icon = type.icon;
              return (
                <span key={type.label}>
                  <Icon size={16} /> {type.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="proof-grid">
          {proofSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <article key={signal.label}>
                <Icon size={24} />
                <h3>{signal.label}</h3>
                <p>{signal.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <CallToAction />
    </>
  );
}
