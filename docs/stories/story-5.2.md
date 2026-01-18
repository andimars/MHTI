# Story 5.2：TMDBService 使用统一超时

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

移除 `TMDBService` 中所有硬编码的超时值，改为从 `SystemConfig.task_timeout` 读取。

---

## 验收标准

- [x] 移除所有硬编码超时值 (`timeout=15.0`, `timeout=10.0`)
- [x] 所有 HTTP 请求使用统一超时配置
- [x] 现有测试通过

---

## 任务

- [x] 1. 修改 `server/services/tmdb_service.py`
  - [x] 1.1 添加 `_get_timeout()` 方法从 `SystemConfig` 读取超时
  - [x] 1.2 更新 `_make_api_request()` 使用 `_get_timeout()`
  - [x] 1.3 更新 `test_proxy()` 使用 `_get_timeout()`
  - [x] 1.4 更新 `verify_api_token()` 使用 `_get_timeout()`

---

## 技术细节

**修改前：**
```python
async def _make_api_request(self, endpoint: str, timeout: float = 15.0):
    async with httpx.AsyncClient(timeout=timeout, ...) as client:
```

**修改后：**
```python
async def _get_timeout(self) -> float:
    config = await self.config_service.get_system_config()
    return float(config.task_timeout)

async def _make_api_request(self, endpoint: str):
    timeout = await self._get_timeout()
    async with httpx.AsyncClient(timeout=timeout, ...) as client:
```

---

## 测试

- [x] 验证 TMDB API 请求使用配置的超时值
- [x] 现有 TMDB 测试通过

---

## Dev Agent Record

### File List
- Modified: `server/services/tmdb_service.py`

### Debug Log
无

### Completion Notes
- 添加 `_get_timeout()` 方法从 SystemConfig 读取 task_timeout
- 移除 `_make_api_request()` 的 timeout 参数，改用 `_get_timeout()`
- 更新 `test_proxy()` 和 `verify_api_token()` 使用统一超时

### Change Log
- 2026-01-16: Story 5.2 实现完成
