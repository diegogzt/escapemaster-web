import { chromium } from "playwright";
import path from "path";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport size for consistent screenshots
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log("Navigating to Dashboard...");
  // Assuming we can access dashboard directly or need to login.
  // Since I don't have credentials, I'll try to hit the dashboard route.
  // If it redirects to login, I'll screenshot the login page as "dashboard_preview" for now
  // or try to register if possible.
  // Actually, let's try to screenshot the landing page first to verify server is up.

  try {
    await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
    console.log("Landing page loaded.");

    // Navigate to dashboard - likely redirects to login
    await page.goto("http://localhost:3001/dashboard", {
      waitUntil: "networkidle",
    });
    console.log("Dashboard/Login page loaded.");

    // Take screenshot
    const screenshotPath = path.join(
      process.cwd(),
      "public",
      "dashboard-preview.png"
    );
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);
  } catch (error) {
    console.error("Error taking screenshot:", error);
  }

  await browser.close();
})();
