import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { answerGuides } from "@/data/site";
import { ANSWER_CLUSTERS, answerArt } from "@/data/answersArt";
import "@/styles/editorial/answers.css";

const guideBySlug = new Map(answerGuides.map((guide) => [guide.slug, guide]));

export default function Answers() {
  // Symptom clusters from answersArt.ts; any guide not claimed by a cluster
  // still renders in a trailing group so new answers never vanish.
  const claimed = new Set(ANSWER_CLUSTERS.flatMap((cluster) => cluster.slugs));
  const orphans = answerGuides.filter((guide) => !claimed.has(guide.slug));
  const clusters = [
    ...ANSWER_CLUSTERS,
    ...(orphans.length > 0
      ? [
          {
            key: "more",
            label: "More answers",
            title: "The rest of the library.",
            slugs: orphans.map((guide) => guide.slug),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHero
        eyebrow="Owner Answers"
        icon={HelpCircle}
        title={
          <>
            Plain answers,<br />
            <span className="lf-em">no selling.</span>
          </>
        }
        dek="Real questions NYC owners ask us. Each answer is short, direct, and not trying to make a sale. Start with the symptom — the kind of thing you actually notice first."
        image={{
          src: "/assets/nyc-street.webp",
          alt: "A New York side street at human scale",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-answers-hub" aria-label="All owner answers, grouped by symptom">
        <div className="lf-answers-hub__inner">
          {clusters.map((cluster, clusterIndex) => {
            const guides = cluster.slugs
              .map((slug) => guideBySlug.get(slug))
              .filter((guide) => guide !== undefined);
            if (guides.length === 0) return null;

            return (
              <section key={cluster.key} className="lf-answers-hub__cluster">
                <header className="lf-answers-hub__head">
                  <p className="lf-answers-hub__label">
                    {String(clusterIndex + 1).padStart(2, "0")} · {cluster.label}
                  </p>
                  <h2 className="lf-answers-hub__title">{cluster.title}</h2>
                </header>

                <div className="lf-answers-hub__grid">
                  {guides.map((guide) => (
                    <Link
                      key={guide.slug}
                      to={`/answers/${guide.slug}/`}
                      className="lf-answers-hub__card"
                    >
                      <span className="lf-answers-hub__thumb" aria-hidden="true">
                        <img
                          src={answerArt(guide.slug).replace(".webp", "-480.webp")}
                          alt=""
                          width={480}
                          height={360}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                      <span className="lf-answers-hub__copy">
                        <span className="lf-answers-hub__q">{guide.question}</span>
                        <span className="lf-answers-hub__short">
                          {guide.short.replace(/^Short answer:\s*/i, "")}
                        </span>
                        <span className="lf-answers-hub__open">
                          Read the answer <span aria-hidden="true">→</span>
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <QuietContact />
    </>
  );
}
