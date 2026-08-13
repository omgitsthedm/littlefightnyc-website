import { useState, type ReactNode } from "react";
import {
  AccessibleDataTable,
  CurrencySelect,
  EvidenceSource,
  MethodologyDisclosure,
  OwnerMath,
  OwnerResult,
  ScenarioBadge,
} from "./EvidenceFoundation";
import { DEFAULT_CURRENCY, type CurrencyChoice } from "./currency";
import {
  breakEvenCustomers,
  checkoutExposure,
  copyPasteTax,
  currencySymbol,
  downtimeCost,
  formatCurrency,
  missedInquiryValue,
  parseOwnerNumber,
  subscriptionTotal,
} from "./ownerMath";
import "./OwnerCalculators.css";

type FieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
};

function OwnerField({
  name,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
}: FieldProps) {
  return (
    <label className="lf-owner-field">
      <span>{label}</span>
      <span data-prefix={prefix ? "true" : undefined} data-suffix={suffix ? "true" : undefined}>
        {prefix && <i aria-hidden="true">{prefix}</i>}
        <input
          name={name}
          type="number"
          inputMode="decimal"
          autoComplete="off"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && <i aria-hidden="true">{suffix}</i>}
      </span>
    </label>
  );
}

function ScenarioPanel({ children }: { children: ReactNode }) {
  return <div className="lf-owner-scenario">{children}</div>;
}

function money(value: number, choice: CurrencyChoice) {
  return formatCurrency(value, choice.locale, choice.code);
}

function useCurrency() {
  return useState<CurrencyChoice>(DEFAULT_CURRENCY);
}

/** Annual value of repeated manual work, using only owner-entered people, time, and cost. */
export function CopyPasteTax() {
  const [people, setPeople] = useState("2");
  const [hours, setHours] = useState("3");
  const [hourly, setHourly] = useState("35");
  const [currency, setCurrency] = useCurrency();
  const [edited, setEdited] = useState(false);
  const change = (setter: (value: string) => void) => (value: string) => {
    setEdited(true);
    setter(value);
  };
  const result = copyPasteTax({
    people: parseOwnerNumber(people),
    hoursPerWeek: parseOwnerNumber(hours),
    hourlyCost: parseOwnerNumber(hourly),
  });
  const annualHours = parseOwnerNumber(people) * parseOwnerNumber(hours) * 52;
  const reset = () => {
    setPeople("2");
    setHours("3");
    setHourly("35");
    setCurrency(DEFAULT_CURRENCY);
    setEdited(false);
  };

  return (
    <OwnerMath
      title="The copy-and-paste tax has a receipt."
      intro="Count the people and weekly hours spent moving the same information by hand. Use a loaded internal hourly cost you can explain."
    >
      <ScenarioBadge kind={edited ? "your-numbers" : "example"} />
      <CurrencySelect value={currency} name="copy-paste-currency" onChange={(next) => { setCurrency(next); setEdited(true); }} />
      <ScenarioPanel>
        <fieldset className="lf-owner-fieldset">
          <legend>Annual staff-cost inputs</legend>
          <div className="lf-owner-fields">
            <OwnerField name="copy-paste-people" label="People doing the task" value={people} onChange={change(setPeople)} />
            <OwnerField name="copy-paste-hours" label="Hours each week, per person" value={hours} onChange={change(setHours)} suffix="hrs" step={0.25} />
            <OwnerField name="copy-paste-hourly" label="Loaded internal hourly cost" value={hourly} onChange={change(setHourly)} prefix={currencySymbol(currency.locale, currency.code)} step={1} />
          </div>
        </fieldset>
        <button className="lf-owner-add" type="button" onClick={reset}>Reset Example</button>
        <OwnerResult label="Estimated annual staff cost">{money(result, currency)}</OwnerResult>
        <p>{annualHours.toLocaleString(currency.locale)} staff hours each year in this scenario. This is not a wage benchmark, invoice, or guaranteed saving.</p>
      </ScenarioPanel>
      <MethodologyDisclosure>
        <p>{people} people × {hours} hours each week × {money(parseOwnerNumber(hourly), currency)} loaded hourly cost × 52 weeks = {money(result, currency)}.</p>
      </MethodologyDisclosure>
      <EvidenceSource
        href="https://www.bls.gov/news.release/ecec.nr0.htm"
        source="U.S. Bureau of Labor Statistics: Employer Costs for Employee Compensation"
        checked="August 2026"
        scope="Optional U.S. compensation context. Open the current release, choose a defensible figure, then type it above."
        limits="The example does not prefill a BLS value. U.S. compensation data is not a worldwide wage default or a savings promise."
      />
    </OwnerMath>
  );
}

