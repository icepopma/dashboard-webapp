'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, RotateCcw, Plus, Shield, Clock } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface Person {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'ai'
  status: 'online' | 'offline' | 'away'
  lastActive: string
  avatar?: string
}

const peopleData: Person[] = [
  {
    id: 'person-001',
    name: 'Matt',
    email: 'icepopma@hotmail.com',
    role: 'owner',
    status: 'online',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'person-002',
    name: 'Pop',
    email: 'pop@openclaw.ai',
    role: 'ai',
    status: 'online',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'person-003',
    name: 'Codex',
    email: 'codex@openclaw.ai',
    role: 'ai',
    status: 'online',
    lastActive: new Date().toISOString(),
  },
]

export function PeopleView() {
  const { t } = useI18n()
  const [people, setPeople] = useState<Person[]>(peopleData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟加载
    setTimeout(() => setLoading(false), 500)
  }, [])

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner': return <Badge className="bg-purple-500/10 text-purple-500">{t('people.owner')}</Badge>
      case 'admin': return <Badge className="bg-blue-500/10 text-blue-500">管理员</Badge>
      case 'ai': return <Badge className="bg-green-500/10 text-green-500">{t('people.aiAssistant')}</Badge>
      default: return <Badge variant="secondary">成员</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const formatLastActive = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    if (diff < 60000) return t('people.justNow')
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    return `${Math.floor(diff / 3600000)} 小时前`
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
          <h2 className="text-2xl font-semibold">{t('people.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('people.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('people.invite')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>总计: <span className="text-foreground font-medium">{people.length}</span></span>
          <span>在线: <span className="text-green-500 font-medium">{people.filter(p => p.status === 'online').length}</span></span>
          <span>AI: <span className="text-blue-500 font-medium">{people.filter(p => p.role === 'ai').length}</span></span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map(person => (
            <Card key={person.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium">
                      {person.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${getStatusColor(person.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{person.name}</span>
                      {getRoleBadge(person.role)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatLastActive(person.lastActive)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
