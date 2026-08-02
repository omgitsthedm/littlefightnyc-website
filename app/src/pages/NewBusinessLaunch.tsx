import { Store } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import "@/styles/editorial/revenue-pages.css";

const LAUNCH_LAYERS = [
  {
    label: "Identity",
    title: "Own the name and the keys.",
    detail: "Domain control, branded email, account ownership, recovery paths, and a written record of who controls what.",
  },
  {
    label: "Front door",
    title: "Give every customer the right next step.",
    detail: "A custom website built around the storefront: booking for a chair, directions for a shop, ordering for a counter, intake for a practice, or a qualified inquiry for a service firm.",
  },
  {
    label: "Findability",
    title: "Make the facts agree.",
    detail: "The website, Google Business Profile, Search Console, structured data, sitemap, and useful public listings should describe the same real business.",
  },
  {
    label: "Follow-up",
    title: "Give interest somewhere to land.",
    detail: "Forms, booking notices, and real customer email reach an inbox somebody checks. Conservative routing can label priority messages without auto-replying or hiding them.",
  },
  {
    label: "Measurement",
    title: "Measure the path without lying to the visitor.",
    detail: "Consent-safe analytics, Search Console, and conversion events show which actions happen. Advertising storage remains separate and denied unless a visitor explicitly allows it.",
  },
] as const;

export default function NewBusinessLaunch() {
  return (
    <>
      <PageHero
        eyebrow="New business launch"
        icon={Store}
        title={<>Open with the front door already working.</>}
        dek="Name, website, Google presence, booking or inquiry path, email, measurement, and ownership—set up as one launch instead of six disconnected accounts."
        image={{
          src: "/images/brand-scenes/storefronts-dawn.webp",
          alt: "Neighborhood storefronts opening at dawn",
          width: 1672,
          height: 941,
        }}
      />

      <section className="lf-revenue-page" aria-labelledby="lf-launch-title">
        <header className="lf-revenue-page__intro">
          <p>Launch as one system</p>
          <h2 id="lf-launch-title">A new storefront should not inherit old digital confusion.</h2>
          <div>
            <p>
              Most launch problems are handoff problems. The website lives in
              one account, the domain in another, Google under a personal email,
              and customer messages wherever the form vendor sends them.
            </p>
            <p>
              We map the system before launch, use the simplest tool that fits
              each job, and leave the business with the keys and plain-English
              documentation.
            </p>
          </div>
        </header>

        <ol className="lf-revenue-page__rows lf-revenue-page__rows--five">
          {LAUNCH_LAYERS.map((item, index) => (
            <li key={item.label}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <p>{item.label}</p>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <QuietContact
        heading="Opening, relaunching, or finally making it official?"
        lede="Tell us the date, the storefront, and how the first customer should act. We will map the launch, the responsibilities, and the smallest useful scope."
        intent="website"
      />
    </>
  );
}
