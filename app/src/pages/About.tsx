import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            Built for small<br />
            {" "}
            <span className="lf-em">business fights.</span>
          </>
        }
        dek="Little Fight NYC helps NYC small businesses outwork billion-dollar competitors. The work is practical, the scope is honest, and the consult is always free."
        image={{
          src: "/assets/local-business.webp",
          alt: "A New York City small business storefront",
          width: 1200,
          height: 900,
        }}
      />

      <section style={{ padding: "var(--lf-space-8) var(--lf-margin-mobile)" }}>
        <div style={{ maxWidth: "var(--lf-max-w)", marginInline: "auto" }}>
          <EditorialBody dropcap>
            <p>
              Most of the businesses that keep a neighborhood worth living in
              are the ones with the least time and the smallest tech budget.
              The bodega open at 11pm. The salon between the dry cleaner and
              the bagel shop. The pharmacy that knows the patient by name.
              They are the places people rely on. They are also the ones
              getting outspent on tools by chains with full tech teams.
            </p>
            <p>
              Little Fight closes that gap. Not by selling more software. Not
              by pitching a giant overhaul. By doing the practical work - sites
              that explain the business plainly, support that picks up when
              something breaks, search visibility that tells the truth, and
              small systems that make the day move.
            </p>
            <p>
              The order is always the same. Keep what works. Connect what
              matters. Replace what drags. Build only what fits. Most owners
              assume the answer is a rebuild. It almost never is.
            </p>
            <p>
              The promises are easy to remember. The consult is always free.
              Websites usually ship within 14 days. On-site visits land within
              24 hours when needed. Callbacks come within 2 hours,
              9am-9pm Eastern. After hours, AI takes the message and David
              calls back.
            </p>
            <p>
              Most calls start with "I don't know if this is a stupid
              question…" It almost never is. The Wi-Fi being weird, the email
              going to a stranger, the booking link that hasn't worked in three
              months - none of that is stupid. It is the business. Call when
              you need the path fixed.
            </p>
            <p>
              The direct line is (646) 360-0318. Email is
              hello@littlefightnyc.com. If the problem has moving parts, the
              Fit Check is the cleanest way to send context without sending
              passwords, private customer data, or recovery codes.
            </p>
          </EditorialBody>
        </div>
      </section>

      <QuietContact />
    </>
  );
}
