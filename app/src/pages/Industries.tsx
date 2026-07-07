import { Building2, 
  BriefcaseBusiness,
  HeartPulse,
  Palette,
  Scissors,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import VisualIndex from "@/components/editorial/VisualIndex";
import QuietContact from "@/components/editorial/QuietContact";
import industries from "@/data/industries.json";

type Industry = {
  image: string;
  slug: string;
  title: string;
  description: string;
};

const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  "galleries-creative-studios": Palette,
  "medical-wellness-practices": HeartPulse,
  "professional-services": BriefcaseBusiness,
  "restaurants-bars": Utensils,
  "retail-ecommerce": ShoppingBag,
  "salons-wellness": Scissors,
};

export default function Industries() {
  const list = industries as unknown as Industry[];
  const overview = list.map((entry) => ({
    body: entry.description,
    eyebrow: "Industry map",
    icon: INDUSTRY_ICONS[entry.slug] ?? BriefcaseBusiness,
    image: entry.image,
    title: entry.title.replace(" Help", ""),
    to: `/industries/${entry.slug}/`,
  }));

  return (
    <>
      <PageHero
        eyebrow="Who We Help"
        icon={Building2}
        title={
          <>
            Industries<br />
            <span className="lf-em">we know.</span>
          </>
        }
        dek="Little Fight has worked across these NYC business types. The plays look different in each — the discipline doesn't. Don't see yours? It's probably here in spirit — call and we'll talk."
        image={{
          src: "/assets/sign-more-shops.webp",
          alt: "Hand-painted More Shops sign with palm trees",
          width: 1800,
          height: 1200,
        }}
      />

      <VisualIndex
        eyebrow="Industry overview"
        title="Different counters, same hidden work."
        dek="Every business type has its own customer path. These maps show where websites, bookings, Google visibility, staff handoffs, and reporting usually need to line up."
        items={overview}
        variant="compact"
      />

      <QuietContact />
    </>
  );
}
