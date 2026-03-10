import { Heartbeat, AgentStatus } from '@/types/heartbeat';

export class HeartbeatService {
  // In-memory storage (TODO: replace with database)
  private agentStatuses: Map<string, AgentStatus> = new Map();
  private discordWebhookUrl: string;
  private discordChannelId: string;

  constructor() {
    this.discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
    this.discordChannelId = process.env.DISCORD_CHANNEL_ID || '1479290254086111232'; // #agent-collaboration
  }

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

    const previousStatus = status.status;

    if (timeSinceLastHeartbeat > status.dead_threshold_seconds) {
      status.status = 'dead';
    } else if (timeSinceLastHeartbeat > status.stuck_threshold_seconds) {
      status.status = 'stuck';
    }

    // Notify if status changed to dead
    if (previousStatus !== 'dead' && status.status === 'dead') {
      await this.notifyDeadAgent(sessionId, status);
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

  async notifyDeadAgent(sessionId: string, status: AgentStatus): Promise<void> {
    const message = {
      content: `🚨 **Agent Dead Alert**
      
**Session**: ${sessionId}
**Last Heartbeat**: ${status.last_heartbeat}
**Current Feature**: ${status.current_feature || 'None'}
**Status**: Dead (no heartbeat for >3 minutes)

Please investigate and restart if needed.`,
    };

    console.log('[Heartbeat] Agent dead:', sessionId, message.content);

    // Try to send Discord notification
    if (this.discordWebhookUrl) {
      try {
        await fetch(this.discordWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

        console.log('[Heartbeat] Discord notification sent for dead agent:', sessionId);
      } catch (error) {
        console.error('[Heartbeat] Failed to send Discord notification:', error);
      }
    } else {
      console.log('[Heartbeat] Discord webhook not configured, skipping notification');
    }
  }
}
