'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Volume2, VolumeX, Volume1, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SoundType } from '@/hooks/use-sound'

interface SoundControlProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  volume: number
  onVolumeChange: (volume: number) => void
  onPlayTest?: (type: SoundType) => void
  className?: string
  compact?: boolean
}

export function SoundControl({
  enabled,
  onEnabledChange,
  volume,
  onVolumeChange,
  onPlayTest,
  className,
  compact = false,
}: SoundControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  const VolumeIcon = !enabled ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'icon' : 'sm'}
          className={cn(
            'relative',
            !enabled && 'text-muted-foreground',
            className
          )}
        >
          <VolumeIcon className="h-4 w-4" />
          {!compact && <span className="ml-2">音效</span>}
          {!enabled && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>音效设置</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => onEnabledChange(!enabled)}
          >
            {enabled ? '已启用' : '已静音'}
          </Button>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* 音量控制 */}
        <div className="px-2 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">音量</span>
            <span className="text-sm font-medium">{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            value={[volume * 100]}
            onValueChange={([v]) => onVolumeChange(v / 100)}
            max={100}
            step={5}
            disabled={!enabled}
          />
        </div>

        <DropdownMenuSeparator />

        {/* 测试音效 */}
        {onPlayTest && enabled && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              测试音效
            </DropdownMenuLabel>
            <div className="grid grid-cols-2 gap-1 px-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => onPlayTest('complete')}
              >
                ✅ 完成
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => onPlayTest('notify')}
              >
                🔔 通知
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => onPlayTest('alert')}
              >
                ⚠️ 警告
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => onPlayTest('urgent')}
              >
                🚨 紧急
              </Button>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* 快速切换 */}
        <DropdownMenuItem
          onClick={() => onEnabledChange(!enabled)}
          className="cursor-pointer"
        >
          {enabled ? (
            <>
              <VolumeX className="mr-2 h-4 w-4" />
              静音
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              启用音效
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// 紧急模式按钮
interface UrgentModeButtonProps {
  isUrgent: boolean
  onToggle: () => void
  className?: string
}

export function UrgentModeButton({ isUrgent, onToggle, className }: UrgentModeButtonProps) {
  return (
    <Button
      variant={isUrgent ? 'destructive' : 'outline'}
      size="sm"
      onClick={onToggle}
      className={cn(
        'transition-all',
        isUrgent && 'animate-pulse',
        className
      )}
    >
      {isUrgent ? (
        <>
          <span className="mr-2">🚨</span>
          紧急模式
        </>
      ) : (
        <>
          <span className="mr-2">🔔</span>
          启动紧急模式
        </>
      )}
    </Button>
  )
}
