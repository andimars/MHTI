<script setup lang="ts">
import { ref, h, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NSpace,
  NButton,
  NDataTable,
  NTag,
  NInput,
  NSelect,
  NIcon,
  NPagination,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
  type DataTableRowKey,
} from 'naive-ui'
import {
  AddOutline,
  TrashOutline,
  SearchOutline,
  ListOutline,
} from '@vicons/ionicons5'
import { manualJobApi } from '@/api/manual-job'
import type { ManualJob, ManualJobStatus } from '@/api/types'
import { LinkMode } from '@/api/types'
import ManualJobCreateModal from '@/components/scan/ManualJobCreateModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const jobs = ref<ManualJob[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const statusFilter = ref<ManualJobStatus | null>(null)
const checkedRowKeys = ref<DataTableRowKey[]>([])
const showCreateModal = ref(false)

let refreshTimer: ReturnType<typeof setInterval> | null = null

// 状态选项
const statusOptions = [
  { label: '全部', value: null },
  { label: '等待中', value: 'pending' },
  { label: '运行中', value: 'running' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '已取消', value: 'cancelled' },
]

// 整理模式映射
const linkModeMap: Record<number, { label: string; type: 'success' | 'info' | 'warning' | 'default' }> = {
  [LinkMode.HARDLINK]: { label: '硬链接', type: 'info' },
  [LinkMode.MOVE]: { label: '移动', type: 'warning' },
  [LinkMode.COPY]: { label: '复制', type: 'success' },
  [LinkMode.SYMLINK]: { label: '软链接', type: 'default' },
}

// 状态映射
const statusMap: Record<string, { label: string; type: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
  pending: { label: '等待中', type: 'default' },
  running: { label: '运行中', type: 'info' },
  success: { label: '成功', type: 'success' },
  failed: { label: '失败', type: 'error' },
  cancelled: { label: '已取消', type: 'warning' },
}

// 格式化时间
const formatTime = (time: string | null) => {
  if (!time) return '-'
  return time.replace('T', ' ').slice(0, 19)
}

// 计算用时
const formatDuration = (job: ManualJob) => {
  if (!job.started_at) return '-'
  const start = new Date(job.started_at).getTime()
  const end = job.finished_at ? new Date(job.finished_at).getTime() : Date.now()
  const seconds = (end - start) / 1000
  return `${seconds.toFixed(2)}s`
}

// 跳转到历史记录
const goToHistory = (job: ManualJob) => {
  router.push({ path: '/history', query: { manual_job_id: job.id } })
}

// 表格列
const columns: DataTableColumns<ManualJob> = [
  { type: 'selection' },
  { title: '#', key: 'id', width: 60 },
  {
    title: '扫描目录',
    key: 'scan_path',
    ellipsis: { tooltip: true },
    width: 180,
  },
  {
    title: '整理目录',
    key: 'target_folder',
    ellipsis: { tooltip: true },
    width: 180,
  },
  {
    title: '整理模式',
    key: 'link_mode',
    width: 90,
    render: (row) => {
      const mode = linkModeMap[row.link_mode] || { label: '未知', type: 'default' }
      return h(NTag, { type: mode.type, size: 'small' }, { default: () => mode.label })
    },
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 160,
    render: (row) => formatTime(row.created_at),
  },
  {
    title: '用时',
    key: 'duration',
    width: 80,
    render: (row) => formatDuration(row),
  },
  {
    title: '进度',
    key: 'progress',
    width: 200,
    render: (row) =>
      h(NSpace, { size: 4 }, {
        default: () => [
          h(NTag, { type: 'success', size: 'small' }, { default: () => `成功: ${row.success_count}` }),
          h(NTag, { type: 'default', size: 'small' }, { default: () => `跳过: ${row.skip_count}` }),
          h(NTag, { type: 'error', size: 'small' }, { default: () => `错误: ${row.error_count}` }),
          h(NTag, { type: 'info', size: 'small' }, { default: () => `总数: ${row.total_count}` }),
        ],
      }),
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => {
      const status = statusMap[row.status] || { label: row.status, type: 'default' }
      return h(NTag, { type: status.type, size: 'small' }, { default: () => status.label })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          quaternary: true,
          onClick: () => goToHistory(row),
        },
        {
          icon: () => h(NIcon, { component: ListOutline }),
          default: () => '记录',
        }
      ),
  },
]

