import api from './index'
import type {
  WatchedFolder,
  WatchedFolderCreate,
  WatchedFolderListResponse,
  WatchedFolderUpdate,
  WatcherStatusResponse,
} from './types'

/**
 * 文件夹监控相关 API
 */
export const watcherApi = {
  /**
   * 获取监控服务状态
   */
  async getStatus(): Promise<WatcherStatusResponse> {
    const response = await api.get<WatcherStatusResponse>('/watcher/status')
    return response.data
  },

  /**
   * 启动监控服务
   */
  async start(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/watcher/start')
    return response.data
  },

  /**
   * 停止监控服务
   */
  async stop(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/watcher/stop')
    return response.data
  },

  /**
   * 获取监控文件夹列表
   */
  async listFolders(): Promise<WatchedFolderListResponse> {
    const response = await api.get<WatchedFolderListResponse>('/watcher/folders')
    return response.data
  },

  /**
   * 创建监控文件夹
   */
  async createFolder(folder: WatchedFolderCreate): Promise<WatchedFolder> {
    const response = await api.post<WatchedFolder>('/watcher/folders', folder)
    return response.data
  },

  /**
   * 获取监控文件夹详情
   */
  async getFolder(folderId: string): Promise<WatchedFolder> {
    const response = await api.get<WatchedFolder>(`/watcher/folders/${folderId}`)
    return response.data
  },

  /**
   * 更新监控文件夹
   */
  async updateFolder(folderId: string, update: WatchedFolderUpdate): Promise<WatchedFolder> {
    const response = await api.put<WatchedFolder>(`/watcher/folders/${folderId}`, update)
    return response.data
  },

  /**
   * 删除监控文件夹
   */
  async deleteFolder(folderId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/watcher/folders/${folderId}`)
    return response.data
  },
}
