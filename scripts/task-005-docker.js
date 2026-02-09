#!/usr/bin/env node

/**
 * Task: 005-创建 Docker Compose
 * Description: 创建 Docker Compose 文件配置 Next.js + Supabase 开发环境
 */

const fs = require('fs');
const path = require('path');

console.log('🐳 创建 Docker Compose 配置...');

try {
  const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
  const dockerfilePath = path.join(process.cwd(), 'Dockerfile');

  // 创建 Dockerfile
  const dockerfileContent = `# Multi-stage build for Next.js Dashboard
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
`;

  fs.writeFileSync(dockerfilePath, dockerfileContent);
  console.log('✅ Dockerfile 已创建');

  // 创建 docker-compose.yml
  const dockerComposeContent = `version: '3.8'

services:
  dashboard:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=\${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - ./node_modules:/app/node_modules
      - ./.next:/app/.next
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  node_modules:
`;

  fs.writeFileSync(dockerComposePath, dockerComposeContent);
  console.log('✅ docker-compose.yml 已创建');
  console.log('🚀 使用方法:');
  console.log('   docker-compose up -d');
  console.log('');
  console.log('⚠️  记得配置环境变量 (.env.local):');
  console.log('   - SUPABASE_URL');
  console.log('   - SUPABASE_ANON_KEY');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');

  // 创建 .dockerignore
  const dockerignorePath = path.join(process.cwd(), '.dockerignore');
  const dockerignoreContent = `node_modules
.next
.git
.env
.env.local
*.log
`;

  fs.writeFileSync(dockerignorePath, dockerignoreContent);
  console.log('✅ .dockerignore 已创建');

  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
