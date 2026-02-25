'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, AlertCircle } from 'lucide-react'

interface TaskNode {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'completed' | 'blocked'
  priority: 'high' | 'medium' | 'low'
  x: number
  y: number
  dependencies: string[]
  blockedBy: string[]
}

const initialTasks: TaskNode[] = [
  { id: '1', title: 'Setup Next.js', status: 'completed', priority: 'high', x: 100, y: 100, dependencies: ['2'], blockedBy: [] },
  { id: '2', title: 'Create Components', status: 'completed', priority: 'high', x: 250, y: 100, dependencies: ['3', '4'], blockedBy: ['1'] },
  { id: '3', title: 'Build Home Page', status: 'completed', priority: 'high', x: 400, y: 50, dependencies: ['7'], blockedBy: ['2'] },
  { id: '4', title: 'Build Tasks Page', status: 'in_progress', priority: 'high', x: 400, y: 150, dependencies: ['7'], blockedBy: ['2'] },
  { id: '5', title: 'Setup Supabase', status: 'completed', priority: 'high', x: 100, y: 250, dependencies: ['6'], blockedBy: [] },
  { id: '6', title: 'Create API Routes', status: 'completed', priority: 'medium', x: 250, y: 250, dependencies: ['4'], blockedBy: ['5'] },
  { id: '7', title: 'Integration Test', status: 'todo', priority: 'medium', x: 550, y: 100, dependencies: [], blockedBy: ['3', '4'] },
  { id: '8', title: 'Deploy to Vercel', status: 'todo', priority: 'low', x: 700, y: 100, dependencies: [], blockedBy: ['7'] },
  { id: '9', title: 'Write Documentation', status: 'todo', priority: 'low', x: 550, y: 250, dependencies: [], blockedBy: ['7'] },
  { id: '10', title: 'Performance Optimization', status: 'blocked', priority: 'medium', x: 400, y: 300, dependencies: [], blockedBy: ['4'] },
]

const statusColors: Record<string, string> = {
  todo: '#6b7280',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  blocked: '#ef4444',
}

const priorityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280',
}

