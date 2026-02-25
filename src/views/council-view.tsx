'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users2, Vote, Check, RotateCcw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface VoteOption {
  id: string
  label: string
  votes: string[]
}

interface Vote {
  id: string
  title: string
  description: string
  options: VoteOption[]
  status: string
  createdBy: string
  createdAt: string
  deadline: string
}

export function CouncilView() {
  const { t } = useI18n()
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVotes = async () => {
    try {
      const res = await fetch('/api/council')
      const data = await res.json()
      setVotes(data.votes || [])
    } catch (err) {
      console.error('Failed to fetch votes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVotes()
  }, [])

  const handleVote = async (voteId: string, optionId: string) => {
    try {
      await fetch('/api/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteId, optionId, voter: 'Pop' }),
      })
      fetchVotes()
    } catch (err) {
      console.error('Failed to vote:', err)
    }
  }

  const getVoteProgress = (option: VoteOption, totalVotes: number) => {
    if (totalVotes === 0) return 0
    return Math.round((option.votes.length / totalVotes) * 100)
  }

  const formatDeadline = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now()
    const hours = Math.floor(diff / 3600000)
    if (hours < 0) return '已结束'
    if (hours < 24) return `剩余 ${hours} 小时`
    return `剩余 ${Math.floor(hours / 24)} 天`
  }

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
          <h2 className="text-2xl font-semibold">{t('council.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('council.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-blue-500/10 text-blue-500">
            {votes.filter(v => v.status === 'active').length} {t('council.activeLabel')}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchVotes}>
            <RotateCcw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {votes.map(vote => {
            const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes.length, 0)
            const isExpired = new Date(vote.deadline) < new Date()
            
            return (
              <Card key={vote.id} className="border-border/60 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{vote.title}</CardTitle>
                    <Badge className={isExpired ? 'bg-gray-500/10 text-gray-500' : 'bg-green-500/10 text-green-500'}>
                      {isExpired ? '已结束' : '进行中'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{vote.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>发起者: {vote.createdBy}</span>
                    <span>{formatDeadline(vote.deadline)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {vote.options.map(option => {
                      const progress = getVoteProgress(option, totalVotes)
                      const hasVoted = option.votes.includes('Pop')
                      
                      return (
                        <div key={option.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {option.label}
                              {hasVoted && <Check className="h-3 w-3 text-green-500" />}
                            </span>
                            <span className="text-muted-foreground">
                              {option.votes.length} 票 ({progress}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          {option.votes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {option.votes.map(voter => (
                                <span key={voter} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                                  {voter}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {!isExpired && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">快速投票：</p>
                      <div className="flex gap-2">
                        {vote.options.map(option => (
                          <Button
                            key={option.id}
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(vote.id, option.id)}
                            className="flex-1"
                          >
                            <Vote className="h-3 w-3 mr-1" />
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