/** Gross revenue exposure while a named customer path is unavailable. */
export function DowntimeClock() {
  const [hours, setHours] = useState("2");
  const [sales, setSales] = useState("300");
  const [share, setShare] = useState("75");
  const [currency, setCurrency] = useCurrency();
  const [edited, setEdited] = useState(false);
  const result = downtimeCost({
    hoursDown: parseOwnerNumber(hours),
    salesPerOpenHour: parseOwnerNumber(sales),
    affectedSharePercent: parseOwnerNumber(share, 0, 100),
  });
  const reset = () => {
    setHours("2");
    setSales("300");
    setShare("75");
    setCurrency(DEFAULT_CURRENCY);
    setEdited(false);
  };

  return (
    <OwnerMath title="When the screen goes dark, make the tradeoff visible." intro="Use revenue you normally collect in an open hour and the share of sales the broken path actually affects.">
      <ScenarioBadge kind={edited ? "your-numbers" : "example"} />
      <CurrencySelect value={currency} name="downtime-currency" onChange={(next) => { setCurrency(next); setEdited(true); }} />
      <ScenarioPanel>
        <fieldset className="lf-owner-fieldset">
          <legend>Downtime scenario inputs</legend>
          <div className="lf-owner-fields">
            <OwnerField name="downtime-hours" label="Hours this path is down" value={hours} onChange={(value) => { setEdited(true); setHours(value); }} suffix="hrs" step={0.25} />
            <OwnerField name="downtime-sales" label="Revenue in a normal open hour" value={sales} onChange={(value) => { setEdited(true); setSales(value); }} prefix={currencySymbol(currency.locale, currency.code)} />
            <OwnerField name="downtime-share" label="Share of revenue affected" value={share} onChange={(value) => { setEdited(true); setShare(value); }} suffix="%" max={100} />
          </div>
        </fieldset>
        <button className="lf-owner-add" type="button" onClick={reset}>Reset Example</button>
        <OwnerResult label="Possible gross revenue exposure">{money(result, currency)}</OwnerResult>
        <p>This does not measure profit, prove a loss, predict recovery, or identify the cause of the outage.</p>
      </ScenarioPanel>
      <MethodologyDisclosure>
        <p>{hours} hours × {money(parseOwnerNumber(sales), currency)} normal revenue per open hour × {Math.round(parseOwnerNumber(share, 0, 100))}% affected = {money(result, currency)} possible gross revenue exposure.</p>
      </MethodologyDisclosure>
    </OwnerMath>
  );
}

type SubscriptionItem = {
  name: string;
  monthlyCost: string;
  seats: string;
  overlapReview: boolean;
};

