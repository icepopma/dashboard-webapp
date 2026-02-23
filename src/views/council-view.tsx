'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users2, MessageSquare, Vote, Clock } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const getDebates = (t: (key: string) => string) => [
  { id: '1', title: 'Architecture: Monorepo vs Polyrepo', participants: ['Pop', 'Codex', 'Scout'], status: 'active', votes: { optionA: 2, optionB: 1 }, time: '1 hour ago' },
  { id: '2', title: 'Content Strategy: YouTube vs Blog', participants: ['Quill', 'Echo'], status: 'completed', votes: { optionA: 1, optionB: 1 }, time: '3 hours ago' },
]

export function CouncilView() {
  const { t } = useI18n()
  const debates = getDebates(t)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('council.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('council.subtitle')}</p>
        </div>
        <Badge variant="default" className="gap-1.5">
          <Users2 className="h-3 w-3" />
          {debates.filter(d => d.status === 'active').length}{t('council.activeLabel')}
        </Badge>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="space-y-4">
          {debates.map((debate) => (
            <Card key={debate.id} className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{debate.title}</CardTitle>
                  <Badge variant={debate.status === 'active' ? 'default' : 'secondary'}>{debate.status === 'active' ? t('council.active') : 'Completed'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {debate.participants.join(', ')}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {debate.time}
                  </div>
                </div>
                {debate.status === 'active' && (
                  <div className="mt-4 flex items-center gap-2">
                    <Vote className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(debate.votes.optionA / (debate.votes.optionA + debate.votes.optionB)) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{debate.votes.optionA}:{debate.votes.optionB}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
