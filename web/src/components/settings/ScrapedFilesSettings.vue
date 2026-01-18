<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NCard,
  NDataTable,
  NButton,
  NSpace,
  NInput,
  NPagination,
  NPopconfirm,
  NEmpty,
  useMessage,
  useDialog,
  type DataTableColumns,
} from 'naive-ui'
import { scrapedFilesApi, type ScrapedFile } from '@/api/scraped-files'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const records = ref<ScrapedFile[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const checkedRowKeys = ref<string[]>([])

// 格式化文件大小
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 获取文件名
function getFileName(path: string): string {
  return path.split(/[/\\]/).pop() || path
}

const columns: DataTableColumns<ScrapedFile> = [
  {
    type: 'selection',
  },
  {
    title: '文件名',
    key: 'source_path',
    ellipsis: { tooltip: true },
    render: (row) => getFileName(row.source_path),
  },
  {
    title: '剧集',
    key: 'title',
    width: 150,
    ellipsis: { tooltip: true },
    render: (row) => row.title || '-',
  },
  {
    title: '季/集',
    key: 'episode',
    width: 80,
    render: (row) => {
      if (row.season && row.episode) {
        return `S${String(row.season).padStart(2, '0')}E${String(row.episode).padStart(2, '0')}`
      }
      return '-'
    },
  },
  {
    title: '大小',
    key: 'file_size',
    width: 100,
    render: (row) => formatSize(row.file_size),
  },
  {
    title: '刮削时间',
    key: 'scraped_at',
    width: 170,
    render: (row) => formatDate(row.scraped_at),
  },
]

async function loadData() {
  loading.value = true
  try {
    const response = await scrapedFilesApi.list({
      page: page.value,
      page_size: pageSize.value,
      search: search.value || undefined,
    })
    records.value = response.records
    total.value = response.total
  } catch (error) {
    message.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  loadData()
}

async function handleDelete() {
  if (checkedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的记录')
    return
  }

  try {
    const result = await scrapedFilesApi.delete(checkedRowKeys.value)
    message.success(`已删除 ${result.deleted} 条记录，对应文件可重新刮削`)
    checkedRowKeys.value = []
    loadData()
  } catch (error) {
    message.error('删除失败')
    console.error(error)
  }
}

function handleClearAll() {
  dialog.warning({
    title: '确认清空',
    content: '确定要清空所有已刮削文件记录吗？清空后所有文件都可以重新刮削。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const result = await scrapedFilesApi.clearAll()
        message.success(`已清空 ${result.deleted} 条记录`)
        loadData()
      } catch (error) {
        message.error('清空失败')
        console.error(error)
      }
    },
  })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <NCard title="已刮削文件记录" size="small">
    <template #header-extra>
      <NSpace>
        <NInput
          v-model:value="search"
          placeholder="搜索文件名或剧集"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <NButton @click="handleSearch">搜索</NButton>
      </NSpace>
    </template>

    <div class="description">
      <p>已刮削的文件会被记录在此，扫描时会自动跳过这些文件。</p>
      <p>如需重新刮削某个文件，请删除对应的记录。</p>
    </div>

    <NDataTable
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="records"
      :loading="loading"
      :row-key="(row: ScrapedFile) => row.id"
      size="small"
      :bordered="false"
      style="margin-top: 16px"
    >
      <template #empty>
        <NEmpty description="暂无已刮削文件记录" />
      </template>
    </NDataTable>

    <div class="footer">
      <NSpace>
        <NPopconfirm @positive-click="handleDelete">
          <template #trigger>
            <NButton
              :disabled="checkedRowKeys.length === 0"
              type="warning"
              size="small"
            >
              删除选中 ({{ checkedRowKeys.length }})
            </NButton>
          </template>
          确定删除选中的 {{ checkedRowKeys.length }} 条记录吗？
        </NPopconfirm>
        <NButton type="error" size="small" @click="handleClearAll">
          清空全部
        </NButton>
      </NSpace>

      <NPagination
        v-if="total > pageSize"
        v-model:page="page"
        :page-size="pageSize"
        :item-count="total"
        size="small"
        @update:page="handlePageChange"
      />
    </div>
  </NCard>
</template>

<style scoped>
.description {
  color: var(--n-text-color3);
  font-size: 13px;
  line-height: 1.6;
}

.description p {
  margin: 0;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}
</style>
