// ─────────────────────────────────────────────────────────────────
// Idea Detail API - 想法详情 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody, getRouteParam } from '@/lib/api-handler'
import { AppError, validators, sanitize } from '@/lib/errors'
import { getIdeaById, updateIdea, deleteIdea } from '@/lib/supabase-client'

/**
 * GET /api/ideas/[id] - 获取单个想法
 */
export const GET = apiHandler(async (request, context) => {
  const id = await getRouteParam(context, 'id')
  validators.uuid(id, '想法 ID')

  const idea = await getIdeaById(id)
  
  if (!idea) {
    throw AppError.notFound('想法')
  }

  return { idea }
})

/**
 * PUT /api/ideas/[id] - 更新想法
 */
export const PUT = apiHandler(async (request, context) => {
  const id = await getRouteParam(context, 'id')
  validators.uuid(id, '想法 ID')

  const body = await parseJsonBody<{
    title?: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    status?: 'active' | 'archived' | 'completed'
    tags?: string[]
  }>(request)

  const updates: Record<string, any> = {}

  if (body.title !== undefined) {
    const title = sanitize.string(body.title)
    validators.required(title, '标题')
    validators.minLength(title, 2, '标题')
    validators.maxLength(title, 200, '标题')
    updates.title = title
  }

  if (body.description !== undefined) {
    const description = sanitize.string(body.description)
    if (description) {
      validators.maxLength(description, 2000, '描述')
    }
    updates.description = description || null
  }

  if (body.priority !== undefined) {
    validators.enum(body.priority, ['low', 'medium', 'high'], '优先级')
    updates.priority = body.priority
  }

  if (body.status !== undefined) {
    validators.enum(body.status, ['active', 'archived', 'completed'], '状态')
    updates.status = body.status
  }

  if (body.tags !== undefined) {
    updates.tags = body.tags
  }

  if (Object.keys(updates).length === 0) {
    throw AppError.badRequest('没有提供需要更新的字段')
  }

  const idea = await updateIdea(id, updates)

  return { idea }
})

/**
 * DELETE /api/ideas/[id] - 删除想法
 */
export const DELETE = apiHandler(async (request, context) => {
  const id = await getRouteParam(context, 'id')
  validators.uuid(id, '想法 ID')

  await deleteIdea(id)

  return { success: true, message: '想法已删除' }
})
