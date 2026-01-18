# Story 6.3：前端日志管理组件

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | [6 日志系统增强](../prd/epic-6-logging.md) |
| 优先级 | P0 |
| 状态 | Ready |
| 估时 | 2h |
| 依赖 | Story 6.2 |

---

## User Story

**As a** 系统管理员,
**I want** 在系统设置页面中查看和管理应用日志,
**So that** 我可以直观地监控应用运行状态、排查问题并调整日志配置。

---

## 验收标准

### 功能需求

- [ ] 支持配置日志级别、启用/禁用各输出渠道（控制台/文件/数据库/实时）
- [ ] 虚拟滚动表格展示日志，支持分页加载
- [ ] 支持按级别、模块、时间范围、关键词过滤
- [ ] 开关控制实时日志推送，新日志自动追加到列表顶部
- [ ] 支持下载 JSON/CSV 格式日志文件
- [ ] 支持按时间范围或级别清理日志，需二次确认
- [ ] 显示各级别日志数量统计
- [ ] 点击日志行可展开查看完整信息和额外数据

### 集成需求

- [ ] 在 `SettingsPage.vue` 中添加 "日志" Tab
- [ ] 组件结构与 `SystemSettings.vue` 保持一致
- [ ] 使用 `useWebSocket` composable 接收实时日志
- [ ] 使用 Naive UI 组件，遵循现有设计语言

### 质量需求

- [ ] 所有 API 响应和组件 props 有类型定义
- [ ] 在不同屏幕尺寸下正常显示
- [ ] 其他设置 Tab 正常工作

---

## 任务

- [ ] 1. 扩展类型定义 `web/src/api/types.ts`
  - [ ] 1.1 添加 `LogLevel` 类型
  - [ ] 1.2 添加 `LogEntry` 接口
  - [ ] 1.3 添加 `LogConfig` 接口
  - [ ] 1.4 添加 `LogStats` 接口
  - [ ] 1.5 添加 `LogQuery` 接口

- [ ] 2. 创建 API 客户端 `web/src/api/logs.ts`
  - [ ] 2.1 实现 `getLogs()` 查询
  - [ ] 2.2 实现 `getStats()` 统计
  - [ ] 2.3 实现 `getConfig()` / `updateConfig()` 配置
  - [ ] 2.4 实现 `clearLogs()` 清理
  - [ ] 2.5 实现 `downloadLogs()` 下载

- [ ] 3. 创建日志设置组件 `web/src/components/settings/LogSettings.vue`
  - [ ] 3.1 日志配置区（级别选择、渠道开关、保留天数）
  - [ ] 3.2 统计卡片（各级别日志数量）
  - [ ] 3.3 过滤器（级别、模块、时间、搜索）
  - [ ] 3.4 日志表格（虚拟滚动、分页、展开详情）
  - [ ] 3.5 实时日志开关和显示
  - [ ] 3.6 操作按钮（刷新、下载、清理）

- [ ] 4. 集成到设置页面 `web/src/views/SettingsPage.vue`
  - [ ] 4.1 导入 `LogSettings` 组件
  - [ ] 4.2 添加 "日志" Tab

- [ ] 5. 扩展 WebSocket 处理
  - [ ] 5.1 在 `useWebSocket` 中添加日志订阅
  - [ ] 5.2 处理日志推送消息
  - [ ] 5.3 实现日志缓存（最多 500 条）

- [ ] 6. 样式和交互优化
  - [ ] 6.1 日志级别颜色区分
  - [ ] 6.2 时间格式化
  - [ ] 6.3 加载状态和空状态
  - [ ] 6.4 清理确认对话框

---

## 技术说明

### 新增文件

```
web/src/
├── api/
│   └── logs.ts                    # 日志 API 客户端
└── components/settings/
    └── LogSettings.vue            # 日志设置组件
```

### 组件结构

