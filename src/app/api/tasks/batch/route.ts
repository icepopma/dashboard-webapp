// ─────────────────────────────────────────────────────────────────
// Tasks Batch API - 批量操作 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody } from '@/lib/api-handler'
import { AppError, validators } from '@/lib/errors'
import { supabase } from '@/lib/supabase-client'

/**
 * POST /api/tasks/batch - 批量更新任务
 */
export const POST = apiHandler(async (request) => {
  const body = await parseJsonBody<{
    taskIds: string[]
    action: 'update_status' | 'update_priority' | 'update_assignee' | 'delete'
    value?: string
  }>(request)

  // 验证
  if (!body.taskIds || !Array.isArray(body.taskIds) || body.taskIds.length === 0) {
    throw AppError.badRequest('请选择至少一个任务')
  }

  if (body.taskIds.length > 100) {
    throw AppError.badRequest('一次最多操作 100 个任务')
  }

  body.taskIds.forEach(id => validators.uuid(id, '任务 ID'))

  if (!body.action) {
    throw AppError.badRequest('缺少操作类型')
  }

  validators.enum(body.action, ['update_status', 'update_priority', 'update_assignee', 'delete'], '操作类型')

  if (!supabase) {
    throw AppError.internal('数据库未配置')
  }

  let result

  switch (body.action) {
    case 'update_status':
      if (!body.value) throw AppError.badRequest('缺少状态值')
      validators.enum(body.value, ['todo', 'in_progress', 'done', 'blocked'], '状态')

      const { data: statusData, error: statusError } = await supabase
        .from('tasks')
        .update({
          status: body.value,
          completed_at: body.value === 'done' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .in('id', body.taskIds)
        .select('id')

      if (statusError) throw statusError
      result = { updated: statusData?.length || 0 }
      break

    case 'update_priority':
      if (!body.value) throw AppError.badRequest('缺少优先级值')
      validators.enum(body.value, ['low', 'medium', 'high'], '优先级')

      const { data: priorityData, error: priorityError } = await supabase
        .from('tasks')
        .update({
          priority: body.value,
          updated_at: new Date().toISOString()
        })
        .in('id', body.taskIds)
        .select('id')

      if (priorityError) throw priorityError
      result = { updated: priorityData?.length || 0 }
      break

    case 'update_assignee':
      const { data: assigneeData, error: assigneeError } = await supabase
        .from('tasks')
        .update({
          assignee: body.value || null,
          updated_at: new Date().toISOString()
        })
        .in('id', body.taskIds)
        .select('id')

      if (assigneeError) throw assigneeError
      result = { updated: assigneeData?.length || 0 }
      break

    case 'delete':
      const { data: deleteData, error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .in('id', body.taskIds)
        .select('id')

      if (deleteError) throw deleteError
      result = { deleted: deleteData?.length || 0 }
      break

    default:
      throw AppError.badRequest('未知操作类型')
  }

  return {
    success: true,
    ...result
  }
})
