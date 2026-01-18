# Story 1.1.1：实现泛型 DI 容器

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | 1.1 重构依赖注入容器 |
| 优先级 | P0 |
| 状态 | Draft |

---

## 描述

重构现有 `ServiceContainer`，实现类型安全的泛型依赖注入容器。

---

## 验收标准

- [ ] 支持 `container.resolve(Type[T]) -> T` 类型推断
- [ ] 支持 Singleton 和 Transient 作用域
- [ ] 移除返回 `Any` 的方法
- [ ] 现有测试通过

---

## 技术细节

**修改文件：**
- `server/core/container.py`

**参考实现：**
```python
T = TypeVar("T")

class Container:
    def resolve(self, service_type: Type[T]) -> T:
        ...
```
