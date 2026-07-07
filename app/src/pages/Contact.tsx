import PageHero from "@/components/editorial/PageHero";
import { MessageSquare } from "lucide-react";
import QuietContact from "@/components/editorial/QuietContact";

export default function Contact() {
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
        dek="Broken today? Call. Messy but not urgent? Start a Fit Check. Not sure what it is called? Call anyway. Free consult, 2-hour callbacks from 9am-9pm Eastern, and no dumb questions."
        image={{
          src: "/assets/nyc-stickys-steam.webp",
          alt: "Steam from a Manhattan grate at street level",
          width: 1600,
          height: 1200,
        }}
      />

      <QuietContact />
    </>
  );
}
