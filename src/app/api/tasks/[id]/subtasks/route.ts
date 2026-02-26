// ─────────────────────────────────────────────────────────────────
// Subtasks API - 子任务 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody, getRouteParam } from '@/lib/api-handler'
import { AppError, validators, sanitize } from '@/lib/errors'
import { getSubtasks, createSubtask } from '@/lib/supabase-client'

/**
 * GET /api/tasks/[id]/subtasks - 获取任务的所有子任务
 */
export const GET = apiHandler(async (request, context) => {
  const taskId = await getRouteParam(context, 'id')
  validators.uuid(taskId, '任务 ID')

  const subtasks = await getSubtasks(taskId)

  return { subtasks }
})

/**
 * POST /api/tasks/[id]/subtasks - 创建子任务
 */
export const POST = apiHandler(async (request, context) => {
  const taskId = await getRouteParam(context, 'id')
  validators.uuid(taskId, '任务 ID')

  const body = await parseJsonBody<{
    title: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    assignee?: string
  }>(request)

  const title = sanitize.string(body.title)
  validators.required(title, '子任务标题')

  if (body.priority) {
    validators.enum(body.priority, ['low', 'medium', 'high'], '优先级')
  }

  // 获取当前最大的 order_index
  const existingSubtasks = await getSubtasks(taskId)
  const maxOrder = existingSubtasks.reduce((max, s) => Math.max(max, s.order_index), 0)

  const subtask = await createSubtask({
    task_id: taskId,
    title,
    description: body.description ? sanitize.string(body.description) : undefined,
    status: 'todo',
    priority: body.priority || 'medium',
    assignee: body.assignee,
    order_index: maxOrder + 1,
  })

  return { subtask }
})
