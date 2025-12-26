import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3001";

function makeFakeJwt(expSecondsFromNow: number = 60 * 60) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64"
  );
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow })
  ).toString("base64");
  return `${header}.${payload}.sig`;
}

test.describe("Dashboard Widgets", () => {
  test("should add a widget from the dashboard modal", async ({ page, context }) => {
    const token = makeFakeJwt();

    // Make the app consider us authenticated (AuthContext + middleware)
    await page.addInitScript((t) => {
      localStorage.setItem("token", t);
    }, token);
    await context.addCookies([
      {
        name: "token",
        value: token,
        domain: "localhost",
        path: "/",
      },
    ]);

    // Avoid network flakiness on auth/me during initial auth check
    await page.route("**/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 1,
          email: "test@example.com",
          organization_id: 1,
        }),
      });
    });

    await page.goto("/dashboard");

    // Enter edit mode and open the add-widget modal
    await page.getByRole("button", { name: "Editar" }).click();
    await page.getByRole("button", { name: "Añadir Widget" }).click();

    // Add a known widget from the registry
    await page.getByRole("button", { name: "Notas Rápidas" }).click();

    // Modal should close and widget title should be visible on the dashboard
    await expect(page.getByRole("heading", { name: "Añadir Widget" })).toHaveCount(0);
    await expect(page.getByText("Notas Rápidas")).toBeVisible();
  });
});
