import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { areaPages, caseStudies, services } from "@/data/site";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import EditorialFigure from "@/components/editorial/EditorialFigure";
import PullQuote from "@/components/editorial/PullQuote";
import QuietContact from "@/components/editorial/QuietContact";
import ServiceDiagram from "@/components/dataviz/ServiceDiagram";
import ShareButton from "@/components/ShareButton";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import "@/styles/editorial/service-detail.css";

const FIGURE_CAPTION: Record<string, string> = {
  "tech-consulting": "The unglamorous middle of the stack — where the money quietly leaks.",
  "it-support": "The register, the reader, the tablet — the tools the day actually runs on.",
  "custom-local-websites": "Built for your block, not picked from a template menu.",
  "business-systems": "One source of truth instead of a stack of spreadsheets and memory.",
};

const FEATURE_IMAGE: Record<string, string> = {
  "tech-consulting": "/assets/local-business.webp",
  "it-support": "/assets/typing.webp",
  "custom-local-websites": "/assets/case-hair-by-rachel-charles.webp",
  "business-systems": "/assets/pos.webp",
};

const LEGACY_SLUG_MAP: Record<string, string> = {
  websites: "custom-local-websites",
  "local-search": "tech-consulting",
};

const AREA_ROUTE_SLUG: Record<string, string> = {
  "custom-local-websites": "websites",
  "tech-consulting": "local-search",
};

// Per-service closing band — the last line matches the page you just read.
const CLOSING_LINE: Record<string, { heading: string; lede: string }> = {
  "tech-consulting": {
    heading: "Want us to read your setup?",
    lede: "The first hour is free. We tell you what to keep, what to cut, and what to fix first. If you do not need us, we say so.",
  },
  "it-support": {
    heading: "Something broken right now?",
    lede: "Call, 9am-9pm New York time. We will assess the immediate issue and confirm the next step. If it needs hands, we can be on site within 24 hours.",
  },
  "custom-local-websites": {
    heading: "Want a site that pulls its weight?",
    lede: "Tell us about your business. If we build your site, it is live in 14 days — or you don't pay.",
  },
  "business-systems": {
    heading: "Tired of running it all by hand?",
    lede: "Tell us how your day works. We will show you what the software should be doing for you instead.",
  },
};

function areaRouteSlug(serviceSlug: string) {
  return AREA_ROUTE_SLUG[serviceSlug] ?? serviceSlug;
}

