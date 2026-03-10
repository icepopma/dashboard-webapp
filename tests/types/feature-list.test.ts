import { FeatureListSchema, FeatureStatusSchema } from '@/types/feature-list';
import { describe, test, expect } from '@jest/globals';

describe('FeatureList Types', () => {
  test('should validate valid feature status', () => {
    const validStatuses = ['pending', 'in_progress', 'complete', 'blocked', 'partial'];
    
    validStatuses.forEach(status => {
      const result = FeatureStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
    });
  });

  test('should reject invalid feature status', () => {
    const result = FeatureStatusSchema.safeParse('invalid_status');
    expect(result.success).toBe(false);
  });

  test('should validate valid feature item', () => {
    const feature = {
      id: 'feat-001',
      category: 'functional',
      description: 'Test feature',
      steps: ['Step 1', 'Step 2'],
      passes: false,
      priority: 'high',
      layer: 'service',
      attempts: 1,
      status: 'in_progress',
      completed_steps: 1,
      total_steps: 2,
    };

    const result = FeatureListSchema.safeParse(feature);
    expect(result.success).toBe(true);
  });

  test('should validate feature with optional fields', () => {
    const feature = {
      id: 'feat-002',
      category: 'functional',
      description: 'Test feature with optionals',
      steps: ['Step 1'],
      passes: true,
      priority: 'medium',
      layer: 'runtime',
      attempts: 0,
      status: 'complete',
      completed_steps: 1,
      total_steps: 1,
      commit: 'abc123',
      assigned_session: 'session-123',
      last_attempt: '2026-03-10T12:00:00Z',
    };

    const result = FeatureListSchema.safeParse(feature);
    expect(result.success).toBe(true);
  });

  test('should reject feature without required fields', () => {
    const feature = {
      id: 'feat-003',
      // missing required fields
    };

    const result = FeatureListSchema.safeParse(feature);
    expect(result.success).toBe(false);
  });

  test('should validate feature list response', () => {
    const response = {
      features: [
        {
          id: 'feat-001',
          category: 'functional',
          description: 'Feature 1',
          steps: ['Step 1'],
          passes: false,
          priority: 'high',
          layer: 'service',
          attempts: 1,
          status: 'in_progress',
          completed_steps: 0,
          total_steps: 1,
        },
      ],
      total: 1,
      last_updated: '2026-03-10T12:00:00Z',
    };

    expect(response.features).toHaveLength(1);
    expect(response.total).toBe(1);
  });
});
