import PageHero from "@/components/editorial/PageHero";
import PhoneAction from "@/components/editorial/PhoneAction";
import "@/styles/editorial/fitcheck.css";

export default function FitCheck() {
  return (
    <>
      <PageHero
        eyebrow="Fit Check"
        title={
          <>
            Tell us what's<br />
            {" "}
            <span className="lf-em">broken.</span>
          </>
        }
        dek="Use this when the problem has parts. Tell us what feels broken, expensive, slow, or disconnected. We reply within two hours from 9am-9pm Eastern. The consult is free. Do not share passwords or private customer data."
        image={{
          src: "/assets/manhattan.webp",
          alt: "Manhattan rooftops at golden hour",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-fit">
        <div className="lf-fit__inner">
          <form
            className="lf-fit__form"
            name="fit-check-scratch"
            method="POST"
            action="/thanks/"
            data-netlify="true"
            netlify-honeypot="bot-field"
          >
            <input type="hidden" name="form-name" value="fit-check-scratch" />
            <input type="hidden" name="subject" value="New Little Fight NYC Fit Check" />
            <input type="hidden" name="source" value="littlefightnyc.com/fit-check" />
            <p className="lf-fit__honeypot">
              <label htmlFor="bot-field">Do not fill this out</label>
              <input id="bot-field" name="bot-field" tabIndex={-1} autoComplete="off" />
            </p>

            <div className="lf-fit__field">
              <label htmlFor="fit-name">Your name</label>
              <input id="fit-name" name="name" autoComplete="name" required />
            </div>

            <div className="lf-fit__field">
              <label htmlFor="fit-business">Business</label>
              <input id="fit-business" name="business" autoComplete="organization" required />
            </div>

            <div className="lf-fit__field">
              <label htmlFor="fit-contact">Phone or email</label>
              <input
                id="fit-contact"
                name="contact"
                autoComplete="email"
                required
                placeholder="(646) 555-0118 or hello@yourshop.com"
              />
            </div>

            <div className="lf-fit__field">
              <label htmlFor="fit-follow-up">Best way to reach you</label>
              <select id="fit-follow-up" name="follow_up" defaultValue="text">
                <option value="text">Text me</option>
                <option value="phone">Call me</option>
                <option value="email">Email me</option>
                <option value="fastest">Whatever's fastest</option>
              </select>
            </div>

            <div className="lf-fit__field lf-fit__field--full">
              <label htmlFor="fit-message">
                What feels broken, expensive, slow, or disconnected?
              </label>
              <textarea
                id="fit-message"
                name="message"
                rows={5}
                required
                placeholder="A short sentence is fine. We'll ask the rest on the call."
              />
            </div>

            <button className="lf-fit__submit" type="submit">
              Send the messy setup <span aria-hidden="true">→</span>
            </button>
          </form>

          <aside className="lf-fit__aside">
            <p className="lf-fit__aside-label">Or reach us now</p>
            <PhoneAction className="lf-fit__aside-phone">
              (646) 360-0318
            </PhoneAction>
            <p className="lf-fit__aside-note">
              9am-9pm Eastern. A human picks up when available. After hours,
              AI takes the message and David calls back.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
