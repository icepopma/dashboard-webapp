# OpenClaw Agent Cluster 架构

## 概述

Pop 作为编排智能体，管理多个专业执行智能体，实现自动化开发工作流。

## 架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Dashboard Web App                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Home   │ │  Tasks  │ │ Memory  │ │ Office  │ │Council  │ ...   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │
│       │           │           │           │           │             │
│       └───────────┴───────────┴───────────┴───────────┘             │
│                               │                                      │
├───────────────────────────────┼──────────────────────────────────────┤
│                        Pop Orchestrator                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      Core Services                           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │    │
│  │  │  Memory  │ │  Tasks   │ │ Monitor  │ │ Notify   │        │    │
│  │  │  System  │ │  System  │ │  System  │ │  System  │        │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                               │                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      Agent Launcher                          │    │
│  │                                                              │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │    │
│  │  │ Codex  │ │ Quill  │ │  Echo  │ │ Scout  │ │ Pixel  │    │    │
│  │  │(编码)  │ │(写作)  │ │(发布)  │ │(分析)  │ │(设计)  │    │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                               │                                      │
├───────────────────────────────┼──────────────────────────────────────┤
│                        External Services                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │  GitHub  │ │  QQ Bot  │ │  Sentry  │ │ Obsidian │                │
│  │   API    │ │ Channel  │ │   API    │ │  Vault   │                │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. Pop Orchestrator (编排器)

```typescript
interface PopOrchestrator {
  // 接收用户目标
  handleGoal(goal: string): Promise<Task[]>
  
  // 分析任务
  analyzeGoal(goal: string): Promise<TaskAnalysis>
  
  // 选择智能体
  selectAgent(task: Task): Agent
  
  // 构建提示词
  buildPrompt(task: Task, context: Context): Promise<string>
  
  // 启动智能体
  launchAgent(agent: Agent, prompt: string): Promise<AgentSession>
  
  // 监控进度
  monitor(session: AgentSession): Promise<TaskResult>
  
  // Ralph Loop
  ralphLoop(task: Task): Promise<TaskResult>
}
```

### 2. Memory System (记忆系统)

```typescript
interface MemorySystem {
  // 存储
  store(key: string, value: any, metadata?: MemoryMetadata): Promise<void>
  
  // 查询
  query(params: MemoryQuery): Promise<MemoryEntry[]>
  
  // 学习成功模式
  recordSuccess(task: Task, prompt: string, result: TaskResult): Promise<void>
  
  // 学习失败模式
  recordFailure(task: Task, error: Error, analysis: FailureAnalysis): Promise<void>
  
  // 获取相关上下文
  getRelevantContext(task: Task): Promise<Context>
}
```

### 3. Task System (任务系统)

```typescript
interface TaskSystem {
  // 创建任务
  create(task: TaskInput): Promise<Task>
  
  // 获取任务
  get(id: string): Promise<Task>
  
  // 列出任务
  list(filter?: TaskFilter): Promise<Task[]>
  
  // 更新任务
  update(id: string, updates: Partial<Task>): Promise<Task>
  
  // 任务状态机
  transition(id: string, event: TaskEvent): Promise<Task>
}
```

### 4. Agent Launcher (智能体启动器)

```typescript
interface AgentLauncher {
  // 启动 Codex
  launchCodex(prompt: string, options: AgentOptions): Promise<AgentSession>
  
  // 启动 Claude Code
  launchClaude(prompt: string, options: AgentOptions): Promise<AgentSession>
  
  // 发送指令到运行中的智能体
  sendCommand(sessionId: string, command: string): Promise<void>
  
  // 获取会话状态
  getSession(sessionId: string): Promise<AgentSession>
  
  // 终止会话
  terminate(sessionId: string): Promise<void>
}
```

### 5. Monitor System (监控系统)

```typescript
interface MonitorSystem {
  // 开始监控
  startMonitoring(session: AgentSession): void
  
  // 检查状态
  checkStatus(sessionId: string): Promise<AgentStatus>
  
  // 检查 PR 状态
  checkPR(prNumber: number): Promise<PRStatus>
  
  // 检查 CI 状态
  checkCI(prNumber: number): Promise<CIStatus>
  
  // 自动重试
  autoRetry(session: AgentSession, reason: string): Promise<void>
}
```

### 6. Notify System (通知系统 - QQ Channel)

```typescript
interface NotifySystem {
  // 发送消息
  send(message: Notification): Promise<void>
  
  // PR 就绪通知
  notifyPRReady(pr: PRInfo): Promise<void>
  
  // 任务完成通知
  notifyTaskComplete(task: Task): Promise<void>
  
  // 需要人工介入通知
  notifyHumanIntervention(task: Task, reason: string): Promise<void>
  
  // 每日总结
  sendDailySummary(summary: DailySummary): Promise<void>
}
```

## 工作流

### 标准任务流程

