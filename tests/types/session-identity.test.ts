import { SessionIdentity, SessionIdentitySchema } from '@/types/session-identity';

describe('SessionIdentity Type', () => {
  test('should validate a valid session identity', () => {
    const validIdentity = {
      session_id: 'feat-001-20260310-a7b3',
      task_type: 'feat-001',
      task_id: 'feat-001',
      timestamp: '2026-03-10T03:00:00Z',
      random_suffix: 'a7b3',
      feature_id: 'feat-001',
      layer: 'service',
    };

    const result = SessionIdentitySchema.safeParse(validIdentity);
    expect(result.success).toBe(true);
  });

  test('should reject invalid session identity (missing required field)', () => {
    const invalidIdentity = {
      session_id: 'feat-001-20260310-a7b3',
      task_type: 'feat-001',
      // missing timestamp
      random_suffix: 'a7b3',
    };

    const result = SessionIdentitySchema.safeParse(invalidIdentity);
    expect(result.success).toBe(false);
  });

  test('should validate session ID format', () => {
    const identity = {
      session_id: 'invalid-format',
      task_type: 'feat-001',
      timestamp: '2026-03-10T03:00:00Z',
      random_suffix: 'a7b3',
    };

    const result = SessionIdentitySchema.safeParse(identity);
    expect(result.success).toBe(false);
  });
});
