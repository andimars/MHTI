<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NSelect,
  NButton,
  NTag,
  useMessage,
} from 'naive-ui'
import { configApi } from '@/api/config'

const message = useMessage()
const loading = ref(false)
const saving = ref(false)

const primary = ref('zh-CN')
const fallback = ref<string[]>(['en-US'])
const supported = ref<{ label: string; value: string }[]>([])

// 加载配置
const loadConfig = async () => {
  loading.value = true
  try {
    const config = await configApi.getLanguageConfig()
    primary.value = config.primary
    fallback.value = config.fallback
    supported.value = config.supported.map(([code, name]) => ({
      label: `${name} (${code})`,
      value: code,
    }))
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 保存配置
const saveConfig = async () => {
  saving.value = true
  try {
    await configApi.saveLanguageConfig({
      primary: primary.value,
      fallback: fallback.value,
    })
    message.success('语言配置已保存')
  } catch (error) {
    message.error('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

onMounted(loadConfig)
</script>

<template>
  <NCard title="元数据语言配置" size="small">
    <NSpace vertical>
      <!-- 主语言 -->
      <NSpace align="center">
        <span style="width: 80px">主语言:</span>
        <NSelect
          v-model:value="primary"
          :options="supported"
          style="width: 200px"
          placeholder="选择主语言"
        />
      </NSpace>

      <!-- 回退语言 -->
      <NSpace align="center">
        <span style="width: 80px">回退语言:</span>
        <NSelect
          v-model:value="fallback"
          :options="supported"
          multiple
          style="width: 300px"
          placeholder="选择回退语言"
        />
      </NSpace>

      <NSpace>
        <NTag type="info" size="small">
          当主语言无数据时，将按顺序尝试回退语言
        </NTag>
      </NSpace>

      <!-- 保存按钮 -->
      <NButton type="primary" :loading="saving" @click="saveConfig">
        保存配置
      </NButton>
    </NSpace>
  </NCard>
</template>
