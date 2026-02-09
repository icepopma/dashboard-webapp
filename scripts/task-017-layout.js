#!/usr/bin/env node

/**
 * Task: 017-创建 IdeaDetailLayout
 * Description: 创建 Idea 详情页面的布局组件
 */

const fs = require('fs');
const path = require('path');

console.log('📄 创建 IdeaDetailLayout 组件...');

try {
  const layoutDir = path.join(process.cwd(), 'src', 'app');
  const layoutFile = path.join(layoutDir, 'idea', '[id]', 'layout.tsx');

  const layoutContent = `'use client';

import { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import CreateIdeaDialog from '@/components/ideas/CreateIdeaDialog';

interface IdeaDetailLayoutProps {
  children: ReactNode;
}

export default function IdeaDetailLayout({ children }: IdeaDetailLayoutProps) {
  const params = useParams();
  const ideaId = params.id as string;

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* 返回按钮 */}
            <button
              onClick={() => window.history.back()}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7 7 5 5 10a1.054 0 1.054 0 1.417 0 1.468 0 2.65 0 2.65 0 4.292 12a1.054 0 1.054 0 1.417 0 1.468 0 2.65 0 4.292 16a1.054 0 1.054 0 1.417 0 1.468 0 2.65 0 4.292 12a1.054 0 1.054 0 1.417 0 1.468 0 2.65 0 4.292 16a1.054 0 1.054 0 1.417 0 1.468 0 2.65 0 4.292 16a1.054 0 1.054 0 1.417 0 1.468 0 2.65 0 4.292z" />
              </svg>
              返回
            </button>

            {/* 标题 */}
            <h1 className="text-xl font-bold text-gray-900">
              Idea 详情
            </h1>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <CreateIdeaDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  if (open) {
                    // 通过事件触发打开
                  }
                }}
                trigger={
                  <button className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors">
                    编辑
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(layoutFile, layoutContent);
  console.log('✅ IdeaDetailLayout 组件已创建');
  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
