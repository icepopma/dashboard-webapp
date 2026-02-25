// ─────────────────────────────────────────────────────────────────
// Realtime API - SSE 实时同步端点
// ─────────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { realtimeBus } from '@/lib/realtime-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface RealtimeMessage {
  type: 'agents' | 'tasks' | 'ideas' | 'activity' | 'ping'
  data: any
  timestamp: string
}

// 存储客户端连接
const clients = new Set<{
  controller: ReadableStreamDefaultController<Uint8Array>
  channels: Set<string>
}>()

// 广播消息给订阅了相应频道的客户端
function broadcastToChannel(channel: string, message: RealtimeMessage) {
  const data = `data: ${JSON.stringify(message)}\n\n`
  const encoder = new TextEncoder()
  
  clients.forEach(client => {
    if (client.channels.has(channel) || client.channels.size === 0) {
      try {
        client.controller.enqueue(encoder.encode(data))
      } catch (err) {
        clients.delete(client)
      }
    }
  })
}

// 订阅 realtime bus 事件
if (typeof window === 'undefined') {
  const eventTypes = ['agents', 'tasks', 'ideas', 'activity'] as const
  
  eventTypes.forEach(type => {
    realtimeBus.subscribe(type, (event) => {
      broadcastToChannel(type, {
        type,
        data: event.data,
        timestamp: event.timestamp.toISOString(),
      })
    })
  })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const channel = searchParams.get('channel')
  const channelsParam = searchParams.get('channels')
  const channels = new Set<string>(channelsParam?.split(',').filter(Boolean) || [])

  if (channel) {
    channels.add(channel)
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const client = { controller, channels }
      clients.add(client)

      // 发送连接确认
      const connectMsg: RealtimeMessage = {
        type: 'ping',
        data: { connected: true, channels: Array.from(channels) },
        timestamp: new Date().toISOString(),
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectMsg)}\n\n`))

      // 心跳
      const heartbeat = setInterval(() => {
        try {
          const ping: RealtimeMessage = {
            type: 'ping',
            data: { timestamp: Date.now() },
            timestamp: new Date().toISOString(),
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ping)}\n\n`))
        } catch (err) {
          clearInterval(heartbeat)
          clients.delete(client)
        }
      }, 15000)

      // 返回清理函数
      return () => {
        clearInterval(heartbeat)
        clients.delete(client)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

// POST 用于手动触发广播
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return Response.json({ error: 'Missing type or data' }, { status: 400 })
    }

    realtimeBus.publish(type, data)

    return Response.json({ success: true, clients: clients.size })
  } catch (error) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
