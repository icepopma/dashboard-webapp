'use client'

import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="gap-2 text-xs"
    >
      <Languages className="h-4 w-4" />
      {locale === 'zh' ? 'EN' : '中文'}
    </Button>
  )
}
