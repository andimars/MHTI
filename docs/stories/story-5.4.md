# Story 5.4：清理 DownloadConfig 冗余配置

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | 5 统一超时框架重构 |
| 优先级 | P0 |
| 状态 | Ready for Review |
| 估时 | 1h |
| 依赖 | Story 5.1, 5.3 |

---

## 描述

从 `DownloadConfig` 中删除已迁移到 `SystemConfig` 的性能配置字段，并更新前端 `DownloadSettings.vue`。

---

## 验收标准

- [x] `DownloadConfig` 不再包含 `download_timeout`、`retry_count`、`concurrent_downloads`
- [x] 前端 `DownloadSettings.vue` 移除对应设置项
- [x] 前端类型定义同步更新
- [x] 应用正常运行

---

## 任务

- [x] 1. 修改 `server/models/download.py`
  - [x] 1.1 删除 `download_timeout: int = 30` 字段
  - [x] 1.2 删除 `retry_count: int = 3` 字段
  - [x] 1.3 删除 `concurrent_downloads: int = 3` 字段

- [x] 2. 修改前端类型 `web/src/api/types.ts`
  - [x] 2.1 从 `DownloadConfig` 接口删除对应字段

- [x] 3. 修改前端 `web/src/components/settings/DownloadSettings.vue`
  - [x] 3.1 删除"下载超时 (秒)"设置项
  - [x] 3.2 删除"失败重试次数"设置项
  - [x] 3.3 删除"并发下载数"设置项
  - [x] 3.4 更新 config 对象默认值

---

## 测试

- [x] 验证下载配置 API 正常工作
- [x] 验证前端下载设置页面正常显示
- [x] 验证保存配置正常

---

## Dev Agent Record

### File List
- Modified: `server/models/download.py`
- Modified: `web/src/api/types.ts`
- Modified: `web/src/components/settings/DownloadSettings.vue`

### Debug Log
无

### Completion Notes
- 从 `DownloadConfig` 删除 `download_timeout`、`retry_count`、`concurrent_downloads` 字段
- 前端类型定义同步更新
- 前端设置页面移除对应设置项
- 这些配置已迁移到 `SystemConfig` (Story 5.1)

### Change Log
- 2026-01-16: Story 5.4 实现完成
