'use client'

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
  preventDefault?: boolean
}

export function useKeyboardShortcut(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 忽略在输入框中的快捷键（除了 Escape）
      const target = event.target as HTMLElement
      const isInputting = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable
      
      for (const shortcut of shortcutsRef.current) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = !!shortcut.ctrlKey === (event.ctrlKey || event.metaKey)
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey
        const altMatch = !!shortcut.altKey === event.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          // 如果在输入框中，只允许 Escape 键
          if (isInputting && event.key.toLowerCase() !== 'escape') {
            continue
          }
          
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

// 预定义的导航快捷键映射
export const navShortcuts: Record<string, string> = {
  '1': 'pop',
  '2': 'home',
  '3': 'tasks',
  '4': 'content',
  '5': 'approvals',
  '6': 'council',
  '7': 'calendar',
  '8': 'projects',
  '9': 'memory',
  '0': 'docs',
}

// 格式化快捷键显示
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action'>): string {
  const parts: string[] = []
  
  if (shortcut.ctrlKey) {
    parts.push('⌘/Ctrl')
  }
  if (shortcut.shiftKey) {
    parts.push('Shift')
  }
  if (shortcut.altKey) {
    parts.push('Alt')
  }
  
  // 格式化按键
  let key = shortcut.key.toUpperCase()
  if (key === ' ') key = 'Space'
  if (key === 'ESCAPE') key = 'Esc'
  if (key === 'ARROWUP') key = '↑'
  if (key === 'ARROWDOWN') key = '↓'
  if (key === 'ARROWLEFT') key = '←'
  if (key === 'ARROWRIGHT') key = '→'
  
  parts.push(key)
  
  return parts.join(' + ')
}
