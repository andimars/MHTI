# Story 3: 修复 ImageService 测试

## Story Info

- **Epic**: 测试同步修复
- **Status**: ✅ Completed
- **Priority**: High
- **Estimate**: 1 hour

## Goal

更新 ImageService 测试使用新的依赖注入 API，修复 18 个测试错误。

## Background

ImageService 已重构为依赖注入模式：

| 项目 | 旧 API | 新 API |
|------|--------|--------|
| 构造函数 | `ImageService(timeout=10.0, max_retries=3)` | `ImageService(config_service: ConfigService)` |
| 配置获取 | 构造函数参数 | 通过 `config_service.get_system_config()` |

## Acceptance Criteria

1. 所有 18 个 ImageService 测试通过
2. 测试正确 mock ConfigService
3. 测试覆盖率保持不变

## Technical Details

### 更新 Fixture

**文件**: `server/tests/services/test_image_service.py`

```python
# 旧 fixture
@pytest.fixture
def image_service():
    """Provide an ImageService instance."""
    return ImageService(timeout=10.0, max_retries=3)

# 新 fixture
@pytest.fixture
def mock_config_service():
    """Provide a mock ConfigService."""
    from unittest.mock import AsyncMock, MagicMock
    from server.models.config import ProxyConfig
    from server.models.system import SystemConfig

    config_service = MagicMock()
    config_service.get_system_config = AsyncMock(return_value=SystemConfig(
        retry_count=3,
        concurrent_downloads=3,
        task_timeout=30
    ))
    config_service.get_proxy_config = AsyncMock(return_value=ProxyConfig())
    return config_service

@pytest.fixture
def image_service(mock_config_service):
    """Provide an ImageService instance."""
    return ImageService(config_service=mock_config_service)
```

### 需要检查的测试方法

部分测试可能需要调整以适应异步配置获取：

- `test_download_image_success` - 可能需要 mock 异步方法
- `test_download_image_timeout_retry` - 验证重试逻辑
- `test_download_batch_*` - 验证并发下载

## Tasks

- [ ] 创建 `mock_config_service` fixture
- [ ] 更新 `image_service` fixture
- [ ] 检查并更新需要异步 mock 的测试
- [ ] 运行测试验证修复

## Test Plan

```bash
pytest server/tests/services/test_image_service.py -v
```

## Files to Modify

| 文件 | 变更类型 |
|------|----------|
| `server/tests/services/test_image_service.py` | 更新 fixture 和测试 |

## Dependencies

- 需要了解 `SystemConfig` 模型结构
- 需要了解 `ProxyConfig` 模型结构

## Reference

**SystemConfig 模型** (`server/models/system.py`):
```python
class SystemConfig(BaseModel):
    retry_count: int = 3
    concurrent_downloads: int = 3
    task_timeout: int = 30
    # ...
```

**ImageService 构造函数** (`server/services/image_service.py`):
```python
def __init__(self, config_service: ConfigService):
    self.config_service = config_service
```
