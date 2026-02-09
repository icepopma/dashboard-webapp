#!/usr/bin/env node

/**
 * Task: 021-编辑功能
 * Description: Tasks 列表的编辑功能实现
 */

const fs = require('fs');
const path = require('path');

console.log('✏️ 编辑功能实现中...');

try {
  const tasksFile = path.join(process.cwd(), 'src', 'components', 'tasks', 'TasksList.tsx');

  if (!fs.existsSync(tasksFile)) {
    console.log('⚠️  TasksList.tsx 不存在，请先执行 task-020-tasks-list');
    process.exit(1);
  }

  let content = fs.readFileSync(tasksFile, 'utf-8');

  // 更新任务卡片，添加更多操作按钮
  const taskCardRegex = /<CardContent>[\s\S]*?<div className="flex items-center justify-between mb-2">[\s\S]*?<\/CardContent>[\s\S]*?<div className="flex items-center justify-between text-xs text-gray-400 mt-3">[\s\S]*?<\/div>/;

  const addMoreActions = match => {
    const oldContent = match[0];
    const moreActions = `<div className="flex items-center gap-2">
          <button
            variant="ghost"
            size="sm"
            title="删除任务"
            className="text-gray-400 hover:text-red-600"
            onClick={() => {
              if (onEditTask) {
                onEditTask(taskId!, { deleted: true });
              }
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 5.144-5.144 0-.707 3.293 2.167-6.759z" />
          </button>
        </div>
      </div>`;
    content = content.replace(taskCardRegex, oldContent + moreActions);
  };

  fs.writeFileSync(tasksFile, content);
  console.log('✅ 编辑功能已添加');
  process.exit(0);
} catch (error) {
  console.error('❌ 添加失败:', error.message);
  process.exit(1);
}
