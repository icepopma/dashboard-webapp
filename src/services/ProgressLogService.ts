/**
 * Progress Log Service
 * 
 * Tracks agent progress for escalation protocol
 * GP-002: Validate at boundaries
 * GP-003: Structured logging
 */

import { 
  ProgressLog, 
  ProgressLogListResponse,
  CreateProgressLogRequest,
  ProgressSummary,
  ProgressLogLevel,
  ProgressLogSchema,
} from '@/types/progress-log';

const logger = {
  info: (message: string, data?: unknown) => {
    console.log(JSON.stringify({ level: 'info', message, ...data }));
  },
  error: (message: string, data?: unknown) => {
    console.error(JSON.stringify({ level: 'error', message, ...data }));
  },
};

/**
 * Progress Log Service
 * 
 * In-memory storage for now, will be replaced with database later
 */
export class ProgressLogService {
  private static logs: Map<string, ProgressLog> = new Map();
  private static logsBySession: Map<string, string[]> = new Map();
  private static logsByFeature: Map<string, string[]> = new Map();

  /**
   * Create a new progress log
   */
  static createLog(request: CreateProgressLogRequest): ProgressLog {
    const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const log: ProgressLog = {
      id,
      session_id: request.session_id,
      feature_id: request.feature_id,
      level: request.level,
      message: request.message,
      timestamp: new Date().toISOString(),
      metadata: request.metadata,
      commit: request.commit,
      duration_ms: request.duration_ms,
      parent_log_id: request.parent_log_id,
    };

    // Validate
    const validated = ProgressLogSchema.parse(log);

    // Store log
    this.logs.set(id, validated);

    // Index by session
    if (!this.logsBySession.has(request.session_id)) {
      this.logsBySession.set(request.session_id, []);
    }
    this.logsBySession.get(request.session_id)!.push(id);

    // Index by feature
    if (!this.logsByFeature.has(request.feature_id)) {
      this.logsByFeature.set(request.feature_id, []);
    }
    this.logsByFeature.get(request.feature_id)!.push(id);

    logger.info('Progress log created', { 
      log_id: id, 
      session_id: request.session_id,
      feature_id: request.feature_id,
      level: request.level,
    });

    return validated;
  }

  /**
   * Get log by ID
   */
  static getLogById(id: string): ProgressLog | null {
    return this.logs.get(id) || null;
  }

  /**
   * Get logs by session
   */
  static getLogsBySession(
    sessionId: string, 
    limit: number = 100,
    cursor?: string
  ): ProgressLogListResponse {
    const logIds = this.logsBySession.get(sessionId) || [];
    const logs = logIds
      .map(id => this.logs.get(id)!)
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply cursor
    const startIndex = cursor 
      ? logs.findIndex(l => l.id === cursor) + 1 
      : 0;

    const paginatedLogs = logs.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < logs.length;
    const nextCursor = hasMore && paginatedLogs.length > 0 
      ? paginatedLogs[paginatedLogs.length - 1].id 
      : undefined;

    return {
      logs: paginatedLogs,
      total: logs.length,
      has_more: hasMore,
      next_cursor: nextCursor,
    };
  }

  /**
   * Get logs by feature
   */
  static getLogsByFeature(
    featureId: string,
    limit: number = 100,
    cursor?: string
  ): ProgressLogListResponse {
    const logIds = this.logsByFeature.get(featureId) || [];
    const logs = logIds
      .map(id => this.logs.get(id)!)
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply cursor
    const startIndex = cursor 
      ? logs.findIndex(l => l.id === cursor) + 1 
      : 0;

    const paginatedLogs = logs.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < logs.length;
    const nextCursor = hasMore && paginatedLogs.length > 0 
      ? paginatedLogs[paginatedLogs.length - 1].id 
      : undefined;

    return {
      logs: paginatedLogs,
      total: logs.length,
      has_more: hasMore,
      next_cursor: nextCursor,
    };
  }

  /**
   * Get all logs
   */
  static getAllLogs(
    limit: number = 100,
    cursor?: string
  ): ProgressLogListResponse {
    const logs = Array.from(this.logs.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply cursor
    const startIndex = cursor 
      ? logs.findIndex(l => l.id === cursor) + 1 
      : 0;

    const paginatedLogs = logs.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < logs.length;
    const nextCursor = hasMore && paginatedLogs.length > 0 
      ? paginatedLogs[paginatedLogs.length - 1].id 
      : undefined;

    return {
      logs: paginatedLogs,
      total: logs.length,
      has_more: hasMore,
      next_cursor: nextCursor,
    };
  }

  /**
   * Get progress summary for a session
   */
  static getSessionSummary(sessionId: string): ProgressSummary | null {
    const logIds = this.logsBySession.get(sessionId);
    if (!logIds || logIds.length === 0) {
      return null;
    }

    const logs = logIds.map(id => this.logs.get(id)!).filter(Boolean);
    const lastLog = logs.reduce((latest, current) => 
      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
    );

    // Calculate total duration if available
    const durationMs = logs.reduce((sum, log) => 
      sum + (log.duration_ms || 0), 0
    );

    return {
      session_id: sessionId,
      feature_id: logs[0].feature_id,
      total_logs: logs.length,
      error_count: logs.filter(l => l.level === 'error').length,
      warning_count: logs.filter(l => l.level === 'warning').length,
      success_count: logs.filter(l => l.level === 'success').length,
      info_count: logs.filter(l => l.level === 'info').length,
      last_updated: lastLog.timestamp,
      duration_ms: durationMs > 0 ? durationMs : undefined,
    };
  }

  /**
   * Clear logs for a session
   */
  static clearSessionLogs(sessionId: string): number {
    const logIds = this.logsBySession.get(sessionId) || [];
    
    logIds.forEach(id => {
      const log = this.logs.get(id);
      if (log) {
        // Remove from feature index
        const featureLogs = this.logsByFeature.get(log.feature_id);
        if (featureLogs) {
          const index = featureLogs.indexOf(id);
          if (index > -1) {
            featureLogs.splice(index, 1);
          }
        }
        this.logs.delete(id);
      }
    });

    this.logsBySession.delete(sessionId);

    logger.info('Session logs cleared', { 
      session_id: sessionId, 
      count: logIds.length 
    });

    return logIds.length;
  }
}
