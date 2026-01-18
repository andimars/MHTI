<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  NModal,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSwitch,
  NButton,
  NSpace,
  NIcon,
  NDivider,
  useMessage,
} from 'naive-ui'
import {
  FolderOutline,
  SettingsOutline,
  CloseOutline,
} from '@vicons/ionicons5'
import { manualJobApi } from '@/api/manual-job'
import { watcherApi } from '@/api/watcher'
import { configApi } from '@/api/config'
import { LinkMode } from '@/api/types'
import type { WatchedFolder, ManualJobAdvancedSettings, OrganizeConfig } from '@/api/types'
import FolderBrowserModal from './FolderBrowserModal.vue'
import AdvancedSettingsModal from './AdvancedSettingsModal.vue'

const props = defineProps<{
  show: boolean
  initialScanPath?: string  // 初始扫描路径
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'success'): void
}>()

const message = useMessage()
const submitting = ref(false)
const watchedFolders = ref<WatchedFolder[]>([])
const globalOrganizeConfig = ref<OrganizeConfig | null>(null)

// 文件夹选择弹窗状态
const showScanPathBrowser = ref(false)
const showTargetFolderBrowser = ref(false)
const showMetadataDirBrowser = ref(false)
const showAdvancedSettings = ref(false)

// 高级设置数据
const advancedSettings = ref<ManualJobAdvancedSettings | null>(null)

// 表单数据
const formData = ref({
  scan_path: '',
  target_folder: '',
  metadata_dir: '',
  link_mode: LinkMode.MOVE as LinkMode,
  delete_empty_parent: true,
  config_reuse_id: null as number | null,
})

// 整理模式选项
const linkModeOptions = [
  { label: '硬链接', value: LinkMode.HARDLINK },
  { label: '移动', value: LinkMode.MOVE },
  { label: '复制', value: LinkMode.COPY },
  { label: '软链接', value: LinkMode.SYMLINK },
]

// 配置复用选项
const configReuseOptions = computed(() => {
  const options: Array<{ label: string; value: number | null }> = [{ label: '不复用', value: null }]
  watchedFolders.value.forEach((folder) => {
    options.push({ label: folder.path, value: parseInt(folder.id) })
  })
  return options
})

// 是否显示移动模式选项
const showMoveOptions = computed(() => formData.value.link_mode === LinkMode.MOVE)

// 加载监控目录
const loadWatchedFolders = async () => {
  try {
    const response = await watcherApi.listFolders()
    watchedFolders.value = response.folders
  } catch (error) {
    console.error('加载监控目录失败:', error)
  }
}

