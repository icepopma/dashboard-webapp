// ─────────────────────────────────────────────────────────────────
// PR Checker - PR 状态检查器
// ─────────────────────────────────────────────────────────────────

import type { PRInfo, PRReview, CIStatus } from '../orchestrator/types'
import { spawn } from 'child_process'

export class PRChecker {
  /**
   * 获取 PR 信息
   */
  async getPR(prNumber: number): Promise<PRInfo | null> {
    try {
      const result = await this.runGH([
        'pr', 'view', String(prNumber),
        '--json', 'number,title,url,state,reviewDecision,statusCheckRollup'
      ])
      
      const data = JSON.parse(result)
      
      return {
        number: data.number,
        title: data.title,
        url: data.url,
        status: this.mapStatus(data.state, data.reviewDecision),
        ciStatus: this.mapCIStatus(data.statusCheckRollup),
        reviews: [], // 需要额外查询
      }
    } catch (error) {
      console.error(`[PRChecker] 获取 PR #${prNumber} 失败:`, error)
      return null
    }
  }

  /**
   * 检查 PR 是否可以合并
   */
  async canMerge(prNumber: number): Promise<{ canMerge: boolean; reasons: string[] }> {
    const pr = await this.getPR(prNumber)
    if (!pr) {
      return { canMerge: false, reasons: ['PR 不存在'] }
    }

    const reasons: string[] = []

    // 检查状态
    if (pr.status === 'draft') {
      reasons.push('PR 是草稿')
    }

    if (pr.status === 'closed') {
      reasons.push('PR 已关闭')
    }

    // 检查 CI
    if (pr.ciStatus === 'failed') {
      reasons.push('CI 检查失败')
    }

    if (pr.ciStatus === 'pending' || pr.ciStatus === 'running') {
      reasons.push('CI 检查进行中')
    }

    // 检查审核
    if (pr.status === 'review_required') {
      reasons.push('需要代码审核')
    }

    return {
      canMerge: reasons.length === 0,
      reasons,
    }
  }

  /**
   * 获取开放的 PR 列表
   */
  async listOpenPRs(branch?: string): Promise<PRInfo[]> {
    try {
      const args = ['pr', 'list', '--state', 'open', '--json', 'number,title,url,state']
      if (branch) {
        args.push('--head', branch)
      }
      
      const result = await this.runGH(args)
      const prs = JSON.parse(result)
      
      return prs.map((pr: any) => ({
        number: pr.number,
        title: pr.title,
        url: pr.url,
        status: 'open',
        ciStatus: 'pending',
        reviews: [],
      }))
    } catch (error) {
      console.error('[PRChecker] 获取 PR 列表失败:', error)
      return []
    }
  }

  /**
   * 合并 PR
   */
  async mergePR(prNumber: number, method: 'merge' | 'squash' | 'rebase' = 'squash'): Promise<boolean> {
    try {
      await this.runGH(['pr', 'merge', String(prNumber), '--' + method, '--delete-branch'])
      console.log(`[PRChecker] PR #${prNumber} 已合并`)
      return true
    } catch (error) {
      console.error(`[PRChecker] 合并 PR #${prNumber} 失败:`, error)
      return false
    }
  }

  /**
   * 运行 gh 命令
   */
  private runGH(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = ''
      const proc = spawn('gh', args)
      
      proc.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      proc.stderr.on('data', (data) => {
        console.error(`[gh] ${data}`)
      })
      
      proc.on('close', (code) => {
        if (code === 0) {
          resolve(output)
        } else {
          reject(new Error(`gh exited with code ${code}`))
        }
      })
    })
  }

  /**
   * 映射 PR 状态
   */
  private mapStatus(state: string, reviewDecision: string | null): PRInfo['status'] {
    if (state === 'CLOSED') return 'closed'
    if (state === 'MERGED') return 'merged'
    if (reviewDecision === 'APPROVED') return 'approved'
    if (reviewDecision === 'CHANGES_REQUESTED') return 'review_required'
    return 'open'
  }

  /**
   * 映射 CI 状态
   */
  private mapCIStatus(checks: any[]): CIStatus['status'] {
    if (!checks || checks.length === 0) return 'pending'
    
    const allSuccess = checks.every(c => c.conclusion === 'SUCCESS')
    const anyFailed = checks.some(c => c.conclusion === 'FAILURE')
    const anyRunning = checks.some(c => c.status === 'IN_PROGRESS')
    
    if (anyFailed) return 'failed'
    if (anyRunning) return 'running'
    if (allSuccess) return 'passed'
    return 'pending'
  }
}
