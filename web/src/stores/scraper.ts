import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScannedFile, ParsedInfo } from '@/api/types'

export interface VideoFileItem extends ScannedFile {
  parsed?: ParsedInfo
  tmdbId?: number
  tmdbName?: string
}

export type ScrapeStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled'

export interface ScrapeProgress {
  total: number
  completed: number
  failed: number
  current: string
  status: ScrapeStatus
  startTime?: number
  estimatedRemaining?: number
}

// WebSocket 任务进度
export interface WsJobProgress {
  jobId: string
  filePath: string
  step: string
  progress: number
  message: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'need_action'
}

export const useScraperStore = defineStore('scraper', () => {
  // 扫描状态
  const scannedFiles = ref<VideoFileItem[]>([])
  const checkedKeys = ref<string[]>([])
  const hasScanned = ref(false)
  const scanLoading = ref(false)
  const parseLoading = ref(false)

  // 刮削状态
  const isScraping = ref(false)
  const isPaused = ref(false)
  const isCancelled = ref(false)
  const progress = ref<ScrapeProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    current: '',
    status: 'idle',
  })

  // WebSocket 任务状态
  const wsJobs = ref<Map<string, WsJobProgress>>(new Map())
  const activeJobIds = ref<string[]>([])

  // 计算属性
  const stats = computed(() => {
    const total = scannedFiles.value.length
    const parsed = scannedFiles.value.filter((f) => f.parsed?.is_parsed).length
    const selected = checkedKeys.value.length
    return { total, parsed, selected }
  })

  const selectedFiles = computed(() =>
    scannedFiles.value.filter((f) => checkedKeys.value.includes(f.path))
  )

  // Actions
  function setScannedFiles(files: VideoFileItem[]) {
    scannedFiles.value = files
    hasScanned.value = true
  }

  function updateFileParsed(index: number, parsed: ParsedInfo) {
    if (scannedFiles.value[index]) {
      scannedFiles.value[index].parsed = parsed
    }
  }

  function setCheckedKeys(keys: string[]) {
    checkedKeys.value = keys
  }

  function autoSelectParsed() {
    checkedKeys.value = scannedFiles.value
      .filter((f) => f.parsed?.is_parsed)
      .map((f) => f.path)
  }

  function setFileMatch(path: string, tmdbId: number, tmdbName: string) {
    const file = scannedFiles.value.find((f) => f.path === path)
    if (file) {
      file.tmdbId = tmdbId
      file.tmdbName = tmdbName
      if (!checkedKeys.value.includes(path)) {
        checkedKeys.value.push(path)
      }
    }
  }

  function resetScan() {
    scannedFiles.value = []
    checkedKeys.value = []
    hasScanned.value = false
  }

  function startScrape() {
    isScraping.value = true
    isPaused.value = false
    isCancelled.value = false
    progress.value = {
      total: selectedFiles.value.length,
      completed: 0,
      failed: 0,
      current: '',
      status: 'running',
      startTime: Date.now(),
    }
  }

  function pauseScrape() {
    isPaused.value = true
    progress.value.status = 'paused'
  }

  function resumeScrape() {
    isPaused.value = false
    progress.value.status = 'running'
  }

  function cancelScrape() {
    isCancelled.value = true
    isPaused.value = false
    progress.value.status = 'cancelled'
  }

  function completeScrape() {
    isScraping.value = false
    progress.value.status = 'completed'
    progress.value.current = ''
  }

  function updateProgress(current: string, completed: number, failed: number) {
    progress.value.current = current
    progress.value.completed = completed
    progress.value.failed = failed

    // 计算预计剩余时间
    if (progress.value.startTime) {
      const elapsed = (Date.now() - progress.value.startTime) / 1000
      const processed = completed + failed
      if (processed > 0) {
        const avgTime = elapsed / processed
        progress.value.estimatedRemaining = (progress.value.total - processed) * avgTime
      }
    }
  }

  // WebSocket 任务管理方法
  function addWsJob(jobId: string, filePath: string) {
    wsJobs.value.set(jobId, {
      jobId,
      filePath,
      step: 'pending',
      progress: 0,
      message: '等待处理',
      status: 'pending',
    })
    activeJobIds.value.push(jobId)
  }

  function updateWsJobProgress(jobId: string, step: string, progressVal: number, message: string) {
    const job = wsJobs.value.get(jobId)
    if (job) {
      job.step = step
      job.progress = progressVal
      job.message = message
      job.status = 'running'
      // 更新总进度的当前文件
      progress.value.current = message
    }
  }

  function completeWsJob(jobId: string, success: boolean) {
    const job = wsJobs.value.get(jobId)
    if (job) {
      job.status = success ? 'success' : 'failed'
      job.progress = 100
      // 更新总进度
      if (success) {
        progress.value.completed++
      } else {
        progress.value.failed++
      }
      // 从活跃列表移除
      const idx = activeJobIds.value.indexOf(jobId)
      if (idx > -1) {
        activeJobIds.value.splice(idx, 1)
      }
      // 检查是否全部完成
      if (activeJobIds.value.length === 0 && isScraping.value) {
        completeScrape()
      }
    }
  }

  function setWsJobNeedAction(jobId: string) {
    const job = wsJobs.value.get(jobId)
    if (job) {
      job.status = 'need_action'
    }
  }

  function clearWsJobs() {
    wsJobs.value.clear()
    activeJobIds.value = []
  }

  return {
    // State
    scannedFiles,
    checkedKeys,
    hasScanned,
    scanLoading,
    parseLoading,
    isScraping,
    isPaused,
    isCancelled,
    progress,
    wsJobs,
    activeJobIds,
    // Computed
    stats,
    selectedFiles,
    // Actions
    setScannedFiles,
    updateFileParsed,
    setCheckedKeys,
    autoSelectParsed,
    setFileMatch,
    resetScan,
    startScrape,
    pauseScrape,
    resumeScrape,
    cancelScrape,
    completeScrape,
    updateProgress,
    // WebSocket Actions
    addWsJob,
    updateWsJobProgress,
    completeWsJob,
    setWsJobNeedAction,
    clearWsJobs,
  }
})
