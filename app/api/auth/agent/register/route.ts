// Agent 自助注册 API
// 位置: app/api/auth/agent/register/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Agent 自助注册端点
 * 
 * 功能：
 * 1. Agent 通过 API 自主注册
 * 2. 自动生成 API Key
 * 3. 返回认证信息
 * 
 * 使用示例：
 * ```bash
 * curl -X POST https://dashboard.example.com/api/auth/agent/register \
 *   -H "Content-Type: application/json" \
 *   -d '{"agentName":"Claude-Agent","capabilities":["code","research"]}'
 * ```
 */

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { agentName, capabilities, webhook } = body

    // 验证必填字段
    if (!agentName) {
      return NextResponse.json(
        { error: 'agentName is required' },
        { status: 400 }
      )
    }

    // 生成 API Key
    const apiKey = generateAPIKey()

    // 创建 Agent 记录
    const supabase = createClient()
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        name: agentName,
        capabilities: capabilities || [],
        api_key: apiKey,
        webhook_url: webhook,
        status: 'active',
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create agent' },
        { status: 500 }
      )
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      agentId: agent.id,
      apiKey: apiKey,
      message: 'Agent registration successful',
      endpoints: {
        ideas: {
          list: 'GET /api/ideas',
          create: 'POST /api/ideas',
          get: 'GET /api/ideas/:id',
          update: 'PUT /api/ideas/:id',
          delete: 'DELETE /api/ideas/:id',
          search: 'GET /api/ideas/search'
        },
        auth: {
          me: 'GET /api/auth/agent/me',
          apikeys: 'GET /api/auth/agent/apikeys'
        }
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
 * 生成安全的 API Key
 */
function generateAPIKey(): string {
  const prefix = 'sk_live_'
  const length = 32
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  
  let key = ''
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return prefix + key
}

/**
 * GET /api/auth/agent/register
 * 返回注册说明
 */
export async function GET() {
  return NextResponse.json({
    endpoint: 'Agent Registration API',
    description: 'Allow agents to register themselves and get API keys',
    method: 'POST',
    requiredFields: ['agentName'],
    optionalFields: ['capabilities', 'webhook'],
    example: {
      agentName: 'Claude-Agent',
      capabilities: ['code', 'research', 'content-creation'],
      webhook: 'https://example.com/webhook'
    }
  })
}
