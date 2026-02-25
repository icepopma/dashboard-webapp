'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wifi, Coffee, Users, MessageSquare, Volume2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

// Office modules
import type { Character, TileType } from '@/office/types'
import { ZOOM_DEFAULT, TILE_SIZE } from '@/office/constants'
import { Renderer, type RenderOptions } from '@/office/engine/renderer'
import { 
  createDefaultCharacters, 
  updateAllCharacters, 
  sendCharacterTo, 
  startWorking, 
  stopWorking, 
  showChatBubble,
  moveAllToZone,
} from '@/office/engine/characters'
import { createDefaultTileMap } from '@/office/layout/tileMap'
import { createDefaultFurniture } from '@/office/layout/furnitureCatalog'

const activityLog = [
  { id: 1, agent: 'Pop', action: '完成 Home 页面', time: '2 min ago' },
  { id: 2, agent: 'Codex', action: '创建 API 路由', time: '5 min ago' },
  { id: 3, agent: 'Scout', action: '发现新趋势', time: '10 min ago' },
  { id: 4, agent: 'Quill', action: '草拟文章', time: '15 min ago' },
]

type TeamMode = 'working' | 'meeting' | 'break'

export function OfficeView() {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const stateRef = useRef<{
    characters: Character[]
    tiles: TileType[][]
    furniture: ReturnType<typeof createDefaultFurniture>
  }>({
    characters: createDefaultCharacters(),
    tiles: createDefaultTileMap(),
    furniture: createDefaultFurniture(),
  })

  const [selectedChar, setSelectedChar] = useState<Character | null>(null)
  const [teamMode, setTeamMode] = useState<TeamMode>('working')
  const [workingCount, setWorkingCount] = useState(0)
  const [chatMessages, setChatMessages] = useState<{ charId: number; message: string }[]>([])

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { tiles, furniture } = stateRef.current
    const renderer = new Renderer(canvas, {
      zoom: ZOOM_DEFAULT,
      offsetX: 0,
      offsetY: 0,
      selectedCharId: null,
      hoveredCharId: null,
    })
    rendererRef.current = renderer

    let lastTime = 0
    let animId = 0

    const frame = (time: number) => {
      const dt = lastTime === 0 ? 0 : Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      // Update characters
      stateRef.current.characters = updateAllCharacters(
        stateRef.current.characters,
        dt,
        stateRef.current.tiles,
      )

      // Update working count
      const working = stateRef.current.characters.filter(c => c.isActive).length
      setWorkingCount(working)

      // Render
      renderer.updateOptions({
        selectedCharId: selectedChar?.id ?? null,
        hoveredCharId: null,
      })
      renderer.render(
        stateRef.current.tiles,
        stateRef.current.furniture,
        stateRef.current.characters,
      )

      animId = requestAnimationFrame(frame)
    }

    animId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [selectedChar])

  // Chat bubbles during meeting
  useEffect(() => {
    if (teamMode === 'meeting') {
      const interval = setInterval(() => {
        const messages = [
          '这个方案不错',
          '我觉得可以优化',
          '好的，我来处理',
          '让我想想...',
          '完成！',
        ]
        const chars = stateRef.current.characters
        const randomChar = chars[Math.floor(Math.random() * chars.length)]
        const randomMsg = messages[Math.floor(Math.random() * messages.length)]
        
        stateRef.current.characters = stateRef.current.characters.map(c => 
          c.id === randomChar.id ? showChatBubble(c, randomMsg) : c
        )
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [teamMode])

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX / ZOOM_DEFAULT
    const y = (e.clientY - rect.top) * scaleY / ZOOM_DEFAULT

    // Find clicked character
    const clicked = stateRef.current.characters.find(char => {
      const dx = Math.abs(char.x - x)
      const dy = Math.abs(char.y - y)
      return dx < 16 && dy < 24
    })

    setSelectedChar(clicked || null)
  }

  // Move to zone
  const handleMoveToZone = (zone: 'work' | 'coffee' | 'meeting' | 'rest') => {
    stateRef.current.characters = moveAllToZone(
      stateRef.current.characters,
      zone,
      stateRef.current.tiles,
    )
    setTeamMode(zone === 'work' ? 'working' : zone === 'meeting' ? 'meeting' : 'break')
  }

  // Move selected agent to zone
  const handleAgentMove = (zone: 'work' | 'coffee' | 'rest') => {
    if (!selectedChar) return
    
    const zonePositions = {
      work: { col: 3, row: 6 },
      coffee: { col: 8, row: 8 },
      rest: { col: 12, row: 8 },
    }
    
    const pos = zonePositions[zone]
    const blocked = new Set<string>()
    
    stateRef.current.characters = stateRef.current.characters.map(c => {
      if (c.id === selectedChar.id) {
        const updated = sendCharacterTo(c, pos.col, pos.row, stateRef.current.tiles, blocked)
        if (zone === 'work') {
          return { ...updated, isActive: true, task: c.task || '工作中...' }
        } else {
          return { ...updated, isActive: false, task: null }
        }
      }
      return c
    })
    
    setSelectedChar(null)
  }

  const idleCount = stateRef.current.characters.length - workingCount

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/30 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">🏢</div>
          <div>
            <h2 className="text-xl font-bold">{t('office.title')}</h2>
            <p className="text-xs text-slate-400">{t('office.subtitle')}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex gap-6">
          <div className="text-center">
            <Wifi className="w-5 h-5 text-green-500 mx-auto" />
            <div className="text-xl font-bold">{workingCount}</div>
            <div className="text-[10px] text-slate-400">Working</div>
          </div>
          <div className="text-center">
            <Coffee className="w-5 h-5 text-yellow-500 mx-auto" />
            <div className="text-xl font-bold">{idleCount}</div>
            <div className="text-[10px] text-slate-400">Idle</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleMoveToZone('work')} 
            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Wifi className="h-4 w-4" />
            {t('office.allWorking')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleMoveToZone('meeting')} 
            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Users className="h-4 w-4" />
            {t('office.gather')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setTeamMode('meeting') }} 
            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <MessageSquare className="h-4 w-4" />
            {t('office.runMeeting')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 rounded-xl overflow-hidden relative bg-slate-800">
          <canvas
            ref={canvasRef}
            width={640}
            height={352}
            className="w-full h-full cursor-pointer"
            style={{ imageRendering: 'pixelated' }}
            onClick={handleCanvasClick}
          />

          {/* Selected Agent Panel */}
          {selectedChar && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: ['#4488CC', '#CC4444', '#44AA66', '#AA55CC', '#CCAA33', '#FF8844'][selectedChar.palette] }}
                  >
                    {selectedChar.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{selectedChar.name}</div>
                    <div className="text-xs text-slate-400">{selectedChar.role}</div>
                    {selectedChar.task && <div className="text-xs text-green-400 mt-1">📋 {selectedChar.task}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAgentMove('work')} className="gap-1">💻 工作</Button>
                  <Button size="sm" variant="outline" onClick={() => handleAgentMove('coffee')} className="gap-1 bg-white/10">☕ 咖啡</Button>
                  <Button size="sm" variant="outline" onClick={() => handleAgentMove('rest')} className="gap-1 bg-white/10">🛋️ 休息</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-hidden">
          {/* Activity Log */}
          <Card className="bg-black/50 border-white/10 flex-1 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-white/10 flex-shrink-0">
              <h3 className="font-semibold text-sm">📋 {t('office.liveActivity')}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activityLog.map(item => (
                <div key={item.id} className="p-2 rounded bg-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">{item.agent}</span>
                    <span className="text-slate-400">{item.time}</span>
                  </div>
                  <div className="mt-1 text-slate-300">{item.action}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-black/50 border-white/10 flex-shrink-0">
            <div className="p-3">
              <h3 className="font-semibold text-sm mb-3">⚡ 快速操作</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-xs">
                  <Volume2 className="h-3 w-3 mr-1" />播报
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => { stateRef.current.characters = createDefaultCharacters() }} 
                  className="bg-white/10 border-white/20 text-xs"
                >
                  ↻ 重置
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
