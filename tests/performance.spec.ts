import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('home page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Home page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('all navigation items should be responsive', async ({ page }) => {
    await page.goto('/');
    
    const navItems = ['Tasks', 'Content', 'Calendar', 'Memory', 'Team', 'Office'];
    
    for (const item of navItems) {
      const startTime = Date.now();
      await page.click(`button:has-text("${item}"), button:has-text("${getChineseNav(item)}")`);
      await page.waitForLoadState('domcontentloaded');
      const clickTime = Date.now() - startTime;
      
      console.log(`${item} navigation time: ${clickTime}ms`);
      expect(clickTime).toBeLessThan(1000);
    }
  });

  test('tasks page should render quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('h2', { timeout: 5000 });
    const renderTime = Date.now() - startTime;
    
    console.log(`Tasks page render time: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(2000);
  });

  test('memory graph should initialize within 2 seconds', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Memory"), button:has-text("记忆")');
    
    const startTime = Date.now();
    await page.click('button:has-text("图谱"), button:has-text("Graph")');
    await page.waitForSelector('canvas', { timeout: 5000 });
    const initTime = Date.now() - startTime;
    
    console.log(`Memory graph initialization time: ${initTime}ms`);
    expect(initTime).toBeLessThan(2000);
  });

  test('office animations should be smooth', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Office"), button:has-text("办公室")');
    
    // Click gather button to trigger animations
    const gatherBtn = page.locator('button:has-text("Gather"), button:has-text("召集")');
    if (await gatherBtn.isVisible()) {
      const startTime = Date.now();
      await gatherBtn.click();
      await page.waitForTimeout(1100); // Wait for 1s animation
      const animTime = Date.now() - startTime;
      
      console.log(`Office gather animation time: ${animTime}ms`);
      expect(animTime).toBeLessThan(2000);
    }
  });

  test('should handle rapid navigation without memory leaks', async ({ page }) => {
    await page.goto('/');
    
    const initialMetrics = await page.metrics();
    
    // Rapid navigation
    for (let i = 0; i < 10; i++) {
      await page.click('button:has-text("Tasks"), button:has-text("任务")');
      await page.click('button:has-text("Home"), button:has-text("首页")');
    }
    
    const finalMetrics = await page.metrics();
    
    console.log('Initial JS heap size:', initialMetrics.JSHeapUsedSize);
    console.log('Final JS heap size:', finalMetrics.JSHeapUsedSize);
    
    // Memory should not grow more than 50%
    const memoryGrowth = (finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize) / initialMetrics.JSHeapUsedSize;
    expect(memoryGrowth).toBeLessThan(0.5);
  });
});

function getChineseNav(english: string): string {
  const map: Record<string, string> = {
    'Tasks': '任务',
    'Content': '内容',
    'Calendar': '日历',
    'Memory': '记忆',
    'Team': '团队',
    'Office': '办公室',
  };
  return map[english] || english;
}

test.describe('Bundle Size Tests', () => {
  test('should have reasonable bundle size', async ({ page }) => {
    await page.goto('/');
    
    // Get all script resources
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter((r: any) => r.name.includes('.js'))
        .map((r: any) => ({
          name: r.name.split('/').pop(),
          size: r.transferSize,
        }));
    });
    
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    console.log('Total JS bundle size:', (totalSize / 1024).toFixed(2), 'KB');
    console.log('JS resources:', resources);
    
    // Total JS should be under 2MB
    expect(totalSize).toBeLessThan(2 * 1024 * 1024);
  });
});
