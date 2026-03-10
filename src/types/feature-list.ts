/**
 * Feature List Types (GP-002: Validate at boundaries)
 * 
 * Manages feature tracking for escalation protocol
 */

import { z } from 'zod';

/**
 * Feature status enum
 */
export const FeatureStatusSchema = z.enum([
  'pending',      // Not started
  'in_progress',  // Currently being worked on
  'complete',     // All steps done
  'blocked',      // Waiting on dependencies
  'partial',      // Some steps done
]);

export type FeatureStatus = z.infer<typeof FeatureStatusSchema>;

/**
 * Feature priority enum
 */
export const FeaturePrioritySchema = z.enum(['high', 'medium', 'low']);

export type FeaturePriority = z.infer<typeof FeaturePrioritySchema>;

/**
 * Layer enum (matching architecture constraints)
 */
export const LayerSchema = z.enum([
  'types',
  'config',
  'repo',
  'service',
  'runtime',
  'ui',
]);

export type Layer = z.infer<typeof LayerSchema>;

/**
 * Feature item schema
 */
export const FeatureItemSchema = z.object({
  id: z.string().regex(/^feat-\d{3}$/, 'Feature ID must be feat-XXX format'),
  category: z.string(),
  description: z.string(),
  steps: z.array(z.string()),
  passes: z.boolean(),
  priority: FeaturePrioritySchema,
  layer: LayerSchema,
  attempts: z.number().int().min(0),
  status: FeatureStatusSchema,
  completed_steps: z.number().int().min(0),
  total_steps: z.number().int().min(1),
  
  // Optional fields
  commit: z.string().optional(),
  assigned_session: z.string().optional(),
  last_attempt: z.string().datetime().optional(),
  failure_reasons: z.array(z.string()).optional(),
  blocking: z.array(z.string()).optional(),
  artifacts: z.record(z.string()).optional(),
});

export type FeatureItem = z.infer<typeof FeatureItemSchema>;

/**
 * Feature list response schema
 */
export const FeatureListResponseSchema = z.object({
  features: z.array(FeatureItemSchema),
  total: z.number().int().min(0),
  last_updated: z.string().datetime(),
});

export type FeatureListResponse = z.infer<typeof FeatureListResponseSchema>;

/**
 * Feature pass request schema
 */
export const FeaturePassRequestSchema = z.object({
  commit: z.string().optional(),
  notes: z.string().optional(),
});

export type FeaturePassRequest = z.infer<typeof FeaturePassRequestSchema>;

/**
 * Feature retry request schema
 */
export const FeatureRetryRequestSchema = z.object({
  reason: z.string().optional(),
  reset_attempts: z.boolean().optional(),
});

export type FeatureRetryRequest = z.infer<typeof FeatureRetryRequestSchema>;
