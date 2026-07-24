import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { responsiveImageProps } from "@/lib/responsiveImages";
import "./OwnerStories.css";

type OwnerStory = {
  id: "barber" | "bistro" | "law";
  owner: string;
  image: string;
  imageAlt: string;
  headline: string;
  summary: string;
  stays: string;
  easier: string;
};

const ownerStories: OwnerStory[] = [
  {
    id: "barber",
    owner: "The neighborhood barber",
    image: "/images/owner-stories/neighborhood-barber.webp",
    imageAlt:
      "An empty neighborhood barbershop with familiar chairs, mirrors, an appointment book, and a small booking screen",
    headline: "Keep the shop familiar. Make the next appointment easier.",
    summary:
      "Regulars can still call. New customers can find the hours, see the work, and book without chasing a message.",
    stays:
      "The chairs, the prices, the regulars, the phone number, and the way the shop runs.",
    easier:
      "Google shows the right facts. The site loads fast. Calling and booking take one tap.",
  },
  {
    id: "bistro",
    owner: "The small bistro",
    image: "/images/owner-stories/neighborhood-bistro.webp",
    imageAlt:
      "An intimate neighborhood bistro with set tables, a handwritten reservation book, and a small booking screen",
    headline: "Keep the room's character. Make the next table easier to fill.",
    summary:
      "People can check the menu, hours, and reservation path before they choose the place down the block.",
    stays:
      "The menu, the hospitality, the regulars, and the tools the staff already trusts.",
    easier:
      "Hours agree everywhere. The menu works on a phone. Reservations reach the right person.",
  },
  {
    id: "law",
    owner: "The family-run law firm",
    image: "/images/owner-stories/family-law-office.webp",
    imageAlt:
      "A long-running law office with legal books, paper files, an older desktop, and a newer laptop",
    headline: "Keep the reputation. Give the next generation a clean handoff.",
    summary:
      "A modern website and written handoff help new clients reach the firm while the family keeps control.",
    stays:
      "The firm name, the relationships, the judgment, the documents, and the way the firm practices.",
    easier:
      "The domain, email, inquiries, accounts, and instructions are organized and owned by the firm.",
  },
];

export default function OwnerStories() {
  return (
    <section
      className="lf-owner-stories"
      aria-labelledby="lf-owner-stories-title"
    >
      <div className="lf-owner-stories__inner">
        <header className="lf-owner-stories__head">
          <h2 id="lf-owner-stories-title">
            Keep what people love. Fix what gets in the way.
          </h2>
          <p>
            You do not need to become a tech company. We learn how your
            business works, protect what matters, and make it easier for people
            to find you, trust you, and reach you.
          </p>
        </header>

        <div className="lf-owner-stories__grid">
          {ownerStories.map((story) => (
            <article
              className="lf-owner-story"
              data-owner-story={story.id}
              key={story.id}
            >
              <figure className="lf-owner-story__figure">
                <div className="lf-owner-story__media">
                  <img
                    src={story.image}
                    {...responsiveImageProps(
                      story.image,
                      story.id === "barber"
                        ? "(min-width: 1280px) 55vw, (min-width: 760px) 70vw, 100vw"
                        : "(min-width: 1280px) 38vw, (min-width: 760px) 50vw, 100vw",
                      [480, 640, 900, 1200],
                    )}
                    alt={story.imageAlt}
                    width={1672}
                    height={941}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption>Illustrative scene. Not client evidence.</figcaption>
              </figure>

              <div className="lf-owner-story__body">
                <p className="lf-owner-story__owner">{story.owner}</p>
                <h3>{story.headline}</h3>
                <p className="lf-owner-story__summary">{story.summary}</p>

                <dl className="lf-owner-story__outcomes">
                  <div>
                    <dt>What stays</dt>
                    <dd>{story.stays}</dd>
                  </div>
                  <div>
                    <dt>What gets easier</dt>
                    <dd>{story.easier}</dd>
                  </div>
                </dl>

                {story.id === "barber" && (
                  <Link
                    className="lf-owner-story__proof-link"
                    to="/case-studies/hair-by-rachel-charles/"
                  >
                    See what changed
                    <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        <footer className="lf-owner-stories__footer">
          <div>
            <strong>You do not need to know what to ask for.</strong>
            <p>
              Show us what feels slow, confusing, or held together by one
              person. We will give you a plain-English plan.
            </p>
          </div>
          <Link
            className="lf-owner-stories__plan-link"
            to="/tech-audit/?intent=website&source=owner_stories"
            data-lf-event="website_plan_intent"
          >
            Get my website plan
            <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </section>
  );
}
