'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, Play, Activity } from 'lucide-react';

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
  { id: 'codex', name: 'Codex', emoji: '💻', status: 'online', currentTask: null, completedTasks: 0, successRate: 0, lastActive: new Date().toISOString() },
  { id: 'claude', name: 'Claude', emoji: '🧠', status: 'online', currentTask: null, completedTasks: 0, successRate: 0, lastActive: new Date().toISOString() },
  { id: 'quill', name: 'Quill', emoji: '✍️', status: 'online', currentTask: null, completedTasks: 0, successRate: 0, lastActive: new Date().toISOString() },
  { id: 'pixel', name: 'Pixel', emoji: '🎨', status: 'online', currentTask: null, completedTasks: 0, successRate: 0, lastActive: new Date().toISOString() },
  { id: 'scout', name: 'Scout', emoji: '🔍', status: 'online', currentTask: null, completedTasks: 0, successRate: 0, lastActive: new Date().toISOString() },
  { id: 'echo', name: 'Echo', emoji: '📢', status: 'online', currentTask: null, completedTasks: 0, successRate: 0, lastActive: new Date().toISOString() }
];

interface AgentMonitorTabProps {
  onRefresh?: () => void;
}

export function AgentMonitorTab({ onRefresh }: AgentMonitorTabProps) {
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
        return { color: 'bg-green-500', label: '在线' };
      case 'busy':
        return { color: 'bg-yellow-500', label: '工作中' };
      case 'offline':
        return { color: 'bg-gray-400', label: '离线' };
      default:
        return { color: 'bg-gray-400', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div className="text-sm text-muted-foreground">在线 Agent</div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.status === 'online').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-yellow-600" />
              <div className="text-sm text-muted-foreground">工作中</div>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {agents.filter(a => a.status === 'busy').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <div className="text-sm text-muted-foreground">已完成任务</div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {agents.reduce((sum, a) => sum + a.completedTasks, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <div className="text-sm text-muted-foreground">平均成功率</div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const statusConfig = getStatusConfig(agent.status);
          
          return (
            <Card key={agent.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{agent.emoji}</div>
                    <div>
                      <div className="font-semibold">{agent.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{agent.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusConfig.color}`}></div>
                    <span className="text-xs text-muted-foreground">{statusConfig.label}</span>
                  </div>
                </div>
                
                {agent.currentTask && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-2 mb-3">
                    <div className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">当前任务:</div>
                    <div className="text-xs text-blue-800 dark:text-blue-400">{agent.currentTask}</div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">已完成任务:</span>
                    <span className="font-semibold">{agent.completedTasks}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">成功率:</span>
                    <span className="font-semibold">{agent.successRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${agent.successRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
