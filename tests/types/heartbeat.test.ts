import { Heartbeat, HeartbeatSchema } from '@/types/heartbeat';

describe('Heartbeat Type', () => {
  test('should validate a valid heartbeat', () => {
    const validHeartbeat = {
      session_id: 'coding-20260310-a7b3',
      timestamp: '2026-03-10T00:00:00Z',
      status: 'running',
      current_feature: 'feat-001',
    };

    const result = HeartbeatSchema.safeParse(validHeartbeat);
    expect(result.success).toBe(true);
  });

  test('should reject invalid status', () => {
    const invalidHeartbeat = {
      session_id: 'coding-20260310-a7b3',
      timestamp: '2026-03-10T00:00:00Z',
      status: 'invalid_status', // not in enum
      current_feature: 'feat-001',
    };

    const result = HeartbeatSchema.safeParse(invalidHeartbeat);
    expect(result.success).toBe(false);
  });

  test('should validate heartbeat with optional fields', () => {
    const heartbeatWithOptional = {
      session_id: 'coding-20260310-a7b3',
      timestamp: '2026-03-10T00:00:00Z',
      status: 'running',
      current_feature: 'feat-001',
      progress: 50,
      message: 'Implementing feature',
    };

    const result = HeartbeatSchema.safeParse(heartbeatWithOptional);
    expect(result.success).toBe(true);
  });
});
