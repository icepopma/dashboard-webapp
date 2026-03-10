import { z } from 'zod';

export const HeartbeatSchema = z.object({
  session_id: z.string(),
  timestamp: z.string().datetime(),
  status: z.enum(['running', 'idle', 'stuck', 'dead', 'complete']),
  current_feature: z.string().nullable(),
  progress: z.number().min(0).max(100).optional(),
  message: z.string().optional(),
});

export type Heartbeat = z.infer<typeof HeartbeatSchema>;

export const AgentStatusSchema = z.object({
  session_id: z.string(),
  last_heartbeat: z.string().datetime(),
  status: z.enum(['running', 'idle', 'stuck', 'dead', 'complete']),
  current_feature: z.string().nullable(),
  progress: z.number().min(0).max(100).optional(),
  heartbeat_interval_seconds: z.number().default(60),
  dead_threshold_seconds: z.number().default(180), // 3 minutes
  stuck_threshold_seconds: z.number().default(600), // 10 minutes
});

export type AgentStatus = z.infer<typeof AgentStatusSchema>;
