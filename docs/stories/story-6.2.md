# Story 6.2：日志 API 端点实现

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | [6 日志系统增强](../prd/epic-6-logging.md) |
| 优先级 | P0 |
| 状态 | Ready |
| 估时 | 1.5h |
| 依赖 | Story 6.1 |

---

## User Story

**As a** 系统管理员,
**I want** 通过 REST API 查询、配置和管理日志,
**So that** 前端界面可以展示日志数据并提供管理功能。

---

## 验收标准

### 功能需求

- [ ] `GET /api/logs` 支持分页、级别/模块过滤、时间范围、关键词搜索
- [ ] `GET /api/logs/stats` 返回按级别和模块的统计信息
- [ ] `GET /api/logs/config` 返回当前日志配置
- [ ] `PUT /api/logs/config` 更新日志配置并动态生效
- [ ] `DELETE /api/logs` 支持按时间范围或级别清理日志
- [ ] `GET /api/logs/download` 下载日志文件（CSV/JSON 格式）
- [ ] WebSocket 支持 `logs` 频道订阅，实时推送新日志

### 集成需求

- [ ] 使用 `APIRouter`，前缀 `/api/logs`
- [ ] 使用现有 `server/core/exceptions.py` 异常类
- [ ] 所有端点需要 JWT 认证（使用现有 `get_current_user` 依赖）
- [ ] 在现有 `/ws` 端点添加日志订阅处理

### 质量需求

- [ ] `test_logs.py` 覆盖所有端点
- [ ] 所有端点有完整的 docstring 和响应模型
- [ ] 其他 API 端点正常工作

---

## 任务

- [ ] 1. 创建响应模型 `server/models/dto/responses/log_responses.py`
  - [ ] 1.1 定义 `LogListResponse`
  - [ ] 1.2 定义 `LogStatsResponse`
  - [ ] 1.3 定义 `LogConfigResponse`
  - [ ] 1.4 定义 `ClearLogsResponse`

- [ ] 2. 创建 API 路由 `server/api/logs.py`
  - [ ] 2.1 实现 `GET /api/logs` 日志查询
  - [ ] 2.2 实现 `GET /api/logs/stats` 统计
  - [ ] 2.3 实现 `GET /api/logs/config` 配置读取
  - [ ] 2.4 实现 `PUT /api/logs/config` 配置更新
  - [ ] 2.5 实现 `DELETE /api/logs` 清理
  - [ ] 2.6 实现 `GET /api/logs/download` 下载

- [ ] 3. 注册路由到 `server/main.py`
  - [ ] 3.1 导入 `logs_router`
  - [ ] 3.2 添加 `app.include_router(logs_router)`

- [ ] 4. 扩展 WebSocket `server/api/websocket.py`
  - [ ] 4.1 添加 `logs` 频道订阅处理
  - [ ] 4.2 实现日志推送逻辑
  - [ ] 4.3 支持按级别过滤

- [ ] 5. 修改 LogService 添加 WebSocket 推送
  - [ ] 5.1 在日志写入时推送到订阅者
  - [ ] 5.2 支持按配置启用/禁用

- [ ] 6. 编写测试 `server/tests/api/test_logs.py`
  - [ ] 6.1 测试日志查询端点
  - [ ] 6.2 测试统计端点
  - [ ] 6.3 测试配置端点
  - [ ] 6.4 测试清理端点
  - [ ] 6.5 测试下载端点

---

## 技术说明

### 新增文件

```
server/
├── api/
│   └── logs.py                # 日志 API 路由
├── models/dto/responses/
│   └── log_responses.py       # 日志响应模型
└── tests/api/
    └── test_logs.py           # API 测试
```

### API 端点详情

```python
# server/api/logs.py

router = APIRouter(prefix="/api/logs", tags=["logs"])

@router.get("")
async def get_logs(
    level: LogLevel | None = None,
    logger: str | None = None,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    search: str | None = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
) -> LogListResponse:
    """查询日志列表，支持分页和过滤"""

@router.get("/stats")
async def get_log_stats(
    current_user: User = Depends(get_current_user),
) -> LogStatsResponse:
    """获取日志统计信息"""

@router.get("/config")
async def get_log_config(
    current_user: User = Depends(get_current_user),
) -> LogConfigResponse:
    """获取当前日志配置"""

@router.put("/config")
async def update_log_config(
    config: LogConfigUpdate,
    current_user: User = Depends(get_current_user),
) -> LogConfigResponse:
    """更新日志配置，动态生效"""

@router.delete("")
async def clear_logs(
    before: datetime | None = None,
    level: LogLevel | None = None,
    current_user: User = Depends(get_current_user),
) -> ClearLogsResponse:
    """清理日志，支持按时间和级别"""

@router.get("/download")
async def download_logs(
    format: Literal["csv", "json"] = "json",
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    """下载日志文件"""
```

### WebSocket 消息格式

```json
// 客户端订阅
{"type": "subscribe", "channel": "logs", "filter": {"level": "ERROR"}}

// 取消订阅
{"type": "unsubscribe", "channel": "logs"}

// 服务端推送
{
  "type": "log",
  "data": {
    "id": 123,
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "ERROR",
    "logger": "server.services.scraper",
    "message": "Failed to fetch metadata"
  }
}
```

### 关键约束

- 查询限制：最大 1000 条/请求
- 下载限制：最大 10000 条/文件
- WebSocket 推送：仅推送 INFO 及以上级别

---

## 风险缓解

| 类型 | 内容 |
|------|------|
| **主要风险** | 大量日志查询可能影响数据库性能 |
| **缓解措施** | 分页限制、索引优化、查询超时 |
| **回滚方案** | 1. 从 `main.py` 移除路由注册<br>2. 删除 `server/api/logs.py`<br>3. 撤销 WebSocket 修改 |

---

## Definition of Done

- [ ] `server/api/logs.py` 创建完成
- [ ] `server/models/dto/responses/log_responses.py` 创建完成
- [ ] 路由注册到 `server/main.py`
- [ ] WebSocket 日志订阅功能完成
- [ ] API 测试通过
- [ ] OpenAPI 文档完整
- [ ] 现有 API 回归测试通过
