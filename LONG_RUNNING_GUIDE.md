# 长时间运行支持文档

## 概述

oh-my-novel 插件现在完全支持长时间运行的小说生成任务，可以生成任意数量的章节，具有以下特性：

- ✅ **持久化状态存储**：所有生成状态自动保存到文件系统
- ✅ **自动检查点**：定期保存进度，防止数据丢失
- ✅ **断点续传**：可以随时暂停和恢复生成
- ✅ **错误重试机制**：失败的章节自动重试，可配置重试次数和延迟
- ✅ **批量处理**：支持批量生成多个章节，提高效率
- ✅ **内存优化**：使用流式处理，避免内存溢出
- ✅ **进度跟踪**：实时查看生成进度和状态
- ✅ **并发任务管理**：支持同时运行多个小说生成任务

## 核心组件

### 1. StateManager (状态管理器)

位置：`src/utils/StateManager.ts`

负责管理生成状态的持久化存储。

**主要功能：**
- 保存和加载生成状态
- 列出所有保存的状态
- 删除状态文件
- 导出状态为 JSON

**使用示例：**
```typescript
import { StateManager } from "./utils/StateManager";

const stateManager = new StateManager();

// 保存状态
stateManager.saveState("novel-001", {
  novelTitle: "龙之契约",
  currentChapter: 10,
  generatedChapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  failedChapters: [],
  status: "running",
  lastUpdate: new Date().toISOString()
});

// 加载状态
const state = stateManager.loadState("novel-001");

// 列出所有状态
const allStates = stateManager.listStates();
```

### 2. LongRunningGenerator (长时间运行生成器)

位置：`src/utils/LongRunningGenerator.ts`

负责执行长时间运行的小说生成任务。

**主要功能：**
- 异步批量生成章节
- 支持暂停和恢复
- 错误重试机制
- 进度跟踪
- 内存优化

**使用示例：**
```typescript
import { LongRunningGenerator } from "./utils/LongRunningGenerator";
import { stateManager } from "./utils/StateManager";

const generator = new LongRunningGenerator("novel-001", {
  novelTitle: "龙之契约",
  totalChapters: 100,
  batchSize: 5,
  maxRetries: 3,
  retryDelay: 5000,
  pauseOnError: true
});

// 启动生成
await generator.start();

// 暂停生成
await generator.pause();

// 恢复生成
await generator.resume();

// 获取进度
const progress = generator.getProgress();
console.log(`进度: ${progress.percentage.toFixed(2)}%`);
```

### 3. 长时间运行工具集

位置：`src/tools/long-running.ts`

提供 7 个专用工具用于管理长时间运行任务。

#### 3.1 start_long_running_generation

启动长时间运行的小说生成任务。

**参数：**
- `generationId` (string): 生成任务唯一标识
- `novelTitle` (string): 小说标题
- `totalChapters` (number): 总章节数
- `config` (object): 配置选项
  - `batchSize` (number): 每批生成的章节数（默认：5）
  - `maxRetries` (number): 最大重试次数（默认：3）
  - `retryDelay` (number): 重试延迟毫秒数（默认：5000）
  - `pauseOnError` (boolean): 遇到错误是否暂停（默认：true）

**返回：**
```json
{
  "success": true,
  "generationId": "novel-001",
  "status": "running",
  "message": "生成任务已启动"
}
```

#### 3.2 check_generation_progress

检查生成任务的进度。

**参数：**
- `generationId` (string): 生成任务标识

**返回：**
```json
{
  "success": true,
  "generationId": "novel-001",
  "status": "running",
  "progress": {
    "totalChapters": 100,
    "generatedChapters": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "failedChapters": [],
    "currentChapter": 11,
    "percentage": 10.0,
    "lastUpdate": "2026-01-18T14:30:00.000Z"
  }
}
```

#### 3.3 pause_generation

暂停正在运行的生成任务。

**参数：**
- `generationId` (string): 生成任务标识

