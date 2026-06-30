import { Navigate, useParams } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import industries from "@/data/industries.json";
import { prepareLegacyHtml } from "@/lib/legacyHtml";
import "@/styles/editorial/journal.css";

type Industry = {
  slug: string;
  title: string;
  description: string;
  html: string;
  image?: string;
};

export default function IndustryDetail() {
  const { slug } = useParams();
  const list = industries as unknown as Industry[];
  const entry = list.find((p) => p.slug === slug);

  if (!entry) return <Navigate to="/field-guide/#industries" replace />;

  return (
    <>
      <PageHero
        eyebrow="Industry"
        title={<>{entry.title.replace(" Help", "")}</>}
        dek={entry.description}
        image={entry.image ? {
          src: entry.image,
          alt: entry.title.replace(" Help", ""),
          width: 1800,
          height: 1200,
        } : undefined}
      />

      <article className="lf-post">
        <div className="lf-post__inner">
          <div
            className="lf-post__body"
            dangerouslySetInnerHTML={{ __html: prepareLegacyHtml(entry.html) }}
          />
        </div>
      </article>

      <QuietContact />
    </>
  );
}
