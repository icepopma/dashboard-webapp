#!/usr/bin/env node

/**
 * Task: 023-创建新 Idea API
 * Description: 创建 POST /api/ideas 路由
 */

const fs = require('fs');
const path = require('path');

console.log('💬 创建新 Idea API...');

try {
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api', 'ideas');
  const routeFile = path.join(apiDir, 'route.ts');

  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  const routeContent = `import { NextRequest, NextResponse } from 'next/server'
import { createIdea } from '@/lib/supabase'

// POST /api/ideas - Create new idea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idea = await createIdea(body);
    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}
`;

  fs.writeFileSync(routeFile, routeContent);
  console.log('✅ 新 Idea API 已创建');
  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
