// ─────────────────────────────────────────────────────────────────
// Task Detail API - 任务详情 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody, getRouteParam } from '@/lib/api-handler'
import { AppError, validators, sanitize } from '@/lib/errors'
import { getTaskById, updateTask, deleteTask } from '@/lib/supabase-client'

/**
 * GET /api/tasks/[id] - 获取单个任务
 */
export const GET = apiHandler(async (request, context) => {
  const id = await getRouteParam(context, 'id')
  validators.uuid(id, '任务 ID')

  const task = await getTaskById(id)
  
  if (!task) {
    throw AppError.notFound('任务')
  }

  return { task }
})

/**
 * PUT /api/tasks/[id] - 更新任务
 */
export const PUT = apiHandler(async (request, context) => {
  const id = await getRouteParam(context, 'id')
  validators.uuid(id, '任务 ID')

  const body = await parseJsonBody<{
    title?: string
    description?: string
    status?: 'todo' | 'in_progress' | 'done' | 'blocked'
    priority?: 'low' | 'medium' | 'high'
    assignee?: string
    due_date?: string
    tags?: string[]
  }>(request)

  const updates: Record<string, any> = {}

  if (body.title !== undefined) {
    const title = sanitize.string(body.title)
    validators.required(title, '标题')
    updates.title = title
  }

  if (body.description !== undefined) {
    updates.description = sanitize.string(body.description) || null
  }

  if (body.status !== undefined) {
    validators.enum(body.status, ['todo', 'in_progress', 'done', 'blocked'], '状态')
    updates.status = body.status
    if (body.status === 'done') {
      updates.completed_at = new Date().toISOString()
    }
  }

  if (body.priority !== undefined) {
    validators.enum(body.priority, ['low', 'medium', 'high'], '优先级')
    updates.priority = body.priority
  }

  if (body.assignee !== undefined) {
    updates.assignee = body.assignee
  }

  if (body.due_date !== undefined) {
    updates.due_date = body.due_date || null
  }

  if (body.tags !== undefined) {
    updates.tags = Array.isArray(body.tags) ? body.tags : []
  }

  if (Object.keys(updates).length === 0) {
    throw AppError.badRequest('没有提供需要更新的字段')
  }

  const task = await updateTask(id, updates)

  return { task }
})

/**
 * DELETE /api/tasks/[id] - 删除任务
 */
export const DELETE = apiHandler(async (request, context) => {
  const id = await getRouteParam(context, 'id')
  validators.uuid(id, '任务 ID')

  await deleteTask(id)

  return { success: true, message: '任务已删除' }
})
