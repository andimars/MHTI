<script setup lang="ts">
// 骨架屏组件 - 支持多种形状和尺寸
defineProps<{
  type?: 'text' | 'circle' | 'rect' | 'card'
  width?: string
  height?: string
  rows?: number
}>()
</script>

<template>
  <div class="skeleton-wrapper">
    <!-- 文本骨架 -->
    <template v-if="type === 'text' || !type">
      <div
        v-for="i in (rows || 1)"
        :key="i"
        class="skeleton skeleton-text"
        :style="{
          width: i === rows ? '60%' : (width || '100%'),
          height: height || '16px'
        }"
      />
    </template>

    <!-- 圆形骨架 -->
    <div
      v-else-if="type === 'circle'"
      class="skeleton skeleton-circle"
      :style="{ width: width || '48px', height: height || '48px' }"
    />

    <!-- 矩形骨架 -->
    <div
      v-else-if="type === 'rect'"
      class="skeleton skeleton-rect"
      :style="{ width: width || '100%', height: height || '120px' }"
    />

    <!-- 卡片骨架 -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div class="skeleton skeleton-rect" style="height: 120px; margin-bottom: 12px;" />
      <div class="skeleton skeleton-text" style="width: 70%; margin-bottom: 8px;" />
      <div class="skeleton skeleton-text" style="width: 50%;" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--n-color-embedded, #f0f0f0) 25%,
    var(--n-border-color, #e8e8e8) 50%,
    var(--n-color-embedded, #f0f0f0) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite ease-in-out;
  border-radius: 6px;
}

.skeleton-text {
  height: 16px;
}

.skeleton-circle {
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-rect {
  border-radius: 8px;
}

.skeleton-card {
  padding: 16px;
  background: var(--n-color, #fff);
  border-radius: 12px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
