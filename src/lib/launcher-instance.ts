// ─────────────────────────────────────────────────────────────────
// Agent Launcher Instance - 单例启动器实例
// ─────────────────────────────────────────────────────────────────

import { AgentLauncher } from '@/launcher/process'

// 单例实例（仅在服务器端使用）
let launcherInstance: AgentLauncher | null = null

export function getLauncher(): AgentLauncher | null {
  // 只在服务器端创建
  if (typeof window !== 'undefined') {
    return null
  }

  if (!launcherInstance) {
    try {
      launcherInstance = new AgentLauncher()

      // 监听事件
      launcherInstance.on('started', (session) => {
        console.log(`[Launcher] Session started: ${session.id} (${session.agent})`)
      })

      launcherInstance.on('closed', (session) => {
        console.log(`[Launcher] Session closed: ${session.id}`)
      })

      launcherInstance.on('error', (session, error) => {
        console.error(`[Launcher] Session error: ${session.id}`, error)
      })

      launcherInstance.on('stalled', (session) => {
        console.warn(`[Launcher] Session stalled: ${session.id}`)
      })

      launcherInstance.on('restarting', (session) => {
        console.log(`[Launcher] Session restarting: ${session.id}`)
      })

      launcherInstance.on('failed', (session) => {
        console.error(`[Launcher] Session failed: ${session.id}`)
      })
    } catch (err) {
      console.error('[Launcher] Failed to create instance:', err)
      return null
    }
  }

  return launcherInstance
}

export type { AgentLauncher }
