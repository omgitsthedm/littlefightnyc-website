import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, ShieldCheck, ArrowUpRight, MessageSquare } from "lucide-react";
import TugMark from "@/components/editorial/TugMark";
import { openConsentPreferences } from "@/lib/consent";
import { installLocalizedMeta } from "@/lib/localizedMeta";
import "./Espanol.css";

/**
 * /es/ is the complete pitch in Spanish. One fully Spanish page with its own
 * chrome, no English nav/footer around it) rather than a site-wide switcher
 * that would translate 5% of strings. Hand-written neutral Latin-American
 * Spanish in the house voice: plain, direct, zero jargon. Every promise here
 * is the same real promise the English site makes. Nothing new is claimed.
 *
 * Standalone route (outside EditorialShell, like Home). Sets <html lang="es">
 * while mounted so assistive tech pronounces it right.
 */

const SERVICES = [
  {
    title: "Páginas web hechas para su negocio",
    line: "Diseñadas para sus clientes, sus servicios y su forma de trabajar. Su negocio no tiene que adaptarse a una plantilla.",
  },
  {
    title: "Arreglamos lo que falló",
    line: "Pagos, Wi-Fi, correo, caja o reservas. Vamos a su negocio o ayudamos a distancia.",
  },
  {
    title: "Segunda opinión gratis",
    line: "Le decimos qué conservar, qué arreglar primero y qué no vale la pena pagar. Si no nos necesita, también se lo decimos.",
  },
  {
    title: "Software que es suyo",
    line: "Reemplazamos hojas de cálculo y suscripciones que no encajan con una herramienta más simple. El código y los datos son suyos.",
  },
];

const PROMISES = [
  "La segunda opinión siempre es gratis.",
  "Su página web en 14 días o no paga.",
  "Devolvemos la llamada en 2 horas, de 9 a. m. a 9 p. m.",
  "El código, los datos y la documentación quedan en sus manos.",
];

const STAYS = [
  "Su nombre, teléfono, dominio y marca.",
  "Las herramientas que sí le sirven.",
  "La forma en que atiende a sus clientes.",
];

const EASIER = [
  "Que nuevos clientes lo encuentren y entiendan.",
  "Reservar, pagar y comunicarse.",
  "Saber a quién llamar cuando algo falla.",
];

