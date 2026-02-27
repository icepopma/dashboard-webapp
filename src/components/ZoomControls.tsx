'use client'

import React from 'react'
import { ZOOM_MIN, ZOOM_MAX } from '@/office/constants'

interface ZoomControlsProps {
  zoom: number
  onZoomChange: (zoom: number) => void
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomChange }) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(ZOOM_MAX, zoom + 0.5))
  }

  const handleZoomOut = () => {
    onZoomChange(Math.max(ZOOM_MIN, zoom - 0.5))
  }

  const handleReset = () => {
    onZoomChange(2)
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        zIndex: 50,
      }}
    >
      <button
        onClick={handleZoomIn}
        disabled={zoom >= ZOOM_MAX}
        style={{
          width: 40,
          height: 40,
          fontSize: 24,
          background: 'rgba(40, 44, 52, 0.9)',
          color: '#fff',
          border: '2px solid #444',
          borderRadius: 4,
          cursor: zoom >= ZOOM_MAX ? 'not-allowed' : 'pointer',
          opacity: zoom >= ZOOM_MAX ? 0.5 : 1,
        }}
      >
        +
      </button>
      <button
        onClick={handleReset}
        style={{
          width: 40,
          height: 32,
          fontSize: 12,
          background: 'rgba(40, 44, 52, 0.9)',
          color: '#fff',
          border: '2px solid #444',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        {zoom.toFixed(1)}x
      </button>
      <button
        onClick={handleZoomOut}
        disabled={zoom <= ZOOM_MIN}
        style={{
          width: 40,
          height: 40,
          fontSize: 24,
          background: 'rgba(40, 44, 52, 0.9)',
          color: '#fff',
          border: '2px solid #444',
          borderRadius: 4,
          cursor: zoom <= ZOOM_MIN ? 'not-allowed' : 'pointer',
          opacity: zoom <= ZOOM_MIN ? 0.5 : 1,
        }}
      >
        −
      </button>
    </div>
  )
}

export default ZoomControls
