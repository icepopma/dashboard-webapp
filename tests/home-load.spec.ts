import { test, expect } from '@playwright/test';

/**
 * Home Page Load Tests
 * Tests initial app loading, navigation, and view rendering
 */

test.describe('Initial Page Load', () => {
  test('should load the app successfully', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the sidebar is visible (main navigation)
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that at least one view is loaded (default is PopView)
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display sidebar navigation items', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check main navigation items exist
    const navItems = [
      'Pop', 'Home', 'Tasks', 'Pipeline', 'Calendar',
      'Team', 'Office', 'Approvals', 'Council', 'Projects', 'Docs', 'People', 'Memory'
    ];
    
    for (const item of navItems) {
      const navButton = page.locator(`button:has-text("${item}"), [role="tab"]:has-text("${item}")`);
      const count = await navButton.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should load default view (PopView)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that PopView content is visible
    await expect(page.locator('text=/Pop|AI Assistant|Agent/').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have keyboard shortcuts button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check keyboard shortcuts help button exists
    const helpButton = page.locator('button[aria-label*="keyboard"], button:has-text("?")');
    await expect(helpButton.first()).toBeVisible();
  });
});

test.describe('View Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Home view', async ({ page }) => {
    await page.click('button:has-text("Home")');
    await page.waitForTimeout(500);
    
    // Verify home view content loaded
    await expect(page.locator('text=/欢迎|Welcome|Mission Control|Today/').first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Tasks view', async ({ page }) => {
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);
    
    // Verify tasks view content loaded
    await expect(page.locator('text=/Backlog|待办|In Progress|进行中|Done|已完成/').first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Pipeline view', async ({ page }) => {
    await page.click('button:has-text("Pipeline")');
    await page.waitForTimeout(500);
    
    // Verify pipeline view loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to Calendar view', async ({ page }) => {
    await page.click('button:has-text("Calendar")');
    await page.waitForTimeout(500);
    
    // Verify calendar view loaded
    await expect(page.locator('text=/Calendar|日历|Month|Week/').first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Team view', async ({ page }) => {
    await page.click('button:has-text("Team")');
    await page.waitForTimeout(500);
    
    // Verify team view loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to Office view', async ({ page }) => {
    await page.click('button:has-text("Office")');
    await page.waitForTimeout(500);
    
    // Verify office view loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to Approvals view', async ({ page }) => {
    await page.click('button:has-text("Approvals")');
    await page.waitForTimeout(500);
    
    // Verify approvals view loaded
    await expect(page.locator('text=/Approval|审批|Council|投票/').first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Projects view', async ({ page }) => {
    await page.click('button:has-text("Projects")');
    await page.waitForTimeout(500);
    
    // Verify projects view loaded
    await expect(page.locator('text=/Project|项目/').first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Docs view', async ({ page }) => {
    await page.click('button:has-text("Docs")');
    await page.waitForTimeout(500);
    
    // Verify docs view loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to People view', async ({ page }) => {
    await page.click('button:has-text("People")');
    await page.waitForTimeout(500);
    
    // Verify people view loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to Memory view', async ({ page }) => {
    await page.click('button:has-text("Memory")');
    await page.waitForTimeout(500);
    
    // Verify memory view loaded
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Page Performance', () => {
  test('should load initial page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('should lazy load views efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to a different view and measure load time
    const startTime = Date.now();
    await page.click('button:has-text("Tasks")');
    await page.waitForSelector('text=/Backlog|待办|In Progress/', { timeout: 5000 });
    const loadTime = Date.now() - startTime;
    
    // View should load within 2 seconds (lazy loaded)
    expect(loadTime).toBeLessThan(2000);
  });
});

test.describe('Error Handling', () => {
  test('should handle slow network gracefully', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Page should still load
    await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });
  });
});
