// ─────────────────────────────────────────────────────────────────
// Dispatch Analyze API - 智能任务分析 API
// 基于 dispatching-parallel-agents 和 task-coordination-strategies
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody } from '@/lib/api-handler'
import { AppError } from '@/lib/errors'
import { AGENT_CONFIGS, agentStateStore } from '@/lib/agent-state'
import type { AgentType } from '@/orchestrator/types'

// ─────────────────────────────────────────────────────────────────
// 任务分类
// ─────────────────────────────────────────────────────────────────

interface TaskCategory {
  name: string
  keywords: string[]
  primaryAgent: AgentType
  secondaryAgents: AgentType[]
  complexity: 'low' | 'medium' | 'high'
}

const TASK_CATEGORIES: TaskCategory[] = [
  // 写作类
  {
    name: 'content-writing',
    keywords: ['写', '博客', '文章', '文档', '文案', '内容', '创作'],
    primaryAgent: 'quill',
    secondaryAgents: ['scout'],
    complexity: 'medium',
  },
  
  // 代码开发类
  {
    name: 'code-development',
    keywords: ['代码', '功能', '实现', '开发', '添加', '创建'],
    primaryAgent: 'codex',
    secondaryAgents: ['claude'],
    complexity: 'high',
  },
  
  // Bug 修复类
  {
    name: 'bug-fix',
    keywords: ['bug', '修复', '错误', '问题', '崩溃', '异常'],
    primaryAgent: 'codex',
    secondaryAgents: ['claude'],
    complexity: 'medium',
  },
  
  // 代码重构类
  {
    name: 'refactoring',
    keywords: ['重构', '优化', '改进', '清理', '整理'],
    primaryAgent: 'claude',
    secondaryAgents: ['codex'],
    complexity: 'high',
  },
  
  // 测试类
  {
    name: 'testing',
    keywords: ['测试', 'test', '单元测试', 'e2e', '集成测试'],
    primaryAgent: 'codex',
    secondaryAgents: [],
    complexity: 'medium',
  },
  
  // 设计类
  {
    name: 'design',
    keywords: ['设计', 'ui', '界面', '图形', '图标', 'logo', '视觉'],
    primaryAgent: 'pixel',
    secondaryAgents: [],
    complexity: 'high',
  },
  
  // 研究分析类
  {
    name: 'research',
    keywords: ['分析', '研究', '调研', '趋势', '数据', '报告', '调查'],
    primaryAgent: 'scout',
    secondaryAgents: ['quill'],
    complexity: 'medium',
  },
  
  // 发布分发类
  {
    name: 'publishing',
    keywords: ['发布', '分发', '同步', '社交媒体', '推文', '公众号'],
    primaryAgent: 'echo',
    secondaryAgents: ['quill'],
    complexity: 'low',
  },
]

// ─────────────────────────────────────────────────────────────────
// 任务复杂度分析
// ─────────────────────────────────────────────────────────────────

interface TaskAnalysis {
  category: TaskCategory | null
  complexity: 'low' | 'medium' | 'high'
  isMultiStep: boolean
  needsResearch: boolean
  needsDesign: boolean
  needsCoding: boolean
  needsWriting: boolean
  needsPublishing: boolean
  suggestedAgents: AgentType[]
  executionMode: 'single' | 'sequential' | 'parallel'
  subtasks: { task: string; agent: AgentType }[]
}

