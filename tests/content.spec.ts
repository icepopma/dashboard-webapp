import { test, expect } from '@playwright/test';

test.describe('Content Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Content"), button:has-text("内容")');
  });

  test('should display pipeline header with stages', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/内容|Content/);
    
    // Check stage path navigation
    await expect(page.locator('text=/Ideas|想法/').first()).toBeVisible();
    await expect(page.locator('text=/Scripting|脚本/').first()).toBeVisible();
  });

  test('should display 5 stage statistics cards', async ({ page }) => {
    // Check all 5 stage cards
    await expect(page.locator('text=/Ideas|想法/').first()).toBeVisible();
    await expect(page.locator('text=/Scripting|脚本/').first()).toBeVisible();
    await expect(page.locator('text=/Thumbnail|缩略图/').first()).toBeVisible();
    await expect(page.locator('text=/Filming|拍摄/').first()).toBeVisible();
    await expect(page.locator('text=/Editing|剪辑/').first()).toBeVisible();
  });

  test('should display stage columns with cards', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Check columns exist - use a more generic selector
    const columns = page.locator('[class*="rounded"], [class*="card"], [class*="Card"]');
    await expect(columns.first()).toBeVisible();
  });

  test('should have New Content button', async ({ page }) => {
    const newContentBtn = page.locator('button:has-text("New Content"), button:has-text("新内容")');
    await expect(newContentBtn).toBeVisible();
    await expect(newContentBtn).toBeEnabled();
  });
});
