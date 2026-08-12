import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  canPublishProjectMomentum,
  getProjectMomentum,
  projectMomentum,
} from "@/data/project-momentum";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import CinematicMedia from "./CinematicMedia";
import { useScrollReveal } from "./useScrollReveal";
import { CountUp } from "@/components/dataviz/CountUp";
import { usePlayOnView } from "@/components/dataviz/usePlayOnView";
import "./ProjectMomentum.css";

export default function ProjectMomentum({
  slug,
  variant = "section",
}: {
  slug?: string;
  variant?: "section" | "detail" | "embedded";
}) {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const playRef = usePlayOnView<HTMLDivElement>(0.25);
  const setInnerRefs = (el: HTMLDivElement | null) => {
    ref.current = el;
    playRef.current = el;
  };
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
      <div ref={setInnerRefs} className="lf-momentum__inner" data-reveal>
        <header className="lf-momentum__head">
          <div>
            <p className="lf-momentum__label">Build history</p>
            <h2 id={`lf-momentum-title-${slug ?? "all"}`}>
              {slug ? "How the build moved." : "Proof from the build log."}
            </h2>
          </div>
          <p>
            {slug
              ? "A dated visual record of selected milestones—not a live project status."
              : "Approved histories show how selected work moved from first pass to working proof."}
          </p>
        </header>

        <div className="lf-momentum__grid" data-count={projects.length}>
          {projects.map((project) => (
            <article className="lf-momentum__project" key={project.slug}>
              <div className="lf-momentum__scene">
                {project.video ? (
                  <CinematicMedia
                    media={project.video}
                    alt={project.imageAlt}
                  />
                ) : (
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
                )}
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
                      <span className="lf-momentum__time">
                        <CountUp text={milestone.time} />
                      </span>
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
          verified {projects[0].lastVerifiedDate}. Not a live status or forecast.
        </p>
      </div>
    </section>
  );
}
