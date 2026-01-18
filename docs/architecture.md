# MEHIT 后端框架重构 - 架构设计文档

## 文档信息

| 属性 | 值 |
|------|-----|
| 版本 | v1.0 |
| 状态 | Draft |
| 创建日期 | 2026-01-16 |

---

## 1. 架构概述

### 1.1 设计原则

| 原则 | 应用 |
|------|------|
| SOLID | 单一职责、开闭原则、依赖倒置 |
| KISS | 保持简单，避免过度设计 |
| DRY | 消除重复代码 |

### 1.2 目标架构

```
server/
├── core/                 # 核心基础设施
│   ├── container.py      # DI 容器
│   ├── interfaces/       # 服务接口定义
│   └── exceptions.py     # 异常层次
├── repositories/         # 数据访问层 (新增)
├── services/             # 业务逻辑层
├── api/                  # API 路由层
└── models/               # 数据模型
    ├── dto/              # 数据传输对象
    └── entities/         # 领域实体
```

---

## 2. 核心层设计

### 2.1 依赖注入容器

```python
# server/core/container.py
from typing import TypeVar, Type

T = TypeVar("T")

class Container:
    def resolve(self, service_type: Type[T]) -> T:
        """类型安全的服务解析"""
        ...

def injectable(scope: Scope = Scope.SINGLETON):
    """服务注册装饰器"""
    ...
```

### 2.2 服务接口

```python
# server/core/interfaces/config.py
from typing import Protocol

class IConfigService(Protocol):
    async def get_tmdb_cookie(self) -> str | None: ...
    async def get_tmdb_api_token(self) -> str | None: ...
```

---

## 3. Repository 层设计

```python
# server/repositories/base.py
from typing import Generic, TypeVar

T = TypeVar("T")

class BaseRepository(Generic[T]):
    async def get_by_id(self, id: int) -> T | None: ...
    async def get_all(self) -> list[T]: ...
    async def create(self, entity: T) -> T: ...
    async def update(self, entity: T) -> T: ...
    async def delete(self, id: int) -> bool: ...
```

---

## 4. 服务层设计

### 4.1 服务拆分

```
server/services/scraper/
├── __init__.py
├── workflow.py      # 刮削工作流
├── batch.py         # 批量处理
├── preview.py       # 预览生成
└── facade.py        # 统一入口
```

### 4.2 缓存装饰器

```python
from functools import wraps

def cached(ttl: int = 300):
    """内存缓存装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 缓存逻辑
            ...
        return wrapper
    return decorator
```

---

## 5. API 层设计

### 5.1 统一响应格式

```python
# server/models/dto/responses/base.py
class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    meta: ResponseMeta | None = None

class PaginatedResponse(ApiResponse[list[T]]):
    pagination: PaginationInfo
```

### 5.2 路由自动发现

```python
# server/api/__init__.py
def auto_discover_routers():
    """自动扫描并返回所有路由"""
    ...
```

---

## 6. 迁移策略

| 阶段 | 策略 |
|------|------|
| 核心层 | 新建接口，逐步迁移 |
| 服务层 | 门面模式保持兼容 |
| API 层 | 渐进式替换 |
| 模型层 | 并行运行，逐步切换 |

---

## 7. 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| 破坏现有功能 | 保持 API 兼容，充分测试 |
| 重构周期过长 | 分阶段交付，优先 P0 |
| 性能回退 | 基准测试对比 |