function analyzeTask(description: string): TaskAnalysis {
  const desc = description.toLowerCase()
  
  // 检测各类需求
  const needsCoding = /代码|功能|实现|开发|bug|修复|重构|测试/i.test(desc)
  const needsWriting = /写|博客|文章|文档|文案|内容/i.test(desc)
  const needsResearch = /分析|研究|调研|趋势|数据|报告/i.test(desc)
  const needsDesign = /设计|ui|界面|图形|图标|logo/i.test(desc)
  const needsPublishing = /发布|分发|同步|社交|推文/i.test(desc)
  
  // 判断是否多步骤
  const isMultiStep = /然后|之后|接着|并且|同时|以及|再|最后/i.test(desc) ||
    (needsCoding && needsWriting) ||
    (needsResearch && needsWriting) ||
    (needsDesign && needsCoding)
  
  // 匹配任务类别
  let bestCategory: TaskCategory | null = null
  let maxScore = 0
  
  for (const category of TASK_CATEGORIES) {
    let score = 0
    for (const keyword of category.keywords) {
      if (desc.includes(keyword)) {
        score += 1
      }
    }
    if (score > maxScore) {
      maxScore = score
      bestCategory = category
    }
  }
  
  // 确定复杂度
  let complexity: 'low' | 'medium' | 'high' = 'low'
  if (isMultiStep || (needsCoding && needsDesign)) {
    complexity = 'high'
  } else if (needsCoding || needsDesign || needsResearch) {
    complexity = 'medium'
  }
  
  // 确定建议的 agents
  const suggestedAgents: AgentType[] = []
  if (needsCoding) suggestedAgents.push('codex', 'claude')
  if (needsWriting) suggestedAgents.push('quill')
  if (needsResearch) suggestedAgents.push('scout')
  if (needsDesign) suggestedAgents.push('pixel')
  if (needsPublishing) suggestedAgents.push('echo')
  
  // 去重
  const uniqueAgents = [...new Set(suggestedAgents)]
  
  // 确定执行模式
  let executionMode: 'single' | 'sequential' | 'parallel' = 'single'
  if (uniqueAgents.length > 1) {
    // 如果任务有先后依赖，用串行；否则用并行
    executionMode = isMultiStep ? 'sequential' : 'parallel'
  }
  
  // 生成子任务和对应的 agent
  const subtasks: { task: string; agent: AgentType }[] = []
  if (isMultiStep) {
    if (needsResearch) subtasks.push({ task: '研究分析', agent: 'scout' })
    if (needsDesign) subtasks.push({ task: '设计', agent: 'pixel' })
    if (needsCoding) subtasks.push({ task: '开发实现', agent: 'codex' })
    if (needsWriting) subtasks.push({ task: '内容创作', agent: 'quill' })
    if (needsPublishing) subtasks.push({ task: '发布分发', agent: 'echo' })
  }
  
  return {
    category: bestCategory,
    complexity,
    isMultiStep,
    needsResearch,
    needsDesign,
    needsCoding,
    needsWriting,
    needsPublishing,
    suggestedAgents: uniqueAgents.length > 0 ? uniqueAgents : ['codex'],
    executionMode,
    subtasks,
  }
}

// ─────────────────────────────────────────────────────────────────
// API Handler
// ─────────────────────────────────────────────────────────────────

/**
 * POST /api/dispatch/analyze - 智能分析任务并推荐执行方案
 */
export const POST = apiHandler(async (request) => {
  const body = await parseJsonBody<{ description: string }>(request)
  
  if (!body.description || !body.description.trim()) {
    throw AppError.badRequest('请输入任务描述')
  }

  const description = body.description
  
  // 执行任务分析
  const analysis = analyzeTask(description)
  
  // 获取主要推荐 agent
  const primaryAgent = analysis.category?.primaryAgent || analysis.suggestedAgents[0] || 'codex'
  const config = AGENT_CONFIGS[primaryAgent]
  
  // 获取 agent 当前状态
  const currentState = agentStateStore.getState(primaryAgent)
  const isAvailable = currentState?.status !== 'working'
  
  // 计算置信度
  const confidence = analysis.category ? 
    Math.min(95, 60 + (analysis.complexity === 'high' ? 20 : 10)) : 50
  
  // 生成推荐理由
  const reasons: string[] = []
  if (analysis.category) {
    reasons.push(`任务类型: ${analysis.category.name}`)
  }
  if (analysis.isMultiStep) {
    reasons.push('检测到多步骤任务，建议分步执行')
  }
  if (analysis.executionMode === 'parallel' && analysis.suggestedAgents.length > 1) {
    reasons.push(`建议并行调度 ${analysis.suggestedAgents.length} 个智能体`)
  }
  reasons.push(`${config.name} ${config.capabilities.slice(0, 2).join('、')}`)
  
  return {
    recommendation: {
      type: primaryAgent,
      name: config.name,
      emoji: config.emoji,
      confidence,
      reason: reasons.join('。'),
      capabilities: config.capabilities,
      currentStatus: currentState?.status || 'idle',
      isAvailable,
    },
    analysis: {
      description,
      complexity: analysis.complexity,
      isMultiStep: analysis.isMultiStep,
      executionMode: analysis.executionMode,
      suggestedAgents: analysis.suggestedAgents,
      subtasks: analysis.subtasks,
      needs: {
        research: analysis.needsResearch,
        design: analysis.needsDesign,
        coding: analysis.needsCoding,
        writing: analysis.needsWriting,
        publishing: analysis.needsPublishing,
      },
    },
    // 如果是多步骤任务，提供完整的执行计划
    executionPlan: analysis.isMultiStep ? {
      mode: analysis.executionMode,
      steps: analysis.subtasks.map((subtask, index) => ({
        step: index + 1,
        task: subtask.task,
        agent: subtask.agent,
      })),
    } : null,
  }
})
