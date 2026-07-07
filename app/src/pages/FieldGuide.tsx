import {
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  HeartPulse,
  MapPin,
  MessagesSquare,
  Palette,
  Scissors,
  ShoppingBag,
  Store,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import VisualIndex from "@/components/editorial/VisualIndex";
import QuietContact from "@/components/editorial/QuietContact";
import { answerGuides, caseStudies } from "@/data/site";
import industries from "@/data/industries.json";

type Industry = {
  image: string;
  slug: string;
  title: string;
  description: string;
};

const ANSWER_ICONS: Record<string, LucideIcon> = {
  "website-form-not-working-small-business": MessagesSquare,
  "reduce-monthly-software-costs-small-business": CreditCard,
  "business-not-showing-on-google-maps": MapPin,
  "hair-salon-save-money-software": CalendarCheck,
  "local-pharmacy-website-community-support": Store,
  "when-custom-business-system-beats-saas": ClipboardCheck,
};

const ANSWER_IMAGES: Record<string, string> = {
  "website-form-not-working-small-business": "/assets/hero-laptop.webp",
  "reduce-monthly-software-costs-small-business": "/assets/pos.webp",
  "business-not-showing-on-google-maps": "/assets/local-business-base.webp",
  "hair-salon-save-money-software": "/assets/nyc-hair-salon-street.webp",
  "local-pharmacy-website-community-support": "/assets/storefront-health-foods.webp",
  "when-custom-business-system-beats-saas": "/assets/coworking-laptops.webp",
};

const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  "galleries-creative-studios": Palette,
  "medical-wellness-practices": HeartPulse,
  "professional-services": BriefcaseBusiness,
  "restaurants-bars": Utensils,
  "retail-ecommerce": ShoppingBag,
  "salons-wellness": Scissors,
};

export default function FieldGuide() {
  const answerItems = answerGuides.map((guide) => ({
    body: guide.short.replace(/^Short answer:\s*/i, ""),
    eyebrow: "Owner answer",
    icon: ANSWER_ICONS[guide.slug] ?? MessagesSquare,
    image: ANSWER_IMAGES[guide.slug] ?? "/assets/typing.webp",
    title: guide.question,
    to: `/answers/${guide.slug}/`,
  }));

  const studyItems = caseStudies.map((study) => ({
    body: study.title,
    eyebrow: study.type,
    icon: FileSearch,
    image: study.image,
    title: study.client,
    to: `/case-studies/${study.slug}/`,
  }));

  const industryItems = (industries as unknown as Industry[]).map((entry) => ({
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
        eyebrow="Examples"
        title={
          <>
            Proof, maps,{" "}
            <br />
            <span className="lf-em">and plain answers.</span>
          </>
        }
        dek="A consolidated guide for owners who want examples before a pitch: named work, business-type maps, and direct answers to the problems we hear most."
        image={{
          src: "/assets/storefront-shop-deli.webp",
          alt: "A New York shopfront at street level",
          width: 1600,
          height: 1200,
        }}
      />

      <VisualIndex
        id="studies"
        eyebrow="Studies"
        title="What actually shipped."
        dek="Named work, published with permission. Each study shows what stayed, what changed, and what the business got back."
        items={studyItems}
      />

      <VisualIndex
        id="industries"
        eyebrow="Industries"
        title="Find your business type."
        dek="Pick the counter that looks like yours. Each map opens into where websites, bookings, Google visibility, staff handoffs, and reporting tend to line up for that kind of shop."
        items={industryItems}
        variant="compact"
      />

      <VisualIndex
        id="answers"
        eyebrow="Answers"
        title="Jump to your question."
        dek="The things owners ask us most, answered in plain English. Find the symptom that sounds like your week: missing leads, software drag, bad Google visibility, or tools that no longer fit."
        items={answerItems}
        variant="compact"
      />

      <QuietContact />
    </>
  );
}
