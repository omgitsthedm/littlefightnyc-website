export type CurrencyChoice = {
  code: "USD" | "CAD" | "GBP" | "EUR" | "AUD";
  locale: string;
  label: string;
};

export const CURRENCY_CHOICES: CurrencyChoice[] = [
  { code: "USD", locale: "en-US", label: "USD · English (US)" },
  { code: "CAD", locale: "en-CA", label: "CAD · English (Canada)" },
  { code: "GBP", locale: "en-GB", label: "GBP · English (UK)" },
  { code: "EUR", locale: "en-IE", label: "EUR · English (Europe)" },
  { code: "AUD", locale: "en-AU", label: "AUD · English (Australia)" },
];

export const DEFAULT_CURRENCY = CURRENCY_CHOICES[0];