/** Local-only inventory of recurring tool cost. No vendor pricing or account data is fetched. */
export function SubscriptionStack() {
  const defaults: SubscriptionItem[] = [
    { name: "Tool one", monthlyCost: "39", seats: "3", overlapReview: false },
    { name: "Tool two", monthlyCost: "24", seats: "2", overlapReview: true },
  ];
  const [items, setItems] = useState<SubscriptionItem[]>(defaults);
  const [currency, setCurrency] = useCurrency();
  const [edited, setEdited] = useState(false);
  const [connectionRun, setConnectionRun] = useState(0);
  const monthly = subscriptionTotal(items.map((item) => ({
    monthlyCost: parseOwnerNumber(item.monthlyCost),
    seats: parseOwnerNumber(item.seats),
  })));
  const annual = monthly * 12;
  const overlapCount = items.filter((item) => item.overlapReview).length;
  const update = <K extends keyof SubscriptionItem>(index: number, key: K, value: SubscriptionItem[K]) => {
    setEdited(true);
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  };
  const reset = () => {
    setItems(defaults);
    setCurrency(DEFAULT_CURRENCY);
    setEdited(false);
    setConnectionRun((current) => current + 1);
  };

  return (
    <OwnerMath title="Your software bill should not need a detective." intro="List recurring tools and seats. Mark overlap for review—never as automatic waste. Everything stays in this browser unless you copy it out.">
      <ScenarioBadge kind={edited ? "your-numbers" : "example"} />
      <CurrencySelect value={currency} name="subscriptions-currency" onChange={(next) => { setCurrency(next); setEdited(true); }} />
      <ScenarioPanel>
        <fieldset className="lf-owner-fieldset">
          <legend>Recurring tool inventory</legend>
          <div className="lf-subscription-list">
            {items.map((item, index) => (
              <div className="lf-subscription-row" key={index}>
                <label>
                  <span>Tool</span>
                  <input name={`subscription-name-${index}`} autoComplete="off" value={item.name} onChange={(event) => update(index, "name", event.target.value)} />
                </label>
                <OwnerField name={`subscription-cost-${index}`} label="Monthly cost per seat" value={item.monthlyCost} onChange={(value) => update(index, "monthlyCost", value)} prefix={currencySymbol(currency.locale, currency.code)} />
                <OwnerField name={`subscription-seats-${index}`} label="Paid seats" value={item.seats} onChange={(value) => update(index, "seats", value)} />
                <label className="lf-overlap-check"><input name={`subscription-overlap-${index}`} type="checkbox" checked={item.overlapReview} onChange={(event) => update(index, "overlapReview", event.target.checked)} /><span>Review for overlap</span></label>
              </div>
            ))}
          </div>
        </fieldset>
        <div className="lf-owner-actions">
          <button className="lf-owner-add" type="button" onClick={() => { setEdited(true); setItems((current) => [...current, { name: `Tool ${current.length + 1}`, monthlyCost: "0", seats: "1", overlapReview: false }]); }}>Add a Tool</button>
          <button className="lf-owner-add" type="button" onClick={reset}>Reset Example</button>
        </div>
        <OwnerResult label="Known annual subscription total">{money(annual, currency)}</OwnerResult>
        <p>{money(monthly, currency)} each month. {overlapCount} tool{overlapCount === 1 ? "" : "s"} marked for a human overlap review—not automatic cancellation.</p>
        <div key={connectionRun} className="lf-subscription-path" aria-label="Illustration: review many tools, then keep, connect, replace, or build only where the evidence supports it.">
          <span>Many tools</span><i aria-hidden="true" /><span>One reviewed path</span>
        </div>
        <button className="lf-owner-add" type="button" onClick={() => setConnectionRun((current) => current + 1)}>Replay Connection</button>
      </ScenarioPanel>
      <AccessibleDataTable caption="Your subscription inventory" rows={items.map((item) => ({ label: item.name || "Unnamed tool", value: money(parseOwnerNumber(item.monthlyCost) * parseOwnerNumber(item.seats), currency), note: `${item.seats || 0} paid seat(s)${item.overlapReview ? "; review overlap" : ""}` }))} />
      <MethodologyDisclosure><p>Monthly total = each monthly seat price × paid seats. Annual total = {money(monthly, currency)} × 12 = {money(annual, currency)}. Usage charges, contracts, taxes, and staff time are excluded.</p></MethodologyDisclosure>
    </OwnerMath>
  );
}

