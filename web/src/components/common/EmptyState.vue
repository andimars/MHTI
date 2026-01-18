<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

defineProps<{
  title?: string
  description?: string
  actionText?: string
  icon?: 'empty' | 'search' | 'error'
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <!-- 插画 SVG -->
    <div class="empty-illustration">
      <!-- 空数据插画 -->
      <svg v-if="icon === 'empty' || !icon" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="140" rx="80" ry="12" fill="currentColor" opacity="0.1"/>
        <rect x="40" y="30" width="120" height="100" rx="8" fill="currentColor" opacity="0.1"/>
        <rect x="50" y="45" width="100" height="8" rx="4" fill="currentColor" opacity="0.2"/>
        <rect x="50" y="60" width="80" height="8" rx="4" fill="currentColor" opacity="0.15"/>
        <rect x="50" y="75" width="90" height="8" rx="4" fill="currentColor" opacity="0.15"/>
        <rect x="50" y="90" width="60" height="8" rx="4" fill="currentColor" opacity="0.15"/>
        <circle cx="150" cy="35" r="25" fill="currentColor" opacity="0.15"/>
        <path d="M142 35L148 41L158 29" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/>
      </svg>

      <!-- 搜索无结果插画 -->
      <svg v-else-if="icon === 'search'" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="140" rx="80" ry="12" fill="currentColor" opacity="0.1"/>
        <circle cx="85" cy="70" r="40" stroke="currentColor" stroke-width="6" opacity="0.2"/>
        <line x1="115" y1="100" x2="145" y2="130" stroke="currentColor" stroke-width="8" stroke-linecap="round" opacity="0.2"/>
        <path d="M70 60L100 90M100 60L70 90" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity="0.3"/>
      </svg>

      <!-- 错误插画 -->
      <svg v-else-if="icon === 'error'" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="140" rx="80" ry="12" fill="currentColor" opacity="0.1"/>
        <circle cx="100" cy="70" r="50" fill="currentColor" opacity="0.1"/>
        <path d="M100 45V85" stroke="currentColor" stroke-width="6" stroke-linecap="round" opacity="0.3"/>
        <circle cx="100" cy="100" r="4" fill="currentColor" opacity="0.3"/>
      </svg>
    </div>

    <!-- 文字内容 -->
    <h3 class="empty-title">{{ title || '暂无数据' }}</h3>
    <p class="empty-description">{{ description || '这里还没有任何内容' }}</p>

    <!-- 操作按钮 -->
    <NButton v-if="actionText" type="primary" @click="emit('action')">
      <template #icon>
        <NIcon :component="AddOutline" />
      </template>
      {{ actionText }}
    </NButton>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-illustration {
  width: 200px;
  height: 160px;
  margin-bottom: 24px;
  color: var(--n-primary-color, #6366f1);
}

.empty-illustration svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--n-text-color-1);
}

.empty-description {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--n-text-color-3);
  max-width: 300px;
}
</style>
