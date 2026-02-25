import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────
// Team View Tests
// ─────────────────────────────────────────────────────────────────

test.describe('Team View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Team"), button:has-text("团队")');
  });

  test('should display team header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/Team|团队/i);
  });

  test('should display team members', async ({ page }) => {
    await page.waitForTimeout(500);
    
    // Check for member cards
    const members = page.locator('[class*="card"]').filter({ hasText: /Pop|Codex|Claude|Quill|Echo|Scout|Pixel/ });
    await expect(members.first()).toBeVisible();
  });

  test('should display member roles', async ({ page }) => {
    const roles = page.locator('text=/Orchestrator|Developer|Writer|Researcher|Designer|QA/i');
    await expect(roles.first()).toBeVisible();
  });

  test('should display online status', async ({ page }) => {
    const status = page.locator('text=/online|offline|空闲|运行/i');
    await expect(status.first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────
// Office View Tests
// ─────────────────────────────────────────────────────────────────

test.describe('Office View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Office"), button:has-text("办公室")');
  });

  test('should display office header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/Office|办公室/i);
  });

  test('should display activity feed', async ({ page }) => {
    await page.waitForTimeout(500);
    
    const activities = page.locator('text=/completed|started|created|完成|开始|创建/i');
    await expect(activities.first()).toBeVisible();
  });

  test('should display agent workspace', async ({ page }) => {
    const workspace = page.locator('[class*="grid"], [class*="flex"]');
    await expect(workspace.first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────
// Memory View Tests
// ─────────────────────────────────────────────────────────────────

test.describe('Memory View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Memory"), button:has-text("记忆")');
  });

  test('should display memory header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/Memory|记忆|Log/i);
  });

  test('should display activity logs', async ({ page }) => {
    await page.waitForTimeout(500);
    
    // Check for log entries
    const logs = page.locator('[class*="log"], [class*="entry"], [class*="item"]');
    await expect(logs.first()).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
    }
  });

  test('should display log timestamps', async ({ page }) => {
    const timestamps = page.locator('text=/\\d{4}-\\d{2}-\\d{2}|\\d{1,2}:\\d{2}/');
    await expect(timestamps.first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────
// Pipeline View Tests
// ─────────────────────────────────────────────────────────────────

test.describe('Pipeline View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Pipeline"), button:has-text("流水线")');
  });

  test('should display pipeline header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/Pipeline|流水线/i);
  });

  test('should display pipeline stages', async ({ page }) => {
    await page.waitForTimeout(500);
    
    // Check for stage columns
    const stages = page.locator('text=/Idea|Planning|Development|Review|Done|想法|规划|开发|审核|完成/i');
    await expect(stages.first()).toBeVisible();
  });

  test('should display pipeline items', async ({ page }) => {
    const items = page.locator('[class*="card"], [class*="item"]');
    await expect(items.first()).toBeVisible();
  });

  test('should have create pipeline button', async ({ page }) => {
    const createBtn = page.locator('button:has-text("New"), button:has-text("新建")');
    await expect(createBtn.first()).toBeVisible();
  });
});
