#!/usr/bin/env node

/**
 * Task: 022-进度条显示
 * Description: 在 Idea 详情页面添加进度条组件
 */

const fs = require('fs');
const path = require('path');

console.log('📊 创建进度条显示组件...');

try {
  const uiDir = path.join(process.cwd(), 'src', 'components');
  const progressBarFile = path.join(uiDir, 'progress-bar.tsx');

  if (!fs.existsSync(uiDir)) {
    fs.mkdirSync(uiDir, { recursive: true });
  }

  const progressBarContent = `'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Task } from '@/lib/supabase';

interface ProgressBarProps {
  progress: number;
  total: number;
  label?: string;
  tasksCompleted?: number;
}

export function ProgressBar({ progress, total, label = '进度', tasksCompleted = 0 }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <Card>
      <CardContent>
        <div className="space-y-3">
          {/* 标题和百分比 */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
            <span className="text-2xl font-bold text-blue-600">
              {percentage}%
            </span>
          </div>

          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 rounded-full h-2.5 transition-all"
              style={{ width: \`\${percentage}%\` }}
            />
          </div>

          {/* 统计信息 */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {progress} / {total}
            </span>
            <span>
              {total - progress}
            </span>
            {tasksCompleted > 0 && (
              <span className="ml-2">
                ({tasksCompleted} 个任务完成)
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProgressBar;
`;

  fs.writeFileSync(progressBarFile, progressBarContent);
  console.log('✅ 进度条显示组件已创建');
  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
