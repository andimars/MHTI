<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: { label: string; value: number }[]
  height?: number
  color?: string
}>()

const maxValue = computed(() => Math.max(...props.data.map(d => d.value), 1))
const chartHeight = computed(() => props.height || 120)
const barColor = computed(() => props.color || '#6366f1')
</script>

<template>
  <div class="bar-chart" :style="{ height: `${chartHeight}px` }">
    <div class="chart-bars">
      <div
        v-for="(item, index) in data"
        :key="index"
        class="bar-item"
        :style="{ '--delay': `${index * 0.05}s` }"
      >
        <div class="bar-wrapper">
          <div
            class="bar"
            :style="{
              height: `${(item.value / maxValue) * 100}%`,
              background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}99 100%)`
            }"
          >
            <span class="bar-value">{{ item.value }}</span>
          </div>
        </div>
        <span class="bar-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bar-chart {
  width: 100%;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  gap: 8px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  min-width: 0;
}

.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 100%;
  max-width: 40px;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  position: relative;
  animation: bar-grow 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: var(--delay);
  transform-origin: bottom;
  transform: scaleY(0);
  transition: all 0.3s ease;
}

.bar:hover {
  filter: brightness(1.1);
  transform: scaleY(1) translateY(-2px);
}

.bar-value {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  color: var(--n-text-color-1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.bar:hover .bar-value {
  opacity: 1;
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  color: var(--n-text-color-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@keyframes bar-grow {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}
</style>
