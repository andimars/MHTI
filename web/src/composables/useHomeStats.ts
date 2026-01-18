import { ref, computed, onMounted } from 'vue'
import { historyApi } from '@/api/history'
import type { HistoryRecord } from '@/api/types'

export function useHomeStats() {
  const loading = ref(false)
  const records = ref<HistoryRecord[]>([])
  const totalTasks = ref(0)

  const successCount = computed(() =>
    records.value.filter(r => r.status === 'success').length
  )

  const failedCount = computed(() =>
    records.value.filter(r => r.status === 'failed').length
  )

  const recentTasks = computed(() => records.value.slice(0, 10))

  // 近7天每日任务统计
  const weeklyStats = computed(() => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const result: { label: string; value: number }[] = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const count = records.value.filter(r => {
        const execTime = new Date(r.executed_at)
        return execTime >= dayStart && execTime <= dayEnd
      }).length

      result.push({
        label: i === 0 ? '今天' : (days[dayStart.getDay()] ?? ''),
        value: count
      })
    }
    return result
  })

  async function refresh() {
    loading.value = true
    try {
      const historyRes = await historyApi.listRecords({ page_size: 50 })
      records.value = historyRes.records
      totalTasks.value = historyRes.total
    } catch (e) {
      console.error('Failed to load home stats:', e)
    } finally {
      loading.value = false
    }
  }

  onMounted(refresh)

  return {
    loading,
    totalTasks,
    successCount,
    failedCount,
    recentTasks,
    weeklyStats,
    refresh,
  }
}
