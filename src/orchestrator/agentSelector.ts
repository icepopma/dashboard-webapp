// ─────────────────────────────────────────────────────────────────
// Agent Selector - 智能体选择器
// ─────────────────────────────────────────────────────────────────

import type { TaskType, AgentType } from './types'
import type { GoalAnalysis } from './goalAnalyzer'

interface AgentCapability {
  name: string
  capabilities: TaskType[]
  successRate: number
}

/**
 * 根据任务分析选择最合适的智能体
 */
export function selectAgent(
  analysis: GoalAnalysis,
  configs: Record<AgentType, AgentCapability>
): AgentType {
  const { type, area, estimatedComplexity } = analysis
  
  // 计算每个智能体的适配分数
  const scores: Array<{ agent: AgentType; score: number }> = []
  
  for (const [agentName, config] of Object.entries(configs) as [AgentType, AgentCapability][]) {
    let score = 0
    
    // 能力匹配
    if (config.capabilities.includes(type)) {
      score += 50
    }
    
    // 成功率加成
    score += config.successRate * 30
    
    // 领域特定加成
    score += getAreaBonus(agentName, area)
    
    // 复杂度适配
    score += getComplexityBonus(agentName, estimatedComplexity)
    
    scores.push({ agent: agentName, score })
  }
  
  // 选择得分最高的
  scores.sort((a, b) => b.score - a.score)
  
  return scores[0].agent
}

function getAreaBonus(agent: AgentType, area: string): number {
  const bonuses: Record<AgentType, Record<string, number>> = {
    pop: { general: 20, docs: 15, frontend: 10, backend: 10, testing: 5, devops: 5, auth: 5 },
    codex: { backend: 20, devops: 15, testing: 10, frontend: 5, docs: 0, auth: 15, general: 10 },
    claude: { frontend: 20, docs: 15, backend: 10, testing: 10, devops: 5, auth: 10, general: 15 },
    quill: { docs: 30, general: 10, frontend: 5, backend: 0, testing: 0, devops: 0, auth: 0 },
    echo: { general: 10, docs: 5, frontend: 0, backend: 0, testing: 0, devops: 0, auth: 0 },
    scout: { general: 15, docs: 10, frontend: 0, backend: 5, testing: 0, devops: 0, auth: 0 },
    pixel: { frontend: 25, docs: 5, general: 5, backend: 0, testing: 0, devops: 0, auth: 0 },
  }
  
  return bonuses[agent]?.[area] || 0
}

function getComplexityBonus(agent: AgentType, complexity: 'low' | 'medium' | 'high'): number {
  // 高复杂度任务优先选择更强大的智能体
  const bonuses: Record<AgentType, Record<string, number>> = {
    pop: { high: 10, medium: 15, low: 10 },
    codex: { high: 15, medium: 10, low: 5 },
    claude: { high: 10, medium: 15, low: 10 },
    quill: { high: 0, medium: 5, low: 10 },
    echo: { high: 0, medium: 5, low: 10 },
    scout: { high: 5, medium: 10, low: 5 },
    pixel: { high: 0, medium: 10, low: 15 },
  }
  
  return bonuses[agent]?.[complexity] || 0
}

/**
 * 获取智能体的推荐配置
 */
export function getAgentConfig(agent: AgentType): {
  command: string
  model: string
  args: string[]
} {
  const configs: Record<AgentType, { command: string; model: string; args: string[] }> = {
    pop: {
      command: 'openclaw',
      model: 'zai/glm-5',
      args: ['agent', 'run'],
    },
    codex: {
      command: 'codex',
      model: 'gpt-5.3-codex',
      args: ['--model', 'gpt-5.3-codex', '-c', 'model_reasoning_effort=high', '--dangerously-bypass-approvals-and-sandbox'],
    },
    claude: {
      command: 'claude',
      model: 'claude-opus-4.5',
      args: ['--model', 'claude-opus-4.5', '--dangerously-skip-permissions'],
    },
    quill: {
      command: 'claude',
      model: 'claude-sonnet-4',
      args: ['--model', 'claude-sonnet-4', '--dangerously-skip-permissions'],
    },
    echo: {
      command: 'claude',
      model: 'claude-sonnet-4',
      args: ['--model', 'claude-sonnet-4', '--dangerously-skip-permissions'],
    },
    scout: {
      command: 'codex',
      model: 'gpt-5.3-codex',
      args: ['--model', 'gpt-5.3-codex', '-c', 'model_reasoning_effort=medium'],
    },
    pixel: {
      command: 'claude',
      model: 'claude-sonnet-4',
      args: ['--model', 'claude-sonnet-4', '--dangerously-skip-permissions'],
    },
  }
  
  return configs[agent]
}
