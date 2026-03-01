// ─────────────────────────────────────────────────────────────────
// Model Router - 模型路由器
// 基于 token-optimizer 的 model_router.py 逻辑
// ─────────────────────────────────────────────────────────────────

import type { TaskType, AgentType } from './types'

// 模型层级
export type ModelTier = 'cheap' | 'balanced' | 'smart'

// Provider 配置
interface ProviderConfig {
  models: Record<ModelTier, string>
  costs: Record<ModelTier, number> // $/MTok (input)
}

const PROVIDERS: Record<string, ProviderConfig> = {
  anthropic: {
    models: {
      cheap: 'claude-haiku-4',
      balanced: 'claude-sonnet-4-5',
      smart: 'claude-opus-4-5',
    },
    costs: { cheap: 0.25, balanced: 3.00, smart: 15.00 },
  },
  openai: {
    models: {
      cheap: 'gpt-4.1-nano',
      balanced: 'gpt-4.1-mini',
      smart: 'gpt-4.1',
    },
    costs: { cheap: 0.10, balanced: 0.40, smart: 2.00 },
  },
  google: {
    models: {
      cheap: 'gemini-2.0-flash',
      balanced: 'gemini-2.5-flash',
      smart: 'gemini-2.5-pro',
    },
    costs: { cheap: 0.075, balanced: 0.15, smart: 1.25 },
  },
  zai: {
    models: {
      cheap: 'zai/glm-4-flash',
      balanced: 'zai/glm-5',
      smart: 'zai/glm-5',
    },
    costs: { cheap: 0.01, balanced: 0.05, smart: 0.05 },
  },
}

// Agent 到 Provider 的映射
const AGENT_PROVIDER: Record<AgentType, string> = {
  pop: 'zai',
  codex: 'openai',
  claude: 'anthropic',
  quill: 'anthropic',
  echo: 'anthropic',
  scout: 'openai',
  pixel: 'anthropic',
}

// 通信类关键词 - 强制 cheap
const COMMUNICATION_KEYWORDS = [
  'hi', 'hey', 'hello', 'yo', 'sup',
  'thanks', 'thank', 'thx',
  'ok', 'okay', 'sure', 'got it', 'understood',
  'yes', 'yeah', 'yep', 'no', 'nope',
  'good', 'great', 'nice', 'cool', 'awesome',
]

// 后台任务关键词 - 强制 cheap
const BACKGROUND_KEYWORDS = [
  'heartbeat', 'cron', 'scheduled', 'periodic', 'reminder',
  'parse', 'extract', 'read log', 'scan', 'process csv', 'process json',
  'monitor', 'poll', 'check status',
]

// 任务类型到模型层级的默认映射
const TASK_TIER_MAP: Record<TaskType, ModelTier> = {
  analysis: 'cheap',    // 分析用 cheap 足够
  docs: 'balanced',     // 文档需要质量
  test: 'cheap',        // 测试用 cheap
  design: 'smart',      // 设计需要思考
  feature: 'balanced',  // 功能开发
  bugfix: 'balanced',   // bug 修复
  refactor: 'balanced', // 重构
}

/**
 * 分类任务复杂度
 */
export function classifyTaskComplexity(
  goal: string,
  taskType: TaskType
): {
  tier: ModelTier
  confidence: number
  reasoning: string
} {
  const goalLower = goal.toLowerCase()

  // 1. 通信类 → 强制 cheap
  for (const keyword of COMMUNICATION_KEYWORDS) {
    if (goalLower.includes(keyword) && goalLower.length < 50) {
      return {
        tier: 'cheap',
        confidence: 1.0,
        reasoning: 'Simple communication - use cheapest model',
      }
    }
  }

  // 2. 后台任务 → 强制 cheap
  for (const keyword of BACKGROUND_KEYWORDS) {
    if (goalLower.includes(keyword)) {
      return {
        tier: 'cheap',
        confidence: 1.0,
        reasoning: 'Background task - use cheapest model',
      }
    }
  }

  // 3. 根据任务类型
  const defaultTier = TASK_TIER_MAP[taskType] || 'balanced'

  // 4. 复杂度关键词调整
  const complexityKeywords = {
    smart: ['complex', 'architect', 'comprehensive', 'deep', 'design system', 'multi-agent'],
    cheap: ['simple', 'quick', 'basic', 'minor', 'small'],
  }

  for (const keyword of complexityKeywords.smart) {
    if (goalLower.includes(keyword)) {
      return {
        tier: 'smart',
        confidence: 0.8,
        reasoning: `Complex task detected: "${keyword}"`,
      }
    }
  }

  for (const keyword of complexityKeywords.cheap) {
    if (goalLower.includes(keyword)) {
      return {
        tier: 'cheap',
        confidence: 0.8,
        reasoning: `Simple task detected: "${keyword}"`,
      }
    }
  }

  return {
    tier: defaultTier,
    confidence: 0.6,
    reasoning: `Default tier for task type: ${taskType}`,
  }
}

