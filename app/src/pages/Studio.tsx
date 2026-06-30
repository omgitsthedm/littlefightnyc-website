import { Link } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { studioProjects } from "@/data/site";
import "@/styles/editorial/studio.css";

export default function Studio() {
  return (
    <>
      <PageHero
        eyebrow="The Studio"
        title={
          <>
            What we build<br />
            <span className="lf-em">when no one's watching.</span>
          </>
        }
        dek="Internal experiments, sandboxes, and long-running builds. Some become client work. Some stay weird. All of it teaches us something."
        image={{
          src: "/assets/hero-laptop.webp",
          alt: "Late-night work in progress",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-studio">
        <div className="lf-studio__inner">
          {studioProjects.map((p, i) => (
            <article key={p.slug} className="lf-studio__item">
              <Link to={`/studio/${p.slug}/`} className="lf-studio__image lf-studio__image-link" aria-label={`Read about ${p.name}`}>
                <img
                  src={p.image}
                  alt=""
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
                <span className={`lf-studio__status lf-studio__status--${p.status.toLowerCase()}`}>
                  {p.status}
                </span>
              </Link>
              <div className="lf-studio__copy">
                <p className="lf-studio__kind">{p.kind}</p>
                <h2 className="lf-studio__name">
                  <Link to={`/studio/${p.slug}/`} className="lf-studio__name-link">{p.name}</Link>
                </h2>
                <p className="lf-studio__oneline">{p.oneline}</p>
                <p className="lf-studio__desc">{p.description}</p>
                <div className="lf-studio__foot">
                  <div className="lf-studio__stack">
                    <span className="lf-studio__foot-label">Stack</span>
                    <span className="lf-studio__stack-list">
                      {p.stack.map((s, j) => (
                        <span key={s}>
                          {s}
                          {j < p.stack.length - 1 && (
                            <span aria-hidden="true">{" · "}</span>
                          )}
                        </span>
                      ))}
                    </span>
                  </div>
                  {p.external && (
                    <a
                      className="lf-studio__live"
                      href={p.external}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      See it
                      <span aria-hidden="true"> ↗</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <QuietContact />
    </>
  );
}
