import { test, expect } from "@playwright/test";

test("Landing page animations", async ({ page }) => {
  // 1. Navigate to the landing page
  await page.goto("/");

  // 2. Check Hero Title Animation
  // The title has an initial opacity of 0 and animates to 1.
  const heroTitle = page.locator("h1");
  await expect(heroTitle).toBeVisible();
  await expect(heroTitle).toHaveCSS("opacity", "1");

  // 3. Check Hero Paragraph Animation
  // It has a delay, so we wait a bit or just expect it to eventually be visible
  const heroParagraph = page.getByText(
    "El sistema de gestión definitivo para escape rooms"
  );
  await expect(heroParagraph).toBeVisible();
  await expect(heroParagraph).toHaveCSS("opacity", "1");

  // 4. Scroll to Features section to trigger scroll animations
  const featuresSection = page.locator("#features");
  await featuresSection.scrollIntoViewIfNeeded();

  // 5. Check Feature Items Animation
  // Feature items animate in when in view.
  const firstFeature = page.getByText("Reservas Inteligentes");
  // Wait for animation
  await expect(firstFeature).toBeVisible();

  // Check if the parent container (motion.div) has opacity 1
  // We need to find the parent of the text which is the motion.div
  // The structure is motion.div > div > h3(Smart Booking)
  const featureItem = page
    .locator("h3", { hasText: "Reservas Inteligentes" })
    .locator("..")
    .locator("..");
  await expect(featureItem).toHaveCSS("opacity", "1");

  // 6. Check Parallax Image
  const parallaxSection = page.locator("h2", {
    hasText: "Experiencia Inmersiva",
  });
  await parallaxSection.scrollIntoViewIfNeeded();
  await expect(parallaxSection).toBeVisible();
});
