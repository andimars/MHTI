<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NButton,
  NSwitch,
  NFormItem,
  NRadioGroup,
  NRadio,
  NAlert,
  NIcon,
  NList,
  NListItem,
  NEmpty,
  useMessage,
} from 'naive-ui'
import { FolderOutline, AddOutline, TrashOutline } from '@vicons/ionicons5'
import { configApi } from '@/api/config'
import type { WatcherMode } from '@/api/types'
import FolderBrowserModal from '@/components/scan/FolderBrowserModal.vue'

const message = useMessage()
const loading = ref(false)
const saving = ref(false)

const enabled = ref(false)
const mode = ref<WatcherMode>('realtime')
const performanceMode = ref(false)
const watchDirs = ref<string[]>([])

// 文件夹浏览器状态
const showFolderBrowser = ref(false)

const loadConfig = async () => {
  loading.value = true
  try {
    const config = await configApi.getWatcherConfig()
    enabled.value = config.enabled
    mode.value = config.mode
    performanceMode.value = config.performance_mode
    watchDirs.value = config.watch_dirs
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    await configApi.saveWatcherConfig({
      enabled: enabled.value,
      mode: mode.value,
      performance_mode: performanceMode.value,
      watch_dirs: watchDirs.value,
    })
    message.success('监控配置已保存')
  } catch (error) {
    message.error('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 添加监控目录
const handleAddDir = (path: string) => {
  if (path && !watchDirs.value.includes(path)) {
    watchDirs.value.push(path)
  }
}

// 删除监控目录
const handleRemoveDir = (index: number) => {
  watchDirs.value.splice(index, 1)
}

onMounted(loadConfig)
</script>

<template>
  <NCard title="监控配置" size="small">
    <NSpace vertical size="large">
      <NFormItem label="启用目录监控" label-placement="left">
        <NSwitch v-model:value="enabled" />
        <span style="margin-left: 8px; color: #999">自动监控指定目录的新文件</span>
      </NFormItem>

      <NFormItem label="监控模式">
        <NRadioGroup v-model:value="mode">
          <NSpace vertical>
            <NRadio value="realtime">
              <span>实时模式</span>
              <span style="color: #999; margin-left: 8px">实时监听文件系统事件，响应及时</span>
            </NRadio>
            <NRadio value="compat">
              <span>兼容模式</span>
              <span style="color: #999; margin-left: 8px">定时扫描检查变动，兼容性强</span>
            </NRadio>
          </NSpace>
        </NRadioGroup>
      </NFormItem>

      <NAlert v-if="mode === 'compat'" type="info" style="margin-bottom: 12px">
        群晖系统、SMB/NFS 等远程文件系统挂载、以及出现监控不工作问题时，请使用兼容模式
      </NAlert>

      <NFormItem label="性能模式" label-placement="left">
        <NSwitch v-model:value="performanceMode" />
        <span style="margin-left: 8px; color: #999">减少资源占用，适合大量文件监控</span>
      </NFormItem>

      <NFormItem label="监控目录">
        <NSpace vertical style="width: 100%">
          <div class="dir-list-header">
            <span class="dir-count">已添加 {{ watchDirs.length }} 个目录</span>
            <NButton size="small" @click="showFolderBrowser = true">
              <template #icon>
                <NIcon :component="AddOutline" />
              </template>
              添加目录
            </NButton>
          </div>

          <div class="dir-list">
            <NEmpty v-if="watchDirs.length === 0" description="暂无监控目录" size="small" />
            <NList v-else hoverable>
              <NListItem v-for="(dir, index) in watchDirs" :key="dir">
                <div class="dir-item">
                  <NIcon :component="FolderOutline" :size="18" class="dir-icon" />
                  <span class="dir-path">{{ dir }}</span>
                  <NButton
                    quaternary
                    circle
                    size="small"
                    type="error"
                    @click="handleRemoveDir(index)"
                  >
                    <template #icon>
                      <NIcon :component="TrashOutline" />
                    </template>
                  </NButton>
                </div>
              </NListItem>
            </NList>
          </div>
        </NSpace>
      </NFormItem>

      <NSpace>
        <NButton type="primary" :loading="saving" @click="saveConfig">
          保存配置
        </NButton>
      </NSpace>
    </NSpace>
  </NCard>

  <!-- 文件夹选择弹窗 -->
  <FolderBrowserModal
    v-model:show="showFolderBrowser"
    title="添加监控目录"
    @confirm="handleAddDir"
  />
</template>

<style scoped>
.dir-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dir-count {
  font-size: 13px;
  color: #999;
}

.dir-list {
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  min-height: 100px;
  max-height: 240px;
  overflow-y: auto;
}

.dir-list :deep(.n-empty) {
  padding: 24px;
}

.dir-list :deep(.n-list) {
  background: transparent;
}

.dir-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.dir-icon {
  color: #f59e0b;
  flex-shrink: 0;
}

.dir-path {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
