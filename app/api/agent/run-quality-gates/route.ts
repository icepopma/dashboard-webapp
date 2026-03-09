import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 质量门控配置
const QUALITY_GATES = {
  code: [
    { id: 'tests_pass', name: 'Tests Pass', description: 'All tests must pass' },
    { id: 'no_typescript_errors', name: 'No TypeScript Errors', description: 'No TypeScript compilation errors' },
    { id: 'code_review', name: 'Code Review', description: 'Code reviewed by peer' }
  ],
  content: [
    { id: 'grammar_check', name: 'Grammar Check', description: 'No grammar errors' },
    { id: 'plagiarism_check', name: 'Plagiarism Check', description: 'Content is original' }
  ],
  design: [
    { id: 'design_review', name: 'Design Review', description: 'Design reviewed by team' },
    { id: 'accessibility', name: 'Accessibility', description: 'Meets accessibility standards' }
  ]
}

/**
 * POST /api/agent/run-quality-gates
 *
 * 运行质量门控检查
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, gates } = body

    if (!taskId || !gates || !Array.isArray(gates)) {
      return NextResponse.json(
        { error: 'taskId and gates (array) are required' },
        { status: 400 }
      )
    }

    // 验证任务存在
    const { data: task, error: findError } = await supabase
      .from('agent_task_pool')
      .select('*')
      .eq('id', taskId)
      .single()

    if (findError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // 模拟质量门控检查（实际应用中应该运行真实的检查）
    const results = gates.map(gateId => {
      const passed = Math.random() > 0.2 // 80% 通过率（模拟）
      return {
        gate: gateId,
        passed,
        timestamp: new Date().toISOString()
      }
    })

    const passedGates = results.filter(r => r.passed).map(r => r.gate)
    const failedGates = results.filter(r => !r.passed).map(r => r.gate)

    // 更新任务：记录质量门控结果
    const { data: updatedTask, error: updateError } = await supabase
      .from('agent_task_pool')
      .update({
        quality_gates_passed: passedGates,
        quality_gates_failed: failedGates
      })
      .eq('id', taskId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      task: updatedTask,
      qualityGates: {
        total: gates.length,
        passed: passedGates.length,
        failed: failedGates.length,
        results
      }
    })
  } catch (error: any) {
    console.error('Error running quality gates:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agent/run-quality-gates
 *
 * 获取可用的质量门控列表
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    qualityGates: QUALITY_GATES
  })
}