```
1. 用户输入目标
   ↓
2. Pop 分析任务
   ↓
3. Pop 查询记忆获取上下文
   ↓
4. Pop 选择智能体
   ↓
5. Pop 构建提示词
   ↓
6. Pop 启动智能体
   ↓
7. 监控系统追踪进度
   ↓
8. 成功？
   ├─ 是 → 记录成功模式 → 创建 PR → 通知用户
   └─ 否 → 分析失败 → 调整提示词 → 重试 (最多3次)
           ↓
       仍失败？ → 通知人工介入
```

### Ralph Loop V2

```
┌─────────────────────────────────────────────────────────┐
│                    Ralph Loop V2                         │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  执行    │ → │  评估    │ → │  学习    │          │
│  │ Execute  │    │ Evaluate │    │  Learn   │          │
│  └──────────┘    └──────────┘    └──────────┘          │
│       ↑                               │                 │
│       └───────────────────────────────┘                 │
│              (失败时调整提示词重试)                       │
│                                                          │
│  学习内容:                                               │
│  - 成功的提示词模式                                       │
│  - 失败的原因和解决方案                                   │
│  - 上下文需求                                            │
│  - 智能体选择策略                                        │
└─────────────────────────────────────────────────────────┘
```

## 智能体配置

### Codex (编码智能体)
```yaml
name: Codex
role: Lead Engineer
capabilities:
  - 后端逻辑开发
  - 复杂 Bug 修复
  - 跨文件重构
  - API 设计
model: gpt-5.3-codex
reasoning_effort: high
success_rate: 90%
```

### Quill (写作智能体)
```yaml
name: Quill
role: Content Writer
capabilities:
  - 文档撰写
  - 博客文章
  - README 编写
  - 代码注释
model: claude-opus-4.5
success_rate: 85%
```

### Echo (发布智能体)
```yaml
name: Echo
role: Social Media Manager
capabilities:
  - 社交媒体发布
  - 内容分发
  - 多平台同步
model: claude-sonnet-4
success_rate: 80%
```

### Scout (分析智能体)
```yaml
name: Scout
role: Trend Analyst
capabilities:
  - 趋势分析
  - 竞品监控
  - 数据收集
  - 报告生成
model: gemini-2.0-flash
success_rate: 85%
```

### Pixel (设计智能体)
```yaml
name: Pixel
role: Designer
capabilities:
  - UI 设计
  - 像素艺术
  - 图标设计
  - 配色方案
model: gemini-2.0-flash
success_rate: 75%
```

## 文件结构

```
src/
├── orchestrator/
│   ├── index.ts              # Pop 编排器主入口
│   ├── goalAnalyzer.ts       # 目标分析器
│   ├── agentSelector.ts      # 智能体选择器
│   ├── promptBuilder.ts      # 提示词构建器
│   └── ralphLoop.ts          # Ralph Loop V2
├── agents/
│   ├── base.ts               # 智能体基类
│   ├── codex.ts              # Codex 智能体
│   ├── quill.ts              # Quill 智能体
│   ├── echo.ts               # Echo 智能体
│   ├── scout.ts              # Scout 智能体
│   └── pixel.ts              # Pixel 智能体
├── memory/
│   ├── store.ts              # 记忆存储
│   ├── learner.ts            # 学习系统
│   └── context.ts            # 上下文管理
├── tasks/
│   ├── manager.ts            # 任务管理器
│   ├── queue.ts              # 任务队列
│   └── stateMachine.ts       # 状态机
├── monitor/
│   ├── watcher.ts            # 监控器
│   ├── prChecker.ts          # PR 检查器
│   └── ciChecker.ts          # CI 检查器
├── notify/
│   ├── qqChannel.ts          # QQ Channel 通知
│   └── templates.ts          # 通知模板
└── launcher/
    ├── process.ts            # 进程管理
    ├── tmux.ts               # tmux 会话管理
    └── worktree.ts           # git worktree 管理
```

## 配置

```typescript
// config/agents.ts
export const agentConfig = {
  codex: {
    command: 'codex',
    model: 'gpt-5.3-codex',
    args: ['--model', 'gpt-5.3-codex', '-c', 'model_reasoning_effort=high'],
    worktree: true,
    tmux: true,
  },
  claude: {
    command: 'claude',
    model: 'claude-opus-4.5',
    args: ['--model', 'claude-opus-4.5', '--dangerously-skip-permissions'],
    worktree: true,
    tmux: true,
  },
  // ...
}

// config/qq.ts
export const qqConfig = {
  channelId: process.env.QQ_CHANNEL_ID,
  botId: process.env.QQ_BOT_ID,
  token: process.env.QQ_BOT_TOKEN,
}
```

## 环境变量

```env
# GitHub
GITHUB_TOKEN=ghp_xxx

# QQ Channel
QQ_CHANNEL_ID=xxx
QQ_BOT_ID=xxx
QQ_BOT_TOKEN=xxx

# AI Models
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-xxx
GOOGLE_API_KEY=xxx

# Sentry (可选)
SENTRY_DSN=xxx

# Obsidian (可选)
OBSIDIAN_VAULT_PATH=/path/to/vault
```

## 下一步

1. 实现核心编排器
2. 实现智能体启动器
3. 实现 QQ Channel 通知
4. 实现 Ralph Loop
5. 集成到 Dashboard
