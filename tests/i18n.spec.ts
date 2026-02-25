import { test, expect } from '@playwright/test';

test.describe('Language Switching (i18n)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display language switcher', async ({ page }) => {
    // Check for language switch button
    const langBtn = page.locator('button:has-text("EN"), button:has-text("中文")');
    await expect(langBtn).toBeVisible();
  });

  test('should default to Chinese', async ({ page }) => {
    // Check that Chinese text is displayed - use h2 heading for "任务"
    await expect(page.getByRole('heading', { name: '任务' })).toBeVisible();
  });

  test('should switch to English when clicked', async ({ page }) => {
    // Click language switcher
    await page.click('button:has-text("EN")');

    // Wait for translation
    await page.waitForTimeout(500);

    // Check that English text is displayed - use h2 heading for "Tasks"
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  });

  test('should switch back to Chinese', async ({ page }) => {
    // Switch to English
    await page.click('button:has-text("EN")');
    await page.waitForTimeout(500);

    // Switch back to Chinese
    await page.click('button:has-text("中文")');
    await page.waitForTimeout(500);

    // Check Chinese text - use h2 heading with exact match for "任务"
    await expect(page.getByRole('heading', { name: '任务', level: 2 })).toBeVisible();
  });

  test('should persist language preference', async ({ page }) => {
    // Switch to English
    await page.click('button:has-text("EN")');
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();

    // Should still be in English - use h2 heading for "Tasks"
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  });
});
