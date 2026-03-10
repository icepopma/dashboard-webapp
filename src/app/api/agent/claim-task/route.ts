import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * POST /api/agent/claim-task
 *
 * Agent 认领任务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId } = body

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      )
    }

    // 1. 查找可认领的任务
    const { data: claimableTasks, error: findError } = await supabase
      .from('agent_task_pool')
      .select('*')
      .is('claimed_by', null)
      .in('task_status', ['pending', 'plan_approved'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)

    if (findError) throw findError
    if (!claimableTasks || claimableTasks.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No claimable tasks available'
      })
    }

    const task = claimableTasks[0]

    // 2. 检查依赖是否完成（简化版，暂时跳过）
    // TODO: 实现 check_dependencies_completed 函数

    // 3. 使用乐观锁认领任务
    const { data: claimedTask, error: claimError } = await supabase
      .from('agent_task_pool')
      .update({
        claimed_by: agentId,
        claimed_at: new Date().toISOString(),
        task_status: 'in_progress',
        status: 'in_progress'
      })
      .eq('id', task.id)
      .is('claimed_by', null) // 乐观锁：确保未被认领
      .select()
      .single()

    if (claimError) {
      // 如果失败（被其他 agent 抢先认领），返回错误
      if (claimError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          message: 'Task was already claimed by another agent'
        })
      }
      throw claimError
    }

    return NextResponse.json({
      success: true,
      task: claimedTask
    })
  } catch (error: any) {
    console.error('Error claiming task:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
