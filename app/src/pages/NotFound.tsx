import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";

export default function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="404 · Not Found"
        title={
          <>
            This page got<br />
            <span className="lf-em">knocked out.</span>
          </>
        }
        dek="Probably our fault. The page may have moved, been retired, or never existed at all. The good stuff is below — or call (646) 360-0318 if you needed something specific."
      />

      <QuietContact />
    </>
  );
}
