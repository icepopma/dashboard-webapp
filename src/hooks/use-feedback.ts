// ─────────────────────────────────────────────────────────────────
// User Feedback Hook - 用户反馈 Hook
// ─────────────────────────────────────────────────────────────────

import { useCallback } from 'react'
import { toast } from 'sonner'
import { AppError } from '@/lib/errors'

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface FeedbackOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick?: () => void
  }
}

/**
 * 用户反馈 Hook - 统一的用户通知系统
 */
export function useFeedback() {
  const show = useCallback((type: FeedbackType, message: string, options?: FeedbackOptions) => {
    const duration = options?.duration ?? (type === 'error' ? 5000 : 3000)

    const toastOptions: any = {
      description: options?.description,
      duration,
    }

    if (options?.action) {
      toastOptions.action = {
        label: options.action.label,
        onClick: options.action.onClick,
      }
    }

    if (options?.cancel) {
      toastOptions.cancel = {
        label: options.cancel.label,
        onClick: options.cancel.onClick || (() => {}),
      }
    }

    switch (type) {
      case 'success':
        toast.success(message, toastOptions)
        break
      case 'error':
        toast.error(message, toastOptions)
        break
      case 'warning':
        toast.warning(message, toastOptions)
        break
      case 'info':
        toast.info(message, toastOptions)
        break
      case 'loading':
        toast.loading(message, toastOptions)
        break
    }
  }, [])

  const success = useCallback((message: string, options?: FeedbackOptions) => {
    show('success', message, options)
  }, [show])

  const error = useCallback((message: string, options?: FeedbackOptions) => {
    show('error', message, options)
  }, [show])

  const warning = useCallback((message: string, options?: FeedbackOptions) => {
    show('warning', message, options)
  }, [show])

  const info = useCallback((message: string, options?: FeedbackOptions) => {
    show('info', message, options)
  }, [show])

  const loading = useCallback((message: string, options?: FeedbackOptions) => {
    return show('loading', message, options)
  }, [show])

  /**
   * 从错误对象显示错误消息
   */
  const showError = useCallback((err: unknown, fallbackMessage = '操作失败，请稍后重试') => {
    if (err instanceof AppError) {
      error(err.message, {
        description: err.details ? JSON.stringify(err.details, null, 2) : undefined,
        duration: 6000,
      })
    } else if (err instanceof Error) {
      error(err.message || fallbackMessage)
    } else if (typeof err === 'string') {
      error(err)
    } else {
      error(fallbackMessage)
    }
  }, [error])

  /**
   * Promise 反馈 - 自动处理加载/成功/错误状态
   */
  const promise = useCallback(async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: unknown) => string)
    }
  ): Promise<T> => {
    toast.promise(promise, {
      loading: messages.loading,
      success: (data) => typeof messages.success === 'function' ? messages.success(data) : messages.success,
      error: (err) => typeof messages.error === 'function' ? messages.error(err) : messages.error,
    })
    return promise
  }, [])

  /**
   * 确认对话框（使用 toast 模拟）
   */
  const confirm = useCallback((message: string, onConfirm: () => void, onCancel?: () => void) => {
    toast(message, {
      action: {
        label: '确认',
        onClick: onConfirm,
      },
      ...(onCancel ? {
        cancel: {
          label: '取消',
          onClick: onCancel,
        }
      } : {}),
      duration: Infinity,
    })
  }, [])

  return {
    show,
    success,
    error,
    warning,
    info,
    loading,
    showError,
    promise,
    confirm,
    dismiss: toast.dismiss,
  }
}

/**
 * 操作确认 Hook
 */
export function useConfirm() {
  const feedback = useFeedback()

  return useCallback((
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string
      cancelText?: string
      description?: string
    }
  ) => {
    feedback.show('warning', message, {
      description: options?.description,
      duration: Infinity,
      action: {
        label: options?.confirmText || '确认',
        onClick: async () => {
          try {
            await onConfirm()
            feedback.success('操作成功')
          } catch (err) {
            feedback.showError(err)
          }
        },
      },
      cancel: {
        label: options?.cancelText || '取消',
      },
    })
  }, [feedback])
}
