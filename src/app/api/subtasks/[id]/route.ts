// ─────────────────────────────────────────────────────────────────
// Subtask Detail API - 子任务详情 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody, getRouteParam } from '@/lib/api-handler'
import { AppError, validators, sanitize } from '@/lib/errors'
import { updateSubtask, deleteSubtask } from '@/lib/supabase-client'

/**
 * PUT /api/subtasks/[id] - 更新子任务
 */
export const PUT = apiHandler(async (request, context) => {
  const subtaskId = await getRouteParam(context, 'id')
  validators.uuid(subtaskId, '子任务 ID')

  const body = await parseJsonBody<{
    title?: string
    description?: string
    status?: 'todo' | 'in_progress' | 'done'
    priority?: 'low' | 'medium' | 'high'
    assignee?: string
    order_index?: number
  }>(request)

  const updates: Record<string, any> = {}

  if (body.title !== undefined) {
    const title = sanitize.string(body.title)
    validators.required(title, '子任务标题')
    updates.title = title
  }

  if (body.description !== undefined) {
    updates.description = sanitize.string(body.description) || null
  }

  if (body.status !== undefined) {
    validators.enum(body.status, ['todo', 'in_progress', 'done'], '状态')
    updates.status = body.status
    if (body.status === 'done') {
      updates.completed_at = new Date().toISOString()
    } else {
      updates.completed_at = null
    }
  }

  if (body.priority !== undefined) {
    validators.enum(body.priority, ['low', 'medium', 'high'], '优先级')
    updates.priority = body.priority
  }

  if (body.assignee !== undefined) {
    updates.assignee = body.assignee || null
  }

  if (body.order_index !== undefined) {
    updates.order_index = body.order_index
  }

  if (Object.keys(updates).length === 0) {
    throw AppError.badRequest('没有提供需要更新的字段')
  }

  const subtask = await updateSubtask(subtaskId, updates)

  return { subtask }
})

/**
 * DELETE /api/subtasks/[id] - 删除子任务
 */
export const DELETE = apiHandler(async (request, context) => {
  const subtaskId = await getRouteParam(context, 'id')
  validators.uuid(subtaskId, '子任务 ID')

  await deleteSubtask(subtaskId)

  return { success: true, message: '子任务已删除' }
})
