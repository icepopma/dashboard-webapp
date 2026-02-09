#!/usr/bin/env node

/**
 * Task: 020-Tasks 列表组件
 * Description: 创建 Tasks 列表组件（显示所有 tasks）
 */

const fs = require('fs');
const path = require('path');

console.log('📋 创建 Tasks 列表组件...');

try {
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const tasksDir = path.join(componentsDir, 'tasks');
  const tasksFile = path.join(tasksDir, 'TasksList.tsx');

  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
  }

  const tasksContent = `'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task } from '@/lib/supabase';

interface TasksListProps {
  ideaId: string;
  onEditTask?: (taskId: string, updates: Partial<Task>) => void;
}

export function TasksList({ ideaId, onEditTask }: TasksListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch(\`/api/tasks?idea_id=\${ideaId}\`);
        const data = await response.json();
        setTasks(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setLoading(false);
      }
    }

    loadTasks();
  }, [ideaId]);

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return a.local_path.localeCompare(b.local_path);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      todo: 'border-red-200 bg-red-50',
      in_progress: 'border-blue-200 bg-blue-50',
      completed: 'border-green-200 bg-green-50',
      failed: 'border-gray-300 bg-gray-100',
    };
    return colors[status as keyof typeof colors] || 'border-gray-300 bg-gray-100';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-orange-100 text-orange-800',
      low: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      high: '高',
      medium: '中',
      low: '低',
    };
    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="w-full h-full border-r border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>

        <div className="flex gap-2 mb-4">
          {/* 筛选按钮组 */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={\`px-3 py-1.5 rounded-md text-sm font-medium \${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}\`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('todo')}
              className={\`px-3 py-1.5 rounded-md text-sm font-medium \${filter === 'todo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}\`}
            >
              待做
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={\`px-3 py-1.5 rounded-md text-sm font-medium \${filter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}\`}
            >
              进行中
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={\`px-3 py-1.5 rounded-md text-sm font-medium \${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}\`}
            >
              已完成
            </button>
          </div>

          {/* 排序按钮组 */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('newest')}
              className={\`px-3 py-1.5 rounded-md text-sm font-medium \${sortBy === 'newest' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}\`}
            >
              最新
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={\`px-3 py-1.5 rounded-md text-sm font-medium \${sortBy === 'oldest' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}\`}
            >
              最早
            </button>
          </div>
        </div>
      </div>

      {/* Tasks 列表 */}
      <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300" />
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500">暂无 Tasks</p>
              </div>
            ) : (
              sortedTasks.map(task => (
                <Card
                  key={task.id}
                  className={\`cursor-pointer transition-all hover:shadow-lg \${getStatusColor(task.status)}\`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {task.local_path}
                      </CardTitle>
                      <div className="flex gap-2">
                        {getStatusColor(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.local_path}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(task.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (onEditTask) {
                              onEditTask(task.id!, { status: 'completed' });
                            }
                          }}
                        >
                          完成
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (task.status === 'completed') {
                              if (onEditTask) {
                                onEditTask(task.id!, { status: 'todo' });
                              }
                            }
                          }}
                        >
                          重开
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (task.status === 'todo' || task.status === 'completed') {
                              if (onEditTask) {
                                onEditTask(task.id!, { status: 'in_progress' });
                              }
                            }
                          }}
                        >
                          开始
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      {/* 创建新 Task 按钮 */}
      <button
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
        onClick={() => {
          window.location.href = '/tasks/new';
        }}
      >
        + 创建新 Task
      </button>
    </div>
  );
}

export default TasksList;
`;

  fs.writeFileSync(tasksFile, tasksContent);
  console.log('✅ Tasks 列表组件已创建');
  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
