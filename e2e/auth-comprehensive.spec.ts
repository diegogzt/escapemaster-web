import { test, expect } from "@playwright/test";

function makeFakeJwt(expSecondsFromNow: number = 60 * 60) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64"
  );
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow })
  ).toString("base64");
  return `${header}.${payload}.sig`;
}

test.describe("Authentication Flows", () => {
  test.describe("Registration", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/register");
    });

    test("should show validation errors for empty fields", async ({ page }) => {
      await page.click('button[type="submit"]');
      // Check for HTML5 validation or required attribute
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toHaveAttribute("required", "");
    });

    test("should handle successful registration", async ({ page }) => {
      await page.route("**/auth/register", async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: "User created" }),
        });
      });

      await page.fill('input[name="name"]', "New User");
      await page.fill('input[name="organizationName"]', "New Org");
      await page.fill('input[name="email"]', "newuser@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');

      // Expect success message or redirection
      // Based on RegisterPage code: setSuccess(true) -> shows "¡Revisa tu Email!" card
      await expect(page.locator("text=¡Revisa tu Email!")).toBeVisible({
        timeout: 10000,
      });
    });

    test("should handle server errors during registration", async ({
      page,
    }) => {
      await page.route("**/auth/register", async (route) => {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({ detail: "Email already registered" }),
        });
      });

      await page.fill('input[name="name"]', "Existing User");
      await page.fill('input[name="organizationName"]', "Existing Org");
      await page.fill('input[name="email"]', "existing@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');

      await expect(page.locator("text=Email already registered")).toBeVisible();
    });
  });

  test.describe("Login", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
    });

    test("should handle successful login", async ({ page }) => {
      const token = makeFakeJwt();
      await page.route("**/auth/login", async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            access_token: token,
            token_type: "bearer",
          }),
        });
      });

      // Mock /auth/me to return user with organization
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

      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');

      // Expect redirection to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10_000 });
    });

    test("should handle invalid credentials", async ({ page }) => {
      await page.route("**/auth/login", async (route) => {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({ detail: "Incorrect email or password" }),
        });
      });

      await page.fill('input[name="email"]', "wrong@example.com");
      await page.fill('input[name="password"]', "wrongpass");
      await page.click('button[type="submit"]');

      await expect(page.locator("text=Credenciales inválidas")).toBeVisible();
    });
  });

  test.describe("Forgot Password", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/forgot-password");
    });

    test("should handle successful request", async ({ page }) => {
      await page.route("**/auth/forgot-password", async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: "Email sent" }),
        });
      });

      await page.fill('input[name="email"]', "test@example.com");
      await page.click('button[type="submit"]');

      // Check for success message or UI change
      // Assuming the UI shows something like "Ingresa el código"
      await expect(page.locator("text=Ingresa el código")).toBeVisible();
    });
  });
});
