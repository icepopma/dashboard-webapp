import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * GET /api/agent/pending-plans
 *
 * 查询待审批的任务计划
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // 查询所有待审批的计划
    const { data: pendingPlans, error } = await supabase
      .from('agent_task_pool')
      .select('*')
      .eq('task_status', 'plan_pending')
      .order('plan_submitted_at', { ascending: true })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      plans: pendingPlans,
      count: pendingPlans?.length || 0
    })
  } catch (error: any) {
    console.error('Error fetching pending plans:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
