import {
  ArrowUpRight,
  Boxes,
  Globe2,
  Headphones,
  Layers,
  RefreshCw,
  Search,
  Store,
  Waypoints,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import VisualIndex from "@/components/editorial/VisualIndex";
import WorkWall from "@/components/editorial/WorkWall";
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
    detail: "People should find you, understand you, and know whether to call, book, visit, or buy.",
  },
  {
    label: "Something is broken",
    slug: "it-support",
    icon: Headphones,
    priority: "support",
    detail: "A card reader, Wi-Fi, email, booking link, or device is stopping the day.",
  },
  {
    label: "I need a free second opinion",
    slug: "tech-consulting",
    icon: Search,
    priority: "consulting",
    detail: "You want an honest look before you renew, replace, sign, or spend.",
  },
  {
    label: "Monthly software is slowing us down",
    slug: "business-systems",
    icon: Workflow,
    priority: "software",
    detail: "A costly tool still makes people type the same thing twice or run the business from a spreadsheet.",
  },
] as const;

export default function Services() {
  const studioOverview = studioProjects.map((project) => ({
    body: project.oneline,
    eyebrow: `${project.kind} / ${project.status}`,
    icon: Boxes,
    image: project.image,
    video: project.video,
    title: project.name,
    to: `/studio/${project.slug}/`,
  }));

  return (
    <>
      <PageHero
        eyebrow="What we do"
        icon={Layers}
        title={
          <>
            You explain the day.<br />{" "}
            <span className="lf-accent">We find the useful fix.</span>
          </>
        }
        dek="Pick the problem that sounds familiar. No tech words needed."
        pillars={[
          "Websites that help customers choose you",
          "Fast help when the basics break",
        ]}
        // Was a stock Manhattan street. The page that says what we do now
        // shows what we shipped.
        visual={
          <WorkWall
            slugs={["hair-by-rachel-charles", "cc-films", "chromatic-painting-design"]}
            label="Recent shipped websites"
          />
        }
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
                    <span className="lf-svc-router__detail">{route.detail}</span>
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

      <section className="lf-svc-extensions" aria-label="Launch and care">
        <div className="lf-svc-extensions__inner">
          <Link to="/services/new-business-launch/">
            <Store size={22} strokeWidth={1.7} aria-hidden="true" />
            <span>
              <small>Opening or relaunching</small>
              <strong>Open with one front door, not six loose logins.</strong>
              <em>Your website, Google listing, email, booking, follow-up, and account access start in one clear plan.</em>
            </span>
            <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
          <Link to="/services/ongoing-care/">
            <RefreshCw size={22} strokeWidth={1.7} aria-hidden="true" />
            <span>
              <small>Already live</small>
              <strong>Keep the front door working after launch.</strong>
              <em>Current facts, checked forms, clear next steps, and notes your business keeps.</em>
            </span>
            <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="lf-svc-assurance" aria-labelledby="lf-svc-assurance-title">
        <div className="lf-svc-assurance__inner">
          <div className="lf-svc-assurance__statement">
            <p className="lf-svc-assurance__eyebrow">Our rule</p>
            <h2 id="lf-svc-assurance-title">
              We do not arrive with a platform to sell.
            </h2>
            <p>
              We start with the business you already have. We change only what
              makes the day easier or helps the next customer take a clear step.
            </p>
          </div>
          <ol className="lf-svc-assurance__list">
            <li>
              <span>01</span>
              <div>
                <strong>See the real setup</strong>
                <p>We look at the website, logins, devices, bills, and the spots where work gets dropped.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Explain the next move</strong>
                <p>You see what to keep, fix, stop paying for, or leave alone.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Leave you in control</strong>
                <p>Your domain, code, business data, and written instructions stay with you.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <VisualIndex
        id="studio"
        eyebrow="Focused software"
        title="You can own the tool instead of renting it."
        dek="We can build the smaller, clearer tool your business actually needs. You own the code, data, hosting, and plain notes."
        items={studioOverview}
        variant="compact"
      />

      <QuietContact />
    </>
  );
}
