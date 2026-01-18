<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: { label: string; value: number; color: string }[]
  size?: number
}>()

const total = computed(() => props.data.reduce((sum, item) => sum + item.value, 0))

const segments = computed(() => {
  let currentAngle = 0
  return props.data.map(item => {
    const percentage = total.value > 0 ? (item.value / total.value) * 100 : 0
    const angle = (percentage / 100) * 360
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    }
    currentAngle += angle
    return segment
  })
})

const gradientStyle = computed(() => {
  if (total.value === 0) {
    return 'conic-gradient(var(--n-border-color) 0deg 360deg)'
  }
  const stops = segments.value.map(seg =>
    `${seg.color} ${seg.startAngle}deg ${seg.endAngle}deg`
  ).join(', ')
  return `conic-gradient(${stops})`
})

const chartSize = computed(() => props.size || 120)
</script>

<template>
  <div class="ring-chart-container">
    <div
      class="ring-chart"
      :style="{
        width: `${chartSize}px`,
        height: `${chartSize}px`,
        background: gradientStyle
      }"
    >
      <div class="ring-inner">
        <span class="ring-total">{{ total }}</span>
        <span class="ring-label">总计</span>
      </div>
    </div>
    <div class="ring-legend">
      <div v-for="item in segments" :key="item.label" class="legend-item">
        <span class="legend-dot" :style="{ background: item.color }" />
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-value">{{ item.value }}</span>
        <span class="legend-percent">{{ item.percentage.toFixed(0) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ring-chart-container {
  display: flex;
  align-items: center;
  gap: 24px;
}

.ring-chart {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.ring-inner {
  width: 70%;
  height: 70%;
  background: var(--n-color, #fff);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-total {
  font-size: 24px;
  font-weight: 700;
  color: var(--n-text-color-1);
}

.ring-label {
  font-size: 12px;
  color: var(--n-text-color-3);
}

.ring-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  color: var(--n-text-color-2);
  min-width: 40px;
}

.legend-value {
  font-weight: 600;
  color: var(--n-text-color-1);
  min-width: 30px;
}

.legend-percent {
  color: var(--n-text-color-3);
  font-size: 12px;
}
</style>
