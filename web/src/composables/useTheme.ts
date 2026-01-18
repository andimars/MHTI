import { computed, watchEffect } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { darkTheme, type GlobalTheme, type GlobalThemeOverrides } from 'naive-ui'

// iOS 风格品牌色定义
const iosColors = {
  primary: '#007AFF',        // iOS 蓝
  primaryHover: '#0066D6',
  primaryPressed: '#0055B3',
  success: '#34C759',        // iOS 绿
  warning: '#FF9500',        // iOS 橙
  error: '#FF3B30',          // iOS 红
  info: '#5AC8FA',           // iOS 浅蓝
}

// iOS 风格亮色主题覆盖
const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: iosColors.primary,
    primaryColorHover: iosColors.primaryHover,
    primaryColorPressed: iosColors.primaryPressed,
    primaryColorSuppl: iosColors.primaryHover,
    successColor: iosColors.success,
    warningColor: iosColors.warning,
    errorColor: iosColors.error,
    infoColor: iosColors.info,
    borderRadius: '12px',
    borderRadiusSmall: '8px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "PingFang SC", sans-serif',
    bodyColor: '#F2F2F7',
    cardColor: '#FFFFFF',
    modalColor: '#FFFFFF',
    popoverColor: '#FFFFFF',
    hoverColor: 'rgba(0, 122, 255, 0.08)',
    borderColor: 'rgba(60, 60, 67, 0.12)',
    dividerColor: 'rgba(60, 60, 67, 0.12)',
  },
  Card: {
    borderRadius: '16px',
    paddingMedium: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)',
  },
  Button: {
    borderRadiusMedium: '12px',
    borderRadiusSmall: '8px',
    borderRadiusTiny: '6px',
    heightMedium: '44px',
    heightSmall: '36px',
    fontSizeMedium: '16px',
    fontWeightStrong: '600',
  },
  Menu: {
    borderRadius: '12px',
    itemHeight: '44px',
    itemColorActive: 'rgba(0, 122, 255, 0.1)',
    itemColorActiveHover: 'rgba(0, 122, 255, 0.15)',
    itemTextColorActive: iosColors.primary,
    itemTextColorActiveHover: iosColors.primary,
    itemIconColorActive: iosColors.primary,
    itemIconColorActiveHover: iosColors.primary,
  },
  DataTable: {
    borderRadius: '12px',
  },
  Tag: {
    borderRadius: '8px',
  },
  Input: {
    borderRadius: '12px',
    heightMedium: '44px',
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '12px',
        heightMedium: '44px',
      },
    },
  },
  Tabs: {
    tabBorderRadius: '8px',
  },
  Message: {
    borderRadius: '12px',
  },
  Dialog: {
    borderRadius: '16px',
  },
  Drawer: {
    borderRadius: '16px 0 0 16px',
  },
}

// iOS 风格暗色主题覆盖
const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    ...lightThemeOverrides.common,
    bodyColor: '#000000',
    cardColor: '#1C1C1E',
    modalColor: '#1C1C1E',
    popoverColor: '#1C1C1E',
    tableColor: '#1C1C1E',
    inputColor: '#2C2C2E',
    actionColor: '#2C2C2E',
    hoverColor: 'rgba(0, 122, 255, 0.15)',
    borderColor: 'rgba(84, 84, 88, 0.65)',
    dividerColor: 'rgba(84, 84, 88, 0.65)',
  },
  Card: {
    ...lightThemeOverrides.Card,
    color: '#1C1C1E',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  Menu: {
    ...lightThemeOverrides.Menu,
    itemColorActive: 'rgba(0, 122, 255, 0.2)',
    itemColorActiveHover: 'rgba(0, 122, 255, 0.25)',
  },
  Layout: {
    siderColor: '#1C1C1E',
    siderBorderColor: 'rgba(84, 84, 88, 0.65)',
    headerColor: '#1C1C1E',
    headerBorderColor: 'rgba(84, 84, 88, 0.65)',
  },
  Button: lightThemeOverrides.Button,
  DataTable: lightThemeOverrides.DataTable,
  Tag: lightThemeOverrides.Tag,
  Input: lightThemeOverrides.Input,
  Select: lightThemeOverrides.Select,
  Tabs: lightThemeOverrides.Tabs,
  Message: lightThemeOverrides.Message,
  Dialog: lightThemeOverrides.Dialog,
  Drawer: lightThemeOverrides.Drawer,
}

export function useTheme() {
  const themeStore = useThemeStore()

  const theme = computed<GlobalTheme | null>(() => {
    return themeStore.isDark ? darkTheme : null
  })

  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    return themeStore.isDark ? darkThemeOverrides : lightThemeOverrides
  })

  const isDark = computed(() => themeStore.isDark)

  const toggleTheme = () => {
    themeStore.toggleTheme()
  }

  // 同步 dark class 到 document，用于 CSS 变量切换
  watchEffect(() => {
    if (themeStore.isDark) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  })

  return {
    theme,
    themeOverrides,
    isDark,
    toggleTheme,
  }
}
