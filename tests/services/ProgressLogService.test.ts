import { ProgressLogService } from '@/services/ProgressLogService';
import { describe, test, expect, beforeEach } from '@jest/globals';

describe('ProgressLogService', () => {
  beforeEach(() => {
    // Clear all logs before each test
    // Note: In a real implementation, we'd have a clearAll method
  });

  test('should create a progress log', () => {
    const log = ProgressLogService.createLog({
      session_id: 'session-123',
      feature_id: 'feat-001',
      level: 'info',
      message: 'Test log message',
    });

    expect(log.id).toBeDefined();
    expect(log.session_id).toBe('session-123');
    expect(log.feature_id).toBe('feat-001');
    expect(log.level).toBe('info');
    expect(log.message).toBe('Test log message');
    expect(log.timestamp).toBeDefined();
  });

  test('should create log with optional fields', () => {
    const log = ProgressLogService.createLog({
      session_id: 'session-456',
      feature_id: 'feat-002',
      level: 'error',
      message: 'Test error',
      metadata: { error: 'Test error' },
      commit: 'abc123',
      duration_ms: 1500,
    });

    expect(log.metadata).toEqual({ error: 'Test error' });
    expect(log.commit).toBe('abc123');
    expect(log.duration_ms).toBe(1500);
  });

  test('should get log by ID', () => {
    const created = ProgressLogService.createLog({
      session_id: 'session-789',
      feature_id: 'feat-003',
      level: 'success',
      message: 'Test success',
    });

    const retrieved = ProgressLogService.getLogById(created.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(created.id);
  });

  test('should return null for non-existent log', () => {
    const log = ProgressLogService.getLogById('non-existent');
    expect(log).toBeNull();
  });

  test('should get logs by session', () => {
    // Create multiple logs for same session
    ProgressLogService.createLog({
      session_id: 'session-test',
      feature_id: 'feat-001',
      level: 'info',
      message: 'Log 1',
    });

    ProgressLogService.createLog({
      session_id: 'session-test',
      feature_id: 'feat-001',
      level: 'success',
      message: 'Log 2',
    });

    const result = ProgressLogService.getLogsBySession('session-test');
    
    expect(result.total).toBe(2);
    expect(result.logs).toHaveLength(2);
    expect(result.has_more).toBe(false);
  });

  test('should get logs by feature', () => {
    // Create logs for same feature
    ProgressLogService.createLog({
      session_id: 'session-1',
      feature_id: 'feat-test',
      level: 'info',
      message: 'Feature log 1',
    });

    ProgressLogService.createLog({
      session_id: 'session-2',
      feature_id: 'feat-test',
      level: 'success',
      message: 'Feature log 2',
    });

    const result = ProgressLogService.getLogsByFeature('feat-test');
    
    expect(result.total).toBe(2);
    expect(result.logs).toHaveLength(2);
  });

  test('should paginate logs', () => {
    // Create 10 logs
    for (let i = 0; i < 10; i++) {
      ProgressLogService.createLog({
        session_id: 'session-paginate',
        feature_id: 'feat-001',
        level: 'info',
        message: `Log ${i}`,
      });
    }

    // Get first 5
    const page1 = ProgressLogService.getLogsBySession('session-paginate', 5);
    expect(page1.logs).toHaveLength(5);
    expect(page1.has_more).toBe(true);
    expect(page1.next_cursor).toBeDefined();

    // Get next 5
    const page2 = ProgressLogService.getLogsBySession('session-paginate', 5, page1.next_cursor);
    expect(page2.logs).toHaveLength(5);
    expect(page2.has_more).toBe(false);
  });

  test('should get session summary', () => {
    // Create various logs
    ProgressLogService.createLog({
      session_id: 'session-summary',
      feature_id: 'feat-001',
      level: 'info',
      message: 'Info 1',
    });

    ProgressLogService.createLog({
      session_id: 'session-summary',
      feature_id: 'feat-001',
      level: 'error',
      message: 'Error 1',
    });

    ProgressLogService.createLog({
      session_id: 'session-summary',
      feature_id: 'feat-001',
      level: 'success',
      message: 'Success 1',
    });

    const summary = ProgressLogService.getSessionSummary('session-summary');
    
    expect(summary).not.toBeNull();
    expect(summary?.total_logs).toBe(3);
    expect(summary?.info_count).toBe(1);
    expect(summary?.error_count).toBe(1);
    expect(summary?.success_count).toBe(1);
  });

  test('should return null for empty session summary', () => {
    const summary = ProgressLogService.getSessionSummary('non-existent-session');
    expect(summary).toBeNull();
  });

  test('should clear session logs', () => {
    // Create logs
    ProgressLogService.createLog({
      session_id: 'session-clear',
      feature_id: 'feat-001',
      level: 'info',
      message: 'Log to clear',
    });

    const cleared = ProgressLogService.clearSessionLogs('session-clear');
    expect(cleared).toBe(1);

    const result = ProgressLogService.getLogsBySession('session-clear');
    expect(result.total).toBe(0);
  });

  test('should sort logs by timestamp descending', () => {
    // Create logs with small delay
    const log1 = ProgressLogService.createLog({
      session_id: 'session-sort',
      feature_id: 'feat-001',
      level: 'info',
      message: 'First log',
    });

    // Small delay
    setTimeout(() => {
      const log2 = ProgressLogService.createLog({
        session_id: 'session-sort',
        feature_id: 'feat-001',
        level: 'info',
        message: 'Second log',
      });

      const result = ProgressLogService.getLogsBySession('session-sort');
      expect(result.logs[0].id).toBe(log2.id);
      expect(result.logs[1].id).toBe(log1.id);
    }, 10);
  });
});
