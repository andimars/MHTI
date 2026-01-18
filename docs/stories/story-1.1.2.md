# Story 1.1.2：引入 @injectable 装饰器

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | 1.1 重构依赖注入容器 |
| 优先级 | P0 |
| 状态 | Draft |
| 依赖 | Story 1.1.1 |

---

## 描述

实现 `@injectable` 装饰器，支持自动服务注册。

---

## 验收标准

- [ ] 装饰器支持 `scope` 参数 (SINGLETON/TRANSIENT)
- [ ] 自动扫描并注册标记的服务
- [ ] 支持依赖自动解析

---

## 技术细节

**新增文件：**
- `server/core/decorators.py`

**参考实现：**
```python
@injectable(scope=Scope.SINGLETON)
class ConfigService:
    ...
```
