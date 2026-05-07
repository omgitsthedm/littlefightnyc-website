import { ArrowRight, BadgeDollarSign, Eye, Phone, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import CallToAction from "@/components/CallToAction";
import { agencyProcess, businessTypes, proofSignals, services } from "@/data/site";

const painCards = [
  {
    title: "The website is not helping.",
    text: "People land there, get confused, and leave without calling, booking, buying, or filling out the form.",
    icon: Eye,
  },
  {
    title: "The monthly tools keep charging.",
    text: "The team still works around them with spreadsheets, inboxes, notes, and memory.",
    icon: BadgeDollarSign,
  },
  {
    title: "Something breaks at the worst time.",
    text: "Email, booking, Wi-Fi, POS, forms, domains, devices, and access issues do not wait politely.",
    icon: Wrench,
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Little Fight NYC agency</p>
          <h1>A sharper digital agency for New York local business.</h1>
          <p className="hero-lede">
            We design, fix, and connect the four digital areas that keep a small
            business competitive: the website, the tech, the local visibility,
            and the system behind the work.
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
            <img src="/assets/owner.webp" alt="New York small business owner at work" />
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
          <h2>The problem is usually not one broken thing.</h2>
        </div>
        <div className="pain-grid">
          {painCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="soft-card" key={card.title}>
                <Icon size={24} />
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            );
          })}
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
        <img src="/assets/local-business.webp" alt="New York restaurant storefront at night" />
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
