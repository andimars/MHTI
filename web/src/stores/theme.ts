import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  // 初始化时从 localStorage 读取
  const initTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      // 检测系统偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // 设置主题
  const setTheme = (dark: boolean) => {
    isDark.value = dark
  }

  // 监听变化并保存到 localStorage
  watch(isDark, (newValue) => {
    localStorage.setItem('theme', newValue ? 'dark' : 'light')
  })

  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme,
  }
})
