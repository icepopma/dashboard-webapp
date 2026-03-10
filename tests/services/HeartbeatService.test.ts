import { HeartbeatService } from '@/services/HeartbeatService';
import { Heartbeat } from '@/types/heartbeat';

describe('HeartbeatService', () => {
  let service: HeartbeatService;

  beforeEach(() => {
    service = new HeartbeatService();
  });

  test('should record heartbeat', async () => {
    const heartbeat: Heartbeat = {
      session_id: 'test-session-001',
      timestamp: new Date().toISOString(),
      status: 'running',
      current_feature: 'feat-001',
    };

    const result = await service.recordHeartbeat(heartbeat);

    expect(result.success).toBe(true);
    expect(result.session_id).toBe('test-session-001');
  });

  test('should get agent status', async () => {
    const heartbeat: Heartbeat = {
      session_id: 'test-session-002',
      timestamp: new Date().toISOString(),
      status: 'running',
      current_feature: 'feat-001',
    };

    await service.recordHeartbeat(heartbeat);
    const status = await service.getAgentStatus('test-session-002');

    expect(status).toBeDefined();
    expect(status?.session_id).toBe('test-session-002');
    expect(status?.status).toBe('running');
  });

  test('should detect dead agent (3 minutes no heartbeat)', async () => {
    const heartbeat: Heartbeat = {
      session_id: 'test-session-003',
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 minutes ago
      status: 'running',
      current_feature: 'feat-001',
    };

    await service.recordHeartbeat(heartbeat);
    const status = await service.getAgentStatus('test-session-003');

    expect(status?.status).toBe('dead');
  });

  test('should detect stuck agent (10 minutes no progress)', async () => {
    const heartbeat: Heartbeat = {
      session_id: 'test-session-004',
      timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(), // 11 minutes ago
      status: 'running',
      current_feature: 'feat-001',
    };

    await service.recordHeartbeat(heartbeat);
    const status = await service.getAgentStatus('test-session-004');

    expect(status?.status).toBe('stuck');
  });

  test('should list all agents', async () => {
    const heartbeat1: Heartbeat = {
      session_id: 'test-session-005',
      timestamp: new Date().toISOString(),
      status: 'running',
      current_feature: 'feat-001',
    };

    const heartbeat2: Heartbeat = {
      session_id: 'test-session-006',
      timestamp: new Date().toISOString(),
      status: 'idle',
      current_feature: null,
    };

    await service.recordHeartbeat(heartbeat1);
    await service.recordHeartbeat(heartbeat2);

    const agents = await service.listAgents();

    expect(agents.length).toBeGreaterThanOrEqual(2);
    expect(agents.find(a => a.session_id === 'test-session-005')).toBeDefined();
    expect(agents.find(a => a.session_id === 'test-session-006')).toBeDefined();
  });
});
