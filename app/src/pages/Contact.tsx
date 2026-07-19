import { MessageSquare, UserRound } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import FaqList from "@/components/editorial/FaqList";
import MiniMapNYC from "@/components/dataviz/MiniMapNYC";
import TheDirectLine from "@/components/dataviz/TheDirectLine";
import TimelineStrip from "@/components/dataviz/TimelineStrip";
import TimePromiseInstrument from "@/components/editorial/TimePromiseInstrument";
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
      "No. Consulting is always free. If you do not need us, we will say so and point you the right way.",
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
          src: "/assets/hero-contact-door.webp",
          alt: "A warm-lit shop doorway glowing at dusk in New York — the door is open",
          width: 1600,
          height: 1200,
        }}
      />

      {/* The page's promise, drawn as a race: their phone maze vs our one
          straight orange line. */}
      <section className="lf-contact-line" aria-label="No phone tree — a real person answers">
        <div className="lf-contact-line__inner">
          <TheDirectLine />
        </div>
      </section>

      {/* What happens when you reach out — the response window, drawn. */}
      <section className="lf-contact-window" aria-labelledby="lf-contact-window-title">
        <div ref={windowRef} className="lf-contact-window__inner" data-reveal>
          <header className="lf-contact-window__head">
            <p className="lf-contact-window__eyebrow">What happens next</p>
            <h2 id="lf-contact-window-title" className="lf-contact-window__title">
              You reach out. We set the next move.
            </h2>
          </header>

          <TimelineStrip
            label="What happens after you contact Little Fight NYC"
            summary="You call, text, email, or send the form. From 9am to 9pm New York time, Little Fight NYC reviews the situation and follows up. If you leave a message, we return it within 2 hours. Consulting is always free."
            beats={[
              { label: "You reach out", sub: "Call, text, email, or form" },
              { label: "Context reviewed", sub: "9am-9pm ET" },
              { label: "Callback in 2 hours", sub: "If we miss you", marker: true },
            ]}
            badge="Consulting is free"
          />

          <p className="lf-contact-window__note">
            <UserRound size={16} strokeWidth={2} aria-hidden="true" />
            No phone tree. No ticket maze. Start with the problem and get a clear path forward.
          </p>
        </div>
      </section>

      {/* The four promises against a live 24h NYC clock. */}
      <TimePromiseInstrument />

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
