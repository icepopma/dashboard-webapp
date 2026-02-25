// ─────────────────────────────────────────────────────────────────
// Prompt Builder - 构建上下文丰富的提示词
// ─────────────────────────────────────────────────────────────────

import type { Task, TaskContext, AgentType, MemoryEntry } from './types'

interface PromptBuilderOptions {
  includeMemory?: boolean
  includeContext?: boolean
  includeHistory?: boolean
  includeConstraints?: boolean
  maxLength?: number
}

/**
 * 构建上下文丰富的提示词
 */
export async function buildPrompt(
  task: Task,
  context: TaskContext,
  options: PromptBuilderOptions = {}
): Promise<string> {
  const {
    includeMemory = true,
    includeContext = true,
    includeHistory = true,
    includeConstraints = true,
    maxLength = 8000,
  } = options

  const sections: string[] = []

  // 1. 任务描述
  sections.push(`## 任务目标
${task.goal}

### 任务详情
- 类型: ${task.type}
- 优先级: ${task.priority}
- 标题: ${task.title}
`)

  // 2. 上下文信息
  if (includeContext && context.requirements?.length) {
    sections.push(`## 需求
${context.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`)
  }

  // 3. 约束条件
  if (includeConstraints && context.constraints?.length) {
    sections.push(`## 约束条件
${context.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}
`)
  }

  // 4. 相关文件
  if (context.files?.length) {
    sections.push(`## 相关文件
${context.files.map(f => `- \`${f}\``).join('\n')}
`)
  }

  // 5. 历史经验
  if (includeHistory && context.history?.length) {
    const successPatterns = context.history
      .filter(m => m.type === 'success')
      .slice(0, 3)
    
    if (successPatterns.length > 0) {
      sections.push(`## 成功经验
${successPatterns.map((m, i) => `
### 经验 ${i + 1}
${m.value}
`).join('\n')}
`)
    }

    const failurePatterns = context.history
      .filter(m => m.type === 'failure')
      .slice(0, 2)
    
    if (failurePatterns.length > 0) {
      sections.push(`## 需要避免的错误
${failurePatterns.map((m, i) => `${i + 1}. ${m.value}`).join('\n')}
`)
    }
  }

  // 6. 输出要求
  sections.push(`## 输出要求
1. 完成任务后，确保代码能够编译通过
2. 添加必要的测试
3. 更新相关文档
4. 提交时使用清晰的 commit message
`)

  // 合并并检查长度
  let prompt = sections.join('\n\n')
  
  if (prompt.length > maxLength) {
    // 截断但保留关键信息
    prompt = prompt.substring(0, maxLength)
    prompt += '\n\n[提示词已截断，保留最重要的上下文]'
  }

  return prompt
}

/**
 * 根据失败分析调整提示词
 */
export async function adjustPrompt(
  originalPrompt: string,
  analysis: {
    reason: string
    category: 'context' | 'direction' | 'technical' | 'unknown'
    suggestion: string
  }
): Promise<string> {
  const adjustments: string[] = []

  switch (analysis.category) {
    case 'context':
      adjustments.push(`
## 重要补充上下文
${analysis.suggestion}

请确保你完全理解任务上下文后再开始执行。
`)
      break

    case 'direction':
      adjustments.push(`
## 方向修正
${analysis.suggestion}

请按照正确的方向重新执行任务。
`)
      break

    case 'technical':
      adjustments.push(`
## 技术问题处理
${analysis.suggestion}

请解决上述技术问题后继续。
`)
      break

    default:
      adjustments.push(`
## 上次执行反馈
问题: ${analysis.reason}
建议: ${analysis.suggestion}
`)
  }

  return originalPrompt + '\n\n' + adjustments.join('\n')
}

/**
 * 为代码审查构建提示词
 */
export function buildReviewPrompt(
  prDescription: string,
  diff: string,
  reviewerType: 'codex' | 'claude' | 'gemini'
): string {
  const focusAreas: Record<string, string> = {
    codex: '边界情况、逻辑错误、异常处理、竞态条件',
    claude: '代码风格、可读性、最佳实践',
    gemini: '安全问题、扩展性问题、性能优化',
  }

  return `## 代码审查任务

### PR 描述
${prDescription}

### 代码变更
\`\`\`diff
${diff}
\`\`\`

### 审查重点
请重点关注: ${focusAreas[reviewerType]}

### 输出格式
- 如果发现问题，请在 PR 下评论
- 标记严重程度: 🔴 关键 / 🟡 建议 / 🟢 可选
- 提供具体的修复建议
`
}
