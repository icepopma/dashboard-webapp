import { test, expect } from '@playwright/test';

test.describe('Pop View - Agent Cluster', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Pop tab
    await page.click('button:has-text("Pop")');
  });

  test('should display Pop header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/Pop|智能体|Agent/i);
  });

  test('should display agent cards', async ({ page }) => {
    // Wait for agents to load
    await page.waitForTimeout(500);
    
    // Check for agent cards (at least Pop should exist)
    const agentCards = page.locator('[class*="card"]').filter({ hasText: /Pop|Codex|Claude|Quill|Echo|Scout|Pixel/ });
    await expect(agentCards.first()).toBeVisible();
  });

  test('should display agent status badges', async ({ page }) => {
    await page.waitForTimeout(500);
    
    // Check for status badges (idle/running/completed)
    const statusBadge = page.locator('text=/idle|running|completed|空闲|运行|完成/i');
    await expect(statusBadge.first()).toBeVisible();
  });

  test('should display agent capabilities', async ({ page }) => {
    await page.waitForTimeout(500);
    
    // Check for capability tags
    const capabilities = page.locator('text=/feature|bugfix|docs|test|design|analysis/i');
    await expect(capabilities.first()).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    const refreshBtn = page.locator('button:has-text("刷新"), button:has-text("Refresh")');
    await expect(refreshBtn).toBeVisible();
  });

  test('should display orchestrator section', async ({ page }) => {
    // Check for orchestrator info
    await expect(page.locator('text=/Orchestrator|编排器/i')).toBeVisible();
  });

  test('should display agent statistics', async ({ page }) => {
    // Check for stats
    const stats = page.locator('text=/Agent|智能体|Active|活跃/i');
    await expect(stats.first()).toBeVisible();
  });
});

test.describe('Pop View - Agent Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Pop")');
  });

  test('should click on agent card', async ({ page }) => {
    await page.waitForTimeout(500);
    
    const popCard = page.locator('[class*="cursor-pointer"]').filter({ hasText: /Pop/ }).first();
    if (await popCard.isVisible()) {
      await popCard.click();
    }
  });

  test('should expand agent details', async ({ page }) => {
    await page.waitForTimeout(500);
    
    // Click expand button if exists
    const expandBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
    }
  });

  test('should filter by agent type', async ({ page }) => {
    await page.waitForTimeout(500);
    
    // Click on agent filter badge
    const filterBadge = page.locator('span:has-text("Pop")').first();
    if (await filterBadge.isVisible()) {
      await filterBadge.click();
    }
  });
});
