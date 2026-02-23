'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, Wifi, WifiOff, Coffee, Users, MessageSquare, Droplet } from 'lucide-react'

// Agent 数据
const agents = [
  {
    id: '1',
    name: 'Pop',
    role: 'Chief of Staff',
    status: 'working',
    task: '优化 Dashboard UI',
    time: '2h 15m',
    color: '#3b82f6',
  },
  {
    id: '2',
    name: 'Codex',
    role: 'Lead Engineer',
    status: 'working',
    task: '构建 Kanban Board',
    time: '1h 30m',
    color: '#f97316',
  },
  {
    id: '3',
    name: 'Quill',
    role: 'Content Writer',
    status: 'idle',
    task: null,
    time: null,
    color: '#8b5cf6',
  },
  {
    id: '4',
    name: 'Echo',
    role: 'Social Media',
    status: 'idle',
    task: null,
    time: null,
    color: '#ec4899',
  },
]

type TeamStatus = 'working' | 'chatting' | 'gathering' | 'idle'

export function OfficeView() {
  const [teamStatus, setTeamStatus] = useState<TeamStatus>('working')

  const workingCount = agents.filter(a => a.status === 'working').length
  const idleCount = agents.filter(a => a.status === 'idle').length

  const statusButtons = [
    { id: 'working', label: 'Working', icon: Wifi, color: 'text-green-500', count: workingCount },
    { id: 'chatting', label: 'Chatting', icon: MessageSquare, color: 'text-blue-500', count: 0 },
    { id: 'gathering', label: 'Gathering', icon: Users, color: 'text-yellow-500', count: 0 },
    { id: 'idle', label: 'Idle', icon: Coffee, color: 'text-gray-500', count: idleCount },
  ]

  const controlButtons = [
    { id: 'all-working', label: 'All Working', icon: Wifi },
    { id: 'gather', label: 'Gather', icon: Users },
    { id: 'meeting', label: 'Run Meeting', icon: MessageSquare },
    { id: 'watercooler', label: 'Watercooler', icon: Droplet },
  ]

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-black/30 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <span className="text-xl">🏢</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Office</h2>
            <p className="text-sm text-slate-400">AI team headquarters — live view</p>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex gap-6">
          {statusButtons.map((btn) => {
            const Icon = btn.icon
            return (
              <button
                key={btn.id}
                onClick={() => setTeamStatus(btn.id as TeamStatus)}
                className={`flex flex-col items-center transition-opacity ${
                  teamStatus === btn.id ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                }`}
              >
                <Icon className={`w-5 h-5 ${btn.color}`} />
                <span className="text-2xl font-bold">{btn.count}</span>
                <span className="text-xs text-slate-400">{btn.label}</span>
              </button>
            )
          })}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {controlButtons.map((btn) => {
            const Icon = btn.icon
            return (
              <Button
                key={btn.id}
                variant="outline"
                size="sm"
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Icon className="h-4 w-4" />
                {btn.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Office Space */}
      <div className="flex-1 p-8 relative overflow-hidden flex gap-6">
        {/* Main Office Area */}
        <div className="flex-1 rounded-xl p-6 overflow-hidden" 
          style={{
            background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.2) 1px, transparent 1px), linear-gradient(rgba(71, 85, 105, 0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        >
          {/* Agent Workstations */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 h-full">
            {agents.map((agent) => (
              <div key={agent.id} className="relative flex flex-col items-center">
                {/* Task Bubble */}
                {agent.status === 'working' && agent.task && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/20">
                    {agent.task}
                  </div>
                )}

                {/* Desk */}
                <div className="w-32 h-16 relative mb-2">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-slate-700 rounded-t-lg flex justify-center pt-4">
                    {/* Monitor */}
                    <div className="w-16 h-10 bg-slate-900 border-2 border-slate-600 rounded flex items-center justify-center">
                      <div className={`w-14 h-8 rounded ${agent.status === 'working' ? 'bg-blue-900' : 'bg-slate-800'}`} />
                    </div>
                  </div>
                </div>

                {/* Agent Avatar */}
                <div className="flex flex-col items-center mt-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.name[0]}
                  </div>
                  <span className="text-sm font-medium mt-2">{agent.name}</span>
                  <span className="text-xs text-slate-400">{agent.role}</span>
                </div>

                {/* Status Indicator */}
                <div className={`absolute top-0 right-0 w-3 h-3 rounded-full ${
                  agent.status === 'working' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Panel */}
        <Card className="w-72 bg-black/50 border-white/10 flex-shrink-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Live Activity</h3>
              <span className="text-xs text-slate-400">Last hour</span>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-slate-400 text-center py-8">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-xs mt-1">Check back soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Cards */}
      <div className="px-6 pb-6 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="bg-black/50 border-white/10">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{agent.name}</div>
                    <div className="text-xs text-slate-400">{agent.role}</div>
                  </div>
                </div>
                {agent.status === 'working' && agent.task && (
                  <div className="mt-2 text-xs">
                    <span className="text-slate-400">Working on: </span>
                    <span className="text-green-400">{agent.task}</span>
                    {agent.time && (
                      <span className="block text-slate-500 mt-0.5">{agent.time}</span>
                    )}
                  </div>
                )}
                {agent.status === 'idle' && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                    <Coffee className="w-3 h-3" />
                    <span>Idle</span>
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
