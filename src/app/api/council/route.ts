// ─────────────────────────────────────────────────────────────────
// Council API - 委员会投票
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

// 内存存储
let votes: any[] = [
  {
    id: 'vote-001',
    title: '选择前端框架：React vs Vue',
    description: '新项目应该使用哪个前端框架？',
    options: [
      { id: 'react', label: 'React', votes: ['Pop', 'Codex'] },
      { id: 'vue', label: 'Vue', votes: ['Quill'] },
      { id: 'svelte', label: 'Svelte', votes: [] },
    ],
    status: 'active',
    createdBy: 'Pop',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    deadline: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'vote-002',
    title: '发布时间：早上 vs 晚上',
    description: '内容最佳发布时间？',
    options: [
      { id: 'morning', label: '早上 8-10 点', votes: ['Echo', 'Scout'] },
      { id: 'evening', label: '晚上 8-10 点', votes: ['Quill'] },
    ],
    status: 'active',
    createdBy: 'Echo',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    deadline: new Date(Date.now() + 43200000).toISOString(),
  },
]

export async function GET() {
  return NextResponse.json({
    votes,
    active: votes.filter(v => v.status === 'active').length,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voteId, optionId, voter } = body
    
    const vote = votes.find(v => v.id === voteId)
    if (!vote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 })
    }
    
    // 移除该投票者之前的投票
    vote.options.forEach((opt: any) => {
      opt.votes = opt.votes.filter((v: string) => v !== voter)
    })
    
    // 添加新投票
    const option = vote.options.find((o: any) => o.id === optionId)
    if (option) {
      option.votes.push(voter)
    }
    
    return NextResponse.json({ success: true, vote })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
