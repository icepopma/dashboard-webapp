'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users2, MessageSquare, Vote, Clock, Plus, AlertCircle, Check, X, RefreshCw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface Debate {
  id: string
  title: string
  description?: string
  participants: string[]
  status: 'active' | 'completed' | 'tie'
  votes: { optionA: number; optionB: number }
  options: { a: string; b: string }
  time: string
  deadline?: string
  creator: string
}

const getDebates = (): Debate[] => [
  { 
    id: '1', 
    title: 'Architecture: Monorepo vs Polyrepo', 
    description: '决定项目代码组织方式',
    participants: ['Pop', 'Codex', 'Scout'], 
    status: 'active', 
    votes: { optionA: 2, optionB: 1 }, 
    options: { a: 'Monorepo', b: 'Polyrepo' },
    time: '1 hour ago',
    deadline: '2 hours',
    creator: 'Pop'
  },
  { 
    id: '2', 
    title: 'Content Strategy: YouTube vs Blog', 
    description: '优先投入哪个平台',
    participants: ['Quill', 'Echo'], 
    status: 'tie', 
    votes: { optionA: 1, optionB: 1 }, 
    options: { a: 'YouTube', b: 'Blog' },
    time: '3 hours ago',
    creator: 'Quill'
  },
  { 
    id: '3', 
    title: 'Framework: Next.js vs Nuxt', 
    participants: ['Codex', 'Pop'], 
    status: 'completed', 
    votes: { optionA: 2, optionB: 0 }, 
    options: { a: 'Next.js', b: 'Nuxt' },
    time: '1 day ago',
    creator: 'Codex'
  },
]

const tieResolutionMethods = [
  { id: 'random', label: '随机决定', description: '抛硬币决定' },
  { id: 'creator', label: '创建者决定', description: '由议题创建者做最终决定' },
  { id: 'escalate', label: '升级决策', description: '提交给更高层级决策' },
  { id: 'delay', label: '延期再议', description: '24小时后重新投票' },
]

