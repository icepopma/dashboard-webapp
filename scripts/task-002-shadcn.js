#!/usr/bin/env node

/**
 * Task: 002-配置 shadcn/ui
 * Description: 在 Next.js 项目中安装和配置 shadcn/ui 组件库
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 开始配置 shadcn/ui...');

try {
  // 检查是否已经配置
  const componentsDir = path.join(process.cwd(), 'components', 'ui');
  const utilsDir = path.join(process.cwd(), 'lib', 'utils.ts');

  if (fs.existsSync(componentsDir) && fs.existsSync(utilsDir)) {
    console.log('✅ shadcn/ui 已经配置');
    process.exit(0);
  }

  // 安装 shadcn/ui
  console.log('📦 安装 shadcn/ui...');
  execSync('npx shadcn-ui@latest init -y', {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('✅ shadcn/ui 配置完成');
  process.exit(0);
} catch (error) {
  console.error('❌ 配置失败:', error.message);
  process.exit(1);
}
