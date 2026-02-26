// ─────────────────────────────────────────────────────────────────
// Task Comments API - 任务评论 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody, getRouteParam } from '@/lib/api-handler'
import { AppError, validators, sanitize } from '@/lib/errors'
import { supabase } from '@/lib/supabase-client'

export interface TaskComment {
  id: string
  task_id: string
  content: string
  author?: string
  mentions: string[]
  parent_id?: string
  created_at: string
  updated_at: string
}

/**
 * GET /api/tasks/[id]/comments - 获取任务评论
 */
export const GET = apiHandler(async (request, context) => {
  const taskId = await getRouteParam(context, 'id')
  validators.uuid(taskId, '任务 ID')

  if (!supabase) {
    return { comments: [] }
  }

  const { data, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return { comments: data as TaskComment[] }
})

/**
 * POST /api/tasks/[id]/comments - 创建评论
 */
export const POST = apiHandler(async (request, context) => {
  const taskId = await getRouteParam(context, 'id')
  validators.uuid(taskId, '任务 ID')

  const body = await parseJsonBody<{
    content: string
    author?: string
    parent_id?: string
  }>(request)

  const content = sanitize.string(body.content)
  validators.required(content, '评论内容')

  if (content.length > 2000) {
    throw AppError.badRequest('评论内容不能超过 2000 字符')
  }

  if (!supabase) {
    throw AppError.internal('数据库未配置')
  }

  const { data, error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      content,
      author: body.author ? sanitize.string(body.author) : null,
      parent_id: body.parent_id || null,
    })
    .select()
    .single()

  if (error) throw error

  return { comment: data as TaskComment }
})
