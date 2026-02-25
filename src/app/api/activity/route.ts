// ─────────────────────────────────────────────────────────────────
// Activity API - 活动日志
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

// 内存存储
let activities: any[] = [
  {
    id: 'act-001',
    agent: 'Pop',
    action: '完成智能体集群架构',
    type: 'complete',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'act-002',
    agent: 'Codex',
    action: '提交 PR #12: 用户认证',
    type: 'pr',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'act-003',
    agent: 'Quill',
    action: '完成博客文章初稿',
    type: 'content',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'act-004',
    agent: 'Echo',
    action: '发布 Twitter 线程',
    type: 'publish',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 'act-005',
    agent: 'Scout',
    action: '完成竞品分析报告',
    type: 'analysis',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const agent = searchParams.get('agent')
  
  let filtered = activities
  if (agent) {
    filtered = filtered.filter(a => a.agent === agent)
  }
  
  // 按时间排序
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  
  return NextResponse.json({
    activities: filtered.slice(0, limit),
    total: activities.length,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newActivity = {
      id: `act-${Date.now()}`,
      ...body,
      timestamp: new Date().toISOString(),
    }
    activities.unshift(newActivity)
    return NextResponse.json({ success: true, activity: newActivity })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
