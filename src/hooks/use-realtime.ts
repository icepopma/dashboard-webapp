// ─────────────────────────────────────────────────────────────────
// Realtime Hook - 实时数据同步
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from 'react'

interface RealtimeMessage {
  type: 'agents' | 'tasks' | 'ideas' | 'activity' | 'ping'
  data: any
  timestamp: string
}

interface UseRealtimeOptions {
  channels: string[]
  onMessage?: (message: RealtimeMessage) => void
  enabled?: boolean
}

interface RealtimeState {
  connected: boolean
  lastUpdate: Date | null
  error: string | null
}

export function useRealtime<T>(
  channel: string,
  initialData: T,
  options?: {
    enabled?: boolean
    parser?: (data: any) => T
  }
): {
  data: T
  state: RealtimeState
  refresh: () => void
} {
  const [data, setData] = useState<T>(initialData)
  const [state, setState] = useState<RealtimeState>({
    connected: false,
    lastUpdate: null,
    error: null,
  })
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const enabled = options?.enabled ?? true

  const connect = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return

    // 关闭现有连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource(`/api/realtime?channel=${channel}`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setState(prev => ({ ...prev, connected: true, error: null }))
      }

      eventSource.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data)
          
          if (message.type === 'ping') return
          
          const parsedData = options?.parser 
            ? options.parser(message.data) 
            : message.data
          
          setData(parsedData)
          setState(prev => ({ 
            ...prev, 
            lastUpdate: new Date(),
            error: null 
          }))
        } catch (err) {
          console.error('Failed to parse realtime message:', err)
        }
      }

      eventSource.onerror = () => {
        setState(prev => ({ 
          ...prev, 
          connected: false, 
          error: 'Connection lost' 
        }))
        
        // 5秒后重连
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 5000)
      }
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to connect' 
      }))
    }
  }, [channel, enabled, options?.parser])

  const refresh = useCallback(async () => {
    // 手动刷新时，直接调用 API
    try {
      const response = await fetch(`/api/${channel}`)
      if (response.ok) {
        const newData = await response.json()
        const parsedData = options?.parser ? options.parser(newData) : newData
        setData(parsedData)
        setState(prev => ({ ...prev, lastUpdate: new Date() }))
      }
    } catch (err) {
      console.error('Refresh failed:', err)
    }
  }, [channel, options?.parser])

  useEffect(() => {
    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  return { data, state, refresh }
}

// 多频道实时同步
export function useRealtimeChannels(options: UseRealtimeOptions) {
  const [state, setState] = useState<RealtimeState>({
    connected: false,
    lastUpdate: null,
    error: null,
  })
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (options.enabled === false) return

    const channels = options.channels.join(',')
    const eventSource = new EventSource(`/api/realtime?channels=${channels}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setState(prev => ({ ...prev, connected: true, error: null }))
    }

    eventSource.onmessage = (event) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data)
        if (message.type !== 'ping' && options.onMessage) {
          options.onMessage(message)
          setState(prev => ({ ...prev, lastUpdate: new Date() }))
        }
      } catch (err) {
        console.error('Failed to parse message:', err)
      }
    }

    eventSource.onerror = () => {
      setState(prev => ({ ...prev, connected: false, error: 'Connection lost' }))
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        // 重连逻辑会通过 useEffect 重新执行
      }, 5000)
    }

    return () => {
      eventSource.close()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [options.channels.join(','), options.enabled])

  return state
}