/**
 * 获取路由后的模型
 */
export function getRoutedModel(
  agent: AgentType,
  goal: string,
  taskType: TaskType
): {
  model: string
  tier: ModelTier
  provider: string
  costSavings: number
  reasoning: string
} {
  const classification = classifyTaskComplexity(goal, taskType)
  const provider = AGENT_PROVIDER[agent]
  const providerConfig = PROVIDERS[provider] || PROVIDERS.anthropic

  const model = providerConfig.models[classification.tier]
  const baseCost = providerConfig.costs.balanced
  const tierCost = providerConfig.costs[classification.tier]
  const costSavings = Math.round((1 - tierCost / baseCost) * 100)

  return {
    model,
    tier: classification.tier,
    provider,
    costSavings: Math.max(0, costSavings),
    reasoning: classification.reasoning,
  }
}

/**
 * 计算成本节省
 */
export function calculateCostSavings(
  originalModel: string,
  routedModel: string,
  estimatedTokens: number
): {
  originalCost: number
  routedCost: number
  savings: number
  savingsPercent: number
} {
  // 简化版：根据模型名推断成本
  const getCostPerMTok = (model: string): number => {
    if (model.includes('opus')) return 15.0
    if (model.includes('sonnet')) return 3.0
    if (model.includes('haiku')) return 0.25
    if (model.includes('gpt-4.1-nano') || model.includes('flash')) return 0.10
    if (model.includes('gpt-4.1-mini')) return 0.40
    if (model.includes('gpt-4.1') || model.includes('pro')) return 2.0
    if (model.includes('glm-4-flash')) return 0.01
    if (model.includes('glm-5')) return 0.05
    return 3.0 // 默认
  }

  const originalCost = (getCostPerMTok(originalModel) * estimatedTokens) / 1_000_000
  const routedCost = (getCostPerMTok(routedModel) * estimatedTokens) / 1_000_000
  const savings = originalCost - routedCost
  const savingsPercent = originalCost > 0 ? Math.round((savings / originalCost) * 100) : 0

  return {
    originalCost,
    routedCost,
    savings,
    savingsPercent,
  }
}

/**
 * 获取 Agent 的模型配置（带路由）
 */
export function getAgentModelConfig(
  agent: AgentType,
  goal: string,
  taskType: TaskType
): {
  model: string
  tier: ModelTier
  provider: string
  command: string
  args: string[]
  costSavings: number
  reasoning: string
} {
  const routing = getRoutedModel(agent, goal, taskType)
  const provider = PROVIDERS[routing.provider]

  // 构建命令参数
  let command = 'openclaw'
  let args: string[] = []

  switch (routing.provider) {
    case 'anthropic':
      command = 'claude'
      args = ['--model', routing.model, '--dangerously-skip-permissions']
      break
    case 'openai':
      command = 'codex'
      args = ['--model', routing.model]
      if (routing.tier === 'smart') {
        args.push('-c', 'model_reasoning_effort=high')
      }
      args.push('--dangerously-bypass-approvals-and-sandbox')
      break
    case 'zai':
      command = 'openclaw'
      args = ['agent', 'run']
      break
    default:
      command = 'openclaw'
      args = ['agent', 'run']
  }

  return {
    ...routing,
    command,
    args,
  }
}
