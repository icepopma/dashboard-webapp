import { NextRequest, NextResponse } from 'next/server';
import { SessionIdentityService } from '@/services/SessionIdentityService';
import { SessionIdentityCreateSchema } from '@/types/session-identity';

const sessionIdentityService = new SessionIdentityService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request (GP-002: Validate at boundaries)
    const parseResult = SessionIdentityCreateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid session identity request', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const create = parseResult.data;

    // Create session identity
    const identity = await sessionIdentityService.createSessionIdentity(create);

    // Log structured event (GP-003)
    console.log('[Session Identity Created]', {
      session_id: identity.session_id,
      task_type: identity.task_type,
      feature_id: identity.feature_id,
      layer: identity.layer,
    });

    return NextResponse.json({
      success: true,
      session_identity: identity,
    });

  } catch (error) {
    console.error('[Session Identity Error]', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const taskType = searchParams.get('task_type');

    if (sessionId) {
      // Parse session ID
      const parsed = sessionIdentityService.parseSessionId(sessionId);

      if (!parsed) {
        return NextResponse.json(
          { error: 'Invalid session ID format' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        session_id: sessionId,
        parsed,
      });
    } else if (taskType) {
      // Get all sessions for a task type
      const sessions = await sessionIdentityService.getSessionsForTask(taskType);

      return NextResponse.json({
        task_type: taskType,
        sessions,
        count: sessions.length,
      });
    } else {
      return NextResponse.json(
        { error: 'Missing session_id or task_type parameter' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Session Identity GET Error]', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
