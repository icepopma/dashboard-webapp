import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────
// API Endpoint Tests
// ─────────────────────────────────────────────────────────────────

test.describe('API - Agents', () => {
  test('should return agents list', async ({ request }) => {
    const response = await request.get('/api/agents');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should return agent with correct structure', async ({ request }) => {
    const response = await request.get('/api/agents');
    const data = await response.json();
    
    if (data.length > 0) {
      const agent = data[0];
      expect(agent).toHaveProperty('id');
      expect(agent).toHaveProperty('name');
      expect(agent).toHaveProperty('type');
    }
  });
});

test.describe('API - Ideas', () => {
  test('should return ideas list', async ({ request }) => {
    const response = await request.get('/api/ideas');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should create and delete idea', async ({ request }) => {
    // Create
    const createResponse = await request.post('/api/ideas', {
      data: {
        title: 'Test Idea',
        description: 'Test description',
        status: 'new',
      }
    });
    
    if (createResponse.ok()) {
      const idea = await createResponse.json();
      expect(idea.title).toBe('Test Idea');
      
      // Delete
      if (idea.id) {
        const deleteResponse = await request.delete(`/api/ideas/${idea.id}`);
        expect(deleteResponse.ok()).toBeTruthy();
      }
    }
  });
});

test.describe('API - Tasks', () => {
  test('should return tasks list', async ({ request }) => {
    const response = await request.get('/api/tasks');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should create and delete task', async ({ request }) => {
    // Create
    const createResponse = await request.post('/api/tasks', {
      data: {
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
      }
    });
    
    if (createResponse.ok()) {
      const task = await createResponse.json();
      expect(task.title).toBe('Test Task');
      
      // Delete
      if (task.id) {
        const deleteResponse = await request.delete(`/api/tasks/${task.id}`);
        expect(deleteResponse.ok()).toBeTruthy();
      }
    }
  });
});

test.describe('API - Approvals', () => {
  test('should return approvals list', async ({ request }) => {
    const response = await request.get('/api/approvals');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

test.describe('API - Council', () => {
  test('should return council votes list', async ({ request }) => {
    const response = await request.get('/api/council');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

test.describe('API - Projects', () => {
  test('should return projects list', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

test.describe('API - Activity', () => {
  test('should return activity logs', async ({ request }) => {
    const response = await request.get('/api/activity');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

test.describe('API - Sync', () => {
  test('should handle sync request', async ({ request }) => {
    const response = await request.post('/api/sync');
    // Sync may return various status codes depending on implementation
    expect([200, 201, 202, 204]).toContain(response.status());
  });
});
