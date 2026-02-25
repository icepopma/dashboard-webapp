'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, ZoomIn, ZoomOut, Maximize2, Move, RefreshCw, Link2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface GraphNode {
  id: string
  label: string
  type: 'person' | 'project' | 'concept' | 'skill' | 'memory' | 'task'
  x: number
  y: number
  vx: number
  vy: number
  connections: string[]
}

interface GraphEdge {
  from: string
  to: string
  label?: string
}

const initialNodes: GraphNode[] = [
  { id: '1', label: 'Matt', type: 'person', x: 400, y: 300, vx: 0, vy: 0, connections: ['2', '3', '7'] },
  { id: '2', label: 'Dashboard Webapp', type: 'project', x: 200, y: 200, vx: 0, vy: 0, connections: ['4', '5', '6'] },
  { id: '3', label: 'Content Pipeline', type: 'project', x: 600, y: 200, vx: 0, vy: 0, connections: ['8', '9'] },
  { id: '4', label: 'Next.js', type: 'skill', x: 100, y: 350, vx: 0, vy: 0, connections: [] },
  { id: '5', label: 'Supabase', type: 'skill', x: 150, y: 450, vx: 0, vy: 0, connections: [] },
  { id: '6', label: 'TypeScript', type: 'skill', x: 250, y: 400, vx: 0, vy: 0, connections: [] },
  { id: '7', label: 'Pop', type: 'person', x: 400, y: 150, vx: 0, vy: 0, connections: ['2', '3'] },
  { id: '8', label: 'YouTube', type: 'concept', x: 550, y: 350, vx: 0, vy: 0, connections: [] },
  { id: '9', label: '公众号', type: 'concept', x: 650, y: 400, vx: 0, vy: 0, connections: [] },
  { id: '10', label: 'AI Agents', type: 'concept', x: 300, y: 100, vx: 0, vy: 0, connections: ['2', '3', '7'] },
  { id: '11', label: 'Mission Control', type: 'memory', x: 500, y: 450, vx: 0, vy: 0, connections: ['2'] },
  { id: '12', label: '完成 Home 页面', type: 'task', x: 200, y: 100, vx: 0, vy: 0, connections: ['2'] },
]

const getEdges = (nodes: GraphNode[]): GraphEdge[] => {
  const edges: GraphEdge[] = []
  nodes.forEach(node => {
    node.connections.forEach(targetId => {
      if (nodes.find(n => n.id === targetId)) {
        edges.push({ from: node.id, to: targetId })
      }
    })
  })
  return edges
}

const typeColors: Record<string, string> = {
  person: '#22c55e',
  project: '#3b82f6',
  concept: '#8b5cf6',
  skill: '#f59e0b',
  memory: '#ec4899',
  task: '#06b6d4',
}

const typeLabels: Record<string, string> = {
  person: '人员',
  project: '项目',
  concept: '概念',
  skill: '技能',
  memory: '记忆',
  task: '任务',
}

