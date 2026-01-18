/**
 * 格式化工具函数
 */

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 */
export function formatFileSize(bytes: number | null | undefined, decimals = 2): string {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))

  return `${size} ${sizes[i]}`
}

/**
 * 格式化日期时间
 * @param date 日期字符串或 Date 对象
 * @param format 格式类型
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  format: 'date' | 'time' | 'datetime' | 'relative' = 'datetime'
): string {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  const pad = (n: number) => n.toString().padStart(2, '0')

  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  const seconds = pad(d.getSeconds())

  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}:${seconds}`
    case 'datetime':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    case 'relative':
      return formatRelativeTime(d)
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  if (days < 365) return `${Math.floor(days / 30)} 个月前`
  return `${Math.floor(days / 365)} 年前`
}

/**
 * 格式化持续时间（秒）
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || seconds <= 0) return '-'

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}时${m}分${s}秒`
  }
  if (m > 0) {
    return `${m}分${s}秒`
  }
  return `${s}秒`
}

/**
 * 格式化数字（添加千分位）
 */
export function formatNumber(num: number | null | undefined, decimals = 0): string {
  if (num === null || num === undefined) return '-'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return '-'
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 截断文本
 */
export function truncate(text: string | null | undefined, length: number, suffix = '...'): string {
  if (!text) return ''
  if (text.length <= length) return text
  return text.slice(0, length - suffix.length) + suffix
}

/**
 * 格式化路径（显示最后 n 级目录）
 */
export function formatPath(path: string | null | undefined, levels = 2): string {
  if (!path) return '-'
  const parts = path.replace(/\\/g, '/').split('/').filter(Boolean)
  if (parts.length <= levels) return path
  return '.../' + parts.slice(-levels).join('/')
}
