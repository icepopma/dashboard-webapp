// ─────────────────────────────────────────────────────────────────
// Ideas API - 想法管理 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody, getQueryParams } from '@/lib/api-handler'
import { AppError, validators, sanitize } from '@/lib/errors'
import { getIdeas, createIdea } from '@/lib/supabase'

/**
 * GET /api/ideas - 获取想法列表
 */
export const GET = apiHandler(async (request) => {
  const query = getQueryParams(request)
  const status = query.getString('status')
  
  const ideas = await getIdeas(status || undefined)
  
  return { ideas }
})

/**
 * POST /api/ideas - 创建新想法
 */
export const POST = apiHandler(async (request) => {
  const body = await parseJsonBody<{
    title: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    tags?: string[]
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

  if (body.priority) {
    validators.enum(body.priority, ['low', 'medium', 'high'], '优先级')
  }

  // 创建想法
  const idea = await createIdea({
    title,
    description: description || null,
    priority: body.priority || 'medium',
    tags: body.tags || [],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  return { idea }
})
