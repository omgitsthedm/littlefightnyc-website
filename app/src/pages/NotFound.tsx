import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import TugAvatar from "@/components/editorial/TugAvatar";
import routeMeta from "@/data/route-meta.json";

const notFound = routeMeta.notFound;

export default function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="404 · Not Found"
        title={
          <>
            {notFound.headingLead}<br />{" "}
            <span className="lf-em">{notFound.headingEmphasis}</span>
          </>
        }
        dek="That page moved, retired, or took the long way home. Start with the problem below, or call if you need something specific."
      />

      <TugAvatar />

      <QuietContact />
    </>
  );
}
