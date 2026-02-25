// ─────────────────────────────────────────────────────────────────
// Projects API - 项目管理
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

// 内存存储
let projects: any[] = [
  {
    id: 'proj-001',
    name: 'Dashboard Webapp',
    description: 'AI 智能体管理仪表板',
    status: 'active',
    progress: 65,
    color: '#3b82f6',
    startDate: '2026-02-20',
    targetDate: '2026-03-15',
    tasks: { total: 58, completed: 38 },
    members: ['Pop', 'Codex', 'Claude'],
    lastUpdate: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'proj-002',
    name: 'Content Pipeline',
    description: '内容创作与发布流程',
    status: 'active',
    progress: 45,
    color: '#8b5cf6',
    startDate: '2026-02-15',
    targetDate: '2026-03-01',
    tasks: { total: 24, completed: 11 },
    members: ['Quill', 'Echo'],
    lastUpdate: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'proj-003',
    name: 'AI Agent System',
    description: '智能体集群架构',
    status: 'planning',
    progress: 20,
    color: '#f59e0b',
    startDate: '2026-02-25',
    targetDate: '2026-04-01',
    tasks: { total: 15, completed: 3 },
    members: ['Pop', 'Scout'],
    lastUpdate: new Date(Date.now() - 172800000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  let filtered = projects
  if (status) {
    filtered = filtered.filter(p => p.status === status)
  }
  
  return NextResponse.json({
    projects: filtered,
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newProject = {
      id: `proj-${Date.now()}`,
      ...body,
      progress: 0,
      tasks: { total: 0, completed: 0 },
      lastUpdate: new Date().toISOString(),
    }
    projects.push(newProject)
    return NextResponse.json({ success: true, project: newProject })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
