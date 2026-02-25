import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Home
    await page.click('button:has-text("Home"), button:has-text("首页")');
  });

  test('should display home header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/欢迎|Welcome|Mission Control/);
  });

  test('should display stats cards', async ({ page }) => {
    // Check for 4 stat cards
    await expect(page.locator('text=/Total Ideas|总想法/').first()).toBeVisible();
    await expect(page.locator('text=/With Plan|有计划/').first()).toBeVisible();
    await expect(page.locator('text=/Total Tasks|总任务/').first()).toBeVisible();
    await expect(page.locator('text=/Completed|已完成/').first()).toBeVisible();
  });

  test('should display today focus section', async ({ page }) => {
    await expect(page.locator('text=/Today|今日/').first()).toBeVisible();
  });

  test('should display pending section', async ({ page }) => {
    await expect(page.locator('text=/Pending|待处理/').first()).toBeVisible();
  });

  test('should display team online section', async ({ page }) => {
    await expect(page.locator('text=/Team|团队/').first()).toBeVisible();
  });

  test('should display Pop suggestions', async ({ page }) => {
    await expect(page.locator('text=/Suggestion|建议|Pop/').first()).toBeVisible();
  });

  test('should display weekly goals', async ({ page }) => {
    await expect(page.locator('text=/Weekly|本周/').first()).toBeVisible();
  });

  test('should display recent projects', async ({ page }) => {
    await expect(page.locator('text=/Recent|最近/').first()).toBeVisible();
  });

  test('should have sync and new idea buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Sync"), button:has-text("同步")')).toBeVisible();
    await expect(page.locator('button:has-text("New Idea"), button:has-text("新想法")')).toBeVisible();
  });
});

test.describe('Home Page Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Home"), button:has-text("首页")');
  });

  test('should click on focus item', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(500);
    
    // Click on a focus item if exists
    const focusItems = page.locator('[class*="cursor-pointer"]').filter({ hasText: /完成|Dashboard|邮件/ });
    if (await focusItems.count() > 0) {
      await focusItems.first().click();
    }
  });

  test('should click sync button', async ({ page }) => {
    const syncBtn = page.locator('button:has-text("Sync"), button:has-text("同步")');
    await syncBtn.click();
    // Button should still be visible after click
    await expect(syncBtn).toBeVisible();
  });
});
