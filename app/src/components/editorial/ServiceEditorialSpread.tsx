import { Link } from "react-router-dom";
import { services } from "@/data/site";
import { responsiveImageProps } from "@/lib/responsiveImages";
import "./ServiceEditorialSpread.css";

const SERVICE_ORDER = [
  "custom-local-websites",
  "it-support",
  "tech-consulting",
  "business-systems",
] as const;

const SERVICE_IMAGES: Record<string, { src: string; alt: string; caption: string }> = {
  "tech-consulting": {
    src: "/assets/interior-grocery.webp",
    alt: "A compact New York grocery interior with shelves and counter traffic",
    caption: "Get a free second opinion on the tools, bills, website, and handoffs.",
  },
  "it-support": {
    src: "/assets/pos.webp",
    alt: "Point of sale hardware on a small business counter",
    caption: "Repair email, POS, Wi-Fi, domains, devices, booking, and access.",
  },
  "custom-local-websites": {
    src: "/assets/nyc-hair-salon-street.webp",
    alt: "A New York hair salon storefront with a barber pole, a skyscraper rising behind it",
    caption: "Build the place customers call, book, buy, and learn to trust you.",
  },
  "business-systems": {
    src: "/assets/case-public-house-cockpit.webp",
    alt: "A custom estimating cockpit interface for a creative fabrication studio",
    caption: "Replace bloated subscriptions with focused software your business owns.",
  },
};

export default function ServiceEditorialSpread() {
  return (
    <section className="lf-service-spread" aria-labelledby="lf-service-spread-title">
      <div className="lf-service-spread__inner">
        <header className="lf-service-spread__head">
          <p className="lf-service-spread__kicker">How the work fits together</p>
          <h2 id="lf-service-spread-title" className="lf-service-spread__title">
            One front door. A whole tech team behind it.
          </h2>
          <p className="lf-service-spread__dek">
            The website wins attention. Support protects the day. Free consulting
            names the right next move. Custom software removes the monthly drag.
          </p>
        </header>

        <div className="lf-service-spread__layout">
          <figure className="lf-service-spread__lead">
            <img
              src="/assets/nyc-street.webp"
              alt="A New York street corner at dusk, a lit pharmacy and a small restaurant on the block"
              width={1600}
              height={1200}
              loading="lazy"
              decoding="async"
              {...responsiveImageProps(
                "/assets/nyc-street.webp",
                "(max-width: 720px) 100vw, 50vw",
              )}
            />
            <figcaption>
              Built for small teams where the website, the register, the inbox,
              and the follow-up path all affect the same day.
            </figcaption>
          </figure>

          <ol className="lf-service-spread__list">
            {SERVICE_ORDER.map((slug) => {
              const service = services.find((item) => item.slug === slug);
              if (!service) return null;
              const Icon = service.icon;
              const image = SERVICE_IMAGES[service.slug] ?? {
                src: service.image,
                alt: `${service.eyebrow} for New York small businesses`,
                caption: service.title,
              };

              return (
                <li key={service.slug} className="lf-service-spread__item">
                  <Link to={`/services/${service.slug}/`} className="lf-service-spread__link">
                    <span className="lf-service-spread__icon" aria-hidden="true">
                      <Icon size={24} strokeWidth={1.75} />
                    </span>
                    <span className="lf-service-spread__copy">
                      <span className="lf-service-spread__verb">{service.verb}</span>
                      <strong>{service.eyebrow}</strong>
                      <span>{image.caption}</span>
                    </span>
                    <span className="lf-service-spread__thumb" aria-hidden="true">
                      <img
                        src={image.src}
                        alt=""
                        width={1600}
                        height={1200}
                        loading="lazy"
                        decoding="async"
                        {...responsiveImageProps(image.src, "(max-width: 720px) 100vw, 50vw")}
                      />
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
                {...responsiveImageProps(
                  "/assets/nyc-stickys-steam.webp",
                  "(max-width: 720px) 100vw, 50vw",
                )}
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
                {...responsiveImageProps(
                  "/assets/coworking-laptops.webp",
                  "(max-width: 720px) 100vw, 50vw",
                )}
              />
              <figcaption>Owner view</figcaption>
            </figure>
          </aside>
        </div>
      </div>
    </section>
  );
}
