import { SessionIdentityService } from '@/services/SessionIdentityService';

describe('SessionIdentityService', () => {
  let service: SessionIdentityService;

  beforeEach(() => {
    service = new SessionIdentityService();
  });

  test('should generate task-based session ID', () => {
    const create = {
      task_type: 'feat-001',
      feature_id: 'feat-001',
    };

    const sessionId = service.generateSessionId(create);

    expect(sessionId).toMatch(/^feat-001-\d{8}-[a-z0-9]{4}$/);
  });

  test('should parse session ID', () => {
    const sessionId = 'feat-001-20260310-a7b3';
    const parsed = service.parseSessionId(sessionId);

    expect(parsed).not.toBeNull();
    expect(parsed?.task_type).toBe('feat-001');
    expect(parsed?.timestamp).toBe('2026-03-10');
    expect(parsed?.random_suffix).toBe('a7b3');
  });

  test('should reject invalid session ID format', () => {
    const sessionId = 'invalid-format';
    const parsed = service.parseSessionId(sessionId);

    expect(parsed).toBeNull();
  });

  test('should match same task type', () => {
    const sessionId1 = 'feat-001-20260310-a7b3';
    const sessionId2 = 'feat-001-20260310-b4c5';

    const matches = service.matchesTaskType(sessionId1, sessionId2);

    expect(matches).toBe(true);
  });

  test('should not match different task type', () => {
    const sessionId1 = 'feat-001-20260310-a7b3';
    const sessionId2 = 'feat-002-20260310-b4c5';

    const matches = service.matchesTaskType(sessionId1, sessionId2);

    expect(matches).toBe(false);
  });

  test('should create session identity from create request', async () => {
    const create = {
      task_type: 'feat-001',
      feature_id: 'feat-001',
      layer: 'service' as const,
    };

    const identity = await service.createSessionIdentity(create);

    expect(identity.session_id).toMatch(/^feat-001-\d{8}-[a-z0-9]{4}$/);
    expect(identity.task_type).toBe('feat-001');
    expect(identity.feature_id).toBe('feat-001');
    expect(identity.layer).toBe('service');
  });
});
