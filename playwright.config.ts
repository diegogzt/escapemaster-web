import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

function findEscapemasterWebRoot(startDir: string): string {
  const isWebDir = (dir: string) =>
    fs.existsSync(path.join(dir, "package.json")) &&
    fs.existsSync(path.join(dir, "next.config.ts"));

  let current = startDir;
  // Walk up to filesystem root
  // - prefer an explicit `escapemaster-web/` child when starting from monorepo root
  // - otherwise accept running from inside the package itself
  while (true) {
    if (isWebDir(current)) return current;

    const child = path.join(current, "escapemaster-web");
    if (isWebDir(child)) return child;

    const parent = path.dirname(current);
    if (parent === current) return startDir;
    current = parent;
  }
}

const webRoot = findEscapemasterWebRoot(process.cwd());

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3001",
    cwd: webRoot,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
