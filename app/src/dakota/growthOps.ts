export interface DakotaWeeklyGbpDraft {
  weekKey: string;
  theme: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface DakotaHolidayHoursFlag {
  name: string;
  actualDate: string;
  observedDate: string;
  daysUntilObserved: number;
}

const DAY_MS = 24 * 60 * 60_000;
const WEEK_MS = 7 * DAY_MS;

const GBP_DRAFTS = [
  {
    theme: "Website check",
    title: "Find the next customer-path problem before they do",
    body: "A small-business website does not need more features. It needs the next step to work on a phone. Little Fight NYC’s free Website Check measures the public page, then a real person explains what deserves attention first.",
    ctaLabel: "Run the free check",
    ctaUrl: "https://www.littlefightnyc.com/website-check/",
  },
  {
    theme: "Software ownership",
    title: "Own the system your business depends on",
    body: "If a monthly tool fights the way your team actually works, another subscription may not be the answer. Little Fight NYC builds focused software the business owns—including its code, data, hosting, and operating notes.",
    ctaLabel: "See software you own",
    ctaUrl: "https://www.littlefightnyc.com/services/business-systems/",
  },
  {
    theme: "Fourteen-day website",
    title: "A custom local website with one clear customer action",
    body: "Menus, bookings, quote requests, services, directions: each storefront has a different money path. Little Fight NYC builds around that real next step and ships custom local websites in 14 days—or you do not pay.",
    ctaLabel: "See the website service",
    ctaUrl: "https://www.littlefightnyc.com/services/custom-local-websites/",
  },
  {
    theme: "New-business launch",
    title: "Open with the digital front door already working",
    body: "A new business should not launch with five disconnected accounts. Little Fight NYC connects the owned website, Google presence, business email, booking or inquiry path, measurement, and handoff around one true set of business facts.",
    ctaLabel: "See the launch system",
    ctaUrl: "https://www.littlefightnyc.com/services/new-business-launch/",
  },
] as const;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mondayUtc(now: Date): Date {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - mondayOffset);
  return date;
}

export function weeklyGbpDraft(now = new Date()): DakotaWeeklyGbpDraft {
  const week = mondayUtc(now);
  const index = Math.abs(Math.floor(week.getTime() / WEEK_MS)) % GBP_DRAFTS.length;
  const draft = GBP_DRAFTS[index]!;
  return { weekKey: isoDate(week), ...draft };
}

function nthWeekday(year: number, month: number, weekday: number, occurrence: number): Date {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return new Date(Date.UTC(year, month, 1 + offset + (occurrence - 1) * 7));
}

function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(Date.UTC(year, month + 1, 0));
  const offset = (last.getUTCDay() - weekday + 7) % 7;
  return new Date(Date.UTC(year, month, last.getUTCDate() - offset));
}

function observedFixed(year: number, month: number, day: number): { actual: Date; observed: Date } {
  const actual = new Date(Date.UTC(year, month, day));
  const observed = new Date(actual);
  if (actual.getUTCDay() === 6) observed.setUTCDate(observed.getUTCDate() - 1);
  if (actual.getUTCDay() === 0) observed.setUTCDate(observed.getUTCDate() + 1);
  return { actual, observed };
}

function federalHolidays(year: number): Array<{ name: string; actual: Date; observed: Date }> {
  const fixed = [
    ["New Year’s Day", 0, 1],
    ["Juneteenth National Independence Day", 5, 19],
    ["Independence Day", 6, 4],
    ["Veterans Day", 10, 11],
    ["Christmas Day", 11, 25],
  ] as const;
  const holidays: Array<{ name: string; actual: Date; observed: Date }> = fixed.map(([name, month, day]) => ({ name, ...observedFixed(year, month, day) }));
  const variable = [
    ["Birthday of Martin Luther King, Jr.", nthWeekday(year, 0, 1, 3)],
    ["Washington’s Birthday", nthWeekday(year, 1, 1, 3)],
    ["Memorial Day", lastWeekday(year, 4, 1)],
    ["Labor Day", nthWeekday(year, 8, 1, 1)],
    ["Columbus Day", nthWeekday(year, 9, 1, 2)],
    ["Thanksgiving Day", nthWeekday(year, 10, 4, 4)],
  ] as const;
  for (const [name, date] of variable) holidays.push({ name, actual: date, observed: date });
  return holidays.sort((left, right) => left.observed.getTime() - right.observed.getTime());
}

export function upcomingHolidayHoursFlags(now = new Date(), windowDays = 45): DakotaHolidayHoursFlag[] {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const holidays = [...federalHolidays(today.getUTCFullYear()), ...federalHolidays(today.getUTCFullYear() + 1)];
  return holidays.flatMap((holiday) => {
    const daysUntilObserved = Math.round((holiday.observed.getTime() - today.getTime()) / DAY_MS);
    if (daysUntilObserved < 0 || daysUntilObserved > windowDays) return [];
    return [{
      name: holiday.name,
      actualDate: isoDate(holiday.actual),
      observedDate: isoDate(holiday.observed),
      daysUntilObserved,
    }];
  });
}
