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
  const [query, setQuery] = useState("");
  const [openClusters, setOpenClusters] = useState(() => new Set(["urgent"]));
  const [showAllPosts, setShowAllPosts] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const sorted = useMemo(
    () => [...posts].sort((a, b) => postTime(b.published) - postTime(a.published)),
    [posts],
  );

  const counts = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABEL[cat],
    count: posts.filter((p) => p.category === cat).length,
  })).filter((c) => c.count > 0);

  const visible = (filter === "all" ? sorted : sorted.filter((p) => p.category === filter))
    .filter((post) => {
      if (!normalizedQuery) return true;
      return [post.title, post.description, CATEGORY_LABEL[post.category]]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    });
  const featured = visible[0];
  const rows = visible.slice(1);
  const displayedRows = normalizedQuery || showAllPosts ? rows : rows.slice(0, 8);
  const hiddenRowCount = rows.length - displayedRows.length;

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
  const visibleClusters = clusters
    .map((cluster) => ({
      ...cluster,
      guides: cluster.slugs
        .map((slug) => guideBySlug.get(slug))
        .filter((guide) => guide !== undefined)
        .filter((guide) => {
          if (!normalizedQuery) return true;
          return [guide.question, guide.short]
            .join(" ")
            .toLocaleLowerCase()
            .includes(normalizedQuery);
        }),
    }))
    .filter((cluster) => cluster.guides.length > 0);
  const answerResultCount = visibleClusters.reduce(
    (total, cluster) => total + cluster.guides.length,
    0,
  );
  const totalResults = answerResultCount + visible.length;

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
        dek="Straight answers to the questions NYC owners actually ask, plus practical guides and field notes. Useful whether you hire us or not."
        image={{
          src: "/assets/hero-ind-bookshop.webp",
          alt: "A reader browsing the shelves of an independent New York bookshop",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-library-find" aria-labelledby="lf-library-find-title">
        <div className="lf-library-find__inner">
          <div className="lf-library-find__intro">
            <p className="lf-library-find__eyebrow">Start with your situation</p>
            <h2 id="lf-library-find-title">What do you need today?</h2>
          </div>

          <div className="lf-library-find__doors">
            <a
              className="lf-library-find__door"
              href="#answers-urgent"
              onClick={() =>
                setOpenClusters((current) => new Set(current).add("urgent"))
              }
            >
              <ServerCrash aria-hidden="true" />
              <span>
                <strong>Fix something</strong>
                <small>Website, email, POS, Google, or another urgent problem.</small>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a
              className="lf-library-find__door"
              href="#answers-compare"
              onClick={() =>
                setOpenClusters((current) => new Set(current).add("compare"))
              }
            >
              <TableProperties aria-hidden="true" />
              <span>
                <strong>Choose a tool</strong>
                <small>Clear comparisons before you spend money or rebuild.</small>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="lf-library-find__door" href="#journal">
              <LibraryIcon aria-hidden="true" />
              <span>
                <strong>Learn the system</strong>
                <small>How-tos, field notes, and ideas for running the business better.</small>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <label className="lf-library-find__search">
            <SearchCheck aria-hidden="true" />
            <span className="lf-library-find__search-label">Search the Library</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setFilter("all");
                setShowAllPosts(false);
              }}
              placeholder="Try “Wi-Fi,” “website,” or “Square vs Toast”"
              autoComplete="off"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")}>
                Clear
              </button>
            )}
          </label>

          <p className="lf-library-find__status" aria-live="polite">
            {normalizedQuery
              ? `${totalResults} result${totalResults === 1 ? "" : "s"} for “${query.trim()}”`
              : `${answerGuides.length} straight answers and ${posts.length} field notes`}
          </p>
        </div>
      </section>

      {/* ── Straight answers — the pain-first stream ── */}
      <section
        id="answers"
        className="lf-answers-hub"
        aria-label="All owner answers, grouped by symptom"
      >
        <div className="lf-answers-hub__inner">
          {visibleClusters.map((cluster) => (
              <details
                id={`answers-${cluster.key}`}
                key={cluster.key}
                className="lf-answers-hub__cluster"
                open={Boolean(normalizedQuery) || openClusters.has(cluster.key)}
                onToggle={(event) => {
                  if (normalizedQuery) return;
                  const isOpen = event.currentTarget.open;
                  setOpenClusters((current) => {
                    const next = new Set(current);
                    if (isOpen) next.add(cluster.key);
                    else next.delete(cluster.key);
                    return next;
                  });
                }}
              >
                <summary className="lf-answers-hub__head">
                  <span className="lf-answers-hub__heading">
                    <span className="lf-answers-hub__label">{cluster.label}</span>
                    <span className="lf-answers-hub__title">{cluster.title}</span>
                  </span>
                  <span className="lf-answers-hub__count">
                    {cluster.guides.length}
                    <span aria-hidden="true" className="lf-answers-hub__toggle" />
                  </span>
                </summary>

                <div className="lf-answers-hub__grid" data-count={cluster.guides.length}>
                  {cluster.guides.map((guide, guideIndex) => {
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
              </details>
          ))}
          {normalizedQuery && answerResultCount === 0 && (
            <div className="lf-library-empty">
              <h2>No straight answer matched that phrase.</h2>
              <p>Try a shorter term, or browse the field notes below.</p>
            </div>
          )}
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
              onClick={() => {
                setFilter("all");
                setShowAllPosts(false);
              }}
              disabled={Boolean(normalizedQuery)}
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
                onClick={() => {
                  setFilter(c.category);
                  setShowAllPosts(false);
                }}
                disabled={Boolean(normalizedQuery)}
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
            {visible.length} field notes shown
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
                {displayedRows.map((post) => (
                  <li key={post.slug} className="lf-journal__item">
                    <Link
                      to={`/journal/${post.slug}/`}
                      className="lf-journal__link lf-journal__link--thumb"
                    >
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
              {hiddenRowCount > 0 && (
                <button
                  type="button"
                  className="lf-journal__more"
                  onClick={() => setShowAllPosts(true)}
                >
                  Show all {visible.length} entries
                  <span aria-hidden="true">↓</span>
                </button>
              )}
            </div>
          </section>
        )}
        {normalizedQuery && visible.length === 0 && (
          <div className="lf-library-empty lf-library-empty--journal">
            <h2>No field note matched that phrase.</h2>
            <p>Clear the search to browse every entry.</p>
            <button type="button" onClick={() => setQuery("")}>Show everything</button>
          </div>
        )}
      </section>

      <QuietContact />
    </>
  );
}