export function CouncilView() {
  const { t } = useI18n()
  const [debates, setDebates] = useState<Debate[]>(getDebates())
  const [showCreateDebate, setShowCreateDebate] = useState(false)
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null)
  const [showTieResolution, setShowTieResolution] = useState<string | null>(null)

  const activeDebates = debates.filter(d => d.status === 'active')
  const tieDebates = debates.filter(d => d.status === 'tie')
  const completedDebates = debates.filter(d => d.status === 'completed')

  const handleVote = (debateId: string, option: 'a' | 'b') => {
    setDebates(debates.map(d => {
      if (d.id === debateId) {
        const newVotes = option === 'a' 
          ? { ...d.votes, optionA: d.votes.optionA + 1 }
          : { ...d.votes, optionB: d.votes.optionB + 1 }
        
        // Check for tie
        const total = newVotes.optionA + newVotes.optionB
        if (total >= d.participants.length && newVotes.optionA === newVotes.optionB) {
          return { ...d, votes: newVotes, status: 'tie' }
        }
        
        // Check for completion
        if (total >= d.participants.length && newVotes.optionA !== newVotes.optionB) {
          return { ...d, votes: newVotes, status: 'completed' }
        }
        
        return { ...d, votes: newVotes }
      }
      return d
    }))
  }

  const handleTieResolution = (debateId: string, method: string) => {
    const debate = debates.find(d => d.id === debateId)
    if (!debate) return

    let winner = 'a'
    if (method === 'random') {
      winner = Math.random() > 0.5 ? 'a' : 'b'
    } else if (method === 'creator') {
      winner = 'a' // Creator prefers option A
    }

    setDebates(debates.map(d => {
      if (d.id === debateId) {
        return {
          ...d,
          status: 'completed',
          votes: winner === 'a' 
            ? { ...d.votes, optionA: d.votes.optionA + 1 }
            : { ...d.votes, optionB: d.votes.optionB + 1 }
        }
      }
      return d
    }))
    setShowTieResolution(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'tie': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default: return ''
    }
  }

  const DebateCard = ({ debate }: { debate: Debate }) => {
    const totalVotes = debate.votes.optionA + debate.votes.optionB
    const participationRate = Math.round((totalVotes / debate.participants.length) * 100)
    const optionAPercent = totalVotes > 0 ? (debate.votes.optionA / totalVotes) * 100 : 50

    return (
      <Card key={debate.id} className={`border-border/60 ${debate.status === 'tie' ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{debate.title}</CardTitle>
            <Badge variant="outline" className={getStatusBadge(debate.status)}>
              {debate.status === 'tie' && <AlertCircle className="h-3 w-3 mr-1" />}
              {debate.status === 'active' ? t('council.active') : debate.status === 'tie' ? '平局' : '已完成'}
            </Badge>
          </div>
          {debate.description && (
            <p className="text-xs text-muted-foreground">{debate.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {/* Participants */}
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users2 className="h-4 w-4" />
              {debate.participants.join(', ')}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {debate.time}
            </div>
          </div>

          {/* Voting Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{debate.options.a}</span>
              <span className="text-muted-foreground">{debate.votes.optionA} 票</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${optionAPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{debate.options.b}</span>
              <span className="text-muted-foreground">{debate.votes.optionB} 票</span>
            </div>

            {/* Vote buttons for active debates */}
            {debate.status === 'active' && (
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 gap-1"
                  onClick={() => handleVote(debate.id, 'a')}
                >
                  <Check className="h-3 w-3" />
                  投 {debate.options.a}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 gap-1"
                  onClick={() => handleVote(debate.id, 'b')}
                >
                  <Check className="h-3 w-3" />
                  投 {debate.options.b}
                </Button>
              </div>
            )}

            {/* Tie resolution */}
            {debate.status === 'tie' && (
              <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2 text-yellow-500 text-sm font-medium mb-2">
                  <AlertCircle className="h-4 w-4" />
                  平局！需要决定
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {tieResolutionMethods.map(method => (
                    <Button 
                      key={method.id}
                      size="sm" 
                      variant="outline"
                      className="justify-start text-xs"
                      onClick={() => handleTieResolution(debate.id, method.id)}
                    >
                      {method.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Result for completed */}
            {debate.status === 'completed' && (
              <div className="mt-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20 text-sm">
                <div className="flex items-center gap-2 text-green-500">
                  <Check className="h-4 w-4" />
                  结果: {debate.votes.optionA > debate.votes.optionB ? debate.options.a : debate.options.b}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>参与率: {participationRate}%</span>
            {debate.deadline && <span>截止: {debate.deadline}</span>}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('council.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('council.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {tieDebates.length > 0 && (
            <Badge variant="outline" className="gap-1.5 border-yellow-500/30 text-yellow-500">
              <AlertCircle className="h-3 w-3" />
              {tieDebates.length} 待决
            </Badge>
          )}
          <Badge variant="default" className="gap-1.5">
            <Users2 className="h-3 w-3" />
            {activeDebates.length}{t('council.activeLabel')}
          </Badge>
          <Button size="sm" className="gap-2" onClick={() => setShowCreateDebate(true)}>
            <Plus className="h-4 w-4" />
            新建投票
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Tie Debates - Priority */}
        {tieDebates.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <h3 className="text-sm font-semibold text-yellow-500">需要决策</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tieDebates.map(debate => <DebateCard key={debate.id} debate={debate} />)}
            </div>
          </div>
        )}

        {/* Active Debates */}
        {activeDebates.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Vote className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold">活跃投票</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeDebates.map(debate => <DebateCard key={debate.id} debate={debate} />)}
            </div>
          </div>
        )}

        {/* Completed Debates */}
        {completedDebates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Check className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-semibold">已完成的投票</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedDebates.map(debate => <DebateCard key={debate.id} debate={debate} />)}
            </div>
          </div>
        )}

        {/* Empty State */}
        {debates.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium">暂无投票</p>
              <p className="text-sm mt-1">创建新投票开始团队决策</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
