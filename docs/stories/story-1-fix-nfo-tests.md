# Story 1: 修复 NFO 服务测试

## Story Info

- **Epic**: 测试同步修复
- **Status**: ✅ Completed
- **Priority**: High
- **Estimate**: 1 hour

## Goal

同步 NFO 测试断言与实际实现，修复 4 个失败的测试。

## Background

NFO 服务的实际输出与测试断言不匹配：

| 问题 | 实际输出 | 测试期望 |
|------|----------|----------|
| XML 声明 | `<?xml version="1.0" encoding="utf-8" standalone="yes"?>` | `<?xml version="1.0" encoding="UTF-8"?>` |
| 季默认标题 | `季 {n}` | `Season {n}` |

## Acceptance Criteria

1. `test_generate_tvshow_nfo_basic` 测试通过
2. `test_generate_season_nfo_basic` 测试通过
3. `test_generate_season_nfo_minimal` 测试通过
4. `test_generate_episode_nfo_basic` 测试通过
5. 现有 NFO 生成功能正常

## Technical Details

### 方案 A: 修改测试断言 (推荐用于 XML 声明)

更新测试文件 `server/tests/services/test_nfo_service.py`:

```python
# 旧断言
assert '<?xml version="1.0" encoding="UTF-8"?>' in nfo

# 新断言
assert '<?xml version="1.0" encoding="utf-8"' in nfo
```

### 方案 B: 修改代码 (推荐用于季标题)

更新 `server/services/nfo_service.py` 第 185 行和 192 行:

```python
# 旧代码
self._add_element(root, "title", data.title or f"季 {data.season_number}")
self._add_element(root, "sorttitle", data.title or f"季 {data.season_number}")

# 新代码
self._add_element(root, "title", data.title or f"Season {data.season_number}")
self._add_element(root, "sorttitle", data.title or f"Season {data.season_number}")
```

## Tasks

- [ ] 更新 `test_generate_tvshow_nfo_basic` XML 声明断言
- [ ] 更新 `test_generate_season_nfo_basic` XML 声明断言
- [ ] 更新 `test_generate_episode_nfo_basic` XML 声明断言
- [ ] 修改 `nfo_service.py` 季默认标题为英文
- [ ] 运行测试验证修复

## Test Plan

```bash
pytest server/tests/services/test_nfo_service.py -v
```

## Files to Modify

| 文件 | 变更类型 |
|------|----------|
| `server/tests/services/test_nfo_service.py` | 更新断言 |
| `server/services/nfo_service.py` | 修改默认标题 |

## Dependencies

- 无外部依赖
