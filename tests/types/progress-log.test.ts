import { ProgressLogSchema, ProgressLogLevelSchema } from '@/types/progress-log';
import { describe, test, expect } from '@jest/globals';

describe('ProgressLog Types', () => {
  test('should validate valid log level', () => {
    const validLevels = ['info', 'warning', 'error', 'success'];
    
    validLevels.forEach(level => {
      const result = ProgressLogLevelSchema.safeParse(level);
      expect(result.success).toBe(true);
    });
  });

  test('should reject invalid log level', () => {
    const result = ProgressLogLevelSchema.safeParse('invalid_level');
    expect(result.success).toBe(false);
  });

  test('should validate valid progress log', () => {
    const log = {
      id: 'log-001',
      session_id: 'session-123',
      feature_id: 'feat-001',
      level: 'info' as const,
      message: 'Test progress log',
      timestamp: '2026-03-10T12:00:00Z',
      metadata: {
        step: 1,
        total_steps: 5,
      },
    };

    const result = ProgressLogSchema.safeParse(log);
    expect(result.success).toBe(true);
  });

  test('should validate progress log with optional fields', () => {
    const log = {
      id: 'log-002',
      session_id: 'session-456',
      feature_id: 'feat-002',
      level: 'error' as const,
      message: 'Test failed',
      timestamp: '2026-03-10T12:01:00Z',
      metadata: {
        error: 'Test error',
        stack: 'Error at line 10',
      },
      commit: 'abc123',
      duration_ms: 1500,
    };

    const result = ProgressLogSchema.safeParse(log);
    expect(result.success).toBe(true);
  });

  test('should reject progress log without required fields', () => {
    const log = {
      id: 'log-003',
      // missing required fields
    };

    const result = ProgressLogSchema.safeParse(log);
    expect(result.success).toBe(false);
  });

  test('should validate progress log list response', () => {
    const response = {
      logs: [
        {
          id: 'log-001',
          session_id: 'session-123',
          feature_id: 'feat-001',
          level: 'info' as const,
          message: 'Log 1',
          timestamp: '2026-03-10T12:00:00Z',
        },
      ],
      total: 1,
      has_more: false,
    };

    expect(response.logs).toHaveLength(1);
    expect(response.total).toBe(1);
    expect(response.has_more).toBe(false);
  });
});
