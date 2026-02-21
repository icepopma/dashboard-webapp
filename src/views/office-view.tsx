'use client'

import { Button } from '@/components/ui/button'
import { MonitorPlay, RefreshCw, Wifi, WifiOff, Coffee } from 'lucide-react'

// Agent 数据
const agents = [
  {
    id: '1',
    name: 'Pop (泡泡)',
    role: '主 AI 助手',
    status: 'working',
    task: '优化 Dashboard UI',
    time: '2h 15m',
    color: '#3b82f6',
  },
  {
    id: '2',
    name: 'Developer Agent',
    role: '代码开发',
    status: 'working',
    task: '构建 Kanban Board',
    time: '1h 30m',
    color: '#10b981',
  },
  {
    id: '3',
    name: 'Writer Agent',
    role: '内容创作',
    status: 'idle',
    task: null,
    time: null,
    color: '#8b5cf6',
  },
  {
    id: '4',
    name: 'Designer Agent',
    role: 'UI 设计',
    status: 'offline',
    task: null,
    time: null,
    color: '#f59e0b',
  },
]

export function OfficeView() {
  const workingCount = agents.filter(a => a.status === 'working').length
  const idleCount = agents.filter(a => a.status === 'idle').length
  const offlineCount = agents.filter(a => a.status === 'offline').length
  
  return (
    <div className="h-full flex flex-col" style={{
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      color: 'white'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6" style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="flex items-center gap-4">
          <MonitorPlay style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} />
          <div>
            <h2 className="text-2xl font-bold m-0">办公室</h2>
            <p className="text-sm text-slate-400 m-0">PixelHQ 风格 - 实时监控</p>
          </div>
        </div>
        
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <Wifi style={{ width: '1.25rem', height: '1.25rem', color: '#22c55e' }} />
            <span className="text-2xl font-bold">{workingCount}</span>
            <span className="text-xs text-slate-400">工作中</span>
          </div>
          <div className="flex flex-col items-center">
            <Coffee style={{ width: '1.25rem', height: '1.25rem', color: '#eab308' }} />
            <span className="text-2xl font-bold">{idleCount}</span>
            <span className="text-xs text-slate-400">休息中</span>
          </div>
          <div className="flex flex-col items-center">
            <WifiOff style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
            <span className="text-2xl font-bold">{offlineCount}</span>
            <span className="text-xs text-slate-400">离线</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          style={{ background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
        >
          <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          刷新
        </Button>
      </div>
      
      {/* 办公室空间 */}
      <div className="flex-1 p-8 relative overflow-hidden">
        {/* 墙面装饰 */}
        <div className="flex justify-end gap-8 mb-8" style={{ paddingRight: '2rem' }}>
          <div style={{
            width: '100px',
            height: '60px',
            background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)',
            border: '4px solid #475569',
            borderRadius: '4px',
            opacity: 0.6
          }} />
          <div style={{
            width: '60px',
            height: '60px',
            background: '#fbbf24',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'white',
              borderRadius: '50%'
            }} />
          </div>
        </div>
        
        {/* 地板 */}
        <div className="flex-1 rounded-lg p-8" style={{
          background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.3) 1px, transparent 1px), linear-gradient(rgba(71, 85, 105, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}>
          {/* 工作区网格 */}
          <div className="grid grid-cols-2 gap-16 h-full">
            {agents.map(agent => (
              <div key={agent.id} className="relative flex flex-col items-center">
                {/* 桌子 */}
                <div style={{
                  width: '200px',
                  height: '80px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '20px',
                    background: '#8b5cf6',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '20px'
                  }}>
                    {/* 电脑 */}
                    <div style={{
                      width: '80px',
                      height: '50px',
                      background: '#1e293b',
                      border: `2px solid ${agent.status === 'working' ? '#3b82f6' : '#374151'}`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '70px',
                        height: '40px',
                        background: agent.status === 'working' ? '#1e40af' : '#0f172a',
                        borderRadius: '2px'
                      }} />
                    </div>
                  </div>
                </div>
                
                {/* 像素小人 */}
                <div style={{
                  width: '40px',
                  height: '60px',
                  marginTop: '1rem',
                  animation: agent.status === 'working' ? 'bob 0.5s infinite' : 'none'
                }}>
                  {/* 头 */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: agent.status === 'offline' ? '#9ca3af' : '#fbbf24',
                    borderRadius: '4px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    {agent.status !== 'offline' && (
                      <>
                        <div style={{
                          width: '4px',
                          height: agent.status === 'idle' ? '2px' : '4px',
                          background: '#000',
                          borderRadius: '1px'
                        }} />
                        <div style={{
                          width: '4px',
                          height: agent.status === 'idle' ? '2px' : '4px',
                          background: '#000',
                          borderRadius: '1px'
                        }} />
                      </>
                    )}
                  </div>
                  
                  {/* 身体 */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: agent.status === 'offline' ? '#6b7280' : agent.color,
                    margin: '2px auto',
                    borderRadius: '2px'
                  }} />
                  
                  {/* 手臂 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '12px',
                      background: agent.status === 'offline' ? '#6b7280' : agent.color,
                      borderRadius: '2px'
                    }} />
                    {agent.status === 'working' && (
                      <div style={{
                        width: '8px',
                        height: '12px',
                        background: agent.color,
                        borderRadius: '2px'
                      }} />
                    )}
                  </div>
                  
                  {/* 腿 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '4px',
                    marginTop: '2px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '10px',
                      background: '#374151',
                      borderRadius: '2px'
                    }} />
                    <div style={{
                      width: '6px',
                      height: '10px',
                      background: '#374151',
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
                
                {/* 名字标签 */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: agent.status === 'offline' ? '#6b7280' : agent.color
                }}>
                  {agent.name.split(' ')[0]}
                </div>
                
                {/* 状态指示器 */}
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  right: 0,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: agent.status === 'working' ? '#22c55e' : agent.status === 'idle' ? '#eab308' : '#6b7280'
                }} />
              </div>
            ))}
          </div>
        </div>
        
        {/* 详情面板 */}
        <div className="absolute bottom-8 left-8 right-8 grid grid-cols-4 gap-4">
          {agents.map(agent => (
            <div 
              key={agent.id} 
              className="rounded-lg p-4"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: `1px solid ${agent.status === 'working' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: agent.color }}
                >
                  {agent.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{agent.name}</div>
                  <div className="text-xs text-slate-400">{agent.role}</div>
                </div>
              </div>
              
              {agent.status === 'working' && agent.task && (
                <div className="text-sm text-green-400">
                  <span className="text-slate-400">正在：</span>
                  <span>{agent.task}</span>
                  <span className="block mt-1 text-xs text-slate-500">{agent.time}</span>
                </div>
              )}
              
              {agent.status === 'idle' && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Coffee style={{ width: '1rem', height: '1rem' }} />
                  <span>休息中</span>
                </div>
              )}
              
              {agent.status === 'offline' && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <WifiOff style={{ width: '1rem', height: '1rem' }} />
                  <span>离线</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 动画样式 */}
      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  )
}
