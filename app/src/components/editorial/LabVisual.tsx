import { ArrowUpRight } from "lucide-react";
import "./LabVisual.css";

/**
 * A Lab build, shown where it proves the thing the page is selling.
 *
 * The Lab holds nine working builds — a physics-solved pool break, a living
 * NYC block, a site that assembles itself from a sentence — and they were
 * reachable only from /examples/. A service page that claims a capability can
 * now open the build that demonstrates it, one click away, with the poster
 * carrying the page instead of a stock photo.
 *
 * These are Little Fight's own builds, not client work: the label says so.
 */
const BUILDS = {
  "studio-engine": {
    title: "Studio Engine",
    kind: "Working build",
    line: "Describe a business in one line. Watch the site assemble itself.",
    poster: "/examples/lab/assets/studio-engine-poster.webp",
  },
  "growth-street": {
    title: "Growth Street",
    kind: "Working build",
    line: "One block wakes up as the systems behind it connect.",
    poster: "/examples/lab/assets/growth-street-poster.webp",
  },
  "terminal-3d": {
    title: "Neon District",
    kind: "Working build",
    line: "A city block that keeps running whether or not you touch it.",
    poster: "/examples/lab/assets/neon-district-poster.webp",
  },
  "micro-animations": {
    title: "Micro-Animations",
    kind: "Working build",
    line: "Seven moments of feedback you can feel, on a phone.",
    poster: "/examples/lab/assets/feel-poster.webp",
  },
  "pool-room": {
    title: "The Pool Room",
    kind: "Cinema build",
    line: "A dive bar built object by object, then a break solved by real physics.",
    poster: "/examples/lab/assets/pool-room-poster.webp",
  },
} as const;

export type LabBuildSlug = keyof typeof BUILDS;

type Props = {
  slug: LabBuildSlug;
  /** Why this build belongs on this page, in the page's own terms. */
  because: string;
};

export default function LabVisual({ slug, because }: Props) {
  const build = BUILDS[slug];
  if (!build) return null;

  return (
    <figure className="lf-labvisual">
      <a
        className="lf-labvisual__frame"
        href={`/examples/lab/concepts/${slug}/`}
        data-no-vt
        aria-label={`Open the ${build.title} build`}
      >
        <img
          src={build.poster}
          alt={`${build.title}: ${build.line}`}
          width={1280}
          height={800}
          loading="lazy"
          decoding="async"
        />
        <span className="lf-labvisual__shade" aria-hidden="true" />
        <span className="lf-labvisual__body">
          <span className="lf-labvisual__kind">{build.kind}</span>
          <strong className="lf-labvisual__title">{build.title}</strong>
          <span className="lf-labvisual__line">{build.line}</span>
          <span className="lf-labvisual__open">
            Open the live build
            <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        </span>
      </a>
      <figcaption className="lf-labvisual__caption">
        Little Fight build, not client work · {because}
      </figcaption>
    </figure>
  );
}
