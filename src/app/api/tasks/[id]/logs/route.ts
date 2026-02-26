// ─────────────────────────────────────────────────────────────────
// Task Logs API - 任务操作日志 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, getRouteParam } from '@/lib/api-handler'
import { AppError, validators } from '@/lib/errors'
import { supabase } from '@/lib/supabase-client'

export interface TaskLog {
  id: string
  task_id: string
  action: string
  field?: string
  old_value?: string
  new_value?: string
  actor?: string
  metadata: Record<string, any>
  created_at: string
}

/**
 * GET /api/tasks/[id]/logs - 获取任务操作日志
 */
export const GET = apiHandler(async (request, context) => {
  const taskId = await getRouteParam(context, 'id')
  validators.uuid(taskId, '任务 ID')

  if (!supabase) {
    return { logs: [] }
  }

  const { data, error } = await supabase
    .from('task_logs')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  return { logs: data as TaskLog[] }
})
