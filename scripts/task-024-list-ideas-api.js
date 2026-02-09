#!/usr/bin/env node

/**
 * Task: 024-创建 Ideas 列表 API
 * Description: 创建 GET /api/ideas API（读取所有 ideas）
 */

const fs = require('fs');
const path = require('path');

console.log('📋 创建 Ideas 列表 API...');

try {
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  const routeFile = path.join(apiDir, 'ideas', 'route.ts');

  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  const routeContent = `import { NextRequest, NextResponse } from 'next/server'
import { getIdeas } from '@/lib/supabase'

// GET /api/ideas - List all ideas
export async function GET(request: NextRequest) {
  try {
    const ideas = await getIdeas();
    return NextResponse.json(ideas, { status: 200 });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}
`;

  fs.writeFileSync(routeFile, routeContent);
  console.log('✅ Ideas 列表 API 已创建');
  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