export function KnowledgeGraphView() {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [filterType, setFilterType] = useState<string | null>(null)

  const edges = getEdges(nodes)

  // Filter nodes based on search and type
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = searchQuery === '' || 
      node.label.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === null || node.type === filterType
    return matchesSearch && matchesType
  })

  // Simple force simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prevNodes => {
        return prevNodes.map(node => {
          if (selectedNode?.id === node.id) return node
          
          let fx = 0, fy = 0
          
          // Repulsion from other nodes
          prevNodes.forEach(other => {
            if (other.id === node.id) return
            const dx = node.x - other.x
            const dy = node.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            if (dist < 150) {
              fx += (dx / dist) * (150 - dist) * 0.02
              fy += (dy / dist) * (150 - dist) * 0.02
            }
          })
          
          // Attraction to connected nodes
          node.connections.forEach(connId => {
            const conn = prevNodes.find(n => n.id === connId)
            if (conn) {
              const dx = conn.x - node.x
              const dy = conn.y - node.y
              const dist = Math.sqrt(dx * dx + dy * dy) || 1
              fx += (dx / dist) * 0.5
              fy += (dy / dist) * 0.5
            }
          })
          
          // Center gravity
          fx += (400 - node.x) * 0.001
          fy += (300 - node.y) * 0.001
          
          const newVx = (node.vx + fx) * 0.9
          const newVy = (node.vy + fy) * 0.9
          
          return {
            ...node,
            vx: newVx,
            vy: newVy,
            x: Math.max(50, Math.min(750, node.x + newVx)),
            y: Math.max(50, Math.min(550, node.y + newVy)),
          }
        })
      })
    }, 50)
    
    return () => clearInterval(interval)
  }, [selectedNode])

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
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)'
    ctx.lineWidth = 1
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from)
      const toNode = nodes.find(n => n.id === edge.to)
      if (fromNode && toNode && filteredNodes.find(n => n.id === fromNode.id) && filteredNodes.find(n => n.id === toNode.id)) {
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.stroke()
      }
    })
    
    // Draw nodes
    filteredNodes.forEach(node => {
      const isSelected = selectedNode?.id === node.id
      const color = typeColors[node.type]
      
      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, isSelected ? 28 : 24, 0, Math.PI * 2)
      ctx.fillStyle = color + '20'
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.stroke()
      
      // Label
      ctx.fillStyle = '#ffffff'
      ctx.font = `${isSelected ? 'bold ' : ''}12px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x, node.y + 40)
    })
    
    ctx.restore()
  }, [nodes, filteredNodes, edges, selectedNode, zoom, offset])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - offset.x) / zoom
    const y = (e.clientY - rect.top - offset.y) / zoom
    
    const clickedNode = filteredNodes.find(node => {
      const dx = node.x - x
      const dy = node.y - y
      return Math.sqrt(dx * dx + dy * dy) < 24
    })
    
    setSelectedNode(clickedNode || null)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2 || e.button === 1) { // Right or middle click
      setIsDragging(true)
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="搜索节点..." 
              className="pl-8 w-48 h-8" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {Object.entries(typeLabels).map(([type, label]) => (
              <Button
                key={type}
                size="sm"
                variant={filterType === type ? 'default' : 'outline'}
                onClick={() => setFilterType(filterType === type ? null : type)}
                className="h-7 text-xs"
                style={{ borderColor: typeColors[type] }}
              >
                <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: typeColors[type] }} />
                {label}
              </Button>
            ))}
          </div>
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
          <Button size="sm" variant="outline" onClick={() => setNodes(initialNodes)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            添加节点
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div ref={containerRef} className="flex-1 relative bg-muted/10">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onContextMenu={e => e.preventDefault()}
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur rounded-lg p-3 border border-border/60">
            <div className="text-xs font-medium mb-2">图例</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(typeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColors[type] }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node Detail Panel */}
        {selectedNode && (
          <div className="w-64 border-l border-border/60 bg-background flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: typeColors[selectedNode.type] }}
                />
                <span className="text-xs text-muted-foreground">{typeLabels[selectedNode.type]}</span>
              </div>
              <h3 className="font-semibold mt-2">{selectedNode.label}</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">连接</div>
                <div className="space-y-1">
                  {selectedNode.connections.map(connId => {
                    const conn = nodes.find(n => n.id === connId)
                    if (!conn) return null
                    return (
                      <div 
                        key={connId}
                        className="flex items-center gap-2 p-2 rounded bg-muted/30 cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedNode(conn)}
                      >
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: typeColors[conn.type] }}
                        />
                        <span className="text-sm">{conn.label}</span>
                      </div>
                    )
                  })}
                  {selectedNode.connections.length === 0 && (
                    <span className="text-xs text-muted-foreground">无连接</span>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/60 space-y-2">
                <Button size="sm" variant="outline" className="w-full gap-2">
                  <Link2 className="h-4 w-4" />
                  添加连接
                </Button>
                <Button size="sm" variant="outline" className="w-full gap-2">
                  <Move className="h-4 w-4" />
                  编辑节点
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
