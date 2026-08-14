import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import ShareButton from "@/components/ShareButton";
import AnswerDiagram from "@/components/dataviz/AnswerDiagram";
import AnswerStepper from "@/components/dataviz/AnswerStepper";
import MoneyLeakMeter from "@/components/dataviz/MoneyLeakMeter";
import {
  BreakEvenCustomerCount,
  DowntimeClock,
  SubscriptionStack,
} from "@/components/dataviz/OwnerCalculators";
import { answerGuides, answerServiceBridge } from "@/data/site";
import {
  ANSWER_CLUSTERS,
  answerArt,
  answerVisualKind,
} from "@/data/answersArt";
import { PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";
import "@/styles/editorial/answers.css";
import "@/styles/editorial/longform-routes.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function displayDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

/** Same-cluster guides first (same symptom family), then the rest. */


/** Emergency-tempo doors (Door Doctrine): someone mid-crisis gets the way
 *  out FIRST — the service bridge renders above the reading, not after it. */
const EMERGENCY = new Set([
  "website-down-emergency-nyc",
  "pos-system-down-restaurant-nyc",
  "business-email-going-to-spam",
  "google-business-profile-suspended",
  "website-form-not-working-small-business",
]);

function ServiceBridge({ slug, urgent }: { slug: string; urgent?: boolean }) {
  const bridge = answerServiceBridge[slug];
  if (!bridge) return null;
  return (
    <aside className="lf-answer-page__bridge" data-urgent={urgent || undefined}>
      <p className="lf-answer-page__bridge-eyebrow">
        {urgent ? "Need help right now?" : "Want a hand with this?"}
      </p>
      <p>
        <a href={PHONE_HREF}>Call {PHONE_DISPLAY}</a>{" · "}
        <a href={SMS_HREF}>Text</a>{" · "}
        <a href="mailto:hello@littlefightnyc.com">Email</a>{" · "}
        <Link to="/tech-audit/">Start a free first look</Link>
      </p>
      <Link
        to={bridge.to}
        className="lf-answer-page__bridge-link"
        data-lf-event="door_bridge"
        data-lf-label={slug}
      >
        <span className="lf-answer-page__bridge-name">{bridge.name}</span>
        <span className="lf-answer-page__bridge-line">{bridge.line}</span>
      </Link>
    </aside>
  );
}

function relatedGuides(slug: string) {
  const cluster = ANSWER_CLUSTERS.find((c) => c.slugs.includes(slug));
  const siblings = cluster ? cluster.slugs.filter((s) => s !== slug) : [];
  const rank = (s: string) => (siblings.includes(s) ? 0 : 1);
  return answerGuides
    .filter((item) => item.slug !== slug)
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .slice(0, 3);
}

function AnswerOwnerMath({ slug }: { slug: string }) {
  if (slug === "website-form-not-working-small-business") return <MoneyLeakMeter />;
  if (slug === "website-down-emergency-nyc" || slug === "pos-system-down-restaurant-nyc") return <DowntimeClock />;
  if (slug === "reduce-monthly-software-costs-small-business" || slug === "hair-salon-save-money-software") return <SubscriptionStack />;
  if (slug === "wix-vs-custom-website-reddit" || slug === "does-my-small-business-need-a-website-reddit") return <BreakEvenCustomerCount />;
  return null;
}

export default function AnswerGuide() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const guide = answerGuides.find((item) => item.slug === slug);

  if (!guide) return <Navigate to="/examples/#answers" replace />;

  const related = relatedGuides(guide.slug);
  const visualKind = answerVisualKind(guide.slug);
  const sources = guide.sections.flatMap((section) => section.sources ?? []);

  return (
    <div className="lf-longform-route lf-longform-route--answer">
      <PageHero
        eyebrow="Owner Answer"
        icon={HelpCircle}
        title={<>{guide.question}</>}
        quickAnswer={guide.short.replace(/^Short answer:\s*/i, "")}
        image={{
          src: answerArt(guide.slug),
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
            <span aria-hidden="true"> · </span>
            <ShareButton
              title={guide.question}
              text={guide.short}
              url={`https://littlefightnyc.com${pathname}`}
              label="Share"
            />
          </p>

          <ServiceBridge slug={guide.slug} urgent={EMERGENCY.has(guide.slug)} />

          <section
            className="lf-answer-page__feature"
            aria-label="A visual read of this answer"
            data-lf-visual-proof="answer"
          >
            {visualKind === "diagram" && <AnswerDiagram slug={guide.slug} />}
            {visualKind === "stepper" && (
              <AnswerStepper
                sections={guide.sections}
                label={EMERGENCY.has(guide.slug) ? "Triage steps, in order" : "The useful path, in order"}
              />
            )}
          </section>

          {visualKind === "stepper" && sources.length > 0 && (
            <p className="lf-answer-page__section-source">
              Check the official source: {" "}
              {sources.map((source, index) => (
                <span key={source.url}>
                  {index > 0 ? " · " : null}
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label} ↗
                  </a>
                </span>
              ))}
            </p>
          )}

          <AnswerOwnerMath slug={guide.slug} />

          {visualKind === "diagram" && (
            <div
              className="lf-answer-page__sections"
              data-count={guide.sections.length}
              data-layout="guide"
            >
              {guide.sections.map((section) => (
                <article key={section.heading} className="lf-answer-page__section">
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                  {section.sources?.length ? (
                    <p className="lf-answer-page__section-source">
                      Check the official source: {" "}
                      {section.sources.map((source, index) => (
                        <span key={source.url}>
                          {index > 0 ? " · " : null}
                          <a href={source.url} target="_blank" rel="noreferrer">
                            {source.label} ↗
                          </a>
                        </span>
                      ))}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}

          {guide.faq.length > 0 && (
            <section className="lf-answer-page__faq">
              <p className="lf-answer-page__faq-title">Quick answers</p>
              <div className="lf-answer-page__faq-list" data-count={guide.faq.length}>
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
            <section className="lf-answer-page__related">
              <p className="lf-answer-page__related-title">Related reading</p>
              <ul className="lf-answers-index__list lf-answer-page__related-list">
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
    </div>
  );
}
