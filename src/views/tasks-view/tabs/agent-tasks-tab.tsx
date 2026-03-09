'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, Play } from 'lucide-react';

interface Task {
  id: string;
  type: string;
  prompt: string;
  agent: string | null;
  status: string;
  task_status: string;
  priority: number;
  claimed_by: string | null;
  claimed_at: string | null;
  plan: string | null;
  plan_submitted_at: string | null;
  plan_approved_by: string | null;
  plan_feedback: string | null;
  completed_at: string | null;
  deliverables: string[];
  quality_gates_passed: string[];
  quality_gates_failed: string[];
  created_at: string;
}

interface AgentTasksTabProps {
  onRefresh?: () => void;
}

export function AgentTasksTab({ onRefresh }: AgentTasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/agent/pending-plans');
      const data = await response.json();
      if (data.success) {
        setTasks(data.plans);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const approvePlan = async (taskId: string) => {
    try {
      const response = await fetch('/api/agent/approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          approvedBy: 'matt',
          feedback: '计划批准，开始执行！'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ 计划已批准！');
        fetchTasks();
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error approving plan:', error);
    }
  };

  const completeTask = async (taskId: string, agentId: string) => {
    try {
      const response = await fetch('/api/agent/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          agentId,
          deliverables: ['任务已完成']
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ 任务已完成！');
        fetchTasks();
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: '待处理' };
      case 'plan_pending':
        return { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: '待审批' };
      case 'plan_approved':
        return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', label: '已批准' };
      case 'in_progress':
        return { icon: Play, color: 'text-purple-400', bg: 'bg-purple-500/10', label: '执行中' };
      case 'completed':
        return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', label: '已完成' };
      default:
        return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10', label: status };
    }
  };

  const getAgentColor = (agent: string | null) => {
    const colors: Record<string, string> = {
      codex: 'bg-blue-500',
      claude: 'bg-purple-500',
      quill: 'bg-pink-500',
      pixel: 'bg-indigo-500',
      scout: 'bg-teal-500',
      echo: 'bg-orange-500'
    };
    return colors[agent || ''] || 'bg-gray-400';
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') return task.task_status === 'plan_pending';
    if (selectedTab === 'in_progress') return task.task_status === 'in_progress';
    if (selectedTab === 'completed') return task.task_status === 'completed';
    return true;
  });

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
            <div className="text-sm text-muted-foreground">总任务</div>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">待审批</div>
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.task_status === 'plan_pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">执行中</div>
            <div className="text-2xl font-bold text-purple-600">
              {tasks.filter(t => t.task_status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">已完成</div>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.task_status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'in_progress', 'completed'].map((tab) => (
          <Button
            key={tab}
            variant={selectedTab === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab(tab as any)}
          >
            {tab === 'all' ? '全部' : 
             tab === 'pending' ? '待审批' :
             tab === 'in_progress' ? '执行中' : '已完成'}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              暂无任务
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const statusConfig = getStatusConfig(task.task_status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusConfig.bg}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {task.claimed_by && (
                          <Badge className={`${getAgentColor(task.claimed_by)} text-white`}>
                            {task.claimed_by}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          优先级: {task.priority}
                        </Badge>
                      </div>
                      
                      <h3 className="text-sm font-medium mb-2">{task.prompt}</h3>
                      
                      {task.plan && (
                        <div className="bg-muted/30 rounded p-2 mb-2">
                          <div className="text-xs font-medium mb-1">计划:</div>
                          <div className="text-xs text-muted-foreground">{task.plan}</div>
                        </div>
                      )}
                      
                      {task.deliverables && task.deliverables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {task.deliverables.map((item, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>创建: {new Date(task.created_at).toLocaleString()}</span>
                        {task.claimed_at && (
                          <span>认领: {new Date(task.claimed_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {task.task_status === 'plan_pending' && (
                        <Button
                          size="sm"
                          onClick={() => approvePlan(task.id)}
                        >
                          批准计划
                        </Button>
                      )}
                      {task.task_status === 'plan_approved' && task.claimed_by && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => completeTask(task.id, task.claimed_by!)}
                        >
                          标记完成
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
