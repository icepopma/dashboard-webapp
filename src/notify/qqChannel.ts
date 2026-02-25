// ─────────────────────────────────────────────────────────────────
// QQ Channel Notifier - QQ 频道通知
// ─────────────────────────────────────────────────────────────────

import type { Notification, PRInfo, Task } from '../orchestrator/types'

export class QQChannelNotifier {
  private channelId: string
  private botToken: string
  private apiBase = 'https://api.sgroup.qq.com'

  constructor(channelId: string, botToken: string) {
    this.channelId = channelId || process.env.QQ_CHANNEL_ID || ''
    this.botToken = botToken || process.env.QQ_BOT_TOKEN || ''
  }

  /**
   * 发送消息到 QQ 频道
   */
  async send(notification: Notification): Promise<void> {
    if (!this.channelId || !this.botToken) {
      console.log('[QQChannel] 未配置，跳过发送:', notification.title)
      return
    }

    const message = this.formatMessage(notification)

    try {
      const response = await fetch(`${this.apiBase}/channels/${this.channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        console.error('[QQChannel] 发送失败:', await response.text())
      } else {
        console.log('[QQChannel] 发送成功:', notification.title)
      }
    } catch (error) {
      console.error('[QQChannel] 发送异常:', error)
    }
  }

  /**
   * 格式化消息
   */
  private formatMessage(notification: Notification): any {
    const emoji = this.getEmoji(notification.type)
    const color = this.getColor(notification.priority)
    
    // QQ 频道消息格式
    return {
      content: '', // 可选的文本内容
      embed: {
        title: `${emoji} ${notification.title}`,
        description: notification.message,
        color,
        timestamp: new Date().toISOString(),
        fields: notification.data ? this.formatFields(notification.data) : undefined,
      },
    }
  }

  /**
   * 获取表情
   */
  private getEmoji(type: Notification['type']): string {
    const emojis: Record<Notification['type'], string> = {
      task_complete: '✅',
      task_failed: '❌',
      pr_ready: '🔔',
      human_needed: '⚠️',
      daily_summary: '📊',
    }
    return emojis[type] || '📢'
  }

  /**
   * 获取颜色
   */
  private getColor(priority: Notification['priority']): number {
    const colors: Record<Notification['priority'], number> = {
      low: 0x3498db,      // 蓝色
      medium: 0xf39c12,   // 橙色
      high: 0xe74c3c,     // 红色
    }
    return colors[priority] || 0x95a5a6
  }

  /**
   * 格式化字段
   */
  private formatFields(data: any): any[] {
    return Object.entries(data).map(([key, value]) => ({
      name: key,
      value: String(value),
      inline: true,
    }))
  }

  /**
   * PR 就绪通知
   */
  async notifyPRReady(pr: PRInfo): Promise<void> {
    await this.send({
      type: 'pr_ready',
      title: `PR #${pr.number} 准备审核`,
      message: `${pr.title}\n\n${pr.url}`,
      data: {
        '状态': pr.status,
        'CI': pr.ciStatus,
        '审核': pr.reviews.length > 0 ? `${pr.reviews.filter(r => r.status === 'approved').length}/${pr.reviews.length}` : '待审核',
      },
      priority: 'medium',
    })
  }

  /**
   * 任务完成通知
   */
  async notifyTaskComplete(task: Task): Promise<void> {
    await this.send({
      type: 'task_complete',
      title: `任务完成: ${task.title}`,
      message: task.result?.prNumber 
        ? `PR #${task.result.prNumber} 已创建并准备审核`
        : '任务已成功完成',
      data: {
        '类型': task.type,
        '智能体': task.agent || 'N/A',
        '尝试次数': task.attempts,
      },
      priority: 'medium',
    })
  }

  /**
   * 需要人工介入通知
   */
  async notifyHumanIntervention(task: Task, reason: string): Promise<void> {
    await this.send({
      type: 'human_needed',
      title: `需要人工介入: ${task.title}`,
      message: `原因: ${reason}\n\n${task.failureAnalysis?.suggestion || '请检查任务详情'}`,
      data: {
        '任务ID': task.id,
        '类型': task.type,
        '尝试次数': `${task.attempts}/${task.maxAttempts}`,
      },
      priority: 'high',
    })
  }

  /**
   * 每日总结
   */
  async sendDailySummary(summary: {
    completed: number
    pending: number
    failed: number
    tasks: Task[]
  }): Promise<void> {
    const completedTasks = summary.tasks
      .filter(t => t.status === 'completed')
      .map(t => `• ${t.title}`)
      .join('\n')

    await this.send({
      type: 'daily_summary',
      title: '📊 每日总结',
      message: `
✅ 完成: ${summary.completed} 个任务
⏳ 进行中: ${summary.pending} 个任务
❌ 失败: ${summary.failed} 个任务

${completedTasks ? `完成的任务:\n${completedTasks}` : ''}
      `.trim(),
      priority: 'low',
    })
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    if (!this.channelId || !this.botToken) {
      console.log('[QQChannel] 未配置 channelId 或 botToken')
      return false
    }

    try {
      const response = await fetch(`${this.apiBase}/channels/${this.channelId}`, {
        headers: {
          'Authorization': `Bot ${this.botToken}`,
        },
      })
      
      if (response.ok) {
        console.log('[QQChannel] 连接测试成功')
        return true
      } else {
        console.log('[QQChannel] 连接测试失败:', response.status)
        return false
      }
    } catch (error) {
      console.error('[QQChannel] 连接测试异常:', error)
      return false
    }
  }
}
