'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { OfficeState } from '@/office/engine/officeState'
import { OfficeCanvas } from '@/components/OfficeCanvas'
import { ZoomControls } from '@/components/ZoomControls'
import { BottomToolbar } from '@/components/BottomToolbar'
import { EditorToolbar } from '@/components/EditorToolbar'
import { AgentStatusPanel } from '@/components/AgentStatusPanel'
import { useSound } from '@/hooks/use-sound'
import { useAgents, toOfficeAgentInfo } from '@/hooks/use-agents'
import { ZOOM_DEFAULT_DPR_FACTOR, UNDO_STACK_MAX_SIZE, DEFAULT_FLOOR_COLOR, DEFAULT_WALL_COLOR } from '@/office/constants'
import { EditTool, TileType, type OfficeLayout, type FloorColor, type AgentInfo } from '@/office/types'
import { serializeLayout, deserializeLayout, createDefaultLayout } from '@/office/layout/layoutSerializer'
import { AGENT_CONFIGS, type AgentRuntimeState } from '@/lib/agent-state'
import type { AgentType } from '@/orchestrator/types'

interface EditorState {
  activeTool: EditTool
  selectedTileType: TileType
  selectedFurnitureType: string
  floorColor: FloorColor
  wallColor: FloorColor
  undoStack: OfficeLayout[]
  redoStack: OfficeLayout[]
}

