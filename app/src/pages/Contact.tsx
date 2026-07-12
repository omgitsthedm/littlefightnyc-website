import { MessageSquare, UserRound } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import FaqList from "@/components/editorial/FaqList";
import MiniMapNYC from "@/components/dataviz/MiniMapNYC";
import TimelineStrip from "@/components/dataviz/TimelineStrip";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import "@/styles/editorial/contact.css";

const CONTACT_FAQ = [
  {
    question: "How fast will you answer?",
    answer:
      "From 9am to 9pm New York time, a real person picks up. If you leave a message, we call back within 2 hours.",
  },
  {
    question: "Does the first talk cost money?",
    answer:
      "No. The first consult is always free. If you do not need us, we will say so and point you the right way.",
  },
  {
    question: "What happens after I write to you?",
    answer:
      "We read it the same day. Then we call, text, or email you back — whichever you asked for. No spam, no pressure, no long forms.",
  },
];

export default function Contact() {
  const windowRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const mapRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <>
      <PageHero
        eyebrow="Contact"
        icon={MessageSquare}
        title={
          <>
            Tell us what's<br />
            {" "}
            <span className="lf-em">going on.</span>
          </>
        }
        dek="Broken today? Call. Messy but not urgent? Start a Tech Audit. Not sure what it is called? Call anyway. There are no dumb questions here."
        image={{
          src: "/assets/nyc-stickys-steam.webp",
          alt: "Steam from a Manhattan grate at street level",
          width: 1600,
          height: 1200,
        }}
      />

      {/* What happens when you reach out — the response window, drawn. */}
      <section className="lf-contact-window" aria-labelledby="lf-contact-window-title">
        <div ref={windowRef} className="lf-contact-window__inner" data-reveal>
          <header className="lf-contact-window__head">
            <p className="lf-contact-window__eyebrow">What happens next</p>
            <h2 id="lf-contact-window-title" className="lf-contact-window__title">
              You reach out. We answer. That's it.
            </h2>
          </header>

          <TimelineStrip
            label="What happens after you contact Little Fight NYC"
            summary="You call, text, email, or send the form. From 9am to 9pm New York time a real person answers. If you leave a message, we call back within 2 hours. The first consult is free."
            beats={[
              { label: "You reach out", sub: "Call, text, email, or form" },
              { label: "A human answers", sub: "9am-9pm ET" },
              { label: "Callback in 2 hours", sub: "If we miss you", marker: true },
            ]}
            badge="First consult free"
          />

          <p className="lf-contact-window__note">
            <UserRound size={16} strokeWidth={2} aria-hidden="true" />
            No phone tree. No ticket maze. You talk to the person who does the work.
          </p>
        </div>
      </section>

      {/* Where we work — the coverage map. */}
      <section className="lf-contact-map" aria-labelledby="lf-contact-map-title">
        <div ref={mapRef} className="lf-contact-map__inner" data-reveal>
          <header className="lf-contact-window__head">
            <p className="lf-contact-window__eyebrow">Where we work</p>
            <h2 id="lf-contact-map-title" className="lf-contact-window__title">
              Close enough to show up.
            </h2>
            <p className="lf-contact-map__dek">
              We are based in Manhattan and work across these neighborhoods.
              When something breaks, we can be on site within 24 hours.
            </p>
          </header>
          <MiniMapNYC compact />

          <FaqList title="Before you call" items={CONTACT_FAQ} />
        </div>
      </section>

      <QuietContact />
    </>
  );
}