/** A break-even count using owner-entered contribution, not gross sale value. */
export function BreakEvenCustomerCount() {
  const [cost, setCost] = useState("3000");
  const [contribution, setContribution] = useState("500");
  const [currency, setCurrency] = useCurrency();
  const [edited, setEdited] = useState(false);
  const customers = breakEvenCustomers({
    projectCost: parseOwnerNumber(cost),
    contributionPerCustomer: parseOwnerNumber(contribution),
  });
  const reset = () => {
    setCost("3000");
    setContribution("500");
    setCurrency(DEFAULT_CURRENCY);
    setEdited(false);
  };

  return (
    <OwnerMath title="How many real customers would cover this?" intro="Use what one confirmed customer contributes after the direct cost of delivering that sale—not gross revenue or a hopeful lifetime-value guess.">
      <ScenarioBadge kind={edited ? "your-numbers" : "example"} />
      <CurrencySelect value={currency} name="break-even-currency" onChange={(next) => { setCurrency(next); setEdited(true); }} />
      <ScenarioPanel>
        <fieldset className="lf-owner-fieldset">
          <legend>Break-even scenario inputs</legend>
          <div className="lf-owner-fields lf-owner-fields--two">
            <OwnerField name="break-even-cost" label="Potential project cost" value={cost} onChange={(value) => { setEdited(true); setCost(value); }} prefix={currencySymbol(currency.locale, currency.code)} />
            <OwnerField name="break-even-contribution" label="Contribution from one confirmed customer" value={contribution} onChange={(value) => { setEdited(true); setContribution(value); }} prefix={currencySymbol(currency.locale, currency.code)} />
          </div>
        </fieldset>
        <button className="lf-owner-add" type="button" onClick={reset}>Reset Example</button>
        <OwnerResult label="Break-even customer count">{customers === null ? "Add a contribution" : `${customers} customer${customers === 1 ? "" : "s"}`}</OwnerResult>
        <p>Rounded up. This is a planning scenario, not a sales forecast, quote, or reason to spend before the work makes sense.</p>
      </ScenarioPanel>
      <MethodologyDisclosure><p>{money(parseOwnerNumber(cost), currency)} project cost ÷ {money(parseOwnerNumber(contribution), currency)} contribution per confirmed customer = {customers ?? "no result"}. We round up because partial customers are rude fiction.</p></MethodologyDisclosure>
    </OwnerMath>
  );
}

/** Missed-call scenario explicitly scoped to reviewed call-button taps. */
export function MissedCallMeter() {
  const [taps, setTaps] = useState("5");
  const [value, setValue] = useState("250");
  const [rate, setRate] = useState("30");
  const [currency, setCurrency] = useCurrency();
  const [edited, setEdited] = useState(false);
  const result = missedInquiryValue({
    missedPerWeek: parseOwnerNumber(taps),
    averageSale: parseOwnerNumber(value),
    closeRatePercent: parseOwnerNumber(rate, 0, 100),
  });
  const reset = () => {
    setTaps("5");
    setValue("250");
    setRate("30");
    setCurrency(DEFAULT_CURRENCY);
    setEdited(false);
  };

  return (
    <OwnerMath title="A tap on Call is not a customer. It is still worth noticing." intro="Use this only after reviewing which call-button taps went unanswered. Google does not know whether the call connected or became a sale.">
      <ScenarioBadge kind={edited ? "your-numbers" : "example"} />
      <CurrencySelect value={currency} name="missed-call-currency" onChange={(next) => { setCurrency(next); setEdited(true); }} />
      <ScenarioPanel>
        <fieldset className="lf-owner-fieldset">
          <legend>Missed call-button scenario inputs</legend>
          <div className="lf-owner-fields">
            <OwnerField name="missed-call-taps" label="Reviewed missed taps each week" value={taps} onChange={(next) => { setEdited(true); setTaps(next); }} />
            <OwnerField name="missed-call-sale" label="Average collected sale" value={value} onChange={(next) => { setEdited(true); setValue(next); }} prefix={currencySymbol(currency.locale, currency.code)} />
            <OwnerField name="missed-call-rate" label="Normal close rate" value={rate} onChange={(next) => { setEdited(true); setRate(next); }} suffix="%" max={100} />
          </div>
        </fieldset>
        <button className="lf-owner-add" type="button" onClick={reset}>Reset Example</button>
        <OwnerResult label="Four-week gross revenue-at-risk scenario">{money(result, currency)}</OwnerResult>
        <p>A call metric means someone tapped a button; it does not prove an answered call, completed call, sale, or customer.</p>
      </ScenarioPanel>
      <MethodologyDisclosure><p>{taps} reviewed missed taps each week × {money(parseOwnerNumber(value), currency)} average collected sale × {Math.round(parseOwnerNumber(rate, 0, 100))}% close rate × 4 weeks = {money(result, currency)}.</p></MethodologyDisclosure>
      <EvidenceSource href="https://support.google.com/business/answer/9918094?hl=en" source="Google Business Profile: Performance" checked="August 2026" scope="Google defines Calls as taps on the call button." limits="Use a reviewed missed-tap count. Do not treat the metric itself as completed calls or revenue." />
    </OwnerMath>
  );
}

