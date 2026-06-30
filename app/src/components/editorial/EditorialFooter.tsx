import { Link } from "react-router-dom";
import PhoneAction from "./PhoneAction";
import "./EditorialFooter.css";

export default function EditorialFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="lf-foot" role="contentinfo">
      <div className="lf-container">
        <div className="lf-foot__masthead">
          <p className="lf-mono lf-foot__edition">
            End of Issue <span className="lf-foot__edition-no">№01</span>
          </p>
          <h2 className="lf-display lf-foot__wordmark">LITTLE FIGHT NYC</h2>
          <p className="lf-italic lf-foot__tagline">
            Independent. Founded 2012. Manhattan, New York.
          </p>
          <p className="lf-foot__signature lf-script" aria-hidden="true">
            — Little Fight NYC
          </p>
        </div>

        <div className="lf-foot__columns">
          <div className="lf-foot__col">
            <p className="lf-mono lf-foot__col-label">Services</p>
            <ul>
              <li><Link to="/services/tech-consulting/">Tech Consulting</Link></li>
              <li><Link to="/services/it-support/">IT Support</Link></li>
              <li><Link to="/services/custom-local-websites/">Custom Local Websites</Link></li>
              <li><Link to="/services/business-systems/">Business Systems</Link></li>
            </ul>
          </div>

          <div className="lf-foot__col">
            <p className="lf-mono lf-foot__col-label">Read</p>
            <ul>
              <li><Link to="/field-guide/">Field Guide</Link></li>
              <li><Link to="/audit/">Audit</Link></li>
              <li><Link to="/journal/">Journal</Link></li>
              <li><Link to="/glossary/">Glossary</Link></li>
            </ul>
          </div>

          <div className="lf-foot__col">
            <p className="lf-mono lf-foot__col-label">Reach</p>
            <ul>
              <li><PhoneAction>(646) 360-0318</PhoneAction></li>
              <li><a href="mailto:hello@littlefightnyc.com">hello@littlefightnyc.com</a></li>
              <li><Link to="/fit-check/">Fit Check</Link></li>
            </ul>
          </div>

          <div className="lf-foot__col">
            <p className="lf-mono lf-foot__col-label">Office</p>
            <ul>
              <li><Link to="/about/">About</Link></li>
              <li><Link to="/legal/">Privacy and terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="lf-foot__hours">
          <p className="lf-mono lf-foot__hours-label">Hours</p>
          <p className="lf-italic lf-foot__hours-line">
            9am–9pm Eastern, a human answers. After hours, an AI takes the
            message and Little Fight NYC calls back.
          </p>
        </div>

        <div className="lf-foot__strip">
          <p className="lf-mono lf-foot__copy">
            © <span className="lf-foot__year">{year}</span> Little Fight NYC · Printed on the internet · New York City
          </p>
          <a className="lf-mono lf-foot__top" href="#top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
