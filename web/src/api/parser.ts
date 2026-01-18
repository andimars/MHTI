import api from './index'
import type { BatchParseRequest, BatchParseResponse, ParseRequest, ParseResponse } from './types'

/**
 * 解析相关 API
 */
export const parserApi = {
  /**
   * 解析单个文件名
   */
  async parse(filename: string, filepath: string | null = null): Promise<ParseResponse> {
    const request: ParseRequest = { filename, filepath }
    const response = await api.post<ParseResponse>('/parse', request)
    return response.data
  },

  /**
   * 批量解析文件名
   */
  async parseBatch(files: ParseRequest[]): Promise<BatchParseResponse> {
    const request: BatchParseRequest = { files }
    const response = await api.post<BatchParseResponse>('/parse/batch', request)
    return response.data
  },
}
