#!/usr/bin/env node

/**
 * Task: 012-创建 IdeasSidebar 组件
 * Description: 使用 shadcn/ui 创建 Sidebar 组件，显示所有 ideas
 */

const fs = require('fs');
const path = require('path');

console.log('📋 创建 IdeasSidebar 组件...');

try {
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const sidebarDir = path.join(componentsDir, 'ideas');
  const sidebarFile = path.join(sidebarDir, 'Sidebar.tsx');

  // 创建目录
  if (!fs.existsSync(sidebarDir)) {
    fs.mkdirSync(sidebarDir, { recursive: true });
  }

  // 创建 IdeasSidebar 组件
  const sidebarContent = `
const React = require('react');
const { useState, useEffect } = require('react/hooks');
const { ScrollArea } = require('@/components/ui/scroll-area');
const { Badge } = require('@/components/ui/badge');

export default function IdeasSidebar() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    async function loadIdeas() {
      const response = await fetch('/api/ideas');
      const data = await response.json();
      setIdeas(data);
      setLoading(false);
    }

    loadIdeas();
  }, []);

  const filteredIdeas = ideas.filter(idea => {
    if (filter !== 'all' && idea.status !== filter) return false;
    if (searchQuery && !idea.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const colors = {
      idea: 'bg-blue-100 text-blue-800',
      planning: 'bg-yellow-100 text-yellow-800',
      developing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      idea: 'Idea',
      planning: '规划中',
      developing: '开发中',
      completed: '已完成',
      archived: '已归档',
    };
    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
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
      <Badge className={colors[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  return (
    <div className="w-80 h-full border-r border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3">Ideas</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="搜索 ideas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm'}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('idea')}
            className={filter === 'idea' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm'}
          >
            Idea
          </button>
          <button
            onClick={() => setFilter('planning')}
            className={filter === 'planning' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm'}
          >
            规划中
          </button>
          <button
            onClick={() => setFilter('developing')}
            className={filter === 'developing' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm'}
          >
            开发中
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm'}
          >
            已完成
          </button>
        </div>

      <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredIdeas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无 ideas
              </div>
            ) : (
              filteredIdeas.map(idea => (
                <div
                  key={idea.id}
                  onClick={() => setSelectedId(idea.id!)}
                  className={selectedId === idea.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 p-4 rounded-lg cursor-pointer transition-all'}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-base">{idea.name}</h3>
                    <div className="flex gap-2">
                      {getStatusBadge(idea.status)}
                      {getPriorityBadge(idea.priority)}
                    </div>
                  </div>
                  {idea.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {idea.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(idea.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      <button
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
        onClick={() => {
          window.location.href = '/';
        }}
      >
        + 创建新 Idea
      </button>
    </div>
  );
};

module.exports = IdeasSidebar;
`;

  fs.writeFileSync(sidebarFile, sidebarContent);
  console.log('✅ IdeasSidebar 组件已创建');
  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
