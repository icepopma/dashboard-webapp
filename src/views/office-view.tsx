'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RotateCcw, ZoomIn, ZoomOut, Maximize2, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentType } from '@/orchestrator/types'

// 像素风办公室配置
const OFFICE_CONFIG = {
  tileSize: 32,
  gridWidth: 20,
  gridHeight: 12,
}

// 智能体配置
const AGENT_SPRITES: Record<AgentType, {
  color: string
  emoji: string
  name: string
}> = {
  pop: { color: '#8b5cf6', emoji: '🫧', name: 'Pop' },
  codex: { color: '#3b82f6', emoji: '🤖', name: 'Codex' },
  claude: { color: '#10b981', emoji: '🧠', name: 'Claude' },
  quill: { color: '#f59e0b', emoji: '✍️', name: 'Quill' },
  echo: { color: '#ef4444', emoji: '📢', name: 'Echo' },
  scout: { color: '#06b6d4', emoji: '🔍', name: 'Scout' },
  pixel: { color: '#ec4899', emoji: '🎨', name: 'Pixel' },
}

// 办公室布局（0=地板, 1=墙, 2=桌子, 3=椅子）
const OFFICE_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,2,2,0,0,2,2,0,0,0,0,2,2,0,0,2,2,0,1],
  [1,0,3,3,0,0,3,3,0,0,0,0,3,3,0,0,3,3,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,2,2,0,0,2,2,0,0,0,0,2,2,0,0,2,2,0,1],
  [1,0,3,3,0,0,3,3,0,0,0,0,3,3,0,0,3,3,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

// 智能体工位分配
const AGENT_DESKS: Record<AgentType, { x: number; y: number }> = {
  pop: { x: 2, y: 3 },     // 中心位置
  codex: { x: 6, y: 3 },
  claude: { x: 12, y: 3 },
  pixel: { x: 16, y: 3 },
  quill: { x: 2, y: 7 },
  scout: { x: 6, y: 7 },
  echo: { x: 12, y: 7 },
}

interface AgentState {
  type: AgentType
  status: 'working' | 'idle' | 'offline' | 'error'
  currentTask?: string
  position: { x: number; y: number }
  animation: 'idle' | 'typing' | 'walking' | 'thinking'
}

export function OfficeView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [agents, setAgents] = useState<AgentState[]>([])
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null)

  // 获取智能体状态
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/agents')
        const data = await res.json()

        const agentStates: AgentState[] = (data.agents || []).map((agent: any) => ({
          type: agent.type as AgentType,
          status: agent.status,
          currentTask: agent.currentTask,
          position: AGENT_DESKS[agent.type as AgentType] || { x: 10, y: 5 },
          animation: agent.status === 'working' ? 'typing' : 'idle',
        }))

        setAgents(agentStates)
      } catch (err) {
        console.error('Failed to fetch agents:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
    const interval = setInterval(fetchAgents, 5000)
    return () => clearInterval(interval)
  }, [])

  // 绘制办公室
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { tileSize, gridWidth, gridHeight } = OFFICE_CONFIG
    const scaledTile = tileSize * zoom

    canvas.width = gridWidth * scaledTile
    canvas.height = gridHeight * scaledTile

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制地板和墙壁
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const tile = OFFICE_LAYOUT[y][x]
        const px = x * scaledTile
        const py = y * scaledTile

        switch (tile) {
          case 0: // 地板
            ctx.fillStyle = '#f5f5f5'
            ctx.fillRect(px, py, scaledTile, scaledTile)
            // 像素格纹理
            ctx.strokeStyle = '#e5e5e5'
            ctx.strokeRect(px, py, scaledTile, scaledTile)
            break
          case 1: // 墙
            ctx.fillStyle = '#6366f1'
            ctx.fillRect(px, py, scaledTile, scaledTile)
            // 像素阴影
            ctx.fillStyle = '#4f46e5'
            ctx.fillRect(px, py + scaledTile - 4 * zoom, scaledTile, 4 * zoom)
            break
          case 2: // 桌子
            ctx.fillStyle = '#f5f5f5'
            ctx.fillRect(px, py, scaledTile, scaledTile)
            ctx.fillStyle = '#92400e'
            ctx.fillRect(px + 2 * zoom, py + 2 * zoom, scaledTile - 4 * zoom, scaledTile - 4 * zoom)
            // 显示器
            ctx.fillStyle = '#1f2937'
            ctx.fillRect(px + 6 * zoom, py + 4 * zoom, scaledTile - 12 * zoom, 8 * zoom)
            ctx.fillStyle = '#60a5fa'
            ctx.fillRect(px + 7 * zoom, py + 5 * zoom, scaledTile - 14 * zoom, 6 * zoom)
            break
          case 3: // 椅子
            ctx.fillStyle = '#f5f5f5'
            ctx.fillRect(px, py, scaledTile, scaledTile)
            ctx.fillStyle = '#6b7280'
            ctx.fillRect(px + 4 * zoom, py + 8 * zoom, scaledTile - 8 * zoom, scaledTile - 12 * zoom)
            break
        }
      }
    }

    // 绘制智能体
    agents.forEach((agent) => {
      const sprite = AGENT_SPRITES[agent.type]
      const px = agent.position.x * scaledTile
      const py = agent.position.y * scaledTile

      // 智能体圆圈
      ctx.beginPath()
      ctx.arc(px + scaledTile / 2, py + scaledTile / 2, 12 * zoom, 0, Math.PI * 2)
      ctx.fillStyle = sprite.color
      ctx.fill()

      // 状态指示
      if (agent.status === 'working') {
        // 打字动画效果（小圆点）
        const time = Date.now() / 500
        const bounce = Math.sin(time * 2) * 2 * zoom
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(px + scaledTile / 2 - 4 * zoom, py + scaledTile / 2 + bounce, 2 * zoom, 0, Math.PI * 2)
        ctx.arc(px + scaledTile / 2, py + scaledTile / 2 + bounce, 2 * zoom, 0, Math.PI * 2)
        ctx.arc(px + scaledTile / 2 + 4 * zoom, py + scaledTile / 2 + bounce, 2 * zoom, 0, Math.PI * 2)
        ctx.fill()
      }

      // 绘制 emoji
      ctx.font = `${16 * zoom}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(sprite.emoji, px + scaledTile / 2, py + scaledTile / 2 - 10 * zoom)
    })

  }, [agents, zoom])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 pt-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">像素办公室</h2>
          <p className="text-sm text-muted-foreground mt-1">
            实时查看智能体工作状态
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(1)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Office Canvas */}
      <div className="flex-1 px-6 pb-6 overflow-auto flex items-center justify-center">
        <div className="relative border-2 border-border rounded-lg overflow-hidden bg-muted/30">
          <canvas
            ref={canvasRef}
            className="cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = Math.floor((e.clientX - rect.left) / (OFFICE_CONFIG.tileSize * zoom))
              const y = Math.floor((e.clientY - rect.top) / (OFFICE_CONFIG.tileSize * zoom))

              // 检查是否点击了智能体
              const clickedAgent = agents.find(
                a => a.position.x === x && a.position.y === y
              )
              if (clickedAgent) {
                setSelectedAgent(clickedAgent.type)
              }
            }}
          />

          {/* Agent Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
            <div className="text-xs font-medium mb-2">智能体状态</div>
            <div className="flex flex-wrap gap-2">
              {agents.map((agent) => {
                const sprite = AGENT_SPRITES[agent.type]
                return (
                  <div
                    key={agent.type}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer transition-colors",
                      selectedAgent === agent.type && "bg-primary/20 ring-1 ring-primary"
                    )}
                    onClick={() => setSelectedAgent(agent.type)}
                  >
                    <span>{sprite.emoji}</span>
                    <span className="font-medium">{sprite.name}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      agent.status === 'working' && "bg-green-500 animate-pulse",
                      agent.status === 'idle' && "bg-yellow-500",
                      agent.status === 'offline' && "bg-gray-400",
                      agent.status === 'error' && "bg-red-500"
                    )} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <div className="px-6 pb-6 flex-shrink-0">
          <Card>
            <CardContent className="p-4">
              {(() => {
                const agent = agents.find(a => a.type === selectedAgent)
                if (!agent) return null
                const sprite = AGENT_SPRITES[selectedAgent]

                return (
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{sprite.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sprite.name}</span>
                        <Badge className={cn(
                          agent.status === 'working' && "bg-green-500/20 text-green-500",
                          agent.status === 'idle' && "bg-yellow-500/20 text-yellow-500",
                          agent.status === 'offline' && "bg-gray-500/20 text-gray-500"
                        )}>
                          {agent.status === 'working' ? '工作中' : agent.status === 'idle' ? '空闲' : '离线'}
                        </Badge>
                      </div>
                      {agent.currentTask && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {agent.currentTask}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAgent(null)}
                    >
                      ✕
                    </Button>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
