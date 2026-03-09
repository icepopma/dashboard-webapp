import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * POST /api/agent/submit-plan
 *
 * Agent 提交任务计划
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, agentId, plan } = body

    if (!taskId || !agentId || !plan) {
      return NextResponse.json(
        { error: 'taskId, agentId, and plan are required' },
        { status: 400 }
      )
    }

    // 验证任务存在且被该 agent 认领
    const { data: task, error: findError } = await supabase
      .from('agent_task_pool')
      .select('*')
      .eq('id', taskId)
      .eq('claimed_by', agentId)
      .single()

    if (findError || !task) {
      return NextResponse.json(
        { error: 'Task not found or not claimed by this agent' },
        { status: 404 }
      )
    }

    // 更新任务：提交计划
    const { data: updatedTask, error: updateError } = await supabase
      .from('agent_task_pool')
      .update({
        plan: plan,
        plan_submitted_at: new Date().toISOString(),
        task_status: 'plan_pending'
      })
      .eq('id', taskId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: 'Plan submitted successfully. Waiting for approval.'
    })
  } catch (error: any) {
    console.error('Error submitting plan:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
