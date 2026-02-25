// ─────────────────────────────────────────────────────────────────
// Error Types & Utilities - 错误类型与工具
// ─────────────────────────────────────────────────────────────────

/**
 * 自定义错误类型
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }

  static badRequest(message: string, details?: any) {
    return new AppError('BAD_REQUEST', message, 400, details)
  }

  static notFound(resource: string) {
    return new AppError('NOT_FOUND', `${resource} 不存在`, 404)
  }

  static unauthorized(message: string = '未授权访问') {
    return new AppError('UNAUTHORIZED', message, 401)
  }

  static forbidden(message: string = '权限不足') {
    return new AppError('FORBIDDEN', message, 403)
  }

  static conflict(message: string, details?: any) {
    return new AppError('CONFLICT', message, 409, details)
  }

  static validation(message: string, details?: any) {
    return new AppError('VALIDATION_ERROR', message, 422, details)
  }

  static internal(message: string = '服务器内部错误', details?: any) {
    return new AppError('INTERNAL_ERROR', message, 500, details)
  }

  static database(message: string = '数据库操作失败', details?: any) {
    return new AppError('DATABASE_ERROR', message, 500, details)
  }

  static network(message: string = '网络连接失败') {
    return new AppError('NETWORK_ERROR', message, 503)
  }
}

/**
 * API 错误响应格式
 */
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    path?: string
  }
}

/**
 * API 成功响应格式
 */
export interface SuccessResponse<T = any> {
  success: true
  data: T
  timestamp: string
}

/**
 * 创建错误响应
 */
export function createErrorResponse(error: unknown, path?: string): ErrorResponse {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        path,
      },
    }
  }

  // Supabase 错误处理
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as any
    return {
      success: false,
      error: {
        code: supabaseError.code || 'DATABASE_ERROR',
        message: getSupabaseErrorMessage(supabaseError),
        timestamp: new Date().toISOString(),
        path,
      },
    }
  }

  // 未知错误
  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : '发生未知错误',
      timestamp: new Date().toISOString(),
      path,
    },
  }
}

/**
 * Supabase 错误消息映射
 */
function getSupabaseErrorMessage(error: any): string {
  const code = error.code
  
  const errorMessages: Record<string, string> = {
    'PGRST116': '请求的资源不存在',
    '23505': '数据已存在，无法重复创建',
    '23503': '关联数据不存在',
    '23502': '必填字段缺失',
    '42501': '没有权限执行此操作',
    'P0001': '数据库操作失败',
  }

  return errorMessages[code] || error.message || '数据库操作失败'
}

/**
 * 验证工具
 */
export const validators = {
  required: (value: any, fieldName: string) => {
    if (value === undefined || value === null || value === '') {
      throw AppError.validation(`${fieldName} 不能为空`)
    }
  },

  uuid: (value: string, fieldName: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(value)) {
      throw AppError.validation(`${fieldName} 格式无效`)
    }
  },

  enum: <T extends string>(value: string, allowed: T[], fieldName: string) => {
    if (!allowed.includes(value as T)) {
      throw AppError.validation(
        `${fieldName} 必须是以下值之一: ${allowed.join(', ')}`,
        { allowed }
      )
    }
  },

  minLength: (value: string, min: number, fieldName: string) => {
    if (value.length < min) {
      throw AppError.validation(`${fieldName} 至少需要 ${min} 个字符`)
    }
  },

  maxLength: (value: string, max: number, fieldName: string) => {
    if (value.length > max) {
      throw AppError.validation(`${fieldName} 最多 ${max} 个字符`)
    }
  },
}

/**
 * 输入清理
 */
export const sanitize = {
  string: (value: any): string => {
    if (typeof value !== 'string') return ''
    return value.trim()
  },

  number: (value: any): number | null => {
    const num = Number(value)
    return isNaN(num) ? null : num
  },

  boolean: (value: any): boolean => {
    if (typeof value === 'boolean') return value
    if (value === 'true' || value === '1') return true
    return false
  },
}
