import { Mail, Phone } from "lucide-react";
import CallToAction from "@/components/CallToAction";

export default function Contact() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Contact</p>
        <h1>Tell us what is going on.</h1>
        <p>
          If something is actively affecting customers, call. If the setup is
          messy but not on fire, start with the Fit Check.
        </p>
      </section>

      <section className="section contact-grid">
        <a className="contact-card" href="tel:+16463600318">
          <Phone size={28} />
          <span>Call</span>
          <strong>(646) 360-0318</strong>
        </a>
        <a className="contact-card" href="mailto:hello@littlefightnyc.com">
          <Mail size={28} />
          <span>Email</span>
          <strong>hello@littlefightnyc.com</strong>
        </a>
      </section>

      <CallToAction compact />
    </>
  );
}
