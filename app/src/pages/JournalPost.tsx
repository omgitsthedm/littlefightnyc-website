import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import MiniToc, { type TocItem } from "@/components/dataviz/MiniToc";
import { READ_MINUTES, WORD_COUNT } from "@/components/dataviz/journalStats";
import ShareButton from "@/components/ShareButton";
import journalIndex from "@/data/journal-index.json";
import { POST_IMAGE } from "@/data/journalArt";
import { prepareLegacyHtml } from "@/lib/legacyHtml";
import "@/styles/editorial/journal.css";

// Meta only (no html) — the ~250KB of post bodies is split OUT of this chunk.
type PostMeta = {
  slug: string;
  category: "blog" | "guide" | "essay" | "howto";
  title: string;
  description: string;
  published: string;
  updated: string;
  wordCount?: number;
};

// Each post body is its own chunk (scripts/split-journal.mjs writes one JSON per
// slug into src/data/journal-bodies/). Vite turns this glob into per-slug lazy
// imports, so a reader downloads only the body of the post they opened.
const BODY_LOADERS = import.meta.glob("../data/journal-bodies/*.json") as Record<
  string,
  () => Promise<{ default: { html: string } }>
>;

function loadBody(slug: string): Promise<string> {
  const loader = BODY_LOADERS[`../data/journal-bodies/${slug}.json`];
  if (!loader) return Promise.resolve("");
  return loader().then((m) => m.default?.html ?? "");
}

const CATEGORY_LABEL: Record<PostMeta["category"], string> = {
  howto: "How To",
  essay: "Essay",
  blog: "Notebook",
  guide: "Software Guide",
};

const CATEGORY_IMAGE: Record<PostMeta["category"], string> = {
  howto: "/assets/journal-cat-how-to.webp",
  essay: "/assets/journal-cat-essay.webp",
  blog: "/assets/journal-cat-notebook.webp",
  guide: "/assets/journal-cat-software-guide.webp",
};

// Branded per-post art (same visual language as the category art) — per-post
// stock photos retired 2026-07-12 (the donut-on-a-ghosting-article era is over).

function displayDate(post: PostMeta) {
  return post.published || post.updated || "May 7, 2026";
}

function dateTimeValue(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "2026-05-07" : parsed.toISOString().slice(0, 10);
}

/** Long-post threshold for the sticky mini-TOC (real word count). */
const TOC_MIN_WORDS = 1200;

/**
 * Prepare the legacy body for render:
 * - howto posts: tag the FIRST <ol> so CSS can style it as the stepper rail
 *   (pure string pass — un-flagged regex replaces the first match only);
 * - long posts (> TOC_MIN_WORDS words): give each <h2> a stable id and
 *   collect the mini-TOC items from the real headings in the html.
 */
function preparePostBody(post: PostMeta, rawHtml: string): { html: string; toc: TocItem[] } {
  let html = prepareLegacyHtml(rawHtml, { title: post.title });
  const toc: TocItem[] = [];

  if (post.category === "howto") {
    html = html.replace(/<ol(?=[\s>])/i, '<ol data-lf-steps=""');
  }

  if ((WORD_COUNT[post.slug] ?? 0) > TOC_MIN_WORDS) {
    let n = 0;
    html = html.replace(
      /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi,
      (match, attrs: string | undefined, inner: string) => {
        const label = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (!label) return match;
        n += 1;
        const id = `post-section-${n}`;
        toc.push({ id, label });
        return `<h2 id="${id}"${attrs ?? ""}>${inner}</h2>`;
      },
    );
  }

  return { html, toc };
}

