import { NextRequest, NextResponse } from 'next/server';
import { HeartbeatService } from '@/services/HeartbeatService';
import { HeartbeatSchema } from '@/types/heartbeat';

const heartbeatService = new HeartbeatService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate heartbeat (GP-002: Validate at boundaries)
    const parseResult = HeartbeatSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid heartbeat', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const heartbeat = parseResult.data;

    // Record heartbeat
    const result = await heartbeatService.recordHeartbeat(heartbeat);

    // Log structured event (GP-003)
    console.log('[Heartbeat Received]', {
      session_id: heartbeat.session_id,
      status: heartbeat.status,
      feature: heartbeat.current_feature,
      timestamp: heartbeat.timestamp,
    });

    return NextResponse.json({
      success: true,
      session_id: result.session_id,
      message: 'Heartbeat recorded',
    });

  } catch (error) {
    console.error('[Heartbeat Error]', { error: String(error) });
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

    if (sessionId) {
      // Get specific agent status
      const status = await heartbeatService.getAgentStatus(sessionId);

      if (!status) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(status);
    } else {
      // List all agents
      const agents = await heartbeatService.listAgents();

      return NextResponse.json({
        agents,
        count: agents.length,
      });
    }

  } catch (error) {
    console.error('[Heartbeat GET Error]', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
