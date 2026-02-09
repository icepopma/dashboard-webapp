#!/usr/bin/env node

/**
 * Task: 014-添加筛选功能
 * Description: 在 IdeasSidebar 中添加高级筛选功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 添加筛选功能...');

try {
  const sidebarFile = path.join(process.cwd(), 'src', 'components', 'ideas', 'Sidebar.tsx');

  // 检查文件是否存在
  if (!fs.existsSync(sidebarFile)) {
    console.log('⚠️  Sidebar.tsx 不存在，请先执行 task-012');
    process.exit(1);
  }

  let content = fs.readFileSync(sidebarFile, 'utf-8');

  // 添加排序功能状态
  if (!content.includes('const [sortBy')) {
    const useStateLine = '  const [sortBy, setSortBy] = useState<\'newest\' | \'oldest\' | \'name\'>(\'newest\');';
    const filterStartIndex = content.indexOf('const [filter, setFilter]');
    
    // 在 filter 状态声明后添加 sortBy
    content = content.replace(
      'const [filter, setFilter]',
      `const [filter, setFilter]\n${useStateLine}`
    );

    // 在筛选按钮组后添加排序按钮
    const sortButtons = `
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('newest')}
            className={\`px-3 py-1 rounded-md text-sm \${sortBy === 'newest' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}\`}
          >
            最新
          </button>
          <button
            onClick={() => setSortBy('oldest')}
            className={\`px-3 py-1 rounded-md text-sm \${sortBy === 'oldest' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}\`}
          >
            最早
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={\`px-3 py-1 rounded-md text-sm \${sortBy === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}\`}
          >
            名称
          </button>
        </div>
    `;

    // 找到筛选按钮组的位置并插入排序按钮
    const buttonsGroupRegex = /<div className="flex gap-2 mb-4">[\s\S]*?<\/div>/;
    const match = content.match(buttonsGroupRegex);
    if (match) {
      const oldContent = match[0];
      const newContent = oldContent + sortButtons;
      content = content.replace(oldContent, newContent);
    }

    // 添加排序逻辑到 filteredIdeas
    const filteredIdeasRegex = /const filteredIdeas = ideas\.filter\([^)]*\)([^;]*)/s;
    const filteredIdeasMatch = content.match(filteredIdeasRegex);
    if (filteredIdeasMatch) {
      const oldFilteredIdeas = filteredIdeasMatch[0];
      const sortedIdeasLogic = `
      const sortedIdeas = filteredIdeas.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
`;
      const newSortedIdeas = oldFilteredIdeas.replace('return true;', sortedIdeasLogic + '\n    return true;');
      content = content.replace(oldFilteredIdeas, newSortedIdeas);
    }

    fs.writeFileSync(sidebarFile, content);
    console.log('✅ 筛选功能已添加：');
    console.log('   - 排序功能（最新/最早/名称）');
    console.log('   - 排序逻辑');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ 添加失败:', error.message);
  process.exit(1);
}
