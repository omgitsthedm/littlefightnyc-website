import { useState } from "react";
import "./MoneyLeakMeter.css";
import { AccessibleDataTable, CurrencySelect, MethodologyDisclosure, OwnerMath, ScenarioBadge } from "./EvidenceFoundation";
import { DEFAULT_CURRENCY, type CurrencyChoice } from "./currency";
import { currencySymbol, formatCurrency, missedInquiryValue, parseOwnerNumber } from "./ownerMath";

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
  const barWidth = closeRate === 0 ? 0 : Math.min(100, Math.max(4, closeRate * 100));

  const setField = (field: FieldName, value: string) => {
    setEdited(true);
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="lf-money-meter" aria-labelledby="lf-money-meter-title" data-lf-visual-proof="owner-calculator">
      <div className="lf-money-meter__inner">
        <OwnerMath visualProof={false} titleId="lf-money-meter-title" title="The missed-message math is rude. Better to see it." intro={
          <>
            Use your own numbers. We will show one possible value of inquiries
            that never got a real answer. No industry average. No magic trick.
          </>
        }>
          <ScenarioBadge kind={edited ? "your-numbers" : "example"} />
        </OwnerMath>

        <CurrencySelect
          value={currency}
          name="money-leak-currency"
          onChange={(next) => { setCurrency(next); setEdited(true); }}
        />

        <div className="lf-money-meter__panel">
          <form className="lf-money-meter__inputs" onSubmit={(event) => event.preventDefault()}>
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
          </form>
          <button className="lf-owner-add lf-money-meter__reset" type="button" onClick={() => { setValues(DEFAULTS); setCurrency(DEFAULT_CURRENCY); setEdited(false); }}>Reset Example</button>

          <div className="lf-money-meter__answer">
            <p className="lf-money-meter__answer-label">Estimated gross revenue at risk over 4 weeks</p>
            <output className="lf-money-meter__value" aria-label="Estimated gross revenue at risk over four weeks" aria-live="polite" aria-atomic="true">{formatCurrency(estimate, currency.locale, currency.code)}</output>
            <p>
              That is about {formatCurrency(perWeek, currency.locale, currency.code)} each week if those missed inquiries
              would normally close at your stated rate.
            </p>
            <div className="lf-money-meter__track" aria-hidden="true">
              <span style={{ width: `${barWidth}%` }} />
            </div>
          </div>
        </div>

        <AccessibleDataTable caption="Your scenario table" rows={[
          { label: "Missed inquiries", value: missed, note: "Per week" },
          { label: "Average sale or job", value: formatCurrency(sale, currency.locale, currency.code), note: "Owner-entered" },
          { label: "Normal close rate", value: `${Math.round(closeRate * 100)}%`, note: "Owner-entered" },
          { label: "Estimated revenue at risk", value: formatCurrency(perWeek, currency.locale, currency.code), note: "Weekly scenario; not profit" },
          { label: "Estimated revenue at risk", value: formatCurrency(estimate, currency.locale, currency.code), note: "Four-week scenario; not profit" },
          { label: "Estimated revenue at risk", value: formatCurrency(annual, currency.locale, currency.code), note: "Annual scenario; not a forecast" },
        ]} />
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
