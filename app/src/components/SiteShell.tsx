import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { answerGuides, areaPages, navItems, services } from "@/data/site";
import DotField from "./DotField";
import RouteMeta from "./RouteMeta";

export default function SiteShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const showStickyCta = !["/fit-check", "/fit-check/", "/thanks", "/thanks/"].includes(location.pathname);

  const closeMenu = () => setOpen(false);

  return (
    <div className="site-shell">
      <RouteMeta />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <DotField />
      <header className="site-header">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark">LF</span>
          <span>
            Little Fight NYC
            <small>Local Business Advantage</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <a className="phone-link" href="tel:+16463600318">
            <Phone size={16} /> (646) 360-0318
          </a>
          <Link className="button small" to="/fit-check/">
            Start Here
          </Link>
          <button
            className="menu-button"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="mobile-panel">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={closeMenu}>
              {item.label}
            </NavLink>
          ))}
          <a href="tel:+16463600318" onClick={closeMenu}>
            Call Little Fight
          </a>
        </div>
      ) : null}

      <main id="main-content">
        <Outlet />
      </main>

      {showStickyCta ? (
        <Link className="mobile-sticky-cta" to="/fit-check/">
          Start a Fit Check
        </Link>
      ) : null}

      <footer className="site-footer">
        <div className="footer-brand">
          <h2>Little Fight NYC</h2>
          <p>Better tech. Fewer bills. More customers.</p>
          <p className="nap">
            Little Fight NYC · New York, NY · <a href="tel:+16463600318">(646) 360-0318</a> ·{" "}
            <a href="mailto:hello@littlefightnyc.com">hello@littlefightnyc.com</a>
          </p>
        </div>
        <div className="footer-silos">
          <div>
            <h3>Services</h3>
            {services.map((service) => (
              <Link key={service.slug} to={`/services/${service.slug}/`}>
                {service.eyebrow}
              </Link>
            ))}
          </div>
          <div>
            <h3>Neighborhoods</h3>
            {areaPages.slice(0, 6).map((area) => (
              <Link key={area.slug} to={`/areas/${area.slug}/`}>
                {area.name}
              </Link>
            ))}
          </div>
          <div>
            <h3>Owner Answers</h3>
            {answerGuides.slice(0, 4).map((guide) => (
              <Link key={guide.slug} to={`/answers/${guide.slug}/`}>
                {guide.question}
              </Link>
            ))}
          </div>
          <div>
            <h3>Start</h3>
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                {item.label}
              </Link>
            ))}
            <Link to="/about/">About</Link>
            <Link to="/glossary/">Glossary</Link>
            <Link to="/contact/">Contact</Link>
            <Link to="/privacy/">Privacy</Link>
            <Link to="/terms/">Terms</Link>
          </div>
        </div>
        <p className="fine-print">
          Built in New York for local businesses that do not have time for mystery software.
        </p>
      </footer>
    </div>
  );
}
