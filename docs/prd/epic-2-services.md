# Epic 2：服务层重构

## 概述

| 属性 | 值 |
|------|-----|
| 阶段 | 第二阶段 |
| 优先级 | P0-P1 |
| Epic 数 | 4 |
| Story 数 | 17 |

---

## Epic 2.1：拆分大型服务类

### Stories

- [ ] 2.1.1 分析 ScraperService 职责
- [ ] 2.1.2 拆分刮削工作流
- [ ] 2.1.3 拆分批量处理
- [ ] 2.1.4 拆分预览功能
- [ ] 2.1.5 拆分 HistoryService

---

## Epic 2.2：引入 Repository 模式

### Stories

- [ ] 2.2.1 定义 Repository 基类
- [ ] 2.2.2 实现 HistoryRepository
- [ ] 2.2.3 实现 ConfigRepository
- [ ] 2.2.4 实现 WatcherRepository
- [ ] 2.2.5 迁移现有 Service

---

## Epic 2.3：实现缓存策略

### Stories

- [ ] 2.3.1 实现内存缓存装饰器
- [ ] 2.3.2 TMDB 响应缓存
- [ ] 2.3.3 配置缓存
- [ ] 2.3.4 缓存监控

---

## Epic 2.4：优化异步处理

### Stories

- [ ] 2.4.1 识别可并行操作
- [ ] 2.4.2 实现并发控制
- [ ] 2.4.3 引入任务队列
