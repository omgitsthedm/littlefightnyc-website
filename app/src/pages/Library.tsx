import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Blocks,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CircleHelp,
  CreditCard,
  Headset,
  HeartPulse,
  Library as LibraryIcon,
  MailWarning,
  MapPin,
  MapPinOff,
  MessageSquareWarning,
  MonitorSmartphone,
  Palette,
  PenTool,
  ReceiptText,
  Scissors,
  SearchCheck,
  ServerCrash,
  ShoppingBag,
  StarOff,
  Store,
  TableProperties,
  TabletSmartphone,
  UserRoundCheck,
  UserRoundX,
  UtensilsCrossed,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { READ_MINUTES } from "@/components/dataviz/journalStats";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import journal from "@/data/journal-index.json";
import { POST_IMAGE, CATEGORY_LABEL, CATEGORY_IMAGE } from "@/data/journalArt";
import { answerGuides } from "@/data/site";
import { ANSWER_CLUSTERS } from "@/data/answersArt";
import "@/styles/editorial/journal.css";
import "@/styles/editorial/answers.css";

/**
 * The Library — ONE front door for everything we've written (Fortress plan,
 * 2026-07-19). Replaces the separate /journal/ and /answers/ hubs (both 301
 * here); every detail URL is untouched. Order follows the Door Doctrine:
 * straight answers first (people arrive in pain), the Journal below (the
 * browse layer). Section anchors #answers / #journal keep deep intents alive.
 */

type Post = {
  slug: string;
  category: "blog" | "guide" | "essay" | "howto";
  title: string;
  description: string;
  published: string;
  updated: string;
};

const CATEGORY_ORDER: Post["category"][] = ["howto", "essay", "blog", "guide"];

type Filter = Post["category"] | "all";

const guideBySlug = new Map(answerGuides.map((guide) => [guide.slug, guide]));

const ANSWER_ICON_BY_SLUG: Record<string, LucideIcon> = {
  "website-down-emergency-nyc": ServerCrash,
  "pos-system-down-restaurant-nyc": CreditCard,
  "google-business-profile-suspended": MapPinOff,
  "website-form-not-working-small-business": MessageSquareWarning,
  "business-email-going-to-spam": MailWarning,
  "business-not-showing-on-google-maps": MapPin,
  "google-reviews-not-showing-up": StarOff,
  "is-local-seo-worth-it-reddit": SearchCheck,
  "google-business-profile-tips-reddit": Store,
  "reduce-monthly-software-costs-small-business": ReceiptText,
  "hair-salon-save-money-software": Scissors,
  "local-pharmacy-website-community-support": HeartPulse,
  "wix-vs-custom-website-reddit": Blocks,
  "squarespace-vs-hiring-web-designer-reddit": Palette,
  "shopify-vs-squarespace-reddit": ShoppingBag,
  "square-vs-toast-reddit": UtensilsCrossed,
  "glossgenius-vs-square-appointments-reddit": CalendarCheck,
  "airtable-vs-notion-reddit-small-business": TableProperties,
  "best-pos-system-small-business-reddit": TabletSmartphone,
  "when-custom-business-system-beats-saas": Workflow,
  "does-my-small-business-need-a-website-reddit": MonitorSmartphone,
  "best-web-designer-nyc-reddit": PenTool,
  "best-web-design-agency-nyc-reddit": BriefcaseBusiness,
  "small-business-it-support-nyc-reddit-recommendations": Headset,
  "how-to-find-good-it-guy-reddit": UserRoundCheck,
  "web-developer-ghosted-me-reddit": UserRoundX,
  "nyc-small-business-tech-help-reddit": Building2,
};

