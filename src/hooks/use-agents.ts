'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { AgentType } from '@/orchestrator/types'
import type { AgentRuntimeState } from '@/lib/agent-state'

export interface AgentFromAPI {
  type: AgentType
  status: 'working' | 'idle' | 'offline' | 'error'
  currentTask?: string
  lastActivity?: string
  sessionCount: number
  successRate: number
  config?: {
    name: string
    role: string
    emoji: string
    capabilities: string[]
    model: string
  }
}

interface AgentsResponse {
  agents: AgentFromAPI[]
  activeSessions: Array<{
    id: string
    agent: AgentType
    taskId: string
    status: string
  }>
  popTasks: {
    active: number
    completed: number
    pending: number
  }
  timestamp: string
}

export interface UseAgentsOptions {
  pollInterval?: number
  enabled?: boolean
}

export function useAgents(options: UseAgentsOptions = {}) {
  const { pollInterval = 3000, enabled = true } = options
  
  const [agents, setAgents] = useState<AgentFromAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchAgents = useCallback(async () => {
    if (!enabled) return
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    try {
      const response = await fetch('/api/agents', {
        signal: abortControllerRef.current.signal,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`)
      }
      
      const data: AgentsResponse = await response.json()
      setAgents(data.agents)
      setError(null)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Ignore abort errors
      }
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [enabled])

  // Initial fetch
  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  // Polling
  useEffect(() => {
    if (!enabled || pollInterval <= 0) return
    
    const interval = setInterval(fetchAgents, pollInterval)
    return () => clearInterval(interval)
  }, [fetchAgents, pollInterval, enabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
  }
}

// Convert API agent to office AgentInfo format
export function toOfficeAgentInfo(agents: AgentFromAPI[]): Array<{
  id: number
  name: string
  status: 'active' | 'idle' | 'waiting' | 'complete'
  currentTool: string | null
  type: AgentType
  state: AgentRuntimeState
}> {
  return agents.map((agent, index) => ({
    id: index + 1,
    name: agent.config?.name || agent.type,
    status: agent.status === 'working' ? 'active' : 
            agent.status === 'idle' ? 'idle' : 
            agent.status === 'error' ? 'waiting' : 'idle',
    currentTool: agent.currentTask || null,
    type: agent.type,
    state: {
      type: agent.type,
      status: agent.status,
      currentTask: agent.currentTask,
      lastActivity: agent.lastActivity ? new Date(agent.lastActivity) : undefined,
      sessionCount: agent.sessionCount,
      successRate: agent.successRate,
    } as AgentRuntimeState,
  }))
}

export default useAgents
