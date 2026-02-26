'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search, Filter, Trash2, Download, Pause, Play,
  Terminal, AlertCircle, CheckCircle2, Info, AlertTriangle,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentType } from '@/orchestrator/types'

export interface LogEntry {
  id: string
  timestamp: Date
  agent: AgentType
  type: 'info' | 'success' | 'error' | 'warning' | 'command' | 'output'
  message: string
  metadata?: Record<string, any>
}

interface AgentLogStreamProps {
  agent?: AgentType | 'all'
  maxHeight?: string
  showControls?: boolean
  autoScroll?: boolean
}

const logTypeConfig = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  command: { icon: Terminal, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  output: { icon: Terminal, color: 'text-gray-400', bg: 'bg-gray-500/10' },
}

const agentEmojis: Record<AgentType, string> = {
  pop: '🫧',
  codex: '🤖',
  claude: '🧠',
  quill: '✍️',
  echo: '📢',
  scout: '🔍',
  pixel: '🎨',
}

export function AgentLogStream({
  agent = 'all',
  maxHeight = '400px',
  showControls = true,
  autoScroll = true,
}: AgentLogStreamProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const logContainerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<EventSource | null>(null)

  // 连接到日志流
  useEffect(() => {
    if (isPaused) return

    const connectToLogStream = async () => {
      try {
        // 使用 SSE 连接到日志流
        const eventSource = new EventSource(`/api/agents/logs/stream?agent=${agent}`)
        wsRef.current = eventSource

        eventSource.onmessage = (event) => {
          const log: LogEntry = JSON.parse(event.data)
          setLogs((prev) => [...prev.slice(-499), log]) // 保留最近 500 条
        }

        eventSource.onerror = (error) => {
          console.error('Log stream error:', error)
          // 重连逻辑
          setTimeout(() => {
            if (!isPaused) {
              connectToLogStream()
            }
          }, 3000)
        }
      } catch (error) {
        console.error('Failed to connect to log stream:', error)
      }
    }

    connectToLogStream()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [agent, isPaused])

  // 过滤日志
  useEffect(() => {
    let filtered = logs

    // 按类型过滤
    if (filterType) {
      filtered = filtered.filter((log) => log.type === filterType)
    }

    // 按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((log) =>
        log.message.toLowerCase().includes(query) ||
        log.agent.toLowerCase().includes(query)
      )
    }

    setFilteredLogs(filtered)
  }, [logs, filterType, searchQuery])

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logContainerRef.current && !isPaused) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [filteredLogs, autoScroll, isPaused])

  // 切换日志详情
  const toggleLogExpand = (logId: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev)
      if (next.has(logId)) {
        next.delete(logId)
      } else {
        next.add(logId)
      }
      return next
    })
  }

  // 清空日志
  const handleClearLogs = () => {
    setLogs([])
    setFilteredLogs([])
  }

  // 导出日志
  const handleExportLogs = () => {
    const logText = filteredLogs
      .map((log) => `[${log.timestamp.toISOString()}] [${log.agent}] [${log.type.toUpperCase()}] ${log.message}`)
      .join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agent-logs-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-black/90 rounded-lg border border-gray-800">
      {/* 控制栏 */}
      {showControls && (
        <div className="flex items-center gap-2 p-2 border-b border-gray-800 bg-gray-900/50">
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="text-xs font-mono text-gray-400 flex-1">
            Agent Log Stream {agent !== 'all' && `- ${agent}`}
          </span>
          
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
            <Input
              placeholder="搜索日志..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-7 text-xs font-mono bg-black/50 border-gray-700"
            />
          </div>

          {/* 类型过滤 */}
          <div className="flex items-center gap-1">
            {Object.entries(logTypeConfig).map(([type, config]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 text-xs",
                  filterType === type && config.bg
                )}
                onClick={() => setFilterType(filterType === type ? null : type)}
              >
                <config.icon className={cn("h-3 w-3", config.color)} />
              </Button>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <Play className="h-3 w-3 text-green-400" />
              ) : (
                <Pause className="h-3 w-3 text-yellow-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={handleExportLogs}
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={handleClearLogs}
            >
              <Trash2 className="h-3 w-3 text-red-400" />
            </Button>
          </div>

          {/* 日志计数 */}
          <Badge variant="outline" className="text-[10px] font-mono">
            {filteredLogs.length}
          </Badge>
        </div>
      )}

      {/* 日志列表 */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-auto p-2 space-y-1 font-mono text-xs"
        style={{ maxHeight }}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <Terminal className="h-4 w-4 mr-2" />
            <span>等待日志...</span>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const config = logTypeConfig[log.type]
            const isExpanded = expandedLogs.has(log.id)
            
            return (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-2 p-1.5 rounded hover:bg-gray-800/50 cursor-pointer",
                  config.bg
                )}
                onClick={() => log.metadata && toggleLogExpand(log.id)}
              >
                {/* 时间戳 */}
                <span className="text-gray-500 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>

                {/* 智能体标识 */}
                <span className="flex-shrink-0" title={log.agent}>
                  {agentEmojis[log.agent]}
                </span>

                {/* 类型图标 */}
                <config.icon className={cn("h-3 w-3 flex-shrink-0 mt-0.5", config.color)} />

                {/* 消息内容 */}
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "break-words",
                    log.type === 'error' && "text-red-300",
                    log.type === 'success' && "text-green-300",
                    log.type === 'warning' && "text-yellow-300",
                    log.type === 'command' && "text-purple-300",
                  )}>
                    {log.message}
                  </div>

                  {/* 展开的元数据 */}
                  {isExpanded && log.metadata && (
                    <div className="mt-1 p-2 bg-black/30 rounded text-[10px] text-gray-400">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* 展开指示器 */}
                {log.metadata && (
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-gray-500 flex-shrink-0 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 状态栏 */}
      <div className="flex items-center gap-2 px-2 py-1 border-t border-gray-800 bg-gray-900/50 text-[10px] text-gray-500">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse"
        )} />
        <span>{isPaused ? '已暂停' : '实时流'}</span>
        <span className="flex-1" />
        <span>最近 500 条</span>
      </div>
    </div>
  )
}
