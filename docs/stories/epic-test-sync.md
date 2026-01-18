# 测试同步修复 - Brownfield Enhancement

## Epic Status: ✅ Completed

## Epic Goal

修复测试与实际代码实现之间的不一致，确保所有单元测试通过，同时保持现有功能的正确性。

## Epic Description

### Existing System Context

- **当前功能**: MEHIT 媒体刮削器，包含 NFO 生成、模板命名、图片下载等核心服务
- **技术栈**: Python 3.11+, FastAPI, aiosqlite, pytest
- **集成点**:
  - `server/services/nfo_service.py` - NFO 文件生成
  - `server/services/template_service.py` - 文件命名模板
  - `server/services/image_service.py` - 图片下载服务
  - `server/models/template.py` - 模板数据模型

### 当前问题

共 24 个测试失败/错误：

| 类别 | 失败数 | 问题描述 |
|------|--------|----------|
| NFO 格式 | 4 | XML 声明格式、季默认标题语言 |
| 模板默认值 | 2 | `series_folder` 默认值断言错误 |
| ImageService | 18 | 构造函数签名变更，测试使用旧 API |

### Enhancement Details

**改动内容:**

1. **NFO 测试修复**: 更新测试断言以匹配实际 XML 输出格式
2. **季标题国际化**: 修改代码使用 "Season" 而非硬编码中文 "季"
3. **模板测试修复**: 更新测试断言以匹配实际默认值
4. **ImageService 测试修复**: 更新测试 fixture 使用新的依赖注入 API

**集成方式:**
- 测试修复不影响生产代码
- 代码修复（季标题）保持向后兼容

**成功标准:**
- 所有 272 个测试通过
- 现有功能正常运行
- 无回归问题

## Stories

### Story 1: 修复 NFO 服务测试

**目标**: 同步 NFO 测试断言与实际实现

**任务**:
- 更新 XML 声明断言：`UTF-8` → `utf-8 standalone="yes"`
- 修改 `generate_season_nfo` 默认标题：`季 {n}` → `Season {n}`
- 验证所有 NFO 测试通过

**验收标准**:
- [ ] `test_generate_tvshow_nfo_basic` 通过
- [ ] `test_generate_season_nfo_basic` 通过
- [ ] `test_generate_season_nfo_minimal` 通过
- [ ] `test_generate_episode_nfo_basic` 通过

### Story 2: 修复模板服务测试

**目标**: 同步模板测试断言与实际默认值

**任务**:
- 更新 `test_get_default_template` 断言：`{title}` → `{title} ({year})`
- 更新 API 测试中的相同断言
- 验证所有模板测试通过

**验收标准**:
- [ ] `test_template_service.py::test_get_default_template` 通过
- [ ] `test_templates.py::test_get_default_template` 通过

### Story 3: 修复 ImageService 测试

**目标**: 更新 ImageService 测试使用新的依赖注入 API

**任务**:
- 创建 mock `ConfigService` fixture
- 更新 `image_service` fixture 使用新签名
- 验证所有 ImageService 测试通过

**验收标准**:
- [ ] 所有 18 个 ImageService 测试通过
- [ ] 测试正确 mock 配置服务

## Compatibility Requirements

- [x] 现有 API 保持不变
- [x] 数据库 schema 无变更
- [x] UI 无影响
- [x] 性能影响最小

## Risk Mitigation

- **主要风险**: 修改季标题默认值可能影响现有用户的 NFO 文件
- **缓解措施**:
  - 季标题修改仅影响无标题时的默认值
  - 已有标题的季不受影响
- **回滚计划**: 恢复原有代码，测试断言改为匹配中文

## Definition of Done

- [ ] 所有 Story 完成并通过验收标准
- [ ] 272 个测试全部通过
- [ ] 无回归问题
- [ ] 代码审查完成

## Story Manager Handoff

请为此 brownfield epic 开发详细的用户故事。关键考虑：

- 这是对现有 Python/FastAPI/pytest 系统的测试修复
- 集成点: `nfo_service.py`, `template_service.py`, `image_service.py`
- 遵循现有模式: pytest fixtures, mock, 依赖注入
- 关键兼容性要求: 保持现有功能不变
- 每个故事必须验证现有功能完整性
