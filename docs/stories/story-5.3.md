# Story 5.3：ImageService 使用统一配置

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | 5 统一超时框架重构 |
| 优先级 | P0 |
| 状态 | Ready for Review |
| 估时 | 1h |
| 依赖 | Story 5.1 |

---

## 描述

移除 `ImageService` 中的硬编码常量，改为从 `SystemConfig` 读取 `task_timeout`、`retry_count`、`concurrent_downloads`。

---

## 验收标准

- [x] 移除 `DEFAULT_TIMEOUT` 常量
- [x] 注入 `ConfigService` 依赖
- [x] 使用 `SystemConfig` 中的配置值
- [x] 现有测试通过

---

## 任务

- [x] 1. 修改 `server/services/image_service.py`
  - [x] 1.1 移除 `DEFAULT_TIMEOUT = 30.0` 常量
  - [x] 1.2 修改 `__init__` 注入 `ConfigService`
  - [x] 1.3 添加 `_get_system_config()` 方法
  - [x] 1.4 更新 `download_image()` 使用配置的 `task_timeout` 和 `retry_count`
  - [x] 1.5 更新 `download_batch()` 使用配置的 `concurrent_downloads`

- [x] 2. 更新 `ImageService` 的调用方
  - [x] 2.1 检查并更新所有创建 `ImageService` 的地方

---

## 技术细节

**修改前：**
```python
DEFAULT_TIMEOUT = 30.0

class ImageService:
    def __init__(self, timeout: float = DEFAULT_TIMEOUT, max_retries: int = 3):
        self.timeout = timeout
        self.max_retries = max_retries
```

**修改后：**
```python
class ImageService:
    def __init__(self, config_service: ConfigService):
        self.config_service = config_service

    async def _get_system_config(self) -> SystemConfig:
        return await self.config_service.get_system_config()
```

---

## 测试

- [x] 验证图片下载使用配置的超时值
- [x] 验证重试次数使用配置值
- [x] 验证并发数使用配置值
- [x] 现有 ImageService 测试通过

---

## Dev Agent Record

### File List
- Modified: `server/services/image_service.py`
- Modified: `server/core/container.py`

### Debug Log
无

### Completion Notes
- 移除 `DEFAULT_TIMEOUT`, `DEFAULT_MAX_RETRIES`, `DEFAULT_CONCURRENCY` 常量
- 修改 `__init__` 注入 `ConfigService`
- 添加 `_get_system_config()` 方法
- `download_image()` 使用 `task_timeout` 和 `retry_count`
- `download_batch()` 使用 `concurrent_downloads`
- 更新 `container.py` 中的 `get_image_service()` 注入依赖

### Change Log
- 2026-01-16: Story 5.3 实现完成
