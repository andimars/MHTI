/**
 * API 错误处理工具
 *
 * 提供统一的错误处理、消息提示和类型安全的 API 调用包装
 */

import { type AxiosError, type AxiosResponse } from 'axios'
import { useMessage, type MessageApi } from 'naive-ui'

/**
 * API 错误响应结构
 */
export interface ApiErrorResponse {
  detail?: string
  message?: string
  error?: string
  code?: string | number
}

/**
 * 标准化的 API 错误
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly code?: string | number
  public readonly originalError: AxiosError | Error

  constructor(
    message: string,
    status: number,
    originalError: AxiosError | Error,
    code?: string | number
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.originalError = originalError
  }

  /**
   * 是否为网络错误
   */
  get isNetworkError(): boolean {
    return this.status === 0
  }

  /**
   * 是否为认证错误
   */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403
  }

  /**
   * 是否为客户端错误
   */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  /**
   * 是否为服务器错误
   */
  get isServerError(): boolean {
    return this.status >= 500
  }
}

/**
 * 从 AxiosError 提取错误消息
 */
export function extractErrorMessage(error: AxiosError<ApiErrorResponse> | Error): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if ('response' in error && error.response) {
    const data = error.response.data
    // 尝试多种常见的错误字段
    return data?.detail || data?.message || data?.error || getDefaultMessage(error.response.status)
  }

  if ('request' in error && error.request) {
    return '网络连接失败，请检查网络'
  }

  return error.message || '未知错误'
}

/**
 * 获取默认错误消息
 */
function getDefaultMessage(status: number): string {
  const messages: Record<number, string> = {
    400: '请求参数错误',
    401: '未登录或登录已过期',
    403: '没有权限执行此操作',
    404: '请求的资源不存在',
    408: '请求超时',
    409: '数据冲突',
    413: '上传的文件过大',
    422: '请求数据格式错误',
    429: '请求过于频繁，请稍后再试',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务暂时不可用',
    504: '网关超时',
  }
  return messages[status] || `请求失败 (${status})`
}

/**
 * 将 AxiosError 转换为 ApiError
 */
export function toApiError(error: AxiosError<ApiErrorResponse> | Error): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  const message = extractErrorMessage(error as AxiosError<ApiErrorResponse>)
  const status = 'response' in error ? (error.response?.status || 0) : 0
  const code = 'response' in error ? (error.response?.data?.code) : undefined

  return new ApiError(message, status, error, code)
}

/**
 * API 调用结果类型
 */
export type ApiResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: ApiError }

/**
 * 安全的 API 调用包装器
 *
 * @example
 * const result = await safeApiCall(() => userApi.getProfile())
 * if (result.success) {
 *   console.log(result.data)
 * } else {
 *   console.error(result.error.message)
 * }
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<AxiosResponse<T>>
): Promise<ApiResult<T>> {
  try {
    const response = await apiCall()
    return {
      success: true,
      data: response.data,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: toApiError(error as AxiosError<ApiErrorResponse>),
    }
  }
}

/**
 * 带自动消息提示的 API 调用
 *
 * @example
 * const data = await apiCallWithMessage(
 *   () => userApi.updateProfile(newData),
 *   message,
 *   { successMsg: '保存成功', showSuccess: true }
 * )
 */
export interface ApiCallOptions {
  /** 成功消息 */
  successMsg?: string
  /** 是否显示成功消息 */
  showSuccess?: boolean
  /** 失败消息（覆盖 API 返回的错误） */
  errorMsg?: string
  /** 是否显示错误消息 */
  showError?: boolean
  /** 认证错误时是否跳转登录 */
  redirectOnAuth?: boolean
}

export async function apiCallWithMessage<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  messageApi: MessageApi,
  options: ApiCallOptions = {}
): Promise<T | null> {
  const {
    successMsg,
    showSuccess = false,
    errorMsg,
    showError = true,
    redirectOnAuth = true,
  } = options

  const result = await safeApiCall(apiCall)

  if (result.success) {
    if (showSuccess && successMsg) {
      messageApi.success(successMsg)
    }
    return result.data
  }

  const error = result.error

  // 认证错误特殊处理
  if (error.isAuthError && redirectOnAuth) {
    messageApi.error('登录已过期，请重新登录')
    // 跳转由 axios 拦截器处理
    return null
  }

  if (showError) {
    messageApi.error(errorMsg || error.message)
  }

  return null
}

/**
 * 创建带消息的 API 调用 hook
 */
export function useApiCall() {
  const message = useMessage()

  return {
    /**
     * 安全调用（不显示消息）
     */
    call: safeApiCall,

    /**
     * 带消息的调用
     */
    callWithMessage: <T>(
      apiCall: () => Promise<AxiosResponse<T>>,
      options?: ApiCallOptions
    ) => apiCallWithMessage(apiCall, message, options),

    /**
     * 快捷方法：成功时显示消息
     */
    callWithSuccessMessage: <T>(
      apiCall: () => Promise<AxiosResponse<T>>,
      successMsg: string
    ) =>
      apiCallWithMessage(apiCall, message, {
        successMsg,
        showSuccess: true,
        showError: true,
      }),
  }
}
