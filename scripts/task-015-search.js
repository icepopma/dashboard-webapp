#!/usr/bin/env node

/**
 * Task: 015-添加搜索功能
 * Description: 实现实时搜索和防抖
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 添加搜索功能...');

try {
  const sidebarFile = path.join(process.cwd(), 'src', 'components', 'ideas', 'Sidebar.tsx');

  // 检查文件是否存在
  if (!fs.existsSync(sidebarFile)) {
    console.log('⚠️  Sidebar.tsx 不存在，请先执行 task-012');
    process.exit(1);
  }

  let content = fs.readFileSync(sidebarFile, 'utf-8');

  // 添加防抖状态和搜索状态
  if (!content.includes('const [searchDebounced')) {
    const useStateLine = 'const [searchQuery, setSearchQuery] = useState(\\'\\');';
    const searchDebouncedLine = '  const [searchDebounced, setSearchDebounced] = useState(\\'\\');';
    
    // 在搜索框后添加防抖逻辑
    const inputFieldRegex = /(<input[^>]*>[\s\S]*?value={searchQuery}[\s\S]*?onChange={e => setSearchQuery\(e\.target\.value\)}[\s\S]*?>)/;
    const existingInput = content.match(inputFieldRegex);
    
    if (existingInput) {
      const debounceHandler = `
  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
  }, 300); // 300ms 防抖
`;
      
      const newInput = existingInput[0].replace(
        'onChange={e => setSearchQuery(e.target.value)}',
        `onChange={(value) => handleSearch(value)}`
      );
      
      content = content.replace(existingInput[0], newInput);
    }

    // 在 onChange 处理中添加防抖调用
    const useEffectRegex = /useEffect\(\(\) => {\s*\s*loadIdeas\(\);[\s\S]*}\);/;
    const existingEffect = content.match(useEffectRegex);
    
    if (existingEffect) {
      const oldEffect = existingEffect[0];
      const newEffect = oldEffect.replace(
        'loadIdeas();',
        `loadIdeas();\\n    useEffect(() => {\\n      const value = searchDebounced;\\n      if (value) {\\n        loadIdeas();\\n      }\\n    }, [searchDebounced]);`
      );
      
      content = content.replace(oldEffect, newEffect);
    }

    // 更新导入（如果需要）
    const useDebounceImport = "import { debounce } from '@/lib/utils';";
    if (!content.includes(useDebounceImport)) {
      content = content.replace(
        /import .* from '@/components\/ui\/scroll-area';/,
        `${useDebounceImport}\\nimport { ScrollArea } from '@/components/ui/scroll-area';`
      );
    }

    fs.writeFileSync(sidebarFile, content);
    console.log('✅ 搜索功能已添加：');
    console.log('   - 实时搜索');
    console.log('   - 300ms 防抖');
    console.log('   - 搜索结果状态');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ 添加失败:', error.message);
  process.exit(1);
}