// 加载数据
const loadJobs = async () => {
  loading.value = true
  try {
    const response = await manualJobApi.list({
      page: page.value,
      page_size: pageSize.value,
      search: search.value || undefined,
      status: statusFilter.value,
    })
    jobs.value = response.jobs
    total.value = response.total
  } catch (error) {
    message.error('加载失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  page.value = 1
  loadJobs()
}

// 状态筛选
const handleStatusChange = (value: ManualJobStatus | null) => {
  statusFilter.value = value
  page.value = 1
  loadJobs()
}

// 分页
const handlePageChange = (p: number) => {
  page.value = p
  loadJobs()
}

// 批量删除
const handleBatchDelete = async () => {
  if (checkedRowKeys.value.length === 0) return

  try {
    await manualJobApi.delete(checkedRowKeys.value as number[])
    message.success('删除成功')
    checkedRowKeys.value = []
    loadJobs()
  } catch (error) {
    message.error('删除失败')
    console.error(error)
  }
}

// 创建任务成功
const handleCreateSuccess = () => {
  showCreateModal.value = false
  loadJobs()
  message.success('任务已创建')
}

// 选中行变化
const handleCheckedRowKeysChange = (keys: DataTableRowKey[]) => {
  checkedRowKeys.value = keys
}

// 是否有运行中的任务
const hasRunningJobs = computed(() => jobs.value.some((j) => j.status === 'running' || j.status === 'pending'))

onMounted(() => {
  loadJobs()
  // 定时刷新（有运行中任务时）
  refreshTimer = setInterval(() => {
    if (hasRunningJobs.value) {
      loadJobs()
    }
  }, 3000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<template>
  <div class="scan-page">
    <!-- 主卡片 -->
    <NCard class="main-card glass-card">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <NInput
            v-model:value="search"
            placeholder="搜索目录"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <NIcon :component="SearchOutline" />
            </template>
          </NInput>
          <NSelect
            :value="statusFilter"
            :options="statusOptions"
            placeholder="状态"
            class="status-select"
            @update:value="handleStatusChange"
          />
        </div>
        <div class="toolbar-right">
          <NButton type="primary" @click="showCreateModal = true">
            <template #icon>
              <NIcon :component="AddOutline" />
            </template>
            创建任务
          </NButton>
          <NPopconfirm @positive-click="handleBatchDelete">
            <template #trigger>
              <NButton :disabled="checkedRowKeys.length === 0" quaternary>
                <template #icon>
                  <NIcon :component="TrashOutline" />
                </template>
              </NButton>
            </template>
            确定删除选中的 {{ checkedRowKeys.length }} 条记录？
          </NPopconfirm>
        </div>
      </div>

      <!-- 表格 -->
      <NDataTable
        v-if="jobs.length > 0 || loading"
        :columns="columns"
        :data="jobs"
        :loading="loading"
        :row-key="(row: ManualJob) => row.id"
        :checked-row-keys="checkedRowKeys"
        @update:checked-row-keys="handleCheckedRowKeysChange"
      />

      <!-- 空状态 -->
      <EmptyState
        v-else
        title="暂无任务"
        description="创建一个新的刮削任务开始吧"
        action-text="创建任务"
        @action="showCreateModal = true"
      />

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination">
        <NPagination
          v-model:page="page"
          :page-size="pageSize"
          :item-count="total"
          @update:page="handlePageChange"
        />
      </div>
    </NCard>

    <!-- 创建任务弹窗 -->
    <ManualJobCreateModal
      v-model:show="showCreateModal"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<style scoped>
.scan-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* 毛玻璃卡片 */
.glass-card {
  border: none;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:global(.dark) .glass-card {
  background: rgba(30, 41, 59, 0.7);
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 260px;
}

.status-select {
  width: 120px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 表格样式 */
.scan-page :deep(.n-data-table) {
  border-radius: 8px;
}

.scan-page :deep(.n-data-table-th) {
  font-weight: 600;
}

.scan-page :deep(.n-data-table-tr:hover) {
  background: var(--n-color-hover);
}

/* 按钮样式 */
.scan-page :deep(.n-button--primary-type) {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.scan-page :deep(.n-button--primary-type:hover) {
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

/* 响应式 */
@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  .search-input {
    flex: 1;
  }

  .toolbar-right {
    justify-content: flex-end;
  }
}
</style>
