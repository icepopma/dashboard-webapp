// ─────────────────────────────────────────────────────────────────
// Goal Analyzer - 分析用户目标
// ─────────────────────────────────────────────────────────────────

import type { TaskType, TaskPriority } from './types'

export interface GoalAnalysis {
  title: string
  description: string
  type: TaskType
  priority: TaskPriority
  area: string
  requirements: string[]
  constraints: string[]
  estimatedComplexity: 'low' | 'medium' | 'high'
  suggestedFiles?: string[]
}

/**
 * 分析用户目标
 */
export async function analyzeGoal(goal: string): Promise<GoalAnalysis> {
  // 关键词检测
  const keywords = extractKeywords(goal)
  
  // 类型推断
  const type = inferTaskType(goal, keywords)
  
  // 优先级推断
  const priority = inferPriority(goal, keywords)
  
  // 面积推断
  const area = inferArea(goal, keywords)
  
  // 提取需求
  const requirements = extractRequirements(goal)
  
  // 提取约束
  const constraints = extractConstraints(goal)
  
  // 复杂度估计
  const estimatedComplexity = estimateComplexity(goal, keywords)

  return {
    title: generateTitle(goal, keywords),
    description: goal,
    type,
    priority,
    area,
    requirements,
    constraints,
    estimatedComplexity,
    suggestedFiles: suggestFiles(keywords, area),
  }
}

function extractKeywords(goal: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', '的', '了', '是', '在', '有', '和', '与', '或', '等', '这', '那', '我', '你', '他', '她', '它', '们'])
  
  return goal
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word))
}

function inferTaskType(goal: string, keywords: string[]): TaskType {
  const goalLower = goal.toLowerCase()
  
  // Bug 修复
  if (/\b(bug|fix|error|crash|broken|issue|问题|修复|错误)\b/.test(goalLower)) {
    return 'bugfix'
  }
  
  // 重构
  if (/\b(refactor|cleanup|optimize|improve|重构|优化|清理)\b/.test(goalLower)) {
    return 'refactor'
  }
  
  // 文档
  if (/\b(doc|documentation|readme|comment|文档|说明|注释)\b/.test(goalLower)) {
    return 'docs'
  }
  
  // 测试
  if (/\b(test|testing|spec|测试)\b/.test(goalLower)) {
    return 'test'
  }
  
  // 设计
  if (/\b(design|ui|ux|style|css|设计|样式)\b/.test(goalLower)) {
    return 'design'
  }
  
  // 分析
  if (/\b(analyze|analysis|research|investigate|分析|研究|调查)\b/.test(goalLower)) {
    return 'analysis'
  }
  
  // 默认为新功能
  return 'feature'
}

function inferPriority(goal: string, keywords: string[]): TaskPriority {
  const goalLower = goal.toLowerCase()
  
  // 紧急关键词
  if (/\b(urgent|critical|asap|emergency|blocker|紧急|严重|立即|马上)\b/.test(goalLower)) {
    return 'critical'
  }
  
  // 高优先级关键词
  if (/\b(important|high|priority|重要|优先|尽快)\b/.test(goalLower)) {
    return 'high'
  }
  
  // 低优先级关键词
  if (/\b(low|minor|nice to have|later|低|次要|以后|有空)\b/.test(goalLower)) {
    return 'low'
  }
  
  return 'medium'
}

function inferArea(goal: string, keywords: string[]): string {
  const goalLower = goal.toLowerCase()
  
  if (/\b(api|backend|server|database|后端|服务|数据库)\b/.test(goalLower)) return 'backend'
  if (/\b(ui|frontend|component|page|前端|组件|页面)\b/.test(goalLower)) return 'frontend'
  if (/\b(auth|login|user|permission|认证|登录|用户|权限)\b/.test(goalLower)) return 'auth'
  if (/\b(test|testing|spec|测试)\b/.test(goalLower)) return 'testing'
  if (/\b(doc|documentation|readme|文档)\b/.test(goalLower)) return 'docs'
  if (/\b(deploy|ci|cd|build|部署|构建)\b/.test(goalLower)) return 'devops'
  
  return 'general'
}

