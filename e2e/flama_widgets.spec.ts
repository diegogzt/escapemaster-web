import { test, expect } from "@playwright/test";

const FLAMA_URL = "http://localhost:3001";

test.describe("Flama Widget Management", () => {
  test("should create a new widget", async ({ page }) => {
    // Assuming we are logged in or auth is disabled for dev
    // If auth is needed, we might need to mock it or login first

    await page.goto(`${FLAMA_URL}/widgets/create`);

    // Fill form
    await page.fill('input[name="name"]', "Test Widget");
    await page.fill('input[name="slug"]', "test-widget");
    await page.fill('input[name="component_path"]', "charts/TestWidget");

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect and list
    await expect(page).toHaveURL(`${FLAMA_URL}/widgets`);
    await expect(page.locator("text=Test Widget")).toBeVisible();
  });
});