const RECOVERY_ASSETS = ["Domain", "Business email", "Website host", "Payments", "POS", "Booking", "Backups", "Recovery contact"];

/** A documentation exercise, not a security assessment. */
export function RecoveryReadiness() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [edited, setEdited] = useState(false);
  const count = RECOVERY_ASSETS.filter((asset) => done[asset]).length;
  return (
    <OwnerMath title="Could the business open tomorrow?" intro="Check an item only when its owner, recovery method, and last test are written down.">
      <ScenarioBadge kind={edited ? "your-numbers" : "example"} />
      <ScenarioPanel>
        <OwnerResult label="Documented and tested critical assets">{count} of 8</OwnerResult>
        <fieldset className="lf-recovery-list"><legend>Critical asset record</legend>{RECOVERY_ASSETS.map((asset) => <label key={asset}><input name={`recovery-${asset.toLowerCase().replaceAll(" ", "-")}`} type="checkbox" checked={Boolean(done[asset])} onChange={() => { setEdited(true); setDone((current) => ({ ...current, [asset]: !current[asset] })); }} /> <span>{asset}</span></label>)}</fieldset>
        <button className="lf-owner-add" type="button" onClick={() => { setDone({}); setEdited(false); }}>Clear Checklist</button>
        <p>This is a readiness reminder, not a security certification, penetration test, compliance attestation, or breach-risk prediction.</p>
      </ScenarioPanel>
      <EvidenceSource href="https://www.nist.gov/itl/smallbusinesscyber/nist-cybersecurity-framework-0" source="NIST Cybersecurity Framework 2.0: Small Business" checked="August 2026" scope="Voluntary risk-management guidance for small and midsize businesses." limits="This checklist does not establish compliance or security effectiveness." />
    </OwnerMath>
  );
}

type SpeedMetric = { name: "LCP" | "INP" | "CLS"; value?: string; period?: string };

/** A data-prop-driven shell. It renders no score until a measured value is supplied. */
export function SpeedTruthCard({ metrics = [] }: { metrics?: SpeedMetric[] }) {
  return (
    <OwnerMath eyebrow="Performance truth" title="Speed needs a label, a date, and a limit." intro="Connect a measured result later. This card does not run a test or invent a score.">
      <ScenarioBadge kind={metrics.length ? "measured" : "not-measured"} />
      <ScenarioPanel>
        {metrics.length ? <AccessibleDataTable caption="Supplied performance measurements" rows={metrics.map((metric) => ({ label: metric.name, value: metric.value ?? "Not supplied", note: metric.period ?? "Date range not supplied" }))} /> : <p className="lf-no-data">No measurement connected. Bring a PageSpeed Insights or CrUX result with its exact URL, device, method, and date range.</p>}
        <p>CrUX field data and Lighthouse lab data answer different questions. Neither promises a sale or a Google ranking.</p>
      </ScenarioPanel>
      <EvidenceSource href="https://developer.chrome.com/docs/crux/api" source="Chrome UX Report API" checked="August 2026" scope="Aggregated real-user Chrome data, when a URL is eligible." limits="CrUX is a 28-day aggregate, not all browsers; a Lighthouse lab result is a controlled snapshot." />
    </OwnerMath>
  );
}

