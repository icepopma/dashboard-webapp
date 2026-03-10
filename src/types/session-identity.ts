import { z } from 'zod';

export const SessionIdentitySchema = z.object({
  session_id: z.string().regex(/^[a-z0-9-]+-\d{8}-[a-z0-9]{4}$/, {
    message: 'Session ID must follow format: {task_type}-{YYYYMMDD}-{random}',
  }),
  task_type: z.string(),
  task_id: z.string().optional(),
  timestamp: z.string().datetime(),
  random_suffix: z.string().length(4),
  feature_id: z.string().optional(),
  layer: z.enum(['types', 'config', 'repo', 'service', 'runtime', 'ui']).optional(),
  parent_session_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type SessionIdentity = z.infer<typeof SessionIdentitySchema>;

export const SessionIdentityCreateSchema = z.object({
  task_type: z.string(),
  task_id: z.string().optional(),
  feature_id: z.string().optional(),
  layer: z.enum(['types', 'config', 'repo', 'service', 'runtime', 'ui']).optional(),
  parent_session_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type SessionIdentityCreate = z.infer<typeof SessionIdentityCreateSchema>;