```vue
<template>
  <NCard title="日志管理" size="small">
    <NSpace vertical size="large">
      <!-- 日志配置区 -->
      <NDivider title-placement="left">日志配置</NDivider>
      <NFormItem label="日志级别">
        <NSelect v-model:value="config.log_level" :options="levelOptions" />
      </NFormItem>
      <NSpace>
        <NSwitch v-model:value="config.console_enabled" />控制台
        <NSwitch v-model:value="config.file_enabled" />文件
        <NSwitch v-model:value="config.db_enabled" />数据库
        <NSwitch v-model:value="config.realtime_enabled" />实时推送
      </NSpace>
      <NFormItem label="数据库保留天数">
        <NInputNumber v-model:value="config.db_retention_days" :min="1" :max="365" />
      </NFormItem>
      <NButton type="primary" @click="saveConfig">保存配置</NButton>

      <!-- 日志查看区 -->
      <NDivider title-placement="left">日志查看</NDivider>

      <!-- 统计卡片 -->
      <NGrid :cols="5" :x-gap="12">
        <NGi v-for="level in levels" :key="level">
          <NStatistic :label="level" :value="stats.by_level[level] || 0">
            <template #prefix>
              <NTag :type="levelColors[level]" size="small" />
            </template>
          </NStatistic>
        </NGi>
      </NGrid>

      <!-- 过滤器 -->
      <NSpace>
        <NSelect v-model:value="query.level" placeholder="级别" clearable style="width: 120px" />
        <NSelect v-model:value="query.logger" placeholder="模块" clearable style="width: 180px" />
        <NInput v-model:value="query.search" placeholder="搜索..." style="width: 200px" />
        <NDatePicker v-model:value="dateRange" type="datetimerange" clearable />
        <NSwitch v-model:value="realtime" />
        <span>实时</span>
        <NButton @click="refresh">刷新</NButton>
      </NSpace>

      <!-- 日志表格 -->
      <NDataTable
        :columns="columns"
        :data="logs"
        :loading="loading"
        :pagination="pagination"
        :row-key="row => row.id"
        :max-height="400"
        virtual-scroll
        striped
      />

      <!-- 操作按钮 -->
      <NSpace>
        <NButton @click="downloadLogs('json')">下载 JSON</NButton>
        <NButton @click="downloadLogs('csv')">下载 CSV</NButton>
        <NPopconfirm @positive-click="clearLogs">
          <template #trigger>
            <NButton type="error">清理日志</NButton>
          </template>
          确定要清理日志吗？此操作不可撤销。
        </NPopconfirm>
      </NSpace>
    </NSpace>
  </NCard>
</template>
```

### API 客户端

```typescript
// web/src/api/logs.ts
import { api } from './index'
import type { LogEntry, LogConfig, LogStats, LogQuery } from './types'

export const logsApi = {
  getLogs: (query: LogQuery) =>
    api.get<{ items: LogEntry[], total: number }>('/api/logs', { params: query }),

  getStats: () =>
    api.get<LogStats>('/api/logs/stats'),

  getConfig: () =>
    api.get<LogConfig>('/api/logs/config'),

  updateConfig: (config: Partial<LogConfig>) =>
    api.put<LogConfig>('/api/logs/config', config),

  clearLogs: (params?: { before?: string, level?: string }) =>
    api.delete<{ deleted: number }>('/api/logs', { params }),

  downloadLogs: (format: 'json' | 'csv', params?: LogQuery) =>
    api.get('/api/logs/download', {
      params: { format, ...params },
      responseType: 'blob'
    }),
}
```

### 类型定义

```typescript
// web/src/api/types.ts 扩展
export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

export interface LogEntry {
  id: number
  timestamp: string
  level: LogLevel
  logger: string
  message: string
  extra_data?: Record<string, unknown>
  request_id?: string
  user_id?: number
}

export interface LogConfig {
  log_level: LogLevel
  console_enabled: boolean
  file_enabled: boolean
  db_enabled: boolean
  max_file_size_mb: number
  max_file_count: number
  db_retention_days: number
  realtime_enabled: boolean
}

export interface LogStats {
  total: number
  by_level: Record<LogLevel, number>
  by_logger: Record<string, number>
}

export interface LogQuery {
  level?: LogLevel
  logger?: string
  start_time?: string
  end_time?: string
  search?: string
  limit?: number
  offset?: number
}
```

### 日志级别颜色

```typescript
const levelColors: Record<LogLevel, 'default' | 'info' | 'warning' | 'error'> = {
  DEBUG: 'default',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'error',
}
```

### 关键约束

- 表格使用虚拟滚动，最大高度 400px
- 分页默认 100 条/页
- 实时日志最多保留最新 500 条（前端缓存）
- 下载时间范围最大 7 天

---

## 风险缓解

| 类型 | 内容 |
|------|------|
| **主要风险** | 大量日志渲染可能导致页面卡顿 |
| **缓解措施** | 虚拟滚动、分页加载、前端日志缓存限制 |
| **回滚方案** | 1. 从 `SettingsPage.vue` 移除日志 Tab<br>2. 删除 `LogSettings.vue` 和 `logs.ts` |

---

## Definition of Done

- [ ] `web/src/api/logs.ts` 创建完成
- [ ] `web/src/api/types.ts` 类型扩展完成
- [ ] `web/src/components/settings/LogSettings.vue` 创建完成
- [ ] `SettingsPage.vue` 集成日志 Tab
- [ ] WebSocket 实时日志订阅功能完成
- [ ] 所有 UI 功能正常工作
- [ ] TypeScript 编译无错误
- [ ] 其他设置 Tab 回归测试通过
