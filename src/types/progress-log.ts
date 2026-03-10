/**
 * Progress Log Types (GP-002: Validate at boundaries)
 * 
 * Tracks agent progress for escalation protocol
 */

import { z } from 'zod';

/**
 * Log level enum
 */
export const ProgressLogLevelSchema = z.enum([
  'info',     // General information
  'warning',  // Warning messages
  'error',    // Error messages
  'success',  // Success messages
]);

export type ProgressLogLevel = z.infer<typeof ProgressLogLevelSchema>;

/**
 * Progress log item schema
 */
export const ProgressLogSchema = z.object({
  id: z.string().min(1),
  session_id: z.string().min(1),
  feature_id: z.string().regex(/^feat-\d{3}$/, 'Feature ID must be feat-XXX format'),
  level: ProgressLogLevelSchema,
  message: z.string().min(1),
  timestamp: z.string().datetime(),
  
  // Optional fields
  metadata: z.record(z.unknown()).optional(),
  commit: z.string().optional(),
  duration_ms: z.number().int().min(0).optional(),
  parent_log_id: z.string().optional(),
});

export type ProgressLog = z.infer<typeof ProgressLogSchema>;

/**
 * Progress log list response schema
 */
export const ProgressLogListResponseSchema = z.object({
  logs: z.array(ProgressLogSchema),
  total: z.number().int().min(0),
  has_more: z.boolean(),
  next_cursor: z.string().optional(),
});

export type ProgressLogListResponse = z.infer<typeof ProgressLogListResponseSchema>;

/**
 * Create progress log request schema
 */
export const CreateProgressLogRequestSchema = z.object({
  session_id: z.string().min(1),
  feature_id: z.string().regex(/^feat-\d{3}$/),
  level: ProgressLogLevelSchema,
  message: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  commit: z.string().optional(),
  duration_ms: z.number().int().min(0).optional(),
  parent_log_id: z.string().optional(),
});

export type CreateProgressLogRequest = z.infer<typeof CreateProgressLogRequestSchema>;

/**
 * Progress summary schema
 */
export const ProgressSummarySchema = z.object({
  session_id: z.string(),
  feature_id: z.string(),
  total_logs: z.number().int().min(0),
  error_count: z.number().int().min(0),
  warning_count: z.number().int().min(0),
  success_count: z.number().int().min(0),
  info_count: z.number().int().min(0),
  last_updated: z.string().datetime(),
  duration_ms: z.number().int().min(0).optional(),
});

export type ProgressSummary = z.infer<typeof ProgressSummarySchema>;
