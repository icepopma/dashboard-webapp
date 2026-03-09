'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Video {
  id: string
  title: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  progress: number
  generation_method: string
  file_path: string
  file_size: number
  duration: number
  resolution: string
  cost: number
  created_at: string
  updated_at: string
}

export default function VideoList() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初始加载
    fetchVideos()

    // 订阅实时更新
    const channel = supabase
      .channel('videos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVideos((prev) => [payload.new as Video, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setVideos((prev) =>
              prev.map((video) =>
                video.id === payload.new.id ? (payload.new as Video) : video
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setVideos((prev) =>
              prev.filter((video) => video.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchVideos() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setVideos(data || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'generating':
        return 'bg-blue-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'generating':
        return '生成中'
      case 'failed':
        return '失败'
      default:
        return '等待中'
    }
  }

  if (loading) {
    return <div className="p-4">加载中...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">视频列表</h2>
      <div className="grid gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <span
                className={`px-2 py-1 rounded text-white text-sm ${getStatusColor(
                  video.status
                )}`}
              >
                {getStatusText(video.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">生成方式：</span>
                {video.generation_method}
              </div>
              <div>
                <span className="font-medium">时长：</span>
                {video.duration} 秒
              </div>
              <div>
                <span className="font-medium">大小：</span>
                {video.file_size} MB
              </div>
              <div>
                <span className="font-medium">分辨率：</span>
                {video.resolution}
              </div>
              <div>
                <span className="font-medium">成本：</span>${video.cost}
              </div>
              <div>
                <span className="font-medium">创建时间：</span>
                {new Date(video.created_at).toLocaleString('zh-CN')}
              </div>
            </div>

            {video.status === 'generating' && (
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${video.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  进度：{video.progress}%
                </p>
              </div>
            )}

            {video.status === 'completed' && video.file_path && (
              <div className="mt-2">
                <a
                  href={video.file_path}
                  className="text-blue-500 hover:underline text-sm"
                  download
                >
                  下载视频
                </a>
              </div>
            )}
          </div>
        ))}

        {videos.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            暂无视频
          </div>
        )}
      </div>
    </div>
  )
}
