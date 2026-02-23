'use client'

import { useRealtime } from '@/lib/use-realtime'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  // Enable real-time subscriptions
  useRealtime()
  
  return <>{children}</>
}
