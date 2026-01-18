import api from './index'
import type { TMDBSearchResult, TMDBSeries } from './types'

// 刮削相关类型
export interface ScrapeRequest {
  file_path: string
  output_dir?: string | null
  auto_select?: boolean
}

export interface ScrapeByIdRequest {
  file_path: string
  tmdb_id: number
  season: number
  episode: number
  output_dir?: string | null
}

export type ScrapeStatus = 'success' | 'search_failed' | 'api_failed' | 'move_failed' | 'nfo_failed' | 'no_match' | 'need_selection' | 'need_season_episode'

export interface ScrapeResult {
  file_path: string
  status: ScrapeStatus
  message: string | null
  parsed_title: string | null
  parsed_season: number | null
  parsed_episode: number | null
  selected_id: number | null
  dest_path: string | null
  nfo_path: string | null
  search_results?: TMDBSearchResult[]
  series_info?: TMDBSeries
}

export interface BatchScrapeRequest {
  file_paths: string[]
  output_dir?: string | null
  auto_select?: boolean
  dry_run?: boolean
}

export interface BatchScrapeResponse {
  total: number
  success: number
  failed: number
  results: ScrapeResult[]
}

export interface ScraperStatus {
  ready: boolean
  message: string
}

/**
 * 刮削相关 API
 */
export const scraperApi = {
  /**
   * 获取刮削服务状态
   */
  async getStatus(): Promise<ScraperStatus> {
    const response = await api.get<ScraperStatus>('/scraper/status')
    return response.data
  },

  /**
   * 刮削单个文件
   */
  async scrapeFile(request: ScrapeRequest): Promise<ScrapeResult> {
    const response = await api.post<ScrapeResult>('/scraper/file', request, {
      timeout: 120000, // 刮削操作可能耗时较长，设置 2 分钟超时
    })
    return response.data
  },

  /**
   * 使用指定 TMDB ID 刮削文件
   */
  async scrapeFileById(request: ScrapeByIdRequest): Promise<ScrapeResult> {
    const response = await api.post<ScrapeResult>('/scraper/file/by-id', request, {
      timeout: 120000, // 刮削操作可能耗时较长，设置 2 分钟超时
    })
    return response.data
  },

  /**
   * 批量刮削
   */
  async batchScrape(request: BatchScrapeRequest): Promise<BatchScrapeResponse> {
    const response = await api.post<BatchScrapeResponse>('/scraper/batch', request)
    return response.data
  },
}
