# 快速开始 - 5 分钟上手

用最少的时间开始使用 oh-my-novel 插件创建你的第一本 AI 辅助小说。

---

## 第 1 步：安装 OpenCode (1 分钟)

```bash
# 使用 npm 安装
npm install -g opencode

# 或使用 Bun（如果已安装）
bun install -g opencode
```

验证安装：

```bash
opencode --version
# 应该显示版本号，例如 1.0.150+
```

---

## 第 2 步：安装 oh-my-novel (1 分钟)

```bash
npm install -g oh-my-novel
```

---

## 第 3 步：配置插件 (1 分钟)

创建 OpenCode 配置文件：

**Windows**: `C:\Users\你的用户名\.config\opencode\opencode.json`
**macOS/Linux**: `~/.config/opencode/opencode.json`

添加以下内容：

```json
{
  "plugin": ["oh-my-novel"]
}
```

**可选**：配置你的 AI 模型

```json
{
  "plugin": ["oh-my-novel"],
  "model": "anthropic/claude-opus-4-5",
  "temperature": 0.7,
  "apiKey": "your-api-key-here"
}
```

---

## 第 4 步：启动并创建小说 (2 分钟)

```bash
opencode
```

然后在 OpenCode 中输入：

```
Create a fantasy novel about a young wizard named Alex who discovers an ancient magical artifact
```

### 🎉 自动工作流程

插件会自动：

1. ✅ **Novelist** 协调整个创作流程
2. ✅ **Plot Designer** 设计故事大纲
3. ✅ **Character Developer** 创建主要角色
4. ✅ **World Builder** 构建世界观和魔法系统
5. ✅ 开始生成第一章内容

### 📁 生成的文件结构

```
./novels/ancient-artifact/
├── metadata.json           # 小说元数据
├── plot-outline.md        # 故事大纲
├── chapters/
│   └── chapter-1.md     # 第一章内容
├── characters/
│   └── alex.md          # 角色档案
└── world-building/
    └── magic-system.md   # 魔法系统说明
```

---

## 第 5 步：继续写作 (持续进行)

### 写下一章

```
Write chapter 2 where Alex meets a mysterious old sage who teaches him about the artifact
```

### 添加新角色

```
Add a character named "Master Zhen" who is a 300-year-old immortal scholar
```

### 查看故事大纲

```
Show me the plot outline for this novel
```

### 导出完整小说

```
Export this novel as a markdown file
```

---

## 🎯 常用命令

### 小说管理

| 命令                                    | 说明         |
| --------------------------------------- | ------------ |
| `Create a [genre] novel about [topic]`  | 创建新小说   |
| `Write chapter [n] where [description]` | 写作特定章节 |
| `Show all chapters`                     | 查看所有章节 |
| `Show all characters`                   | 查看所有角色 |

### 高级功能

| 命令                                          | 说明             |
| --------------------------------------------- | ---------------- |
| `Start long-run generation with 100 chapters` | 长任务生成多章节 |
| `Check generation progress`                   | 检查生成进度     |
| `Pause generation`                            | 暂停生成         |
| `Resume generation`                           | 恢复生成         |

---

## 🔧 自定义配置

### 修改 Agent 模型

在项目目录创建 `.opencode/oh-my-novel.jsonc`:

```jsonc
{
  "agents": {
    "novelist": {
      "model": "anthropic/claude-opus-4-5",
      "temperature": 0.8,
    },
    "editor": {
      "model": "google/gemini-3-pro-preview",
      "temperature": 0.3,
    },
  },
}
```

### 设置小说默认值

```jsonc
{
  "novelSettings": {
    "defaultGenre": "fantasy",
    "chapterLength": 3000,
    "autoSave": true,
  },
}
```

---

## 📚 完整文档

- [PLUGIN_USAGE.md](./PLUGIN_USAGE.md) - OpenCode 插件详细使用指南
- [USER_GUIDE.md](./USER_GUIDE.md) - 完整用户指南
- [AGENTS.md](./AGENTS.md) - Agent 详细文档
- [INSTALLATION.md](./INSTALLATION.md) - 安装和配置

---

## ❓ 遇到问题？

### 插件未加载

1. 检查 `opencode.json` 是否正确配置
2. 重新启动 OpenCode
3. 检查日志：`~/.opencode/logs/opencode.log`

### 工具不可用

1. 验证插件是否已安装：`npm list -g oh-my-novel`
2. 重启 OpenCode
3. 尝试：`Show loaded plugins`

### 需要更多帮助？

查看 [GitHub Issues](https://github.com/mxrain/oh-my-novel/issues) 或阅读完整文档。

---

**现在就开始创作你的第一部 AI 辅助小说吧！** ✨📖
