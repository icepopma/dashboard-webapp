'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GraphNode {
  id: string
  type: 'pop' | 'agent' | 'task'
  label: string
  emoji?: string
  status?: 'working' | 'idle' | 'completed' | 'running'
  x: number
  y: number
}

interface GraphEdge {
  from: string
  to: string
  label?: string
  type: 'dispatch' | 'depend' | 'complete'
}

interface CollaborationGraphProps {
  agents: Array<{
    type: string
    name: string
    emoji: string
    status: string
    currentTask?: string
  }>
  runningTasks: Map<string, {
    agent: string
    agentName: string
    agentEmoji: string
    title: string
  }>
  className?: string
}

export function CollaborationGraph({ agents, runningTasks, className }: CollaborationGraphProps) {
  // 构建节点和边
  const { nodes, edges } = useMemo(() => {
    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []
    
    // Pop 节点在中心
    nodes.push({
      id: 'pop',
      type: 'pop',
      label: 'Pop',
      emoji: '🫧',
      x: 150,
      y: 80,
    })
    
    // 智能体节点围绕 Pop
    const subAgents = agents.filter(a => a.type !== 'pop')
    const radius = 100
    const angleStep = (2 * Math.PI) / Math.max(subAgents.length, 1)
    
    subAgents.forEach((agent, i) => {
      const angle = angleStep * i - Math.PI / 2 // 从顶部开始
      const x = 150 + radius * Math.cos(angle)
      const y = 80 + radius * Math.sin(angle)
      
      nodes.push({
        id: agent.type,
        type: 'agent',
        label: agent.name,
        emoji: agent.emoji,
        status: agent.status as any,
        x,
        y,
      })
      
      // Pop 到智能体的连线
      edges.push({
        from: 'pop',
        to: agent.type,
        type: agent.status === 'working' ? 'dispatch' : 'depend',
      })
    })
    
    return { nodes, edges }
  }, [agents])

  const activeConnections = edges.filter(e => e.type === 'dispatch').length

  return (
    <Card className={cn("border-border/60 shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Network className="h-4 w-4 text-purple-500" />
          协作图谱
          <Badge variant="outline" className="text-[10px] ml-auto">
            {activeConnections} 活跃
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-48">
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 300 160"
            className="overflow-visible"
          >
            {/* 连线 */}
            {edges.map((edge, i) => {
              const fromNode = nodes.find(n => n.id === edge.from)
              const toNode = nodes.find(n => n.id === edge.to)
              if (!fromNode || !toNode) return null
              
              const isActive = edge.type === 'dispatch'
              
              return (
                <g key={i}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isActive ? "#22c55e" : "#3f3f46"}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? "none" : "4 4"}
                    opacity={isActive ? 1 : 0.4}
                    className={cn(isActive && "animate-pulse")}
                  />
                  {isActive && (
                    <circle r="3" fill="#22c55e">
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                      />
                    </circle>
                  )}
                </g>
              )
            })}
            
            {/* 节点 */}
            {nodes.map((node) => {
              const isPop = node.type === 'pop'
              const isWorking = node.status === 'working'
              
              return (
                <g key={node.id}>
                  {/* 节点圆圈 */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isPop ? 24 : 18}
                    fill={isPop ? "hsl(var(--primary) / 0.2)" : isWorking ? "#22c55e20" : "#3f3f4620"}
                    stroke={isPop ? "hsl(var(--primary))" : isWorking ? "#22c55e" : "#52525b"}
                    strokeWidth={isPop ? 2 : 1}
                  />
                  
                  {/* Emoji */}
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isPop ? 20 : 16}
                  >
                    {node.emoji}
                  </text>
                  
                  {/* 标签 */}
                  <text
                    x={node.x}
                    y={node.y + (isPop ? 34 : 28)}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#a1a1aa"
                  >
                    {node.label}
                  </text>
                  
                  {/* 状态指示器 */}
                  {node.status === 'working' && (
                    <circle
                      cx={node.x + 14}
                      cy={node.y - 14}
                      r={4}
                      fill="#22c55e"
                      className="animate-pulse"
                    />
                  )}
                </g>
              )
            })}
          </svg>
        </div>
        
        {/* 图例 */}
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-500" />
            <span>活跃调度</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-zinc-600 border-dashed" style={{ borderStyle: 'dashed' }} />
            <span>待命</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
