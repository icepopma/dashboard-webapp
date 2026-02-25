// ─────────────────────────────────────────────────────────────────
// Sentry Scanner - Scan Sentry errors for proactive bugfix tasks
// ─────────────────────────────────────────────────────────────────

import type { Task } from '../types'

export interface SentryError {
  id: string
  title: string
  message: string
  culprit: string      // File/location where error occurred
  level: 'error' | 'warning' | 'info'
  count: number        // Occurrence count
  firstSeen: string
  lastSeen: string
  project: string
  url: string
}

export interface SentryScannerConfig {
  organization: string
  project?: string
  token?: string       // Sentry auth token
  environment?: string
  minCount?: number    // Minimum occurrence count to consider
  limit?: number       // Max errors to fetch
}

/**
 * 扫描 Sentry 错误并转换为任务
 */
export async function scanSentryErrors(config: SentryScannerConfig): Promise<Task[]> {
  const { 
    organization, 
    project, 
    token, 
    environment,
    minCount = 5, 
    limit = 10 
  } = config
  
  if (!token) {
    console.warn('[Sentry Scanner] No token provided, skipping scan')
    return []
  }

  try {
    // 构建 Sentry API URL
    const baseUrl = `https://sentry.io/api/0/projects/${organization}`
    const projectSlug = project || ''
    
    // 获取问题列表
    const issuesUrl = new URL(`${baseUrl}/${projectSlug}/issues/`)
    issuesUrl.searchParams.set('query', 'is:unresolved')
    if (environment) {
      issuesUrl.searchParams.set('environment', environment)
    }
    issuesUrl.searchParams.set('sort', 'freq')  // Sort by frequency
    issuesUrl.searchParams.set('limit', String(limit))

    const response = await fetch(issuesUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`[Sentry Scanner] API error: ${response.status} ${response.statusText}`)
      return []
    }

    const issues: any[] = await response.json()
    
    // 过滤掉低频错误
    const significantIssues = issues.filter(
      issue => issue.count >= minCount
    )
    
    // 转换为任务
    return significantIssues.map(issue => convertErrorToTask(issue, organization, projectSlug))
  } catch (error) {
    console.error('[Sentry Scanner] Error scanning:', error)
    return []
  }
}

/**
 * 将 Sentry 错误转换为任务
 */
function convertErrorToTask(issue: any, organization: string, project: string): Task {
  return {
    id: `sentry-${issue.id}`,
    title: `Fix: ${issue.title}`,
    description: issue.metadata?.value || issue.culprit || '',
    type: 'bugfix',
    priority: inferPriorityFromCount(issue.count),
    status: 'pending',
    createdAt: new Date(issue.firstSeen),
    updatedAt: new Date(issue.lastSeen),
    goal: `Fix Sentry error: ${issue.title}`,
    context: {
      files: extractFiles(issue.culprit),
      requirements: [
        `Error occurred ${issue.count} times`,
        `Location: ${issue.culprit}`,
        `Type: ${issue.metadata?.type || 'Unknown'}`,
      ],
      references: [
        `https://sentry.io/organizations/${organization}/issues/${issue.id}/`,
      ],
    },
    attempts: 0,
    maxAttempts: 3,
  }
}

/**
 * 根据出现次数推断优先级
 */
function inferPriorityFromCount(count: number): Task['priority'] {
  if (count >= 100) return 'critical'
  if (count >= 50) return 'high'
  if (count >= 10) return 'medium'
  return 'low'
}

/**
 * 从 culprit 提取文件路径
 */
function extractFiles(culprit: string): string[] {
  // Sentry culprit 格式通常是 "filename:line" 或模块路径
  const files: string[] = []
  
  // 尝试提取文件路径
  const fileMatch = culprit.match(/([a-zA-Z0-9_\-/.]+\.[a-z]{1,4})/gi)
  if (fileMatch) {
    files.push(...fileMatch)
  }
  
  return [...new Set(files)]  // 去重
}

/**
 * 获取错误详情
 */
export async function getErrorDetails(
  organization: string,
  issueId: string,
  token?: string
): Promise<SentryError | null> {
  if (!token) return null

  try {
    const response = await fetch(
      `https://sentry.io/api/0/issues/${issueId}/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) return null

    const issue = await response.json()

    return {
      id: issue.id,
      title: issue.title,
      message: issue.metadata?.value || '',
      culprit: issue.culprit,
      level: issue.level,
      count: issue.count,
      firstSeen: issue.firstSeen,
      lastSeen: issue.lastSeen,
      project: issue.project?.slug || '',
      url: `https://sentry.io/organizations/${organization}/issues/${issue.id}/`,
    }
  } catch (error) {
    console.error('[Sentry Scanner] Error fetching details:', error)
    return null
  }
}
