'use client'

import { useCallback, useEffect, useState, useRef } from 'react'

export type SoundType = 'complete' | 'notify' | 'alert' | 'click' | 'urgent'

interface UseSoundOptions {
  enabled?: boolean
  volume?: number
}

interface UseSoundReturn {
  play: (type: SoundType) => void
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  volume: number
  setVolume: (volume: number) => void
}

// 存储到 localStorage 的 key
const STORAGE_KEY = 'office-sound-settings'

// 使用 Web Audio API 合成音效
function createSynthSound(audioContext: AudioContext, type: SoundType, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  const now = audioContext.currentTime
  const vol = volume * 0.3 // 整体音量控制

  switch (type) {
    case 'complete':
      // 任务完成 - 上升的悦耳音调
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(523.25, now) // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.2) // G5
      gainNode.gain.setValueAtTime(vol, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      oscillator.start(now)
      oscillator.stop(now + 0.4)
      break

    case 'notify':
      // 通知 - 短促的双音
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, now) // A5
      oscillator.frequency.setValueAtTime(1100, now + 0.08)
      gainNode.gain.setValueAtTime(vol * 0.8, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      oscillator.start(now)
      oscillator.stop(now + 0.15)
      break

    case 'alert':
      // 警报 - 中等长度警告音
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(440, now)
      oscillator.frequency.setValueAtTime(550, now + 0.1)
      oscillator.frequency.setValueAtTime(440, now + 0.2)
      gainNode.gain.setValueAtTime(vol * 0.6, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      oscillator.start(now)
      oscillator.stop(now + 0.3)
      break

    case 'click':
      // 点击 - 极短的点击音
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(1200, now)
      gainNode.gain.setValueAtTime(vol * 0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
      oscillator.start(now)
      oscillator.stop(now + 0.05)
      break

    case 'urgent':
      // 紧急模式 - 三声急促警报
      const urgentOsc = audioContext.createOscillator()
      const urgentGain = audioContext.createGain()
      urgentOsc.connect(urgentGain)
      urgentGain.connect(audioContext.destination)

      urgentOsc.type = 'square'
      urgentOsc.frequency.setValueAtTime(880, now)

      // 三声脉冲
      urgentGain.gain.setValueAtTime(0, now)
      urgentGain.gain.setValueAtTime(vol, now + 0.05)
      urgentGain.gain.setValueAtTime(0.01, now + 0.15)
      urgentGain.gain.setValueAtTime(vol, now + 0.25)
      urgentGain.gain.setValueAtTime(0.01, now + 0.35)
      urgentGain.gain.setValueAtTime(vol, now + 0.45)
      urgentGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55)

      urgentOsc.start(now)
      urgentOsc.stop(now + 0.6)
      return // 不需要执行下面的通用 stop
  }
}

export function useSound(options: UseSoundOptions = {}): UseSoundReturn {
  const { enabled: initialEnabled = true, volume: initialVolume = 0.7 } = options

  const [enabled, setEnabledState] = useState(initialEnabled)
  const [volume, setVolumeState] = useState(initialVolume)
  const audioContextRef = useRef<AudioContext | null>(null)

  // 从 localStorage 恢复设置
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { enabled: savedEnabled, volume: savedVolume } = JSON.parse(saved)
        if (typeof savedEnabled === 'boolean') setEnabledState(savedEnabled)
        if (typeof savedVolume === 'number') setVolumeState(savedVolume)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // 保存设置到 localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, volume }))
    } catch (e) {
      // ignore
    }
  }, [enabled, volume])

  // 获取或创建 AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const play = useCallback((type: SoundType) => {
    if (!enabled) return

    try {
      const ctx = getAudioContext()
      
      // 如果 AudioContext 被暂停（浏览器策略），恢复它
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      createSynthSound(ctx, type, volume)
    } catch (e) {
      console.warn('Failed to play sound:', e)
    }
  }, [enabled, volume, getAudioContext])

  const setEnabled = useCallback((newEnabled: boolean) => {
    setEnabledState(newEnabled)
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)))
  }, [])

  return {
    play,
    enabled,
    setEnabled,
    volume,
    setVolume,
  }
}

// 紧急模式音效播放器（持续播放直到停止）
export function useUrgentAlarm() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const start = useCallback(() => {
    if (intervalRef.current) return // 已经在播放

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContextRef.current
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // 播放一次紧急音效
    const playUrgent = () => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      const now = ctx.currentTime
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(880, now)

      // 三声脉冲
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.setValueAtTime(0.2, now + 0.05)
      gainNode.gain.setValueAtTime(0.01, now + 0.15)
      gainNode.gain.setValueAtTime(0.2, now + 0.25)
      gainNode.gain.setValueAtTime(0.01, now + 0.35)
      gainNode.gain.setValueAtTime(0.2, now + 0.45)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.55)

      oscillator.start(now)
      oscillator.stop(now + 0.6)
    }

    playUrgent()
    // 每 3 秒重复一次
    intervalRef.current = setInterval(playUrgent, 3000)
    setIsPlaying(true)
  }, [])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPlaying(false)
  }, [])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { start, stop, isPlaying }
}
