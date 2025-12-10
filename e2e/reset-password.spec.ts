import { test, expect } from '@playwright/test';

test('Reset password with invalid code shows error', async ({ page }) => {
  // Mock the API response
  await page.route('**/auth/reset-password', async route => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Failed to reset password: Invalid or expired verification code' }),
    });
  });

  // Navigate to the reset password page with query params
  await page.goto('http://localhost:3000/reset-password?code=123456&email=test@example.com');

  // Verify fields are pre-filled
  await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
  await expect(page.locator('input[name="code"]')).toHaveValue('123456');

  // Fill in the passwords
  await page.fill('input[name="password"]', 'newpassword123');
  await page.fill('input[name="confirmPassword"]', 'newpassword123');

  // Submit the form
  await page.click('button[type="submit"]');

  // Expect the error message to be visible
  await expect(page.locator('text=Failed to reset password: Invalid or expired verification code')).toBeVisible();
});
