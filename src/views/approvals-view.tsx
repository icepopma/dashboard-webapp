'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckSquare, Clock, X, Check, AlertTriangle, Shield, RotateCcw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface Approval {
  id: string
  title: string
  requester: string
  type: string
  risk: 'low' | 'medium' | 'high'
  description?: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export function ApprovalsView() {
  const { t } = useI18n()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals')
      const data = await res.json()
      setApprovals(data.approvals || [])
    } catch (err) {
      console.error('Failed to fetch approvals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovals()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', approvalId: id }),
      })
      fetchApprovals()
    } catch (err) {
      console.error('Failed to approve:', err)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', approvalId: id }),
      })
      fetchApprovals()
    } catch (err) {
      console.error('Failed to reject:', err)
    }
  }

  const pendingApprovals = approvals.filter(a => a.status === 'pending')
  const highRisk = pendingApprovals.filter(a => a.risk === 'high')
  const mediumRisk = pendingApprovals.filter(a => a.risk === 'medium')
  const lowRisk = pendingApprovals.filter(a => a.risk === 'low')

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20'
      default: return ''
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <Shield className="h-4 w-4" />
      case 'low': return <CheckSquare className="h-4 w-4" />
      default: return <CheckSquare className="h-4 w-4" />
    }
  }

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours} 小时前`
    return `${Math.floor(hours / 24)} 天前`
  }

  const ApprovalCard = ({ approval }: { approval: Approval }) => (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={getRiskBadge(approval.risk)}>
              {getRiskIcon(approval.risk)}
              <span className="ml-1">{approval.risk}</span>
            </Badge>
            <span className="text-xs text-muted-foreground">{approval.type}</span>
          </div>
          <h4 className="font-medium text-sm">{approval.title}</h4>
          {approval.description && (
            <p className="text-xs text-muted-foreground mt-1">{approval.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>请求者: {approval.requester}</span>
            <span>{formatTime(approval.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-green-500 hover:text-green-600"
            onClick={() => handleApprove(approval.id)}
          >
            <Check className="h-3 w-3" />
            批准
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-red-500 hover:text-red-600"
            onClick={() => handleReject(approval.id)}
          >
            <X className="h-3 w-3" />
            拒绝
          </Button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 pt-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('approvals.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('approvals.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-yellow-500/10 text-yellow-500">
            {pendingApprovals.length} {t('approvals.pending')}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchApprovals}>
            <RotateCcw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        {pendingApprovals.length === 0 ? (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="py-12 text-center">
              <CheckSquare className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-medium">{t('approvals.noPending')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('approvals.allCaughtUp')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* High Risk */}
            {highRisk.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-500 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  高风险 ({highRisk.length})
                </h3>
                <div className="space-y-2">
                  {highRisk.map(a => <ApprovalCard key={a.id} approval={a} />)}
                </div>
              </div>
            )}

            {/* Medium Risk */}
            {mediumRisk.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-yellow-500 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  中风险 ({mediumRisk.length})
                </h3>
                <div className="space-y-2">
                  {mediumRisk.map(a => <ApprovalCard key={a.id} approval={a} />)}
                </div>
              </div>
            )}

            {/* Low Risk */}
            {lowRisk.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-green-500 mb-3 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  低风险 ({lowRisk.length})
                </h3>
                <div className="space-y-2">
                  {lowRisk.map(a => <ApprovalCard key={a.id} approval={a} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
