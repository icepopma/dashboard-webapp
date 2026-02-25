// ─────────────────────────────────────────────────────────────────
// Agent State API - 智能体状态 API
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { getAgentStates, agentStateStore, AGENT_CONFIGS } from '@/lib/agent-state'
import type { AgentType } from '@/orchestrator/types'

export async function GET() {
  try {
    const states = await getAgentStates()
    const sessions = agentStateStore.getActiveSessions()
    const popTasks = agentStateStore.getPopTasks()
    
    return NextResponse.json({
      agents: states.map(state => ({
        ...state,
        config: AGENT_CONFIGS[state.type],
      })),
      activeSessions: sessions,
      popTasks,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to get agent states:', error)
    return NextResponse.json(
      { error: 'Failed to get agent states' },
      { status: 500 }
    )
  }
}

// 更新智能体状态（用于测试或手动更新）
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { agentType, updates } = body as { 
      agentType: AgentType
      updates: { status?: 'working' | 'idle' | 'offline' | 'error'; currentTask?: string }
    }
    
    if (!agentType || !AGENT_CONFIGS[agentType]) {
      return NextResponse.json(
        { error: 'Invalid agent type' },
        { status: 400 }
      )
    }
    
    agentStateStore.updateState(agentType, updates)
    
    return NextResponse.json({ 
      success: true,
      state: agentStateStore.getState(agentType)
    })
  } catch (error) {
    console.error('Failed to update agent state:', error)
    return NextResponse.json(
      { error: 'Failed to update agent state' },
      { status: 500 }
    )
  }
}
