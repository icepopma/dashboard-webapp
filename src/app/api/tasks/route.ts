// ─────────────────────────────────────────────────────────────────
// Tasks API - 任务管理 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody, getQueryParams } from '@/lib/api-handler'
import { AppError, validators, sanitize } from '@/lib/errors'
import { getTasks, createTask } from '@/lib/supabase'

/**
 * GET /api/tasks - 获取任务列表
 */
export const GET = apiHandler(async (request) => {
  const query = getQueryParams(request)
  const status = query.getString('status')
  
  const tasks = await getTasks(status || undefined)
  
  return { tasks }
})

/**
 * POST /api/tasks - 创建新任务
 */
export const POST = apiHandler(async (request) => {
  const body = await parseJsonBody<{
    title: string
    description?: string
    idea_id?: string
    assignee?: string
    priority?: 'low' | 'medium' | 'high'
    status?: 'todo' | 'in_progress' | 'done' | 'blocked'
    due_date?: string
  }>(request)

  // 验证
  const title = sanitize.string(body.title)
  validators.required(title, '标题')
  validators.minLength(title, 2, '标题')
  validators.maxLength(title, 200, '标题')

  const description = sanitize.string(body.description)
  if (description) {
    validators.maxLength(description, 2000, '描述')
  }

  if (body.idea_id) {
    validators.uuid(body.idea_id, '关联想法 ID')
  }

  if (body.priority) {
    validators.enum(body.priority, ['low', 'medium', 'high'], '优先级')
  }

  if (body.status) {
    validators.enum(body.status, ['todo', 'in_progress', 'done', 'blocked'], '状态')
  }

  // 创建任务
  const task = await createTask({
    title,
    description: description || null,
    idea_id: body.idea_id || null,
    assignee: body.assignee || null,
    priority: body.priority || 'medium',
    status: body.status || 'todo',
    due_date: body.due_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  return { task }
})
