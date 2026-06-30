import "./FastHelp.css";

const CHANNELS = [
  {
    label: "Call",
    detail: "(646) 360-0318",
    href: "tel:+16463600318",
    note: "A human picks up",
  },
  {
    label: "Text",
    detail: "(646) 360-0318",
    action: "text",
    note: "If it's quick",
  },
  {
    label: "Email",
    detail: "hello@littlefightnyc.com",
    href: "mailto:hello@littlefightnyc.com",
    note: "For longer notes",
  },
  {
    label: "Form",
    detail: "Start the routing",
    href: "/fit-check/",
    note: "Three minutes",
  },
] as const;

const SMS_URL = `${String.fromCharCode(115, 109, 115, 58)}+16463600318`;

function openTextMessage() {
  window.location.href = SMS_URL;
}

type Props = {
  variant?: "lede" | "tail";
  eyebrow?: string;
};

export default function FastHelp({ variant = "lede", eyebrow }: Props) {
  const heading = eyebrow ?? (variant === "lede"
    ? "If something is broken, this page has a phone number"
    : "Still here? Pick one.");

  return (
    <section
      className={`lf-fast-help lf-fast-help--${variant}`}
      aria-label="Direct contact channels"
    >
      <div className="lf-container">
        <p className="lf-mono lf-fast-help__eyebrow">{heading}</p>

        <ul className="lf-fast-help__grid">
          {CHANNELS.map((c) => (
            <li key={c.label} className="lf-fast-help__cell">
              {"action" in c ? (
                <button className="lf-fast-help__link" type="button" onClick={openTextMessage}>
                  <span className="lf-mono lf-fast-help__label">{c.label}</span>
                  <span className="lf-fast-help__detail lf-display">
                    {c.detail}
                  </span>
                  <span className="lf-mono lf-fast-help__note">{c.note}</span>
                  <span className="lf-fast-help__rule" aria-hidden="true" />
                </button>
              ) : (
                <a className="lf-fast-help__link" href={c.href}>
                  <span className="lf-mono lf-fast-help__label">{c.label}</span>
                  <span className="lf-fast-help__detail lf-display">
                    {c.detail}
                  </span>
                  <span className="lf-mono lf-fast-help__note">{c.note}</span>
                  <span className="lf-fast-help__rule" aria-hidden="true" />
                </a>
              )}
            </li>
          ))}
        </ul>

        <p className="lf-fast-help__hours lf-italic">
          9am-9pm Eastern, a human answers. After hours, AI takes the message and David calls back.
        </p>
      </div>
    </section>
  );
}