function WebsiteAcquisitionBlock() {
  const proof = caseStudies.find((study) => study.slug === "hair-by-rachel-charles");
  if (!proof) return null;

  return (
    <section className="lf-sd-web" aria-labelledby="lf-sd-web-title">
      <div className="lf-sd-web__inner">
        <div className="lf-sd-web__proof">
          <Link className="lf-sd-web__shot" to={`/case-studies/${proof.slug}/`}>
            <img
              {...skelImg}
              src={proof.image}
              {...responsiveImageProps(proof.image, "(min-width: 960px) 48vw, 100vw", [480, 640, 900])}
              alt={`The ${proof.client} website as it shipped`}
              width={1600}
              height={1200}
              loading="lazy"
              decoding="async"
            />
          </Link>
          <div className="lf-sd-web__proof-copy">
            <p className="lf-sd-web__label">A website result you can open</p>
            <h2 id="lf-sd-web-title">Instagram-only to a real booking site in two weeks.</h2>
            <p>{proof.result}</p>
            {proof.metrics && (
              <dl className="lf-sd-web__metrics">
                {proof.metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt>{metric.value}</dt>
                    <dd>{metric.label}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="lf-sd-web__actions">
              <Link
                className="lf-sd-web__primary"
                to="/tech-audit/?intent=website&source=website_service_proof"
                data-lf-event="website_plan_intent"
                data-lf-label="website_service_proof"
              >
                Plan my website
              </Link>
              <Link className="lf-sd-web__secondary" to={`/case-studies/${proof.slug}/`}>
                Read the case study
              </Link>
            </div>
            <div className="lf-sd-web__owner">
              <img
                src="/assets/founder-david-marsh.webp"
                alt=""
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
              />
              <p>
                <strong>David Marsh, founder.</strong> One accountable owner on every project.{" "}
                <Link to="/about/">How we work</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="lf-sd-web__terms">
          <header className="lf-sd-web__terms-head">
            <h2>Know the fit before the quote.</h2>
            <p>The first read is free. The scope, responsibilities, and exact quote are written down before work starts.</p>
          </header>
          <dl className="lf-sd-web__terms-grid">
            <div>
              <dt>Works best for</dt>
              <dd>Owner-led businesses where calls, bookings, visits, or qualified inquiries matter, and one team should own the path.</dd>
            </div>
            <div>
              <dt>Not the right fit</dt>
              <dd>A large catalog that changes every day may belong on a maintained commerce platform. A working site may need a cleanup, not a rebuild.</dd>
            </div>
            <div>
              <dt>What we need from you</dt>
              <dd>One decision-maker, accurate services and hours, usable brand assets, and access to the domain and business tools. Never send passwords through the form.</dd>
            </div>
            <div>
              <dt>Scope, ownership, and care</dt>
              <dd>The written scope names review rounds, launch responsibilities, timing, and care. You own the code, domain, and content.</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const resolved = slug && LEGACY_SLUG_MAP[slug] ? LEGACY_SLUG_MAP[slug] : slug;
  if (slug && LEGACY_SLUG_MAP[slug]) {
    return <Navigate to={`/services/${resolved}/`} replace />;
  }
  const service = services.find((item) => item.slug === resolved);
  if (!service) return <Navigate to="/services/" replace />;

  const related = services.filter((item) => item.slug !== service.slug);

  return (
    <>
      <PageHero
        eyebrow={`Service · ${service.verb}`}
        icon={service.icon}
        title={<>{service.headline}</>}
        dek={service.shortAnswer.replace(/^Short answer:\s*/i, "")}
        image={{
          src: FEATURE_IMAGE[service.slug] ?? service.image,
          alt: service.slug === "custom-local-websites"
            ? "The Hair By Rachel Charles booking website as it shipped"
            : `${service.eyebrow} for New York small businesses`,
          width: 1200,
          height: 900,
        }}
      />

      <section className="lf-sd">
        <div className="lf-sd__inner">
          <EditorialBody dropcap>
            <p>{service.plain}</p>
            <PullQuote cite="What you can count on">{service.outcome}</PullQuote>
            <ServiceDiagram slug={service.slug} />
          </EditorialBody>

          <aside className="lf-sd__aside">
            <p className="lf-sd__aside-label">What's included</p>
            <ul className="lf-sd__aside-list">
              {service.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {service.slug === "custom-local-websites" && <WebsiteAcquisitionBlock />}

      <section className="lf-sd-deep">
        <div className="lf-sd-deep__inner">
          <p className="lf-sd-deep__label">What this service actually does</p>
          <div className="lf-sd-deep__prose">
            {service.whatItDoes.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <EditorialFigure
            src={service.image}
            alt=""
            caption={FIGURE_CAPTION[service.slug] ?? ""}
            width={1600}
            height={1067}
          />
        </div>
      </section>

      <section className="lf-sd-issues">
        <div className="lf-sd-issues__inner">
          <header className="lf-sd-issues__head">
            <p className="lf-sd-issues__label">Common issues we see</p>
            <h2 className="lf-sd-issues__title">What we actually walk into.</h2>
          </header>
          <ol className="lf-sd-issues__list">
            {service.commonIssues.map((issue, i) => (
              <li key={i} className="lf-sd-issues__item">
                <span className="lf-sd-issues__numeral" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="lf-sd-issues__body">
                  <h3 className="lf-sd-issues__item-title">{issue.title}</h3>
                  <p className="lf-sd-issues__item-text">{issue.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lf-sd-fallacies">
        <div className="lf-sd-fallacies__inner">
          <header className="lf-sd-fallacies__head">
            <p className="lf-sd-fallacies__label">Common fallacies</p>
            <h2 className="lf-sd-fallacies__title">What people are usually wrong about.</h2>
          </header>
          <dl className="lf-sd-fallacies__list">
            {service.fallacies.map((f, i) => (
              <div key={i} className="lf-sd-fallacies__item">
                <dt className="lf-sd-fallacies__myth">
                  <span className="lf-sd-fallacies__tag">Myth</span>
                  <span className="lf-sd-fallacies__myth-text">"{f.myth}"</span>
                </dt>
                <dd className="lf-sd-fallacies__reality">
                  <span className="lf-sd-fallacies__tag lf-sd-fallacies__tag--reality">Reality</span>
                  <span>{f.reality}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {service.faq.length > 0 && (
        <section className="lf-sd-faq">
          <div className="lf-sd-faq__inner">
            <h2 className="lf-sd-faq__title">Owner questions, answered plainly.</h2>
            <dl className="lf-sd-faq__list">
              {service.faq.map((item) => (
                <div key={item.question} className="lf-sd-faq__item">
                  <dt className="lf-sd-faq__q">{item.question}</dt>
                  <dd className="lf-sd-faq__a">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <section className="lf-sd-local">
        <div className="lf-sd-local__inner">
          <p className="lf-sd-local__label">Neighborhood pages</p>
          <ul className="lf-sd-local__list">
            {areaPages.map((area) => (
              <li key={area.slug}>
                <Link
                  className="lf-sd-local__link"
                  to={`/areas/${area.slug}/${areaRouteSlug(service.slug)}/`}
                >
                  <span>{service.eyebrow}</span>
                  <strong>{area.name}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lf-sd-related">
        <div className="lf-sd-related__inner">
          <p className="lf-sd-related__label">Other ways we help</p>
          <ul className="lf-sd-related__list">
            {related.map((item) => (
              <li key={item.slug}>
                <Link to={`/services/${item.slug}/`} className="lf-sd-related__link">
                  <span className="lf-sd-related__verb">{item.verb}</span>
                  <span className="lf-sd-related__name">{item.eyebrow}</span>
                  <span className="lf-sd-related__line">{item.headline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="lf-sd-share">
        <ShareButton
          title={service.headline}
          text={service.shortAnswer.replace(/^Short answer:\s*/i, "")}
          url={`https://littlefightnyc.com${pathname}`}
        />
      </div>

      <QuietContact
        heading={CLOSING_LINE[service.slug]?.heading ?? "Tell us what's broken."}
        lede={CLOSING_LINE[service.slug]?.lede}
      />
    </>
  );
}
