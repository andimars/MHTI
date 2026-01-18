<template>
  <div class="app-logo" :class="{ 'app-logo--large': size === 'large' }">
    <div class="app-logo__icon">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/>
        <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div v-if="showText" class="app-logo__text">
      <h1 class="app-logo__title">MHTI</h1>
      <p class="app-logo__subtitle">剧集元数据刮削器</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'normal' | 'large'
  showText?: boolean
}>(), {
  size: 'normal',
  showText: true,
})
</script>

<style scoped>
.app-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.app-logo__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
  transition: transform 0.2s ease;
}

.app-logo__icon:hover {
  transform: scale(1.05);
}

.app-logo__icon svg {
  width: 24px;
  height: 24px;
}

.app-logo--large .app-logo__icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
}

.app-logo--large .app-logo__icon svg {
  width: 32px;
  height: 32px;
}

.app-logo__text {
  text-align: center;
}

.app-logo__title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color-base, #1e293b);
}

.app-logo--large .app-logo__title {
  font-size: 24px;
  margin-bottom: 8px;
}

.app-logo__subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-color-secondary, #64748b);
}
</style>
