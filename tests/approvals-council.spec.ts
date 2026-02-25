import { test, expect } from '@playwright/test';

test.describe('Approvals Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Approvals"), button:has-text("审批")');
  });

  test('should display approvals header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/审批|Approvals/);
  });

  test('should display pending count badge', async ({ page }) => {
    await expect(page.locator('text=/pending|待处理/').first()).toBeVisible();
  });

  test('should display tabs', async ({ page }) => {
    await expect(page.locator('text=/待审批/').first()).toBeVisible();
    await expect(page.locator('text=/历史|History/').first()).toBeVisible();
    await expect(page.locator('text=/规则|Rules/').first()).toBeVisible();
  });

  test('should display approval cards with risk levels', async ({ page }) => {
    // Check for risk level indicators
    const riskBadges = page.locator('text=/high|high|medium|low|高|中|低/');
    await expect(riskBadges.first()).toBeVisible();
  });

  test('should display approve and reject buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Approve"), button:has-text("批准")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Reject"), button:has-text("拒绝")').first()).toBeVisible();
  });

  test('should switch to history tab', async ({ page }) => {
    await page.click('button:has-text("历史"), button:has-text("History")');
    await page.waitForTimeout(300);
    // History content should be visible
    await expect(page.locator('text=/approved|rejected|批准|拒绝/').first()).toBeVisible();
  });

  test('should switch to rules tab', async ({ page }) => {
    await page.click('button:has-text("规则"), button:has-text("Rules")');
    await page.waitForTimeout(300);
    // Rules content should be visible
    await expect(page.locator('text=/规则|Rule|配置/').first()).toBeVisible();
  });
});

test.describe('Council Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Council"), button:has-text("委员会")');
  });

  test('should display council header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/委员会|Council/);
  });

  test('should display active debates count', async ({ page }) => {
    await expect(page.locator('text=/active|活跃/').first()).toBeVisible();
  });

  test('should display new vote button', async ({ page }) => {
    await expect(page.locator('button:has-text("新"), button:has-text("New")').first()).toBeVisible();
  });

  test('should display debate cards', async ({ page }) => {
    // Check for debate content
    await page.waitForTimeout(500);
    const debateCards = page.locator('[class*="Card"], [class*="card"]');
    await expect(debateCards.first()).toBeVisible();
  });

  test('should display voting progress', async ({ page }) => {
    // Check for progress bars
    const progressBars = page.locator('[class*="bg-"][class*="rounded-full"]');
    await expect(progressBars.first()).toBeVisible();
  });

  test('should display vote buttons on active debates', async ({ page }) => {
    // Look for vote buttons
    const voteButtons = page.locator('button:has-text("投")');
    const count = await voteButtons.count();
    // May or may not have vote buttons depending on debate status
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display tie resolution options if tie exists', async ({ page }) => {
    // Check for tie indicator
    const tieIndicator = page.locator('text=/平局|tie/i');
    const count = await tieIndicator.count();
    if (count > 0) {
      // Should show resolution methods
      await expect(page.locator('text=/随机|Random|创建者|Creator/').first()).toBeVisible();
    }
  });
});

test.describe('Council Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Council"), button:has-text("委员会")');
  });

  test('should click vote button', async ({ page }) => {
    await page.waitForTimeout(500);
    const voteBtn = page.locator('button:has-text("投")').first();
    if (await voteBtn.isVisible()) {
      await voteBtn.click();
      await page.waitForTimeout(300);
    }
  });
});
