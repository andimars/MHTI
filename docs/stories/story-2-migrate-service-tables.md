# Story 2: 迁移服务层表创建代码

## Story Info

- **Epic**: 数据库架构完善
- **Status**: ✅ Completed
- **Priority**: High

## Goal

移除服务中的重复表创建代码，使用统一的数据库初始化。

## Completed Tasks

- [x] 移除 `config_service.py` 中的 CREATE TABLE（保留测试支持）
- [x] 移除 `auth_config_service.py` 中的 CREATE TABLE
- [x] 移除 `history_service.py` 中的 CREATE TABLE（保留迁移逻辑）
- [x] 移除 `scheduler_service.py` 中的 CREATE TABLE
- [x] 移除 `manual_job_service.py` 中的 CREATE TABLE（保留迁移逻辑）
- [x] 移除 `scrape_job_service.py` 中的 CREATE TABLE（保留迁移逻辑）
- [x] 移除 `scraped_file_service.py` 中的 CREATE TABLE
- [x] 移除 `watcher_service.py` 中的 CREATE TABLE（保留迁移逻辑）

## Verification

- [x] 所有 CREATE TABLE 语句集中在 `schema.py`
- [x] 迁移逻辑（ALTER TABLE）保留在各服务中
- [x] 配置服务测试全部通过 (12/12)
- [x] 现有功能正常运行

## Changes Summary

| 文件 | 变更 |
|------|------|
| config_service.py | 移除 CREATE TABLE，添加测试路径支持 |
| auth_config_service.py | `_ensure_table` 改为 no-op |
| history_service.py | 移除 CREATE TABLE，保留 ALTER TABLE 迁移 |
| scheduler_service.py | 移除 CREATE TABLE |
| manual_job_service.py | 移除 CREATE TABLE，保留 ALTER TABLE 迁移 |
| scrape_job_service.py | 移除 CREATE TABLE，保留 ALTER TABLE 迁移 |
| scraped_file_service.py | 移除 CREATE TABLE |
| watcher_service.py | 移除 CREATE TABLE，保留 ALTER TABLE 迁移 |
