import { z } from 'zod';

export const CIFailureSchema = z.object({
  ci_run_id: z.string(),
  repository: z.string(),
  branch: z.string(),
  commit_sha: z.string(),
  status: z.enum(['failed', 'cancelled', 'timed_out']),
  message: z.string(),
  timestamp: z.string().datetime(),
  workflow: z.string().optional(),
  step: z.string().optional(),
  logs_url: z.string().url().optional(),
});

export type CIFailure = z.infer<typeof CIFailureSchema>;
