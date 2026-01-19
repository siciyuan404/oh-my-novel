# 长时间运行和长篇支持功能

本文档详细说明 oh-my-novel 插件如何支持长时间运行和任意章节的长篇小说生成。

---

## 核心功能

### 1. 状态持久化存储

**StateManager** 类负责管理生成状态的持久化：

- **自动保存**：每次章节生成完成后自动保存状态
- **断点续传**：可以从任意中断点恢复生成
- **状态追踪**：记录所有生成的章节、失败的章节和重试次数
- **时间戳**：记录开始时间、最后更新时间和检查点时间

**状态文件位置**：`./.oh-my-novel-state/{novel-title}-state.json`

**状态结构**：
```typescript
interface GenerationState {
  novelTitle: string;           // 小说标题
  currentChapter: number;       // 当前章节
  totalChapters: number;        // 总章节数
  status: "idle" | "running" | "paused" | "completed" | "error";
  lastCheckpoint: string;       // 最后检查点时间
  startTime: string;            // 开始时间
  lastUpdateTime: string;       // 最后更新时间
  context: {                    // 生成上下文
    plotOutline: string;
    characters: any[];
    worldBuilding: any;
  };
  generatedChapters: number[];  // 已生成的章节列表
  failedChapters: number[];     // 失败的章节列表
  retryCount: Record<number, number>;  // 每章的重试次数
}
```

---

### 2. 断点续传机制

**LongRunningGenerator** 类提供完整的断点续传功能：

#### 启动生成

```typescript
const generator = new LongRunningGenerator({
  maxRetries: 3,           // 最大重试次数
  retryDelay: 5000,        // 重试延迟（毫秒）
  batchSize: 5,            // 批处理大小
  pauseOnError: true,      // 出错时暂停
  autoResume: false        // 自动恢复
});

await generator.startGeneration(
  "我的小说",
  100,  // 100章
  { plotOutline: "...", characters: [...] },
  async (chapterNum, context) => {
    // 生成章节的逻辑
    return { wordCount: 3000 };
  }
);
```

#### 暂停和恢复

```typescript
// 暂停生成（当前章节完成后暂停）
generator.pause();

// 恢复生成
await generator.resume(generateChapterFunction);

// 完全停止
generator.stop();
```

#### 查看进度

```typescript
// 获取当前状态
const state = generator.getStatus();
console.log(`进度: ${state.generatedChapters.length}/${state.totalChapters}`);

// 获取进度百分比
const progress = generator.getProgress();
console.log(`完成度: ${progress.percentage.toFixed(2)}%`);

// 列出所有生成任务
const allGenerations = generator.listAllGenerations();
```

---

### 3. 错误处理和重试机制

#### 自动重试

- 每个章节生成失败后会自动重试（最多3次）
- 重试之间有延迟（默认5秒）
- 重试次数会被记录

#### 失败处理

```typescript
// 配置错误处理
const generator = new LongRunningGenerator({
  pauseOnError: true,    // 出错时暂停
  maxRetries: 3,         // 最多重试3次
  retryDelay: 5000       // 重试延迟5秒
});

// 检查是否可以重试
const canRetry = generator.canRetry(chapterNumber, maxRetries);

// 获取失败的章节
const failedChapters = generator.getFailedChapters();
```

#### 错误恢复

1. **暂停模式**：出错后暂停，手动恢复
2. **继续模式**：出错后继续下一章
3. **重试优先**：优先重试失败的章节

---

### 4. 内存优化

#### 流式处理

- 状态文件采用增量更新，避免内存爆炸
- 每次只加载必要的状态信息
- 章节内容独立存储，不占用内存

#### 批处理

```typescript
const generator = new LongRunningGenerator({
  batchSize: 5  // 每批处理5章
});
```

#### 检查点

```typescript
const generator = new LongRunningGenerator({
  checkpointInterval: 1  // 每章保存一次检查点
});
```

---

### 5. 并行生成支持

虽然当前实现是顺序生成，但架构支持未来扩展为并行生成：

```typescript
// 未来扩展示例
const generator = new LongRunningGenerator({
  parallelChapters: 3,  // 同时生成3章
  concurrency: "safe"    // 安全模式
});
```

---

## 使用示例

### 示例1：生成100章小说

```typescript
import { LongRunningGenerator } from "./utils/LongRunningGenerator";

// 创建生成器
const generator = new LongRunningGenerator({
  maxRetries: 3,
  retryDelay: 5000,
  batchSize: 10,
  pauseOnError: true
});

// 开始生成（100章）
await generator.startGeneration(
  "长篇史诗小说",
  100,
  {
    plotOutline: "...",
    characters: [...],
    worldBuilding: {...}
  },
  async (chapterNum, context) => {
    // 调用 novelist agent 生成章节
    const result = await writeChapter({
      title: "长篇史诗小说",
      chapterNumber: chapterNum,
      content: generateContent(chapterNum, context)
    });
    
    return { wordCount: result.wordCount };
  }
);

// 监控进度
setInterval(() => {
  const progress = generator.getProgress();
  if (progress) {
    console.log(`进度: ${progress.current}/${progress.total} (${progress.percentage.toFixed(2)}%)`);
    console.log(`失败: ${progress.failed}章`);
  }
}, 60000); // 每分钟输出一次
```

### 示例2：断点续传

