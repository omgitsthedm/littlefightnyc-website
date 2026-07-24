import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  canPublishProjectMomentum,
  getProjectMomentum,
  projectMomentum,
} from "@/data/project-momentum";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import { useScrollReveal } from "./useScrollReveal";
import "./ProjectMomentum.css";

export default function ProjectMomentum({
  slug,
  variant = "section",
}: {
  slug?: string;
  variant?: "section" | "detail" | "embedded";
}) {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const projects = slug
    ? [getProjectMomentum(slug)].filter(
        (project): project is NonNullable<typeof project> => Boolean(project),
      )
    : projectMomentum.filter(canPublishProjectMomentum);

  if (projects.length === 0) return null;

  return (
    <section
      className="lf-momentum"
      data-variant={variant}
      aria-labelledby={`lf-momentum-title-${slug ?? "all"}`}
    >
      <div ref={ref} className="lf-momentum__inner" data-reveal>
        <header className="lf-momentum__head">
          <div>
            <p className="lf-momentum__label">Work in motion</p>
            <h2 id={`lf-momentum-title-${slug ?? "all"}`}>
              {slug ? "From idea to working proof." : "Small firm. Serious pace."}
            </h2>
          </div>
          <p>
            {slug
              ? "A short, visual record of how the build moved."
              : "For new work, an approved public timeline can begin after the deposit. Clients can see the build move."}
          </p>
        </header>

        <div className="lf-momentum__grid" data-count={projects.length}>
          {projects.map((project) => (
            <article className="lf-momentum__project" key={project.slug}>
              <div className="lf-momentum__scene">
                <img
                  {...skelImg}
                  src={project.image}
                  {...responsiveImageProps(
                    project.image,
                    projects.length === 1
                      ? "(min-width: 960px) 36vw, 100vw"
                      : "(min-width: 900px) 44vw, 100vw",
                    [480, 640, 900],
                  )}
                  alt={project.imageAlt}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="lf-momentum__body">
                <div className="lf-momentum__project-head">
                  <div>
                    <span>{project.kind}</span>
                    <h3>{project.name}</h3>
                    <p className="lf-momentum__state">{project.status}</p>
                  </div>
                  {variant !== "detail" && (
                    <Link to={`/case-studies/${project.slug}/`} aria-label={`Open ${project.name} case study`}>
                      Open case
                      <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                    </Link>
                  )}
                </div>

                <p className="lf-momentum__summary">{project.summary}</p>

                <ol
                  className="lf-momentum__track"
                  data-count={project.milestones.length}
                >
                  {project.milestones.map((milestone, index) => (
                    <li
                      key={`${project.slug}-${milestone.label}`}
                      style={{ ["--lf-i" as string]: index }}
                    >
                      <span className="lf-momentum__time">{milestone.time}</span>
                      <strong>{milestone.label}</strong>
                      <p>{milestone.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </div>
        <p className="lf-momentum__source">
          Elapsed times supplied by Little Fight. Reconstructed history,
          verified {projects[0].lastVerifiedDate}. No forecast is shown.
        </p>
      </div>
    </section>
  );
}
