# OpenCode 插件使用指南

本文档说明如何将 `oh-my-novel` 作为 OpenCode 插件安装和使用。

---

## 目录

1. [什么是 OpenCode 插件](#什么是-opencode-插件)
2. [安装 OpenCode](#安装-opencode)
3. [安装 oh-my-novel 插件](#安装-oh-my-novel-插件)
4. [配置插件](#配置插件)
5. [验证安装](#验证安装)
6. [基本使用](#基本使用)
7. [插件工作原理](#插件工作原理)
8. [故障排除](#故障排除)

---

## 什么是 OpenCode 插件

OpenCode 是一个 AI 驱动的开发工具，支持通过插件扩展功能。`oh-my-novel` 插件为 OpenCode 添加了：

- 🤖 **5 个专用 AI agents**（novelist, plot-designer, character-developer, world-builder, editor）
- 🛠️ **20+ 个工具**（小说管理、长任务生成、搜索等）
- 🔗 **12 个 hooks**（生命周期管理、错误恢复等）
- 📚 **2 个内置 skills**（完整小说生成工作流）
- 🎯 **8 个任务分类**（plotting, writing, editing 等）

---

## 安装 OpenCode

### 前置要求

| 工具        | 最低版本 | 检查命令         |
| ----------- | -------- | ---------------- |
| **Node.js** | 18+      | `node --version` |
| **Bun**     | 最新版   | `bun --version`  |

### 安装步骤

```bash
# 使用 Bun 安装（推荐）
bun install -g opencode

# 或使用 npm
npm install -g opencode
```

### 验证安装

```bash
opencode --version
# 输出: 1.0.150 或更高版本
```

---

## 安装 oh-my-novel 插件

### 方法 1: 从 npm 安装（推荐）

```bash
npm install -g oh-my-novel
```

### 方法 2: 从 GitHub 安装

```bash
git clone https://github.com/mxrain/oh-my-novel.git
cd oh-my-novel
npm install
npm run build
```

### 方法 3: 使用 bunx（临时使用）

```bash
bunx oh-my-novel@latest install
```

---

## 配置插件

### 1. 创建/编辑 OpenCode 配置文件

OpenCode 的配置文件位置：

- **Windows**: `C:\Users\{username}\.config\opencode\opencode.json`
- **macOS/Linux**: `~/.config/opencode/opencode.json`

### 2. 添加插件到配置

```json
{
  "plugin": ["oh-my-novel"],
  "model": "anthropic/claude-opus-4-5",
  "temperature": 0.7
}
```

### 3. 配置模型（可选）

OpenCode 支持多种 AI 模型，根据你的 API 选择：

```json
{
  "plugin": ["oh-my-novel"],
  "model": "anthropic/claude-opus-4-5",
  "temperature": 0.7,
  "apiKey": "your-api-key-here"
}
```

**支持的模型示例：**

- `anthropic/claude-opus-4-5`
- `openai/gpt-5.2`
- `google/gemini-3-pro-preview`
- 其他 OpenCode 支持的模型

### 4. 保存配置

保存 `opencode.json` 文件，配置会自动加载。

---

## 验证安装

### 1. 启动 OpenCode

```bash
opencode
```

### 2. 检查插件加载

OpenCode 启动时会显示已加载的插件：

```
[INFO] Loaded plugins: oh-my-novel
[INFO] oh-my-novel v1.0.0 - AI-powered novel generation
[INFO]   Agents: 5 (novelist, plot-designer, character-developer, world-builder, editor)
[INFO]   Tools: 20+
[INFO]   Hooks: 12
[INFO]   Skills: 2
```

### 3. 测试基本功能

在 OpenCode 中输入：

```
Show available tools
```

应该看到所有 `oh-my-novel` 提供的工具列表。

---

## 基本使用

### 创建你的第一部小说

#### 1. 启动 OpenCode 并输入提示

```bash
opencode
```

然后输入：

```
Create a fantasy novel about a young wizard who discovers an ancient power
```

#### 2. 自动工作流程

插件会自动：

1. **Novelist Agent** 接收请求并协调整个流程
2. **Plot Designer** 创建故事大纲和结构
3. **Character Developer** 设计主要角色
4. **World Builder** 构建世界观和魔法系统
5. 开始生成第一章内容

#### 3. 查看生成的文件

小说会自动保存到：

```
./novels/{novel-title}/
├── metadata.json              # 小说元数据
├── plot-outline.md           # 故事大纲
├── chapters/
│   ├── chapter-1.md
│   └── index.json
├── characters/
│   └── character-name.md
├── world-building/
│   └── main.md
└── progress-log.md
```

### 使用插件工具

#### 查看所有可用工具

```
List all oh-my-novel tools
```

#### 使用特定工具

```
Use the novel_create tool with title "Dragon Quest" and genre "fantasy"
```

#### 写作章节

```
Write chapter 2 where the protagonist meets a mysterious ally
```

#### 管理角色

```
Show me all characters in the novel
Add a new character named "Elena" who is a wise old sorceress
```

### 使用长任务生成

#### 生成多章节小说

```
Start long-run generation for "Dragon Quest" with 50 chapters
Use batch size of 5 and max retries 3
```

#### 检查进度

```
Check generation progress for "dragon-quest-001"
```

#### 暂停和恢复

```
Pause generation "dragon-quest-001"
Resume generation "dragon-quest-001" from checkpoint
```

---

## 插件工作原理

### 架构概览

```
┌─────────────────────────────────────────┐
│         OpenCode 主程序           │
│  (加载插件并管理生命周期)            │
└─────────────┬───────────────────────┘
              │
              ├─ 加载插件配置
              │
              ▼
┌─────────────────────────────────────────┐
│     oh-my-novel 插件           │
│                                 │
│  ┌──────────┬──────────┐       │
│  │  Agents  │  Tools   │       │
│  │  (5个)   │  (20+)   │       │
│  └──────────┴──────────┘       │
│  ┌──────────┬──────────┐       │
│  │  Hooks   │  Skills  │       │
│  │  (12个)  │  (2个)   │       │
│  └──────────┴──────────┘       │
└─────────────────────────────────────────┘
```

### Agent 协作流程

```
用户请求
    ↓
Novelist (主协调器)
    ├─→ Plot Designer (设计故事结构)
    ├─→ Character Developer (创建角色)
    ├─→ World Builder (构建世界)
    └─→ Editor (润色文字)
    ↓
输出完整的小说内容
```

### Hook 生命周期

```
preToolUse → 工具执行前
    ↓
工具执行
    ↓
postToolUse → 工具执行后
    ↓
userPromptSubmit → 用户提交提示
```

### 配置加载优先级

OpenCode 加载配置的顺序：

1. `opencode.json` (用户级别)
2. `.opencode/oh-my-novel.jsonc` (项目级别，最高优先级)
3. `~/.config/opencode/oh-my-novel.jsonc` (用户级别)

---

## 故障排除

### 问题 1: 插件未加载

**症状**: OpenCode 启动时没有显示插件信息

**解决方法**:

1. 检查 `opencode.json` 配置：

   ```json
   {
     "plugin": ["oh-my-novel"]
   }
   ```

2. 验证插件是否安装：

   ```bash
   npm list -g oh-my-novel
   ```

3. 检查日志文件：
   ```bash
   cat ~/.opencode/logs/opencode.log
   ```

### 问题 2: 工具不可用

**症状**: 输入工具命令时提示"工具不存在"

**解决方法**:

1. 确认插件正确加载：

   ```
   Show loaded plugins
   ```

2. 重新启动 OpenCode：
   ```bash
   # 退出 OpenCode
   exit
   # 重新启动
   opencode
   ```

### 问题 3: 文件权限错误

**症状**: 无法创建小说文件

**解决方法**:

1. 检查目录权限：

   ```bash
   ls -la ./novels
   ```

2. 手动创建目录：
   ```bash
   mkdir -p novels .oh-my-novel-state
   chmod 755 novels .oh-my-novel-state
   ```

### 问题 4: API 调用失败

**症状**: Agent 无响应或返回错误

**解决方法**:

1. 检查 API key 配置：

   ```json
   {
     "apiKey": "your-api-key-here"
   }
   ```

2. 验证网络连接：

   ```bash
   ping api.anthropic.com
   ```

3. 检查模型是否可用：
   ```
   Check available models
   ```

---

## 高级配置

### 自定义 Agent 配置

创建 `.opencode/oh-my-novel.jsonc`:

```jsonc
{
  // Agent 配置覆盖
  "agents": {
    "novelist": {
      "model": "anthropic/claude-opus-4-5",
      "temperature": 0.7,
      "permission": {
        "edit": "allow",
        "bash": { "git": "allow", "rm": "deny" },
      },
    },
    "plot-designer": {
      "model": "openai/gpt-5.2",
      "temperature": 0.3,
    },
  },
}
```

### 配置长任务生成

```jsonc
{
  "longRunning": {
    "maxRetries": 5,
    "retryDelay": 5000,
    "batchSize": 10,
    "checkpointInterval": 1,
  },
}
```

### 启用/禁用 Hooks

```jsonc
{
  "disabled_hooks": ["comment-checker", "empty-task-response-detector"],
}
```

---

## 最佳实践

### 1. 使用合适的模型

- **创意写作**: 使用高 temperature (0.7-1.0)
- **结构规划**: 使用低 temperature (0.2-0.4)
- **编辑校对**: 使用中低 temperature (0.3-0.5)

### 2. 定期保存进度

插件会自动保存，但建议：

- 每完成 5-10 章节后导出备份
- 使用 `export_novel` 工具导出完整小说

### 3. 使用版本控制

```bash
cd novels
git init
git add .
git commit -m "Initial novel structure"
```

### 4. 利用 Skills

内置的 skills 提供了完整的工作流：

```
Use novel-generation-skill
```

或使用长任务 skill：

```
Use long-running-skill for 100 chapters
```

---

## 相关资源

- [OpenCode 文档](https://github.com/sst/opencode)
- [AGENTS.md](./AGENTS.md) - Agent 详细文档
- [USER_GUIDE.md](./USER_GUIDE.md) - 用户指南
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速参考
- [INSTALLATION.md](./INSTALLATION.md) - 安装指南

---

**开始创作你的第一本 AI 辅助小说吧！** ✨