export default function JournalPost() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const posts = journalIndex as unknown as PostMeta[];
  const post = posts.find((p) => p.slug === slug);

  // Body streams in from its own chunk. Meta (hero, byline, read-time) renders
  // instantly from the index; the body is a beat behind on a cold chunk fetch.
  // Tagged with its slug so a stale result from the previous post never renders
  // under the new one (and so we needn't reset state synchronously in the effect).
  const [prepared, setPrepared] = useState<{ slug: string; html: string; toc: TocItem[] } | null>(null);
  // The body chunk is modulepreloaded in the prerendered head (see
  // journalBodyModulePreload in prerender-seo.mjs), so on a fresh direct load it
  // resolves within a frame or two — faster than this timer. The skeleton then
  // never paints, avoiding a text→skeleton→text flash where the snapshot already
  // showed the article. It only appears on genuinely slow (SPA) fetches.
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!post) return;
    let alive = true;
    const skelTimer = window.setTimeout(() => {
      if (alive) setShowSkeleton(true);
    }, 220);
    loadBody(post.slug).then((raw) => {
      if (!alive) return;
      window.clearTimeout(skelTimer);
      const body = preparePostBody(post, raw);
      setPrepared({ slug: post.slug, html: body.html, toc: body.toc });
    });
    return () => {
      alive = false;
      window.clearTimeout(skelTimer);
    };
  }, [post]);

  if (!post) return <Navigate to="/journal/" replace />;

  // Only trust `prepared` when it belongs to the post currently on screen.
  const ready = prepared && prepared.slug === post.slug ? prepared : null;
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const published = displayDate(post);
  const toc = ready?.toc ?? [];
  const hasToc = toc.length >= 2;

  return (
    <>
      <PageHero
        eyebrow={CATEGORY_LABEL[post.category]}
        icon={BookOpen}
        title={
          // Shared-element morph target: pairs with the Journal hub's
          // featured/row title (`post-${slug}` — see Journal.tsx +
          // lib/viewTransition.ts). Inert without the View Transitions API.
          <span style={{ viewTransitionName: `post-${post.slug}` }}>
            {post.title}
          </span>
        }
        dek={post.description}
        image={{
          src: POST_IMAGE[post.slug] ?? CATEGORY_IMAGE[post.category],
          alt: `${CATEGORY_LABEL[post.category]} — Little Fight NYC journal`,
          width: 1600,
          height: 1200,
        }}
      />

      <article
        className="lf-post"
        itemScope
        itemType="https://schema.org/Article"
      >
        <div className="lf-post__inner" data-toc={hasToc ? "true" : undefined}>
          {hasToc && <MiniToc items={toc} />}
          <div className="lf-post__main">
          <p className="lf-post__byline byline">
            <span className="lf-post__byline-by">By</span>{" "}
            <span
              className="lf-post__byline-name author"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Organization"
            >
              <span itemProp="name">Little Fight NYC</span>
            </span>
            <span aria-hidden="true"> · </span>
            <span>Published </span>
            <time itemProp="datePublished" dateTime={dateTimeValue(published)}>{published}</time>
            {post.updated && post.updated !== published && (
              <>
                <span aria-hidden="true"> · </span>
                <span>Updated </span>
                <time itemProp="dateModified" dateTime={dateTimeValue(post.updated)}>{post.updated}</time>
              </>
            )}
            <span aria-hidden="true"> · </span>
            <span className="lf-journal__read lf-post__byline-read">
              ~{READ_MINUTES[post.slug]} min read
            </span>
            <span aria-hidden="true"> · </span>
            <ShareButton
              title={post.title}
              text={post.description}
              url={`https://littlefightnyc.com${pathname}`}
              label="Share"
            />
          </p>

          {ready ? (
            <div
              className="lf-post__body"
              data-post-category={post.category}
              dangerouslySetInnerHTML={{ __html: ready.html }}
            />
          ) : showSkeleton ? (
            <div className="lf-post__body lf-post__body--loading" aria-hidden="true">
              <span className="lf-post__skel-line" />
              <span className="lf-post__skel-line" />
              <span className="lf-post__skel-line lf-post__skel-line--short" />
              <span className="lf-post__skel-line" />
              <span className="lf-post__skel-line lf-post__skel-line--short" />
            </div>
          ) : (
            // Body resolving (preloaded chunk, ~1 frame). Render nothing rather
            // than a skeleton so a fast load never flashes text→skeleton→text.
            <div className="lf-post__body" aria-hidden="true" />
          )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="lf-post-related">
          <div className="lf-post-related__inner">
            <p className="lf-post-related__label">More from the Journal</p>
            <ol className="lf-journal__list">
              {related.map((r, i) => (
                <li key={r.slug} className="lf-journal__item">
                  <Link to={`/journal/${r.slug}/`} className="lf-journal__link">
                    <span className="lf-journal__num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="lf-journal__body">
                      <span className="lf-journal__title">{r.title}</span>
                      <span className="lf-journal__desc">{r.description}</span>
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
