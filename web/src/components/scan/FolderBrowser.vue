<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NCard,
  NInput,
  NButton,
  NSpace,
  NIcon,
  NSpin,
  NEmpty,
  NInputGroup,
  useMessage,
} from 'naive-ui'
import {
  FolderOutline,
  ArrowUpOutline,
  RefreshOutline,
} from '@vicons/ionicons5'
import { filesApi } from '@/api/files'
import type { DirectoryEntry } from '@/api/types'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [path: string]
}>()

const message = useMessage()
const loading = ref(false)
const currentPath = ref('')
const parentPath = ref<string | null>(null)
const entries = ref<DirectoryEntry[]>([])
const inputPath = ref('')

// 双向绑定
const selectedPath = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 加载目录
const loadDirectory = async (path: string = '') => {
  loading.value = true
  try {
    const response = await filesApi.browse(path)
    currentPath.value = response.current_path
    parentPath.value = response.parent_path
    entries.value = response.entries
    inputPath.value = response.current_path
  } catch (error) {
    message.error('加载目录失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 进入目录
const enterDirectory = (entry: DirectoryEntry) => {
  if (entry.is_dir) {
    loadDirectory(entry.path)
  }
}

// 返回上级
const goUp = () => {
  if (parentPath.value !== null) {
    loadDirectory(parentPath.value)
  }
}

// 刷新
const refresh = () => {
  loadDirectory(currentPath.value)
}

// 通过输入路径跳转
const goToPath = () => {
  if (inputPath.value) {
    loadDirectory(inputPath.value)
  }
}

// 选择当前目录
const selectCurrentPath = () => {
  selectedPath.value = currentPath.value
  emit('select', currentPath.value)
}

// 只显示目录
const directories = computed(() => {
  return entries.value.filter((e) => e.is_dir)
})

// 监听外部路径变化
watch(
  () => props.modelValue,
  (newPath) => {
    if (newPath && newPath !== currentPath.value) {
      loadDirectory(newPath)
    }
  },
  { immediate: true }
)

// 初始加载
loadDirectory('')
</script>

<template>
  <NCard title="选择文件夹" size="small">
    <template #header-extra>
      <NSpace>
        <NButton quaternary circle size="small" @click="refresh" :loading="loading">
          <template #icon>
            <NIcon :component="RefreshOutline" />
          </template>
        </NButton>
      </NSpace>
    </template>

    <NSpace vertical>
      <!-- 路径输入 -->
      <NInputGroup>
        <NInput
          v-model:value="inputPath"
          placeholder="输入路径"
          @keyup.enter="goToPath"
        />
        <NButton type="primary" @click="goToPath">跳转</NButton>
      </NInputGroup>

      <!-- 当前选择 -->
      <NSpace v-if="selectedPath">
        <span>已选择: {{ selectedPath }}</span>
      </NSpace>

      <!-- 目录列表 -->
      <NSpin :show="loading">
        <div class="folder-list">
          <!-- 返回上级 -->
          <div
            v-if="parentPath !== null"
            class="folder-item"
            @click="goUp"
          >
            <NIcon :component="ArrowUpOutline" size="20" />
            <span class="folder-name">..</span>
          </div>

          <!-- 空目录 -->
          <NEmpty v-if="directories.length === 0 && !loading" description="目录为空" />

          <!-- 目录项 -->
          <div
            v-for="entry in directories"
            :key="entry.path"
            class="folder-item"
            @click="enterDirectory(entry)"
          >
            <NIcon :component="FolderOutline" size="20" />
            <span class="folder-name">{{ entry.name }}</span>
          </div>
        </div>
      </NSpin>

      <!-- 选择按钮 -->
      <NButton
        type="primary"
        block
        :disabled="!currentPath"
        @click="selectCurrentPath"
      >
        选择此文件夹
      </NButton>
    </NSpace>
  </NCard>
</template>

<style scoped>
.folder-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--n-border-color);
  border-radius: 4px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.folder-item:hover {
  background-color: var(--n-color-hover);
}

.folder-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
