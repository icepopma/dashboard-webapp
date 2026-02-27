'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { OfficeState } from '@/office/engine/officeState'
import { startGameLoop } from '@/office/engine/gameLoop'
import { renderFrame } from '@/office/engine/renderer'
import { TILE_SIZE, ZOOM_MIN, ZOOM_MAX, ZOOM_DEFAULT_DPR_FACTOR } from '@/office/constants'
import type { AgentInfo } from '@/office/types'

interface OfficeCanvasProps {
  officeState: OfficeState
  agents?: AgentInfo[]
  onAgentClick?: (id: number) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  panRef: React.MutableRefObject<{ x: number; y: number }>
}

export const OfficeCanvas: React.FC<OfficeCanvasProps> = ({
  officeState,
  agents = [],
  onAgentClick,
  zoom,
  onZoomChange,
  panRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const stopLoopRef = useRef<(() => void) | null>(null)
  const isDraggingRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Sync agents with office state
  useEffect(() => {
    const currentIds = new Set(officeState.getCharacters().map((c) => c.id))
    const agentIds = new Set(agents.map((a) => a.id))

    // Add new agents
    for (const agent of agents) {
      if (!currentIds.has(agent.id)) {
        officeState.addAgent(agent.id, agent.name)
      }
      // Update agent state
      const ch = officeState.characters.get(agent.id)
      if (ch) {
        officeState.setAgentActive(agent.id, agent.status === 'active')
        officeState.setAgentTool(agent.id, agent.currentTool || null)
        if (agent.status === 'waiting') {
          officeState.showWaitingBubble(agent.id)
        } else {
          if (ch.bubbleType === 'waiting') {
            ch.bubbleType = null
          }
        }
      }
    }

    // Remove agents no longer present
    for (const id of currentIds) {
      if (!agentIds.has(id)) {
        officeState.removeAgent(id)
      }
    }
  }, [agents, officeState])

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    stopLoopRef.current = startGameLoop(canvas, {
      update: (dt) => {
        officeState.update(dt)
      },
      render: (ctx) => {
        renderFrame(
          ctx,
          canvas.width,
          canvas.height,
          officeState.tileMap,
          officeState.furniture,
          officeState.getCharacters(),
          zoom,
          panRef.current.x,
          panRef.current.y,
          officeState.selectedAgentId,
          officeState.hoveredAgentId,
          officeState.layout.tileColors,
          officeState.layout.cols,
          officeState.layout.rows,
        )
      },
    })

    return () => {
      if (stopLoopRef.current) {
        stopLoopRef.current()
      }
    }
  }, [officeState, zoom, panRef])

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = false
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons === 1) {
      const dx = e.clientX - lastMouseRef.current.x
      const dy = e.clientY - lastMouseRef.current.y
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        isDraggingRef.current = true
      }
      panRef.current.x += dx
      panRef.current.y += dy
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
    }
  }, [panRef])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !isDraggingRef.current) {
      // Click - check for character hit
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const canvasX = e.clientX - rect.left
      const canvasY = e.clientY - rect.top

      const layout = officeState.getLayout()
      const mapW = layout.cols * TILE_SIZE * zoom
      const mapH = layout.rows * TILE_SIZE * zoom
      const offsetX = (canvas.width - mapW) / 2 + panRef.current.x
      const offsetY = (canvas.height - mapH) / 2 + panRef.current.y

      const worldX = (canvasX - offsetX) / zoom
      const worldY = (canvasY - offsetY) / zoom

      const hitId = officeState.getCharacterAt(worldX, worldY)
      if (hitId !== null) {
        officeState.selectedAgentId = hitId
        onAgentClick?.(hitId)
      } else {
        officeState.selectedAgentId = null
      }
    }
  }, [officeState, zoom, panRef, onAgentClick])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.5 : 0.5
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom + delta))
    onZoomChange(newZoom)
  }, [zoom, onZoomChange])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          display: 'block',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  )
}

export default OfficeCanvas
