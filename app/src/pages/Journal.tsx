import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Newspaper } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import PublishingHeatmap from "@/components/dataviz/PublishingHeatmap";
import { READ_MINUTES } from "@/components/dataviz/journalStats";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { useViewTransitionNav } from "@/lib/viewTransition";
import journal from "@/data/journal.json";
import { POST_IMAGE } from "@/data/journalArt";
import "@/styles/editorial/journal.css";

// Warm the post chunk before the morph so the new snapshot is the real page.
const preloadPost = () => import("@/pages/JournalPost");

type Post = {
  slug: string;
  category: "blog" | "guide" | "essay" | "howto";
  title: string;
  description: string;
  published: string;
  updated: string;
  html: string;
};

// Reading time comes from the shared journalStats module (words / 200,
// computed once at module scope from the real post html).

const CATEGORY_LABEL: Record<Post["category"], string> = {
  howto: "How To",
  essay: "Essay",
  blog: "Notebook",
  guide: "Software Guide",
};

const CATEGORY_IMAGE: Record<Post["category"], string> = {
  howto: "/assets/journal-cat-how-to.webp",
  essay: "/assets/journal-cat-essay.webp",
  blog: "/assets/journal-cat-notebook.webp",
  guide: "/assets/journal-cat-software-guide.webp",
};

// Branded art carries every card (per-post where it exists, category art
// otherwise) — stock photos retired 2026-07-12.

const CATEGORY_ORDER: Post["category"][] = ["howto", "essay", "blog", "guide"];

type Filter = Post["category"] | "all";

// journal.json dates are already human-readable ("February 7, 2026").
function postTime(published: string): number {
  const t = new Date(published).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export default function Journal() {
  const posts = journal as unknown as Post[];
  const [filter, setFilter] = useState<Filter>("all");

  // Newest first — one list, one presentation.
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
  const vtNav = useViewTransitionNav();

  return (
    <>
      <PageHero
        eyebrow="The Journal"
        icon={Newspaper}
        title={
          <>
            What we've been{" "}
            <br />
            <span className="lf-em">writing about.</span>
          </>
        }
        dek="How-tos, essays, software comparisons, and notes from working with NYC small businesses. Plain words, no upsell, occasionally cheeky."
        image={{
          src: "/assets/sign-groceries-snacks.webp",
          alt: "Hand-painted Groceries Snacks sign",
          width: 1800,
          height: 1200,
        }}
      />

      {/* Real publishing cadence, straight from journal.json dates. */}
      <PublishingHeatmap />

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
              viewTransition
              className="lf-journal-featured__card"
              onClick={vtNav(`/journal/${featured.slug}/`, preloadPost)}
            >
              <span className="lf-journal-featured__media" aria-hidden="true">
                <img
                  src={POST_IMAGE[featured.slug] ?? CATEGORY_IMAGE[featured.category]}
                  alt=""
                  {...responsiveImageProps(
                    POST_IMAGE[featured.slug] ?? CATEGORY_IMAGE[featured.category],
                    "(min-width: 1024px) 52vw, 100vw",
                    [640, 900],
                  )}
                  width={1600}
                  height={1200}
                  loading="eager"
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
                    viewTransition
                    className="lf-journal__link lf-journal__link--thumb"
                    onClick={vtNav(`/journal/${post.slug}/`, preloadPost)}
                  >
                    <span className="lf-journal__num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="lf-journal__thumb" aria-hidden="true">
                      <img
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

      <QuietContact />
    </>
  );
}
