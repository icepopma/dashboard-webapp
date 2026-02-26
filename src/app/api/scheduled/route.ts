// ─────────────────────────────────────────────────────────────────
// Scheduled Tasks API - 定时任务 (OpenClaw Cron)
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface ScheduledTask {
  id: string
  name: string
  schedule: string
  nextRun: string | null
  lastRun: string | null
  status: 'pending' | 'running' | 'completed' | 'error'
  target: string
  agent: string
  type: 'cron' | 'scheduled' | 'oneTime'
}

export async function GET() {
  try {
    // Get cron jobs from OpenClaw
    const { stdout } = await execAsync('openclaw cron list --json 2>/dev/null || openclaw cron list 2>/dev/null')
    
    // Parse the output
    const tasks: ScheduledTask[] = []
    const lines = stdout.trim().split('\n').slice(1) // Skip header
    
    for (const line of lines) {
      if (!line.trim()) continue
      
      // Parse: ID Name Schedule Next Last Status Target Agent
      const parts = line.split(/\s+/)
      if (parts.length >= 8) {
        const id = parts[0]
        const name = parts[1]
        const schedule = parts.slice(2, -5).join(' ') // Schedule can have spaces
        const next = parts[parts.length - 5]
        const last = parts[parts.length - 4]
        const status = parts[parts.length - 3]
        const target = parts[parts.length - 2]
        const agent = parts[parts.length - 1]
        
        tasks.push({
          id,
          name,
          schedule,
          nextRun: parseTimeAgo(next),
          lastRun: parseTimeAgo(last),
          status: mapStatus(status),
          target,
          agent,
          type: 'cron',
        })
      }
    }
    
    return NextResponse.json({
      tasks,
      total: tasks.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching scheduled tasks:', error)
    
    // Return mock data if OpenClaw command fails
    return NextResponse.json({
      tasks: [
        {
          id: 'mock-001',
          name: '开发进度检查',
          schedule: '0 0-7 * * * (Asia/Shanghai)',
          nextRun: new Date(Date.now() + 3600000).toISOString(),
          lastRun: new Date(Date.now() - 3600000).toISOString(),
          status: 'pending',
          target: 'isolated',
          agent: 'main',
          type: 'cron',
        },
        {
          id: 'mock-002',
          name: '夜间值班检查',
          schedule: '*/30 * * * * (UTC)',
          nextRun: new Date(Date.now() + 1800000).toISOString(),
          lastRun: new Date(Date.now() - 1800000).toISOString(),
          status: 'running',
          target: 'isolated',
          agent: 'main',
          type: 'cron',
        },
        {
          id: 'mock-003',
          name: '每日工作日志',
          schedule: '50 23 * * * (Asia/Shanghai)',
          nextRun: new Date(Date.now() + 86400000).toISOString(),
          lastRun: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          target: 'isolated',
          agent: 'main',
          type: 'cron',
        },
      ],
      total: 3,
      timestamp: new Date().toISOString(),
      fallback: true,
    })
  }
}

function parseTimeAgo(timeStr: string): string | null {
  if (!timeStr || timeStr === '-') return null
  
  // Parse "Xm ago", "Xh ago", "in Xh" etc.
  const now = new Date()
  
  if (timeStr.includes('ago')) {
    const match = timeStr.match(/(\d+)([mh])\s*ago/)
    if (match) {
      const value = parseInt(match[1])
      const unit = match[2]
      if (unit === 'm') {
        return new Date(now.getTime() - value * 60000).toISOString()
      } else if (unit === 'h') {
        return new Date(now.getTime() - value * 3600000).toISOString()
      }
    }
  } else if (timeStr.includes('in')) {
    const match = timeStr.match(/in\s*(\d+)([mh])/)
    if (match) {
      const value = parseInt(match[1])
      const unit = match[2]
      if (unit === 'm') {
        return new Date(now.getTime() + value * 60000).toISOString()
      } else if (unit === 'h') {
        return new Date(now.getTime() + value * 3600000).toISOString()
      }
    }
  }
  
  return null
}

function mapStatus(status: string): 'pending' | 'running' | 'completed' | 'error' {
  switch (status) {
    case 'running': return 'running'
    case 'completed': return 'completed'
    case 'error': return 'error'
    default: return 'pending'
  }
}
