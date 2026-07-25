import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  testMatch: "quality-smoke.spec.ts",
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [["list"]],
  outputDir: "test-results/quality-smoke",
  use: {
    baseURL,
    actionTimeout: 8_000,
    navigationTimeout: 20_000,
    serviceWorkers: "allow",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command:
      "npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium-desktop",
      grep: /@chromium-desktop|@all-projects/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "chromium-mobile",
      grep: /@chromium-mobile|@all-projects/,
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
      },
    },
    {
      name: "firefox-desktop",
      grep: /@firefox-desktop|@all-projects/,
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "webkit-mobile",
      grep: /@webkit-mobile|@all-projects/,
      use: {
        ...devices["iPhone 13"],
        browserName: "webkit",
      },
    },
  ],
});
