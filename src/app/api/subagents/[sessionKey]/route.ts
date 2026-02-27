// ─────────────────────────────────────────────────────────────────
// Subagent Status API - 查询 subagent 执行状态和结果
// ─────────────────────────────────────────────────────────────────

import { apiHandler } from '@/lib/api-handler'
import { AppError } from '@/lib/errors'

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789'
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '160ee9bafae48a448824b4eec20752e53412ca1df55f5335'

/**
 * GET /api/subagents/[sessionKey] - 获取 subagent 执行结果
 */
export const GET = apiHandler(async (request) => {
  const url = new URL(request.url)
  const sessionKeyEncoded = url.pathname.split('/').pop()

  if (!sessionKeyEncoded) {
    throw AppError.badRequest('缺少 sessionKey')
  }

  // 解码 URL 编码的 sessionKey
  const sessionKey = decodeURIComponent(sessionKeyEncoded)

  // 调用 Gateway 获取 session 历史
  const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tool: 'sessions_history',
      args: {
        sessionKey,
        limit: 10,
        includeTools: true,
      },
      sessionKey: 'main',
    }),
  })

  if (!response.ok) {
    throw AppError.notFound('Session not found')
  }

  const result = await response.json()

  if (!result.ok) {
    return {
      success: false,
      error: result.error?.message || 'Failed to get session history',
    }
  }

  const history = result.result?.details || result.result
  const messages = history?.messages || []

  // 提取最后的 assistant 消息作为结果
  let lastAssistantMessage = null
  let status = 'running'

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (msg.role === 'assistant') {
      // 提取文本内容
      const textContent = msg.content
        ?.filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n')

      if (textContent) {
        lastAssistantMessage = textContent
      }

      // 检查是否完成
      if (msg.stopReason === 'stop') {
        status = 'completed'
      } else if (msg.stopReason === 'toolUse') {
        status = 'working'
      }

      break
    }
  }

  return {
    sessionKey,
    status,
    result: lastAssistantMessage,
    messages: messages.length,
  }
})
