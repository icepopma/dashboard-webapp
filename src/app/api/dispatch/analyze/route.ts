// ─────────────────────────────────────────────────────────────────
// Dispatch Analyze API - 任务分析 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody } from '@/lib/api-handler'
import { AppError } from '@/lib/errors'
import { AGENT_CONFIGS } from '@/lib/agent-state'
import type { AgentType } from '@/orchestrator/types'

// 任务类型关键词映射
const TASK_KEYWORDS: Record<string, AgentType[]> = {
  // 写作类
  '写': ['quill'],
  '博客': ['quill'],
  '文章': ['quill'],
  '文档': ['quill', 'codex'],
  '文案': ['quill'],
  
  // 代码类
  '代码': ['codex', 'claude'],
  '功能': ['codex', 'claude'],
  'bug': ['codex', 'claude'],
  '修复': ['codex', 'claude'],
  '重构': ['codex', 'claude'],
  '测试': ['codex'],
  
  // 设计类
  '设计': ['pixel'],
  'ui': ['pixel'],
  '界面': ['pixel'],
  '图形': ['pixel'],
  '图标': ['pixel'],
  
  // 分析类
  '分析': ['scout'],
  '研究': ['scout'],
  '调研': ['scout'],
  '趋势': ['scout'],
  '数据': ['scout'],
  
  // 发布类
  '发布': ['echo'],
  '分发': ['echo'],
  '同步': ['echo'],
  '社交媒体': ['echo'],
  '推文': ['echo'],
}

/**
 * POST /api/dispatch/analyze - 分析任务并推荐智能体
 */
export const POST = apiHandler(async (request) => {
  const body = await parseJsonBody<{ description: string }>(request)
  
  if (!body.description || !body.description.trim()) {
    throw AppError.badRequest('请输入任务描述')
  }

  const description = body.description.toLowerCase()
  
  // 统计每个智能体的匹配分数
  const scores: Record<AgentType, number> = {
    pop: 0,
    codex: 0,
    claude: 0,
    quill: 0,
    echo: 0,
    scout: 0,
    pixel: 0,
  }
  
  // 根据关键词计分
  for (const [keyword, agents] of Object.entries(TASK_KEYWORDS)) {
    if (description.includes(keyword)) {
      agents.forEach(agent => {
        scores[agent] += 1
      })
    }
  }
  
  // 找出最高分的智能体
  let bestAgent: AgentType = 'codex' // 默认
  let maxScore = 0
  
  for (const [agent, score] of Object.entries(scores)) {
    if (agent !== 'pop' && score > maxScore) {
      maxScore = score
      bestAgent = agent as AgentType
    }
  }
  
  // 如果没有匹配到任何关键词，默认使用 codex
  if (maxScore === 0) {
    bestAgent = 'codex'
    maxScore = 0.5 // 基础置信度
  }
  
  // 计算置信度（基于匹配分数）
  const confidence = Math.min(95, Math.round(50 + maxScore * 15))
  
  // 生成推荐理由
  const reasons: Record<AgentType, string> = {
    pop: 'Pop 可以协调多个智能体完成复杂任务',
    codex: 'Codex 擅长代码开发和功能实现',
    claude: 'Claude 适合复杂的代码任务和技术分析',
    quill: 'Quill 专注于内容创作和文档写作',
    echo: 'Echo 负责内容分发和社交媒体管理',
    scout: 'Scout 擅长研究和数据分析',
    pixel: 'Pixel 专注于 UI/UX 设计和图形创作',
  }

  const config = AGENT_CONFIGS[bestAgent]
  
  return {
    recommendation: {
      type: bestAgent,
      name: config.name,
      emoji: config.emoji,
      confidence,
      reason: reasons[bestAgent],
      capabilities: config.capabilities,
    },
    analysis: {
      description: body.description,
      matchedKeywords: Object.keys(TASK_KEYWORDS).filter(k => description.includes(k)),
      allScores: scores,
    },
  }
})