/** Owner-entered aggregate checkout scenario. It never treats unfinished checkouts as recoverable sales. */
export function CheckoutLeak() {
  const [starts, setStarts] = useState("100");
  const [orders, setOrders] = useState("72");
  const [average, setAverage] = useState("75");
  const [currency, setCurrency] = useCurrency();
  const [edited, setEdited] = useState(false);
  const result = checkoutExposure({ checkoutStarts: parseOwnerNumber(starts), completedOrders: parseOwnerNumber(orders), averageOrderValue: parseOwnerNumber(average) });
  const reset = () => {
    setStarts("100");
    setOrders("72");
    setAverage("75");
    setCurrency(DEFAULT_CURRENCY);
    setEdited(false);
  };

  return (
    <OwnerMath title="Checkout is a path, not a guilt trip." intro="Use aggregate store data for one matching date range. This shows where to inspect—not what you can magically recover.">
      <ScenarioBadge kind={edited ? "your-numbers" : "example"} />
      <CurrencySelect value={currency} name="checkout-currency" onChange={(next) => { setCurrency(next); setEdited(true); }} />
      <ScenarioPanel>
        <fieldset className="lf-owner-fieldset">
          <legend>Aggregate checkout inputs</legend>
          <div className="lf-owner-fields">
            <OwnerField name="checkout-starts" label="Checkout starts" value={starts} onChange={(next) => { setEdited(true); setStarts(next); }} />
            <OwnerField name="checkout-orders" label="Completed orders" value={orders} onChange={(next) => { setEdited(true); setOrders(next); }} />
            <OwnerField name="checkout-average" label="Average completed order" value={average} onChange={(next) => { setEdited(true); setAverage(next); }} prefix={currencySymbol(currency.locale, currency.code)} />
          </div>
        </fieldset>
        <button className="lf-owner-add" type="button" onClick={reset}>Reset Example</button>
        <OwnerResult label="Gross value attached to unfinished checkouts">{money(result.incompleteOrderValue, currency)}</OwnerResult>
        <p>{result.incomplete.toLocaleString(currency.locale)} unfinished checkouts; {result.completionRatePercent.toLocaleString(currency.locale, { maximumFractionDigits: 1 })}% completed. This is not lost profit, recoverable revenue, or proof that checkout caused the exit.</p>
      </ScenarioPanel>
      <AccessibleDataTable caption="Aggregate checkout path" rows={[
        { label: "Checkout starts", value: result.starts.toLocaleString(currency.locale), note: "Owner-entered aggregate" },
        { label: "Completed orders", value: result.completed.toLocaleString(currency.locale), note: "Same date range" },
        { label: "Unfinished checkouts", value: result.incomplete.toLocaleString(currency.locale), note: "Needs investigation" },
        { label: "Completion rate", value: `${result.completionRatePercent.toLocaleString(currency.locale, { maximumFractionDigits: 1 })}%`, note: "Not a benchmark" },
      ]} />
      <MethodologyDisclosure><p>Unfinished checkouts = starts − completed orders. Gross value attached = unfinished checkouts × your average completed order. The calculation does not claim those people would have bought.</p></MethodologyDisclosure>
      <EvidenceSource href="https://baymard.com/blog/ecommerce-checkout-usability-report-and-benchmark" source="Baymard Institute: Checkout usability research" checked="August 2026" scope="Broad ecommerce checkout context, shown separately from your entries." limits="No Baymard average is applied to this result. The source population is not your store and does not prove recoverable revenue." />
    </OwnerMath>
  );
}

export function MeasurementPath({ connected = [] }: { connected?: Array<"search-console" | "business-profile" | "site-actions" | "crux"> }) {
  const steps = [
    ["search-console", "Search Console", "Impressions → clicks", "https://support.google.com/webmasters/answer/7576553?hl=en"],
    ["business-profile", "Business Profile", "Search/Maps actions", "https://support.google.com/business/answer/9918094?hl=en"],
    ["site-actions", "Site actions", "Form success / booking click", "https://support.google.com/analytics/answer/9267568?hl=en"],
    ["crux", "CrUX", "Real Chrome-user experience", "https://developer.chrome.com/docs/crux/api"],
  ] as const;
  return <section className="lf-proof-board" aria-labelledby="lf-proof-board-title" data-lf-visual-proof="measurement-path"><header><p>Measurement path</p><h2 id="lf-proof-board-title">Proof comes from the path, not a magic dashboard.</h2><p>Nothing is connected here yet. Each source remains distinct so an owner can see what it actually measures.</p></header><ol>{steps.map(([key, name, purpose, href]) => <li key={key} data-connected={connected.includes(key) ? "true" : "false"}><span>{connected.includes(key) ? "Connected" : "Not connected"}</span><h3>{name}</h3><p>{purpose}</p><a href={href} target="_blank" rel="noreferrer">Read the Official Definition</a></li>)}</ol><p className="lf-proof-board__limit">Definitions checked August 2026. No source alone proves revenue, causation, a ranking, or a promise. Reconcile measured actions with the business’s own records.</p></section>;
}
