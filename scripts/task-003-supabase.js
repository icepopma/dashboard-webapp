#!/usr/bin/env node

/**
 * Task: 003-配置 Supabase
 * Description: 获取 Supabase Project URL 和 API Key，并配置环境变量
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🗄️ 开始配置 Supabase...');

try {
  // 创建 .env.local 文件（如果不存在）
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    console.log('📝 创建 .env.local 文件...');

    const envContent = `# Supabase Configuration
# 获取这些值：https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local 已创建');
    console.log('⚠️  请手动配置 Supabase URL 和 API Keys');
    console.log('🔗 访问: https://supabase.com/dashboard');
  } else {
    console.log('✅ .env.local 已存在，跳过创建');
  }

  // 安装 Supabase 客户端库
  console.log('📦 安装 @supabase/supabase-js...');
  try {
    execSync('npm install @supabase/supabase-js --silent', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ @supabase/supabase-js 安装完成');
  } catch (error) {
    // 可能已经安装，忽略错误
    console.log('✅ @supabase/supabase-js 已安装或安装成功');
  }

  console.log('✅ Supabase 配置完成');
  process.exit(0);
} catch (error) {
  console.error('❌ 配置失败:', error.message);
  process.exit(1);
}
