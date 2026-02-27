'use client'

import React from 'react'

interface AgentLabelsProps {
  agents: Array<{
    id: number
    name: string
    status: 'active' | 'idle' | 'waiting' | 'complete'
    currentTool?: string | null
  }>
  selectedAgentId: number | null
  offsetX: number
  offsetY: number
  zoom: number
}

export const AgentLabels: React.FC<AgentLabelsProps> = ({
  agents,
  selectedAgentId,
  offsetX,
  offsetY,
  zoom,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 30,
      }}
    >
      {agents.map((agent) => {
        // Calculate position based on agent's world position
        // This is a simplified version - in real implementation,
        // you'd get the actual character position from officeState
        return (
          <div
            key={agent.id}
            style={{
              position: 'absolute',
              left: offsetX + 100 * zoom,
              top: offsetY + 50 * zoom - 30,
              background: selectedAgentId === agent.id
                ? 'rgba(0, 127, 212, 0.9)'
                : 'rgba(40, 44, 52, 0.85)',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 11 * Math.min(zoom, 2),
              fontWeight: 500,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              border: selectedAgentId === agent.id
                ? '2px solid #007fd4'
                : '1px solid #555',
            }}
          >
            {agent.name}
            {agent.currentTool && (
              <span style={{ opacity: 0.7, marginLeft: 4 }}>
                • {agent.currentTool}
              </span>
            )}
            {agent.status === 'waiting' && (
              <span
                style={{
                  marginLeft: 4,
                  color: '#ffa500',
                }}
              >
                ⏳
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default AgentLabels
