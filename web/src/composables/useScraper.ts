import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useScraperStore, type VideoFileItem } from '@/stores/scraper'
import { filesApi } from '@/api/files'
import { parserApi } from '@/api/parser'
import { scraperApi } from '@/api/scraper'
import { scrapeJobApi, type ScrapeJobCreate } from '@/api/scrape-job'
import { useWebSocket } from '@/composables/useWebSocket'
import type { TMDBSearchResult, TMDBSeries } from '@/api/types'

// 需要选择的文件信息
export interface NeedSelectionInfo {
  file: VideoFileItem
  results: TMDBSearchResult[]
}

// 需要输入季/集的文件信息
export interface NeedSeasonEpisodeInfo {
  file: VideoFileItem
  tmdbId: number
  seriesInfo: TMDBSeries | null
}

export function useScraper() {
  const store = useScraperStore()
  const message = useMessage()
  const { subscribe, registerHandler, unregisterHandler } = useWebSocket()

  // 需要选择的文件
  const pendingSelection = ref<NeedSelectionInfo | null>(null)
  const selectionResolver = ref<((id: number | null) => void) | null>(null)

  // 需要输入季/集的文件
  const pendingSeasonEpisode = ref<NeedSeasonEpisodeInfo | null>(null)
  const seasonEpisodeResolver = ref<((data: { season: number; episode: number } | null) => void) | null>(null)

  // 扫描文件夹
  async function scanFolder(folderPath: string) {
    if (!folderPath) {
      message.warning('请先选择要扫描的文件夹')
      return false
    }

    store.scanLoading = true
    store.resetScan()

    try {
      const response = await filesApi.scan(folderPath)
      store.setScannedFiles(response.files.map((f) => ({ ...f })))
      message.success(`扫描完成，找到 ${response.total_files} 个视频文件`)

      if (response.files.length > 0) {
        await parseFiles()
      }
      return true
    } catch (error) {
      message.error('扫描失败')
      console.error(error)
      return false
    } finally {
      store.scanLoading = false
    }
  }

  // 解析文件名
  async function parseFiles() {
    if (store.scannedFiles.length === 0) return

    store.parseLoading = true
    try {
      const files = store.scannedFiles.map((f) => ({
        filename: f.filename,
        filepath: f.path,
      }))
      const response = await parserApi.parseBatch(files)

      response.results.forEach((parsed, index) => {
        store.updateFileParsed(index, parsed)
      })

      store.autoSelectParsed()
      message.success(`解析完成，识别率 ${(response.success_rate * 100).toFixed(0)}%`)
    } catch (error) {
      message.error('解析失败')
      console.error(error)
    } finally {
      store.parseLoading = false
    }
  }

  // 等待用户选择
  function waitForSelection(file: VideoFileItem, results: TMDBSearchResult[]): Promise<number | null> {
    return new Promise((resolve) => {
      pendingSelection.value = { file, results }
      selectionResolver.value = resolve
    })
  }

  // 用户完成选择
  function resolveSelection(tmdbId: number | null) {
    if (selectionResolver.value) {
      selectionResolver.value(tmdbId)
      selectionResolver.value = null
      pendingSelection.value = null
    }
  }

  // 等待用户输入季/集
  function waitForSeasonEpisode(
    file: VideoFileItem,
    tmdbId: number,
    seriesInfo: TMDBSeries | null
  ): Promise<{ season: number; episode: number } | null> {
    return new Promise((resolve) => {
      pendingSeasonEpisode.value = { file, tmdbId, seriesInfo }
      seasonEpisodeResolver.value = resolve
    })
  }

  // 用户完成季/集输入
  function resolveSeasonEpisode(data: { season: number; episode: number } | null) {
    if (seasonEpisodeResolver.value) {
      seasonEpisodeResolver.value(data)
      seasonEpisodeResolver.value = null
      pendingSeasonEpisode.value = null
    }
  }

  // 执行刮削
  async function executeScrape() {
    // 检查服务状态
    try {
      const status = await scraperApi.getStatus()
      if (!status.ready) {
        message.error(status.message)
        return
      }
    } catch (error) {
      message.error('无法连接刮削服务')
      console.error(error)
      return
    }

    store.startScrape()
    const files = store.selectedFiles

    for (const file of files) {
      // 检查取消
      if (store.isCancelled) {
        break
      }

      // 检查暂停
      while (store.isPaused && !store.isCancelled) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      if (store.isCancelled) break

      store.updateProgress(
        file.filename,
        store.progress.completed,
        store.progress.failed
      )

      try {
        let result
        if (file.tmdbId) {
          // 已手动匹配，直接使用指定 ID
          result = await scraperApi.scrapeFileById({
            file_path: file.path,
            tmdb_id: file.tmdbId,
            season: file.parsed?.season || 1,
            episode: file.parsed?.episode || 1,
          })
        } else {
          // 自动刮削
          result = await scraperApi.scrapeFile({
            file_path: file.path,
            auto_select: true,
          })

          // 需要用户选择
          if (result.status === 'need_selection' && result.search_results) {
            message.info(`${file.filename}: 找到多个匹配，请选择`)

            const selectedId = await waitForSelection(file, result.search_results)

            if (selectedId === null) {
              // 用户跳过
              store.updateProgress(
                file.filename,
                store.progress.completed,
                store.progress.failed + 1
              )
              continue
            }

            // 使用选择的 ID 重新刮削
            result = await scraperApi.scrapeFileById({
              file_path: file.path,
              tmdb_id: selectedId,
              season: file.parsed?.season || 1,
              episode: file.parsed?.episode || 1,
            })
          }

          // 需要用户输入季/集
          if (result.status === 'need_season_episode' && result.selected_id) {
            message.info(`${file.filename}: 请选择集数`)

            const seData = await waitForSeasonEpisode(file, result.selected_id, result.series_info || null)

            if (seData === null) {
              // 用户跳过
              store.updateProgress(
                file.filename,
                store.progress.completed,
                store.progress.failed + 1
              )
              continue
            }

            // 使用输入的季/集重新刮削
            result = await scraperApi.scrapeFileById({
              file_path: file.path,
              tmdb_id: result.selected_id,
              season: seData.season,
              episode: seData.episode,
            })
          }
        }

        if (result.status === 'success') {
          store.updateProgress(
            file.filename,
            store.progress.completed + 1,
            store.progress.failed
          )
        } else {
          store.updateProgress(
            file.filename,
            store.progress.completed,
            store.progress.failed + 1
          )
          message.warning(`${file.filename}: ${result.message}`)
        }
      } catch (error: any) {
        store.updateProgress(
          file.filename,
          store.progress.completed,
          store.progress.failed + 1
        )
        const errorMsg = error.response?.data?.detail || error.message || '未知错误'
        message.error(`${file.filename}: ${errorMsg}`)
      }
    }

    if (!store.isCancelled) {
      store.completeScrape()
      const { completed, failed } = store.progress
      if (failed === 0) {
        message.success(`刮削完成！成功处理 ${completed} 个文件`)
      } else {
        message.warning(`刮削完成！成功 ${completed} 个，失败 ${failed} 个`)
      }
    } else {
      message.warning(`刮削已取消，已处理 ${store.progress.completed} 个文件`)
    }
  }

  /**
   * 异步刮削 - 使用 WebSocket 实时推送进度
   * 前端不会阻塞，可以继续操作
   */
  async function executeScrapeAsync(outputDir: string) {
    // 检查服务状态
    try {
      const status = await scraperApi.getStatus()
      if (!status.ready) {
        message.error(status.message)
        return
      }
    } catch (error) {
      message.error('无法连接刮削服务')
      console.error(error)
      return
    }

    const files = store.selectedFiles
    if (files.length === 0) {
      message.warning('请先选择要刮削的文件')
      return
    }

    // 清理之前的任务
    store.clearWsJobs()

    // 开始刮削
    store.startScrape()

    // 注册 WebSocket 消息处理器
    const handleWsMessage = (msg: any) => {
      const { type, job_id, payload } = msg

      switch (type) {
        case 'job_progress':
          if (job_id && payload) {
            store.updateWsJobProgress(job_id, payload.step, payload.progress, payload.message)
          }
          break

        case 'job_completed':
          if (job_id) {
            store.completeWsJob(job_id, true)
          }
          break

        case 'job_failed':
          if (job_id) {
            store.completeWsJob(job_id, false)
            if (payload?.error) {
              message.warning(`刮削失败: ${payload.error}`)
            }
          }
          break

        case 'need_action':
          if (job_id && payload) {
            store.setWsJobNeedAction(job_id)
            // 触发用户交互弹窗
            handleNeedAction(job_id, payload)
          }
          break
      }
    }

    registerHandler(handleWsMessage)

    try {
      // 批量创建刮削任务
      const jobIds: string[] = []

      for (const file of files) {
        const jobData: ScrapeJobCreate = {
          file_path: file.path,
          output_dir: outputDir,
          source: 'manual',
        }

        try {
          const job = await scrapeJobApi.create(jobData)
          if (job) {
            jobIds.push(job.id)
            store.addWsJob(job.id, file.path)
          }
        } catch (error) {
          console.error(`创建任务失败: ${file.path}`, error)
          store.progress.failed++
        }
      }

      // 订阅所有任务的进度
      if (jobIds.length > 0) {
        subscribe(jobIds)
        message.info(`已创建 ${jobIds.length} 个刮削任务，正在后台处理...`)
      }
    } catch (error) {
      console.error('批量创建任务失败:', error)
      message.error('创建刮削任务失败')
      store.completeScrape()
      unregisterHandler(handleWsMessage)
    }
  }

  /**
   * 处理需要用户操作的情况
   */
  function handleNeedAction(jobId: string, payload: any) {
    const { action_type, options } = payload

    switch (action_type) {
      case 'need_selection':
        // 需要选择匹配结果
        if (options?.search_results) {
          // 找到对应的文件
          const job = store.wsJobs.get(jobId)
          if (job) {
            const file = store.scannedFiles.find(f => f.path === job.filePath)
            if (file) {
              pendingSelection.value = {
                file,
                results: options.search_results,
              }
              // 存储 jobId 以便后续处理
              ;(pendingSelection.value as any).jobId = jobId
            }
          }
        }
        break

      case 'need_season_episode':
        // 需要输入季/集
        if (options) {
          const job = store.wsJobs.get(jobId)
          if (job) {
            const file = store.scannedFiles.find(f => f.path === job.filePath)
            if (file) {
              pendingSeasonEpisode.value = {
                file,
                tmdbId: options.tmdb_id,
                seriesInfo: options.series_info,
              }
              ;(pendingSeasonEpisode.value as any).jobId = jobId
            }
          }
        }
        break

      default:
        console.warn(`未知的操作类型: ${action_type}`)
    }
  }

  return {
    scanFolder,
    parseFiles,
    executeScrape,
    executeScrapeAsync,
    pendingSelection,
    resolveSelection,
    pendingSeasonEpisode,
    resolveSeasonEpisode,
  }
}
