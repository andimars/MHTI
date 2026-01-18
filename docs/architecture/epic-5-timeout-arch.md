# Epic 5: 统一超时框架 - 架构设计文档

## 文档信息

| 属性 | 值 |
|------|-----|
| 版本 | v1.3 |
| 状态 | Draft |
| 创建日期 | 2026-01-16 |

---

## 1. 架构概述

### 1.1 配置统一流向

```
┌─────────────────────────────────────────────────────────────┐
│              设置页面 > 系统设置 > 性能设置                   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │ 刮削线程数   │ 任务超时    │ 失败重试    │ 并发下载    │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                    SystemConfig
    ┌─────────────────────┼─────────────────────┐
    │ scrape_threads      │ task_timeout        │
    │ retry_count         │ concurrent_downloads│
    └─────────────────────┴─────────────────────┘
                          │
      ┌───────────────────┼───────────────────┐
      │                   │                   │
      ▼                   ▼                   ▼
 ScrapeJob           TMDBService        ImageService
  Service
```

### 1.2 保留的独立配置

```
┌─────────────────────────────────────────────────────────────┐
│              设置页面 > Emby 设置                            │
│                   请求超时 (秒)                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                EmbyConfig.timeout (独立配置)
                          │
                          ▼
                    EmbyService
```

---

## 2. 详细设计

### 2.1 配置模型变更

```python
# server/models/system.py
from pydantic import BaseModel, Field

class SystemConfig(BaseModel):
    """系统配置模型 - 统一性能配置"""

    scrape_threads: int = Field(
        default=4, ge=1, le=16,
        description="刮削任务线程数"
    )
    task_timeout: int = Field(
        default=30, ge=10, le=300,
        description="任务超时 (秒)"
    )
    retry_count: int = Field(
        default=3, ge=0, le=10,
        description="失败重试次数"
    )
    concurrent_downloads: int = Field(
        default=3, ge=1, le=10,
        description="并发下载数"
    )
```

```python
# server/models/download.py (删除性能配置)
class DownloadConfig(BaseModel):
    """下载配置模型 - 仅保留图片相关配置"""

    # 剧集级别图片
    series_poster: bool = True
    series_backdrop: bool = True
    series_logo: bool = False
    series_banner: bool = False

    # 季级别图片
    season_poster: bool = True

    # 集级别图片
    episode_thumb: bool = True

    # 额外图片
    extra_backdrops: bool = False
    extra_backdrops_count: int = 5

    # 图片质量
    poster_quality: ImageQuality = ImageQuality.HIGH
    backdrop_quality: ImageQuality = ImageQuality.ORIGINAL
    thumb_quality: ImageQuality = ImageQuality.MEDIUM

    # 下载行为 (仅保留覆盖选项)
    overwrite_existing: bool = False

    # 以下字段已移到 SystemConfig:
    # download_timeout: int = 30  # 删除
    # retry_count: int = 3        # 删除
    # concurrent_downloads: int = 3  # 删除
```

### 2.2 配置迁移逻辑

```python
# server/services/config_service.py

async def get_system_config(self) -> SystemConfig:
    """获取系统配置（含迁移逻辑）"""
    data = await self._get_config("system")
    if data:
        # 迁移 1: scrape_timeout → task_timeout
        if "scrape_timeout" in data and "task_timeout" not in data:
            data["task_timeout"] = data.pop("scrape_timeout")
        return SystemConfig(**data)

    # 新安装：尝试从 DownloadConfig 迁移
    download_data = await self._get_config("download")
    defaults = {}
    if download_data:
        if "retry_count" in download_data:
            defaults["retry_count"] = download_data["retry_count"]
        if "concurrent_downloads" in download_data:
            defaults["concurrent_downloads"] = download_data["concurrent_downloads"]

    return SystemConfig(**defaults) if defaults else SystemConfig()
```

### 2.3 服务改造

#### TMDBService

```python
# server/services/tmdb_service.py

class TMDBService:
    def __init__(self, config_service: ConfigService):
        self.config_service = config_service

    async def _get_timeout(self) -> float:
        """获取统一超时配置"""
        config = await self.config_service.get_system_config()
        return float(config.task_timeout)

    async def _make_api_request(self, endpoint: str, params: dict | None = None):
        timeout = await self._get_timeout()
        # ... 使用 timeout
```

#### ImageService

```python
# server/services/image_service.py

# 删除: DEFAULT_TIMEOUT = 30.0
# 删除: DEFAULT_MAX_RETRIES = 3
# 删除: DEFAULT_CONCURRENCY = 3

class ImageService:
    def __init__(self, config_service: ConfigService):
        self.config_service = config_service
        self._headers = {"User-Agent": DEFAULT_USER_AGENT}

    async def _get_system_config(self) -> SystemConfig:
        """获取系统配置"""
        return await self.config_service.get_system_config()

    async def download_image(self, url: str, save_path: str, filename: str):
        config = await self._get_system_config()
        timeout = float(config.task_timeout)
        max_retries = config.retry_count

        for attempt in range(max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(url, headers=self._headers)
                    # ...
            except httpx.TimeoutException:
                if attempt < max_retries:
                    await asyncio.sleep(RETRY_DELAYS[min(attempt, len(RETRY_DELAYS) - 1)])
                    continue
                # ...

    async def download_batch(self, requests: list[ImageDownloadRequest]):
        config = await self._get_system_config()
        concurrency = config.concurrent_downloads
        semaphore = asyncio.Semaphore(concurrency)
        # ...
```

