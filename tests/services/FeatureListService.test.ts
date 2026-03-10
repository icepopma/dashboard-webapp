import { FeatureListService } from '@/services/FeatureListService';
import { FeatureItemSchema } from '@/types/feature-list';
import { describe, test, expect, beforeEach } from '@jest/globals';

describe('FeatureListService', () => {
  const mockFeature = {
    id: 'feat-001',
    category: 'functional',
    description: 'Test feature',
    steps: ['Step 1', 'Step 2'],
    passes: false,
    priority: 'high' as const,
    layer: 'service' as const,
    attempts: 0,
    status: 'pending' as const,
    completed_steps: 0,
    total_steps: 2,
  };

  beforeEach(() => {
    // Reset service state
    FeatureListService.initialize([mockFeature]);
  });

  test('should initialize features', () => {
    const result = FeatureListService.getAllFeatures();
    expect(result.total).toBe(1);
    expect(result.features[0].id).toBe('feat-001');
  });

  test('should get feature by ID', () => {
    const feature = FeatureListService.getFeatureById('feat-001');
    expect(feature).not.toBeNull();
    expect(feature?.id).toBe('feat-001');
  });

  test('should return null for non-existent feature', () => {
    const feature = FeatureListService.getFeatureById('feat-999');
    expect(feature).toBeNull();
  });

  test('should get features by status', () => {
    const pending = FeatureListService.getFeaturesByStatus('pending');
    expect(pending).toHaveLength(1);
    
    const complete = FeatureListService.getFeaturesByStatus('complete');
    expect(complete).toHaveLength(0);
  });

  test('should mark feature as passed', () => {
    const result = FeatureListService.markFeaturePassed('feat-001', {
      commit: 'abc123',
      notes: 'All tests passing',
    });

    expect(result.passes).toBe(true);
    expect(result.status).toBe('complete');
    expect(result.completed_steps).toBe(2);
    expect(result.commit).toBe('abc123');
  });

  test('should mark feature for retry', () => {
    const result = FeatureListService.markFeatureRetry('feat-001', {
      reason: 'Test failed',
      reset_attempts: false,
    });

    expect(result.passes).toBe(false);
    expect(result.status).toBe('in_progress');
    expect(result.attempts).toBe(1);
    expect(result.failure_reasons).toContain('Test failed');
  });

  test('should reset attempts when requested', () => {
    // First, mark for retry to increment attempts
    FeatureListService.markFeatureRetry('feat-001', {
      reset_attempts: false,
    });

    // Then reset attempts
    const result = FeatureListService.markFeatureRetry('feat-001', {
      reset_attempts: true,
    });

    expect(result.attempts).toBe(0);
  });

  test('should update progress', () => {
    const result = FeatureListService.updateProgress('feat-001', 1);

    expect(result.completed_steps).toBe(1);
    expect(result.status).toBe('in_progress');
  });

  test('should mark complete when all steps done', () => {
    const result = FeatureListService.updateProgress('feat-001', 2);

    expect(result.completed_steps).toBe(2);
    expect(result.status).toBe('complete');
  });

  test('should get statistics', () => {
    const stats = FeatureListService.getStatistics();

    expect(stats.total).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.complete).toBe(0);
    expect(stats.in_progress).toBe(0);
  });

  test('should throw error for non-existent feature operations', () => {
    expect(() => {
      FeatureListService.markFeaturePassed('feat-999', {});
    }).toThrow('Feature feat-999 not found');

    expect(() => {
      FeatureListService.markFeatureRetry('feat-999', {});
    }).toThrow('Feature feat-999 not found');

    expect(() => {
      FeatureListService.updateProgress('feat-999', 1);
    }).toThrow('Feature feat-999 not found');
  });

  test('should update last_updated timestamp', () => {
    const before = FeatureListService.getAllFeatures().last_updated;
    
    // Wait a bit to ensure timestamp difference
    setTimeout(() => {
      FeatureListService.markFeaturePassed('feat-001', {});
      const after = FeatureListService.getAllFeatures().last_updated;
      expect(after).not.toBe(before);
    }, 10);
  });
});
