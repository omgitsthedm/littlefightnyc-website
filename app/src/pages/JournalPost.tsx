import { Link, Navigate, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import journal from "@/data/journal.json";
import { prepareLegacyHtml } from "@/lib/legacyHtml";
import "@/styles/editorial/journal.css";

type Post = {
  slug: string;
  category: "blog" | "guide" | "essay" | "howto";
  title: string;
  description: string;
  published: string;
  updated: string;
  html: string;
};

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

// Branded category art carries every post — per-post stock photos retired
// 2026-07-12 (the donut-on-a-ghosting-article era is over).
const POST_IMAGE: Record<string, string> = {};

function displayDate(post: Post) {
  return post.published || post.updated || "May 7, 2026";
}

function dateTimeValue(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "2026-05-07" : parsed.toISOString().slice(0, 10);
}

export default function JournalPost() {
  const { slug } = useParams();
  const posts = journal as unknown as Post[];
  const post = posts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/journal/" replace />;

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const published = displayDate(post);

  return (
    <>
      <PageHero
        eyebrow={CATEGORY_LABEL[post.category]}
        icon={BookOpen}
        title={<>{post.title}</>}
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
        <div className="lf-post__inner">
          <p className="lf-post__byline byline">
            <span className="lf-post__byline-by">By</span>{" "}
            <Link
              rel="author"
              to="/about/"
              className="lf-post__byline-name author"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <span itemProp="name">David Marsh</span>
            </Link>
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
          </p>

          <div
            className="lf-post__body"
            dangerouslySetInnerHTML={{ __html: prepareLegacyHtml(post.html) }}
          />
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
