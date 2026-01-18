# 数据库架构完善 - Brownfield Enhancement

## Epic Status: ✅ Completed

## Epic Goal

集中管理数据库表创建，消除重复代码，建立清晰的数据库架构层次，确保每个文件不超过 300 行代码。

## Epic Description

### Existing System Context

- **当前功能**: SQLite 数据库存储应用配置、用户认证、刮削任务等数据
- **技术栈**: Python 3.11+, aiosqlite, FastAPI, Pydantic
- **集成点**:
  - `server/core/database.py` - 数据库连接管理
  - `server/services/*_service.py` - 各服务独立创建表

### 当前问题

1. **表创建分散**: 12 个表分散在 7 个不同文件中
2. **重复定义**: `config` 和 `auth_config` 表在两处重复定义
3. **文件过大风险**: 如果集中到单文件可能超过 300 行

### Enhancement Details

**改动内容:**
- 创建 `server/core/db/` 模块，拆分数据库相关代码
- 集中所有表定义到专门的 schema 文件
- 移除服务中的重复表创建代码
- 添加数据库版本管理支持

**集成方式:**
- 保持现有 API 不变
- 服务层通过依赖注入获取数据库连接
- 表创建在应用启动时统一执行

**成功标准:**
- 所有表定义集中管理
- 无重复的表创建代码
- 每个文件不超过 300 行
- 现有功能正常运行

## Stories

### Story 1: 创建数据库模块结构

**目标**: 建立 `server/core/db/` 模块结构

**任务**:
- 创建 `server/core/db/__init__.py` - 模块入口
- 创建 `server/core/db/connection.py` - 连接池管理 (从 database.py 迁移)
- 创建 `server/core/db/schema.py` - 所有表定义
- 更新 `server/core/database.py` 为兼容层

**验收标准**:
- [ ] 模块结构创建完成
- [ ] 连接池功能正常
- [ ] 所有 12 个表定义集中在 schema.py
- [ ] 每个文件 ≤ 300 行

### Story 2: 迁移服务层表创建代码

**目标**: 移除服务中的重复表创建，使用统一的数据库初始化

**任务**:
- 移除 `config_service.py` 中的 `_ensure_db()` 方法中的表创建
- 移除 `auth_config_service.py` 中的表创建
- 移除 `history_service.py` 中的表创建
- 移除 `scheduler_service.py` 中的表创建
- 移除 `manual_job_service.py` 中的表创建
- 移除 `scrape_job_service.py` 中的表创建
- 移除 `scraped_file_service.py` 中的表创建
- 移除 `watcher_service.py` 中的表创建
- 保留迁移逻辑（ALTER TABLE）在各服务中

**验收标准**:
- [ ] 服务文件中无 CREATE TABLE 语句
- [ ] 迁移逻辑保留并正常工作
- [ ] 所有配置正确保存和读取
- [ ] 现有测试通过

### Story 3: 添加数据库版本管理

**目标**: 建立简单的数据库版本管理机制

**任务**:
- 创建 `server/core/db/migrations.py` - 迁移管理
- 添加 `db_version` 表记录数据库版本
- 将现有的 ALTER TABLE 迁移逻辑集中管理
- 添加迁移执行日志

**验收标准**:
- [ ] 数据库版本可追踪
- [ ] 迁移按顺序执行
- [ ] 迁移幂等（可重复执行）
- [ ] 每个文件 ≤ 300 行

## Compatibility Requirements

- [x] 现有 API 保持不变
- [x] 数据库 schema 向后兼容
- [x] 配置数据不丢失
- [x] 性能影响最小

## Risk Mitigation

- **主要风险**: 迁移过程中数据丢失或表结构损坏
- **缓解措施**:
  - 使用 `CREATE TABLE IF NOT EXISTS`
  - 迁移前备份数据库
  - 保留原有迁移逻辑
- **回滚计划**: 恢复原有 database.py 和服务文件

## Definition of Done

- [ ] 所有 Story 完成并通过验收标准
- [ ] 现有功能通过测试验证
- [ ] 数据库初始化正常工作
- [ ] 配置保存/读取正常
- [ ] 无代码重复
- [ ] 每个文件 ≤ 300 行

## 文件结构预览

```
server/core/
├── database.py          # 兼容层 (保留原有导出)
└── db/
    ├── __init__.py      # 模块入口，导出公共接口
    ├── connection.py    # 连接池管理 (~150 行)
    ├── schema.py        # 表定义 (~200 行)
    └── migrations.py    # 迁移管理 (~100 行)
```

## Story Manager Handoff

请为此 brownfield epic 开发详细的用户故事。关键考虑：

- 这是对现有 Python/FastAPI/aiosqlite 系统的增强
- 集成点: `server/core/database.py`, 所有 `*_service.py` 文件
- 遵循现有模式: 异步上下文管理器、依赖注入
- 关键兼容性要求: 保持现有 API 和数据不变
- 每个故事必须验证现有功能完整性
- **硬性要求**: 每个文件不超过 300 行代码

Epic 目标是在保持系统完整性的同时，建立清晰的数据库架构层次。
