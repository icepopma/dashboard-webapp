import { CIFailure } from '@/types/ci-failure';

export interface InjectionResult {
  success: boolean;
  sessionId: string;
  message: string;
}

export class CIFailureService {
  private openclawHookUrl: string;
  private openclawHookToken: string;

  constructor() {
    // OpenClaw Hook Ingress configuration
    this.openclawHookUrl = process.env.OPENCLAW_HOOK_URL || 'http://localhost:18789/hooks/agent';
    this.openclawHookToken = process.env.OPENCLAW_HOOK_TOKEN || '';
  }

  formatForAgent(failure: CIFailure): string {
    const parts = [
      '# CI Failure Detected',
      '',
      `**CI Run**: ${failure.ci_run_id}`,
      `**Repository**: ${failure.repository}`,
      `**Branch**: ${failure.branch}`,
      `**Commit**: ${failure.commit_sha}`,
      `**Status**: ${failure.status}`,
      `**Message**: ${failure.message}`,
      `**Timestamp**: ${failure.timestamp}`,
    ];

    if (failure.workflow) {
      parts.push(`**Workflow**: ${failure.workflow}`);
    }

    if (failure.step) {
      parts.push(`**Step**: ${failure.step}`);
    }

    if (failure.logs_url) {
      parts.push(`**Logs**: ${failure.logs_url}`);
    }

    parts.push('');
    parts.push('## Action Required');
    parts.push('Please investigate and fix the CI failure. Run tests locally before pushing.');

    return parts.join('\n');
  }

  async injectToAgent(failure: CIFailure, sessionId: string): Promise<InjectionResult> {
    const message = this.formatForAgent(failure);

    // If OpenClaw Hook Token is configured, inject via Hook Ingress
    if (this.openclawHookToken) {
      try {
        const response = await fetch(this.openclawHookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openclawHookToken}`,
          },
          body: JSON.stringify({
            message: message,
            agentId: 'codex', // Route to coding agent
            sessionKey: `ci-failure:${failure.ci_run_id}`,
            wakeMode: 'now',
            deliver: true,
            channel: 'discord',
            to: '1477517730713305273', // #research-scout
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenClaw Hook failed: ${response.status}`);
        }

        return {
          success: true,
          sessionId: `ci-failure:${failure.ci_run_id}`,
          message: `CI failure injected to agent via OpenClaw Hook`,
        };
      } catch (error) {
        console.error('[CI Failure Injection Error]', error);
        return {
          success: false,
          sessionId,
          message: `Failed to inject CI failure: ${error}`,
        };
      }
    }

    // Fallback: Return success (TODO mode)
    return {
      success: true,
      sessionId,
      message: `CI failure injected to session ${sessionId} (TODO: OpenClaw Hook not configured)`,
    };
  }
}
