/**
 * Feature Pass API Endpoint
 * 
 * POST /api/agent/features/:id/pass - Mark feature as passed
 */

import { NextRequest, NextResponse } from 'next/server';
import { FeatureListService } from '@/services/FeatureListService';
import { FeaturePassRequestSchema } from '@/types/feature-list';

const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', message, ...data }));
  },
  error: (message: string, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', message, ...data }));
  },
};

/**
 * POST /api/agent/features/:id/pass
 * 
 * Mark feature as passed
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate request body
    const body = await request.json();
    const validated = FeaturePassRequestSchema.parse(body);
    
    // Mark feature as passed
    const feature = FeatureListService.markFeaturePassed(id, validated);
    
    logger.info('Feature marked as passed', { 
      feature_id: id,
      commit: validated.commit 
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
    
    logger.error('Failed to mark feature as passed', { 
      feature_id: params.id,
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Failed to mark feature as passed' },
      { status: 500 }
    );
  }
}
