'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  emoji: string;
  status: 'online' | 'busy' | 'offline';
  currentTask: string | null;
  completedTasks: number;
  successRate: number;
  lastActive: string;
}

const AGENTS: Agent[] = [
  {
    id: 'codex',
    name: 'Codex',
    emoji: '💻',
    status: 'online',
    currentTask: null,
    completedTasks: 0,
    successRate: 0,
    lastActive: new Date().toISOString()
  },
  {
    id: 'claude',
    name: 'Claude',
    emoji: '🧠',
    status: 'online',
    currentTask: null,
    completedTasks: 0,
    successRate: 0,
    lastActive: new Date().toISOString()
  },
  {
    id: 'quill',
    name: 'Quill',
    emoji: '✍️',
    status: 'online',
    currentTask: null,
    completedTasks: 0,
    successRate: 0,
    lastActive: new Date().toISOString()
  },
  {
    id: 'pixel',
    name: 'Pixel',
    emoji: '🎨',
    status: 'online',
    currentTask: null,
    completedTasks: 0,
    successRate: 0,
    lastActive: new Date().toISOString()
  },
  {
    id: 'scout',
    name: 'Scout',
    emoji: '🔍',
    status: 'online',
    currentTask: null,
    completedTasks: 0,
    successRate: 0,
    lastActive: new Date().toISOString()
  },
  {
    id: 'echo',
    name: 'Echo',
    emoji: '📢',
    status: 'online',
    currentTask: null,
    completedTasks: 0,
    successRate: 0,
    lastActive: new Date().toISOString()
  }
];

export default function AgentMonitorPage() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentStats();
  }, []);

  const fetchAgentStats = async () => {
    try {
      const response = await fetch('/api/agent/pending-plans');
      const data = await response.json();
      
      if (data.success) {
        const tasks = data.plans;
        
        // 更新 Agent 统计
        const updatedAgents = AGENTS.map(agent => {
          const agentTasks = tasks.filter((t: any) => t.claimed_by === agent.id);
          const completedTasks = tasks.filter((t: any) => 
            t.claimed_by === agent.id && t.task_status === 'completed'
          );
          const currentTask = tasks.find((t: any) => 
            t.claimed_by === agent.id && t.task_status === 'in_progress'
          );
          
          return {
            ...agent,
            currentTask: currentTask ? currentTask.prompt : null,
            completedTasks: completedTasks.length,
            successRate: agentTasks.length > 0 
              ? Math.round((completedTasks.length / agentTasks.length) * 100)
              : 0,
            status: currentTask ? 'busy' : 'online'
          };
        });
        
        setAgents(updatedAgents);
      }
    } catch (error) {
      console.error('Error fetching agent stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🤖 Agent 状态监控</h1>
          <p className="text-gray-600 mt-2">实时监控 Agent 运行状态</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">在线 Agent</div>
            <div className="text-3xl font-bold text-green-600">
              {agents.filter(a => a.status === 'online').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">工作中</div>
            <div className="text-3xl font-bold text-yellow-600">
              {agents.filter(a => a.status === 'busy').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">已完成任务</div>
            <div className="text-3xl font-bold text-blue-600">
              {agents.reduce((sum, a) => sum + a.completedTasks, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">平均成功率</div>
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length)}%
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">{agent.emoji}</div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{agent.id}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                  <span className="text-sm text-gray-600 capitalize">{agent.status}</span>
                </div>
              </div>
              
              {agent.currentTask && (
                <div className="bg-blue-50 rounded p-3 mb-4">
                  <div className="text-sm font-medium text-blue-900 mb-1">当前任务:</div>
                  <div className="text-sm text-blue-800">{agent.currentTask}</div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">已完成任务:</span>
                  <span className="font-semibold">{agent.completedTasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">成功率:</span>
                  <span className="font-semibold">{agent.successRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${agent.successRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
