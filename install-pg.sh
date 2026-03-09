#!/bin/bash
# 安装 pg 依赖

cd /root/.openclaw/workspace/dashboard-webapp-opt
npm install pg @types/pg --save
echo "✅ pg 安装完成"
