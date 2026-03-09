'use client'

import React, { createContext, useContext, useState } from 'react'
import zhMessages from '@/locales/zh.json'
import enMessages from '@/locales/en.json'

type Messages = typeof zhMessages
type Locale = 'zh' | 'en'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const messages: Record<Locale, Messages> = {
  zh: zhMessages,
  en: enMessages,
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    // 从 localStorage 读取保存的语言设置（仅在客户端）
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale
      if (savedLocale && (savedLocale === 'zh' || savedLocale === 'en')) {
        return savedLocale
      }
    }
    return 'zh'
  })

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  // 翻译函数
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: string | Record<string, unknown> = messages[locale]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k] as string | Record<string, unknown>
      } else {
        // 如果找不到翻译，返回 key
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
