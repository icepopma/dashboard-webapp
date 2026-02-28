'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AGENT_CONFIGS, type AgentRuntimeState } from '@/lib/agent-state'
import type { AgentType } from '@/orchestrator/types'

interface AgentStatusPanelProps {
  selectedAgentId: number | null
  onAgentClick: (id: number) => void
  agentMapping: Map<number, { type: AgentType; state: AgentRuntimeState }>
}

const STATUS_COLORS = {
  working: '#44bb66',
  idle: '#ffaa00',
  offline: '#888888',
  error: '#ff4444',
}

const STATUS_LABELS = {
  working: '工作中',
  idle: '空闲',
  offline: '离线',
  error: '错误',
}

export const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  selectedAgentId,
  onAgentClick,
  agentMapping,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Convert agent mapping to array for rendering
  const agentList = Array.from(agentMapping.entries()).map(([id, data]) => ({
    id,
    ...data,
    config: AGENT_CONFIGS[data.type],
  }))

  // Count by status
  const statusCounts = {
    working: agentList.filter(a => a.state.status === 'working').length,
    idle: agentList.filter(a => a.state.status === 'idle').length,
    offline: agentList.filter(a => a.state.status === 'offline').length,
    error: agentList.filter(a => a.state.status === 'error').length,
  }

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(40, 44, 52, 0.95)',
          padding: 12,
          borderRadius: 8,
          border: '2px solid #444',
          zIndex: 50,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>👥</span>
        <span style={{ fontSize: 12, color: '#fff' }}>{agentList.length}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {statusCounts.working > 0 && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS.working }} />
          )}
          {statusCounts.idle > 0 && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS.idle }} />
          )}
        </div>
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        background: 'rgba(40, 44, 52, 0.95)',
        padding: 12,
        borderRadius: 8,
        border: '2px solid #444',
        zIndex: 50,
        minWidth: 220,
        maxWidth: 280,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🏢</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>团队状态</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            padding: 2,
          }}
        >
          ✕
        </button>
      </div>

      {/* Status Summary */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
          padding: '8px 0',
          borderBottom: '1px solid #333',
        }}
      >
        {Object.entries(statusCounts).map(([status, count]) => (
          count > 0 && (
            <div
              key={status}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
                  boxShadow: status === 'working' ? '0 0 6px currentColor' : 'none',
                }}
              />
              <span style={{ fontSize: 11, color: '#aaa' }}>{count}</span>
            </div>
          )
        ))}
      </div>

      {/* Agent List */}
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {agentList.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onAgentClick(agent.id)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '8px 10px',
              marginBottom: 4,
              background: selectedAgentId === agent.id ? 'rgba(0, 127, 212, 0.25)' : 'transparent',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background 0.15s',
              border: selectedAgentId === agent.id ? '1px solid rgba(0, 127, 212, 0.5)' : '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (selectedAgentId !== agent.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedAgentId !== agent.id) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {/* Status Indicator */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: STATUS_COLORS[agent.state.status],
                flexShrink: 0,
                marginTop: 3,
                boxShadow: agent.state.status === 'working' ? '0 0 8px currentColor' : 'none',
                animation: agent.state.status === 'working' ? 'pulse 2s infinite' : 'none',
              }}
            />

            {/* Agent Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{agent.config?.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>
                  {agent.config?.name || agent.type}
                </span>
              </div>
              
              <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                {agent.config?.role}
              </div>

              {/* Current Task */}
              {agent.state.currentTask && (
                <div
                  style={{
                    fontSize: 11,
                    color: '#aaa',
                    marginTop: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={agent.state.currentTask}
                >
                  📋 {agent.state.currentTask}
                </div>
              )}

              {/* Status Label */}
              <div
                style={{
                  fontSize: 10,
                  color: STATUS_COLORS[agent.state.status],
                  marginTop: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {STATUS_LABELS[agent.state.status]}
              </div>
            </div>

            {/* Activity Indicator */}
            {agent.state.status === 'working' && (
              <div
                style={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: '#44bb66',
                      animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px solid #333',
          fontSize: 10,
          color: '#666',
          textAlign: 'center',
        }}
      >
        点击查看详情 • 实时更新中
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}

export default AgentStatusPanel
