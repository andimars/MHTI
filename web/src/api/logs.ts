/**
 * 日志管理 API
 */
import api from './index'
import type {
  LogConfig,
  LogConfigUpdate,
  LogListResponse,
  LogQuery,
  LogStats,
  SystemLogLevel,
} from './types'

const BASE_URL = '/logs'

/**
 * 获取日志列表
 */
export async function getLogs(query: LogQuery = {}): Promise<LogListResponse> {
  const params = new URLSearchParams()

  if (query.level) params.append('level', query.level)
  if (query.logger) params.append('logger', query.logger)
  if (query.search) params.append('search', query.search)
  if (query.start_time) params.append('start_time', query.start_time)
  if (query.end_time) params.append('end_time', query.end_time)
  if (query.page) params.append('page', query.page.toString())
  if (query.page_size) params.append('page_size', query.page_size.toString())

  const response = await api.get<LogListResponse>(`${BASE_URL}?${params.toString()}`)
  return response.data
}

/**
 * 获取日志统计信息
 */
export async function getLogStats(): Promise<LogStats> {
  const response = await api.get<LogStats>(`${BASE_URL}/stats`)
  return response.data
}

/**
 * 获取所有日志模块名称列表
 */
export async function getLoggers(): Promise<string[]> {
  const response = await api.get<string[]>(`${BASE_URL}/loggers`)
  return response.data
}

/**
 * 获取日志配置
 */
export async function getLogConfig(): Promise<LogConfig> {
  const response = await api.get<LogConfig>(`${BASE_URL}/config`)
  return response.data
}

/**
 * 更新日志配置
 */
export async function updateLogConfig(config: LogConfigUpdate): Promise<LogConfig> {
  const response = await api.put<LogConfig>(`${BASE_URL}/config`, config)
  return response.data
}

/**
 * 清理日志
 */
export async function clearLogs(
  before?: string,
  level?: SystemLogLevel,
): Promise<{ deleted: number; message: string }> {
  const params = new URLSearchParams()
  if (before) params.append('before', before)
  if (level) params.append('level', level)

  const response = await api.delete<{ deleted: number; message: string }>(
    `${BASE_URL}?${params.toString()}`,
  )
  return response.data
}

/**
 * 清理过期日志
 */
export async function cleanupOldLogs(): Promise<{ deleted: number; message: string }> {
  const response = await api.post<{ deleted: number; message: string }>(`${BASE_URL}/cleanup`)
  return response.data
}

/**
 * 导出日志
 */
export async function exportLogs(
  format: 'json' | 'csv' = 'json',
  startTime?: string,
  endTime?: string,
  limit: number = 10000,
): Promise<Blob> {
  const params = new URLSearchParams()
  params.append('format', format)
  if (startTime) params.append('start_time', startTime)
  if (endTime) params.append('end_time', endTime)
  params.append('limit', limit.toString())

  const response = await api.get(`${BASE_URL}/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * 下载导出的日志文件
 */
export async function downloadLogs(
  format: 'json' | 'csv' = 'json',
  startTime?: string,
  endTime?: string,
  limit: number = 10000,
): Promise<void> {
  const blob = await exportLogs(format, startTime, endTime, limit)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `logs.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
