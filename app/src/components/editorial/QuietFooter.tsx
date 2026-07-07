import { Link } from "react-router-dom";
import { Award, BookOpen, HelpCircle, Layers, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./QuietFooter.css";

const footerGroups: Array<{ title: string; icon: LucideIcon; links: Array<{ label: string; to: string }> }> = [
  {
    title: "Work",
    icon: Layers,
    links: [
      { label: "Tech Consulting", to: "/services/tech-consulting/" },
      { label: "IT Support", to: "/services/it-support/" },
      { label: "Custom Local Websites", to: "/services/custom-local-websites/" },
      { label: "Business Systems", to: "/services/business-systems/" },
      { label: "Studio", to: "/services/#studio" },
      { label: "Website Audit", to: "/audit/" },
    ],
  },
  {
    title: "Proof",
    icon: Award,
    links: [
      { label: "Examples", to: "/examples/" },
      { label: "CC Films", to: "/case-studies/cc-films/" },
      { label: "DeckSpace", to: "/case-studies/deckspace/" },
      { label: "Hair By Rachel Charles", to: "/case-studies/hair-by-rachel-charles/" },
      { label: "Grand Funding LLC", to: "/case-studies/grand-funding-llc/" },
      { label: "Public House Creative", to: "/case-studies/public-house-creative/" },
      { label: "After Hours Agenda", to: "/case-studies/after-hours-agenda/" },
      { label: "ClearHelp", to: "/case-studies/clearhelp/" },
    ],
  },
  {
    title: "Answers",
    icon: HelpCircle,
    links: [
      { label: "Form Not Working", to: "/answers/website-form-not-working-small-business/" },
      { label: "Cut Software Costs", to: "/answers/reduce-monthly-software-costs-small-business/" },
      { label: "Google Maps Visibility", to: "/answers/business-not-showing-on-google-maps/" },
      { label: "Salon Booking Costs", to: "/answers/hair-salon-save-money-software/" },
      { label: "Pharmacy Website Support", to: "/answers/local-pharmacy-website-community-support/" },
      { label: "Custom System vs SaaS", to: "/answers/when-custom-business-system-beats-saas/" },
    ],
  },
  {
    title: "Local",
    icon: MapPin,
    links: [
      { label: "Lower East Side", to: "/areas/lower-east-side/" },
      { label: "East Village", to: "/areas/east-village/" },
      { label: "SoHo", to: "/areas/soho/" },
      { label: "Chelsea", to: "/areas/chelsea/" },
      { label: "Midtown", to: "/areas/midtown/" },
      { label: "Upper East Side", to: "/areas/upper-east-side/" },
      { label: "Upper West Side", to: "/areas/upper-west-side/" },
      { label: "West Village", to: "/areas/west-village/" },
    ],
  },
  {
    title: "Library",
    icon: BookOpen,
    links: [
      { label: "Journal", to: "/journal/" },
      { label: "Glossary", to: "/glossary/" },
      { label: "Business System", to: "/glossary/business-system/" },
      { label: "Google Business Profile", to: "/glossary/google-business-profile/" },
      { label: "Local Search", to: "/glossary/local-search/" },
      { label: "Workflow Automation", to: "/glossary/workflow-automation/" },
    ],
  },
];

export default function QuietFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="lf-quiet-foot" role="contentinfo">
      <div className="lf-quiet-foot__inner">
        <div className="lf-quiet-foot__top">
          <div className="lf-quiet-foot__brand">
            <Link to="/" className="lf-quiet-foot__brand-link">Little Fight NYC</Link>
            <p>Manhattan, New York · Since 2012 · Still picking up the phone</p>
          </div>
          <nav className="lf-quiet-foot__company" aria-label="Company and legal">
            <Link to="/fit-check/">Fit Check</Link>
            <Link to="/about/">About</Link>
            <Link to="/contact/">Contact</Link>
            <Link to="/privacy/">Privacy</Link>
            <Link to="/terms/">Terms</Link>
          </nav>
        </div>

        <nav className="lf-quiet-foot__nav" aria-label="Footer">
          {footerGroups.map((group) => (
            <div className="lf-quiet-foot__group" key={group.title}>
              <h2>
                <group.icon size={14} strokeWidth={2} aria-hidden="true" />
                {group.title}
              </h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="lf-quiet-foot__bottom">
          <p className="lf-quiet-foot__contact">
            <a href="tel:+16463600318">(646) 360-0318</a>
            <span aria-hidden="true">·</span>
            <a href="mailto:hello@littlefightnyc.com">hello@littlefightnyc.com</a>
          </p>
          <p className="lf-quiet-foot__legal">
            © {year} Little Fight NYC. All rights reserved.
          </p>
        </div>

        <p className="lf-quiet-foot__signature">
          Designed, Hosted and Cared For by{" "}
          <a
            href="https://littlefightnyc.com"
            rel="author"
          >
            LittleFightNYC.com
          </a>
        </p>
      </div>
    </footer>
  );
}
