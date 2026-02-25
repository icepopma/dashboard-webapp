# Dashboard Webapp - Deployment

## 部署到 Vercel

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 部署
```bash
vercel
```

### 4. 生产部署
```bash
vercel --prod
```

## 环境变量

在 Vercel Dashboard 中设置以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://iuzujxiumkumhlqnoyze.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 构建命令

```bash
npm run build
```

## 启动命令

```bash
npm start
```

## Docker 部署

```bash
docker build -t dashboard-webapp .
docker run -p 3000:3000 dashboard-webapp
```

## 性能优化

- [x] 使用 Next.js 16 Turbopack
- [x] 静态页面预渲染
- [x] API 路由按需渲染
- [ ] 图片优化 (next/image)
- [ ] 字体优化
- [ ] 代码分割

## 监控

建议使用：
- Vercel Analytics
- Sentry 错误追踪
- LogRocket 会话回放
