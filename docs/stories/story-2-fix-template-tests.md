# Story 2: 修复模板服务测试

## Story Info

- **Epic**: 测试同步修复
- **Status**: ✅ Completed
- **Priority**: High
- **Estimate**: 30 minutes

## Goal

同步模板测试断言与实际默认值，修复 2 个失败的测试。

## Background

模板服务的默认值与测试断言不匹配：

| 字段 | 实际默认值 | 测试期望 |
|------|------------|----------|
| `series_folder` | `{title} ({year})` | `{title}` |

**分析**: `{title} ({year})` 是更好的默认值，因为它能区分同名但不同年份的剧集。应该修改测试而非代码。

## Acceptance Criteria

1. `test_template_service.py::test_get_default_template` 测试通过
2. `test_templates.py::test_get_default_template` 测试通过
3. 模板服务功能正常

## Technical Details

### 修改测试断言

**文件 1**: `server/tests/services/test_template_service.py`

```python
# 旧断言 (第 21 行)
assert template.series_folder == "{title}"

# 新断言
assert template.series_folder == "{title} ({year})"
```

**文件 2**: `server/tests/api/test_templates.py`

```python
# 旧断言 (第 27 行)
assert data["series_folder"] == "{title}"

# 新断言
assert data["series_folder"] == "{title} ({year})"
```

## Tasks

- [ ] 更新 `test_template_service.py` 中的断言
- [ ] 更新 `test_templates.py` 中的断言
- [ ] 运行测试验证修复

## Test Plan

```bash
pytest server/tests/services/test_template_service.py server/tests/api/test_templates.py -v
```

## Files to Modify

| 文件 | 变更类型 |
|------|----------|
| `server/tests/services/test_template_service.py` | 更新断言 |
| `server/tests/api/test_templates.py` | 更新断言 |

## Dependencies

- 无外部依赖
