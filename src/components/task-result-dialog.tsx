'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  CheckCircle2, Clock, FileText, Download, Copy, 
  CheckCircle, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskResult {
  id: string
  title: string
  agent: string
  agentName: string
  agentEmoji: string
  status: 'completed' | 'failed'
  startedAt: string
  completedAt: string
  duration: number // 秒
  output: {
    type: 'text' | 'markdown' | 'code' | 'file'
    content: string
    language?: string
    files?: { name: string; url: string; size: string }[]
  }
  logs: { time: string; message: string; type: 'info' | 'success' | 'error' }[]
}

interface TaskResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: TaskResult | null
}

export function TaskResultDialog({ open, onOpenChange, task }: TaskResultDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!task) return null

  const copyToClipboard = async () => {
    if (task.output.content) {
      await navigator.clipboard.writeText(task.output.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}分${secs}秒`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-xl">
              {task.agentEmoji}
            </div>
            <div>
              <DialogTitle className="text-lg">{task.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <span>{task.agentName}</span>
                <span className="text-muted-foreground">·</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">已完成</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>耗时: {formatDuration(task.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>开始: {new Date(task.startedAt).toLocaleString()}</span>
            </div>
          </div>

          {/* 输出结果 */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">执行结果</span>
                  <Badge variant="outline" className="text-[10px]">
                    {task.output.type === 'markdown' ? 'Markdown' :
                     task.output.type === 'code' ? task.output.language || 'Code' :
                     task.output.type === 'file' ? '文件' : '文本'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {task.output.content && (
                    <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* 内容展示 */}
              <div className="bg-muted/30 rounded-lg p-4 max-h-80 overflow-auto">
                {task.output.type === 'code' ? (
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    <code>{task.output.content}</code>
                  </pre>
                ) : task.output.type === 'markdown' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {task.output.content}
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap">{task.output.content}</div>
                )}
              </div>

              {/* 生成的文件 */}
              {task.output.files && task.output.files.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">生成的文件</div>
                  <div className="space-y-2">
                    {task.output.files.map((file, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">({file.size})</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 执行日志 */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-3">执行日志</div>
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-3 font-mono text-xs space-y-1 max-h-48 overflow-auto">
                {task.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-zinc-500 flex-shrink-0">
                      {new Date(log.time).toLocaleTimeString()}
                    </span>
                    <span className={cn(
                      log.type === 'success' && 'text-green-400',
                      log.type === 'error' && 'text-red-400',
                      log.type === 'info' && 'text-zinc-300'
                    )}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 底部操作 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          {task.output.content && (
            <Button onClick={copyToClipboard}>
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  复制结果
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 模拟生成任务结果
export function generateMockTaskResult(taskId: string, taskTitle: string, agent: string): TaskResult {
  const agentConfigs: Record<string, { name: string; emoji: string }> = {
    codex: { name: 'Codex', emoji: '🤖' },
    claude: { name: 'Claude Code', emoji: '🧠' },
    quill: { name: 'Quill', emoji: '✍️' },
    echo: { name: 'Echo', emoji: '📢' },
    scout: { name: 'Scout', emoji: '🔍' },
    pixel: { name: 'Pixel', emoji: '🎨' },
  }

  const config = agentConfigs[agent] || { name: agent, emoji: '🤖' }
  const now = new Date()
  const startedAt = new Date(now.getTime() - 120000) // 2分钟前开始
  const duration = 120 // 2分钟

  return {
    id: taskId,
    title: taskTitle,
    agent,
    agentName: config.name,
    agentEmoji: config.emoji,
    status: 'completed',
    startedAt: startedAt.toISOString(),
    completedAt: now.toISOString(),
    duration,
    output: {
      type: 'markdown',
      content: `# 任务执行结果

## 概述
已成功完成任务：${taskTitle}

## 执行步骤
1. 分析任务需求
2. 制定执行计划
3. 实施解决方案
4. 验证结果

## 结果
任务已完成，所有目标达成。

---
*由 ${config.name} 执行 · 耗时 ${duration} 秒*`,
    },
    logs: [
      { time: startedAt.toISOString(), message: '开始执行任务...', type: 'info' },
      { time: new Date(startedAt.getTime() + 10000).toISOString(), message: '分析任务需求完成', type: 'info' },
      { time: new Date(startedAt.getTime() + 30000).toISOString(), message: '制定执行计划完成', type: 'info' },
      { time: new Date(startedAt.getTime() + 60000).toISOString(), message: '正在实施解决方案...', type: 'info' },
      { time: new Date(startedAt.getTime() + 100000).toISOString(), message: '验证结果中...', type: 'info' },
      { time: now.toISOString(), message: '任务执行完成！', type: 'success' },
    ],
  }
}
