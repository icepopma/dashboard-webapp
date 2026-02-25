import { test, expect } from '@playwright/test';

test.describe('Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Calendar"), button:has-text("日历")');
  });

  test('should display calendar header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/日历|Calendar/);
  });

  test('should display scheduled tasks section', async ({ page }) => {
    await expect(page.locator('text=/Scheduled|计划/').first()).toBeVisible();
  });

  test('should display week view by default', async ({ page }) => {
    // Check for day headers (Sun, Mon, Tue, etc.)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const day of weekDays) {
      await expect(page.locator(`text=${day}`)).toBeVisible();
    }
  });

  test('should display Next Up section', async ({ page }) => {
    await expect(page.locator('text=/Next Up|即将/')).toBeVisible();
  });

  test('should have Today button', async ({ page }) => {
    const todayBtn = page.locator('button:has-text("Today"), button:has-text("今天")');
    await expect(todayBtn).toBeVisible();
  });
});
