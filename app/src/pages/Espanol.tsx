import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import TugMark from "@/components/editorial/TugMark";
import TugAvatar from "@/components/editorial/TugAvatar";
import "./Espanol.css";

/**
 * /es/ — the complete pitch, in Spanish. One fully-Spanish page (its own
 * chrome, no English nav/footer around it) rather than a site-wide switcher
 * that would translate 5% of strings. Hand-written neutral Latin-American
 * Spanish in the house voice: plain, direct, zero jargon. Every promise here
 * is the same real promise the English site makes — nothing new is claimed.
 *
 * Standalone route (outside EditorialShell, like Home). Sets <html lang="es">
 * while mounted so assistive tech pronounces it right.
 */

const SERVICES = [
  {
    title: "Páginas web",
    line: "Una página que hace sonar el teléfono. Llamadas, citas, pagos y Google — todo funcionando junto.",
  },
  {
    title: "Soporte técnico",
    line: "El internet, la caja, el correo, los pagos. Cuando algo falla, lo arregla una persona de verdad.",
  },
  {
    title: "Consultoría gratis",
    line: "Le decimos qué sirve, qué sobra y qué arreglar primero. Si no nos necesita, también se lo decimos.",
  },
  {
    title: "Software propio",
    line: "Deje de rentar programas. Construimos su herramienta una vez — y es suya para siempre.",
  },
];

const PROMISES = [
  "La consulta siempre es gratis.",
  "Su página web en 14 días — o no paga.",
  "Llamamos de vuelta en 2 horas, de 9am a 9pm.",
  "El código, los datos, todo: suyo.",
];

export default function Espanol() {
  useEffect(() => {
    const prevLang = document.documentElement.lang;
    const prevTitle = document.title;
    document.documentElement.lang = "es";
    document.title = "Little Fight NYC en español | Páginas web y tecnología para su negocio";
    return () => {
      document.documentElement.lang = prevLang || "en";
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="lf-editorial lf-es">
      <header className="lf-es__top">
        <span className="lf-es__brand">
          <TugMark className="lf-es__mark" />
          Little Fight NYC
        </span>
        <a className="lf-es__top-phone" href="tel:+16463600318">
          (646) 360-0318
        </a>
      </header>

      <main className="lf-es__main">
        <section className="lf-es__hero">
          <h1>
            Su página web trae clientes.
            <br />
            <span className="lf-es__em">Nosotros la mantenemos andando.</span>
          </h1>
          <p className="lf-es__sub">
            Hacemos su página web, contestamos cuando la tecnología falla, y
            acabamos con las cuotas mensuales que se comen su ganancia. Lo que
            construimos, es suyo.
          </p>

          <div className="lf-es__actions">
            <a className="lf-es__cta lf-es__cta--primary" href="tel:+16463600318">
              <Phone size={20} strokeWidth={1.75} aria-hidden="true" />
              Llámenos: (646) 360-0318
            </a>
            <a className="lf-es__cta" href="mailto:hello@littlefightnyc.com">
              <Mail size={20} strokeWidth={1.75} aria-hidden="true" />
              hello@littlefightnyc.com
            </a>
          </div>

          <ul className="lf-es__trust">
            <li>
              <MapPin size={16} strokeWidth={1.75} aria-hidden="true" />
              Nueva York. Vamos hasta su negocio.
            </li>
            <li>
              <Clock size={16} strokeWidth={1.75} aria-hidden="true" />
              Devolvemos la llamada en 2 horas
            </li>
            <li>
              <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
              Usted es dueño de lo que hacemos
            </li>
          </ul>
        </section>

        <section className="lf-es__services" aria-label="Qué hacemos">
          <h2>Qué hacemos</h2>
          <ul>
            {SERVICES.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.line}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="lf-es__fight">
          <p>
            Las cadenas grandes llegaron con equipos de tecnología. La tienda de
            la esquina nunca tuvo uno. Por eso existimos: para darle al negocio
            pequeño las mismas herramientas — sin las facturas de empresa grande.
          </p>
        </section>

        <section className="lf-es__promises" aria-label="Nuestras promesas">
          <h2>Lo que puede esperar</h2>
          <ul>
            {PROMISES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        {/* The tug — text-free brand moment, no translation compromise. */}
        <TugAvatar />

        <section className="lf-es__contact">
          <h2>Hablemos</h2>
          <p>
            Llame, mande un texto o escriba un correo — en el idioma que le
            quede cómodo. Le contesta una persona de verdad. Sin robots, sin
            número de ticket.
          </p>
          <a className="lf-es__cta lf-es__cta--primary lf-es__cta--big" href="tel:+16463600318">
            <Phone size={22} strokeWidth={1.75} aria-hidden="true" />
            (646) 360-0318
          </a>
        </section>
      </main>

      <footer className="lf-es__foot">
        <p>Little Fight NYC · Nueva York · Desde 2021 · Todavía contestamos el teléfono</p>
        <Link to="/" className="lf-es__foot-link">
          Ver el sitio completo en inglés
          <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}
