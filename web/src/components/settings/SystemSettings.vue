<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NButton,
  NInputNumber,
  NFormItem,
  NInput,
  NTag,
  NAlert,
  NDivider,
  useMessage,
} from 'naive-ui'
import { configApi } from '@/api/config'
import type { ApiTokenStatus } from '@/api/types'

const message = useMessage()

// 系统配置
const loading = ref(false)
const saving = ref(false)
const scrapeThreads = ref(4)
const taskTimeout = ref(30)
const retryCount = ref(3)
const concurrentDownloads = ref(3)

// TMDB API Token
const tokenLoading = ref(false)
const tokenSaving = ref(false)
const tokenInput = ref('')
const tokenStatus = ref<ApiTokenStatus | null>(null)

// 加载系统配置
const loadConfig = async () => {
  loading.value = true
  try {
    const config = await configApi.getSystemConfig()
    scrapeThreads.value = config.scrape_threads
    taskTimeout.value = config.task_timeout
    retryCount.value = config.retry_count
    concurrentDownloads.value = config.concurrent_downloads
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 保存系统配置
const saveConfig = async () => {
  saving.value = true
  try {
    await configApi.saveSystemConfig({
      scrape_threads: scrapeThreads.value,
      task_timeout: taskTimeout.value,
      retry_count: retryCount.value,
      concurrent_downloads: concurrentDownloads.value,
    })
    message.success('系统配置已保存')
  } catch (error) {
    message.error('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 加载 Token 状态
const loadTokenStatus = async () => {
  tokenLoading.value = true
  try {
    tokenStatus.value = await configApi.getApiTokenStatus()
  } catch (error) {
    console.error(error)
  } finally {
    tokenLoading.value = false
  }
}

// 保存 Token
const saveToken = async () => {
  if (!tokenInput.value.trim()) {
    message.warning('请输入 API Token')
    return
  }
  tokenSaving.value = true
  try {
    const response = await configApi.saveApiToken(tokenInput.value)
    if (response.success) {
      message.success(response.message)
      tokenStatus.value = response.status
      tokenInput.value = ''
    } else {
      message.error(response.message)
    }
  } catch (error) {
    message.error('保存失败')
    console.error(error)
  } finally {
    tokenSaving.value = false
  }
}

// 删除 Token
const deleteToken = async () => {
  try {
    const response = await configApi.deleteApiToken()
    if (response.success) {
      message.success(response.message)
      tokenStatus.value = { is_configured: false, is_valid: null, last_verified: null, error_message: null }
    } else {
      message.warning(response.message)
    }
  } catch (error) {
    message.error('删除失败')
    console.error(error)
  }
}

onMounted(() => {
  loadConfig()
  loadTokenStatus()
})
</script>

<template>
  <NCard title="系统设置" size="small">
    <NSpace vertical size="large">
      <!-- TMDB 认证 -->
      <NDivider title-placement="left">TMDB 认证</NDivider>

      <!-- API Token -->
      <NFormItem label="API Token">
        <NSpace vertical style="width: 100%">
          <NSpace align="center">
            <span>状态:</span>
            <NTag v-if="tokenStatus?.is_configured && tokenStatus?.is_valid" type="success">已配置且有效</NTag>
            <NTag v-else-if="tokenStatus?.is_configured && tokenStatus?.is_valid === false" type="error">已配置但无效</NTag>
            <NTag v-else-if="tokenStatus?.is_configured" type="warning">已配置但未验证</NTag>
            <NTag v-else type="default">未配置</NTag>
          </NSpace>
          <NAlert type="info" :show-icon="false">
            请前往 <a href="https://www.themoviedb.org/settings/api" target="_blank">TMDB API 设置页面</a> 获取 API 密钥（API Read Access Token）
          </NAlert>
          <NInput
            v-model:value="tokenInput"
            type="textarea"
            placeholder="粘贴 TMDB API Token..."
            :rows="2"
          />
          <NSpace>
            <NButton type="primary" :loading="tokenSaving" @click="saveToken">
              保存并验证
            </NButton>
            <NButton v-if="tokenStatus?.is_configured" @click="deleteToken">
              删除 Token
            </NButton>
          </NSpace>
        </NSpace>
      </NFormItem>

      <!-- 性能设置 -->
      <NDivider title-placement="left">性能设置</NDivider>

      <NFormItem label="刮削任务线程数">
        <NInputNumber v-model:value="scrapeThreads" :min="1" :max="16" style="width: 150px" />
        <span style="margin-left: 8px; color: #999">建议 2-8，过高可能导致请求被限制</span>
      </NFormItem>

      <NFormItem label="任务超时设置 (秒)">
        <NInputNumber v-model:value="taskTimeout" :min="10" :max="300" style="width: 150px" />
        <span style="margin-left: 8px; color: #999">适用于 TMDB 请求、图片下载等所有网络操作</span>
      </NFormItem>

      <NFormItem label="失败重试次数">
        <NInputNumber v-model:value="retryCount" :min="0" :max="10" style="width: 150px" />
        <span style="margin-left: 8px; color: #999">网络请求失败后的重试次数</span>
      </NFormItem>

      <NFormItem label="并发下载数">
        <NInputNumber v-model:value="concurrentDownloads" :min="1" :max="10" style="width: 150px" />
        <span style="margin-left: 8px; color: #999">同时下载图片的最大数量</span>
      </NFormItem>

      <NSpace>
        <NButton type="primary" :loading="saving" @click="saveConfig">
          保存配置
        </NButton>
      </NSpace>
    </NSpace>
  </NCard>
</template>
