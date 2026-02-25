'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckSquare, Clock, X, Check, AlertTriangle, Shield, Info, Trash2, History, Settings, Filter } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

interface Approval {
  id: string
  title: string
  requester: string
  type: 'deployment' | 'content' | 'social' | 'financial' | 'system'
  time: string
  status: 'pending' | 'approved' | 'rejected'
  risk: 'low' | 'medium' | 'high'
  description?: string
}

interface ApprovalRule {
  id: string
  name: string
  type: string
  autoApprove: boolean
  requireConfirmation: boolean
  notifyOn: string[]
}

const getPendingApprovals = (): Approval[] => [
  { id: '1', title: 'Deploy Dashboard v1.2', requester: 'Codex', type: 'deployment', time: '2 hours ago', status: 'pending', risk: 'medium', description: 'Production deployment with database migration' },
  { id: '2', title: 'Publish Article: AI Tools Guide', requester: 'Quill', type: 'content', time: '5 hours ago', status: 'pending', risk: 'low', description: 'Public blog post on AI productivity tools' },
  { id: '3', title: 'Schedule Tweet Storm', requester: 'Echo', type: 'social', time: '1 day ago', status: 'pending', risk: 'low' },
  { id: '4', title: 'Update Supabase Credentials', requester: 'Codex', type: 'system', time: '30 min ago', status: 'pending', risk: 'high', description: 'Rotate database access keys' },
  { id: '5', title: 'Purchase API Credits', requester: 'Pop', type: 'financial', time: '3 hours ago', status: 'pending', risk: 'medium', description: '$200 AnyCrawl API credits' },
]

const approvalHistory = [
  { id: 'h1', title: 'Deploy v1.1', requester: 'Codex', action: 'approved', approver: 'Matt', time: '1 day ago' },
  { id: 'h2', title: 'Post Tweet', requester: 'Echo', action: 'approved', approver: 'Auto', time: '2 days ago' },
  { id: 'h3', title: 'Update README', requester: 'Quill', action: 'rejected', approver: 'Matt', time: '3 days ago' },
  { id: 'h4', title: 'Merge PR #12', requester: 'Codex', action: 'approved', approver: 'Matt', time: '1 week ago' },
]

const approvalRules: ApprovalRule[] = [
  { id: 'r1', name: '低风险自动批准', type: 'content', autoApprove: true, requireConfirmation: false, notifyOn: ['approval'] },
  { id: 'r2', name: '财务需确认', type: 'financial', autoApprove: false, requireConfirmation: true, notifyOn: ['request', 'approval'] },
  { id: 'r3', name: '部署需确认', type: 'deployment', autoApprove: false, requireConfirmation: true, notifyOn: ['request', 'approval', 'rejection'] },
  { id: 'r4', name: '系统变更高优先级', type: 'system', autoApprove: false, requireConfirmation: true, notifyOn: ['request'] },
]

type TabId = 'pending' | 'history' | 'rules'

export function ApprovalsView() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<TabId>('pending')
  const [approvals, setApprovals] = useState<Approval[]>(getPendingApprovals())
  const [showRuleEditor, setShowRuleEditor] = useState(false)
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null)

  const handleApprove = (id: string) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'approved' } : a))
  }

  const handleReject = (id: string) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'rejected' } : a))
  }

  const highRisk = approvals.filter(a => a.risk === 'high' && a.status === 'pending')
  const mediumRisk = approvals.filter(a => a.risk === 'medium' && a.status === 'pending')
  const lowRisk = approvals.filter(a => a.risk === 'low' && a.status === 'pending')
  const pendingCount = approvals.filter(a => a.status === 'pending').length

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20'
      default: return ''
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deployment': return '🚀'
      case 'content': return '📝'
      case 'social': return '📢'
      case 'financial': return '💰'
      case 'system': return '⚙️'
      default: return '📋'
    }
  }

  const tabs = [
    { id: 'pending' as TabId, label: '待审批', icon: CheckSquare, count: pendingCount },
    { id: 'history' as TabId, label: '历史记录', icon: History, count: null },
    { id: 'rules' as TabId, label: '审批规则', icon: Settings, count: null },
  ]

  const ApprovalCard = ({ approval }: { approval: Approval }) => (
    <Card key={approval.id} className={`border-border/60 ${approval.risk === 'high' ? 'border-red-500/30 bg-red-500/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-muted text-lg">
              {getTypeIcon(approval.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{approval.title}</h3>
                <Badge variant="outline" className={getRiskBadge(approval.risk)}>
                  {approval.risk === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {approval.risk}
                </Badge>
              </div>
              {approval.description && (
                <p className="text-sm text-muted-foreground mb-1">{approval.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('approvals.requestedBy')} {approval.requester} • {approval.time}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleReject(approval.id)}>
              <X className="h-4 w-4" />
              {t('approvals.reject')}
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => handleApprove(approval.id)}>
              <Check className="h-4 w-4" />
              {t('approvals.approve')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('approvals.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('approvals.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {highRisk.length > 0 && (
            <Badge variant="outline" className="gap-1.5 border-red-500/30 text-red-500">
              <AlertTriangle className="h-3 w-3" />
              {highRisk.length} 高风险
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="h-3 w-3" />
            {pendingCount}{t('approvals.pending')}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== null && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{tab.count}</Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {activeTab === 'pending' && (
          pendingCount === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-base font-medium">{t('approvals.noPending')}</p>
                <p className="text-sm mt-1">{t('approvals.allCaughtUp')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {highRisk.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-red-500">高风险</h3>
                    <span className="text-xs text-muted-foreground">需要仔细审核</span>
                  </div>
                  <div className="space-y-3">
                    {highRisk.map(approval => <ApprovalCard key={approval.id} approval={approval} />)}
                  </div>
                </div>
              )}

              {mediumRisk.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-yellow-500" />
                    <h3 className="text-sm font-semibold">中等风险</h3>
                  </div>
                  <div className="space-y-3">
                    {mediumRisk.map(approval => <ApprovalCard key={approval.id} approval={approval} />)}
                  </div>
                </div>
              )}

              {lowRisk.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-green-500" />
                    <h3 className="text-sm font-semibold">低风险</h3>
                    <span className="text-xs text-muted-foreground">可快速批准</span>
                  </div>
                  <div className="space-y-3">
                    {lowRisk.map(approval => <ApprovalCard key={approval.id} approval={approval} />)}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {approvalHistory.map((item) => (
              <Card key={item.id} className="border-border/60">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.action === 'approved' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {item.action === 'approved' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.requester} → {item.approver} • {item.time}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={item.action === 'approved' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}>
                      {item.action}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">审批规则配置</h3>
              <Button size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                添加规则
              </Button>
            </div>
            <div className="space-y-2">
              {approvalRules.map((rule) => (
                <Card key={rule.id} className="border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          类型: {rule.type} • 
                          {rule.autoApprove && ' 自动批准'}
                          {rule.requireConfirmation && ' 需确认'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          通知: {rule.notifyOn.length} 事件
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => setEditingRule(rule)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
