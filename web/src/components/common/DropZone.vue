<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NIcon, NText } from 'naive-ui'
import { FolderOpenOutline } from '@vicons/ionicons5'

const emit = defineEmits<{
  drop: [path: string]
}>()

const isDragging = ref(false)

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const items = e.dataTransfer?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item) continue
    // 尝试获取文件系统入口（Tauri/Electron 环境）
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        // 在 Tauri 环境中，可以通过 webkitRelativePath 或其他方式获取路径
        // 这里使用 file.path（如果可用）
        const path = (file as File & { path?: string }).path
        if (path) {
          emit('drop', path)
          return
        }
      }
    }
  }

  // 如果无法获取路径，提示用户使用文件夹浏览器
  console.warn('无法获取拖拽路径，请使用文件夹浏览器')
}
</script>

<template>
  <div
    class="drop-zone"
    :class="{ dragging: isDragging }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <NCard :bordered="false" class="drop-card">
      <div class="drop-content">
        <NIcon :component="FolderOpenOutline" :size="64" />
        <NText class="drop-text">
          {{ isDragging ? '释放以选择文件夹' : '拖拽文件夹到此处' }}
        </NText>
        <NText depth="3" class="drop-hint">
          或点击下方按钮选择文件夹
        </NText>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed var(--n-border-color);
  border-radius: 8px;
  transition: all 0.3s;
}

.drop-zone.dragging {
  border-color: var(--n-primary-color);
  background-color: var(--n-primary-color-hover);
}

.drop-card {
  background: transparent;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.drop-text {
  font-size: 18px;
  font-weight: 500;
}

.drop-hint {
  font-size: 14px;
}
</style>
