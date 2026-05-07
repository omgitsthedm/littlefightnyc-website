import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page-hero">
      <p className="eyebrow">404</p>
      <h1>This page moved.</h1>
      <p>Start with the messy setup and we will route you to the right help.</p>
      <Link className="button primary" to="/fit-check">
        Start a Fit Check
      </Link>
    </section>
  );
}
