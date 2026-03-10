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
      status: 'failed',
      message: `Workflow ${body.workflow_run.name || 'unknown'} failed`,
      timestamp: body.workflow_run.created_at,
    };

    // Log structured event (GP-003)
    console.log('[CI Failure]', {
      ci_run_id: ciFailure.ci_run_id,
      repository: ciFailure.repository,
      branch: ciFailure.branch,
    });

    // TODO: Inject to agent session (will be implemented with feat-002)
    // For now, just acknowledge receipt
    return NextResponse.json({
      success: true,
      message: `CI failure received: ${ciFailure.ci_run_id}`,
      ci_failure: ciFailure,
    });

  } catch (error) {
    console.error('[CI Failure Error]', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