export const OfficeView: React.FC = () => {
  // Core state
  const [officeState] = useState(() => new OfficeState())
  const [zoom, setZoom] = useState(ZOOM_DEFAULT_DPR_FACTOR)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const panRef = useRef({ x: 0, y: 0 })

  // Sound
  const [soundEnabled, setSoundEnabled] = useState(true)
  const { play } = useSound({ enabled: soundEnabled })

  // Sound helpers
  const playTaskComplete = () => play('complete')
  const playAgentComplete = () => play('notify')
  const playClick = () => play('click')

  // Editor state
  const [editorState, setEditorState] = useState<EditorState>({
    activeTool: EditTool.SELECT,
    selectedTileType: TileType.FLOOR_1,
    selectedFurnitureType: 'desk',
    floorColor: DEFAULT_FLOOR_COLOR,
    wallColor: DEFAULT_WALL_COLOR,
    undoStack: [],
    redoStack: [],
  })

  // Fetch agents from API with real-time polling
  const { agents: apiAgents, loading: agentsLoading } = useAgents({ pollInterval: 3000 })

  // Convert API agents to office format with stable IDs based on agent type
  const agents: AgentInfo[] = useMemo(() => {
    if (!apiAgents || apiAgents.length === 0) {
      // Fallback to demo agents when API is not available
      return [
        { id: 1, name: 'Pop', status: 'active', currentTool: 'Edit' },
        { id: 2, name: 'Codex', status: 'active', currentTool: 'Read' },
        { id: 3, name: 'Claude', status: 'idle' },
        { id: 4, name: 'Quill', status: 'active', currentTool: 'Write' },
        { id: 5, name: 'Echo', status: 'waiting' },
        { id: 6, name: 'Scout', status: 'active', currentTool: 'Search' },
      ]
    }

    // Map API agents to office format with stable numeric IDs
    const agentTypes = ['pop', 'codex', 'claude', 'quill', 'echo', 'scout', 'pixel'] as AgentType[]
    return apiAgents.map((agent, index) => {
      const typeIndex = agentTypes.indexOf(agent.type)
      return {
        id: typeIndex >= 0 ? typeIndex + 1 : index + 1,
        name: agent.config?.name || agent.type,
        status: agent.status === 'working' ? 'active' : 
                agent.status === 'idle' ? 'idle' : 
                agent.status === 'error' ? 'waiting' : 'idle',
        currentTool: agent.currentTask || null,
      }
    })
  }, [apiAgents])

  // Agent mapping for status panel (maps numeric ID to agent type and state)
  const agentMapping = useMemo(() => {
    const map = new Map<number, { type: AgentType; state: AgentRuntimeState }>()
    const agentTypes = ['pop', 'codex', 'claude', 'quill', 'echo', 'scout', 'pixel'] as AgentType[]
    
    apiAgents.forEach((agent) => {
      const typeIndex = agentTypes.indexOf(agent.type)
      const id = typeIndex >= 0 ? typeIndex + 1 : apiAgents.indexOf(agent) + 1
      // Convert API agent state to AgentRuntimeState (convert lastActivity string to Date)
      const runtimeState: AgentRuntimeState = {
        type: agent.type,
        status: agent.status,
        currentTask: agent.currentTask,
        lastActivity: agent.lastActivity ? new Date(agent.lastActivity) : undefined,
        sessionCount: agent.sessionCount,
        successRate: agent.successRate,
      }
      map.set(id, { type: agent.type, state: runtimeState })
    })
    
    return map
  }, [apiAgents])

  // Store last saved layout
  const lastSavedLayoutRef = useRef<OfficeLayout>(officeState.getLayout())

  // Handle agent click
  const handleAgentClick = useCallback((id: number) => {
    playClick()
    const agent = agents.find((a) => a.id === id)
    if (agent) {
      console.log('Clicked agent:', agent.name, agent)
    }
  }, [agents, playClick])

  // Handle zoom change
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
  }, [])

  // Handle edit mode toggle
  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev)
    playClick()
  }, [playClick])

  // Handle sound toggle
  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev)
  }, [])

  // Editor tool handlers
  const handleToolChange = useCallback((tool: EditTool) => {
    setEditorState((prev) => ({ ...prev, activeTool: tool }))
    playClick()
  }, [playClick])

  const handleTileTypeChange = useCallback((type: TileType) => {
    setEditorState((prev) => ({ ...prev, selectedTileType: type }))
  }, [])

  const handleFloorColorChange = useCallback((color: FloorColor) => {
    setEditorState((prev) => ({ ...prev, floorColor: color }))
  }, [])

  const handleWallColorChange = useCallback((color: FloorColor) => {
    setEditorState((prev) => ({ ...prev, wallColor: color }))
  }, [])

  const handleFurnitureTypeChange = useCallback((type: string) => {
    setEditorState((prev) => ({ ...prev, selectedFurnitureType: type }))
  }, [])

  // Save current state to undo stack
  const pushUndo = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      undoStack: [...prev.undoStack.slice(-UNDO_STACK_MAX_SIZE + 1), officeState.getLayout()],
      redoStack: [],
    }))
    setIsDirty(true)
  }, [officeState])

  // Handle undo
  const handleUndo = useCallback(() => {
    if (editorState.undoStack.length === 0) return
    const current = officeState.getLayout()
    const previous = editorState.undoStack[editorState.undoStack.length - 1]
    setEditorState((prev) => ({
      ...prev,
      undoStack: prev.undoStack.slice(0, -1),
      redoStack: [...prev.redoStack, current],
    }))
    officeState.rebuildFromLayout(previous)
    playClick()
  }, [editorState.undoStack, officeState, playClick])

  // Handle redo
  const handleRedo = useCallback(() => {
    if (editorState.redoStack.length === 0) return
    const current = officeState.getLayout()
    const next = editorState.redoStack[editorState.redoStack.length - 1]
    setEditorState((prev) => ({
      ...prev,
      undoStack: [...prev.undoStack, current],
      redoStack: prev.redoStack.slice(0, -1),
    }))
    officeState.rebuildFromLayout(next)
    playClick()
  }, [editorState.redoStack, officeState, playClick])

  // Handle save
  const handleSave = useCallback(() => {
    lastSavedLayoutRef.current = officeState.getLayout()
    setIsDirty(false)
    playTaskComplete()
    console.log('Layout saved!')
  }, [officeState, playTaskComplete])

  // Handle reset
  const handleReset = useCallback(() => {
    officeState.rebuildFromLayout(lastSavedLayoutRef.current)
    setIsDirty(false)
    playClick()
  }, [officeState, playClick])

  // Handle export
  const handleExportLayout = useCallback(() => {
    const json = serializeLayout(officeState.getLayout())
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'office-layout.json'
    a.click()
    URL.revokeObjectURL(url)
    playClick()
  }, [officeState, playClick])

  // Handle import
  const handleImportLayout = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const layout = deserializeLayout(text)
      if (layout) {
        pushUndo()
        officeState.rebuildFromLayout(layout)
        playTaskComplete()
      }
    }
    input.click()
  }, [officeState, pushUndo, playTaskComplete])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault()
          handleUndo()
        } else if (e.key === 'y') {
          e.preventDefault()
          handleRedo()
        } else if (e.key === 's') {
          e.preventDefault()
          handleSave()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo, handleSave])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1a2e',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Main Canvas */}
      <OfficeCanvas
        officeState={officeState}
        agents={agents}
        onAgentClick={handleAgentClick}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        panRef={panRef}
      />

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
          zIndex: 40,
        }}
      />

      {/* Zoom Controls */}
      <ZoomControls zoom={zoom} onZoomChange={handleZoomChange} />

      {/* Bottom Toolbar */}
      <BottomToolbar
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onExportLayout={handleExportLayout}
        onImportLayout={handleImportLayout}
      />

      {/* Editor Toolbar (only in edit mode) */}
      {isEditMode && (
        <>
          {/* Edit Action Bar */}
          {isDirty && (
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 49,
                display: 'flex',
                gap: 4,
                background: 'rgba(40, 44, 52, 0.95)',
                padding: '4px 8px',
                borderRadius: 4,
                border: '2px solid #444',
              }}
            >
              <button
                onClick={handleUndo}
                disabled={editorState.undoStack.length === 0}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  background: editorState.undoStack.length === 0 ? '#333' : '#444',
                  color: editorState.undoStack.length === 0 ? '#666' : '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: editorState.undoStack.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={editorState.redoStack.length === 0}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  background: editorState.redoStack.length === 0 ? '#333' : '#444',
                  color: editorState.redoStack.length === 0 ? '#666' : '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: editorState.redoStack.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Redo
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  background: '#2d5a3d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  background: '#5a2d2d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          )}

          <EditorToolbar
            activeTool={editorState.activeTool}
            selectedTileType={editorState.selectedTileType}
            selectedFurnitureType={editorState.selectedFurnitureType}
            floorColor={editorState.floorColor}
            wallColor={editorState.wallColor}
            onToolChange={handleToolChange}
            onTileTypeChange={handleTileTypeChange}
            onFloorColorChange={handleFloorColorChange}
            onWallColorChange={handleWallColorChange}
            onFurnitureTypeChange={handleFurnitureTypeChange}
          />
        </>
      )}

      {/* Enhanced Agent Status Panel */}
      <AgentStatusPanel
        selectedAgentId={officeState.selectedAgentId}
        onAgentClick={handleAgentClick}
        agentMapping={agentMapping}
      />

      {/* Connection Status Indicator */}
      {agentsLoading && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: 'rgba(40, 44, 52, 0.95)',
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #444',
            zIndex: 50,
            fontSize: 11,
            color: '#888',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#44bb66',
              animation: 'pulse 1s infinite',
            }}
          />
          连接中...
        </div>
      )}
    </div>
  )
}

export default OfficeView
