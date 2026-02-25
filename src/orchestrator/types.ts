// ─────────────────────────────────────────────────────────────────
// Agent Cluster Types
// ─────────────────────────────────────────────────────────────────

// Task Types
export type TaskType = 'feature' | 'bugfix' | 'refactor' | 'docs' | 'test' | 'design' | 'analysis'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'pending' | 'analyzing' | 'running' | 'reviewing' | 'completed' | 'failed' | 'blocked'
export type TaskEvent = 'start' | 'complete' | 'fail' | 'block' | 'unblock' | 'approve' | 'reject' | 'cancel' | 'retry'

export interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  createdAt: Date
  updatedAt: Date
  goal: string           // 原始用户目标
  context: TaskContext   // 任务上下文
  agent?: AgentType      // 分配的智能体
  sessionId?: string     // 执行会话ID
  prNumber?: number      // PR 编号
  attempts: number       // 尝试次数
  maxAttempts: number    // 最大尝试次数
  result?: TaskResult    // 执行结果
  failureAnalysis?: FailureAnalysis  // 失败分析
}

export interface TaskContext {
  files?: string[]       // 相关文件
  requirements?: string[] // 需求列表
  constraints?: string[]  // 约束条件
  references?: string[]   // 参考链接
  history?: MemoryEntry[] // 相关历史
}

export interface TaskResult {
  success: boolean
  output?: string
  prNumber?: number
  error?: string
  metrics?: {
    duration: number
    tokensUsed: number
    filesChanged: number
  }
}

export interface FailureAnalysis {
  reason: string
  category: 'context' | 'direction' | 'technical' | 'unknown'
  suggestion: string
  adjustedPrompt?: string
}

// Agent Types
export type AgentType = 'pop' | 'codex' | 'claude' | 'quill' | 'echo' | 'scout' | 'pixel'

export interface AgentConfig {
  name: string
  type: AgentType
  command: string
  model: string
  args: string[]
  capabilities: string[]
  successRate: number
  worktree: boolean
  tmux: boolean
}

export interface AgentSession {
  id: string
  agent: AgentType
  taskId: string
  status: 'starting' | 'running' | 'paused' | 'completed' | 'failed'
  worktree?: string
  tmuxSession?: string
  branch?: string
  startTime: Date
  endTime?: Date
  output?: string
  pid?: number
}

// Memory Types
export interface MemoryEntry {
  id: string
  key: string
  value: any
  type: 'success' | 'failure' | 'context' | 'decision' | 'preference'
  tags: string[]
  metadata: {
    taskId?: string
    agent?: AgentType
    timestamp: Date
    relevance: number
  }
}

export interface MemoryQuery {
  key?: string
  type?: MemoryEntry['type']
  tags?: string[]
  agent?: AgentType
  taskId?: string
  limit?: number
  minRelevance?: number
}

// Notification Types
export interface Notification {
  type: 'task_complete' | 'task_failed' | 'pr_ready' | 'human_needed' | 'daily_summary'
  title: string
  message: string
  data?: any
  priority: 'low' | 'medium' | 'high'
}

export interface PRInfo {
  number: number
  title: string
  url: string
  status: 'draft' | 'open' | 'review_required' | 'approved' | 'merged' | 'closed'
  ciStatus: 'pending' | 'running' | 'passed' | 'failed'
  reviews: PRReview[]
}

export interface PRReview {
  agent: AgentType | 'human'
  status: 'pending' | 'approved' | 'changes_requested'
  comments: string[]
}

// Monitor Types
export interface AgentStatus {
  sessionId: string
  status: AgentSession['status']
  progress?: number
  lastOutput?: string
  lastUpdate: Date
}

export interface CIStatus {
  status: 'pending' | 'running' | 'passed' | 'failed'
  checks: {
    name: string
    status: 'pending' | 'running' | 'passed' | 'failed'
    duration?: number
  }[]
}

// Ralph Loop Types
export interface RalphLoopState {
  taskId: string
  attempt: number
  maxAttempts: number
  prompt: string
  context: TaskContext
  history: {
    attempt: number
    prompt: string
    result: TaskResult
    analysis?: FailureAnalysis
  }[]
}
