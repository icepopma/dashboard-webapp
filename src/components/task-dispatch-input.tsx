'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Send, Loader2, Sparkles, Bot, ArrowRight, X,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentRecommendation {
  type: string
  name: string
  emoji: string
  confidence: number
  reason: string
}

interface DispatchResult {
  task: { id: string; title: string; status: string }
  dispatch: { agent: string; agentName: string; agentEmoji: string; sessionId: string }
  timestamp: string
}

interface TaskDispatchInputProps {
  onTaskDispatched?: () => void
}

export function TaskDispatchInput({ onTaskDispatched }: TaskDispatchInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [recommendation, setRecommendation] = useState<AgentRecommendation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null)

  // 分析任务
  const analyzeTask = async () => {
    if (!input.trim()) return
    
    setAnalyzing(true)
    setError(null)
    setRecommendation(null)
    
    try {
      const response = await fetch('/api/dispatch/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input }),
      })
      
      if (!response.ok) throw new Error('分析失败')
      
      const result = await response.json()
      // API 返回 { success: true, data: { recommendation: ... } }
      setRecommendation(result.data?.recommendation || result.recommendation)
    } catch (err) {
      console.error('Analyze error:', err)
      setError('无法分析任务，请重试')
    } finally {
      setAnalyzing(false)
    }
  }

  // 派发任务
  const dispatchTask = async () => {
    if (!recommendation || !input.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: input,
          agent: recommendation.type,
        }),
      })
      
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error?.message || '派发失败')
      }
      
      const result = await response.json()
      const data = result.data || result
      
      setDispatchResult(data)
      setSuccess(true)
      setInput('')
      setRecommendation(null)
      onTaskDispatched?.()
      
      // 5秒后隐藏成功提示
      setTimeout(() => {
        setSuccess(false)
        setDispatchResult(null)
      }, 5000)
    } catch (err) {
      console.error('Dispatch error:', err)
      setError('派发任务失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 重置
  const reset = () => {
    setInput('')
    setRecommendation(null)
    setError(null)
    setSuccess(false)
    setDispatchResult(null)
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">智能任务派发</span>
          <span className="text-xs text-muted-foreground">描述任务，Pop 自动分配最合适的智能体</span>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              placeholder="例如：帮我写一篇关于 AI Agent 的技术博客..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[60px] resize-none pr-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  analyzeTask()
                }
              }}
            />
            {input && (
              <button
                onClick={reset}
                className="absolute top-2 right-2 p-1 rounded hover:bg-muted/50"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
          
          {!recommendation ? (
            <Button 
              onClick={analyzeTask} 
              disabled={!input.trim() || analyzing}
              className="self-end"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  分析中
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  分析
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={dispatchTask} 
              disabled={loading}
              className="self-end"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  派发中
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  派发
                </>
              )}
            </Button>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-2 text-sm text-red-500 flex items-center gap-2">
            <X className="h-3 w-3" />
            {error}
          </div>
        )}

        {/* 成功提示 */}
        {success && dispatchResult && (
          <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">任务已派发！</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-xl">{dispatchResult.dispatch.agentEmoji}</span>
              <span className="font-medium">{dispatchResult.dispatch.agentName}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground truncate flex-1">
                {dispatchResult.task.title}
              </span>
            </div>
          </div>
        )}

        {/* 推荐结果 */}
        {recommendation && (
          <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-xl">
                {recommendation.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{recommendation.name}</span>
                  <Badge className="bg-green-500/20 text-green-600 text-[10px]">
                    {recommendation.confidence}% 匹配
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {recommendation.reason}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-green-500" />
            </div>
          </div>
        )}

        {/* 快捷提示 */}
        <div className="mt-2 text-[10px] text-muted-foreground">
          按 <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">⌘</kbd> + <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">Enter</kbd> 快速分析
        </div>
      </CardContent>
    </Card>
  )
}
