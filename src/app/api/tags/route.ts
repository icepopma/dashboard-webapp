// ─────────────────────────────────────────────────────────────────
// Tags API - 标签 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody } from '@/lib/api-handler'
import { AppError, validators, sanitize } from '@/lib/errors'
import { supabase } from '@/lib/supabase-client'

export interface Tag {
  id: string
  name: string
  color: string
  description?: string
  created_at: string
}

/**
 * GET /api/tags - 获取所有标签
 */
export const GET = apiHandler(async () => {
  if (!supabase) {
    return { tags: [] }
  }

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error

  return { tags: data as Tag[] }
})

/**
 * POST /api/tags - 创建标签
 */
export const POST = apiHandler(async (request) => {
  const body = await parseJsonBody<{
    name: string
    color?: string
    description?: string
  }>(request)

  const name = sanitize.string(body.name)
  validators.required(name, '标签名称')

  if (!supabase) {
    throw AppError.internal('数据库未配置')
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({
      name,
      color: body.color || '#6366f1',
      description: body.description ? sanitize.string(body.description) : null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw AppError.badRequest('标签名称已存在')
    }
    throw error
  }

  return { tag: data as Tag }
})
