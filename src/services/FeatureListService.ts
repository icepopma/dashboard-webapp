/**
 * Feature List Service
 * 
 * Manages feature tracking for escalation protocol
 * GP-002: Validate at boundaries
 * GP-003: Structured logging
 */

import { 
  FeatureItem, 
  FeatureListResponse, 
  FeaturePassRequest, 
  FeatureRetryRequest,
  FeatureStatus,
  FeatureItemSchema,
} from '@/types/feature-list';

const logger = {
  info: (message: string, data?: unknown) => {
    console.log(JSON.stringify({ level: 'info', message, ...data }));
  },
  error: (message: string, data?: unknown) => {
    console.error(JSON.stringify({ level: 'error', message, ...data }));
  },
};

/**
 * Feature List Service
 * 
 * In-memory storage for now, will be replaced with database later
 */
export class FeatureListService {
  private static features: Map<string, FeatureItem> = new Map();
  private static lastUpdated: string = new Date().toISOString();

  /**
   * Initialize features from escalation-protocol.json
   */
  static initialize(features: FeatureItem[]): void {
    features.forEach(feature => {
      const validated = FeatureItemSchema.parse(feature);
      this.features.set(feature.id, validated);
    });
    this.lastUpdated = new Date().toISOString();
    logger.info('Features initialized', { count: features.length });
  }

  /**
   * Get all features
   */
  static getAllFeatures(): FeatureListResponse {
    const features = Array.from(this.features.values());
    return {
      features,
      total: features.length,
      last_updated: this.lastUpdated,
    };
  }

  /**
   * Get feature by ID
   */
  static getFeatureById(id: string): FeatureItem | null {
    return this.features.get(id) || null;
  }

  /**
   * Get features by status
   */
  static getFeaturesByStatus(status: FeatureStatus): FeatureItem[] {
    return Array.from(this.features.values())
      .filter(f => f.status === status);
  }

  /**
   * Mark feature as passed
   */
  static markFeaturePassed(id: string, request: FeaturePassRequest): FeatureItem {
    const feature = this.features.get(id);
    if (!feature) {
      throw new Error(`Feature ${id} not found`);
    }

    const updated: FeatureItem = {
      ...feature,
      passes: true,
      status: 'complete',
      completed_steps: feature.total_steps,
      commit: request.commit || feature.commit,
      last_attempt: new Date().toISOString(),
    };

    this.features.set(id, FeatureItemSchema.parse(updated));
    this.lastUpdated = new Date().toISOString();

    logger.info('Feature marked as passed', { 
      feature_id: id, 
      commit: request.commit 
    });

    return updated;
  }

  /**
   * Mark feature for retry
   */
  static markFeatureRetry(id: string, request: FeatureRetryRequest): FeatureItem {
    const feature = this.features.get(id);
    if (!feature) {
      throw new Error(`Feature ${id} not found`);
    }

    const updated: FeatureItem = {
      ...feature,
      passes: false,
      status: 'in_progress',
      attempts: request.reset_attempts ? 0 : feature.attempts + 1,
      last_attempt: new Date().toISOString(),
    };

    if (request.reason) {
      updated.failure_reasons = [
        ...(feature.failure_reasons || []),
        request.reason,
      ];
    }

    this.features.set(id, FeatureItemSchema.parse(updated));
    this.lastUpdated = new Date().toISOString();

    logger.info('Feature marked for retry', { 
      feature_id: id, 
      attempts: updated.attempts 
    });

    return updated;
  }

  /**
   * Update feature progress
   */
  static updateProgress(id: string, completedSteps: number): FeatureItem {
    const feature = this.features.get(id);
    if (!feature) {
      throw new Error(`Feature ${id} not found`);
    }

    const status: FeatureStatus = 
      completedSteps === feature.total_steps ? 'complete' :
      completedSteps === 0 ? 'pending' :
      'in_progress';

    const updated: FeatureItem = {
      ...feature,
      completed_steps: completedSteps,
      status,
      last_attempt: new Date().toISOString(),
    };

    this.features.set(id, FeatureItemSchema.parse(updated));
    this.lastUpdated = new Date().toISOString();

    logger.info('Feature progress updated', { 
      feature_id: id, 
      completed_steps: completedSteps,
      total_steps: feature.total_steps,
    });

    return updated;
  }

  /**
   * Get feature statistics
   */
  static getStatistics(): {
    total: number;
    complete: number;
    in_progress: number;
    blocked: number;
    partial: number;
    pending: number;
  } {
    const features = Array.from(this.features.values());
    
    return {
      total: features.length,
      complete: features.filter(f => f.status === 'complete').length,
      in_progress: features.filter(f => f.status === 'in_progress').length,
      blocked: features.filter(f => f.status === 'blocked').length,
      partial: features.filter(f => f.status === 'partial').length,
      pending: features.filter(f => f.status === 'pending').length,
    };
  }
}
