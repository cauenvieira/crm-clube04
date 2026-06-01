import { defineConfig } from "@playwright/test";

const baseURL = (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default defineConfig({
  testDir: "./scripts/frontend-tests",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  reporter: "list",
  use: {
    baseURL,
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off"
  },
  projects: [
    {
      name: "chrome",
      use: {
        browserName: "chromium",
        channel: "chrome"
      }
    }
  ]
});
