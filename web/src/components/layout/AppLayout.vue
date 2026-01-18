<script setup lang="ts">
import { ref } from 'vue'
import { NLayout, NLayoutHeader, NLayoutSider, NLayoutContent } from 'naive-ui'
import { useTheme } from '@/composables/useTheme'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const { isDark } = useTheme()
const collapsed = ref(false)
</script>

<template>
  <NLayout class="app-layout" has-sider position="absolute">
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed-width="72"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      :native-scrollbar="false"
      class="app-sider"
      :class="{ dark: isDark }"
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <!-- Logo 区域 -->
      <div class="sider-header" :class="{ collapsed }">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <transition name="logo-fade">
            <span v-if="!collapsed" class="logo-text">MHTI</span>
          </transition>
        </div>
      </div>
      <AppSidebar :collapsed="collapsed" />
    </NLayoutSider>
    <NLayout>
      <NLayoutHeader bordered class="app-header-wrapper" :class="{ dark: isDark }" position="absolute">
        <AppHeader />
      </NLayoutHeader>
      <NLayoutContent
        :content-style="{ padding: '24px' }"
        class="app-content"
        :class="{ dark: isDark }"
        :native-scrollbar="false"
      >
        <router-view v-slot="{ Component }">
          <transition name="ios-page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}

/* iOS 风格侧边栏 - 毛玻璃效果 */
.app-sider {
  background: var(--ios-glass-bg-thick) !important;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-right: 1px solid var(--ios-glass-border) !important;
  box-shadow: 1px 0 0 var(--ios-glass-border);
}

.app-sider.dark {
  background: var(--ios-glass-bg-thick) !important;
}

/* 侧边栏触发器样式 */
.app-sider :deep(.n-layout-toggle-button) {
  background: var(--ios-bg-secondary);
  border: 1px solid var(--ios-glass-border);
  border-radius: 50%;
  box-shadow: var(--ios-shadow-sm);
  transition: all 0.2s ease;
}

.app-sider :deep(.n-layout-toggle-button:hover) {
  background: var(--ios-blue-light);
  box-shadow: var(--ios-shadow-md);
}

/* Logo 区域 */
.sider-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--ios-separator);
  padding: 0 20px;
  transition: all 0.3s ease;
}

.sider-header.collapsed {
  padding: 0 12px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ios-blue);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  transition: transform 0.3s var(--ios-spring), box-shadow 0.3s ease;
}

.logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
}

.logo-icon svg {
  width: 22px;
  height: 22px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--ios-blue);
  white-space: nowrap;
  letter-spacing: -0.5px;
}

/* iOS 风格头部 - 毛玻璃效果 */
.app-header-wrapper {
  background: var(--ios-glass-bg-thick) !important;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--ios-glass-border) !important;
  box-shadow: 0 1px 0 var(--ios-glass-border);
}

.app-header-wrapper.dark {
  background: var(--ios-glass-bg-thick) !important;
}

/* 内容区域 */
.app-content {
  min-height: calc(100vh - 64px);
  background: var(--ios-bg-primary);
  overflow-y: auto;
}

.app-content.dark {
  background: var(--ios-bg-primary);
}

/* iOS 风格页面切换动画 */
.ios-page-enter-active {
  animation: ios-slide-in 0.35s ease;
}

.ios-page-leave-active {
  animation: ios-slide-out 0.2s ease;
}

@keyframes ios-slide-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes ios-slide-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}

/* Logo 文字淡入淡出 */
.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.logo-fade-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.logo-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
