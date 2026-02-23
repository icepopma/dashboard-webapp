'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase-client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Subscribe to real-time task updates
export function useTaskSubscription() {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task change received:', payload)
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
          if (payload.new && 'id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['tasks', payload.new.id] })
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [queryClient])
}

// Subscribe to real-time idea updates
export function useIdeaSubscription() {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('ideas-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ideas' },
        (payload) => {
          console.log('Idea change received:', payload)
          queryClient.invalidateQueries({ queryKey: ['ideas'] })
          if (payload.new && 'id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['ideas', payload.new.id] })
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [queryClient])
}

// Combined hook for all real-time subscriptions
export function useRealtime() {
  useTaskSubscription()
  useIdeaSubscription()
}
