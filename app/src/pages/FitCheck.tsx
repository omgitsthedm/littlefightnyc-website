import { ArrowRight } from "lucide-react";
import { fitRoutes } from "@/data/site";

export default function FitCheck() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Fit Check</p>
        <h1>Start here if the setup feels off.</h1>
        <p>
          Pick the closest problem. We will help sort whether this is urgent
          support, a website cleanup, local visibility, software waste, or a
          bigger workflow issue.
        </p>
      </section>

      <section className="section fit-layout">
        <div className="fit-options">
          {fitRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <button type="button" key={route.label}>
                <Icon size={24} />
                <span>{route.label}</span>
                <small>{route.copy}</small>
              </button>
            );
          })}
        </div>

        <form className="fit-form" name="fit-check-scratch" method="POST" data-netlify="true">
          <input type="hidden" name="form-name" value="fit-check-scratch" />
          <label>
            Your name
            <input name="name" autoComplete="name" required />
          </label>
          <label>
            Business
            <input name="business" autoComplete="organization" required />
          </label>
          <label>
            Best follow-up
            <select name="follow_up" defaultValue="text">
              <option value="text">Text me</option>
              <option value="phone">Call me</option>
              <option value="email">Email me</option>
              <option value="fastest">Whatever is fastest</option>
            </select>
          </label>
          <label>
            What feels broken, expensive, slow, or disconnected?
            <textarea name="message" rows={5} required />
          </label>
          <p className="form-note">Do not share sensitive information here.</p>
          <button className="button primary" type="submit">
            Send the messy setup <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </>
  );
}