function postTime(published: string): number {
  const t = new Date(published).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export default function Library() {
  const posts = journal as unknown as Post[];
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(
    () => [...posts].sort((a, b) => postTime(b.published) - postTime(a.published)),
    [posts],
  );

  const counts = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABEL[cat],
    count: posts.filter((p) => p.category === cat).length,
  })).filter((c) => c.count > 0);

  const visible = filter === "all" ? sorted : sorted.filter((p) => p.category === filter);
  const featured = visible[0];
  const rows = visible.slice(1);

  const featuredRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const listRef = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  // Symptom clusters from answersArt.ts; unclaimed guides still render in a
  // trailing group so new answers never vanish.
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
        eyebrow="The Library"
        icon={LibraryIcon}
        title={
          <>
            Everything we know.
            <br />
            {" "}
            <span className="lf-em">Free.</span>
          </>
        }
        dek="Straight answers to the questions NYC owners actually ask, plus how-tos, essays, and software comparisons from the field. Short, plain, and not trying to sell you a thing."
        image={{
          src: "/assets/hero-ind-bookshop.webp",
          alt: "A reader browsing the shelves of an independent New York bookshop",
          width: 1600,
          height: 1200,
        }}
      />

      {/* ── Straight answers — the pain-first stream ── */}
      <section
        id="answers"
        className="lf-answers-hub"
        aria-label="All owner answers, grouped by symptom"
      >
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

                <div className="lf-answers-hub__grid" data-count={guides.length}>
                  {guides.map((guide, guideIndex) => {
                    const GuideIcon = ANSWER_ICON_BY_SLUG[guide.slug] ?? CircleHelp;
                    return (
                      <Link
                        key={guide.slug}
                        to={`/answers/${guide.slug}/`}
                        className={`lf-answers-hub__card${guideIndex === 0 ? " lf-answers-hub__card--lead" : ""}`}
                      >
                        <span className="lf-answers-hub__thumb" aria-hidden="true">
                          <GuideIcon size={34} strokeWidth={1.75} />
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
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {/* ── The Journal — the browse layer ── */}
      <section id="journal" aria-label="The Journal">
        <div className="lf-journal-filter">
          <div className="lf-journal-filter__inner" role="group" aria-label="Filter journal by type">
            <button
              type="button"
              className="lf-journal-filter__chip"
              data-active={filter === "all"}
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All <span className="lf-journal-filter__count">{posts.length}</span>
            </button>
            {counts.map((c) => (
              <button
                key={c.category}
                type="button"
                className="lf-journal-filter__chip"
                data-active={filter === c.category}
                aria-pressed={filter === c.category}
                onClick={() => setFilter(c.category)}
              >
                {c.label} <span className="lf-journal-filter__count">{c.count}</span>
              </button>
            ))}
          </div>
          <p
            aria-live="polite"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          >
            {visible.length} posts shown
          </p>
        </div>

        {/* Latest post, full width — the newest thing we wrote leads. */}
        {featured && (
          <section className="lf-journal-featured" aria-label="Latest post">
            <div ref={featuredRef} className="lf-journal-featured__inner" data-reveal>
              <Link
                to={`/journal/${featured.slug}/`}
                className="lf-journal-featured__card"
              >
                <span className="lf-journal-featured__media" aria-hidden="true">
                  <img {...skelImg}
                    src={POST_IMAGE[featured.slug] ?? CATEGORY_IMAGE[featured.category]}
                    alt=""
                    {...responsiveImageProps(
                      POST_IMAGE[featured.slug] ?? CATEGORY_IMAGE[featured.category],
                      "(min-width: 1024px) 52vw, 100vw",
                      [640, 900],
                    )}
                    width={1600}
                    height={1200}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="lf-journal-featured__copy">
                  <span className="lf-journal-featured__flag">Latest</span>
                  <span className="lf-journal-featured__chips">
                    <span className="lf-journal__cat">{CATEGORY_LABEL[featured.category]}</span>
                    <span className="lf-journal__read">~{READ_MINUTES[featured.slug]} min read</span>
                  </span>
                  <span
                    className="lf-journal-featured__title"
                    style={{ viewTransitionName: `post-${featured.slug}` }}
                  >
                    {featured.title}
                  </span>
                  <span className="lf-journal-featured__desc">{featured.description}</span>
                  <span className="lf-journal-featured__meta">{featured.published}</span>
                  <span className="lf-journal-featured__cta">
                    Read the entry
                    <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </div>
          </section>
        )}

        {/* Everything else — compact editorial rows. One list, no repeats. */}
        {rows.length > 0 && (
          <section className="lf-journal">
            <div ref={listRef} className="lf-journal__inner" data-reveal>
              <p className="lf-journal__group-label">All entries</p>
              <ol className="lf-journal__list">
                {rows.map((post, i) => (
                  <li key={post.slug} className="lf-journal__item">
                    <Link
                      to={`/journal/${post.slug}/`}
                      className="lf-journal__link lf-journal__link--thumb"
                    >
                      <span className="lf-journal__num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="lf-journal__thumb" aria-hidden="true">
                        <img {...skelImg}
                          src={POST_IMAGE[post.slug] ?? CATEGORY_IMAGE[post.category]}
                          alt=""
                          {...responsiveImageProps(
                            POST_IMAGE[post.slug] ?? CATEGORY_IMAGE[post.category],
                            "(min-width: 768px) 72px, 56px",
                            [480],
                          )}
                          width={120}
                          height={120}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                      <span className="lf-journal__body">
                        <span className="lf-journal__title">
                          <span style={{ viewTransitionName: `post-${post.slug}` }}>
                            {post.title}
                          </span>
                          <span className="lf-journal__chips">
                            <span className="lf-journal__cat">{CATEGORY_LABEL[post.category]}</span>
                            <span className="lf-journal__read">~{READ_MINUTES[post.slug]} min read</span>
                          </span>
                        </span>
                        <span className="lf-journal__desc">{post.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
      </section>

      <QuietContact />
    </>
  );
}