export function DependencyGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tasks, setTasks] = useState<TaskNode[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<TaskNode | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [highlightPath, setHighlightPath] = useState<string[]>([])

  // Layout tasks in dependency order
  useEffect(() => {
    const levels: Record<number, TaskNode[]> = {}
    const visited = new Set<string>()
    
    const assignLevel = (task: TaskNode, level: number) => {
      if (visited.has(task.id)) return
      visited.add(task.id)
      
      if (!levels[level]) levels[level] = []
      levels[level].push(task)
      
      task.dependencies.forEach(depId => {
        const dep = tasks.find(t => t.id === depId)
        if (dep) assignLevel(dep, level + 1)
      })
    }
    
    // Find root tasks (no blockedBy)
    const roots = tasks.filter(t => t.blockedBy.length === 0)
    roots.forEach(root => assignLevel(root, 0))
    
    // Assign remaining tasks
    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        const maxBlockedLevel = Math.max(
          ...task.blockedBy.map(id => {
            const blocker = tasks.find(t => t.id === id)
            const blockerLevel = Object.entries(levels).find(([, nodes]) => 
              nodes.some(n => n.id === id)
            )?.[0]
            return blockerLevel ? parseInt(blockerLevel) : 0
          }),
          0
        )
        if (!levels[maxBlockedLevel + 1]) levels[maxBlockedLevel + 1] = []
        levels[maxBlockedLevel + 1].push(task)
      }
    })
    
    // Position tasks
    const newTasks = tasks.map(task => {
      let level = 0
      let index = 0
      
      Object.entries(levels).forEach(([lvl, nodes]) => {
        const idx = nodes.findIndex(n => n.id === task.id)
        if (idx !== -1) {
          level = parseInt(lvl)
          index = idx
        }
      })
      
      const levelNodes = levels[level] || []
      const spacing = 120
      const startX = 100 + level * 180
      const startY = 200 - ((levelNodes.length - 1) * spacing) / 2 + index * spacing
      
      return { ...task, x: startX, y: startY }
    })
    
    setTasks(newTasks)
  }, [])

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    canvas.width = rect.width
    canvas.height = rect.height
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(zoom, zoom)
    
    // Draw edges
    tasks.forEach(task => {
      task.blockedBy.forEach(blockerId => {
        const blocker = tasks.find(t => t.id === blockerId)
        if (!blocker) return
        
        const isHighlighted = highlightPath.includes(task.id) && highlightPath.includes(blockerId)
        
        ctx.beginPath()
        ctx.moveTo(blocker.x + 50, blocker.y)
        
        // Curved line
        const midX = (blocker.x + task.x) / 2
        ctx.bezierCurveTo(
          midX + 30, blocker.y,
          midX - 30, task.y,
          task.x - 50, task.y
        )
        
        ctx.strokeStyle = isHighlighted ? '#f59e0b' : 'rgba(100, 100, 100, 0.4)'
        ctx.lineWidth = isHighlighted ? 3 : 2
        ctx.stroke()
        
        // Arrow head
        const angle = Math.atan2(task.y - blocker.y, task.x - blocker.x - 60)
        ctx.save()
        ctx.translate(task.x - 50, task.y)
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(-10, -5)
        ctx.lineTo(-10, 5)
        ctx.closePath()
        ctx.fillStyle = isHighlighted ? '#f59e0b' : 'rgba(100, 100, 100, 0.6)'
        ctx.fill()
        ctx.restore()
      })
    })
    
    // Draw nodes
    tasks.forEach(task => {
      const isSelected = selectedTask?.id === task.id
      const isHighlighted = highlightPath.includes(task.id)
      const statusColor = statusColors[task.status]
      
      // Node box
      const width = 100
      const height = 40
      
      ctx.beginPath()
      ctx.roundRect(task.x - width/2, task.y - height/2, width, height, 8)
      ctx.fillStyle = isSelected ? statusColor + '40' : (isHighlighted ? '#f59e0b20' : '#1e1e1e')
      ctx.fill()
      ctx.strokeStyle = isHighlighted ? '#f59e0b' : statusColor
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.stroke()
      
      // Status dot
      ctx.beginPath()
      ctx.arc(task.x - width/2 + 12, task.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = statusColor
      ctx.fill()
      
      // Title
      ctx.fillStyle = '#ffffff'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const maxLen = 10
      const title = task.title.length > maxLen ? task.title.slice(0, maxLen) + '...' : task.title
      ctx.fillText(title, task.x + 5, task.y)
    })
    
    ctx.restore()
  }, [tasks, selectedTask, zoom, offset, highlightPath])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - offset.x) / zoom
    const y = (e.clientY - rect.top - offset.y) / zoom
    
    const clickedTask = tasks.find(task => {
      const width = 100, height = 40
      return x >= task.x - width/2 && x <= task.x + width/2 &&
             y >= task.y - height/2 && y <= task.y + height/2
    })
    
    if (clickedTask) {
      setSelectedTask(clickedTask)
      
      // Calculate critical path
      const path: string[] = [clickedTask.id]
      const findBlockers = (task: TaskNode) => {
        task.blockedBy.forEach(blockerId => {
          if (!path.includes(blockerId)) {
            path.push(blockerId)
            const blocker = tasks.find(t => t.id === blockerId)
            if (blocker) findBlockers(blocker)
          }
        })
      }
      findBlockers(clickedTask)
      setHighlightPath(path)
    } else {
      setSelectedTask(null)
      setHighlightPath([])
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2 || e.button === 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  const blockedTasks = tasks.filter(t => t.status === 'blocked')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          {blockedTasks.length > 0 && (
            <Badge variant="outline" className="gap-1.5 border-red-500/30 text-red-500">
              <AlertCircle className="h-3 w-3" />
              {blockedTasks.length} 阻塞
            </Badge>
          )}
          {inProgressTasks.length > 0 && (
            <Badge variant="outline" className="gap-1.5 border-blue-500/30 text-blue-500">
              {inProgressTasks.length} 进行中
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setTasks(initialTasks)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div ref={containerRef} className="flex-1 relative bg-muted/10">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={e => e.preventDefault()}
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur rounded-lg p-3 border border-border/60">
            <div className="text-xs font-medium mb-2">状态</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span>待办</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>进行中</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>已完成</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>阻塞</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Detail */}
        {selectedTask && (
          <div className="w-64 border-l border-border/60 bg-background flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-border/60">
              <Badge 
                variant="outline" 
                className="mb-2"
                style={{ borderColor: statusColors[selectedTask.status], color: statusColors[selectedTask.status] }}
              >
                {selectedTask.status}
              </Badge>
              <h3 className="font-semibold">{selectedTask.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: priorityColors[selectedTask.priority] }}
                />
                <span className="text-xs text-muted-foreground">{selectedTask.priority} priority</span>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {selectedTask.blockedBy.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">被阻塞 by</div>
                  <div className="space-y-1">
                    {selectedTask.blockedBy.map(id => {
                      const blocker = tasks.find(t => t.id === id)
                      if (!blocker) return null
                      return (
                        <div 
                          key={id}
                          className="p-2 rounded bg-muted/30 cursor-pointer hover:bg-muted/50 text-sm"
                          onClick={() => setSelectedTask(blocker)}
                        >
                          {blocker.title}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {selectedTask.dependencies.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">阻塞</div>
                  <div className="space-y-1">
                    {selectedTask.dependencies.map(id => {
                      const dep = tasks.find(t => t.id === id)
                      if (!dep) return null
                      return (
                        <div 
                          key={id}
                          className="p-2 rounded bg-muted/30 cursor-pointer hover:bg-muted/50 text-sm"
                          onClick={() => setSelectedTask(dep)}
                        >
                          {dep.title}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
