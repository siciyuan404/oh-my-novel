# Oh-My-Novel 快速参考指南

## 🚀 新功能快速开始

### 1. 配置系统

#### 基础配置文件 (.opencode/oh-my-novel.jsonc)
```jsonc
{
  "$schema": "./oh-my-novel.schema.json",

  // Novel settings
  "novelSettings": {
    "defaultGenre": "fantasy",
    "chapterLength": 3000,
    "autoSave": true
  },

  // Agent overrides
  "agents": {
    "novelist": {
      "model": "anthropic/claude-opus-4-5",
      "temperature": 0.7,
      "prompt_append": "Focus on character development and emotional depth."
    },
    "plot-designer": {
      "permission": {
        "edit": "ask",
        "bash": {
          "git": "allow",
          "rm": "deny"
        }
      }
    }
  },

  // Disable specific hooks
  "disabled_hooks": ["comment-checker"],

  // Long running settings
  "longRunning": {
    "maxRetries": 5,
    "retryDelay": 5000,
    "checkpointInterval": 1,
    "batchSize": 10
  }
}
```

#### 多级配置优先级
1. `.opencode/oh-my-novel.jsonc` (项目级，最高优先级)
2. `.opencode/oh-my-novel.json` (项目级)
3. `~/.config/opencode/oh-my-novel.jsonc` (用户级)
4. `~/.config/opencode/oh-my-novel.json` (用户级)

### 2. 搜索工具

#### Grep 搜索
```typescript
// 在所有文件中搜索模式
grep({
  pattern: "hero",
  path: "./novels",
  include: "*.md",
  exclude: "node_modules",
  caseSensitive: false,
  maxResults: 50
})
```

#### Glob 文件查找
```typescript
// 查找所有章节文件
glob({
  pattern: "**/chapters/*.md",
  path: "./novels/test-novel",
  maxResults: 100
})
```

#### 小说内容搜索
```typescript
// 在小说特定部分搜索
search_novel({
  title: "Test Novel",
  query: "magic sword",
  scope: "all", // or "chapters", "characters", "plot", "world"
  maxResults: 10
})
```

### 3. Hooks 系统

#### Session Recovery
自动检测和恢复会话错误：
- 缺失的工具结果
- 空消息
- Thinking block 问题

#### Context Window Monitor
在特定阈值发出警告：
- 70%: "还有空间，不要匆忙"
- 90%: "严重，考虑压缩"

#### Todo Continuation Enforcer
强制 agent 完成所有 TODO：
- 检测到停止尝试时提醒未完成的 TODO
- 自动注入 TODO 列表继续工作

#### Keyword Detector
检测关键词并激活模式：
```javascript
"Start long-run generation"  // → 激活 long-run 模式
"Edit chapter 5"          // → 激活 edit 模式
"Plot the next arc"        // → 激活 plot 模式
"Character: John Smith"     // → 激活 character 模式
```

### 4. 权限系统

#### 权限级别
- `ask`: 需要用户确认
- `allow`: 允许执行
- `deny`: 禁止执行

#### Agent 权限预设
```typescript
import { AgentPermissionPresets } from "./shared/permission-system.js";

// 只读 agent（如 plot designer）
readOnly: {
  permission: {
    "novel_create": "deny",
    "chapter_write": "deny",
    // ...
  }
}

// 读写 agent（如 novelist）
readWrite: {
  permission: {
    "novel_create": "allow",
    "chapter_write": "allow",
    // ...
  }
}

// 探索 agent（如 world builder）
exploration: {
  permission: {
    "grep": "allow",
    "glob": "allow",
    "search_novel": "allow",
    // ...
  }
}
```

#### 工具权限检查
```typescript
import { checkToolPermission } from "./shared/permission-system.js";

const result = checkToolPermission("chapter_write", agent.permissions);

if (result.requiresConfirmation) {
  // Ask user for confirmation
}

if (!result.allowed) {
  // Show error message
  console.error(result.reason);
}
```

### 5. 测试

#### 运行所有测试
```bash
bun test
```

#### 运行特定测试文件
```bash
bun test src/tools/index.test.ts
bun test src/hooks/index.test.ts
bun test src/utils/utils.test.ts
```

#### 类型检查
```bash
bun run typecheck
```

### 6. 构建

#### 开发模式（监视文件变化）
```bash
bun run dev
```

#### 构建生产版本
```bash
bun run build
```

#### 清理构建文件
```bash
bun run clean
```

### 7. 配置验证

#### 运行时验证
```typescript
import { safeParseConfig } from "./config/schema.js";

const config = loadConfig();
const result = safeParseConfig(config);

if (!result.success) {
  console.error("Configuration errors:");
  for (const error of result.error.errors) {
    console.error(`  ${error.path.join(".")}: ${error.message}`);
  }
} else {
  console.log("Configuration is valid!");
}
```

### 8. 自定义 Hooks

#### 创建自定义 Hook
```typescript
import { Hook } from "opencode";

export const customHook: Hook = {
  "tool.execute.before": async (context: any) => {
    const { toolName, parameters } = context;

    // Custom logic here
    console.log(`Tool ${toolName} about to execute with params:`, parameters);

    return {};
  }
};
```

#### 注册自定义 Hook
```typescript
// In src/hooks/index.ts
export const hooks: Record<string, Hook> = {
  // ...existing hooks

  "my-custom-hook": {
    description: "My custom hook",
    enabled: true,
    handler: customHook["tool.execute.before"]
  }
};
```

### 9. 故障排除

#### 配置不生效
1. 检查配置文件路径优先级
2. 确认 JSONC 语法正确（使用 `jsonc-parser` 验证）
3. 运行 `bun run typecheck` 检查类型错误

#### Hook 不执行
1. 确认 hook 在 `disabled_hooks` 数组中未列出
2. 检查 hook 是否正确导出到 `src/hooks/index.ts`
3. 验证 hook handler 函数签名正确

#### 权限问题
1. 检查 agent 配置中的 `permission` 字段
2. 确认工具名称匹配（区分大小写）
3. 使用 `checkToolPermission()` 调试权限检查

### 10. 高级用法

#### 动态配置更新
```typescript
import { configManager } from "./config/manager.js";

// 重新加载配置
configManager.clearCache();
const newConfig = configManager.getConfig();

// 保存新配置
configManager.saveConfig(newConfig, "./custom-config.jsonc");
```

#### 自定义 Agent 权限
```typescript
import { createAgentToolRestrictions } from "./shared/permission-system.js";

const permissions = createAgentToolRestrictions([
  "novel_create",
  "export_novel"
]);

const agentConfig = {
  model: "anthropic/claude-opus-4-5",
  permission: ["read", "write", "run"],
  ...permissions
};
```

#### 批量搜索优化
```typescript
// 使用 grep 搜索模式，然后过滤结果
const pattern = "(hero|villain|protagonist)";
const results = await grep({ pattern, include: "*.md" });

// 结果在 results.matches 数组中
```

---

## 📚 相关文档

- [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md) - 完整的改进列表
- [README.md](./README.md) - 原始文档
- [LONG_RUNNING_GUIDE.md](./LONG_RUNNING_GUIDE.md) - 长运行生成指南
- [USAGE_EXAMPLE.md](./USAGE_EXAMPLE.md) - 使用示例

## 🔗 有用链接

- [Zod 文档](https://zod.dev/)
- [Bun 测试文档](https://bun.sh/docs/test)
- [Ripgrep 指南](https://github.com/BurntSushi/ripgrep)
- [picomatch 文档](https://github.com/micromatch/picomatch)
