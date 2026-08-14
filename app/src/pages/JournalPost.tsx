import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import MiniToc, { type TocItem } from "@/components/dataviz/MiniToc";
import JournalInsight, { type JournalInsightData } from "@/components/dataviz/JournalInsight";
import {
  CopyPasteTax,
  DowntimeClock,
  SubscriptionStack,
} from "@/components/dataviz/OwnerCalculators";
import TugMark from "@/components/editorial/TugMark";
import { READ_MINUTES, WORD_COUNT } from "@/components/dataviz/journalStats";
import ShareButton from "@/components/ShareButton";
import journalIndex from "@/data/journal-index.json";
import { POST_IMAGE, CATEGORY_LABEL, CATEGORY_IMAGE } from "@/data/journalArt";
import { prepareLegacyHtml } from "@/lib/legacyHtml";
import { authoredDate } from "@/lib/authoredDate";
import { PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";
import "@/styles/editorial/journal.css";
import "@/styles/editorial/longform-routes.css";

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
  () => Promise<{ default: { html: string; insight: JournalInsightData } }>
>;

function loadBody(slug: string): Promise<{ html: string; insight: JournalInsightData } | null> {
  const loader = BODY_LOADERS[`../data/journal-bodies/${slug}.json`];
  if (!loader) return Promise.resolve(null);
  return loader().then((m) => m.default ?? null);
}

// Branded per-post art (same visual language as the category art) — per-post
// stock photos retired 2026-07-12 (the donut-on-a-ghosting-article era is over).

/** Long-post threshold for the sticky mini-TOC (real word count). */
const TOC_MIN_WORDS = 1200;

const RELATED_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "business",
  "for",
  "from",
  "guide",
  "how",
  "in",
  "is",
  "it",
  "nyc",
  "of",
  "on",
  "or",
  "small",
  "the",
  "to",
  "what",
  "when",
  "why",
  "with",
  "your",
]);

function relatedTerms(post: PostMeta): Set<string> {
  const words = `${post.title} ${post.description}`.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return new Set(words.filter((word) => word.length > 2 && !RELATED_STOP_WORDS.has(word)));
}

function postTimestamp(post: PostMeta): number {
  const date = authoredDate(post.updated) ?? authoredDate(post.published);
  return date ? Date.parse(date.iso) : 0;
}

/**
 * Related reading comes only from authored metadata: category, words already
 * present in the title/dek, and the verified publish/update dates. Keep two
 * close reads, then one different-category door when available so the module
 * is useful without pretending a hand-curated relationship that does not exist.
 */
function selectRelatedPosts(posts: PostMeta[], current: PostMeta): PostMeta[] {
  const currentTerms = relatedTerms(current);
  const ranked = posts
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate, index) => {
      const overlap = [...relatedTerms(candidate)].filter((term) => currentTerms.has(term)).length;
      return {
        candidate,
        index,
        overlap,
        sameCategory: candidate.category === current.category,
        timestamp: postTimestamp(candidate),
      };
    })
    .sort(
      (a, b) =>
        Number(b.sameCategory) - Number(a.sameCategory) ||
        b.overlap - a.overlap ||
        b.timestamp - a.timestamp ||
        a.index - b.index,
    );

  const selected = ranked.slice(0, 2);
  const selectedSlugs = new Set(selected.map(({ candidate }) => candidate.slug));
  const complement = ranked
    .filter(
      ({ candidate }) =>
        !selectedSlugs.has(candidate.slug) && candidate.category !== current.category,
    )
    .sort(
      (a, b) =>
        b.overlap - a.overlap || b.timestamp - a.timestamp || a.index - b.index,
    )[0];

  if (complement) {
    selected.push(complement);
    selectedSlugs.add(complement.candidate.slug);
  }

  for (const item of ranked) {
    if (selected.length >= 3) break;
    if (!selectedSlugs.has(item.candidate.slug)) selected.push(item);
  }

  return selected.map(({ candidate }) => candidate);
}

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

  // On compact screens comparison tables become horizontally scrollable.
  // Keep that overflow region keyboard-reachable without changing the table's
  // native semantics or any authored cells.
  html = html.replace(/<table(?![^>]*\btabindex=)([^>]*)>/gi, '<table tabindex="0"$1>');

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

function JournalCalculator({ slug }: { slug: string }) {
  if (slug === "the-pen-and-paper-tax") return <CopyPasteTax />;
  if (slug === "read-your-monthly-software-bill" || slug === "custom-business-system-vs-saas-subscriptions") {
    return <SubscriptionStack />;
  }
  if (slug === "what-to-do-when-business-wifi-keeps-dropping" || slug === "signs-your-pos-is-about-to-fail") {
    return <DowntimeClock />;
  }
  return null;
}

function JournalActionBridge({ category }: { category: PostMeta["category"] }) {
  const lead = category === "howto"
    ? "Want help doing this without breaking the day?"
    : "Want us to look at your real setup?";

  return (
    <p className="lf-post__answer">
      <strong>{lead}</strong>{" "}
      <a href={PHONE_HREF}>Call {PHONE_DISPLAY}</a>{" · "}
      <a href={SMS_HREF}>Text</a>{" · "}
      <a href="mailto:hello@littlefightnyc.com">Email</a>{" · "}
      <Link to="/tech-audit/">Start a free first look</Link>
    </p>
  );
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
  const [prepared, setPrepared] = useState<{
    slug: string;
    html: string;
    toc: TocItem[];
    insight: JournalInsightData;
  } | null>(null);
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
    loadBody(post.slug).then((payload) => {
      if (!alive) return;
      window.clearTimeout(skelTimer);
      if (!payload) return;
      const body = preparePostBody(post, payload.html);
      setPrepared({ slug: post.slug, html: body.html, toc: body.toc, insight: payload.insight });
    });
    return () => {
      alive = false;
      window.clearTimeout(skelTimer);
    };
  }, [post]);

  if (!post) return <Navigate to="/library/" replace />;

  // Only trust `prepared` when it belongs to the post currently on screen.
  const ready = prepared && prepared.slug === post.slug ? prepared : null;
  const related = selectRelatedPosts(posts, post);
  const published = authoredDate(post.published);
  const updated = authoredDate(post.updated);
  const toc = ready?.toc ?? [];
  const hasToc = toc.length >= 2;

  return (
    <div className="lf-longform-route lf-longform-route--journal">
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
        {/* The reading tug: sails down the article's left rail as you read —
            pure CSS scroll-driven animation (journal.css), desktop-only,
            decorative. Rail (sized container) > runner (scroll-driven
            translate) > mark (idle bob). */}
        <span className="lf-post__sail" aria-hidden="true">
          <span className="lf-post__sail-run">
            <TugMark className="lf-post__sail-mark" />
          </span>
        </span>
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
            {published && (
              <>
                <span aria-hidden="true"> · </span>
                <span>Published </span>
                <time itemProp="datePublished" dateTime={published.iso}>{published.label}</time>
              </>
            )}
            {updated && updated.iso !== published?.iso && (
              <>
                <span aria-hidden="true"> · </span>
                <span>Updated </span>
                <time itemProp="dateModified" dateTime={updated.iso}>{updated.label}</time>
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

          {ready ? <JournalInsight category={post.category} slug={post.slug} insight={ready.insight} /> : null}

          <JournalActionBridge category={post.category} />

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
          <JournalCalculator slug={post.slug} />
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
    </div>
  );
}