---

## 3. 前端变更

### 3.1 类型定义

```typescript
// web/src/api/types.ts

// SystemConfig (新增字段)
export interface SystemConfig {
  scrape_threads: number
  task_timeout: number       // 原 scrape_timeout
  retry_count: number        // 从 DownloadConfig 移入
  concurrent_downloads: number  // 从 DownloadConfig 移入
}

// DownloadConfig (删除性能字段)
export interface DownloadConfig {
  series_poster: boolean
  series_backdrop: boolean
  series_logo: boolean
  series_banner: boolean
  season_poster: boolean
  episode_thumb: boolean
  extra_backdrops: boolean
  extra_backdrops_count: number
  poster_quality: string
  backdrop_quality: string
  thumb_quality: string
  overwrite_existing: boolean
  // 以下字段已删除:
  // download_timeout: number
  // retry_count: number
  // concurrent_downloads: number
}
```

### 3.2 SystemSettings.vue

```vue
<script setup lang="ts">
const scrapeThreads = ref(4)
const taskTimeout = ref(30)
const retryCount = ref(3)
const concurrentDownloads = ref(3)

const loadConfig = async () => {
  const config = await configApi.getSystemConfig()
  scrapeThreads.value = config.scrape_threads
  taskTimeout.value = config.task_timeout
  retryCount.value = config.retry_count
  concurrentDownloads.value = config.concurrent_downloads
}

const saveConfig = async () => {
  await configApi.saveSystemConfig({
    scrape_threads: scrapeThreads.value,
    task_timeout: taskTimeout.value,
    retry_count: retryCount.value,
    concurrent_downloads: concurrentDownloads.value,
  })
}
</script>

<template>
  <!-- 性能设置 -->
  <NDivider title-placement="left">性能设置</NDivider>

  <NFormItem label="刮削任务线程数">
    <NInputNumber v-model:value="scrapeThreads" :min="1" :max="16" style="width: 150px" />
    <span style="margin-left: 8px; color: #999">建议 2-8，过高可能导致请求被限制</span>
  </NFormItem>

  <NFormItem label="任务超时设置 (秒)">
    <NInputNumber v-model:value="taskTimeout" :min="10" :max="300" style="width: 150px" />
    <span style="margin-left: 8px; color: #999">适用于 TMDB 请求、图片下载等所有网络操作</span>
  </NFormItem>

  <NFormItem label="失败重试次数">
    <NInputNumber v-model:value="retryCount" :min="0" :max="10" style="width: 150px" />
    <span style="margin-left: 8px; color: #999">网络请求失败后的重试次数</span>
  </NFormItem>

  <NFormItem label="并发下载数">
    <NInputNumber v-model:value="concurrentDownloads" :min="1" :max="10" style="width: 150px" />
    <span style="margin-left: 8px; color: #999">同时下载图片的最大数量</span>
  </NFormItem>
</template>
```

### 3.3 DownloadSettings.vue

删除以下设置项（已移到 SystemSettings）：

```vue
<!-- 删除以下代码 -->
<!--
<NFormItem label="下载超时 (秒)">
  <NInputNumber v-model:value="config.download_timeout" :min="5" :max="120" />
</NFormItem>
<NFormItem label="失败重试次数">
  <NInputNumber v-model:value="config.retry_count" :min="0" :max="10" />
</NFormItem>
<NFormItem label="并发下载数">
  <NInputNumber v-model:value="config.concurrent_downloads" :min="1" :max="10" />
</NFormItem>
-->
```

---

## 4. 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `server/models/system.py` | 修改 | 重命名+新增字段 |
| `server/models/download.py` | 修改 | 删除性能字段 |
| `server/services/config_service.py` | 修改 | 添加迁移逻辑 |
| `server/services/scrape_job_service.py` | 修改 | 更新字段引用 |
| `server/services/tmdb_service.py` | 修改 | 使用统一超时 |
| `server/services/image_service.py` | 修改 | 使用统一配置 |
| `web/src/api/types.ts` | 修改 | 更新类型定义 |
| `web/.../SystemSettings.vue` | 修改 | 新增设置项 |
| `web/.../DownloadSettings.vue` | 修改 | 删除设置项 |

---

## 5. 向后兼容

| 场景 | 处理方式 |
|------|----------|
| 旧配置 `scrape_timeout` | 自动迁移为 `task_timeout` |
| 旧配置 `download_timeout` | 忽略，使用 `task_timeout` |
| 旧配置 `retry_count` (DownloadConfig) | 迁移到 SystemConfig |
| 旧配置 `concurrent_downloads` (DownloadConfig) | 迁移到 SystemConfig |
| API 响应 | 仅返回新字段名 |
| 默认值 | 保持不变 |
