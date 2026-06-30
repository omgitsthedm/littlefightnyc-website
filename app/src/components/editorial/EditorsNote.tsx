import "./EditorsNote.css";

export default function EditorsNote() {
  return (
    <section className="lf-note" aria-label="Editor's note">
      <div className="lf-container">
        <p className="lf-mono lf-note__label">Editor's note</p>
        <p className="lf-italic lf-note__lede">
          Tech for New York shops that have to win<br className="lf-note__br" />
          against billion-dollar competitors.
        </p>
        <p className="lf-note__body">
          Same tools the chains use. Sized for what a corner shop can afford.
          Three jobs: shrink the bills, grow the business, keep the shop a
          staple of the neighborhood.
        </p>
        <p className="lf-mono lf-note__sign">
          — Little Fight NYC
        </p>
      </div>
    </section>
  );
}
