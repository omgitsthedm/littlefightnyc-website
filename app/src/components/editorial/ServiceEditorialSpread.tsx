import { Link } from "react-router-dom";
import { services } from "@/data/site";
import "./ServiceEditorialSpread.css";

const ROMAN = ["I.", "II.", "III.", "IV."] as const;

const SERVICE_IMAGES: Record<string, { src: string; alt: string; caption: string }> = {
  "tech-consulting": {
    src: "/assets/interior-grocery.webp",
    alt: "A compact New York grocery interior with shelves and counter traffic",
    caption: "Audit the tools, bills, website, Google profile, and handoffs.",
  },
  "it-support": {
    src: "/assets/pos.webp",
    alt: "Point of sale hardware on a small business counter",
    caption: "Repair email, POS, Wi-Fi, domains, devices, booking, and access.",
  },
  "custom-local-websites": {
    src: "/assets/storefront-blue-gift-shop.webp",
    alt: "A bright blue New York storefront at street level",
    caption: "Build a local site around the block, the offer, and the next call.",
  },
  "business-systems": {
    src: "/assets/case-public-house-cockpit.webp",
    alt: "A custom estimating cockpit interface for a creative fabrication studio",
    caption: "Clean up the business behind the counter with right-sized systems.",
  },
};

export default function ServiceEditorialSpread() {
  return (
    <section className="lf-service-spread" aria-labelledby="lf-service-spread-title">
      <div className="lf-service-spread__inner">
        <header className="lf-service-spread__head">
          <p className="lf-service-spread__kicker">Work Desk · Issue 04</p>
          <h2 id="lf-service-spread-title" className="lf-service-spread__title">
            Four services under one agency.
          </h2>
          <p className="lf-service-spread__dek">
            Website, support, search, and systems problems do not arrive in neat
            departments. The service shape changes, but the operating idea stays
            the same: name the leak, fix the path, document the setup.
          </p>
        </header>

        <div className="lf-service-spread__layout">
          <figure className="lf-service-spread__lead">
            <img
              src="/assets/storefront-shop-deli.webp"
              alt="A New York deli storefront with street-level signage"
              width={1600}
              height={1200}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              Built for small teams where the website, the register, the inbox,
              and the follow-up path all affect the same day.
            </figcaption>
          </figure>

          <ol className="lf-service-spread__list">
            {services.map((service, index) => {
              const Icon = service.icon;
              const image = SERVICE_IMAGES[service.slug] ?? {
                src: service.image,
                alt: `${service.eyebrow} for New York small businesses`,
                caption: service.title,
              };

              return (
                <li key={service.slug} className="lf-service-spread__item">
                  <Link to={`/services/${service.slug}/`} className="lf-service-spread__link">
                    <span className="lf-service-spread__num" aria-hidden="true">
                      {ROMAN[index]}
                    </span>
                    <span className="lf-service-spread__icon" aria-hidden="true">
                      <Icon size={24} strokeWidth={1.75} />
                    </span>
                    <span className="lf-service-spread__copy">
                      <span className="lf-service-spread__verb">{service.verb}</span>
                      <strong>{service.eyebrow}</strong>
                      <span>{image.caption}</span>
                    </span>
                    <span className="lf-service-spread__thumb" aria-hidden="true">
                      <img src={image.src} alt="" width={1600} height={1200} loading="lazy" decoding="async" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <aside className="lf-service-spread__marginal" aria-label="What the work touches">
            <figure>
              <img
                src="/assets/nyc-stickys-steam.webp"
                alt="Steam rising from a New York street food counter"
                width={1200}
                height={1600}
                loading="lazy"
                decoding="async"
              />
              <figcaption>Customer path</figcaption>
            </figure>
            <figure>
              <img
                src="/assets/coworking-laptops.webp"
                alt="Open laptops on a working table"
                width={1600}
                height={1200}
                loading="lazy"
                decoding="async"
              />
              <figcaption>Owner view</figcaption>
            </figure>
          </aside>
        </div>
      </div>
    </section>
  );
}
