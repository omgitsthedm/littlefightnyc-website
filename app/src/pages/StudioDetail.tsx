import { Sparkles } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";
import { studioProjects } from "@/data/site";
import "@/styles/editorial/studio.css";
// This page reuses the .lf-case-detail__byline + .lf-case-detail-related
// blocks, whose styles live in case-studies.css. Vite code-splits CSS per
// lazy route chunk, so WITHOUT this import those blocks render completely
// unstyled here ("01AI client finderDakotaOur own AI…" as one mashed line).
import "@/styles/editorial/case-studies.css";

export default function StudioDetail() {
  const { slug } = useParams();
  const project = studioProjects.find((p) => p.slug === slug);

  if (!project) return <Navigate to="/services/#studio" replace />;

  const related = studioProjects.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={`Studio · ${project.kind}`}
        icon={Sparkles}
        title={<>{project.name}</>}
        dek={project.oneline}
        image={{
          // Decorative: the adjacent H1 already announces the project name,
          // so an alt repeating it would be redundant for screen readers.
          src: project.image,
          alt: "",
          width: 1800,
          height: 1200,
        }}
      />

      <article className="lf-studio-detail">
        <div className="lf-studio-detail__inner">
          <aside className="lf-studio-detail__meta">
            <div className="lf-studio-detail__meta-item">
              <p className="lf-studio-detail__meta-label">Project</p>
              <p className="lf-studio-detail__meta-value">{project.name}</p>
            </div>
            <div className="lf-studio-detail__meta-item">
              <p className="lf-studio-detail__meta-label">Kind</p>
              <p className="lf-studio-detail__meta-value">{project.kind}</p>
            </div>
            <div className="lf-studio-detail__meta-item">
              <p className="lf-studio-detail__meta-label">Status</p>
              <p className={`lf-studio-detail__meta-value lf-studio-detail__status--${project.status.toLowerCase()}`}>
                {project.status}
              </p>
            </div>
            <div className="lf-studio-detail__meta-item">
              <p className="lf-studio-detail__meta-label">Stack</p>
              <p className="lf-studio-detail__meta-value">{project.stack.join(" · ")}</p>
            </div>
            {project.external && (
              <div className="lf-studio-detail__meta-item">
                <p className="lf-studio-detail__meta-label">Live</p>
                <p className="lf-studio-detail__meta-value">
                  <a className="lf-studio-detail__live" href={project.external} target="_blank" rel="noopener noreferrer">
                    Visit ↗
                  </a>
                </p>
              </div>
            )}
          </aside>

          <div className="lf-studio-detail__body">
            <p className="lf-case-detail__byline">
              <span>Little Fight NYC</span>
              <span aria-hidden="true"> · </span>
              <span>From the Studio</span>
            </p>

            <EditorialBody dropcap>
              {project.body?.map((p, i) => <p key={i}>{p}</p>)}
            </EditorialBody>

            {/* Internal ops telemetry removed from the public site 2026-07-12 —
                editorial directive: "nothing internal should show." */}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="lf-case-detail-related">
          <div className="lf-case-detail-related__inner">
            <p className="lf-case-detail-related__label">More from the Studio</p>
            <ol className="lf-case-detail-related__list">
              {related.map((r, i) => (
                <li key={r.slug}>
                  <Link to={`/studio/${r.slug}/`} className="lf-case-detail-related__link">
                    <span className="lf-case-detail-related__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="lf-case-detail-related__body">
                      <span className="lf-case-detail-related__type">{r.kind}</span>
                      <span className="lf-case-detail-related__client">{r.name}</span>
                      <span className="lf-case-detail-related__title">{r.oneline}</span>
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
