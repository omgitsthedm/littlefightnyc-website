import KeepConnectReplaceBuild from "@/components/dataviz/KeepConnectReplaceBuild";
import "./SystemVerbs.css";

/**
 * SystemVerbs — the "how we work" beat. The brand's four verbs, made physical by
 * the KeepConnectReplaceBuild instrument: a shop's scattered tools resolve into
 * one owned system. Sits between the service ladder (WorkGrid) and the
 * "software you own" payoff (MomentumSection / MoneyLeaving) — the method before
 * the proof. Text left, instrument right on desktop; stacked on phone.
 */
export default function SystemVerbs() {
  return (
    <section className="lf-verbs" aria-labelledby="lf-verbs-heading">
      <div className="lf-container lf-verbs__inner">
        <div className="lf-verbs__lede">
          <span className="lf-mono lf-verbs__eyebrow">How we work</span>
          <h2 id="lf-verbs-heading" className="lf-display lf-verbs__title">
            Keep. Connect. Replace. Build.
          </h2>
          <p className="lf-verbs__dek">
            Most shops don't need more tools. They need the right few, talking to
            each other — one system you own.
          </p>
        </div>
        <div className="lf-verbs__viz">
          <KeepConnectReplaceBuild />
        </div>
      </div>
    </section>
  );
}
