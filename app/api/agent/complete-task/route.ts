import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * POST /api/agent/complete-task
 *
 * Agent 完成任务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, agentId, deliverables } = body

    if (!taskId || !agentId) {
      return NextResponse.json(
        { error: 'taskId and agentId are required' },
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

    // 更新任务：标记为完成
    const { data: updatedTask, error: updateError } = await supabase
      .from('agent_task_pool')
      .update({
        task_status: 'completed',
        status: 'completed',
        completed_by: agentId,
        completed_at: new Date().toISOString(),
        deliverables: deliverables || []
      })
      .eq('id', taskId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: 'Task completed successfully!'
    })
  } catch (error: any) {
    console.error('Error completing task:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
