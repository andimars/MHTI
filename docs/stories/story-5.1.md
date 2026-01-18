# Story 5.1：扩展 SystemConfig 并迁移配置

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | 5 统一超时框架重构 |
| 优先级 | P0 |
| 状态 | Ready for Review |
| 估时 | 1.5h |

---

## 描述

将所有性能相关配置统一到 `SystemConfig`，包括重命名 `scrape_timeout` 为 `task_timeout`，并从 `DownloadConfig` 迁移 `retry_count` 和 `concurrent_downloads`。

---

## 验收标准

- [x] `SystemConfig` 包含 `task_timeout`、`retry_count`、`concurrent_downloads` 字段
- [x] 配置迁移逻辑正确处理旧配置
- [x] 前端 `SystemSettings.vue` 显示所有性能设置
- [x] API 正确返回新字段

---

## 任务

- [x] 1. 修改 `server/models/system.py`
  - [x] 1.1 重命名 `scrape_timeout` → `task_timeout`
  - [x] 1.2 新增 `retry_count: int = 3`
  - [x] 1.3 新增 `concurrent_downloads: int = 3`

- [x] 2. 修改 `server/services/config_service.py`
  - [x] 2.1 添加 `scrape_timeout` → `task_timeout` 迁移逻辑
  - [x] 2.2 添加从 `DownloadConfig` 迁移 `retry_count`/`concurrent_downloads` 逻辑

- [x] 3. 修改 `server/services/scrape_job_service.py`
  - [x] 3.1 更新 `scrape_timeout` 引用为 `task_timeout`

- [x] 4. 修改前端类型 `web/src/api/types.ts`
  - [x] 4.1 更新 `SystemConfig` 接口

- [x] 5. 修改前端 `web/src/components/settings/SystemSettings.vue`
  - [x] 5.1 更新字段名和变量
  - [x] 5.2 修改标签为"任务超时设置 (秒)"
  - [x] 5.3 新增"失败重试次数"设置项
  - [x] 5.4 新增"并发下载数"设置项

---

## 测试

- [x] 验证新配置字段正确保存和读取
- [x] 验证旧配置自动迁移
- [x] 验证前端设置页面正常工作

---

## Dev Agent Record

### File List
- Modified: `server/models/system.py`
- Modified: `server/services/config_service.py`
- Modified: `server/services/scrape_job_service.py`
- Modified: `web/src/api/types.ts`
- Modified: `web/src/components/settings/SystemSettings.vue`

### Debug Log
无

### Completion Notes
- SystemConfig 新增 `task_timeout`、`retry_count`、`concurrent_downloads` 字段
- 添加了从旧配置 `scrape_timeout` 到 `task_timeout` 的自动迁移
- 添加了从 DownloadConfig 迁移 retry_count/concurrent_downloads 的逻辑
- 前端设置页面新增了"失败重试次数"和"并发下载数"设置项

### Change Log
- 2026-01-16: Story 5.1 实现完成
