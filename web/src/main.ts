import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'
import './style.css'
import './styles/ios-theme.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化主题
const themeStore = useThemeStore()
themeStore.initTheme()

// 初始化认证状态后再挂载应用
const authStore = useAuthStore()
authStore.checkAuth().then(() => {
  router.isReady().then(() => {
    app.mount('#app')
  })
})
