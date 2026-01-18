import api from './index'
import type { EmbyConfig, EmbyConfigRequest, EmbyTestResponse } from './types'

/**
 * Emby 相关 API
 */
export const embyApi = {
  /**
   * 获取 Emby 配置
   */
  async getConfig(): Promise<EmbyConfig> {
    const response = await api.get<EmbyConfig>('/emby/config')
    return response.data
  },

  /**
   * 保存 Emby 配置
   */
  async saveConfig(config: EmbyConfigRequest): Promise<EmbyConfig> {
    const response = await api.put<EmbyConfig>('/emby/config', config)
    return response.data
  },

  /**
   * 测试 Emby 连接
   */
  async testConnection(config?: EmbyConfigRequest): Promise<EmbyTestResponse> {
    const response = await api.post<EmbyTestResponse>('/emby/test', config || null)
    return response.data
  },
}
