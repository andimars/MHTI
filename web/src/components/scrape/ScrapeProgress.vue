<script setup lang="ts">
import { computed } from 'vue'
import {
  NCard,
  NProgress,
  NSpace,
  NTag,
  NText,
  NButton,
  NIcon,
} from 'naive-ui'
import { PauseOutline, PlayOutline, CloseOutline } from '@vicons/ionicons5'

export interface ScrapeProgressInfo {
  total: number
  completed: number
  failed: number
  current: string
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled' | 'error'
  startTime?: number
  estimatedRemaining?: number
}

const props = defineProps<{
  progress: ScrapeProgressInfo
}>()

const emit = defineEmits<{
  pause: []
  resume: []
  cancel: []
}>()

const percentage = computed(() => {
  if (props.progress.total === 0) return 0
  return Math.round((props.progress.completed / props.progress.total) * 100)
})

const statusType = computed(() => {
  switch (props.progress.status) {
    case 'completed':
      return 'success'
    case 'error':
    case 'cancelled':
      return 'error'
    case 'running':
      return 'info'
    case 'paused':
      return 'warning'
    default:
      return 'default'
  }
})

const statusText = computed(() => {
  switch (props.progress.status) {
    case 'completed':
      return '已完成'
    case 'error':
      return '出错'
    case 'cancelled':
      return '已取消'
    case 'running':
      return '处理中'
    case 'paused':
      return '已暂停'
    default:
      return '等待中'
  }
})

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}秒`
  if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`
  return `${Math.round(seconds / 3600)}小时`
}

const estimatedTimeText = computed(() => {
  if (props.progress.estimatedRemaining && props.progress.estimatedRemaining > 0) {
    return `预计剩余: ${formatTime(props.progress.estimatedRemaining)}`
  }
  return ''
})

const canPause = computed(() => props.progress.status === 'running')
const canResume = computed(() => props.progress.status === 'paused')
const canCancel = computed(() => ['running', 'paused'].includes(props.progress.status))
</script>

<template>
  <NCard title="刮削进度" size="small">
    <NSpace vertical>
      <NSpace justify="space-between" align="center">
        <NSpace align="center">
          <NTag :type="statusType">{{ statusText }}</NTag>
          <NText v-if="estimatedTimeText" depth="3">{{ estimatedTimeText }}</NText>
        </NSpace>
        <NText>{{ progress.completed }} / {{ progress.total }}</NText>
      </NSpace>

      <NProgress
        type="line"
        :percentage="percentage"
        :status="progress.status === 'error' ? 'error' : progress.status === 'completed' ? 'success' : 'default'"
        :indicator-placement="'inside'"
      />

      <NText v-if="progress.current" depth="3">
        当前: {{ progress.current }}
      </NText>

      <NSpace v-if="progress.failed > 0 || canPause || canResume || canCancel" justify="space-between" align="center">
        <NText v-if="progress.failed > 0" type="warning">
          失败: {{ progress.failed }} 个
        </NText>
        <NSpace v-if="canPause || canResume || canCancel">
          <NButton v-if="canPause" size="small" @click="emit('pause')">
            <template #icon><NIcon :component="PauseOutline" /></template>
            暂停
          </NButton>
          <NButton v-if="canResume" size="small" type="primary" @click="emit('resume')">
            <template #icon><NIcon :component="PlayOutline" /></template>
            继续
          </NButton>
          <NButton v-if="canCancel" size="small" type="error" @click="emit('cancel')">
            <template #icon><NIcon :component="CloseOutline" /></template>
            取消
          </NButton>
        </NSpace>
      </NSpace>
    </NSpace>
  </NCard>
</template>
