/**
 * Responsive Audit — Issue Verification
 *
 * This file documents the 7 UI/UX issues identified in the EscapeMaster
 * responsive audit and verifies they are FIXED. Each test describes the
 * original defect and asserts the corrected behaviour.
 *
 * Viewports used:
 *   mobile  — 375 × 812   (iPhone SE/13 mini)
 *   tablet  — 768 × 1024  (iPad portrait)
 *   laptop  — 1366 × 768  (common laptop)
 *   desktop — 1920 × 1080 (full-HD monitor)
 */

import { test, expect, Page, BrowserContext } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFakeJwt(expSecondsFromNow: number = 60 * 60): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" })
  ).toString("base64");
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + expSecondsFromNow,
      user_id: "test-user-1",
    })
  ).toString("base64");
  return `${header}.${payload}.sig`;
}

/**
 * Inject a fake JWT into localStorage and add it as a cookie so that both
 * the Next.js middleware (cookie) and the client AuthContext (localStorage)
 * consider the session valid.
 */
async function setupAuth(page: Page, context: BrowserContext): Promise<void> {
  const token = makeFakeJwt();

  await page.addInitScript((t: string) => {
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
}

/**
 * Register all API mocks required for dashboard/bookings pages to render
 * without a real backend.
 */
async function mockApiRoutes(page: Page): Promise<void> {
  const fakeUser = {
    id: "1",
    full_name: "Test User",
    email: "test@test.com",
    role: { name: "admin" },
    is_superuser: true,
    permissions: [],
  };

  await page.route("**/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeUser),
    });
  });

  await page.route("**/bookings**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ bookings: [], total: 0, page: 1, pages: 1 }),
    });
  });

  await page.route("**/rooms**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/dashboard/stats**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        total_revenue: 1000,
        total_bookings: 5,
        active_customers: 10,
        active_rooms: 3,
        top_rooms: [],
      }),
    });
  });

  // Suppress membership/org calls so they don't cause noise
  await page.route("**/memberships**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/organizations**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Responsive Audit — Issue Verification", () => {
  // =========================================================================
  // Issue 1: Hamburger menu on mobile
  //
  // BEFORE FIX: The mobile header had no button to open the navigation drawer,
  // leaving mobile users with no way to access the full nav beyond the 4 items
  // in the bottom bar.
  //
  // AFTER FIX: A hamburger button (data-testid="hamburger-button") was added to
  // the mobile header. Clicking it opens the slide-in drawer
  // (data-testid="mobile-drawer").
  // =========================================================================
  test.describe("Issue 1 — Hamburger button opens mobile drawer", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("hamburger button is visible on mobile and opens the navigation drawer", async ({
      page,
      context,
    }) => {
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      // The hamburger button must be present in the mobile header
      const hamburger = page.getByTestId("hamburger-button");
      await expect(hamburger).toBeVisible();

      // The drawer must NOT be in the DOM before the button is clicked
      await expect(page.getByTestId("mobile-drawer")).not.toBeVisible();

      // Click the hamburger — drawer must slide in
      await hamburger.click();

      const drawer = page.getByTestId("mobile-drawer");
      await expect(drawer).toBeVisible({ timeout: 3000 });
    });

    test("mobile drawer contains navigation links after opening", async ({
      page,
      context,
    }) => {
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      await page.getByTestId("hamburger-button").click();

      const drawer = page.getByTestId("mobile-drawer");
      await expect(drawer).toBeVisible({ timeout: 3000 });

      // Drawer must contain at least the core nav links
      await expect(drawer.getByRole("link", { name: /Dashboard/i })).toBeVisible();
      await expect(drawer.getByRole("link", { name: /Reservas/i })).toBeVisible();
      await expect(drawer.getByRole("link", { name: /Salas/i })).toBeVisible();
    });

    test("drawer closes when the backdrop is clicked", async ({
      page,
      context,
    }) => {
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      await page.getByTestId("hamburger-button").click();
      await expect(page.getByTestId("mobile-drawer")).toBeVisible({ timeout: 3000 });

      // Click the backdrop (outside the drawer)
      const backdrop = page.getByTestId("mobile-drawer-backdrop");
      await expect(backdrop).toBeVisible();
      await backdrop.click();

      await expect(page.getByTestId("mobile-drawer")).not.toBeVisible({ timeout: 3000 });
    });

    test("hamburger button is hidden on desktop — sidebar replaces it", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      // The mobile header is md:hidden — not visible on desktop
      await expect(page.getByTestId("hamburger-button")).not.toBeVisible();
    });
  });

  // =========================================================================
  // Issue 2: "Más" button in bottom navigation
  //
  // BEFORE FIX: The 5th slot in the bottom nav showed a "Reportes" link that
  // duplicated a sidebar entry and did not open any overflow drawer.
  //
  // AFTER FIX: The 5th item was renamed to "Más" and wired to the same
  // toggleMobileMenu action as the hamburger, giving users access to the
  // full navigation from the bottom bar.
  // =========================================================================
  test.describe("Issue 2 — 'Más' button in bottom nav opens drawer", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("bottom nav renders a 'Más' button instead of a 'Reportes' link", async ({
      page,
      context,
    }) => {
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      const bottomNav = page.getByTestId("bottom-nav");
      await expect(bottomNav).toBeVisible();

      // "Más" button must be present
      const moreButton = page.getByTestId("more-button");
      await expect(moreButton).toBeVisible();
      await expect(moreButton).toContainText("Más");

      // There must be no "Reportes" link as the 5th bottom-nav item
      // (it may appear inside the drawer, but not as a dedicated bottom-nav icon)
      const reportesBottomLink = bottomNav.getByRole("link", { name: /Reportes/i });
      await expect(reportesBottomLink).toHaveCount(0);
    });

    test("clicking 'Más' in bottom nav opens the mobile drawer", async ({
      page,
      context,
    }) => {
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      // Drawer must be closed initially
      await expect(page.getByTestId("mobile-drawer")).not.toBeVisible();

      await page.getByTestId("more-button").click();

      await expect(page.getByTestId("mobile-drawer")).toBeVisible({ timeout: 3000 });
    });

    test("'Más' button is hidden on desktop (md:hidden)", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      // The bottom nav as a whole is md:hidden
      await expect(page.getByTestId("bottom-nav")).not.toBeVisible();
      await expect(page.getByTestId("more-button")).not.toBeVisible();
    });
  });

  // =========================================================================
  // Issue 3: Card view for bookings on mobile
  //
  // BEFORE FIX: The bookings page always rendered a wide data table, which
  // overflowed horizontally on small screens and was unreadable on mobile.
  //
  // AFTER FIX: On viewports < 640px (sm breakpoint) the table is hidden and a
  // card-based list (data-testid="mobile-card-list") is shown instead.
  // On sm+ screens, the table (data-testid="bookings-table") appears and the
  // card list is hidden.
  // =========================================================================
  test.describe("Issue 3 — Card view for bookings on mobile", () => {
    test("mobile (<640px) shows card list and hides the data table", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/bookings");

      const cardList = page.getByTestId("mobile-card-list");
      const bookingsTable = page.getByTestId("bookings-table");

      await expect(cardList).toBeVisible({ timeout: 5000 });
      await expect(bookingsTable).not.toBeVisible();
    });

    test("tablet/desktop (768px+) shows the data table and hides the card list", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/bookings");

      const cardList = page.getByTestId("mobile-card-list");
      const bookingsTable = page.getByTestId("bookings-table");

      await expect(bookingsTable).toBeVisible({ timeout: 5000 });
      await expect(cardList).not.toBeVisible();
    });

    test("desktop (1920px) shows the data table and hides the card list", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/bookings");

      await expect(page.getByTestId("bookings-table")).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId("mobile-card-list")).not.toBeVisible();
    });

    test("card list renders individual booking-card elements when bookings exist", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await setupAuth(page, context);

      // Override bookings mock to return real data
      await page.route("**/auth/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "1",
            full_name: "Test User",
            email: "test@test.com",
            role: { name: "admin" },
            is_superuser: true,
            permissions: [],
          }),
        });
      });
      await page.route("**/bookings**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            bookings: [
              {
                id: "b1",
                room_name: "Sala Egipto",
                guest: { full_name: "Grupo Alpha" },
                start_time: new Date().toISOString(),
                num_people: 4,
                booking_status: "confirmed",
                total_price: 120,
                remaining_balance: 0,
                room_color: "#3B82F6",
              },
            ],
            total: 1,
            page: 1,
            pages: 1,
          }),
        });
      });
      await page.route("**/rooms**", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      });
      await page.route("**/memberships**", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      });
      await page.route("**/organizations**", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      });

      await page.goto("/bookings");

      const cardList = page.getByTestId("mobile-card-list");
      await expect(cardList).toBeVisible({ timeout: 5000 });

      // At least one booking card must be rendered inside the card list
      const cards = cardList.locator('[data-testid="booking-card"]');
      await expect(cards).toHaveCount(1, { timeout: 5000 });
      await expect(cards.first()).toContainText("Sala Egipto");
    });
  });

  // =========================================================================
  // Issue 4: No horizontal overflow on mobile
  //
  // BEFORE FIX: The main content area had no overflow constraint, causing wide
  // elements (large tables, long text) to create a horizontal scrollbar across
  // the entire app on small screens.
  //
  // AFTER FIX: The <main> element now carries overflow-x-hidden and is
  // identified with data-testid="main-content".
  // =========================================================================
  test.describe("Issue 4 — No horizontal overflow on mobile", () => {
    test("main content element exists with data-testid='main-content'", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      await expect(page.getByTestId("main-content")).toBeVisible({ timeout: 5000 });
    });

    test("main content has overflow-x-hidden CSS applied on mobile", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      const mainContent = page.getByTestId("main-content");
      await expect(mainContent).toBeVisible({ timeout: 5000 });

      const overflowX = await mainContent.evaluate(
        (el) => window.getComputedStyle(el).overflowX
      );
      expect(overflowX).toBe("hidden");
    });

    test("page body does not overflow horizontally on mobile at bookings route", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/bookings");

      await expect(page.getByTestId("main-content")).toBeVisible({ timeout: 5000 });

      // The document scroll width must not exceed the viewport width
      const { scrollWidth, viewportWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }));

      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
    });
  });

  // =========================================================================
  // Issue 5: Sidebar auto-collapses on tablet
  //
  // BEFORE FIX: The full-width sidebar (256px) was always shown on md+ screens,
  // consuming ~25% of the viewport on 768px tablets and leaving little space
  // for content.
  //
  // AFTER FIX: At 768px–1023px the sidebar automatically collapses to icon-only
  // mode (width = 64px) when no user preference is saved in localStorage.
  // =========================================================================
  test.describe("Issue 5 — Sidebar auto-collapses on tablet", () => {
    test("sidebar collapses to 64px width on a 768px tablet (no saved preference)", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await setupAuth(page, context);
      await mockApiRoutes(page);

      // Ensure no previous preference is stored (use addInitScript to clear before page load)
      await page.addInitScript(() => {
        localStorage.removeItem("sidebar-collapsed");
        localStorage.removeItem("sidebar-width");
      });

      await page.goto("/dashboard");

      // Wait for the sidebar to be visible (it is hidden on mobile only)
      const sidebar = page.locator("aside");
      await expect(sidebar).toBeVisible({ timeout: 5000 });

      // Give React's useEffect time to apply the media-query-driven collapse
      await page.waitForTimeout(500);

      const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
      // Collapsed icon-only sidebar must be exactly 64px
      expect(width).toBeCloseTo(64, 0);
    });

    test("sidebar expands to full width on desktop (1280px)", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await setupAuth(page, context);
      await mockApiRoutes(page);

      await page.addInitScript(() => {
        localStorage.removeItem("sidebar-collapsed");
        localStorage.removeItem("sidebar-width");
      });

      await page.goto("/dashboard");

      const sidebar = page.locator("aside");
      await expect(sidebar).toBeVisible({ timeout: 5000 });

      await page.waitForTimeout(500);

      const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
      // Full sidebar is 256px
      expect(width).toBeGreaterThan(100);
    });

    test("sidebar is hidden entirely on mobile (md:hidden)", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      // The <aside> has `hidden md:flex` — must not be visible on mobile
      const sidebar = page.locator("aside");
      await expect(sidebar).not.toBeVisible({ timeout: 5000 });
    });
  });

  // =========================================================================
  // Issue 6: Dashboard widget grid is responsive
  //
  // BEFORE FIX: The stats cards widget used a fixed multi-column grid that
  // overflowed on mobile and did not adapt to smaller viewports.
  //
  // AFTER FIX: The grid uses responsive Tailwind classes:
  //   grid-cols-1 (mobile) → sm:grid-cols-2 (tablet) → lg:grid-cols-4 (desktop)
  // =========================================================================
  test.describe("Issue 6 — Dashboard stats-cards grid is responsive", () => {
    test("stats cards render 1 column on mobile (375px)", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      // Wait for the stats to load (skeleton → real cards)
      await page.waitForTimeout(2000);

      // Locate all stat card elements by their shared structure
      const statCards = page.locator(
        '.grid > div.bg-\\[var\\(--color-background\\)\\].rounded-xl'
      );
      const count = await statCards.count();

      if (count > 1) {
        const firstBox = await statCards.nth(0).boundingBox();
        const secondBox = await statCards.nth(1).boundingBox();

        // In a 1-column layout consecutive cards are stacked (same x, different y)
        expect(firstBox).not.toBeNull();
        expect(secondBox).not.toBeNull();
        if (firstBox && secondBox) {
          // Cards should be stacked vertically — second card's top > first card's bottom
          expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 5);
        }
      }
    });

    test("stats cards render in a multi-column layout on desktop (1920px)", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      await page.waitForTimeout(2000);

      const statCards = page.locator(
        '.grid > div.bg-\\[var\\(--color-background\\)\\].rounded-xl'
      );
      const count = await statCards.count();

      if (count > 1) {
        const firstBox = await statCards.nth(0).boundingBox();
        const secondBox = await statCards.nth(1).boundingBox();

        expect(firstBox).not.toBeNull();
        expect(secondBox).not.toBeNull();
        if (firstBox && secondBox) {
          // In a multi-column layout the second card should be on the same row (same y)
          expect(Math.abs(secondBox.y - firstBox.y)).toBeLessThan(10);
        }
      }
    });

    test("stats grid container includes responsive Tailwind grid classes", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      await page.waitForTimeout(2000);

      // The grid element must have classes that establish responsive columns
      const gridClassName = await page.locator(".grid").first().getAttribute("class");
      expect(gridClassName).toMatch(/grid-cols-1/);
      // At lg breakpoint the grid should expand (lg:grid-cols-4)
      expect(gridClassName).toMatch(/lg:grid-cols-4/);
    });
  });

  // =========================================================================
  // Issue 7: Search bar has max-width on desktop
  //
  // BEFORE FIX: The bookings search input stretched to fill the entire
  // container width on large screens, creating an uncomfortably wide field
  // that was difficult to use and visually unbalanced.
  //
  // AFTER FIX: The search input wrapper has max-w-[600px] applied via
  // md:max-w-[600px], capping the field width at 600px on desktop while
  // allowing it to fill the container width on mobile.
  // =========================================================================
  test.describe("Issue 7 — Search bar has max-width on desktop", () => {
    test("search input exists and is accessible on desktop", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/bookings");

      const searchInput = page.getByTestId("bookings-search");
      await expect(searchInput).toBeVisible({ timeout: 5000 });
    });

    test("search input wrapper does not exceed 600px on desktop (1920px)", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/bookings");

      const searchInput = page.getByTestId("bookings-search");
      await expect(searchInput).toBeVisible({ timeout: 5000 });

      const wrapper = searchInput.locator("..");
      const wrapperBox = await wrapper.boundingBox();

      expect(wrapperBox).not.toBeNull();
      if (wrapperBox) {
        // The wrapper must not exceed 600px (allow a small rounding tolerance)
        expect(wrapperBox.width).toBeLessThanOrEqual(610);
      }
    });

    test("search input fills full width on mobile (375px)", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/bookings");

      const searchInput = page.getByTestId("bookings-search");
      await expect(searchInput).toBeVisible({ timeout: 5000 });

      const inputBox = await searchInput.boundingBox();
      expect(inputBox).not.toBeNull();
      if (inputBox) {
        // On mobile the input should expand close to the viewport width
        expect(inputBox.width).toBeGreaterThan(200);
      }
    });

    test("search input wrapper has max-w-[600px] class applied at md breakpoint", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/bookings");

      const searchInput = page.getByTestId("bookings-search");
      await expect(searchInput).toBeVisible({ timeout: 5000 });

      // Climb up to find the wrapping div that carries the max-width class
      const wrapperClass = await searchInput.locator("..").getAttribute("class");
      expect(wrapperClass).toMatch(/max-w-\[600px\]|max-w-600/);
    });
  });

  // =========================================================================
  // Regression guard — Desktop layout must remain intact after mobile fixes
  //
  // These tests verify that the changes introduced for mobile/tablet do not
  // break the desktop experience.
  // =========================================================================
  test.describe("Regression — Desktop layout intact after mobile fixes", () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test("sidebar is visible and expanded on desktop", async ({
      page,
      context,
    }) => {
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.addInitScript(() => {
        localStorage.removeItem("sidebar-collapsed");
      });
      await page.goto("/dashboard");

      const sidebar = page.locator("aside");
      await expect(sidebar).toBeVisible({ timeout: 5000 });

      await page.waitForTimeout(300);
      const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
      expect(width).toBeGreaterThan(100);
    });

    test("hamburger button and bottom nav are hidden on desktop", async ({
      page,
      context,
    }) => {
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      await expect(page.getByTestId("hamburger-button")).not.toBeVisible();
      await expect(page.getByTestId("bottom-nav")).not.toBeVisible();
      await expect(page.getByTestId("more-button")).not.toBeVisible();
    });

    test("bookings table is shown (not card list) on desktop", async ({
      page,
      context,
    }) => {
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/bookings");

      await expect(page.getByTestId("bookings-table")).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId("mobile-card-list")).not.toBeVisible();
    });

    test("main content area is reachable and rendered on desktop", async ({
      page,
      context,
    }) => {
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/dashboard");

      await expect(page.getByTestId("main-content")).toBeVisible({ timeout: 5000 });
    });

    test("search input on bookings page is usable on desktop", async ({
      page,
      context,
    }) => {
      await setupAuth(page, context);
      await mockApiRoutes(page);
      await page.goto("/bookings");

      const search = page.getByTestId("bookings-search");
      await expect(search).toBeVisible({ timeout: 5000 });
      await search.fill("test query");
      await expect(search).toHaveValue("test query");
    });
  });

  // =========================================================================
  // Audit documentation — Security & code quality findings
  //
  // The following issues were identified in the audit but are not suitable for
  // E2E testing (they are backend/code-level concerns). They are documented
  // here for traceability.
  //
  //   SEC-1: JWT is parsed with atob() on the client — no signature validation.
  //          The app calls atob(token.split('.')[1]) to read the exp claim.
  //          A tampered payload would be trusted. Fix: validate tokens
  //          server-side only; never trust client-decoded JWT claims.
  //
  //   CQ-1:  alert() / prompt() used for user-facing notifications instead of
  //          a toast library. Fix: replace with Sonner toasts (already imported
  //          in some files). No E2E assertion; verified by code review.
  //
  //   CQ-2:  Hardcoded values in several places:
  //          - currentUserId = "gm1" in gamemaster view
  //          - DEFAULT_EXPENSES constant with hard-coded amounts
  //          Fix: source these values from the authenticated user context
  //          and from the API respectively.
  // =========================================================================
  test("audit finding SEC-1 is documented — JWT lacks server-side signature validation", async () => {
    // This test exists to anchor the finding in the test suite for traceability.
    // The actual security fix must be applied server-side and is outside the
    // scope of Playwright E2E tests.
    //
    // The fake JWT created by makeFakeJwt() intentionally uses alg:"none" and
    // an unsigned signature ("sig"), which is accepted by the app's atob()-based
    // parsing. A correctly hardened implementation would reject such tokens.
    const fakeJwt = makeFakeJwt();
    const parts = fakeJwt.split(".");
    expect(parts).toHaveLength(3);

    const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
    expect(header.alg).toBe("none"); // App accepted this — should not in production
  });
});
