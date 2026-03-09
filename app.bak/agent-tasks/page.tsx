'use client';

import { useState, useEffect } from 'react';

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

export default function AgentTasksPage() {
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
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'plan_pending':
        return 'bg-blue-100 text-blue-800';
      case 'plan_approved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-200 text-green-900';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">🤖 Agent 任务管理</h1>
          <p className="text-gray-600 mt-2">管理和监控 Agent 任务执行</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">总任务</div>
            <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">待审批</div>
            <div className="text-3xl font-bold text-blue-600">
              {tasks.filter(t => t.task_status === 'plan_pending').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">执行中</div>
            <div className="text-3xl font-bold text-purple-600">
              {tasks.filter(t => t.task_status === 'in_progress').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">已完成</div>
            <div className="text-3xl font-bold text-green-600">
              {tasks.filter(t => t.task_status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {['all', 'pending', 'in_progress', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'all' ? '全部' : 
                 tab === 'pending' ? '待审批' :
                 tab === 'in_progress' ? '执行中' : '已完成'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              暂无任务
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.task_status)}`}>
                        {task.task_status}
                      </span>
                      {task.claimed_by && (
                        <span className={`px-3 py-1 rounded-full text-xs text-white ${getAgentColor(task.claimed_by)}`}>
                          {task.claimed_by}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        优先级: {task.priority}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {task.prompt}
                    </h3>
                    
                    {task.plan && (
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">计划:</div>
                        <div className="text-sm text-gray-600">{task.plan}</div>
                      </div>
                    )}
                    
                    {task.deliverables && task.deliverables.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">交付物:</div>
                        <div className="flex flex-wrap gap-2">
                          {task.deliverables.map((item, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>创建: {new Date(task.created_at).toLocaleString()}</span>
                      {task.claimed_at && (
                        <span>认领: {new Date(task.claimed_at).toLocaleString()}</span>
                      )}
                      {task.completed_at && (
                        <span>完成: {new Date(task.completed_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {task.task_status === 'plan_pending' && (
                      <button
                        onClick={() => approvePlan(task.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        批准计划
                      </button>
                    )}
                    {task.task_status === 'plan_approved' && task.claimed_by && (
                      <button
                        onClick={() => completeTask(task.id, task.claimed_by!)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        标记完成
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
