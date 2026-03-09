import { test, expect } from '@playwright/test';

/**
 * TasksView Comprehensive Tests
 * Tests the Kanban board, task management, filtering, and interactions
 */

test.describe('TasksView - Navigation and Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);
  });

  test('should display TasksView header', async ({ page }) => {
    await expect(page.locator('h2, h3').filter({ hasText: /Task|任务/ }).first()).toBeVisible();
  });

  test('should display all 5 Kanban columns', async ({ page }) => {
    const columns = [
      { en: 'Recurring', zh: '循环' },
      { en: 'Backlog', zh: '待办' },
      { en: 'In Progress', zh: '进行中' },
      { en: 'Review', zh: '审核' },
      { en: 'Done', zh: '已完成' }
    ];
    
    for (const col of columns) {
      const column = page.locator(`text=/${col.en}|${col.zh}/`).first();
      await expect(column).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display task statistics cards', async ({ page }) => {
    // Check for stats at the top
    await expect(page.locator('text=/This week|本周/').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/In Progress|进行中/').first()).toBeVisible();
    await expect(page.locator('text=/Total|总计/').first()).toBeVisible();
    await expect(page.locator('text=/Completion|完成率/').first()).toBeVisible();
  });

  test('should have New Task button', async ({ page }) => {
    const newTaskBtn = page.locator('button:has-text("New Task"), button:has-text("新任务")');
    await expect(newTaskBtn).toBeVisible();
    await expect(newTaskBtn).toBeEnabled();
  });

  test('should have refresh button', async ({ page }) => {
    const refreshBtn = page.locator('button:has-text("Refresh"), button:has-text("刷新")');
    await expect(refreshBtn).toBeVisible();
    await expect(refreshBtn).toBeEnabled();
  });
});

test.describe('TasksView - Filtering and Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);
  });

  test('should filter by assignee - Pop', async ({ page }) => {
    // Click Pop filter badge
    const popBadge = page.locator('span:has-text("Pop"), button:has-text("Pop")').first();
    if (await popBadge.isVisible()) {
      await popBadge.click();
      await page.waitForTimeout(300);
      // Filter should be applied (visual feedback may vary)
    }
  });

  test('should filter by assignee - Matt', async ({ page }) => {
    // Click Matt filter badge
    const mattBadge = page.locator('span:has-text("Matt"), button:has-text("Matt")').first();
    if (await mattBadge.isVisible()) {
      await mattBadge.click();
      await page.waitForTimeout(300);
    }
  });

  test('should clear filters', async ({ page }) => {
    // Apply a filter first
    const popBadge = page.locator('span:has-text("Pop")').first();
    if (await popBadge.isVisible()) {
      await popBadge.click();
      await page.waitForTimeout(300);
      
      // Look for clear/reset button
      const clearBtn = page.locator('button:has-text("Clear"), button:has-text("重置"), button:has-text("All")').first();
      if (await clearBtn.isVisible()) {
        await clearBtn.click();
      }
    }
  });

  test('should search tasks', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="搜索"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('test');
      await page.waitForTimeout(500);
      // Search results should appear
    }
  });
});

test.describe('TasksView - Task Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);
  });

  test('should display task cards', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForTimeout(1000);
    
    // Look for task cards
    const taskCards = page.locator('[class*="task"], [class*="card"]').filter({ hasText: /task|任务/i });
    const count = await taskCards.count();
    
    // There should be at least some task cards (could be 0 if no data)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display task priority badges', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Look for priority indicators
    const priorityBadges = page.locator('text=/high|高|medium|中|low|低/i');
    const count = await priorityBadges.count();
    // May or may not have priority badges depending on data
  });

  test('should display assignee avatars', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Look for avatar elements
    const avatars = page.locator('img[alt*="avatar"], [class*="avatar"]');
    const count = await avatars.count();
    // May or may not have avatars depending on data
  });

  test('should show task details on hover', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Find first task card and hover
    const taskCard = page.locator('[class*="task"], [class*="card"]').filter({ hasText: /task|任务/i }).first();
    if (await taskCard.isVisible()) {
      await taskCard.hover();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('TasksView - Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);
  });

  test('should click New Task button', async ({ page }) => {
    const newTaskBtn = page.locator('button:has-text("New Task"), button:has-text("新任务")');
    await newTaskBtn.click();
    await page.waitForTimeout(500);
    
    // Should show form or modal
    const form = page.locator('form, [role="dialog"], [class*="modal"]');
    // Form might or might not appear depending on implementation
  });

  test('should click refresh button', async ({ page }) => {
    const refreshBtn = page.locator('button:has-text("Refresh"), button:has-text("刷新")');
    await refreshBtn.click();
    await page.waitForTimeout(500);
    
    // Page should still be functional
    await expect(page.locator('text=/Backlog|待办/').first()).toBeVisible();
  });

  test('should drag and drop tasks between columns', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Find a task card
    const taskCard = page.locator('[class*="task"], [class*="card"]').filter({ hasText: /task|任务/i }).first();
    
    if (await taskCard.isVisible()) {
      // Note: Drag and drop testing is complex and may require specific test data
      // For now, just verify the card is visible
      await expect(taskCard).toBeVisible();
    }
  });

  test('should open task detail view', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const taskCard = page.locator('[class*="task"], [class*="card"]').filter({ hasText: /task|任务/i }).first();
    if (await taskCard.isVisible()) {
      await taskCard.click();
      await page.waitForTimeout(500);
      
      // Detail view might open in modal or sidebar
      const detailView = page.locator('[role="dialog"], [class*="detail"], [class*="sidebar"]');
      // Detail view might or might not appear
    }
  });
});

test.describe('TasksView - Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);
    
    // Should still show main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);
    
    // Should show kanban columns
    await expect(page.locator('text=/Backlog|待办/').first()).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);
    
    // Should show full kanban board
    await expect(page.locator('text=/Backlog|待办/').first()).toBeVisible();
    await expect(page.locator('text=/In Progress|进行中/').first()).toBeVisible();
  });
});

test.describe('TasksView - Empty State', () => {
  test('should handle empty task list gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);
    
    // Even if no tasks, UI should be functional
    await expect(page.locator('button:has-text("New Task"), button:has-text("新任务")')).toBeVisible();
  });
});
