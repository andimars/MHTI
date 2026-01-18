# Story 1.1.3：统一依赖声明

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | 1.1 重构依赖注入容器 |
| 优先级 | P0 |
| 状态 | Draft |
| 依赖 | Story 1.1.2 |

---

## 描述

重构服务类，通过构造函数显式声明依赖。

---

## 验收标准

- [ ] 移除服务内部的懒加载导入
- [ ] 依赖通过构造函数参数声明
- [ ] 容器自动解析依赖链

---

## 技术细节

**修改文件：**
- `server/services/scraper_service.py`
- `server/services/tmdb_service.py`
- 其他有依赖的服务

**重构前：**
```python
def __init__(self, config_service=None):
    from server.core.container import get_config_service
    self.config = config_service or get_config_service()
```

**重构后：**
```python
def __init__(self, config: IConfigService):
    self.config = config
```
