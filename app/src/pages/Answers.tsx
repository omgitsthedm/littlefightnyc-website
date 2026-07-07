import { HelpCircle, 
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  MapPin,
  MessagesSquare,
  Store,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import VisualIndex from "@/components/editorial/VisualIndex";
import QuietContact from "@/components/editorial/QuietContact";
import { answerGuides } from "@/data/site";
import "@/styles/editorial/answers.css";

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

export default function Answers() {
  const overview = answerGuides.map((guide) => ({
    body: guide.short.replace(/^Short answer:\s*/i, ""),
    eyebrow: "Owner answer",
    icon: ANSWER_ICONS[guide.slug] ?? MessagesSquare,
    image: ANSWER_IMAGES[guide.slug] ?? "/assets/typing.webp",
    title: guide.question,
    to: `/answers/${guide.slug}/`,
  }));

  return (
    <>
      <PageHero
        eyebrow="Owner Answers"
        icon={HelpCircle}
        title={
          <>
            Plain answers,<br />
            <span className="lf-em">no selling.</span>
          </>
        }
        dek="Real questions NYC owners ask us. Each answer is short, direct, and not trying to make a sale."
        image={{
          src: "/assets/nyc-street.webp",
          alt: "A New York side street at human scale",
          width: 1600,
          height: 1200,
        }}
      />

      <VisualIndex
        eyebrow="Problem library"
        title="Start with the symptom."
        dek="Each answer is mapped to the kind of thing an owner actually notices first: missing leads, software drag, bad Google visibility, or a tool that no longer fits."
        items={overview}
        variant="compact"
      />

      <QuietContact />
    </>
  );
}
