import { ArrowRight, Phone } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { PHONE_DISPLAY, PHONE_HREF } from "@/data/contact";
import "./OwnerFight.css";

/**
 * Name the fight. Three owner problems, in the owner's words, each opening
 * onto the one service that answers it. The ladder underneath keeps the
 * commercial hierarchy visible: websites are the front door, urgent support
 * is the second path, owned software is the premium continuation, and a free
 * second opinion comes before any of it.
 */
const FIGHTS = [
  {
    key: "customers",
    tab: "I need more customers",
    kicker: "Websites · the front door",
    title: "A website that does the explaining.",
    body:
      "Booking becomes a handoff, not a back-and-forth. The site answers the practical questions first. The right person sees a clear reason to choose you. The next click is easy.",
    action: { label: "How we build websites", to: "/services/custom-local-websites/" },
    proof: { label: "How it went for Rachel", to: "/case-studies/hair-by-rachel-charles/" },
    tone: "lead",
  },
  {
    key: "broken",
    tab: "Something is broken",
    kicker: "Tech support · the urgent path",
    title: "Get a straight answer and a useful next move.",
    body:
      "When the day stops working — email, the booking link, the register, the Wi-Fi — you get a human, a real answer, and a fix that gets written down.",
    action: { label: `Call ${PHONE_DISPLAY}`, href: PHONE_HREF },
    proof: { label: "How support works", to: "/services/it-support/" },
    tone: "urgent",
  },
  {
    key: "tools",
    tab: "My tools don’t fit",
    kicker: "Software you own · instead of renting",
    title: "One focused tool instead of five almost-right ones.",
    body:
      "When renting another platform stops making sense, we build the small system that fits how the work actually happens. You own it, and your data.",
    action: { label: "Software you own", to: "/services/business-systems/" },
    proof: { label: "How it went for ClearHelp", to: "/case-studies/clearhelp/" },
    tone: "premium",
  },
] as const;

type FightKey = (typeof FIGHTS)[number]["key"];

export default function OwnerFight() {
  const [activeKey, setActiveKey] = useState<FightKey>(FIGHTS[0].key);
  // The first panel paints complete (no entrance fade); only a real switch
  // animates, so nothing on the page arrives at partial opacity.
  const [switched, setSwitched] = useState(false);
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = FIGHTS.find((fight) => fight.key === activeKey) ?? FIGHTS[0];

  const choose = (key: FightKey) => {
    if (key === activeKey) return;
    setSwitched(true);
    setActiveKey(key);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % FIGHTS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + FIGHTS.length) % FIGHTS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = FIGHTS.length - 1;
    else return;
    event.preventDefault();
    choose(FIGHTS[next].key);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="lf-fight" aria-labelledby="lf-fight-title" data-lf-fight={active.key}>
      <div className="lf-fight__inner">
        <header className="lf-fight__head">
          <p className="lf-fight__eyebrow">LF / 03 · Name the fight</p>
          <h2 id="lf-fight-title" className="lf-fight__title">
            What’s in
            <br />
            your way<span aria-hidden="true">?</span>
          </h2>
          <p className="lf-fight__dek">
            You get a plan in plain words, and one next move. Pick the one
            you are in.
          </p>
        </header>

        <div className="lf-fight__switch">
          <div className="lf-fight__tabs" role="tablist" aria-label="What is in your way?">
            {FIGHTS.map((fight, index) => {
              const selected = fight.key === activeKey;
              return (
                <button
                  key={fight.key}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${fight.key}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  className={`lf-fight__tab lf-fight__tab--${fight.tone}${selected ? " lf-fight__tab--selected" : ""}`}
                  onClick={() => choose(fight.key)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                >
                  <span className="lf-fight__tab-num" aria-hidden="true">0{index + 1}</span>
                  <span className="lf-fight__tab-label">{fight.tab}</span>
                </button>
              );
            })}
          </div>

          <div
            key={active.key}
            className={`lf-fight__panel lf-fight__panel--${active.tone}${switched ? " lf-fight__panel--enter" : ""}`}
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${active.key}`}
          >
            <p className="lf-fight__kicker">{active.kicker}</p>
            <h3 className="lf-fight__panel-title">{active.title}</h3>
            <p className="lf-fight__body">{active.body}</p>
            <div className="lf-fight__actions">
              {"href" in active.action ? (
                <a
                  className="lf-fight__action"
                  href={active.action.href}
                  data-lf-label="home_fight_phone"
                >
                  <Phone size={18} strokeWidth={2} aria-hidden="true" />
                  {active.action.label}
                </a>
              ) : (
                <Link className="lf-fight__action" to={active.action.to}>
                  {active.action.label}
                  <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                </Link>
              )}
              <Link className="lf-fight__proof" to={active.proof.to}>
                {active.proof.label}
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <aside className="lf-fight__ladder" aria-label="How the work usually goes">
          <p className="lf-fight__ladder-label">How the work usually goes</p>
          <ol className="lf-fight__ladder-steps">
            <li>
              <strong>Website</strong>
              <span>the front door</span>
            </li>
            <li>
              <strong>Support</strong>
              <span>keeps it working</span>
            </li>
            <li>
              <strong>Software you own</strong>
              <span>when renting stops making sense</span>
            </li>
          </ol>
          <p className="lf-fight__ladder-note">
            Not sure which one? Start with a{" "}
            <Link to="/services/tech-consulting/">free second opinion</Link>. It comes before
            any paid work.{" "}
            <Link to="/services/">See all services</Link>
          </p>
        </aside>
      </div>
    </section>
  );
}
