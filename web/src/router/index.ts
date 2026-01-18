import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage.vue'),
    meta: {
      title: '登录',
      public: true,
    },
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
    meta: {
      title: '主界面',
    },
  },
  {
    path: '/scan',
    name: 'scan',
    component: () => import('@/views/ScanPage.vue'),
    meta: {
      title: '手动任务',
    },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryPage.vue'),
    meta: {
      title: '刮削记录',
    },
  },
  {
    path: '/history/:id',
    name: 'history-detail',
    component: () => import('@/views/HistoryDetailPage.vue'),
    meta: {
      title: '记录详情',
    },
  },
  {
    path: '/files',
    name: 'files',
    component: () => import('@/views/FilesPage.vue'),
    meta: {
      title: '文件管理',
    },
  },
  {
    path: '/filemanager/scan',
    name: 'file-scan',
    component: () => import('@/views/FileScanPage.vue'),
    meta: {
      title: '文件扫描',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsPage.vue'),
    meta: {
      title: '设置',
    },
  },
  {
    path: '/security',
    name: 'security',
    component: () => import('@/views/SecurityPage.vue'),
    meta: {
      title: '安全设置',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 设置页面标题
  const title = to.meta.title as string
  document.title = title ? `${title} - MHTI` : 'MHTI'

  // 公开页面直接放行
  if (to.meta.public) {
    next()
    return
  }

  // 等待认证检查完成
  const authStore = useAuthStore()
  if (!authStore.isReady) {
    await authStore.checkAuth()
  }

  // 检查认证状态
  if (!authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
