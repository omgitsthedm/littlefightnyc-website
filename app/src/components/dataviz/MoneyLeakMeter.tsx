import { useState } from "react";
import "./MoneyLeakMeter.css";

type FieldName = "missed" | "sale" | "closeRate";

const DEFAULTS: Record<FieldName, string> = {
  missed: "3",
  sale: "500",
  closeRate: "40",
};

const LIMITS: Record<FieldName, { min: number; max: number; step: number }> = {
  missed: { min: 0, max: 999, step: 1 },
  sale: { min: 0, max: 1_000_000, step: 25 },
  closeRate: { min: 0, max: 100, step: 1 },
};

function numeric(value: string, field: FieldName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  const { min, max } = LIMITS[field];
  return Math.min(max, Math.max(min, parsed));
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MoneyLeakMeter() {
  const [values, setValues] = useState(DEFAULTS);
  const missed = numeric(values.missed, "missed");
  const sale = numeric(values.sale, "sale");
  const closeRate = numeric(values.closeRate, "closeRate") / 100;
  const estimate = missed * sale * closeRate * 4;
  const perWeek = missed * sale * closeRate;
  const barWidth = closeRate === 0 ? 0 : Math.min(100, Math.max(4, closeRate * 100));

  const setField = (field: FieldName, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="lf-money-meter" aria-labelledby="lf-money-meter-title">
      <div className="lf-money-meter__inner">
        <header className="lf-money-meter__head">
          <p className="lf-money-meter__eyebrow">Owner math</p>
          <h2 id="lf-money-meter-title">The missed-message math is rude. Better to see it.</h2>
          <p>
            Use your own numbers. We will show one possible value of inquiries
            that never got a real answer. No industry average. No magic trick.
          </p>
        </header>

        <div className="lf-money-meter__panel">
          <form className="lf-money-meter__inputs" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span>Missed inquiries each week</span>
              <input
                type="number"
                inputMode="numeric"
                min={LIMITS.missed.min}
                max={LIMITS.missed.max}
                step={LIMITS.missed.step}
                value={values.missed}
                onChange={(event) => setField("missed", event.target.value)}
              />
            </label>
            <label>
              <span>Average sale or job value</span>
              <span className="lf-money-meter__money-input">
                <span aria-hidden="true">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={LIMITS.sale.min}
                  max={LIMITS.sale.max}
                  step={LIMITS.sale.step}
                  value={values.sale}
                  onChange={(event) => setField("sale", event.target.value)}
                />
              </span>
            </label>
            <label>
              <span>Normal close rate</span>
              <span className="lf-money-meter__percent-input">
                <input
                  type="number"
                  inputMode="numeric"
                  min={LIMITS.closeRate.min}
                  max={LIMITS.closeRate.max}
                  step={LIMITS.closeRate.step}
                  value={values.closeRate}
                  onChange={(event) => setField("closeRate", event.target.value)}
                />
                <span aria-hidden="true">%</span>
              </span>
            </label>
          </form>

          <div className="lf-money-meter__answer" aria-live="polite">
            <p className="lf-money-meter__answer-label">Estimated customer value at risk over four weeks</p>
            <output className="lf-money-meter__value">{money(estimate)}</output>
            <p>
              That is about {money(perWeek)} each week if those missed inquiries
              would normally close at your stated rate.
            </p>
            <div className="lf-money-meter__track" aria-hidden="true">
              <span style={{ width: `${barWidth}%` }} />
            </div>
          </div>
        </div>

        <details className="lf-money-meter__method">
          <summary>Show the math and the limit</summary>
          <p>
            <strong>{missed}</strong> missed inquiries per week × <strong>{money(sale)}</strong>
            {" "}average sale × <strong>{Math.round(closeRate * 100)}%</strong> close rate × <strong>4 weeks</strong> = <strong>{money(estimate)}</strong>.
          </p>
          <p>
            This is an estimate from your inputs, not a prediction, profit
            figure, or promise. It does not use an outside benchmark. Change
            any field until it matches your business.
          </p>
        </details>
      </div>
    </section>
  );
}