**返回：**
```json
{
  "success": true,
  "generationId": "novel-001",
  "status": "paused",
  "message": "生成任务已暂停"
}
```

#### 3.4 resume_generation

恢复暂停或失败的生成任务。

**参数：**
- `generationId` (string): 生成任务标识
- `fromCheckpoint` (boolean): 是否从检查点恢复（默认：true）

**返回：**
```json
{
  "success": true,
  "generationId": "novel-001",
  "status": "running",
  "message": "生成任务已恢复",
  "resumedFrom": "checkpoint"
}
```

#### 3.5 list_all_generations

列出所有活跃和已保存的生成任务。

**参数：**
无

**返回：**
```json
{
  "success": true,
  "generations": [
    {
      "generationId": "novel-001",
      "novelTitle": "龙之契约",
      "status": "running",
      "progress": 10.0,
      "lastUpdate": "2026-01-18T14:30:00.000Z"
    },
    {
      "generationId": "novel-002",
      "novelTitle": "星际迷航",
      "status": "paused",
      "progress": 45.5,
      "lastUpdate": "2026-01-18T13:20:00.000Z"
    }
  ]
}
```

#### 3.6 delete_generation_state

删除生成任务的状态文件。

**参数：**
- `generationId` (string): 生成任务标识
- `stopIfRunning` (boolean): 如果任务正在运行是否停止（默认：true）

**返回：**
```json
{
  "success": true,
  "generationId": "novel-001",
  "message": "生成任务已删除"
}
```

#### 3.7 export_generation_state

导出生成任务的状态为 JSON 文件。

**参数：**
- `generationId` (string): 生成任务标识
- `outputPath` (string): 输出文件路径（可选）

**返回：**
```json
{
  "success": true,
  "generationId": "novel-001",
  "exportPath": "/home/admin/workspace/oh-my-novel/exports/novel-001-state.json",
  "message": "状态已导出"
}
```

### 4. 长时间运行 Hooks

位置：`src/hooks/long-running-hooks.ts`

提供自动化钩子以增强长时间运行任务。

#### 4.1 longRunningMonitor

监控长时间运行任务并自动保存检查点。

**触发时机：** 定期自动触发

**功能：**
- 监控任务状态
- 自动保存检查点
- 更新最后检查时间

#### 4.2 errorRecovery

尝试自动从错误中恢复。

**触发时机：** 工具执行出错时

**功能：**
- 记录错误日志
- 查找最近的备份
- 提供恢复选项

### 5. 长时间运行 Skill

位置：`src/skills/long-running-skill.ts`

提供完整的长时间运行小说生成工作流。

**工作流步骤：**
1. 初始化小说项目
2. 设计情节
3. 开发角色
4. 构建世界观
5. 启动长时间生成
6. 监控进度
7. 暂停（可选）
8. 恢复（如需要）
9. 编辑润色
10. 导出小说

## 使用场景

### 场景 1：生成 100 章长篇奇幻小说

```typescript
// 1. 创建小说
await tools.novel_create({
  title: "龙之契约",
  genre: "奇幻",
  author: "AI 作家",
  totalChapters: 100,
  description: "一个关于龙族与人类签订契约的史诗故事"
});

// 2. 启动长时间生成
await tools.start_long_running_generation({
  generationId: "dragon-pact-001",
  novelTitle: "龙之契约",
  totalChapters: 100,
  config: {
    batchSize: 10,
    maxRetries: 5,
    retryDelay: 10000,
    pauseOnError: true
  }
});

// 3. 定期检查进度
setInterval(async () => {
  const progress = await tools.check_generation_progress({
    generationId: "dragon-pact-001"
  });
  console.log(`进度: ${progress.progress.percentage.toFixed(2)}%`);
}, 60000);

// 4. 导出小说
await tools.export_novel({
  format: "epub",
  includeMetadata: true
});
```

### 场景 2：暂停并恢复生成

