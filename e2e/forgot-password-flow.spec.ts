import { test, expect } from '@playwright/test';

test('Forgot password flow works in a single page', async ({ page }) => {
  // Mock forgot-password request
  await page.route('**/auth/forgot-password', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Code sent' }),
    });
  });

  // Mock reset-password request
  await page.route('**/auth/reset-password', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Password reset successfully' }),
    });
  });

  // 1. Go to forgot password page
  await page.goto('/forgot-password');

  // 2. Enter email and submit
  await page.fill('input[name="email"]', 'test@example.com');
  await page.click('button:has-text("Enviar Instrucciones")');

  // 3. Verify we are still on the same page but see the code input
  await expect(page.locator('input[name="code"]')).toBeVisible();
  await expect(page.locator('text=Ingresa el código enviado a test@example.com')).toBeVisible();

  // 4. Enter code and new password
  await page.fill('input[name="code"]', '123456');
  await page.fill('input[name="password"]', 'newpassword123');
  await page.fill('input[name="confirmPassword"]', 'newpassword123');

  // 5. Submit reset
  await page.click('button:has-text("Cambiar Contraseña")');

  // 6. Verify success message and redirection (mocked wait)
  await expect(page.locator('text=¡Contraseña actualizada!')).toBeVisible();
});
