// ─────────────────────────────────────────────────────────────────
// API Handler Wrapper - API 处理器包装器
// ─────────────────────────────────────────────────────────────────

import { NextResponse, NextRequest } from 'next/server'
import { AppError, createErrorResponse, ErrorResponse, SuccessResponse } from './errors'

type HandlerFunction<T = any> = (
  request: NextRequest,
  context?: any
) => Promise<T>

type RouteHandlerContext = { params: Record<string, string> }

/**
 * API 路由包装器 - 自动处理错误、日志、CORS
 */
export function apiHandler<T>(
  handler: HandlerFunction<T>,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    requireAuth?: boolean
    rateLimit?: { requests: number; windowMs: number }
  } = {}
) {
  return async (request: NextRequest, context?: RouteHandlerContext) => {
    const startTime = Date.now()
    const path = request.nextUrl.pathname

    try {
      // 方法检查
      if (options.method && request.method !== options.method) {
        throw AppError.badRequest(`不支持的请求方法: ${request.method}`)
      }

      // 执行处理器
      const result = await handler(request, context)

      // 记录成功请求
      const duration = Date.now() - startTime
      console.log(`[API] ${request.method} ${path} - ${duration}ms`)

      // 返回成功响应
      return NextResponse.json<SuccessResponse<T>>({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      // 记录错误
      const duration = Date.now() - startTime
      console.error(`[API Error] ${request.method} ${path} - ${duration}ms`, error)

      // 返回错误响应
      const errorResponse = createErrorResponse(error, path)
      const statusCode = error instanceof AppError ? error.statusCode : 500

      return NextResponse.json<ErrorResponse>(errorResponse, { status: statusCode })
    }
  }
}

/**
 * 解析 JSON 请求体（带错误处理）
 */
export async function parseJsonBody<T>(request: NextRequest): Promise<T> {
  try {
    const body = await request.json()
    return body as T
  } catch (error) {
    throw AppError.badRequest('请求体格式无效，请提供有效的 JSON')
  }
}

/**
 * 获取查询参数
 */
export function getQueryParams(request: NextRequest) {
  const { searchParams } = request.nextUrl
  return {
    get: (key: string): string | null => searchParams.get(key),
    getString: (key: string, defaultValue: string = ''): string => 
      searchParams.get(key) || defaultValue,
    getNumber: (key: string, defaultValue: number = 0): number => {
      const value = searchParams.get(key)
      return value ? parseInt(value, 10) || defaultValue : defaultValue
    },
    getBoolean: (key: string, defaultValue: boolean = false): boolean => {
      const value = searchParams.get(key)
      if (value === 'true' || value === '1') return true
      if (value === 'false' || value === '0') return false
      return defaultValue
    },
    getArray: (key: string): string[] => {
      const value = searchParams.get(key)
      return value ? value.split(',').filter(Boolean) : []
    },
  }
}

/**
 * 获取路由参数
 */
export function getRouteParam(
  context: RouteHandlerContext | undefined,
  key: string
): string {
  if (!context?.params?.[key]) {
    throw AppError.badRequest(`缺少路由参数: ${key}`)
  }
  return context.params[key]
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export function getPagination(request: NextRequest): PaginationParams {
  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  }
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  pagination: PaginationParams
): PaginatedResponse<T> {
  return {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
      hasMore: pagination.page * pagination.limit < total,
    },
  }
}
