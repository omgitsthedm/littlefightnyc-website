import { Link, Navigate, useParams } from "react-router-dom";
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
  howto: "/assets/typing.webp",
  essay: "/assets/nyc-chinatown-night.webp",
  blog: "/assets/nyc-street.webp",
  guide: "/assets/coworking-laptops.webp",
};

const POST_IMAGE: Record<string, string> = {
  "cybersecurity-for-small-business": "/assets/typing.webp",
  "nyc-small-business-digital": "/assets/storefront-shop-deli.webp",
  "protecting-kids-from-ai": "/assets/hero-laptop.webp",
  "airtable-vs-notion-vs-monday-small-business": "/assets/coworking-laptops.webp",
  "custom-business-system-vs-saas-subscriptions": "/assets/case-public-house-cockpit.webp",
  "shopify-vs-squarespace-nyc-retail": "/assets/interior-jeans-rack.webp",
  "square-appointments-vs-glossgenius-nyc-salons": "/assets/nyc-hair-salon-street.webp",
  "square-vs-toast-manhattan-restaurants": "/assets/pizza-menu-chalkboard.webp",
  "webflow-vs-squarespace-manhattan-small-business": "/assets/storefront-blue-gift-shop.webp",
  "ai-google-broke-the-internet-websites-survive": "/assets/nyc-chinatown-night.webp",
  "what-google-looks-for-business-website": "/assets/sign-more-shops.webp",
  "why-business-websites-will-be-invisible": "/assets/nyc-street-crowd.webp",
  "read-your-monthly-software-bill": "/assets/pos.webp",
  "set-up-google-business-profile-nyc": "/assets/local-business-base.webp",
  "migrate-off-squarespace-without-breaking-booking": "/assets/hero-soho-crosswalk.webp",
  "keep-connect-replace-build-framework": "/assets/interior-grocery.webp",
  "spot-developer-about-to-ghost": "/assets/hand-donut-sprinkles.webp",
};

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
