// ─────────────────────────────────────────────────────────────────
// Theme Hook - 主题切换
// ─────────────────────────────────────────────────────────────────

'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'dashboard-theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // 获取系统主题偏好
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // 应用主题
  const applyTheme = (newTheme: Theme) => {
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme
    setResolvedTheme(resolved)

    // 更新 document class
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
  }

  // 设置主题
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
    applyTheme(newTheme)
  }

  // 切换主题
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }

  // 初始化
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null
    const initialTheme = savedTheme || 'system'
    setThemeState(initialTheme)
    applyTheme(initialTheme)

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  }
}
