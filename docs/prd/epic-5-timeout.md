# Epic 5: 统一超时框架重构

## 文档信息

| 属性 | 值 |
|------|-----|
| 版本 | v1.3 |
| 状态 | Draft |
| 创建日期 | 2026-01-16 |
| Epic ID | 5 |
| 优先级 | P0 |

---

## 1. 背景与问题

### 1.1 当前超时实现现状

| 位置 | 配置项 | 默认值 | 使用情况 |
|------|--------|--------|----------|
| `models/system.py` | `scrape_timeout` | 30s | ✅ 被 `ScrapeJobService` 使用 |
| `models/download.py` | `download_timeout` | 30s | ❌ **未被使用** (bug) |
| `models/download.py` | `retry_count` | 3 | ❌ **未被使用** (bug) |
| `models/download.py` | `concurrent_downloads` | 3 | ❌ **未被使用** (bug) |
| `models/emby.py` | `timeout` | 10s | ✅ 被 `EmbyService` 使用 |
| `services/image_service.py` | `DEFAULT_TIMEOUT` | 30s | ⚠️ 硬编码常量 |
| `services/tmdb_service.py` | 硬编码 | 10-15s | ⚠️ 硬编码在代码中 |

### 1.2 识别的问题

| 问题 | 影响 |
|------|------|
| **配置分散** | 性能相关配置分布在多个位置 |
| **配置未统一** | 用户设置的超时只影响刮削任务 |
| **硬编码严重** | TMDB/图片服务中多处硬编码 |
| **前端配置无效** | `DownloadSettings` 中的部分设置未被后端使用 |

---

## 2. 目标

### 2.1 核心目标

| 目标 | 描述 |
|------|------|
| **统一配置** | 所有性能相关配置集中到 `SystemConfig` |
| **消除硬编码** | 所有超时值从配置读取 |
| **清理冗余** | 删除 `DownloadConfig` 中的性能配置 |
| **改名** | `scrape_timeout` → `task_timeout` |

---

## 3. 配置处理方案

### 3.1 SystemConfig 新增字段

```python
# server/models/system.py
class SystemConfig(BaseModel):
    """系统配置模型"""

    scrape_threads: int = 4           # 刮削任务线程数
    task_timeout: int = 30            # 任务超时 (秒) - 原 scrape_timeout
    retry_count: int = 3              # 失败重试次数 - 从 DownloadConfig 移入
    concurrent_downloads: int = 3     # 并发下载数 - 从 DownloadConfig 移入
```

### 3.2 需要删除的配置

| 文件 | 配置项 | 删除原因 |
|------|--------|----------|
| `server/models/download.py` | `download_timeout` | 改用 `SystemConfig.task_timeout` |
| `server/models/download.py` | `retry_count` | 移到 `SystemConfig` |
| `server/models/download.py` | `concurrent_downloads` | 移到 `SystemConfig` |
| `server/services/image_service.py` | `DEFAULT_TIMEOUT` | 改用 `SystemConfig.task_timeout` |
| `server/services/tmdb_service.py` | 硬编码超时 | 改用 `SystemConfig.task_timeout` |
| `web/.../DownloadSettings.vue` | 性能设置项 | 移到 `SystemSettings.vue` |

### 3.3 需要保留的配置

| 文件 | 配置项 | 保留原因 |
|------|--------|----------|
| `server/models/system.py` | `task_timeout` | 统一超时配置 |
| `server/models/system.py` | `retry_count` | 统一重试配置 |
| `server/models/system.py` | `concurrent_downloads` | 统一并发配置 |
| `server/models/emby.py` | `timeout` | Emby 独立可选功能 |

---

## 4. Story 分解

### Story 5.1: 扩展 SystemConfig 并迁移配置

| 属性 | 值 |
|------|-----|
| 优先级 | P0 |
| 估时 | 1.5h |

**任务：**
- [ ] `server/models/system.py`:
  - `scrape_timeout` → `task_timeout`
  - 新增 `retry_count: int = 3`
  - 新增 `concurrent_downloads: int = 3`
