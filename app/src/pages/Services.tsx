import { Sparkles } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import VisualIndex from "@/components/editorial/VisualIndex";
import ServiceEditorialSpread from "@/components/editorial/ServiceEditorialSpread";
import QuietContact from "@/components/editorial/QuietContact";
import { services, studioProjects } from "@/data/site";

export default function Services() {
  const overview = services.map((service) => ({
    body: service.plain,
    eyebrow: service.verb,
    icon: service.icon,
    image: service.image,
    title: service.eyebrow,
    to: `/services/${service.slug}/`,
  }));
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

      <VisualIndex
        eyebrow="Overview"
        title="Find the right shape of help."
        dek="The work starts by naming the problem correctly: broken today, hard to find, expensive every month, or too manual to keep running by memory. These are the four services we offer under one agency."
        items={overview}
      />

      <ServiceEditorialSpread />

      <VisualIndex
        id="studio"
        eyebrow="Studio"
        title="Experiments that sharpen the client work."
        dek="Internal builds, prototypes, and long-running tools. Some become client systems. Some stay weird. All of them make the work faster and more exact."
        items={studioOverview}
        variant="compact"
      />

      <QuietContact />
    </>
  );
}
