document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-cost-calculator]");
  if (!form) return;

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const readNumber = (name) => {
    const field = form.querySelector(`[name="${name}"]`);
    const value = Number.parseFloat(field?.value || "0");
    return Number.isFinite(value) ? value : 0;
  };

  const write = (id, value) => {
    const target = document.getElementById(id);
    if (target) target.textContent = currency.format(Math.max(0, value));
  };

  const calculate = () => {
    const monthlyCost = readNumber("monthly_cost");
    const seats = Math.max(1, readNumber("seats"));
    const tools = Math.max(1, readNumber("tools"));
    const lostHours = readNumber("lost_hours");
    const hourlyValue = readNumber("hourly_value");
    const missedLeads = readNumber("missed_leads");
    const leadValue = readNumber("lead_value");
    const lifespan = Math.max(1, readNumber("lifespan"));

    const annualSoftware = monthlyCost * seats * tools * 12;
    const annualLabor = lostHours * hourlyValue * 52;
    const annualMissedLead = missedLeads * leadValue * 12;
    const threeYear = (annualSoftware + annualLabor + annualMissedLead) * Math.min(3, lifespan);
    const lowBuild = Math.max(3500, threeYear * 0.18);
    const highBuild = Math.max(lowBuild + 2500, threeYear * 0.42);
    const breakEvenMonths = highBuild > 0
      ? highBuild / Math.max(1, (annualSoftware + annualLabor + annualMissedLead) / 12)
      : 0;

    write("annual-software", annualSoftware);
    write("hidden-labor", annualLabor + annualMissedLead);
    write("three-year-cost", threeYear);
    write("possible-build", lowBuild);

    const range = document.getElementById("possible-build-range");
    if (range) range.textContent = `${currency.format(lowBuild)} - ${currency.format(highBuild)}`;

    const breakEven = document.getElementById("break-even");
    if (breakEven) breakEven.textContent = `${Math.max(1, Math.round(breakEvenMonths))} months`;
  };

  form.addEventListener("input", calculate);
  calculate();
});
