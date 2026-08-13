/**
 * Small, inspectable calculations for owner-entered scenarios.
 *
 * None of these functions use a benchmark, analytics, or external data. The
 * UI is responsible for naming the inputs and showing the methodology before
 * anyone treats a result as a decision.
 */

export function clampNumber(value: number, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(min, value));
}

export function parseOwnerNumber(value: string, min = 0, max = Number.MAX_SAFE_INTEGER) {
  return clampNumber(Number(value), min, max);
}

export function formatCurrency(value: number, locale = "en-US", currency = "USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function currencySymbol(locale = "en-US", currency = "USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0).find((part) => part.type === "currency")?.value ?? currency;
}

export function missedInquiryValue({
  missedPerWeek,
  averageSale,
  closeRatePercent,
  weeks = 4,
}: {
  missedPerWeek: number;
  averageSale: number;
  closeRatePercent: number;
  weeks?: number;
}) {
  return clampNumber(missedPerWeek) * clampNumber(averageSale) * (clampNumber(closeRatePercent, 0, 100) / 100) * clampNumber(weeks);
}

export function copyPasteTax({
  people,
  hoursPerWeek,
  hourlyCost,
  weeks = 52,
}: {
  people: number;
  hoursPerWeek: number;
  hourlyCost: number;
  weeks?: number;
}) {
  return clampNumber(people) * clampNumber(hoursPerWeek) * clampNumber(hourlyCost) * clampNumber(weeks);
}

export function downtimeCost({
  hoursDown,
  salesPerOpenHour,
  affectedSharePercent = 100,
}: {
  hoursDown: number;
  salesPerOpenHour: number;
  affectedSharePercent?: number;
}) {
  return clampNumber(hoursDown) * clampNumber(salesPerOpenHour) * (clampNumber(affectedSharePercent, 0, 100) / 100);
}

export function subscriptionTotal(items: Array<{ monthlyCost: number; seats: number }>) {
  return items.reduce((sum, item) => sum + clampNumber(item.monthlyCost) * clampNumber(item.seats), 0);
}

export function breakEvenCustomers({
  projectCost,
  contributionPerCustomer,
}: {
  projectCost: number;
  contributionPerCustomer: number;
}) {
  const value = clampNumber(contributionPerCustomer);
  if (value === 0) return null;
  return Math.ceil(clampNumber(projectCost) / value);
}

export function checkoutExposure({
  checkoutStarts,
  completedOrders,
  averageOrderValue,
}: {
  checkoutStarts: number;
  completedOrders: number;
  averageOrderValue: number;
}) {
  const starts = clampNumber(checkoutStarts);
  const completed = Math.min(starts, clampNumber(completedOrders));
  const incomplete = Math.max(0, starts - completed);
  return {
    starts,
    completed,
    incomplete,
    completionRatePercent: starts === 0 ? 0 : (completed / starts) * 100,
    incompleteOrderValue: incomplete * clampNumber(averageOrderValue),
  };
}
