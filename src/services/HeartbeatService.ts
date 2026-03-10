import { Heartbeat, AgentStatus } from '@/types/heartbeat';

export class HeartbeatService {
  // In-memory storage (TODO: replace with database)
  private agentStatuses: Map<string, AgentStatus> = new Map();

  async recordHeartbeat(heartbeat: Heartbeat): Promise<{ success: boolean; session_id: string }> {
    const existingStatus = this.agentStatuses.get(heartbeat.session_id);

    const agentStatus: AgentStatus = {
      session_id: heartbeat.session_id,
      last_heartbeat: heartbeat.timestamp,
      status: heartbeat.status,
      current_feature: heartbeat.current_feature,
      progress: heartbeat.progress,
      heartbeat_interval_seconds: 60,
      dead_threshold_seconds: 180, // 3 minutes
      stuck_threshold_seconds: 600, // 10 minutes
    };

    this.agentStatuses.set(heartbeat.session_id, agentStatus);

    return {
      success: true,
      session_id: heartbeat.session_id,
    };
  }

  async getAgentStatus(sessionId: string): Promise<AgentStatus | null> {
    const status = this.agentStatuses.get(sessionId);

    if (!status) {
      return null;
    }

    // Check if agent is dead (3 minutes no heartbeat)
    const lastHeartbeatTime = new Date(status.last_heartbeat).getTime();
    const now = Date.now();
    const timeSinceLastHeartbeat = (now - lastHeartbeatTime) / 1000; // seconds

    if (timeSinceLastHeartbeat > status.dead_threshold_seconds) {
      status.status = 'dead';
    } else if (timeSinceLastHeartbeat > status.stuck_threshold_seconds) {
      status.status = 'stuck';
    }

    return status;
  }

  async listAgents(): Promise<AgentStatus[]> {
    const agents = Array.from(this.agentStatuses.values());

    // Update status for each agent
    for (const agent of agents) {
      await this.getAgentStatus(agent.session_id);
    }

    return agents;
  }

  // TODO: Implement notification for dead agents
  async notifyDeadAgent(sessionId: string): Promise<void> {
    console.log('[Heartbeat] Agent dead:', sessionId);
    // TODO: Send notification to #agent-collaboration via Discord
  }
}