const PROOF = [
  {
    client: "Hair By Rachel Charles",
    status: "Sitio público",
    line: "De citas por mensaje directo a una página que nuevos clientes pueden encontrar y reservar.",
    fact: "100 en Lighthouse · lista en 2 semanas",
    image: "/assets/case-hair-by-rachel-charles-900.webp",
    alt: "La página de reservas de Hair By Rachel Charles",
  },
  {
    client: "Sistema privado de presupuestos",
    status: "Proyecto privado",
    line: "El proceso real de presupuestos reunido en un sistema que el equipo usa todos los días.",
    fact: "3 herramientas, 1 fuente de verdad",
    image: "/assets/case-public-house-cockpit.webp",
    alt: "Panel privado para preparar presupuestos de carpintería",
  },
  {
    client: "CC Films",
    status: "Sitio público",
    line: "Una sede oficial más clara para una película independiente.",
    fact: "Estructura, buscadores y publicación reforzados",
    image: "/assets/case-cc-films-900.webp",
    alt: "El sitio oficial de la película If That Mockingbird Don't Sing",
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
    <div className="lf-editorial lf-es" lang="es">
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
          <div className="lf-es__hero-copy">
            <p className="lf-es__eyebrow">
              Tecnología clara para negocios de Nueva York
            </p>
            <h1>
              Una página web hecha para su negocio.
              <span className="lf-es__em">
                Ayuda real cuando algo falla.
              </span>
            </h1>
            <p className="lf-es__sub">
              Construimos páginas a la medida, arreglamos la tecnología que ya
              tiene y reemplazamos software caro por herramientas que usted
              posee. Primero le damos una segunda opinión gratis.
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
                Quiero un plan claro
                <ArrowUpRight size={18} strokeWidth={1.9} aria-hidden="true" />
              </Link>
            </div>
            <p className="lf-es__action-note">
              La segunda opinión es gratis. Primero un plan claro; después usted decide.
            </p>

            <ul className="lf-es__trust">
              <li>
                <MapPin size={18} strokeWidth={1.75} aria-hidden="true" />
                Nueva York. Vamos hasta su negocio.
              </li>
              <li>
                <Clock size={18} strokeWidth={1.75} aria-hidden="true" />
                Devolvemos la llamada en 2 horas.
              </li>
              <li>
                <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
                Usted conserva el control y la propiedad.
              </li>
            </ul>
          </div>

          <figure className="lf-es__hero-scene">
            <img
              src="/assets/pos.webp"
              alt="Una caja y una terminal de pago en el mostrador de un pequeño negocio de Nueva York"
              width="960"
              height="640"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <figcaption>
              El mostrador es su centro de operaciones. La tecnología debe seguirle el paso.
            </figcaption>
          </figure>
        </section>

        <section className="lf-es__services" aria-labelledby="lf-es-services-title">
          <div className="lf-es__section-head">
            <p>Empiece por el problema de hoy</p>
            <h2 id="lf-es-services-title">Esto es lo que hacemos.</h2>
            <span>Cuatro formas de quitarle peso a su negocio.</span>
          </div>
          <ul>
            {SERVICES.map((service, index) => (
              <li
                className={index === 0 ? "lf-es__service lf-es__service--lead" : "lf-es__service"}
                key={service.title}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="lf-es__fit" aria-labelledby="lf-es-fit-title">
          <div className="lf-es__section-head">
            <p>Un cambio sin perder lo que ya sirve</p>
            <h2 id="lf-es-fit-title">No cambiamos su negocio. Quitamos los obstáculos.</h2>
            <span>Primero vemos cómo trabaja. Después decidimos juntos qué vale la pena cambiar.</span>
          </div>
          <div className="lf-es__fit-grid">
            <article>
              <h3>Lo que se queda</h3>
              <ul>
                {STAYS.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article>
              <h3>Lo que se vuelve más fácil</h3>
              <ul>
                {EASIER.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          </div>
        </section>

        <section className="lf-es__fight">
          <p>
            Usted ya sabe llevar su negocio. Nosotros escuchamos cómo trabaja,
            conservamos lo que sirve y arreglamos lo que estorba. No tiene que
            volverse experto en tecnología.
          </p>
        </section>

        <section className="lf-es__proof" aria-label="Proyectos reales">
          <div className="lf-es__section-head">
            <p>Proyectos reales</p>
            <h2>Esto ya está funcionando para clientes.</h2>
            <span>Sitios públicos y sistemas privados, claramente identificados.</span>
          </div>
          <ul>
            {PROOF.map((item) => (
              <li key={item.client}>
                <img
                  src={item.image}
                  alt={item.alt}
                  width="900"
                  height="675"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <small>{item.status}</small>
                  <strong>{item.client}</strong>
                  <span>{item.line}</span>
                  <em>{item.fact}</em>
                </div>
              </li>
            ))}
          </ul>
          <Link className="lf-es__proof-link" to="/examples/">
            Ver todos los proyectos <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </section>

        <section className="lf-es__promises" aria-label="Nuestras promesas">
          <div className="lf-es__section-head">
            <p>Sin sorpresas</p>
            <h2>Desde la primera llamada hasta después del lanzamiento.</h2>
          </div>
          <ul>
            {PROMISES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="lf-es__contact">
          <div className="lf-es__contact-copy">
            <p className="lf-es__eyebrow">Una persona de verdad contesta</p>
            <h2>Cuéntenos qué está fallando.</h2>
            <p>
              Llame, mande un texto o escriba un correo en el idioma que le
              quede cómodo. Sin robots y sin número de ticket.
            </p>
          </div>
          <div className="lf-es__contact-actions">
            <a className="lf-es__cta lf-es__cta--primary lf-es__cta--big" href="tel:+16463600318">
              <Phone size={22} strokeWidth={1.75} aria-hidden="true" />
              (646) 360-0318
            </a>
            <div className="lf-es__contact-links">
              <a href="sms:+16463600318"><MessageSquare size={18} aria-hidden="true" /> Mandar texto</a>
              <a href="mailto:hello@littlefightnyc.com"><Mail size={18} aria-hidden="true" /> Escribir correo</a>
            </div>
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
