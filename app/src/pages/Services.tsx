import {
  ArrowUpRight,
  Boxes,
  Globe2,
  Headphones,
  Layers,
  Search,
  Waypoints,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import VisualIndex from "@/components/editorial/VisualIndex";
import ServiceEditorialSpread from "@/components/editorial/ServiceEditorialSpread";
import QuietContact from "@/components/editorial/QuietContact";
import { services, studioProjects } from "@/data/site";
import "@/styles/editorial/services-hub.css";

/* Symptom → service. Owners arrive with a feeling, not a service name —
   route from the feeling. (Replaces the old 2×2 card grid: the page used
   to state the same four services three times in a row.) */
const ENTRY_ROUTES = [
  {
    label: "I need a custom website",
    slug: "custom-local-websites",
    icon: Globe2,
    priority: "primary",
  },
  {
    label: "Something is broken",
    slug: "it-support",
    icon: Headphones,
    priority: "support",
  },
  {
    label: "I need a free second opinion",
    slug: "tech-consulting",
    icon: Search,
    priority: "consulting",
  },
  {
    label: "Monthly software is slowing us down",
    slug: "business-systems",
    icon: Workflow,
    priority: "software",
  },
] as const;

export default function Services() {
  const studioOverview = studioProjects.map((project) => ({
    body: project.oneline,
    eyebrow: `${project.kind} / ${project.status}`,
    icon: Boxes,
    image: project.image,
    title: project.name,
    to: `/studio/${project.slug}/`,
  }));

  return (
    <>
      <PageHero
        eyebrow="Custom websites first"
        icon={Layers}
        title={
          <>
            Start with the problem.<br />{" "}
            <span className="lf-accent">We build the right fix.</span>
          </>
        }
        dek="Custom website, urgent repair, free advice, or owned software. Pick the problem in front of you."
        image={{
          src: "/assets/hero-services-crossing.webp",
          alt: "A crowded Little Italy street in Manhattan at dusk, the Empire State Building lit in the distance",
          width: 1600,
          height: 1200,
        }}
      />

      <nav className="lf-svc-router" aria-label="Start from the symptom">
        <div className="lf-svc-router__inner">
          <p className="lf-svc-router__label">
            <Waypoints size={14} strokeWidth={2} aria-hidden="true" />
            Choose your next move
          </p>
          <ul className="lf-svc-router__list">
            {ENTRY_ROUTES.map((route) => {
              const service = services.find((s) => s.slug === route.slug);
              if (!service) return null;
              const Icon = route.icon;
              return (
                <li key={route.label} className="lf-svc-router__item">
                  <Link
                    to={`/services/${service.slug}/`}
                    className={`lf-svc-router__link lf-svc-router__link--${route.priority}`}
                  >
                    <span className="lf-svc-router__symptom">
                      <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                      {route.label}
                    </span>
                    <span className="lf-svc-router__service">
                      {service.eyebrow}
                      <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <ServiceEditorialSpread />

      <VisualIndex
        id="studio"
        eyebrow="Studio"
        title="Stop renting the workaround."
        dek="When software costs more than it solves, we build the focused tool. You own the code, data, hosting, and docs."
        items={studioOverview}
        variant="compact"
      />

      <QuietContact />
    </>
  );
}
