// ─────────────────────────────────────────────────────────────────
// Task Dependencies API - 任务依赖 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody, getRouteParam } from '@/lib/api-handler'
import { AppError, validators } from '@/lib/errors'
import { supabase } from '@/lib/supabase-client'

export interface TaskDependency {
  id: string
  task_id: string
  depends_on_task_id: string
  created_at: string
}

/**
 * GET /api/tasks/[id]/dependencies - 获取任务依赖
 */
export const GET = apiHandler(async (request, context) => {
  const taskId = await getRouteParam(context, 'id')
  validators.uuid(taskId, '任务 ID')

  if (!supabase) {
    return { dependencies: [], blockedBy: [] }
  }

  // 获取此任务依赖的任务
  const { data: dependencies, error: depError } = await supabase
    .from('task_dependencies')
    .select(`
      id,
      task_id,
      depends_on_task_id,
      created_at
    `)
    .eq('task_id', taskId)

  if (depError) throw depError

  // 获取依赖此任务的任务
  const { data: blockedBy, error: blockError } = await supabase
    .from('task_dependencies')
    .select(`
      id,
      task_id,
      depends_on_task_id,
      created_at
    `)
    .eq('depends_on_task_id', taskId)

  if (blockError) throw blockError

  return {
    dependencies: dependencies as TaskDependency[],
    blockedBy: blockedBy as TaskDependency[]
  }
})

/**
 * POST /api/tasks/[id]/dependencies - 添加依赖
 */
export const POST = apiHandler(async (request, context) => {
  const taskId = await getRouteParam(context, 'id')
  validators.uuid(taskId, '任务 ID')

  const body = await parseJsonBody<{ depends_on_task_id: string }>(request)

  if (!body.depends_on_task_id) {
    throw AppError.badRequest('缺少依赖任务 ID')
  }

  validators.uuid(body.depends_on_task_id, '依赖任务 ID')

  if (body.depends_on_task_id === taskId) {
    throw AppError.badRequest('任务不能依赖自己')
  }

  if (!supabase) {
    throw AppError.internal('数据库未配置')
  }

  // 检查是否已存在
  const { data: existing } = await supabase
    .from('task_dependencies')
    .select('id')
    .eq('task_id', taskId)
    .eq('depends_on_task_id', body.depends_on_task_id)
    .single()

  if (existing) {
    throw AppError.badRequest('依赖关系已存在')
  }

  // 检查循环依赖
  const { data: circular } = await supabase
    .from('task_dependencies')
    .select('id')
    .eq('task_id', body.depends_on_task_id)
    .eq('depends_on_task_id', taskId)
    .single()

  if (circular) {
    throw AppError.badRequest('存在循环依赖')
  }

  const { data, error } = await supabase
    .from('task_dependencies')
    .insert({
      task_id: taskId,
      depends_on_task_id: body.depends_on_task_id,
    })
    .select()
    .single()

  if (error) throw error

  return { dependency: data as TaskDependency }
})

/**
 * DELETE /api/tasks/[id]/dependencies - 删除依赖
 */
export const DELETE = apiHandler(async (request, context) => {
  const taskId = await getRouteParam(context, 'id')
  validators.uuid(taskId, '任务 ID')

  const body = await parseJsonBody<{ depends_on_task_id: string }>(request)

  if (!body.depends_on_task_id) {
    throw AppError.badRequest('缺少依赖任务 ID')
  }

  if (!supabase) {
    throw AppError.internal('数据库未配置')
  }

  const { error } = await supabase
    .from('task_dependencies')
    .delete()
    .eq('task_id', taskId)
    .eq('depends_on_task_id', body.depends_on_task_id)

  if (error) throw error

  return { success: true, message: '依赖已删除' }
})
