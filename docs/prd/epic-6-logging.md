# Epic 6：日志系统增强 - Brownfield Enhancement

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic ID | 6 |
| 类型 | Brownfield Enhancement |
| 状态 | Ready |
| Stories | 3 |
| 总估时 | 5.5h |

---

## Epic Goal

为 MHTI 应用添加完整的日志管理功能，使用户能够在 Web 界面中查看、搜索、过滤和管理应用日志，提升运维和问题排查效率。

---

## Epic Description

### 现有系统上下文

| 方面 | 描述 |
|------|------|
| 当前功能 | 使用 Python `logging` 模块输出日志到控制台，无持久化存储，无前端查看界面 |
| 技术栈 | FastAPI + SQLite（后端）、Vue 3 + Naive UI + Pinia（前端） |
| 集成点 | `/api/config` 配置 API、`/ws` WebSocket、`SettingsPage.vue` 系统设置 Tab |

### 增强详情

| 方面 | 描述 |
|------|------|
| 添加内容 | 1. 数据库日志存储<br>2. 日志 API 端点<br>3. 日志管理 UI 组件<br>4. 实时日志推送 |
| 集成方式 | 扩展现有数据库 schema、新增 API 路由、在系统设置 Tab 中添加日志卡片 |
| 成功标准 | ✅ 日志可配置级别（DEBUG-CRITICAL）<br>✅ 支持分页查询和过滤<br>✅ 实时日志流显示<br>✅ 可下载日志文件<br>✅ 自动清理过期日志 |

---

## Stories

| Story | 标题 | 估时 | 状态 |
|-------|------|------|------|
| [6.1](../stories/story-6.1.md) | 后端日志架构重构 | 2h | Ready |
| [6.2](../stories/story-6.2.md) | 日志 API 端点实现 | 1.5h | Ready |
| [6.3](../stories/story-6.3.md) | 前端日志管理组件 | 2h | Ready |

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Vue 3)                         │
├─────────────────────────────────────────────────────────────────┤
│  LogSettings.vue  │  logs.ts (API)  │  useWebSocket (实时)      │
└────────────┬──────────────┬─────────────────┬───────────────────┘
             │              │                 │
             ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend (FastAPI)                         │
├─────────────────────────────────────────────────────────────────┤
│  /api/logs (Router)  │  LogService  │  WebSocket (logs channel) │
└────────────┬─────────────┬──────────────────┬───────────────────┘
             │             │                  │
             ▼             ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Storage                                 │
├─────────────────────────────────────────────────────────────────┤
│  SQLite (logs, log_config)  │  File (data/logs/app.log)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 数据库 Schema

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

INSERT OR IGNORE INTO log_config (id) VALUES (1);
```

---

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/logs` | 查询日志列表（支持分页、过滤） |
| GET | `/api/logs/stats` | 获取日志统计信息 |
| GET | `/api/logs/config` | 获取日志配置 |
| PUT | `/api/logs/config` | 更新日志配置 |
| DELETE | `/api/logs` | 清理日志（按时间范围或级别） |
| GET | `/api/logs/download` | 下载日志文件 |
| WS | `/ws` | 实时日志推送（logs 频道） |

---

## 兼容性要求

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ✅ 现有 API 不变 | 通过 | 新增 `/api/logs` 端点，不修改现有端点 |
| ✅ 数据库向后兼容 | 通过 | 仅新增 `logs` 和 `log_config` 表 |
| ✅ UI 遵循现有模式 | 通过 | 使用 Naive UI 组件，遵循 SettingsPage 现有 Tab 结构 |
| ✅ 性能影响最小 | 通过 | 批量写入、分页查询、虚拟滚动 |

---

## 风险缓解

| 类型 | 内容 |
|------|------|
| **主要风险** | 高频日志写入可能影响数据库性能 |
| **缓解措施** | 1. 批量写入（50条/批）<br>2. 可配置启用/禁用数据库日志<br>3. 自动清理过期记录 |
| **回滚计划** | 1. 删除 `logs`、`log_config` 表<br>2. 移除 `log_router` 路由注册<br>3. 恢复 `main.py` 原始日志配置<br>4. 删除前端 `LogSettings.vue` 组件 |

---

## Definition of Done

- [ ] 所有 3 个 Story 完成并通过验收标准
- [ ] 现有功能通过测试验证（刮削、配置、监控等）
- [ ] 日志 API 端点正常工作（查询、配置、清理、下载）
- [ ] WebSocket 实时日志推送正常
- [ ] 前端日志界面功能完整（配置、查看、过滤、下载）
- [ ] 无现有功能回归
