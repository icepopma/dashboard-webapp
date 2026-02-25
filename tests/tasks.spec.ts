import { test, expect } from '@playwright/test';

test.describe('Tasks Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display task statistics', async ({ page }) => {
    // Check stats cards exist
    await expect(page.locator('text=/This week|本周/')).toBeVisible();
    await expect(page.locator('text=/In Progress|进行中/')).toBeVisible();
    await expect(page.locator('text=/Total|总计/')).toBeVisible();
    await expect(page.locator('text=/Completion|完成率/')).toBeVisible();
  });

  test('should display 5 kanban columns', async ({ page }) => {
    // Check all 5 columns exist
    await expect(page.locator('text=/Recurring|循环/').first()).toBeVisible();
    await expect(page.locator('text=/Backlog|待办/').first()).toBeVisible();
    await expect(page.locator('text=/In Progress|进行中/').first()).toBeVisible();
    await expect(page.locator('text=/Review|审核/').first()).toBeVisible();
    await expect(page.locator('text=/Done|已完成/').first()).toBeVisible();
  });

  test('should filter by assignee', async ({ page }) => {
    // Click on Pop filter
    await page.click('span:has-text("Pop")');
    
    // Check badge is selected
    const popBadge = page.locator('span:has-text("Pop")').first();
    // Badge should have different styling when selected
  });

  test('should have New Task button', async ({ page }) => {
    const newTaskBtn = page.locator('button:has-text("New Task"), button:has-text("新任务")');
    await expect(newTaskBtn).toBeVisible();
    await expect(newTaskBtn).toBeEnabled();
  });

  test('should have refresh button', async ({ page }) => {
    const refreshBtn = page.locator('button:has-text("刷新"), button:has-text("Refresh")');
    await expect(refreshBtn).toBeVisible();
    await expect(refreshBtn).toBeEnabled();
  });
});
