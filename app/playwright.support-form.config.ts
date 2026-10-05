import { defineConfig, devices } from "@playwright/test";

const baseURL = (process.env.SUPPORT_FORM_URL ?? "").replace(/\/$/, "");

if (!baseURL) throw new Error("SUPPORT_FORM_URL must point to the isolated local candidate");
if (!["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname)) {
  throw new Error("SUPPORT_FORM_URL must stay local; support-form tests never submit to production");
}

export default defineConfig({
  testDir: "./tests",
  testMatch: ["no-site-intake.spec.ts"],
  outputDir: "./test-results/support-form",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [["list"]],
  use: {
    baseURL,
    actionTimeout: 8_000,
    navigationTimeout: 20_000,
    serviceWorkers: "block",
  },
  projects: [{
    name: "chrome-support-form",
    grep: /support intake|BFCache-restored support form/,
    use: {
      ...devices["Desktop Chrome"],
      browserName: "chromium",
      channel: "chrome",
      viewport: { width: 1440, height: 900 },
    },
  }, {
    name: "chrome-support-form-phone",
    grep: /support intake keeps the reply path short/,
    use: {
      ...devices["Desktop Chrome"],
      browserName: "chromium",
      channel: "chrome",
      viewport: { width: 393, height: 852 },
    },
  }],
});
