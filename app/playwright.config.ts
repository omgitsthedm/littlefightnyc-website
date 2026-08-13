import { defineConfig, devices } from "@playwright/test";

const requestedPort = Number.parseInt(process.env.PLAYWRIGHT_PORT ?? "4173", 10);
const port =
  Number.isInteger(requestedPort) && requestedPort >= 1024 && requestedPort <= 65535
    ? requestedPort
    : 4173;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: ["quality-smoke.spec.ts", "vera-product.spec.ts"],
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
      `npm run build && npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer:
      !process.env.CI && process.env.PLAYWRIGHT_REUSE_SERVER === "1",
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium-desktop",
      grep: /@chromium-desktop|@all-projects|@pool-room-all|@vera-all-platforms|@vera-desktop/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "chromium-mobile",
      grep: /@chromium-mobile|@all-projects|@pool-room-all|@vera-all-platforms|@vera-touch/,
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
      },
    },
    {
      name: "firefox-desktop",
      grep: /@firefox-desktop|@all-projects|@pool-room-all|@vera-all-platforms|@vera-desktop/,
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "webkit-mobile",
      grep: /@webkit-mobile|@all-projects|@pool-room-all|@vera-all-platforms|@vera-touch/,
      use: {
        ...devices["iPhone 13"],
        browserName: "webkit",
      },
    },
    {
      // This project deliberately omits @all-projects. It gives VERA a
      // desktop Safari contract without running the whole site-wide suite a
      // second time.
      name: "webkit-desktop",
      grep: /@webkit-desktop|@pool-room-all|@vera-all-platforms|@vera-desktop/,
      use: {
        ...devices["Desktop Safari"],
        browserName: "webkit",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      // iPad is its own product surface: touch input, tablet viewport, and
      // WebKit. Keep it on the focused VERA contract for bounded runtime.
      name: "webkit-ipad",
      grep: /@webkit-ipad|@pool-room-all|@vera-all-platforms|@vera-touch/,
      use: {
        ...devices["iPad Pro 11"],
        browserName: "webkit",
      },
    },
  ],
});
