import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Projects"), button:has-text("项目")');
  });

  test('should display projects header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/项目|Projects/);
  });

  test('should display new project button', async ({ page }) => {
    await expect(page.locator('button:has-text("New Project"), button:has-text("新项目")')).toBeVisible();
  });

  test('should display view mode toggle', async ({ page }) => {
    // Check for view mode buttons
    await expect(page.locator('button, [class*="rounded"]').filter({ hasText: /卡片|Card/ }).first()).toBeVisible();
  });

  test('should display project cards', async ({ page }) => {
    await page.waitForTimeout(500);
    const projectCards = page.locator('[class*="Card"], [class*="card"]');
    await expect(projectCards.first()).toBeVisible();
  });

  test('should display project progress bars', async ({ page }) => {
    const progressBars = page.locator('[class*="h-2"][class*="rounded-full"], [class*="h-"][class*="bg-"]');
    await expect(progressBars.first()).toBeVisible();
  });

  test('should switch to milestones view', async ({ page }) => {
    // Click milestones view button
    const milestonesBtn = page.locator('button').filter({ hasText: /里程碑|Milestone|Flag/ }).first();
    if (await milestonesBtn.isVisible()) {
      await milestonesBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('should switch to gantt view', async ({ page }) => {
    // Click gantt view button
    const ganttBtn = page.locator('button').filter({ hasText: /甘特|Gantt/ }).first();
    if (await ganttBtn.isVisible()) {
      await ganttBtn.click();
      await page.waitForTimeout(300);
      // Should show coming soon message
      await expect(page.locator('text=/开发中|coming soon/i').first()).toBeVisible();
    }
  });

  test('should toggle archived projects', async ({ page }) => {
    const archiveBtn = page.locator('button:has-text("归档"), button:has-text("Archive")');
    if (await archiveBtn.isVisible()) {
      await archiveBtn.click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Docs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Docs"), button:has-text("文档")');
  });

  test('should display docs header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/文档|Docs/);
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="搜索"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display file tree', async ({ page }) => {
    await expect(page.locator('text=/文件|File|浏览器|Explorer/').first()).toBeVisible();
  });

  test('should display file list', async ({ page }) => {
    await page.waitForTimeout(500);
    // Check for file items
    const fileItems = page.locator('[class*="cursor-pointer"]').filter({ hasText: /\.md|\.json|\.ts/ });
    await expect(fileItems.first()).toBeVisible();
  });

  test('should select a file and show content', async ({ page }) => {
    await page.waitForTimeout(500);
    // Click on a file
    const fileItem = page.locator('text=.md').first();
    if (await fileItem.isVisible()) {
      await fileItem.click();
      await page.waitForTimeout(300);
      // Content area should be visible
      await expect(page.locator('[class*="flex-1"]').first()).toBeVisible();
    }
  });

  test('should display edit button when file selected', async ({ page }) => {
    await page.waitForTimeout(500);
    // Select a file first
    const fileItem = page.locator('text=.md').first();
    if (await fileItem.isVisible()) {
      await fileItem.click();
      await page.waitForTimeout(300);
      // Edit button should be visible
      const editBtn = page.locator('button:has-text("Edit"), button:has-text("编辑")');
      await expect(editBtn).toBeVisible();
    }
  });

  test('should enter edit mode', async ({ page }) => {
    await page.waitForTimeout(500);
    const fileItem = page.locator('text=.md').first();
    if (await fileItem.isVisible()) {
      await fileItem.click();
      await page.waitForTimeout(300);
      
      const editBtn = page.locator('button:has-text("Edit"), button:has-text("编辑")');
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForTimeout(300);
        // Should show textarea or save button
        await expect(page.locator('button:has-text("Save"), button:has-text("保存")').first()).toBeVisible();
      }
    }
  });
});

test.describe('People Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("People"), button:has-text("人员")');
  });

  test('should display people header', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/人员|People/);
  });

  test('should display invite button', async ({ page }) => {
    await expect(page.locator('button:has-text("Invite"), button:has-text("邀请")')).toBeVisible();
  });

  test('should display people cards', async ({ page }) => {
    await page.waitForTimeout(500);
    const peopleCards = page.locator('[class*="Card"], [class*="card"]');
    await expect(peopleCards.first()).toBeVisible();
  });

  test('should display user roles', async ({ page }) => {
    await expect(page.locator('text=/Owner|所有者|AI Assistant|助手/').first()).toBeVisible();
  });

  test('should display status badges', async ({ page }) => {
    await expect(page.locator('text=/online|在线/').first()).toBeVisible();
  });
});
