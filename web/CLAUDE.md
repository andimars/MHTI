# Web 模块

[< 返回根目录](../CLAUDE.md) | [📖 架构文档](./ARCHITECTURE.md)

Vue.js 前端应用，专为 Docker/Linux 环境优化。

## 目录结构

```
web/
├── src/
│   ├── main.ts              # 应用入口
│   ├── App.vue              # 根组件
│   ├── vite-env.d.ts        # 环境类型定义 ✨
│   ├── router/index.ts      # 路由配置
│   ├── api/                 # API 客户端
│   │   ├── error-handler.ts # 统一错误处理 ✨
│   │   └── api.ts           # API 统一导出 ✨
│   ├── stores/              # Pinia 状态
│   ├── views/               # 页面组件
│   ├── components/          # 通用组件
│   ├── composables/         # 组合式函数
│   ├── utils/               # 工具函数库 ✨
│   │   ├── format.ts        # 格式化工具
│   │   ├── async.ts         # 异步工具
│   │   └── validation.ts    # 验证工具
│   └── constants/           # 常量定义 ✨
│       └── index.ts         # 集中常量管理
├── public/                  # 静态资源
├── ARCHITECTURE.md          # 架构详细文档 ✨
└── package.json
```

## 页面路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | HomePage | 主界面/统计 |
| `/login` | LoginPage | 登录 |
| `/scan` | ScanPage | 手动任务 |
| `/history` | HistoryPage | 刮削记录 |
| `/files` | FilesPage | 文件管理 |
| `/settings` | SettingsPage | 设置 |
| `/security` | SecurityPage | 安全设置 |

## API 模块

```
api/
├── index.ts          # Axios 实例配置
├── types.ts          # 类型定义
├── auth.ts           # 认证 API
├── files.ts          # 文件 API
├── scraper.ts        # 刮削 API
├── config.ts         # 配置 API
├── tmdb.ts           # TMDB API
├── watcher.ts        # 监控 API
└── emby.ts           # Emby API
```

## 状态管理

| Store | 文件 | 职责 |
|-------|------|------|
| auth | `stores/auth.ts` | 认证状态 |
| settings | `stores/settings.ts` | 设置缓存 |
| scraper | `stores/scraper.ts` | 刮削状态 |
| theme | `stores/theme.ts` | 主题切换 |

## 组件结构

```
components/
├── common/           # 通用组件
│   ├── AppLogo.vue
│   ├── EmptyState.vue
│   ├── Skeleton.vue
│   └── ...
├── layout/           # 布局组件
│   ├── AppLayout.vue
│   ├── AppHeader.vue
│   └── AppSidebar.vue
├── scan/             # 扫描相关
│   ├── FolderBrowser.vue
│   ├── ScanResultList.vue
│   └── ...
├── scrape/           # 刮削相关
│   ├── ScrapeProgress.vue
│   ├── ManualMatchModal.vue
│   └── ...
├── settings/         # 设置相关
│   ├── ProxySettings.vue
│   ├── TemplateSettings.vue
│   └── ...
└── history/          # 历史相关
    └── ResolveConflictModal.vue
```

## 组合式函数

| 函数 | 文件 | 用途 |
|------|------|------|
| useLogin | `useLogin.ts` | 登录逻辑 |
| useTheme | `useTheme.ts` | 主题切换 |
| useScraper | `useScraper.ts` | 刮削操作 |
| useWebSocket | `useWebSocket.ts` | WS 连接 |
| useHomeStats | `useHomeStats.ts` | 首页统计 |

## 依赖

```json
{
  "vue": "^3.5.24",
  "vue-router": "^4.6.4",
  "pinia": "^3.0.4",
  "naive-ui": "^2.43.2",
  "axios": "^1.13.2",
  "@vicons/ionicons5": "^0.13.0"
}
```

## 开发命令

```bash
npm install           # 安装依赖
npm run dev           # 开发服务器 (localhost:3500)
npm run build         # 生产构建
npm run build:check   # 类型检查 + 构建
npm run preview       # 预览构建结果
```

## 关键文件

- `main.ts` - Vue 应用初始化、插件注册
- `router/index.ts` - 路由守卫、认证检查
- `api/index.ts` - Axios 拦截器、错误处理
- `stores/auth.ts` - Token 管理、自动刷新
