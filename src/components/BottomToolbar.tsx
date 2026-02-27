'use client'

import React from 'react'

interface BottomToolbarProps {
  isEditMode: boolean
  onToggleEditMode: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  onExportLayout?: () => void
  onImportLayout?: () => void
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  isEditMode,
  onToggleEditMode,
  soundEnabled,
  onToggleSound,
  onExportLayout,
  onImportLayout,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 50,
        background: 'rgba(40, 44, 52, 0.95)',
        padding: '8px 16px',
        borderRadius: 8,
        border: '2px solid #444',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <button
        onClick={onToggleEditMode}
        style={{
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 600,
          background: isEditMode ? '#007fd4' : '#444',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {isEditMode ? '🎬 View Mode' : '🎨 Edit Mode'}
      </button>

      <button
        onClick={onToggleSound}
        style={{
          padding: '8px 12px',
          fontSize: 18,
          background: soundEnabled ? '#444' : '#333',
          color: soundEnabled ? '#fff' : '#888',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
        title={soundEnabled ? 'Mute' : 'Unmute'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {isEditMode && (
        <>
          <div style={{ width: 1, background: '#555' }} />
          
          <button
            onClick={onExportLayout}
            style={{
              padding: '8px 12px',
              fontSize: 14,
              background: '#2d5a3d',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
            title="Export Layout"
          >
            📤 Export
          </button>

          <button
            onClick={onImportLayout}
            style={{
              padding: '8px 12px',
              fontSize: 14,
              background: '#3d5a2d',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
            title="Import Layout"
          >
            📥 Import
          </button>
        </>
      )}
    </div>
  )
}

export default BottomToolbar