```typescript
// 暂停生成
await tools.pause_generation({
  generationId: "dragon-pact-001"
});

// ... 稍后恢复生成 ...

// 恢复生成
await tools.resume_generation({
  generationId: "dragon-pact-001",
  fromCheckpoint: true
});
```

### 场景 3：批量生成多个小说

```typescript
// 创建并启动第一个小说
await tools.novel_create({
  title: "星际迷航",
  genre: "科幻",
  totalChapters: 50
});

await tools.start_long_running_generation({
  generationId: "scifi-001",
  novelTitle: "星际迷航",
  totalChapters: 50,
  config: { batchSize: 5 }
});

// 创建并启动第二个小说
await tools.novel_create({
  title: "武侠传奇",
  genre: "武侠",
  totalChapters: 80
});

await tools.start_long_running_generation({
  generationId: "wuxia-001",
  novelTitle: "武侠传奇",
  totalChapters: 80,
  config: { batchSize: 8 }
});

// 查看所有生成任务
const allGenerations = await tools.list_all_generations({});
console.log(allGenerations);
```

## 配置选项

### 生成配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `batchSize` | number | 5 | 每批生成的章节数 |
| `maxRetries` | number | 3 | 最大重试次数 |
| `retryDelay` | number | 5000 | 重试延迟（毫秒） |
| `pauseOnError` | boolean | true | 遇到错误是否暂停 |

### 状态存储

状态文件保存在：`./novels/{novel-title}/.generation/{generation-id}.json`

检查点文件保存在：`./novels/{novel-title}/checkpoints/{timestamp}.json`

## 性能优化

### 内存优化

- 使用流式处理章节内容，避免一次性加载所有章节
- 批量处理限制内存使用
- 定期清理临时文件

### 性能建议

1. **批量大小**：根据系统内存调整 `batchSize`
   - 小内存系统：3-5 章
   - 中等内存系统：5-10 章
   - 大内存系统：10-20 章

2. **重试策略**：根据 API 限制调整 `maxRetries` 和 `retryDelay`
   - 严格限制：maxRetries=2, retryDelay=10000
   - 宽松限制：maxRetries=5, retryDelay=5000

3. **并发任务**：同时运行的生成任务建议不超过 3 个

## 故障恢复

### 自动恢复

系统会在以下情况下自动尝试恢复：
- 网络错误
- API 限流
- 临时文件系统错误

### 手动恢复

如果自动恢复失败，可以手动恢复：

```typescript
// 1. 检查状态
const state = await tools.check_generation_progress({
  generationId: "novel-001"
});

// 2. 查看失败章节
console.log("失败章节:", state.progress.failedChapters);

// 3. 手动恢复
await tools.resume_generation({
  generationId: "novel-001",
  fromCheckpoint: true
});
```

## 监控和日志

### 状态文件

每个生成任务都有对应的状态文件，包含：
- 当前进度
- 已生成章节列表
- 失败章节列表
- 错误日志
- 最后更新时间

### 检查点

检查点文件记录了关键时间点的状态，可用于：
- 恢复到特定时间点
- 调试生成过程
- 分析性能瓶颈

## 最佳实践

1. **定期检查进度**：建议每 60 秒检查一次进度
2. **合理设置批量大小**：根据系统资源调整
3. **启用错误暂停**：遇到错误时暂停，避免浪费资源
4. **定期备份状态**：使用 `export_generation_state` 备份重要任务
5. **监控内存使用**：长时间运行时注意内存占用
6. **清理旧状态**：完成任务后清理旧的状态文件

## 限制和注意事项

1. **文件系统限制**：确保有足够的磁盘空间存储章节和状态文件
2. **API 限制**：注意 OpenAI API 的速率限制
3. **内存限制**：超大小说（1000+ 章）需要特别注意内存管理
4. **并发限制**：不要同时运行过多生成任务

## 未来改进

- [ ] 支持分布式生成（多节点）
- [ ] 增量备份和同步
- [ ] 更智能的错误预测和预防
- [ ] 实时进度可视化
- [ ] 自动质量检查
- [ ] 支持更多导出格式
