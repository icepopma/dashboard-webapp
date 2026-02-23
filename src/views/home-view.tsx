'use client'

import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, FileText, CheckCircle2, Plus, Zap, TrendingUp, Users, Clock } from 'lucide-react'

// Mock stats
const stats = {
  totalIdeas: 12,
  withPlan: 8,
  totalTasks: 47,
  completedTasks: 23,
  completionRate: 49,
}

const recentActivity = [
  { id: 1, action: 'Completed task', item: 'Setup Next.js project', time: '2 hours ago' },
  { id: 2, action: 'Created idea', item: 'AI Content Generator', time: '5 hours ago' },
  { id: 3, action: 'Updated plan', item: 'Dashboard Webapp', time: '1 day ago' },
]

export function HomeView() {
  const { t } = useI18n()

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-6 pt-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('home.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('home.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            {t('common.sync')}
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('common.newIdea')}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mb-6 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stats.totalIdeas}</div>
                  <div className="text-xs text-muted-foreground">{t('home.totalIdeas')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stats.withPlan}</div>
                  <div className="text-xs text-muted-foreground">{t('home.withPlan')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-orange-500/10">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stats.totalTasks}</div>
                  <div className="text-xs text-muted-foreground">{t('home.totalTasks')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stats.completionRate}%</div>
                  <div className="text-xs text-muted-foreground">{t('home.completed')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex gap-6">
        {/* Quick Start */}
        <Card className="flex-1 border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('home.getStarted')}</CardTitle>
            <CardDescription>
              {t('home.selectItem')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
                <FileText className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-medium text-sm mb-1">{t('home.createIdeas')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('home.createIdeasDesc')}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
                <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-medium text-sm mb-1">{t('home.planWork')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('home.planWorkDesc')}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
                <Sparkles className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-medium text-sm mb-1">{t('home.trackProgress')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('home.trackProgressDesc')}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
                <Users className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-medium text-sm mb-1">{t('home.manageTeam')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('home.manageTeamDesc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="w-80 border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('home.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.item}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
