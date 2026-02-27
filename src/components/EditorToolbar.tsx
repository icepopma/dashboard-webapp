'use client'

import React from 'react'
import { EditTool, TileType, FurnitureType } from '@/office/types'
import { FURNITURE_CATALOG } from '@/office/sprites/spriteData'
import type { FloorColor } from '@/office/types'

interface EditorToolbarProps {
  activeTool: EditTool
  selectedTileType: TileType
  selectedFurnitureType: string
  floorColor: FloorColor
  wallColor: FloorColor
  onToolChange: (tool: EditTool) => void
  onTileTypeChange: (type: TileType) => void
  onFloorColorChange: (color: FloorColor) => void
  onWallColorChange: (color: FloorColor) => void
  onFurnitureTypeChange: (type: string) => void
}

const TOOL_BUTTONS: Array<{ tool: EditTool; label: string; icon: string }> = [
  { tool: EditTool.SELECT, label: 'Select', icon: '👆' },
  { tool: EditTool.TILE_PAINT, label: 'Floor', icon: '🎨' },
  { tool: EditTool.WALL_PAINT, label: 'Wall', icon: '🧱' },
  { tool: EditTool.FURNITURE_PLACE, label: 'Furniture', icon: '🪑' },
  { tool: EditTool.ERASE, label: 'Erase', icon: '🗑️' },
  { tool: EditTool.EYEDROPPER, label: 'Pick', icon: '💉' },
]

const TILE_OPTIONS: Array<{ type: TileType; label: string }> = [
  { type: TileType.FLOOR_1, label: 'Floor 1' },
  { type: TileType.FLOOR_2, label: 'Floor 2' },
  { type: TileType.FLOOR_3, label: 'Floor 3' },
  { type: TileType.FLOOR_4, label: 'Floor 4' },
  { type: TileType.FLOOR_5, label: 'Floor 5' },
  { type: TileType.FLOOR_6, label: 'Floor 6' },
  { type: TileType.FLOOR_7, label: 'Floor 7' },
]

const FURNITURE_OPTIONS = Object.values(FURNITURE_CATALOG)

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTool,
  selectedTileType,
  selectedFurnitureType,
  floorColor,
  wallColor,
  onToolChange,
  onTileTypeChange,
  onFloorColorChange,
  onWallColorChange,
  onFurnitureTypeChange,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 50,
        background: 'rgba(40, 44, 52, 0.95)',
        padding: 12,
        borderRadius: 8,
        border: '2px solid #444',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      {/* Tool Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Tools</div>
        {TOOL_BUTTONS.map(({ tool, label, icon }) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            title={label}
            style={{
              width: 44,
              height: 44,
              fontSize: 20,
              background: activeTool === tool ? '#007fd4' : '#333',
              color: '#fff',
              border: activeTool === tool ? '2px solid #00a0ff' : '2px solid #444',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#444', margin: '8px 0' }} />

      {/* Tile Selection (for TILE_PAINT tool) */}
      {activeTool === EditTool.TILE_PAINT && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Floor Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
            {TILE_OPTIONS.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => onTileTypeChange(type)}
                title={label}
                style={{
                  width: 32,
                  height: 32,
                  fontSize: 10,
                  background: selectedTileType === type ? '#007fd4' : '#333',
                  color: '#fff',
                  border: selectedTileType === type ? '2px solid #00a0ff' : '1px solid #444',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floor Color */}
      {(activeTool === EditTool.TILE_PAINT || activeTool === EditTool.WALL_PAINT) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
            {activeTool === EditTool.WALL_PAINT ? 'Wall Color' : 'Floor Color'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, color: '#aaa' }}>
              H: {activeTool === EditTool.WALL_PAINT ? wallColor.h : floorColor.h}°
              <input
                type="range"
                min="0"
                max="360"
                value={activeTool === EditTool.WALL_PAINT ? wallColor.h : floorColor.h}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (activeTool === EditTool.WALL_PAINT) {
                    onWallColorChange({ ...wallColor, h: val })
                  } else {
                    onFloorColorChange({ ...floorColor, h: val })
                  }
                }}
                style={{ width: '100%', marginLeft: 4 }}
              />
            </label>
            <label style={{ fontSize: 10, color: '#aaa' }}>
              S: {activeTool === EditTool.WALL_PAINT ? wallColor.s : floorColor.s}%
              <input
                type="range"
                min="0"
                max="100"
                value={activeTool === EditTool.WALL_PAINT ? wallColor.s : floorColor.s}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (activeTool === EditTool.WALL_PAINT) {
                    onWallColorChange({ ...wallColor, s: val })
                  } else {
                    onFloorColorChange({ ...floorColor, s: val })
                  }
                }}
                style={{ width: '100%', marginLeft: 4 }}
              />
            </label>
            <label style={{ fontSize: 10, color: '#aaa' }}>
              B: {activeTool === EditTool.WALL_PAINT ? wallColor.b : floorColor.b}
              <input
                type="range"
                min="-50"
                max="50"
                value={activeTool === EditTool.WALL_PAINT ? wallColor.b : floorColor.b}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (activeTool === EditTool.WALL_PAINT) {
                    onWallColorChange({ ...wallColor, b: val })
                  } else {
                    onFloorColorChange({ ...floorColor, b: val })
                  }
                }}
                style={{ width: '100%', marginLeft: 4 }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Furniture Selection */}
      {activeTool === EditTool.FURNITURE_PLACE && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Furniture</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {FURNITURE_OPTIONS.map((entry) => (
              <button
                key={entry.type}
                onClick={() => onFurnitureTypeChange(entry.type)}
                title={entry.label}
                style={{
                  padding: '6px 8px',
                  fontSize: 11,
                  background: selectedFurnitureType === entry.type ? '#007fd4' : '#333',
                  color: '#fff',
                  border: selectedFurnitureType === entry.type ? '2px solid #00a0ff' : '1px solid #444',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorToolbar
