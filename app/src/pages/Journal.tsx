import { Link } from "react-router-dom";
import { BookOpenText, FileText, ListChecks, Workflow } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import VisualIndex from "@/components/editorial/VisualIndex";
import QuietContact from "@/components/editorial/QuietContact";
import journal from "@/data/journal.json";
import "@/styles/editorial/journal.css";

type Post = {
  slug: string;
  category: "blog" | "guide" | "essay" | "howto";
  title: string;
  description: string;
  published: string;
  updated: string;
};

const CATEGORY_LABEL: Record<Post["category"], string> = {
  howto: "How To",
  essay: "Essay",
  blog: "Notebook",
  guide: "Software Guide",
};

const CATEGORY_ICON = {
  howto: ListChecks,
  essay: BookOpenText,
  blog: FileText,
  guide: Workflow,
} satisfies Record<Post["category"], typeof ListChecks>;

const CATEGORY_IMAGE: Record<Post["category"], string> = {
  howto: "/assets/typing.webp",
  essay: "/assets/nyc-chinatown-night.webp",
  blog: "/assets/nyc-street-crowd.webp",
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

const CATEGORY_ORDER: Post["category"][] = ["howto", "essay", "blog", "guide"];

export default function Journal() {
  const posts = journal as unknown as Post[];

  // Group by category for the index, in priority order.
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABEL[cat],
    posts: posts.filter((p) => p.category === cat),
  })).filter((g) => g.posts.length > 0);
  const overview = posts.map((post) => ({
    body: post.description,
    eyebrow: CATEGORY_LABEL[post.category],
    icon: CATEGORY_ICON[post.category],
    image: POST_IMAGE[post.slug] ?? CATEGORY_IMAGE[post.category],
    title: post.title,
    to: `/journal/${post.slug}/`,
  }));

  return (
    <>
      <PageHero
        eyebrow="The Journal"
        title={
          <>
            What we've been{" "}
            <br />
            <span className="lf-em">writing about.</span>
          </>
        }
        dek="How-tos, essays, software comparisons, and field notes from working with NYC small businesses. Plain English, no upsell, occasionally cheeky."
        image={{
          src: "/assets/sign-groceries-snacks.webp",
          alt: "Hand-painted Groceries Snacks sign",
          width: 1800,
          height: 1200,
        }}
      />

      <VisualIndex
        eyebrow="Field guide"
        title="Pick the kind of decision you're making."
        dek="Grouped by the kind of call you're weighing: how-tos when you're doing it yourself, software comparisons when you're choosing a tool, and essays when you're deciding which direction to take."
        items={overview}
        variant="compact"
      />

      <section className="lf-journal">
        <div className="lf-journal__inner">
          {grouped.map((group) => (
            <section key={group.category} className="lf-journal__group">
              <p className="lf-journal__group-label">{group.label}</p>
              <ol className="lf-journal__list">
                {group.posts.map((post, i) => (
                  <li key={post.slug} className="lf-journal__item">
                    <Link to={`/journal/${post.slug}/`} className="lf-journal__link">
                      <span className="lf-journal__num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="lf-journal__body">
                        <span className="lf-journal__title">{post.title}</span>
                        <span className="lf-journal__desc">{post.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </section>

      <QuietContact />
    </>
  );
}