function extractRequirements(goal: string): string[] {
  const requirements: string[] = []
  
  // 提取 "需要..." 或 "must..."
  const needMatches = goal.match(/(?:需要|must|should|需要|要)[\s:：]*([^.。,!！?？]+)/gi)
  if (needMatches) {
    requirements.push(...needMatches.map(m => m.trim()))
  }
  
  return requirements
}

function extractConstraints(goal: string): string[] {
  const constraints: string[] = []
  
  // 提取 "不能..." 或 "不要..."
  const notMatches = goal.match(/(?:不能|不要|don't|cannot|禁止|避免)[\s:：]*([^.。,!！?？]+)/gi)
  if (notMatches) {
    constraints.push(...notMatches.map(m => m.trim()))
  }
  
  return constraints
}

function estimateComplexity(goal: string, keywords: string[]): 'low' | 'medium' | 'high' {
  // 基于目标长度和关键词数量估计
  const wordCount = goal.split(/\s+/).length
  const keywordCount = keywords.length
  
  // 高复杂度标志
  if (/\b(integrate|migration|refactor|rewrite|集成|迁移|重构|重写)\b/.test(goal.toLowerCase())) {
    return 'high'
  }
  
  if (wordCount > 50 || keywordCount > 10) return 'high'
  if (wordCount > 20 || keywordCount > 5) return 'medium'
  return 'low'
}

function generateTitle(goal: string, keywords: string[]): string {
  // 截取前50个字符作为标题
  let title = goal.trim()
  if (title.length > 50) {
    title = title.substring(0, 47) + '...'
  }
  return title
}

function suggestFiles(keywords: string[], area: string): string[] | undefined {
  // 基于关键词和区域建议相关文件
  const suggestions: string[] = []
  
  // 区域映射到文件路径
  const areaFileMap: Record<string, string[]> = {
    'frontend': ['src/components/', 'src/app/', 'src/views/', 'src/hooks/'],
    'backend': ['src/app/api/', 'src/lib/', 'src/services/'],
    'auth': ['src/lib/auth/', 'src/middleware/', 'src/app/api/auth/'],
    'testing': ['tests/', 'src/__tests__/', 'e2e/'],
    'docs': ['README.md', 'docs/', 'CHANGELOG.md'],
    'devops': ['.github/workflows/', 'Dockerfile', 'vercel.json'],
  }
  
  // 添加区域相关的目录
  if (areaFileMap[area]) {
    suggestions.push(...areaFileMap[area])
  }
  
  // 关键词映射到特定文件
  const keywordFileMap: Record<string, string[]> = {
    'agent': ['src/launcher/', 'src/orchestrator/', 'src/lib/agents/'],
    'task': ['src/tasks/', 'src/orchestrator/', 'src/app/api/tasks/'],
    'idea': ['src/lib/supabase.ts', 'src/app/api/ideas/'],
    'memory': ['src/memory/', 'src/lib/memory/'],
    'api': ['src/app/api/', 'src/lib/'],
    'ui': ['src/components/ui/', 'src/components/'],
    'button': ['src/components/ui/button.tsx'],
    'modal': ['src/components/ui/dialog.tsx', 'src/components/ui/modal.tsx'],
    'form': ['src/components/ui/form.tsx', 'src/components/'],
    'test': ['tests/', 'playwright.config.ts'],
    'auth': ['src/lib/auth/', 'src/middleware.ts'],
    'database': ['src/lib/supabase.ts', 'supabase/'],
    'theme': ['src/hooks/use-theme.ts', 'src/components/theme-toggle.tsx'],
    'shortcut': ['src/hooks/use-keyboard-shortcut.ts', 'src/components/keyboard-shortcuts-help.tsx'],
    'notify': ['src/notify/', 'src/components/ui/sonner.tsx'],
    'orchestrator': ['src/orchestrator/', 'src/launcher/'],
    'scanner': ['src/orchestrator/scanners/'],
  }
  
  // 检查关键词并添加相关文件
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase()
    for (const [key, files] of Object.entries(keywordFileMap)) {
      if (lowerKeyword.includes(key) || key.includes(lowerKeyword)) {
        suggestions.push(...files)
      }
    }
  }
  
  // 去重并返回
  const unique = [...new Set(suggestions)]
  return unique.length > 0 ? unique : undefined
}
