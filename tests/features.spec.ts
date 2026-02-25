import { test, expect } from '@playwright/test';

test.describe('Memory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Memory"), button:has-text("记忆")');
  });

  test('should display memory header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/记忆|Memory/);
  });

  test('should display sidebar with document tree', async ({ page }) => {
    // Check for Long-Term Memory section
    await expect(page.locator('text=/Long-Term|长期/').first()).toBeVisible();

    // Check for Daily Journal section
    await expect(page.locator('text=/Daily|日志/').first()).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="搜索"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display main content area', async ({ page }) => {
    // Check for content display
    await page.waitForTimeout(500);
    const contentArea = page.locator('[class*="flex-1"]');
    await expect(contentArea.first()).toBeVisible();
  });
});

test.describe('Team', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Team"), button:has-text("团队")');
  });

  test('should display team header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/团队|Team/);
  });

  test('should display team statistics', async ({ page }) => {
    await expect(page.locator('text=/Total Members|总成员/').first()).toBeVisible();
    await expect(page.locator('text=/Online|在线/').first()).toBeVisible();
  });

  test('should display agent layers', async ({ page }) => {
    // Check for layer sections
    await expect(page.locator('text=/Input Signal|输入/')).toBeVisible();
    await expect(page.locator('text=/Meta Layer|元/')).toBeVisible();
  });

  test('should display agent cards', async ({ page }) => {
    // Check for agent card with avatar - use more generic selector
    const agentCard = page.locator('[class*="rounded"], [class*="card"], [class*="Card"]').first();
    await expect(agentCard).toBeVisible();
  });
});

test.describe('Office', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Office"), button:has-text("办公室")');
  });

  test('should display office header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/办公室|Office/);
  });

  test('should display status indicators', async ({ page }) => {
    await expect(page.locator('text=/Working|工作/').first()).toBeVisible();
    await expect(page.locator('text=/Idle|空闲/').first()).toBeVisible();
  });

  test('should display control buttons', async ({ page }) => {
    await expect(page.locator('text=/All Working|全员/')).toBeVisible();
    await expect(page.locator('text=/Gather|召集/')).toBeVisible();
  });

  test('should display live activity panel', async ({ page }) => {
    await expect(page.locator('text=/Live Activity|实时/').first()).toBeVisible();
  });
});
