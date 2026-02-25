// ─────────────────────────────────────────────────────────────────
// Approvals API - 审批管理
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

// 内存存储（生产环境应使用 Supabase）
let approvals: any[] = [
  {
    id: 'apr-001',
    title: '部署 Dashboard 到生产环境',
    type: 'deployment',
    risk: 'medium',
    requester: 'Codex',
    description: 'Dashboard v1.0.0 已通过测试，请求部署到生产环境',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending',
  },
  {
    id: 'apr-002',
    title: '合并 PR #12: 添加用户认证',
    type: 'merge',
    risk: 'high',
    requester: 'Claude',
    description: 'PR 包含认证逻辑变更，需要审批',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'pending',
  },
  {
    id: 'apr-003',
    title: '发送营销邮件给 5000 用户',
    type: 'action',
    risk: 'low',
    requester: 'Echo',
    description: '周报邮件，内容已审核',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'pending',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  let filtered = approvals
  if (status) {
    filtered = filtered.filter(a => a.status === status)
  }
  
  return NextResponse.json({
    approvals: filtered,
    pending: approvals.filter(a => a.status === 'pending').length,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, approvalId, reason } = body
    
    const approval = approvals.find(a => a.id === approvalId)
    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }
    
    if (action === 'approve') {
      approval.status = 'approved'
      approval.approvedAt = new Date().toISOString()
      approval.approvedBy = 'Matt'
    } else if (action === 'reject') {
      approval.status = 'rejected'
      approval.rejectedAt = new Date().toISOString()
      approval.rejectedBy = 'Matt'
      approval.reason = reason
    }
    
    return NextResponse.json({ success: true, approval })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 })
  }
}
