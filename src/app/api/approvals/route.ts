// ─────────────────────────────────────────────────────────────────
// Approvals API - 审批管理 (Supabase + 内存降级)
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

// 内存存储（降级使用）
const memoryApprovals: any[] = [
  {
    id: 'apr-001',
    title: '部署 Dashboard 到生产环境',
    type: 'deployment',
    risk: 'medium',
    requester: 'Codex',
    description: 'Dashboard v1.0.0 已通过测试，请求部署到生产环境',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending',
  },
  {
    id: 'apr-002',
    title: '合并 PR #12: 添加用户认证',
    type: 'merge',
    risk: 'high',
    requester: 'Claude',
    description: 'PR 包含认证逻辑变更，需要审批',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    status: 'pending',
  },
  {
    id: 'apr-003',
    title: '发送营销邮件给 5000 用户',
    type: 'action',
    risk: 'low',
    requester: 'Echo',
    description: '周报邮件，内容已审核',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    status: 'pending',
  },
]

let useSupabase = true

async function getSupabase() {
  try {
    const { supabase } = await import('@/lib/supabase')
    return supabase
  } catch {
    useSupabase = false
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  if (useSupabase) {
    try {
      const supabase = await getSupabase()
      if (supabase) {
        let query = supabase.from('approvals').select('*').order('created_at', { ascending: false })
        if (status) query = query.eq('status', status)
        const { data, error } = await query
        if (!error && data) {
          return NextResponse.json({
            approvals: data,
            pending: data.filter((a: any) => a.status === 'pending').length,
            source: 'supabase',
            timestamp: new Date().toISOString(),
          })
        }
      }
    } catch (err) {
      console.error('Supabase error, falling back to memory:', err)
    }
  }
  
  // 内存降级
  let filtered = memoryApprovals
  if (status) {
    filtered = filtered.filter(a => a.status === status)
  }
  
  return NextResponse.json({
    approvals: filtered,
    pending: memoryApprovals.filter(a => a.status === 'pending').length,
    source: 'memory',
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, approvalId, reason } = body
    
    if (useSupabase) {
      try {
        const supabase = await getSupabase()
        if (supabase) {
          const updates: any = { status: action === 'approve' ? 'approved' : 'rejected' }
          if (action === 'approve') {
            updates.approved_at = new Date().toISOString()
            updates.approved_by = 'Matt'
          } else {
            updates.rejected_at = new Date().toISOString()
            updates.rejected_by = 'Matt'
            updates.rejection_reason = reason
          }
          
          const { data, error } = await supabase
            .from('approvals')
            .update(updates)
            .eq('id', approvalId)
            .select()
            .single()
          
          if (!error && data) {
            return NextResponse.json({ success: true, approval: data, source: 'supabase' })
          }
        }
      } catch (err) {
        console.error('Supabase error, falling back to memory:', err)
      }
    }
    
    // 内存降级
    const approval = memoryApprovals.find(a => a.id === approvalId)
    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }
    
    if (action === 'approve') {
      approval.status = 'approved'
      approval.approved_at = new Date().toISOString()
      approval.approved_by = 'Matt'
    } else if (action === 'reject') {
      approval.status = 'rejected'
      approval.rejected_at = new Date().toISOString()
      approval.rejected_by = 'Matt'
      approval.rejection_reason = reason
    }
    
    return NextResponse.json({ success: true, approval, source: 'memory' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 })
  }
}
