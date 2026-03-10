/**
 * Feature List API Endpoint
 * 
 * GET /api/agent/features - List all features
 * POST /api/agent/features - Initialize features
 */

import { NextRequest, NextResponse } from 'next/server';
import { FeatureListService } from '@/services/FeatureListService';
import { FeatureItemSchema } from '@/types/feature-list';
import { z } from 'zod';

const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', message, ...data }));
  },
  error: (message: string, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', message, ...data }));
  },
};

/**
 * GET /api/agent/features
 * 
 * List all features
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    // Get specific feature by ID
    if (id) {
      const feature = FeatureListService.getFeatureById(id);
      if (!feature) {
        return NextResponse.json(
          { error: 'Feature not found', id },
          { status: 404 }
        );
      }
      return NextResponse.json({ feature });
    }

    // Get features by status
    if (status) {
      const features = FeatureListService.getFeaturesByStatus(status as any);
      return NextResponse.json({ 
        features, 
        total: features.length,
        filter: { status }
      });
    }

    // Get all features
    const result = FeatureListService.getAllFeatures();
    
    logger.info('Features listed', { total: result.total });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to list features', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Failed to list features' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent/features
 * 
 * Initialize features from escalation-protocol.json
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate features array
    const schema = z.object({
      features: z.array(FeatureItemSchema),
    });
    
    const validated = schema.parse(body);
    
    // Initialize features
    FeatureListService.initialize(validated.features);
    
    logger.info('Features initialized', { 
      count: validated.features.length 
    });

    return NextResponse.json({
      success: true,
      count: validated.features.length,
    });
  } catch (error) {
    logger.error('Failed to initialize features', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Failed to initialize features' },
      { status: 500 }
    );
  }
}
