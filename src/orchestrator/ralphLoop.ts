// ─────────────────────────────────────────────────────────────────
// Ralph Loop V2 - 自学习循环
// ─────────────────────────────────────────────────────────────────

import type { Task, TaskResult, FailureAnalysis, AgentSession, RalphLoopState } from './types'
import type { MemoryStore } from '../memory/store'
import type { AgentLauncher } from '../launcher/process'
import { buildPrompt, adjustPrompt } from './promptBuilder'

interface RalphLoopOptions {
  task: Task
  memory: MemoryStore
  launcher: AgentLauncher
  maxAttempts: number
  onAttempt?: (attempt: number, prompt: string, session: AgentSession) => Promise<void>
  onSuccess?: (result: TaskResult) => Promise<void>
  onFailure?: (error: Error, analysis: FailureAnalysis) => Promise<void>
}

interface RalphLoopResult {
  success: boolean
  result?: TaskResult
  analysis?: FailureAnalysis
  attempts: number
}

/**
 * Ralph Loop V2 - 自学习执行循环
 * 
 * 核心改进：
 * 1. 失败时不是简单重试，而是分析失败原因
 * 2. 根据失败原因调整提示词
 * 3. 记录成功/失败模式供未来学习
 */
export async function ralphLoop(options: RalphLoopOptions): Promise<RalphLoopResult> {
  const { task, memory, launcher, maxAttempts, onAttempt, onSuccess, onFailure } = options
  
  const state: RalphLoopState = {
    taskId: task.id,
    attempt: 0,
    maxAttempts,
    prompt: '',
    context: task.context,
    history: [],
  }

  // 构建初始提示词
  state.prompt = await buildPrompt(task, task.context, {
    includeMemory: true,
    includeHistory: true,
    includeConstraints: true,
  })

  while (state.attempt < maxAttempts) {
    state.attempt++
    
    try {
      // 启动智能体
      const session = await launcher.launch({
        agent: task.agent!,
        taskId: task.id,
        prompt: state.prompt,
        worktree: true,
        tmux: true,
      })

      // 回调
      if (onAttempt) {
        await onAttempt(state.attempt, state.prompt, session)
      }

      // 等待执行完成
      const result = await launcher.waitForCompletion(session, {
        timeout: 30 * 60 * 1000, // 30 分钟超时
        onProgress: (output) => {
          console.log(`[RalphLoop] 任务 ${task.id} 进度: ${output.substring(0, 100)}...`)
        },
      })

      if (result.success) {
        // 成功！
        state.history.push({
          attempt: state.attempt,
          prompt: state.prompt,
          result,
        })

        // 记录成功模式
        await memory.recordSuccess(task, state.prompt, result)

        // 回调
        if (onSuccess) {
          await onSuccess(result)
        }

        return {
          success: true,
          result,
          attempts: state.attempt,
        }
      }

      // 失败了，分析原因
      const analysis = await analyzeFailure(task, result, state)
      
      state.history.push({
        attempt: state.attempt,
        prompt: state.prompt,
        result,
        analysis,
      })

      // 记录失败模式
      await memory.recordFailure(task, new Error(result.error || 'Unknown error'), analysis)

      // 检查是否应该继续重试
      if (!shouldRetry(analysis, state)) {
        if (onFailure) {
          await onFailure(new Error(result.error || 'Task failed'), analysis)
        }
        
        return {
          success: false,
          analysis,
          attempts: state.attempt,
        }
      }

      // 调整提示词
      state.prompt = await adjustPrompt(state.prompt, analysis)
      
      console.log(`[RalphLoop] 任务 ${task.id} 第 ${state.attempt} 次尝试失败，准备重试`)
      console.log(`[RalphLoop] 失败原因: ${analysis.reason}`)
      console.log(`[RalphLoop] 调整建议: ${analysis.suggestion}`)

    } catch (error) {
      console.error(`[RalphLoop] 任务 ${task.id} 执行异常:`, error)
      
      const analysis: FailureAnalysis = {
        reason: error instanceof Error ? error.message : 'Unknown error',
        category: 'unknown',
        suggestion: '请检查系统配置和日志',
      }

      state.history.push({
        attempt: state.attempt,
        prompt: state.prompt,
        result: { success: false, error: analysis.reason },
        analysis,
      })

      if (state.attempt >= maxAttempts) {
        if (onFailure) {
          await onFailure(error instanceof Error ? error : new Error('Unknown error'), analysis)
        }
        
        return {
          success: false,
          analysis,
          attempts: state.attempt,
        }
      }
    }
  }

  // 达到最大尝试次数
  const lastHistory = state.history[state.history.length - 1]
  
  return {
    success: false,
    analysis: lastHistory?.analysis || {
      reason: '达到最大尝试次数',
      category: 'unknown',
      suggestion: '请人工介入',
    },
    attempts: state.attempt,
  }
}

/**
 * 分析失败原因
 */
async function analyzeFailure(
  task: Task,
  result: TaskResult,
  state: RalphLoopState,
): Promise<FailureAnalysis> {
  const error = result.error || ''
  
  // 上下文不足
  if (error.includes('context') || error.includes('未找到') || error.includes('not found')) {
    return {
      reason: '上下文信息不足',
      category: 'context',
      suggestion: `请提供更多关于 ${task.type} 的上下文信息，包括相关文件路径和数据结构。`,
      adjustedPrompt: undefined,
    }
  }

  // 方向错误
  if (error.includes('direction') || error.includes('不符合') || error.includes('mismatch')) {
    return {
      reason: '执行方向与预期不符',
      category: 'direction',
      suggestion: `任务目标是: ${task.goal}。请确保按照目标方向执行。`,
      adjustedPrompt: undefined,
    }
  }

  // 技术问题
  if (error.includes('error') || error.includes('failed') || error.includes('失败')) {
    return {
      reason: '技术执行问题',
      category: 'technical',
      suggestion: `请解决以下技术问题: ${error.substring(0, 200)}`,
      adjustedPrompt: undefined,
    }
  }

  // 未知错误
  return {
    reason: error || '未知错误',
    category: 'unknown',
    suggestion: '请检查日志并人工介入',
    adjustedPrompt: undefined,
  }
}

/**
 * 判断是否应该继续重试
 */
function shouldRetry(analysis: FailureAnalysis, state: RalphLoopState): boolean {
  // 已达到最大尝试次数
  if (state.attempt >= state.maxAttempts) {
    return false
  }

  // 上下文问题可以重试（会补充上下文）
  if (analysis.category === 'context') {
    return true
  }

  // 方向问题可以重试（会调整方向）
  if (analysis.category === 'direction') {
    return state.attempt < 2 // 最多重试一次方向问题
  }

  // 技术问题可以重试
  if (analysis.category === 'technical') {
    return state.attempt < 2
  }

  // 未知问题谨慎重试
  return state.attempt < 1
}
