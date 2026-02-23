'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, Clock, X, Check } from 'lucide-react'

const pendingApprovals = [
  {
    id: '1',
    title: 'Deploy Dashboard v1.2',
    requester: 'Codex',
    type: 'deployment',
    time: '2 hours ago',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Publish Article: AI Tools Guide',
    requester: 'Quill',
    type: 'content',
    time: '5 hours ago',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Schedule Tweet Storm',
    requester: 'Echo',
    type: 'social',
    time: '1 day ago',
    status: 'pending',
  },
]

export function ApprovalsView() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">Approvals</h2>
          <p className="text-sm text-muted-foreground">
            Review and approve pending actions
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Clock className="h-3 w-3" />
          {pendingApprovals.length} pending
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <Card key={approval.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <CheckSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{approval.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Requested by {approval.requester} • {approval.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button size="sm" className="gap-1.5">
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {pendingApprovals.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-base font-medium">No pending approvals</p>
                <p className="text-sm mt-1">All caught up!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