// 加载全局配置
const loadGlobalConfig = async () => {
  try {
    globalOrganizeConfig.value = await configApi.getOrganizeConfig()
  } catch (error) {
    console.error('加载全局配置失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    scan_path: '',
    target_folder: '',
    metadata_dir: '',
    link_mode: LinkMode.MOVE,
    delete_empty_parent: true,
    config_reuse_id: null,
  }
  advancedSettings.value = null
}

// 关闭弹窗
const handleClose = () => {
  emit('update:show', false)
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!formData.value.scan_path.trim()) {
    message.warning('请输入刮削路径')
    return
  }
  if (!formData.value.target_folder.trim()) {
    message.warning('请输入整理目录')
    return
  }

  submitting.value = true
  try {
    await manualJobApi.create({
      scan_path: formData.value.scan_path.trim(),
      target_folder: formData.value.target_folder.trim(),
      metadata_dir: formData.value.metadata_dir.trim(),
      link_mode: formData.value.link_mode,
      delete_empty_parent: formData.value.delete_empty_parent,
      config_reuse_id: formData.value.config_reuse_id,
      advanced_settings: advancedSettings.value,
    })
    emit('success')
    handleClose()
  } catch (error) {
    message.error('创建任务失败')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

// 配置复用变化时自动填充全局配置
watch(() => formData.value.config_reuse_id, (newVal) => {
  if (newVal !== null && globalOrganizeConfig.value) {
    const folder = watchedFolders.value.find((f) => parseInt(f.id) === newVal)
    if (folder) {
      // 使用监控目录路径作为扫描路径
      formData.value.scan_path = folder.path
    }
    // 使用全局配置填充整理目录和元数据目录
    const config = globalOrganizeConfig.value
    if (config.organize_dir) {
      formData.value.target_folder = config.organize_dir
    }
    if (config.metadata_dir) {
      formData.value.metadata_dir = config.metadata_dir
    }
    // 设置整理模式
    const modeMap: Record<string, LinkMode> = {
      copy: LinkMode.COPY,
      move: LinkMode.MOVE,
      hardlink: LinkMode.HARDLINK,
      symlink: LinkMode.SYMLINK,
    }
    formData.value.link_mode = modeMap[config.organize_mode] || LinkMode.MOVE
    formData.value.delete_empty_parent = config.auto_clean_source
  }
})

onMounted(() => {
  loadWatchedFolders()
  loadGlobalConfig()
})

// 监听弹窗打开，设置初始扫描路径
watch(() => props.show, (newVal) => {
  if (newVal && props.initialScanPath) {
    formData.value.scan_path = props.initialScanPath
  }
})

// 处理刮削路径选择
const handleScanPathConfirm = (path: string) => {
  formData.value.scan_path = path
}

// 处理整理目录选择
const handleTargetFolderConfirm = (path: string) => {
  formData.value.target_folder = path
}

// 处理元数据目录选择
const handleMetadataDirConfirm = (path: string) => {
  formData.value.metadata_dir = path
}

// 处理高级设置确认
const handleAdvancedSettingsConfirm = (settings: ManualJobAdvancedSettings) => {
  advancedSettings.value = settings
}
</script>

<template>
  <NModal
    :show="show"
    :mask-closable="false"
    transform-origin="center"
    @update:show="emit('update:show', $event)"
  >
    <NCard
      class="create-modal"
      :bordered="false"
      role="dialog"
      aria-modal="true"
    >
      <!-- 头部 -->
      <template #header>
        <span class="header-title">创建手动任务</span>
      </template>
      <template #header-extra>
        <NButton quaternary circle size="small" @click="handleClose">
          <template #icon>
            <NIcon :component="CloseOutline" />
          </template>
        </NButton>
      </template>

      <!-- 内容 -->
      <div class="modal-body">
        <p class="modal-desc">手动任务会在后台根据创建顺序依次执行</p>

        <NForm :model="formData" label-placement="top" class="create-form">
          <!-- 路径设置 -->
          <div class="form-section">
            <div class="section-title">
              <NIcon :component="FolderOutline" :size="16" />
              <span>路径设置</span>
            </div>

            <NFormItem label="刮削路径" required>
              <div class="path-input">
                <NInput
                  v-model:value="formData.scan_path"
                  placeholder="请输入视频目录或文件路径"
                />
                <NButton @click="showScanPathBrowser = true">
                  <template #icon>
                    <NIcon :component="FolderOutline" />
                  </template>
                </NButton>
              </div>
              <template #feedback>
                <span class="form-hint">指定目录时会扫描目录内全部视频文件</span>
              </template>
            </NFormItem>

            <NFormItem label="整理目录" required>
              <div class="path-input">
                <NInput
                  v-model:value="formData.target_folder"
                  placeholder="请输入整理结果存放目录"
                />
                <NButton @click="showTargetFolderBrowser = true">
                  <template #icon>
                    <NIcon :component="FolderOutline" />
                  </template>
                </NButton>
              </div>
            </NFormItem>

            <NFormItem label="元数据目录">
              <div class="path-input">
                <NInput
                  v-model:value="formData.metadata_dir"
                  placeholder="请输入元数据存放目录（可选）"
                />
                <NButton @click="showMetadataDirBrowser = true">
                  <template #icon>
                    <NIcon :component="FolderOutline" />
                  </template>
                </NButton>
              </div>
              <template #feedback>
                <span class="form-hint">NFO 和图片文件存放目录，留空则与视频同目录</span>
              </template>
            </NFormItem>
          </div>

          <NDivider style="margin: 16px 0" />

          <!-- 整理设置 -->
          <div class="form-section">
            <div class="section-title">
              <NIcon :component="SettingsOutline" :size="16" />
              <span>整理设置</span>
            </div>

            <NFormItem label="整理模式">
              <NSelect
                v-model:value="formData.link_mode"
                :options="linkModeOptions"
              />
            </NFormItem>

            <NFormItem v-if="showMoveOptions" label="空目录自动删除">
              <div class="switch-row">
                <NSwitch v-model:value="formData.delete_empty_parent" />
                <span class="switch-label">移动后自动删除空目录</span>
              </div>
            </NFormItem>

            <NFormItem label="配置复用">
              <NSelect
                v-model:value="formData.config_reuse_id"
                :options="configReuseOptions"
                placeholder="从监控目录复制配置"
              />
            </NFormItem>
          </div>
        </NForm>
      </div>

      <!-- 底部 -->
      <template #footer>
        <div class="modal-footer">
          <NButton @click="showAdvancedSettings = true" quaternary>
            <template #icon>
              <NIcon :component="SettingsOutline" />
            </template>
            高级设置
            <span v-if="advancedSettings" class="advanced-dot"></span>
          </NButton>
          <NSpace>
            <NButton @click="handleClose">取消</NButton>
            <NButton type="primary" :loading="submitting" @click="handleSubmit">
              创建任务
            </NButton>
          </NSpace>
        </div>
      </template>
    </NCard>
  </NModal>

  <!-- 刮削路径选择弹窗 -->
  <FolderBrowserModal
    v-model:show="showScanPathBrowser"
    title="选择刮削路径"
    @confirm="handleScanPathConfirm"
  />

  <!-- 整理目录选择弹窗 -->
  <FolderBrowserModal
    v-model:show="showTargetFolderBrowser"
    title="选择整理目录"
    @confirm="handleTargetFolderConfirm"
  />

  <!-- 元数据目录选择弹窗 -->
  <FolderBrowserModal
    v-model:show="showMetadataDirBrowser"
    title="选择元数据目录"
    @confirm="handleMetadataDirConfirm"
  />

  <!-- 高级设置弹窗 -->
  <AdvancedSettingsModal
    v-model:show="showAdvancedSettings"
    :link-mode="formData.link_mode"
    :target-folder="formData.target_folder"
    @confirm="handleAdvancedSettingsConfirm"
  />
</template>

<style scoped>
.create-modal {
  width: 600px;
  max-width: 95vw;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

:global(.dark) .create-modal {
  background: rgba(30, 41, 59, 0.95);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.modal-body {
  padding: 0 4px;
}

.modal-desc {
  color: var(--n-text-color-3);
  font-size: 13px;
  margin: 0 0 20px 0;
  padding: 10px 14px;
  background: var(--n-color-embedded);
  border-radius: 8px;
}

.form-section {
  margin-bottom: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--n-text-color-1);
  margin-bottom: 12px;
}

.section-title .n-icon {
  color: var(--n-primary-color);
}

.path-input {
  display: flex;
  gap: 8px;
  width: 100%;
}

.path-input .n-input {
  flex: 1;
}

.form-hint {
  font-size: 12px;
  color: var(--n-text-color-3);
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-label {
  font-size: 13px;
  color: var(--n-text-color-2);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.advanced-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--n-primary-color);
  margin-left: 6px;
}

/* 表单样式优化 */
.create-form :deep(.n-form-item) {
  margin-bottom: 16px;
}

.create-form :deep(.n-form-item-label) {
  font-weight: 500;
}

.create-form :deep(.n-input),
.create-form :deep(.n-select) {
  border-radius: 8px;
}

/* 按钮样式 */
.create-modal :deep(.n-button--primary-type) {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.create-modal :deep(.n-button--primary-type:hover) {
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}
</style>
