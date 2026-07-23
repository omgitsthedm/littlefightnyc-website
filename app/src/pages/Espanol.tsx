import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, ShieldCheck, ArrowUpRight, MessageSquare } from "lucide-react";
import TugMark from "@/components/editorial/TugMark";
import TugAvatar from "@/components/editorial/TugAvatar";
import { openConsentPreferences } from "@/lib/consent";
import { installLocalizedMeta } from "@/lib/localizedMeta";
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

const PROOF = [
  {
    client: "Hair By Rachel Charles",
    line: "De citas por mensaje directo a una página real de reservas.",
    fact: "100 en Lighthouse · lista en 2 semanas",
  },
  {
    client: "Software privado de presupuestos",
    line: "Un sistema privado que el equipo usa en presupuestos reales.",
    fact: "3 herramientas → 1 fuente de verdad",
  },
  {
    client: "CC Films",
    line: "Una sede oficial más clara para una película independiente.",
    fact: "Estructura, buscadores y publicación reforzados",
  },
];

export default function Espanol() {
  useEffect(() => {
    return installLocalizedMeta({
      lang: "es",
      path: "/es/",
      title: "Páginas web y tecnología en español | Little Fight NYC",
      description: "Páginas web, soporte técnico y software propio para pequeños negocios de Nueva York. Vea trabajo real, llame o empiece un plan gratis.",
    });
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
            {" "}
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
            <Link
              className="lf-es__cta"
              to="/tech-audit/?intent=website&source=es"
              data-lf-event="website_plan_intent"
              data-lf-label="es_hero"
            >
              Planear mi sitio web
              <ArrowUpRight size={18} strokeWidth={1.9} aria-hidden="true" />
            </Link>
          </div>
          <p className="lf-es__action-note">Consulta gratis. Primero un plan claro; después usted decide.</p>

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

        <section className="lf-es__proof" aria-label="Trabajo real">
          <div className="lf-es__section-head">
            <p>Prueba, no promesas</p>
            <h2>Trabajo real que ya está funcionando.</h2>
          </div>
          <ul>
            {PROOF.map((item) => (
              <li key={item.client}>
                <strong>{item.client}</strong>
                <span>{item.line}</span>
                <small>{item.fact}</small>
              </li>
            ))}
          </ul>
          <Link className="lf-es__proof-link" to="/examples/">
            Ver todos los ejemplos <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
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
          <div className="lf-es__contact-links">
            <a href="sms:+16463600318"><MessageSquare size={16} aria-hidden="true" /> Mandar texto</a>
            <a href="mailto:hello@littlefightnyc.com"><Mail size={16} aria-hidden="true" /> Escribir correo</a>
          </div>
        </section>
      </main>

      <footer className="lf-es__foot">
        <p>Little Fight NYC · Nueva York · Desde 2021 · Todavía contestamos el teléfono</p>
        <Link to="/" className="lf-es__foot-link">
          Ver el sitio completo en inglés
          <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
        </Link>
        <button type="button" className="lf-es__foot-link" onClick={openConsentPreferences}>
          Preferencias de analítica
        </button>
      </footer>
    </div>
  );
}
