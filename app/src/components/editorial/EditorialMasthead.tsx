import { Link } from "react-router-dom";
import "./EditorialMasthead.css";

type Props = {
  section?: string;
};

/**
 * Compact running masthead for inner pages. Mirrors a magazine's interior
 * header — smaller wordmark, no Press Strike animation, persistent brand
 * identity. Section name appears as marginalia on the right.
 */
export default function EditorialMasthead({ section }: Props) {
  return (
    <header className="lf-mh" aria-label="Little Fight NYC masthead">
      <div className="lf-container lf-mh__inner">
        <Link to="/" className="lf-mh__brand">
          <h1 className="lf-display lf-mh__wordmark">
            LITTLE FIGHT NYC
          </h1>
          <span className="lf-mh__underline" aria-hidden="true" />
        </Link>

        {section && (
          <p className="lf-mono lf-mh__section">
            <span className="lf-mh__section-label">Section</span>
            <span className="lf-mh__section-divider" aria-hidden="true">/</span>
            <span className="lf-mh__section-name">{section}</span>
          </p>
        )}
      </div>
    </header>
  );
}
