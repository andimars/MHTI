# Story 1.1.4：移除重复代码

## 基本信息

| 属性 | 值 |
|------|-----|
| Epic | 1.1 重构依赖注入容器 |
| 优先级 | P0 |
| 状态 | Draft |
| 依赖 | Story 1.1.3 |

---

## 描述

删除 `container.py` 中 20+ 个重复的 `get_xxx_service` 函数。

---

## 验收标准

- [ ] 删除所有 `_get_simple_service` 调用
- [ ] 删除所有 `get_xxx_service` 函数
- [ ] 使用统一的 `container.resolve()` 替代
- [ ] 所有测试通过

---

## 技术细节

**修改文件：**
- `server/core/container.py`
- 所有使用 `get_xxx_service` 的文件

**预计删除代码行数：** ~200 行
