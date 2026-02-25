import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sidebar with all navigation items', async ({ page }) => {
    // Check sidebar exists
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Check logo
    await expect(sidebar.locator('text=Pop')).toBeVisible();
    await expect(sidebar.locator('text=Mission Control')).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    // Start on Tasks page (default)
    await expect(page.locator('h2')).toContainText(/任务|Tasks/);

    // Navigate to Content
    await page.click('button:has-text("Content"), button:has-text("内容")');
    await expect(page.locator('h2')).toContainText(/内容|Content/);

    // Navigate to Calendar
    await page.click('button:has-text("Calendar"), button:has-text("日历")');
    await expect(page.locator('h2')).toContainText(/日历|Calendar/);

    // Navigate to Memory
    await page.click('button:has-text("Memory"), button:has-text("记忆")');
    await expect(page.locator('h2')).toContainText(/记忆|Memory/);

    // Navigate to Team
    await page.click('button:has-text("Team"), button:has-text("团队")');
    await expect(page.locator('h2')).toContainText(/团队|Team/);

    // Navigate to Office
    await page.click('button:has-text("Office"), button:has-text("办公室")');
    await expect(page.locator('h2')).toContainText(/办公室|Office/);
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Click on Calendar
    await page.click('button:has-text("Calendar"), button:has-text("日历")');
    
    // Check that Calendar button has active styling
    const calendarBtn = page.locator('button:has-text("Calendar"), button:has-text("日历")');
    await expect(calendarBtn).toHaveClass(/bg-primary/);
  });
});
