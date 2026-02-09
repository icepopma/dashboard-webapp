import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // 允许外部 IP 访问开发服务器（数组格式）
  allowedDevOrigins: ['*'],
};

export default nextConfig;
