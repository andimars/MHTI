# Story 6.1：后端日志架构重构

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | [6 日志系统增强](../prd/epic-6-logging.md) |
| 优先级 | P0 |
| 状态 | Ready |
| 估时 | 2h |

---

## User Story

**As a** 系统管理员,
**I want** 应用日志能够持久化存储到数据库和文件,
**So that** 我可以在 Web 界面查看历史日志，并在出现问题时快速排查。

---

## 验收标准

### 功能需求

- [ ] `server/models/log.py` 包含 `LogEntry`、`LogConfig`、`LogLevel` Pydantic 模型
- [ ] `logs` 表和 `log_config` 表在应用启动时自动创建
- [ ] `DatabaseLogHandler` 类支持批量写入（50条/批）
- [ ] 使用 `RotatingFileHandler`，支持文件滚动（默认 10MB/文件，保留 5 个）
- [ ] `LogService` 类提供日志查询、配置管理、清理功能
- [ ] 支持运行时切换日志级别和启用/禁用各输出渠道

### 集成需求

- [ ] 控制台日志格式和内容保持一致
- [ ] `LogService` 注册到服务容器 (`server/core/container.py`)
- [ ] 使用现有 `DatabaseManager` 连接池

### 质量需求

- [ ] `test_log_service.py` 覆盖核心功能
- [ ] 日志写入不阻塞主线程（异步批量写入）
- [ ] 刮削、配置、监控等功能正常工作

---

## 任务

- [ ] 1. 创建数据模型 `server/models/log.py`
  - [ ] 1.1 定义 `LogLevel` 枚举 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
  - [ ] 1.2 定义 `LogEntry` 模型
  - [ ] 1.3 定义 `LogConfig` 模型
  - [ ] 1.4 定义 `LogQuery` 模型

- [ ] 2. 创建数据库表
  - [ ] 2.1 在 `server/core/db/` 添加日志表迁移
  - [ ] 2.2 创建 `logs` 表（id, timestamp, level, logger, message, extra_data, request_id, user_id）
  - [ ] 2.3 创建 `log_config` 表（单例配置）
  - [ ] 2.4 添加索引（timestamp, level）

- [ ] 3. 创建日志处理器 `server/core/log_handler.py`
  - [ ] 3.1 实现 `DatabaseLogHandler` 类
  - [ ] 3.2 实现批量写入逻辑（50条/批或5秒）
  - [ ] 3.3 实现异步写入

- [ ] 4. 创建日志服务 `server/services/log_service.py`
  - [ ] 4.1 实现 `get_logs()` 分页查询
  - [ ] 4.2 实现 `get_stats()` 统计
  - [ ] 4.3 实现 `get_config()` / `update_config()`
  - [ ] 4.4 实现 `clear_logs()` 清理
  - [ ] 4.5 实现 `batch_insert()` 批量插入
  - [ ] 4.6 实现自动清理过期日志

- [ ] 5. 集成到服务容器
  - [ ] 5.1 在 `server/core/container.py` 注册 `LogService`
  - [ ] 5.2 添加 `get_log_service()` 函数

- [ ] 6. 修改日志配置 `server/main.py`
  - [ ] 6.1 加载数据库日志配置
  - [ ] 6.2 注册 `DatabaseLogHandler`
  - [ ] 6.3 注册 `RotatingFileHandler`
  - [ ] 6.4 保持控制台输出

- [ ] 7. 编写测试 `server/tests/services/test_log_service.py`
  - [ ] 7.1 测试日志查询
  - [ ] 7.2 测试配置管理
  - [ ] 7.3 测试日志清理
  - [ ] 7.4 测试批量插入

---

## 技术说明

### 新增文件

```
server/
├── models/
│   └── log.py                 # 日志数据模型
├── services/
│   └── log_service.py         # 日志服务
├── core/
│   └── log_handler.py         # 自定义日志处理器
└── tests/services/
    └── test_log_service.py    # 单元测试
```

### 数据库 Schema

```sql
-- logs 表
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    level TEXT NOT NULL,
    logger TEXT NOT NULL,
    message TEXT NOT NULL,
    extra_data TEXT,
    request_id TEXT,
    user_id INTEGER
);

CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_level ON logs(level);

-- log_config 表
CREATE TABLE IF NOT EXISTS log_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    log_level TEXT DEFAULT 'INFO',
    console_enabled INTEGER DEFAULT 1,
    file_enabled INTEGER DEFAULT 1,
    db_enabled INTEGER DEFAULT 1,
    max_file_size_mb INTEGER DEFAULT 10,
    max_file_count INTEGER DEFAULT 5,
    db_retention_days INTEGER DEFAULT 30,
    realtime_enabled INTEGER DEFAULT 1
);
```

### 关键约束

- 日志写入必须异步，不阻塞请求处理
- 批量写入阈值：50 条或 5 秒
- 数据库日志默认保留 30 天
- 文件日志默认 10MB/文件，保留 5 个

---

## 风险缓解

| 类型 | 内容 |
|------|------|
| **主要风险** | 高频日志写入可能导致数据库锁竞争 |
| **缓解措施** | 批量异步写入、单独连接池 |
| **回滚方案** | 1. 恢复 `main.py` 原始日志配置<br>2. 删除新增的 3 个文件<br>3. 删除数据库表 |

---

## Definition of Done

- [ ] `server/models/log.py` 创建完成
- [ ] `server/services/log_service.py` 创建完成
- [ ] `server/core/log_handler.py` 创建完成
- [ ] 数据库表自动迁移完成
- [ ] `LogService` 注册到服务容器
- [ ] `server/main.py` 集成新日志配置
- [ ] 单元测试通过
- [ ] 现有功能回归测试通过