- [ ] `server/services/config_service.py`: 添加迁移逻辑（兼容旧配置）
- [ ] `server/services/scrape_job_service.py`: 更新引用
- [ ] `web/src/api/types.ts`: 更新 `SystemConfig` 类型
- [ ] `web/.../SystemSettings.vue`:
  - 更新字段名，标签改为"任务超时设置 (秒)"
  - 新增"失败重试次数"设置项
  - 新增"并发下载数"设置项

---

### Story 5.2: TMDBService 使用统一超时

| 属性 | 值 |
|------|-----|
| 优先级 | P0 |
| 估时 | 1h |

**任务：**
- [ ] 移除所有硬编码超时值
- [ ] 添加 `_get_timeout()` 方法
- [ ] 更新所有 `httpx.AsyncClient` 调用

---

### Story 5.3: ImageService 使用统一配置

| 属性 | 值 |
|------|-----|
| 优先级 | P0 |
| 估时 | 1h |

**任务：**
- [ ] 移除 `DEFAULT_TIMEOUT` 常量
- [ ] 注入 `ConfigService` 依赖
- [ ] 从 `SystemConfig` 读取 `task_timeout`、`retry_count`、`concurrent_downloads`

---

### Story 5.4: 清理 DownloadConfig 冗余配置

| 属性 | 值 |
|------|-----|
| 优先级 | P0 |
| 估时 | 1h |

**任务：**
- [ ] `server/models/download.py`: 删除 `download_timeout`、`retry_count`、`concurrent_downloads`
- [ ] `web/src/api/types.ts`: 更新 `DownloadConfig` 类型
- [ ] `web/.../DownloadSettings.vue`: 删除"下载超时"、"失败重试次数"、"并发下载数"设置项

---

### Story 5.5: (可选) 添加重试装饰器

| 属性 | 值 |
|------|-----|
| 优先级 | P1 |
| 估时 | 2h |

**任务：**
- [ ] 创建 `server/core/retry.py`
- [ ] 实现 `with_retry` 装饰器
- [ ] 应用到 `TMDBService` 的 API 请求

---

## 5. 前端 UI 变更

### 5.1 SystemSettings.vue (新增设置项)

```vue
<!-- 性能设置 -->
<NDivider title-placement="left">性能设置</NDivider>

<NFormItem label="刮削任务线程数">
  <NInputNumber v-model:value="scrapeThreads" :min="1" :max="16" />
</NFormItem>

<NFormItem label="任务超时设置 (秒)">
  <NInputNumber v-model:value="taskTimeout" :min="10" :max="300" />
  <span>适用于 TMDB 请求、图片下载等所有网络操作</span>
</NFormItem>

<NFormItem label="失败重试次数">
  <NInputNumber v-model:value="retryCount" :min="0" :max="10" />
  <span>网络请求失败后的重试次数</span>
</NFormItem>

<NFormItem label="并发下载数">
  <NInputNumber v-model:value="concurrentDownloads" :min="1" :max="10" />
  <span>同时下载图片的最大数量</span>
</NFormItem>
```

### 5.2 DownloadSettings.vue (删除设置项)

删除以下设置项（已移到 SystemSettings）：
- ~~下载超时 (秒)~~
- ~~失败重试次数~~
- ~~并发下载数~~

---

## 6. 影响范围

### 后端文件

| 文件 | 变更类型 |
|------|----------|
| `server/models/system.py` | 修改 (重命名+新增字段) |
| `server/models/download.py` | 修改 (删除字段) |
| `server/services/config_service.py` | 修改 (迁移逻辑) |
| `server/services/scrape_job_service.py` | 修改 (更新引用) |
| `server/services/tmdb_service.py` | 修改 (使用统一超时) |
| `server/services/image_service.py` | 修改 (使用统一配置) |

### 前端文件

| 文件 | 变更类型 |
|------|----------|
| `web/src/api/types.ts` | 修改 (更新类型) |
| `web/src/components/settings/SystemSettings.vue` | 修改 (新增设置项) |
| `web/src/components/settings/DownloadSettings.vue` | 修改 (删除设置项) |

---

## 7. 统计

| 指标 | 数量 |
|------|------|
| Story 数量 | 5 |
| 预估总工时 | 6.5h |
| 后端文件 | 6 |
| 前端文件 | 3 |
| 删除配置项 | 4 |
| 新增配置项 | 2 (移入 SystemConfig) |
