// Ideas API - Agent-Friendly 版本
// 位置: app/api/ideas/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Ideas API - 支持人类和 Agent 双重访问
 * 
 * 功能：
 * 1. GET: 获取 ideas 列表（支持分页、搜索、过滤）
 * 2. POST: 创建新 idea
 * 
 * 认证方式：
 * - 人类: Session cookie
 * - Agent: API Key (Authorization: Bearer sk_live_xxx)
 */

// Agent API Key 验证
async function validateAgentAPIKey(request: Request): Promise<{ valid: boolean; agentId?: string }> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false }
  }
  
  const apiKey = authHeader.substring(7)
  
  // 验证 API Key 格式
  if (!apiKey.startsWith('sk_live_')) {
    return { valid: false }
  }
  
  // 查询数据库验证
  const supabase = createClient()
  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, status')
    .eq('api_key', apiKey)
    .eq('status', 'active')
    .single()
  
  if (error || !agent) {
    return { valid: false }
  }
  
  // 更新最后活跃时间
  await supabase
    .from('agents')
    .update({ last_active: new Date().toISOString() })
    .eq('id', agent.id)
  
  return { valid: true, agentId: agent.id }
}

/**
 * GET /api/ideas
 * 获取 ideas 列表
 * 
 * 查询参数：
 * - page: 页码（默认 1）
 * - limit: 每页数量（默认 20）
 * - search: 搜索关键词
 * - status: 过滤状态
 * - tags: 过滤标签（逗号分隔）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    
    const supabase = createClient()
    
    // 构建查询
    let query = supabase
      .from('ideas')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    // 添加搜索条件
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    // 添加状态过滤
    if (status) {
      query = query.eq('status', status)
    }
    
    // 添加标签过滤
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    }
    
    const { data: ideas, error, count } = await query
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch ideas' },
        { status: 500 }
      )
    }
    
    // 返回 Agent-Friendly 格式
    return NextResponse.json({
      success: true,
      data: ideas,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ideas
 * 创建新 idea
 * 
 * 支持两种认证：
 * 1. 人类用户（session）
 * 2. Agent（API Key）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, tags, priority, status } = body
    
    // 验证必填字段
    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // 检测是否为 Agent 请求
    const agentAuth = await validateAgentAPIKey(request)
    
    let userId: string
    let source: string
    
    if (agentAuth.valid) {
      // Agent 创建
      userId = agentAuth.agentId!
      source = 'agent'
    } else {
      // 人类用户创建
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      userId = user.id
      source = 'human'
    }
    
    // 创建 idea
    const { data: idea, error } = await supabase
      .from('ideas')
      .insert({
        user_id: userId,
        title,
        description: description || '',
        tags: tags || [],
        priority: priority || 'medium',
        status: status || 'draft',
        source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create idea' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: idea,
      message: 'Idea created successfully'
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
