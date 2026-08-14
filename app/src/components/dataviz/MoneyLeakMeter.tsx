import { useState } from "react";
import "./MoneyLeakMeter.css";
import { CurrencySelect, MethodologyDisclosure, OwnerMath, ScenarioBadge } from "./EvidenceFoundation";
import { DEFAULT_CURRENCY, type CurrencyChoice } from "./currency";
import { currencySymbol, formatCurrency, missedInquiryValue, parseOwnerNumber } from "./ownerMath";

type FieldName = "missed" | "sale" | "closeRate";

const DEFAULTS: Record<FieldName, string> = {
  missed: "4",
  sale: "250",
  closeRate: "50",
};

const LIMITS: Record<FieldName, { min: number; max: number; step: number }> = {
  missed: { min: 0, max: 999, step: 1 },
  sale: { min: 0, max: 1_000_000, step: 25 },
  closeRate: { min: 0, max: 100, step: 1 },
};

function numeric(value: string, field: FieldName) {
  const { min, max } = LIMITS[field];
  return parseOwnerNumber(value, min, max);
}

export default function MoneyLeakMeter() {
  const [values, setValues] = useState(DEFAULTS);
  const [currency, setCurrency] = useState<CurrencyChoice>(DEFAULT_CURRENCY);
  const [edited, setEdited] = useState(false);
  const missed = numeric(values.missed, "missed");
  const sale = numeric(values.sale, "sale");
  const closeRate = numeric(values.closeRate, "closeRate") / 100;
  const estimate = missedInquiryValue({ missedPerWeek: missed, averageSale: sale, closeRatePercent: closeRate * 100 });
  const perWeek = missedInquiryValue({ missedPerWeek: missed, averageSale: sale, closeRatePercent: closeRate * 100, weeks: 1 });
  const annual = missedInquiryValue({ missedPerWeek: missed, averageSale: sale, closeRatePercent: closeRate * 100, weeks: 52 });

  const setField = (field: FieldName, value: string) => {
    setEdited(true);
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="lf-money-meter" aria-labelledby="lf-money-meter-title" data-lf-visual-proof="owner-calculator">
      <div className="lf-money-meter__inner">
        <div className="lf-money-meter__intro">
          <OwnerMath
            eyebrow="LF / 05 · Owner math"
            visualProof={false}
            titleId="lf-money-meter-title"
            title="Where does the customer path leak?"
            intro={
              <>
                Use your own numbers. Change any input. This is a scenario,
                not a promise.
              </>
            }
          >
            <ScenarioBadge kind={edited ? "your-numbers" : "example"} />
          </OwnerMath>

          <CurrencySelect
            value={currency}
            name="money-leak-currency"
            onChange={(next) => { setCurrency(next); setEdited(true); }}
          />
        </div>

        <div className="lf-money-meter__panel">
          <div className="lf-money-meter__controls">
            <fieldset className="lf-money-meter__inputs">
              <legend className="lf-money-meter__legend">Change your scenario</legend>
              <label>
                <span>Missed inquiries each week</span>
                <input
                  type="number"
                  name="money-leak-missed-inquiries"
                  inputMode="numeric"
                  autoComplete="off"
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
                  <span aria-hidden="true">{currencySymbol(currency.locale, currency.code)}</span>
                  <input
                    type="number"
                    name="money-leak-average-sale"
                    inputMode="decimal"
                    autoComplete="off"
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
                    name="money-leak-close-rate"
                    inputMode="numeric"
                    autoComplete="off"
                    min={LIMITS.closeRate.min}
                    max={LIMITS.closeRate.max}
                    step={LIMITS.closeRate.step}
                    value={values.closeRate}
                    onChange={(event) => setField("closeRate", event.target.value)}
                  />
                  <span aria-hidden="true">%</span>
                </span>
              </label>
            </fieldset>

            <ol className="lf-money-meter__path" aria-label="Illustrative customer path">
              <li>Seen</li>
              <li>Understood</li>
              <li>Contacted</li>
              <li>Confirmed</li>
            </ol>

            <button className="lf-owner-add lf-money-meter__reset" type="button" onClick={() => { setValues(DEFAULTS); setCurrency(DEFAULT_CURRENCY); setEdited(false); }}>Reset example</button>
          </div>

          <div className="lf-money-meter__answer">
            <p className="lf-money-meter__answer-label">Estimated gross revenue at risk</p>
            <table className="lf-money-meter__results">
              <caption>Your scenario result</caption>
              <tbody>
                <tr><th scope="row">Weekly</th><td>{formatCurrency(perWeek, currency.locale, currency.code)}</td></tr>
                <tr className="lf-money-meter__results-focus"><th scope="row">Four weeks</th><td><output aria-label="Estimated gross revenue at risk over four weeks" aria-live="polite" aria-atomic="true">{formatCurrency(estimate, currency.locale, currency.code)}</output></td></tr>
                <tr><th scope="row">Annual</th><td>{formatCurrency(annual, currency.locale, currency.code)}</td></tr>
              </tbody>
            </table>
            <p>Your estimate. Not profit, recovered revenue, a forecast, or a market average.</p>
          </div>
        </div>

        <MethodologyDisclosure title="Show the math and the limit">
          <p>
            <strong>{missed}</strong> missed inquiries per week × <strong>{formatCurrency(sale, currency.locale, currency.code)}</strong>
            {" "}average sale × <strong>{Math.round(closeRate * 100)}%</strong> close rate × <strong>4 weeks</strong> = <strong>{formatCurrency(estimate, currency.locale, currency.code)}</strong>.
          </p>
          <p>
            This is an estimate from your inputs, not a prediction, profit
            figure, or promise. It does not use an outside benchmark. Change
            any field until it matches your business.
          </p>
        </MethodologyDisclosure>
      </div>
    </section>
  );
}