```typescript
// 场景：生成到第50章时中断

// 1. 恢复之前的生成
const generator = new LongRunningGenerator();
const state = generator.getStatus();

if (state && state.status === "paused") {
  console.log(`发现未完成的生成：${state.novelTitle}`);
  console.log(`已生成：${state.generatedChapters.length}章`);
  console.log(`当前停在：第${state.currentChapter}章`);
  
  // 2. 恢复生成
  await generator.resume(async (chapterNum, context) => {
    // 继续生成逻辑
    return await writeChapter(...);
  });
}
```

### 示例3：监控和管理多个生成任务

```typescript
const generator = new LongRunningGenerator();

// 列出所有生成任务
const allTasks = generator.listAllGenerations();

console.log("所有生成任务：");
allTasks.forEach(task => {
  console.log(`- ${task.title}: ${task.progress} (${task.status})`);
  console.log(`  最后更新: ${task.lastUpdate}`);
});

// 导出特定任务的状态
generator.exportState("长篇史诗小说", "./backup/state-export.json");

// 删除已完成任务
generator.deleteGeneration("已完成的小说");
```

---

## 长时间运行最佳实践

### 1. 定期保存检查点

```typescript
const generator = new LongRunningGenerator({
  checkpointInterval: 1  // 每章保存一次
});
```

### 2. 设置合理的重试策略

```typescript
const generator = new LongRunningGenerator({
  maxRetries: 3,         // 最多重试3次
  retryDelay: 5000,      // 重试延迟5秒
  pauseOnError: true     // 出错时暂停
});
```

### 3. 使用批处理提高效率

```typescript
const generator = new LongRunningGenerator({
  batchSize: 10  // 每批处理10章
});
```

### 4. 监控和日志

```typescript
// 定期输出进度
setInterval(() => {
  const progress = generator.getProgress();
  if (progress) {
    console.log(`[${new Date().toISOString()}] 进度: ${progress.percentage.toFixed(2)}%`);
    console.log(`  已完成: ${progress.current}/${progress.total}`);
    console.log(`  失败: ${progress.failed}章`);
  }
}, 60000);
```

### 5. 备份状态

```typescript
// 每小时备份一次状态
setInterval(() => {
  const state = generator.getStatus();
  if (state) {
    const backupPath = `./backups/state-${Date.now()}.json`;
    generator.exportState(state.novelTitle, backupPath);
  }
}, 3600000); // 1小时
```

---

## 性能优化建议

### 1. 内存管理

- 使用流式处理，避免一次性加载所有章节
- 定期清理缓存
- 使用增量更新而非全量保存

### 2. I/O 优化

- 批量写入而非频繁写入
- 使用异步 I/O
- 压缩历史状态文件

### 3. 网络优化

- 设置合理的超时时间
- 实现请求队列
- 使用连接池

---

## 故障恢复

### 场景1：进程崩溃

```typescript
// 进程重启后，自动恢复
const generator = new LongRunningGenerator();
const state = generator.loadState("我的小说");

if (state && state.status === "running") {
  // 将状态改为 paused
  state.status = "paused";
  generator.saveState(state);
  
  // 然后可以手动恢复
  await generator.resume(generateChapterFunction);
}
```

### 场景2：磁盘空间不足

```typescript
// 定期清理旧状态文件
const generator = new LongRunningGenerator();
const allTasks = generator.listAllGenerations();

// 删除超过30天的已完成任务
allTasks.forEach(task => {
  if (task.status === "completed") {
    const lastUpdate = new Date(task.lastUpdate);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate > 30) {
      generator.deleteGeneration(task.title);
    }
  }
});
```

### 场景3：API 限流

```typescript
const generator = new LongRunningGenerator({
  retryDelay: 10000,  // 增加重试延迟到10秒
  maxRetries: 5       // 增加重试次数
});

// 实现速率限制
let lastRequestTime = 0;
const minRequestInterval = 2000; // 最小请求间隔2秒

async function rateLimitedGenerate(chapterNum: number, context: any) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < minRequestInterval) {
    await new Promise(resolve => 
      setTimeout(resolve, minRequestInterval - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
  return await generateChapter(chapterNum, context);
}
```

---

## 限制和注意事项

### 当前限制

1. **顺序生成**：当前实现是顺序生成，不支持并行
2. **单实例**：每个小说标题只能有一个活动生成任务
3. **状态文件大小**：对于超长小说（1000+章），状态文件可能较大

### 注意事项

1. **定期备份**：重要生成任务应定期备份状态文件
2. **监控资源**：长时间运行时监控内存和磁盘使用
3. **错误处理**：实现完善的错误处理和重试机制
4. **日志记录**：记录详细的日志以便排查问题

---

## 未来改进方向

1. **并行生成**：支持多章节并行生成
2. **分布式生成**：支持多台机器协同生成
3. **智能调度**：根据资源使用动态调整生成速度
4. **增量导出**：边生成边导出，减少内存占用
5. **版本控制**：为每次生成创建版本，支持回滚
6. **性能分析**：提供详细的性能分析工具

---

## 总结

oh-my-novel 插件通过以下机制支持长时间运行和长篇生成：

✅ **状态持久化**：所有状态自动保存到磁盘
✅ **断点续传**：支持从中断点恢复
✅ **错误重试**：自动重试失败的章节
✅ **进度监控**：实时查看生成进度
✅ **内存优化**：流式处理避免内存爆炸
✅ **任务管理**：支持多个生成任务并行管理

这些功能确保插件可以稳定地生成任意长度的小说，即使面对数百或数千章的超长篇小说也能可靠运行。
