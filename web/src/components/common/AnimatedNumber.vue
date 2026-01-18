<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  value: number
  duration?: number
}>()

const displayValue = ref(0)
let animationFrame: number | null = null

const animateValue = (start: number, end: number, duration: number) => {
  const startTime = performance.now()

  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // easeOutExpo 缓动函数
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    displayValue.value = Math.round(start + (end - start) * easeProgress)

    if (progress < 1) {
      animationFrame = requestAnimationFrame(update)
    }
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  animationFrame = requestAnimationFrame(update)
}

watch(() => props.value, (newVal, oldVal) => {
  animateValue(oldVal || 0, newVal, props.duration || 800)
}, { immediate: false })

onMounted(() => {
  animateValue(0, props.value, props.duration || 800)
})
</script>

<template>
  <span class="animated-number">{{ displayValue }}</span>
</template>

<style scoped>
.animated-number {
  font-variant-numeric: tabular-nums;
}
</style>
