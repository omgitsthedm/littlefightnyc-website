import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { navItems } from "@/data/site";
import DotField from "./DotField";

export default function SiteShell() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <div className="site-shell">
      <DotField />
      <header className="site-header">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="Little Fight NYC home">
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
          <Link className="button small" to="/fit-check">
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

      <footer className="site-footer">
        <div>
          <h2>Little Fight NYC</h2>
          <p>Better tech. Fewer bills. More customers.</p>
        </div>
        <div className="footer-links">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
          <Link to="/contact">Contact</Link>
        </div>
        <p className="fine-print">
          Built in New York for local businesses that do not have time for mystery software.
        </p>
      </footer>
    </div>
  );
}
