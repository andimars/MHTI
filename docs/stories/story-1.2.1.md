# Story 1.2.1：定义核心服务 Protocol

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | 1.2 引入服务接口抽象 |
| 优先级 | P0 |
| 状态 | Draft |

---

## 描述

创建 `interfaces/` 目录，定义核心服务的 Protocol 接口。

---

## 验收标准

- [ ] 创建 `server/core/interfaces/` 目录
- [ ] 定义 `IConfigService` Protocol
- [ ] 定义 `ITMDBService` Protocol
- [ ] 定义 `IScraperService` Protocol

---

## 技术细节

**新增文件：**
- `server/core/interfaces/__init__.py`
- `server/core/interfaces/config.py`
- `server/core/interfaces/tmdb.py`
- `server/core/interfaces/scraper.py`
