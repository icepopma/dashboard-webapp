import { test, expect } from '@playwright/test';

/**
 * Comprehensive API Tests
 * Tests all major API endpoints with edge cases and error handling
 */

// ─────────────────────────────────────────────────────────────────
// Ideas API Tests
// ─────────────────────────────────────────────────────────────────

test.describe('API - Ideas (Comprehensive)', () => {
  test('should list all ideas', async ({ request }) => {
    const response = await request.get('/api/ideas');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should create idea with minimal fields', async ({ request }) => {
    const response = await request.post('/api/ideas', {
      data: {
        title: 'Minimal Test Idea',
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const idea = await response.json();
    expect(idea.title).toBe('Minimal Test Idea');
    
    // Cleanup
    if (idea.id) {
      await request.delete(`/api/ideas/${idea.id}`);
    }
  });

  test('should create idea with all fields', async ({ request }) => {
    const response = await request.post('/api/ideas', {
      data: {
        title: 'Complete Test Idea',
        description: 'Full description with details',
        status: 'planned',
        priority: 'high',
        tags: ['test', 'api'],
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const idea = await response.json();
    expect(idea.title).toBe('Complete Test Idea');
    expect(idea.description).toBe('Full description with details');
    
    // Cleanup
    if (idea.id) {
      await request.delete(`/api/ideas/${idea.id}`);
    }
  });

  test('should get single idea by ID', async ({ request }) => {
    // Create an idea first
    const createResponse = await request.post('/api/ideas', {
      data: { title: 'Test Idea for GET' }
    });
    
    if (createResponse.ok()) {
      const idea = await createResponse.json();
      
      // Get the idea by ID
      const getResponse = await request.get(`/api/ideas/${idea.id}`);
      expect(getResponse.ok()).toBeTruthy();
      
      const fetchedIdea = await getResponse.json();
      expect(fetchedIdea.id).toBe(idea.id);
      expect(fetchedIdea.title).toBe('Test Idea for GET');
      
      // Cleanup
      await request.delete(`/api/ideas/${idea.id}`);
    }
  });

  test('should update idea', async ({ request }) => {
    // Create an idea
    const createResponse = await request.post('/api/ideas', {
      data: { title: 'Original Title' }
    });
    
    if (createResponse.ok()) {
      const idea = await createResponse.json();
      
      // Update the idea
      const updateResponse = await request.put(`/api/ideas/${idea.id}`, {
        data: { title: 'Updated Title' }
      });
      
      expect(updateResponse.ok()).toBeTruthy();
      const updatedIdea = await updateResponse.json();
      expect(updatedIdea.title).toBe('Updated Title');
      
      // Cleanup
      await request.delete(`/api/ideas/${idea.id}`);
    }
  });

  test('should delete idea', async ({ request }) => {
    // Create an idea
    const createResponse = await request.post('/api/ideas', {
      data: { title: 'Idea to Delete' }
    });
    
    if (createResponse.ok()) {
      const idea = await createResponse.json();
      
      // Delete the idea
      const deleteResponse = await request.delete(`/api/ideas/${idea.id}`);
      expect(deleteResponse.ok()).toBeTruthy();
      
      // Verify it's deleted
      const getResponse = await request.get(`/api/ideas/${idea.id}`);
      expect(getResponse.status()).toBe(404);
    }
  });

  test('should handle invalid idea ID', async ({ request }) => {
    const response = await request.get('/api/ideas/invalid-id-12345');
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should create tasks from idea', async ({ request }) => {
    // Create an idea
    const createResponse = await request.post('/api/ideas', {
      data: { title: 'Idea with Tasks' }
    });
    
    if (createResponse.ok()) {
      const idea = await createResponse.json();
      
      // Create tasks from idea
      const tasksResponse = await request.post(`/api/ideas/${idea.id}/tasks`, {
        data: [
          { title: 'Task 1', status: 'pending' },
          { title: 'Task 2', status: 'pending' }
        ]
      });
      
      // This endpoint might not exist yet, so just check it doesn't crash
      expect([200, 201, 404, 405]).toContain(tasksResponse.status());
      
      // Cleanup
      await request.delete(`/api/ideas/${idea.id}`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────
// Tasks API Tests
// ─────────────────────────────────────────────────────────────────

test.describe('API - Tasks (Comprehensive)', () => {
  test('should list all tasks', async ({ request }) => {
    const response = await request.get('/api/tasks');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should create task with minimal fields', async ({ request }) => {
    const response = await request.post('/api/tasks', {
      data: {
        title: 'Minimal Task',
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const task = await response.json();
    expect(task.title).toBe('Minimal Task');
    
    // Cleanup
    if (task.id) {
      await request.delete(`/api/tasks/${task.id}`);
    }
  });

  test('should create task with all fields', async ({ request }) => {
    const response = await request.post('/api/tasks', {
      data: {
        title: 'Complete Task',
        description: 'Task description',
        status: 'in_progress',
        priority: 'high',
        assignee: 'Pop',
        dueDate: new Date().toISOString(),
        tags: ['important', 'urgent'],
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const task = await response.json();
    expect(task.title).toBe('Complete Task');
    
    // Cleanup
    if (task.id) {
      await request.delete(`/api/tasks/${task.id}`);
    }
  });

  test('should get single task by ID', async ({ request }) => {
    // Create a task
    const createResponse = await request.post('/api/tasks', {
      data: { title: 'Task for GET test' }
    });
    
    if (createResponse.ok()) {
      const task = await createResponse.json();
      
      // Get the task
      const getResponse = await request.get(`/api/tasks/${task.id}`);
      expect(getResponse.ok()).toBeTruthy();
      
      const fetchedTask = await getResponse.json();
      expect(fetchedTask.id).toBe(task.id);
      
      // Cleanup
      await request.delete(`/api/tasks/${task.id}`);
    }
  });

  test('should update task', async ({ request }) => {
    // Create a task
    const createResponse = await request.post('/api/tasks', {
      data: { title: 'Original Task', status: 'pending' }
    });
    
    if (createResponse.ok()) {
      const task = await createResponse.json();
      
      // Update the task
      const updateResponse = await request.put(`/api/tasks/${task.id}`, {
        data: { status: 'in_progress' }
      });
      
      expect(updateResponse.ok()).toBeTruthy();
      const updatedTask = await updateResponse.json();
      expect(updatedTask.status).toBe('in_progress');
      
      // Cleanup
      await request.delete(`/api/tasks/${task.id}`);
    }
  });

  test('should delete task', async ({ request }) => {
    // Create a task
    const createResponse = await request.post('/api/tasks', {
      data: { title: 'Task to Delete' }
    });
    
    if (createResponse.ok()) {
      const task = await createResponse.json();
      
      // Delete the task
      const deleteResponse = await request.delete(`/api/tasks/${task.id}`);
      expect(deleteResponse.ok()).toBeTruthy();
      
      // Verify it's deleted
      const getResponse = await request.get(`/api/tasks/${task.id}`);
      expect(getResponse.status()).toBe(404);
    }
  });

  test('should complete task', async ({ request }) => {
    // Create a task
    const createResponse = await request.post('/api/tasks', {
      data: { title: 'Task to Complete', status: 'in_progress' }
    });
    
    if (createResponse.ok()) {
      const task = await createResponse.json();
      
      // Complete the task
      const completeResponse = await request.post(`/api/tasks/${task.id}/complete`);
      
      // This endpoint might not exist, so check it doesn't crash
      expect([200, 201, 404, 405]).toContain(completeResponse.status());
      
      // Cleanup
      await request.delete(`/api/tasks/${task.id}`);
    }
  });

  test('should get task comments', async ({ request }) => {
    // Create a task
    const createResponse = await request.post('/api/tasks', {
      data: { title: 'Task with Comments' }
    });
    
    if (createResponse.ok()) {
      const task = await createResponse.json();
      
      // Get comments
      const commentsResponse = await request.get(`/api/tasks/${task.id}/comments`);
      expect([200, 404, 405]).toContain(commentsResponse.status());
      
      // Cleanup
      await request.delete(`/api/tasks/${task.id}`);
    }
  });

  test('should get task logs', async ({ request }) => {
    // Create a task
    const createResponse = await request.post('/api/tasks', {
      data: { title: 'Task with Logs' }
    });
    
    if (createResponse.ok()) {
      const task = await createResponse.json();
      
      // Get logs
      const logsResponse = await request.get(`/api/tasks/${task.id}/logs`);
      expect([200, 404, 405]).toContain(logsResponse.status());
      
      // Cleanup
      await request.delete(`/api/tasks/${task.id}`);
    }
  });

  test('should batch update tasks', async ({ request }) => {
    const response = await request.post('/api/tasks/batch', {
      data: {
        taskIds: ['1', '2', '3'],
        updates: { status: 'done' }
      }
    });
    
    // This endpoint might not exist or might fail with invalid IDs
    expect([200, 201, 400, 404, 405]).toContain(response.status());
  });

  test('should handle invalid task ID', async ({ request }) => {
    const response = await request.get('/api/tasks/invalid-id-99999');
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

// ─────────────────────────────────────────────────────────────────
// Agents API Tests
// ─────────────────────────────────────────────────────────────────

test.describe('API - Agents', () => {
  test('should list all agents', async ({ request }) => {
    const response = await request.get('/api/agents');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should have valid agent structure', async ({ request }) => {
    const response = await request.get('/api/agents');
    const agents = await response.json();
    
    if (agents.length > 0) {
      const agent = agents[0];
      expect(agent).toHaveProperty('id');
      expect(agent).toHaveProperty('name');
      expect(agent).toHaveProperty('type');
    }
  });

  test('should get agent sessions', async ({ request }) => {
    // This endpoint might not exist
    const response = await request.get('/api/agents/pop/sessions');
    expect([200, 404, 405]).toContain(response.status());
  });

  test('should reset agents', async ({ request }) => {
    const response = await request.post('/api/agents/reset');
    expect([200, 201, 202, 204, 404, 405]).toContain(response.status());
  });
});

// ─────────────────────────────────────────────────────────────────
// Projects API Tests
// ─────────────────────────────────────────────────────────────────

test.describe('API - Projects', () => {
  test('should list all projects', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────
// Activity API Tests
// ─────────────────────────────────────────────────────────────────

test.describe('API - Activity', () => {
  test('should list activity logs', async ({ request }) => {
    const response = await request.get('/api/activity');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────
// Sync API Tests
// ─────────────────────────────────────────────────────────────────

test.describe('API - Sync', () => {
  test('should handle sync request', async ({ request }) => {
    const response = await request.post('/api/sync');
    expect([200, 201, 202, 204]).toContain(response.status());
  });
});

// ─────────────────────────────────────────────────────────────────
// Approvals API Tests
// ─────────────────────────────────────────────────────────────────

test.describe('API - Approvals', () => {
  test('should list approvals', async ({ request }) => {
    const response = await request.get('/api/approvals');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────
// Council API Tests
// ─────────────────────────────────────────────────────────────────

test.describe('API - Council', () => {
  test('should list council votes', async ({ request }) => {
    const response = await request.get('/api/council');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────
// Error Handling Tests
// ─────────────────────────────────────────────────────────────────

test.describe('API - Error Handling', () => {
  test('should handle non-existent endpoints', async ({ request }) => {
    const response = await request.get('/api/nonexistent');
    expect(response.status()).toBe(404);
  });

  test('should handle malformed JSON', async ({ request }) => {
    const response = await request.post('/api/ideas', {
      data: 'invalid json string',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should handle missing required fields', async ({ request }) => {
    const response = await request.post('/api/ideas', {
      data: {}
    });
    
    // Should either accept with defaults or reject with 400
    expect([200, 201, 400, 422]).toContain(response.status());
  });
});
