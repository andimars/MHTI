# Story 1: 创建数据库模块结构

## Story Info

- **Epic**: 数据库架构完善
- **Status**: ✅ Completed
- **Priority**: High

## Goal

建立 `server/core/db/` 模块结构，将数据库连接管理和表定义从单一文件拆分为模块化结构。

## Acceptance Criteria

1. 创建 `server/core/db/` 目录结构
2. `connection.py` 包含连接池管理，≤ 150 行
3. `schema.py` 包含所有 12 个表定义，≤ 200 行
4. `__init__.py` 导出公共接口
5. `database.py` 作为兼容层保留原有导出
6. 所有现有测试通过

## Technical Details

### 需要迁移的表

| 表名 | 原位置 | 用途 |
|------|--------|------|
| config | database.py | 应用配置 |
| admin | database.py | 管理员账户 |
| sessions | database.py | 会话管理 |
| login_history | database.py | 登录历史 |
| login_attempts | database.py | 登录尝试 |
| auth_config | database.py | 认证配置 |
| manual_jobs | manual_job_service.py | 手动任务 |
| scheduled_tasks | scheduler_service.py | 定时任务 |
| history_records | history_service.py | 历史记录 |
| scrape_jobs | scrape_job_service.py | 刮削任务 |
| scraped_files | scraped_file_service.py | 已刮削文件 |
| watched_folders | watcher_service.py | 监控文件夹 |

### 文件结构

```
server/core/
├── database.py          # 兼容层
└── db/
    ├── __init__.py      # 模块入口
    ├── connection.py    # 连接池 (~150 行)
    └── schema.py        # 表定义 (~200 行)
```

## Tasks

- [ ] 创建 `server/core/db/` 目录
- [ ] 创建 `connection.py` - 迁移连接池代码
- [ ] 创建 `schema.py` - 集中所有表定义
- [ ] 创建 `__init__.py` - 导出公共接口
- [ ] 更新 `database.py` 为兼容层
- [ ] 验证现有功能正常

## Dependencies

- 无外部依赖
- 需要在 Story 2 之前完成

## Test Plan

1. 运行现有测试套件
2. 验证数据库初始化
3. 验证配置保存/读取
4. 验证认证功能
