<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NButton,
  NInput,
  NInputNumber,
  NFormItem,
  NSwitch,
  NTag,
  NAlert,
  NCheckboxGroup,
  NCheckbox,
  useMessage,
} from 'naive-ui'
import { embyApi } from '@/api/emby'
import type { EmbyConfig, EmbyLibrary } from '@/api/types'

const message = useMessage()

// 配置状态
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)

// 表单数据
const enabled = ref(false)
const serverUrl = ref('')
const apiKey = ref('')
const userId = ref('')
const libraryIds = ref<string[]>([])
const checkBeforeScrape = ref(true)
const timeout = ref(10)

// 连接状态
const hasApiKey = ref(false)
const connectionStatus = ref<'unknown' | 'success' | 'failed'>('unknown')
const serverName = ref('')
const serverVersion = ref('')
const libraries = ref<EmbyLibrary[]>([])
const latencyMs = ref<number | null>(null)

// 加载配置
const loadConfig = async () => {
  loading.value = true
  try {
    const config: EmbyConfig = await embyApi.getConfig()
    enabled.value = config.enabled
    serverUrl.value = config.server_url
    hasApiKey.value = config.has_api_key
    userId.value = config.user_id
    libraryIds.value = config.library_ids
    checkBeforeScrape.value = config.check_before_scrape
    timeout.value = config.timeout

    // 如果已配置，自动获取媒体库列表
    if (config.has_api_key && config.server_url) {
      await loadLibraries()
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 加载媒体库列表
const loadLibraries = async () => {
  try {
    const result = await embyApi.testConnection({
      enabled: enabled.value,
      server_url: serverUrl.value,
      api_key: '__USE_SAVED__',
      user_id: userId.value,
      library_ids: [],
      check_before_scrape: checkBeforeScrape.value,
      timeout: timeout.value,
    })
    if (result.success) {
      libraries.value = result.libraries
      serverName.value = result.server_name || ''
      serverVersion.value = result.server_version || ''
      connectionStatus.value = 'success'
    }
  } catch (error) {
    console.error('加载媒体库失败:', error)
  }
}

// 保存配置
const saveConfig = async () => {
  if (enabled.value && !serverUrl.value) {
    message.warning('请输入服务器地址')
    return
  }
  if (enabled.value && !apiKey.value && !hasApiKey.value) {
    message.warning('请输入 API 密钥')
    return
  }

  saving.value = true
  try {
    await embyApi.saveConfig({
      enabled: enabled.value,
      server_url: serverUrl.value,
      api_key: apiKey.value || '',
      user_id: userId.value,
      library_ids: libraryIds.value,
      check_before_scrape: checkBeforeScrape.value,
      timeout: timeout.value,
    })
    message.success('Emby 配置已保存')
    if (apiKey.value) {
      hasApiKey.value = true
      apiKey.value = ''
    }
  } catch (error) {
    message.error('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 测试连接
const testConnection = async () => {
  // 验证必填字段
  if (!serverUrl.value) {
    message.warning('请输入服务器地址')
    return
  }
  if (!apiKey.value && !hasApiKey.value) {
    message.warning('请输入 API 密钥')
    return
  }

  testing.value = true
  connectionStatus.value = 'unknown'
  try {
    // 使用当前表单数据测试连接
    const result = await embyApi.testConnection({
      enabled: enabled.value,
      server_url: serverUrl.value,
      api_key: apiKey.value || '__USE_SAVED__',
      user_id: userId.value,
      library_ids: libraryIds.value,
      check_before_scrape: checkBeforeScrape.value,
      timeout: timeout.value,
    })
    if (result.success) {
      connectionStatus.value = 'success'
      serverName.value = result.server_name || ''
      serverVersion.value = result.server_version || ''
      libraries.value = result.libraries
      latencyMs.value = result.latency_ms
      message.success(`连接成功: ${result.server_name}`)
    } else {
      connectionStatus.value = 'failed'
      message.error(result.message)
    }
  } catch (error) {
    connectionStatus.value = 'failed'
    message.error('测试连接失败')
    console.error(error)
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <NCard title="Emby 媒体库集成" size="small">
    <NSpace vertical size="large">
      <NFormItem label="启用冲突检查">
        <NSwitch v-model:value="enabled" />
        <span style="margin-left: 12px; color: #999">刮削前检查 Emby 媒体库是否已存在相同剧集</span>
      </NFormItem>

      <template v-if="enabled">
        <NFormItem label="服务器地址">
          <NInput
            v-model:value="serverUrl"
            placeholder="http://192.168.1.100:8096"
            style="max-width: 400px"
          />
        </NFormItem>

        <NFormItem label="API 密钥">
          <NSpace vertical style="width: 100%">
            <NSpace align="center">
              <span>状态:</span>
              <NTag v-if="hasApiKey" type="success">已配置</NTag>
              <NTag v-else type="default">未配置</NTag>
            </NSpace>
            <NAlert type="info" :show-icon="false">
              在 Emby 控制台 → 高级 → API 密钥 中创建新密钥
            </NAlert>
            <NInput
              v-model:value="apiKey"
              type="password"
              show-password-on="click"
              :placeholder="hasApiKey ? '输入新密钥以更新...' : '输入 API 密钥'"
              style="max-width: 400px"
            />
          </NSpace>
        </NFormItem>

        <NFormItem label="用户 ID (可选)">
          <NInput
            v-model:value="userId"
            placeholder="留空使用默认用户"
            style="max-width: 300px"
          />
        </NFormItem>

        <NFormItem label="请求超时 (秒)">
          <NInputNumber v-model:value="timeout" :min="5" :max="60" style="width: 120px" />
        </NFormItem>

        <NFormItem label="刮削前检查">
          <NSwitch v-model:value="checkBeforeScrape" />
          <span style="margin-left: 12px; color: #999">在刮削流程中检查冲突</span>
        </NFormItem>

        <!-- 测试连接 -->
        <NSpace align="center">
          <NButton :loading="testing" @click="testConnection">
            测试连接
          </NButton>
          <template v-if="connectionStatus === 'success'">
            <NTag type="success">已连接</NTag>
            <span style="color: #999">
              {{ serverName }} v{{ serverVersion }}
              <template v-if="latencyMs !== null">({{ latencyMs }}ms)</template>
            </span>
          </template>
          <NTag v-else-if="connectionStatus === 'failed'" type="error">连接失败</NTag>
        </NSpace>

        <!-- 媒体库选择 -->
        <template v-if="libraries.length > 0">
          <NFormItem label="检查的媒体库 (可选)">
            <NCheckboxGroup v-model:value="libraryIds">
              <NSpace>
                <NCheckbox
                  v-for="lib in libraries"
                  :key="lib.id"
                  :value="lib.id"
                  :label="`${lib.name} (${lib.item_count})`"
                />
              </NSpace>
            </NCheckboxGroup>
            <div style="color: #999; font-size: 12px; margin-top: 4px">
              不选择则检查所有媒体库
            </div>
          </NFormItem>
        </template>
      </template>

      <NSpace>
        <NButton type="primary" :loading="saving" @click="saveConfig">
          保存配置
        </NButton>
      </NSpace>
    </NSpace>
  </NCard>
</template>
