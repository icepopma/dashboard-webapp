#!/usr/bin/env node

/**
 * Task: 006-配置环境变量
 * Description: 配置环境变量和类型定义
 */

const fs = require('fs');
const path = require('path');

console.log('⚙️ 配置环境变量...');

try {
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  // 创建 .env.example 作为模板
  const envExampleContent = `# Supabase Configuration
# 获取这些值：https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration (for local development)
DATABASE_URL=postgresql://user:password@localhost:5432/dashboard

# Application Configuration
NODE_ENV=development
LOG_LEVEL=info
`;

  fs.writeFileSync(envExamplePath, envExampleContent);
  console.log('✅ .env.example 已创建');

  // 创建 TypeScript 类型定义
  const typesPath = path.join(process.cwd(), 'src', 'types', 'env.d.ts');
  const typesDir = path.join(process.cwd(), 'src', 'types');

  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  const envTypesContent = `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Type definitions for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL?: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
      SUPABASE_SERVICE_ROLE_KEY?: string
      NEXT_PUBLIC_APP_URL?: string
      DATABASE_URL?: string
      NODE_ENV?: 'development' | 'production' | 'test'
      LOG_LEVEL?: 'info' | 'debug' | 'error'
    }
  }
}

export {}
`;

  fs.writeFileSync(typesPath, envTypesContent);
  console.log('✅ TypeScript 环境变量类型定义已创建');

  // 检查 .env.local 是否存在
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local 已存在');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    console.log('📋 当前配置:');
    console.log(envContent.split('\n').slice(0, 5).join('\n'));
  } else {
    console.log('⚠️  .env.local 不存在');
    console.log('📝 请复制 .env.example 为 .env.local 并配置:');
    console.log('   cp .env.example .env.local');
    console.log('   然后编辑 .env.local 填入实际的值');
  }

  process.exit(0);
} catch (error) {
  console.error('❌ 配置失败:', error.message);
  process.exit(1);
}
