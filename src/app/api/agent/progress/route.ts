/**
 * Progress Log API Endpoint
 * 
 * GET /api/agent/progress - List progress logs
 * POST /api/agent/progress - Create progress log
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgressLogService } from '@/services/ProgressLogService';
import { CreateProgressLogRequestSchema } from '@/types/progress-log';

const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', message, ...data }));
  },
  error: (message: string, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', message, ...data }));
  },
};

/**
 * GET /api/agent/progress
 * 
 * List progress logs
 * Query params:
 * - session_id: Filter by session
 * - feature_id: Filter by feature
 * - limit: Number of logs to return (default: 100)
 * - cursor: Pagination cursor
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');
    const featureId = searchParams.get('feature_id');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const cursor = searchParams.get('cursor') || undefined;

    let result;

    if (sessionId) {
      // Get logs by session
      result = ProgressLogService.getLogsBySession(sessionId, limit, cursor);
    } else if (featureId) {
      // Get logs by feature
      result = ProgressLogService.getLogsByFeature(featureId, limit, cursor);
    } else {
      // Get all logs
      result = ProgressLogService.getAllLogs(limit, cursor);
    }

    logger.info('Progress logs listed', { 
      total: result.total,
      session_id: sessionId,
      feature_id: featureId,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to list progress logs', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Failed to list progress logs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent/progress
 * 
 * Create a new progress log
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validated = CreateProgressLogRequestSchema.parse(body);
    
    // Create log
    const log = ProgressLogService.createLog(validated);
    
    logger.info('Progress log created', { 
      log_id: log.id,
      session_id: log.session_id,
      feature_id: log.feature_id,
      level: log.level,
    });

    return NextResponse.json({
      success: true,
      log,
    }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create progress log', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Failed to create progress log' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agent/progress
 * 
 * Clear logs for a session
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const count = ProgressLogService.clearSessionLogs(sessionId);
    
    logger.info('Session logs cleared', { 
      session_id: sessionId,
      count,
    });

    return NextResponse.json({
      success: true,
      cleared: count,
    });
  } catch (error) {
    logger.error('Failed to clear session logs', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Failed to clear session logs' },
      { status: 500 }
    );
  }
}
