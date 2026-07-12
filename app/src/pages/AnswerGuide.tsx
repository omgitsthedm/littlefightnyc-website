import { Link, Navigate, useParams } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { answerGuides } from "@/data/site";
import "@/styles/editorial/answers.css";

// A distinct frame per answer so no two share a hero.
const ANSWER_IMAGE: Record<string, string> = {
  "website-form-not-working-small-business": "/assets/hero-laptop.webp",
  "reduce-monthly-software-costs-small-business": "/assets/pos.webp",
  "business-not-showing-on-google-maps": "/assets/sign-more-shops.webp",
  "hair-salon-save-money-software": "/assets/nyc-hair-salon-street.webp",
  "local-pharmacy-website-community-support": "/assets/storefront-health-foods.webp",
  "when-custom-business-system-beats-saas": "/assets/coworking-laptops.webp",
  "best-web-designer-nyc-reddit": "/assets/hero-soho-crosswalk.webp",
  "best-web-design-agency-nyc-reddit": "/assets/coworking-laptops.webp",
  "small-business-it-support-nyc-reddit-recommendations": "/assets/storefront-beauty-supply.webp",
  "how-to-find-good-it-guy-reddit": "/assets/interior-spice-shop.webp",
  "squarespace-vs-hiring-web-designer-reddit": "/assets/websites.webp",
  "wix-vs-custom-website-reddit": "/assets/hero-laptop.webp",
  "is-local-seo-worth-it-reddit": "/assets/sign-more-shops.webp",
  "google-business-profile-tips-reddit": "/assets/storefront-blue-gift-shop.webp",
  "web-developer-ghosted-me-reddit": "/assets/owner.webp",
  "best-pos-system-small-business-reddit": "/assets/interior-grocery.webp",
  "square-vs-toast-reddit": "/assets/pizza-menu-chalkboard.webp",
  "glossgenius-vs-square-appointments-reddit": "/assets/nyc-hair-salon-street.webp",
  "shopify-vs-squarespace-reddit": "/assets/interior-jeans-rack.webp",
  "does-my-small-business-need-a-website-reddit": "/assets/storefront-shop-deli.webp",
  "airtable-vs-notion-reddit-small-business": "/assets/manhattan.webp",
  "nyc-small-business-tech-help-reddit": "/assets/nyc-street-crowd.webp",
  "google-business-profile-suspended": "/assets/nyc-chinatown-night.webp",
  "website-down-emergency-nyc": "/assets/nyc-stickys-steam.webp",
  "pos-system-down-restaurant-nyc": "/assets/pos.webp",
  "business-email-going-to-spam": "/assets/typing.webp",
  "google-reviews-not-showing-up": "/assets/storefront-health-foods.webp",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function displayDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

export default function AnswerGuide() {
  const { slug } = useParams();
  const guide = answerGuides.find((item) => item.slug === slug);
  const related = answerGuides.filter((item) => item.slug !== guide?.slug).slice(0, 3);

  if (!guide) return <Navigate to="/examples/#answers" replace />;

  return (
    <>
      <PageHero
        eyebrow="Owner Answer"
        icon={HelpCircle}
        title={<>{guide.question}</>}
        dek={guide.short.replace(/^Short answer:\s*/i, "")}
        image={{
          src: ANSWER_IMAGE[guide.slug] ?? "/assets/local-business.webp",
          alt: "",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-answer-page">
        <div className="lf-answer-page__inner">
          <p className="lf-answer-page__byline">
            <span>Little Fight NYC</span>
            <span aria-hidden="true"> · </span>
            <span>Published </span>
            <time dateTime={guide.published}>{displayDate(guide.published)}</time>
            <span aria-hidden="true"> · </span>
            <span>Updated </span>
            <time dateTime={guide.updated}>{displayDate(guide.updated)}</time>
          </p>

          {guide.sections.map((section) => (
            <article key={section.heading} className="lf-answer-page__section">
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </article>
          ))}

          {guide.faq.length > 0 && (
            <section className="lf-answer-page__faq">
              <p className="lf-answer-page__faq-title">Quick answers</p>
              <div className="lf-answer-page__faq-list">
                {guide.faq.map((item) => (
                  <div key={item.question}>
                    <h3 className="lf-answer-page__faq-q">{item.question}</h3>
                    <p className="lf-answer-page__faq-a">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section
              style={{
                marginTop: "var(--lf-space-9)",
                paddingTop: "var(--lf-space-7)",
                borderTop: "1px solid var(--lf-hairline)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--lf-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--lf-bone-dim)",
                  margin: "0 0 var(--lf-space-5)",
                }}
              >
                Related reading
              </p>
              <ul className="lf-answers-index__list" style={{ borderTop: "1px solid var(--lf-hairline)" }}>
                {related.map((item, i) => (
                  <li key={item.slug} className="lf-answers-index__item">
                    <Link to={`/answers/${item.slug}/`} className="lf-answers-index__link">
                      <span className="lf-answers-index__num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="lf-answers-index__body">
                        <span className="lf-answers-index__q">{item.question}</span>
                        <span className="lf-answers-index__short">{item.short}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>

      <QuietContact />
    </>
  );
}
