import { SessionIdentity, SessionIdentityCreate } from '@/types/session-identity';

export class SessionIdentityService {
  /**
   * Generate a task-based session ID
   * Format: {task_type}-{YYYYMMDD}-{random}
   */
  generateSessionId(create: SessionIdentityCreate): string {
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomSuffix = this.generateRandomSuffix();

    return `${create.task_type}-${dateStr}-${randomSuffix}`;
  }

  /**
   * Parse a session ID into its components
   */
  parseSessionId(sessionId: string): SessionIdentity | null {
    const parts = sessionId.split('-');

    if (parts.length < 3) {
      return null;
    }

    const randomSuffix = parts[parts.length - 1];
    const dateStr = parts[parts.length - 2];
    const taskType = parts.slice(0, parts.length - 2).join('-');

    // Validate date format (YYYYMMDD)
    if (!/^\d{8}$/.test(dateStr)) {
      return null;
    }

    // Validate random suffix (4 characters)
    if (randomSuffix.length !== 4) {
      return null;
    }

    // Parse date
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const timestamp = `${year}-${month}-${day}T00:00:00Z`;

    return {
      session_id: sessionId,
      task_type: taskType,
      timestamp,
      random_suffix: randomSuffix,
    };
  }

  /**
   * Validate a session ID
   */
  validateSessionId(sessionId: string): boolean {
    const parsed = this.parseSessionId(sessionId);
    return parsed !== null;
  }

  /**
   * Generate a random 4-character suffix
   */
  private generateRandomSuffix(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return suffix;
  }

  /**
   * Create a full session identity
   */
  createSessionIdentity(create: SessionIdentityCreate): SessionIdentity {
    const sessionId = this.generateSessionId(create);
    const timestamp = new Date().toISOString();

    return {
      session_id: sessionId,
      task_type: create.task_type,
      task_id: create.task_id,
      timestamp,
      random_suffix: sessionId.split('-').pop() || '',
      feature_id: create.feature_id,
      layer: create.layer,
      parent_session_id: create.parent_session_id,
      metadata: create.metadata,
    };
  }

  /**
   * Check if two sessions are working on the same task
   */
  isSameTask(sessionId1: string, sessionId2: string): boolean {
    const parsed1 = this.parseSessionId(sessionId1);
    const parsed2 = this.parseSessionId(sessionId2);

    if (!parsed1 || !parsed2) {
      return false;
    }

    return parsed1.task_type === parsed2.task_type;
  }

  /**
   * Get all sessions for a task type
   */
  async getSessionsForTask(taskType: string): Promise<SessionIdentity[]> {
    // TODO: Implement database query
    // For now, return empty array
    return [];
  }
}
