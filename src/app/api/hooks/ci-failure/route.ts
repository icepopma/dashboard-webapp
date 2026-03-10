import { NextRequest, NextResponse } from 'next/server';
import { CIFailureService } from '@/services/CIFailureService';

const ciFailureService = new CIFailureService();

export async function POST(request: NextRequest) {
  try {
    // Validate headers (GP-002: Validate at boundaries)
    const eventType = request.headers.get('X-GitHub-Event');
    if (!eventType) {
      return NextResponse.json(
        { error: 'Missing X-GitHub-Event header' },
        { status: 400 }
      );
    }

    // Parse body
    const body = await request.json();

    // Only process failed workflow runs
    if (body.action !== 'completed' || body.workflow_run?.conclusion !== 'failure') {
      return NextResponse.json({
        success: true,
        message: 'Ignoring non-failure event',
      });
    }

    // Extract CI failure data
    const ciFailure = {
      ci_run_id: body.workflow_run.id.toString(),
      repository: body.workflow_run.repository.full_name,
      branch: body.workflow_run.head_branch,
      commit_sha: body.workflow_run.head_sha,
      status: 'failed' as const,
      message: `Workflow ${body.workflow_run.name || 'unknown'} failed`,
      timestamp: body.workflow_run.created_at,
      workflow: body.workflow_run.name,
      logs_url: body.workflow_run.html_url,
    };

    // Log structured event (GP-003)
    console.log('[CI Failure]', {
      ci_run_id: ciFailure.ci_run_id,
      repository: ciFailure.repository,
      branch: ciFailure.branch,
    });

    // Inject to agent session via OpenClaw Hook Ingress
    const sessionId = `ci-failure:${ciFailure.ci_run_id}`;
    const injectionResult = await ciFailureService.injectToAgent(ciFailure, sessionId);

    return NextResponse.json({
      success: injectionResult.success,
      message: injectionResult.message,
      ci_failure: ciFailure,
      session_id: injectionResult.sessionId,
    });

  } catch (error) {
    console.error('[CI Failure Error]', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
