import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * POST /api/agent/approve-plan
 *
 * 用户批准任务计划
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, approvedBy, feedback } = body

    if (!taskId || !approvedBy) {
      return NextResponse.json(
        { error: 'taskId and approvedBy are required' },
        { status: 400 }
      )
    }

    // 验证任务存在且计划待审批
    const { data: task, error: findError } = await supabase
      .from('agent_task_pool')
      .select('*')
      .eq('id', taskId)
      .eq('task_status', 'plan_pending')
      .single()

    if (findError || !task) {
      return NextResponse.json(
        { error: 'Task not found or plan not pending approval' },
        { status: 404 }
      )
    }

    // 更新任务：批准计划
    const { data: updatedTask, error: updateError } = await supabase
      .from('agent_task_pool')
      .update({
        task_status: 'plan_approved',
        plan_approved_by: approvedBy,
        plan_approved_at: new Date().toISOString(),
        plan_feedback: feedback || null
      })
      .eq('id', taskId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: 'Plan approved successfully. Agent can now execute the task.'
    })
  } catch (error: any) {
    console.error('Error approving plan:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
