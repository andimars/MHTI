<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NIcon, NButton, NTooltip, NText } from 'naive-ui'
import { RefreshOutline } from '@vicons/ionicons5'

const route = useRoute()

const pageInfo = computed(() => {
  const pages: Record<string, { title: string; subtitle: string }> = {
    '/': { title: '主界面', subtitle: '查看任务统计和快捷操作' },
    '/scan': { title: '手动任务', subtitle: '创建和管理刮削任务' },
    '/settings': { title: '设置', subtitle: '配置应用参数' },
    '/scheduler': { title: '定时任务', subtitle: '管理自动化任务' },
    '/history': { title: '刮削记录', subtitle: '查看历史刮削结果' },
    '/watcher': { title: '文件夹监控', subtitle: '监控文件夹变化' },
    '/files': { title: '文件管理', subtitle: '浏览和管理媒体文件' },
    '/security': { title: '安全设置', subtitle: '管理账户和访问权限' },
  }
  return pages[route.path] || { title: '', subtitle: '' }
})

const handleRefresh = () => {
  window.location.reload()
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <div class="page-info">
        <h1 class="page-title">{{ pageInfo.title }}</h1>
        <NText class="page-subtitle" depth="3">{{ pageInfo.subtitle }}</NText>
      </div>
    </div>
    <div class="header-right">
      <NTooltip trigger="hover">
        <template #trigger>
          <NButton quaternary circle class="refresh-btn" @click="handleRefresh">
            <template #icon>
              <NIcon :component="RefreshOutline" :size="20" />
            </template>
          </NButton>
        </template>
        刷新页面
      </NTooltip>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--ios-text-primary);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 13px;
  line-height: 1.4;
  color: var(--ios-text-secondary) !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: var(--ios-text-secondary);
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: var(--ios-blue-light);
  color: var(--ios-blue);
  transform: rotate(90deg);
}
</style>
