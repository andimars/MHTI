import api from './index'
import type { BrowseResponse, ScanRequest, ScanResponse } from './types'

/**
 * 文件相关 API
 */
export const filesApi = {
  /**
   * 浏览目录
   * @param path 目录路径，空字符串表示根目录
   * @param page 页码（从1开始）
   * @param pageSize 每页条目数
   */
  async browse(
    path: string = '',
    page: number = 1,
    pageSize: number = 20
  ): Promise<BrowseResponse> {
    const response = await api.get<BrowseResponse>('/files/browse', {
      params: { path, page, page_size: pageSize },
    })
    return response.data
  },

  /**
   * 扫描目录中的视频文件
   * @param folderPath 要扫描的目录路径
   * @param excludeScraped 是否排除已刮削的文件，默认 true
   */
  async scan(folderPath: string, excludeScraped: boolean = true): Promise<ScanResponse> {
    const request: ScanRequest = {
      folder_path: folderPath,
      exclude_scraped: excludeScraped,
    }
    const response = await api.post<ScanResponse>('/scan', request)
    return response.data
  },
}
