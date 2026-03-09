'use client'

import { useEffect, useState } from 'react'

export default function OfficePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [officeUrl, setOfficeUrl] = useState(() => {
    // 初始化时直接计算 URL
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      return `http://${hostname}:18791`
    }
    return 'http://127.0.0.1:18791'
  })

  useEffect(() => {
    // 给 iframe 加载时间
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-screen w-full flex flex-col">
      {/* 标题栏 */}
      <div className="bg-background border-b border-border p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>🦞</span>
          <span>像素办公室</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          实时查看 AI Agent 的工作状态
        </p>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">正在加载像素办公室...</p>
          </div>
        </div>
      )}

      {/* iframe 容器 */}
      <div className={`flex-1 relative ${isLoading ? 'hidden' : ''}`}>
        <iframe
          src={officeUrl}
          className="w-full h-full border-0"
          title="Star Office UI"
          style={{
            imageRendering: 'pixelated'
          }}
        />
      </div>

      {/* 底部信息栏 */}
      <div className="bg-background border-t border-border p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">状态说明：</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              待命
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              工作中
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              同步
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              错误
            </span>
          </div>
          <div className="text-muted-foreground">
            访问地址：{officeUrl}
          </div>
        </div>
      </div>
    </div>
  )
}
