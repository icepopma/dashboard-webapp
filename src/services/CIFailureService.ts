import { CIFailure } from '@/types/ci-failure';

export interface InjectionResult {
  success: boolean;
  sessionId: string;
  message: string;
}

export class CIFailureService {
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

    // TODO: Implement actual injection via OpenClaw Hook Ingress
    // For now, return success
    return {
      success: true,
      sessionId,
      message: `CI failure injected to session ${sessionId}`,
    };
  }
}
