'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, UserPlus, Mail, Calendar } from 'lucide-react'

const people = [
  {
    id: '1',
    name: 'Matt',
    role: 'Owner',
    email: 'icepopma@hotmail.com',
    status: 'online',
    lastActive: 'Just now',
  },
  {
    id: '2',
    name: 'Pop',
    role: 'AI Assistant',
    email: '—',
    status: 'online',
    lastActive: 'Always',
  },
]

export function PeopleView() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">People</h2>
          <p className="text-sm text-muted-foreground">
            管理用户和协作者
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="grid gap-4">
          {people.map((person) => (
            <Card key={person.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{person.name}</h3>
                      <Badge 
                        variant={person.status === 'online' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {person.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{person.role}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {person.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {person.lastActive}
                      </div>
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
