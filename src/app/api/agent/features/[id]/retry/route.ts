/**
 * Feature Retry API Endpoint
 * 
 * POST /api/agent/features/:id/retry - Mark feature for retry
 */

import { NextRequest, NextResponse } from 'next/server';
import { FeatureListService } from '@/services/FeatureListService';
import { FeatureRetryRequestSchema } from '@/types/feature-list';

const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', message, ...data }));
  },
  error: (message: string, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', message, ...data }));
  },
};

/**
 * POST /api/agent/features/:id/retry
 * 
 * Mark feature for retry
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate request body
    const body = await request.json();
    const validated = FeatureRetryRequestSchema.parse(body);
    
    // Mark feature for retry
    const feature = FeatureListService.markFeatureRetry(id, validated);
    
    logger.info('Feature marked for retry', { 
      feature_id: id,
      attempts: feature.attempts,
      reason: validated.reason
    });

    return NextResponse.json({
      success: true,
      feature,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Feature not found', id: params.id },
        { status: 404 }
      );
    }
    
    logger.error('Failed to mark feature for retry', { 
      feature_id: params.id,
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Failed to mark feature for retry' },
      { status: 500 }
    );
  }
}
