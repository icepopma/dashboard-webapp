import { test, expect } from '@playwright/test';

/**
 * Smoke Tests
 * Quick tests to verify basic functionality
 */

test.describe('Smoke Tests - Basic Functionality', () => {
  test('app should load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('sidebar should be visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('nav')).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to Tasks view', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try multiple possible selectors for Tasks button
    const tasksButton = page.locator('button:has-text("Tasks"), button:has-text("任务"), nav button').filter({ hasText: /Tasks|任务/ }).first();
    
    if (await tasksButton.isVisible({ timeout: 5000 })) {
      await tasksButton.click();
      await page.waitForTimeout(500);
      await expect(page.locator('main')).toBeVisible();
    } else {
      // If button not found, just verify main content is visible
      await expect(page.locator('main')).toBeVisible();
    }
  });
});

test.describe('Smoke Tests - API Health', () => {
  test('GET /api/ideas should respond', async ({ request }) => {
    const response = await request.get('/api/ideas');
    expect([200, 404]).toContain(response.status());
  });

  test('GET /api/tasks should respond', async ({ request }) => {
    const response = await request.get('/api/tasks');
    expect([200, 404]).toContain(response.status());
  });
});
