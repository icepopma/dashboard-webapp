// ─────────────────────────────────────────────────────────────────
// GitHub Issues Scanner - Scan GitHub issues for proactive tasks
// ─────────────────────────────────────────────────────────────────

import type { Task, TaskType, TaskPriority } from '../types'

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  labels: string[]
  state: 'open' | 'closed'
  createdAt: string
  updatedAt: string
  assignee: string | null
  milestone: string | null
  url: string
}

export interface GitHubScannerConfig {
  owner: string
  repo: string
  token?: string
  labels?: string[]  // Filter by labels
  limit?: number     // Max issues to fetch
}

/**
 * 扫描 GitHub Issues 并转换为任务
 */
export async function scanGitHubIssues(config: GitHubScannerConfig): Promise<Task[]> {
  const { owner, repo, token, labels, limit = 10 } = config
  
  try {
    // 构建 API URL
    const apiUrl = new URL(`https://api.github.com/repos/${owner}/${repo}/issues`)
    apiUrl.searchParams.set('state', 'open')
    apiUrl.searchParams.set('sort', 'updated')
    apiUrl.searchParams.set('direction', 'desc')
    apiUrl.searchParams.set('per_page', String(limit))
    
    if (labels && labels.length > 0) {
      apiUrl.searchParams.set('labels', labels.join(','))
    }

    // 发起请求
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Pop-Orchestrator/1.0',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(apiUrl.toString(), { headers })
    
    if (!response.ok) {
      console.error(`[GitHub Scanner] API error: ${response.status} ${response.statusText}`)
      return []
    }

    const issues: any[] = await response.json()
    
    // 过滤掉 PR（GitHub API 会返回 PR 在 issues 端点）
    const actualIssues = issues.filter(issue => !issue.pull_request)
    
    // 转换为任务
    return actualIssues.map(issue => convertIssueToTask(issue, owner, repo))
  } catch (error) {
    console.error('[GitHub Scanner] Error scanning issues:', error)
    return []
  }
}

/**
 * 将 GitHub Issue 转换为任务
 */
function convertIssueToTask(issue: any, owner: string, repo: string): Task {
  const labels = issue.labels?.map((l: any) => l.name) || []
  
  return {
    id: `gh-${owner}-${repo}-${issue.number}`,
    title: `GitHub #${issue.number}: ${issue.title}`,
    description: issue.body || '',
    type: inferTaskType(labels),
    priority: inferPriority(labels),
    status: 'pending',
    createdAt: new Date(issue.created_at),
    updatedAt: new Date(issue.updated_at),
    goal: `Fix or implement GitHub issue #${issue.number}: ${issue.title}`,
    context: {
      references: [issue.html_url],
      requirements: extractRequirements(issue.body),
    },
    attempts: 0,
    maxAttempts: 3,
  }
}

/**
 * 从标签推断任务类型
 */
function inferTaskType(labels: string[]): TaskType {
  const labelSet = new Set(labels.map(l => l.toLowerCase()))
  
  if (labelSet.has('bug')) return 'bugfix'
  if (labelSet.has('enhancement') || labelSet.has('feature')) return 'feature'
  if (labelSet.has('documentation') || labelSet.has('docs')) return 'docs'
  if (labelSet.has('refactor')) return 'refactor'
  if (labelSet.has('test')) return 'test'
  if (labelSet.has('design')) return 'design'
  
  return 'feature' // Default
}

/**
 * 从标签推断优先级
 */
function inferPriority(labels: string[]): TaskPriority {
  const labelSet = new Set(labels.map(l => l.toLowerCase()))
  
  if (labelSet.has('critical') || labelSet.has('urgent') || labelSet.has('p0')) return 'critical'
  if (labelSet.has('high') || labelSet.has('p1')) return 'high'
  if (labelSet.has('medium') || labelSet.has('p2')) return 'medium'
  
  return 'low'
}

/**
 * 从 issue body 提取需求
 */
function extractRequirements(body: string | null): string[] {
  if (!body) return []
  
  const requirements: string[] = []
  const lines = body.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 匹配常见的需求格式
    if (trimmed.match(/^[-*]\s*\[?\s*\]?/)) {
      // Bullet points or checkboxes
      requirements.push(trimmed.replace(/^[-*]\s*\[?\s*[x]?\s*\]?\s*/, ''))
    } else if (trimmed.match(/^\d+\.\s/)) {
      // Numbered lists
      requirements.push(trimmed.replace(/^\d+\.\s*/, ''))
    }
  }
  
  return requirements.filter(r => r.length > 0)
}

/**
 * 获取单个 issue 详情
 */
export async function getIssueDetails(
  owner: string, 
  repo: string, 
  issueNumber: number,
  token?: string
): Promise<GitHubIssue | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Pop-Orchestrator/1.0',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
      { headers }
    )
    
    if (!response.ok) return null
    
    const issue = await response.json()
    
    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body,
      labels: issue.labels?.map((l: any) => l.name) || [],
      state: issue.state,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      assignee: issue.assignee?.login || null,
      milestone: issue.milestone?.title || null,
      url: issue.html_url,
    }
  } catch (error) {
    console.error('[GitHub Scanner] Error fetching issue:', error)
    return null
  }
}
