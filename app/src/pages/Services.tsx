import { Layers, Sparkles, Waypoints } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import VisualIndex from "@/components/editorial/VisualIndex";
import ServiceEditorialSpread from "@/components/editorial/ServiceEditorialSpread";
import QuietContact from "@/components/editorial/QuietContact";
import { fitRoutes, services, studioProjects } from "@/data/site";
import "@/styles/editorial/services-hub.css";

/* Symptom → service. Owners arrive with a feeling, not a service name —
   route from the feeling. (Replaces the old 2×2 card grid: the page used
   to state the same four services three times in a row.) */
const SYMPTOM_TO_SERVICE: Record<string, string> = {
  "Something is broken": "it-support",
  "The setup is messy": "business-systems",
  "The monthly bill hurts": "tech-consulting",
  "People cannot find us": "custom-local-websites",
};

export default function Services() {
  const studioOverview = studioProjects.map((project) => ({
    body: project.oneline,
    eyebrow: `${project.kind} · ${project.status}`,
    icon: Sparkles,
    image: project.image,
    title: project.name,
    to: `/studio/${project.slug}/`,
  }));

  return (
    <>
      <PageHero
        eyebrow="The Work"
        icon={Layers}
        title={
          <>
            Four services.<br />
            {" "}
            <span className="lf-em">One agency.</span>
          </>
        }
        dek="Most owners only need one or two. Each engagement is scoped to the actual problem — never to a menu, never on a hunch. The consult is always free, and we'll tell you straight if you don't need us yet."
        image={{
          src: "/assets/coworking-laptops.webp",
          alt: "Open laptops in a Brooklyn workspace",
          width: 1600,
          height: 1200,
        }}
      />

      <nav className="lf-svc-router" aria-label="Start from the symptom">
        <div className="lf-svc-router__inner">
          <p className="lf-svc-router__label">
            <Waypoints size={14} strokeWidth={2} aria-hidden="true" />
            Start from what you feel, not from a service name
          </p>
          <ul className="lf-svc-router__list">
            {fitRoutes.map((route) => {
              const serviceSlug = SYMPTOM_TO_SERVICE[route.label];
              const service = services.find((s) => s.slug === serviceSlug);
              if (!service) return null;
              const Icon = route.icon;
              return (
                <li key={route.label} className="lf-svc-router__item">
                  <Link
                    to={`/services/${service.slug}/`}
                    viewTransition
                    className="lf-svc-router__link"
                  >
                    <span className="lf-svc-router__symptom">
                      <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                      {route.label}
                    </span>
                    <span className="lf-svc-router__service">
                      → {service.eyebrow}
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
        title="Systems, not just sites."
        dek="Some fights need more than a website. Dakota is our own AI that finds and qualifies new business overnight. The Estimator's Cockpit turns a contractor's messiest paperwork into a clean, structured bid. VenueCircuit is a full financial platform we shipped for independent venues. Real tools, running in production — the same range we bring to your systems."
        items={studioOverview}
        variant="compact"
      />

      <QuietContact />
    </>
  );
}
