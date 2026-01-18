import api from './index'

// 已刮削文件记录
export interface ScrapedFile {
  id: string
  source_path: string
  target_path: string | null
  file_size: number
  tmdb_id: number | null
  season: number | null
  episode: number | null
  title: string | null
  scraped_at: string
  history_record_id: string | null
}

// 列表响应
export interface ScrapedFileListResponse {
  records: ScrapedFile[]
  total: number
}

/**
 * 已刮削文件 API
 */
export const scrapedFilesApi = {
  /**
   * 获取已刮削文件列表
   */
  async list(params?: {
    page?: number
    page_size?: number
    search?: string
  }): Promise<ScrapedFileListResponse> {
    const response = await api.get<ScrapedFileListResponse>('/scraped-files', { params })
    return response.data
  },

  /**
   * 删除记录（允许文件重新刮削）
   */
  async delete(ids: string[]): Promise<{ deleted: number }> {
    const response = await api.delete<{ deleted: number }>('/scraped-files', {
      params: { ids },
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams()
        params.ids.forEach((id: string) => searchParams.append('ids', id))
        return searchParams.toString()
      },
    })
    return response.data
  },

  /**
   * 根据路径删除记录
   */
  async deleteByPaths(paths: string[]): Promise<{ deleted: number }> {
    const response = await api.delete<{ deleted: number }>('/scraped-files/by-paths', {
      params: { paths },
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams()
        params.paths.forEach((path: string) => searchParams.append('paths', path))
        return searchParams.toString()
      },
    })
    return response.data
  },

  /**
   * 清空所有记录
   */
  async clearAll(): Promise<{ deleted: number }> {
    const response = await api.delete<{ deleted: number }>('/scraped-files/clear')
    return response.data
  },

  /**
   * 检查文件是否已刮削
   */
  async check(path: string): Promise<{ is_scraped: boolean; record: ScrapedFile | null }> {
    const response = await api.get<{ is_scraped: boolean; record: ScrapedFile | null }>(
      '/scraped-files/check',
      { params: { path } }
    )
    return response.data
  },
}
