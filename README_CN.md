# Oh My Novel

一个用于自动化小说创作的 OpenCode 插件。该插件将 OpenCode 转变为一个强大的写作助手，可以帮助你使用专业的 AI 代理来创建、组织和完善小说。

**版本**: 1.0.0
**灵感来自**: [oh-my-opencode](https://github.com/siciyuan404/oh-my-opencode)

---

## 🌟 功能特性

### 🤖 专业代理 (5 个代理)

| 代理           | 模型                        | 权限             | 目的                                     |
| -------------- | --------------------------- | ---------------- | ---------------------------------------- |
| **小说家**     | anthropic/claude-opus-4-5   | read, write, run | 主编排器。管理章节进展，叙事一致性       |
| **情节设计器** | openai/gpt-5.2              | read             | 创造引人入胜的故事弧、情节转折、叙事结构 |
| **角色开发者** | openai/gpt-5.2              | read             | 构建丰富、多维的角色和背景故事           |
| **世界构建器** | anthropic/claude-opus-4-5   | read             | 构建沉浸式设定、魔法系统、世界传说       |
| **编辑器**     | google/gemini-3-pro-preview | read, write      | 润色散文、检查一致性、完善手稿           |

### 🛠️ 小说管理工具 (20+ 个工具)

**基础工具：**

- `novel_create`: 使用完整结构初始化新小说项目
- `chapter_write`: 使用 AI 辅助编写章节
- `character_manage`: 跟踪和管理角色档案
- `plot_outline`: 创建和维护情节大纲
- `world_notes`: 记录世界构建详情
- `export_novel`: 以各种格式导出完整小说

**长运行工具：**

- `start_long_running_generation`: 启动无限章节的长运行生成任务
- `check_generation_progress`: 实时监控生成进度和状态
- `pause_generation`: 优雅地暂停运行中的生成任务
- `resume_generation`: 从检查点恢复暂停或失败的生成任务
- `list_all_generations`: 列出所有活动和已保存的生成任务
- `delete_generation_state`: 清理生成状态并停止活动任务
- `export_generation_state`: 导出状态以便备份或迁移

**搜索工具：**

- `grep`: 使用 ripgrep 搜索模式（60秒超时，10MB 输出）
- `glob`: 查找匹配模式的文件（60秒超时，100 个文件）
- `search_novel`: 在小说内容中搜索（章节、角色、情节、世界）

**会话管理工具：**

- `session_list`: 按日期和限制列出所有会话
- `session_read`: 从特定会话读取消息和历史
- `session_search`: 跨会话全文搜索
- `session_info`: 获取会话的元数据和统计信息

**类别工具：**

- `list_categories`: 列出所有可用任务类别及描述
- `apply_category`: 将类别配置应用于代理调用
- `recommend_category`: 分析任务并推荐合适的类别

**后台任务工具：**

- `create_task`: 创建新后台任务
- `start_task`: 启动待处理的后台任务
- `pause_task`: 暂停运行中的后台任务
- `resume_task`: 恢复暂停的后台任务
- `cancel_task`: 取消后台任务
- `list_tasks`: 列出所有后台任务（带过滤）
- `get_task_status`: 获取特定任务的详细状态
- `cleanup_tasks`: 清理旧的已完成/失败/已取消任务

**技能加载工具：**

- `load_skill`: 按名称加载自定义技能
- `list_skills`: 列出所有可用的自定义技能
- `reload_skills`: 从目录重新加载所有技能
- `create_skill_template`: 为用户自定义生成技能模板

### 🔧 钩子系统 (12 个钩子)

**核心钩子（3 个钩子）：**

- `preToolUse`: 操作前自动保存草稿
- `postToolUse`: 更新章节索引并跟踪进度
- `userPromptSubmit`: 将小说上下文注入到 AI 对话中

**增强钩子（7 个钩子）：**

- `session-recovery`: 自动从会话错误中恢复（缺少工具结果、空消息、思考块问题）
- `context-window-monitor`: 监控 token 使用并在 70%/90% 阈值时发出警报
- `todo-continuation-enforcer`: 强制代理在停止前完成所有待办事项
- `keyword-detector`: 检测关键词并激活专用模式（长运行、编辑、情节、角色、世界、生成）
- `comment-checker`: 防止 AI 添加过多注释（>15% 比例）
- `empty-task-response-detector`: 捕获任务工具返回空内容的情况
- `background-notification`: 后台代理任务完成时发出通知

**长运行钩子（2 个钩子）：**

- `longRunningMonitor`: 监控长运行任务并自动保存检查点
- `errorRecovery`: 记录错误并从备份中识别恢复点

### 🎯 技能系统

**内置技能（2 个技能）：**

- `novel-generation-skill`: 完整的端到端小说生成工作流（10 步骤流程）
- `long-running-skill`: 用于无限章节生成的增强工作流，具有自动重试、检查点恢复和批处理

**自定义技能：**

自定义技能可以从以下位置加载：

- `~/.claude/skills/`（用户级）
- `./.claude/skills/`（项目级）
- `~/.config/opencode/skills/`（opencode 用户级）
- `./.opencode/skills/`（opencode 项目级）

### 🎛️ 权限系统

三层权限系统：`ask` / `allow` / `deny`

**权限类型：**

- **工具级权限**：控制每个代理可以访问的工具
- **Bash 命令权限**：对 shell 命令的精细控制（例如，`{ "git": "allow", "rm": "deny" }`）
- **文件操作权限**：控制读/写/编辑操作

**权限预设：**

- `readOnly`：情节设计器、角色开发者（不能写文件）
- `readWrite`：小说家、编辑器（可以读写）
- `exploration`：世界构建器（可以探索和读取）
- `fullAccess`：完全访问（谨慎使用）

### 📊 类别系统

默认任务类别及优化设置：

| 类别                    | 模型                        | 温度 | 目的                         |
| ----------------------- | --------------------------- | ---- | ---------------------------- |
| `plotting`              | openai/gpt-5.2              | 0.3  | 故事结构、叙事弧、情节开发   |
| `character-development` | openai/gpt-5.2              | 0.4  | 创建具有深度和成长的角色     |
| `world-building`        | anthropic/claude-opus-4-5   | 0.5  | 构建沉浸式设定和世界传说     |
| `writing`               | anthropic/claude-opus-4-5   | 0.7  | 生成引人入胜的散文和章节内容 |
| `editing`               | google/gemini-3-pro-preview | 0.3  | 润色散文、确保质量           |
| `research`              | opencode/glm-4.7-free       | 0.2  | 搜索和分析现有小说内容       |
| `long-running`          | anthropic/claude-opus-4-5   | 0.6  | 扩展章节生成并保持一致性     |
| `planning`              | openai/gpt-5.2              | 0.1  | 战略规划和分析               |

### 🔑 关键词检测

自动检测关键词并激活专用模式：

| 模式                                                       | 关键词                                                      | 行为                                 |
| ---------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------ |
| `long-run` / `lgr`                                         | long-run, longrunning, unlimited, batch                     | 激活长运行模式，支持批处理和自动重试 |
| `edit` / `revise` / `rewrite` / `modify`                   | edit, revise, rewrite, modify                               | 激活编辑模式，使用编辑器代理         |
| `plot` / `outline` / `storyline` / `structure`             | plot, outline, storyline, structure, narrative              | 激活情节模式                         |
| `character` / `char` / `protagonist` / `villain`           | character, char, protagonist, villain, person, role         | 激活角色开发模式                     |
| `world` / `setting` / `environment` / `lore` / `geography` | world, setting, environment, lore, geography, magic, system | 激活世界构建模式                     |
| `generate` / `write` / `create` / `draft`                  | generate, write, create, draft                              | 激活写作模式                         |

---

## ⏱️ 长运行支持

oh-my-novel 现在完全支持具有无限章节的长运行小说生成任务：

✅ **持久化状态存储**：所有生成状态自动保存到文件系统
✅ **自动检查点**：定期保存进度以防止数据丢失
✅ **从中断中恢复**：随时暂停和恢复生成任务
✅ **错误重试机制**：失败的章节自动重试，可配置重试次数和延迟
✅ **批处理**：支持高效的多章节批处理
✅ **内存优化**：使用流式处理避免内存溢出
✅ **进度跟踪**：实时查看生成进度和状态
✅ **并发任务管理**：支持多个小说生成任务同时运行

详见 [LONG_RUNNING_GUIDE.md](./LONG_RUNNING_GUIDE.md) 获取完整文档。

---

## 📋 配置系统

### 配置架构（Zod 验证）

**多级配置**（从高到低优先级）：

1. `.opencode/oh-my-novel.jsonc`（项目级，支持注释）
2. `.opencode/oh-my-novel.json`（项目级）
3. `~/.config/opencode/oh-my-novel.jsonc`（用户级，支持注释）
4. `~/.config/opencode/oh-my-novel.json`（用户级）

### JSONC 支持

配置文件支持 JSONC（JSON with comments，带注释和尾随逗号）：

```jsonc
{
  "$schema": "./oh-my-novel.schema.json",

  /* 小说设置 */
  "novelSettings": {
    "defaultGenre": "fantasy",
    "chapterLength": 3000,
    "autoSave": true,
  },

  /* 代理覆盖 */
  "agents": {
    "novelist": {
      "model": "anthropic/claude-opus-4-5",
      "temperature": 0.7,
      "permission": {
        "edit": "ask",
        "bash": {
          "git": "allow",
          "rm": "deny",
        },
      },
    },
  },
}
```

### 配置部分

**代理**：覆盖代理配置（模型、温度、权限、prompt_append）
**类别**：自定义任务类别及模型和设置预设
**novelSettings**：小说默认设置（defaultGenre、chapterLength、autoSave）
**longRunning**：长运行配置（maxRetries、retryDelay、batchSize、checkpointInterval）
**background_task**：后台任务管理（并发限制、超时）
**hooks**：禁用钩子列表
**disabled_skills**：禁用技能列表
**experimental**：实验性功能
**ralph_loop**：Ralph 循环配置
**notification**：通知设置

### For LLM Agents

将以下内容粘贴到 LLM 代理会话：

```
按照以下说明安装和配置 oh-my-novel：
https://raw.githubusercontent.com/siciyuan404/oh-my-novel/refs/heads/main/INSTALLATION.md
```

---

## 🚀 安装

### 供用户使用

运行交互式安装器：

```bash
bunx oh-my-novel install  # 推荐
npx oh-my-novel install  # npm 安装方式（等发布后）
```

> **注意**：CLI 附带所有主要平台的独立二进制文件。安装后无需运行时（Bun/Node.js）来执行 CLI。

请按照提示配置你的 AI 提供商认证信息。安装完成后，在 OpenCode 中使用 `opencode auth login` 配置。

**推荐的安装方式**：

1. **本地开发安装**（当前推荐）

   ```bash
   git clone https://github.com/siciyuan404/oh-my-novel.git
   cd oh-my-novel
   bun install
   bun run build
   node dist/cli/installer.js
   ```

2. **全局安装**（等发布到 npm 后）

   ```bash
   bun install -g oh-my-novel  # 等包发布后使用
   ```

3. **使用 npm 安装**（等发布到 npm 后）
   ```bash
   npm install -g oh-my-novel  # 等包发布后使用
   ```

> **注意**：目前 `oh-my-novel` 包**尚未发布到 npm**。请使用以下本地开发安装方式：
>
> ```bash
> git clone https://github.com/siciyuan404/oh-my-novel.git
> cd oh-my-novel
> bun install
> bun run build
> node dist/cli/installer.js
> ```
>
> **不推荐**：不要让 LLM 代理执行安装命令，因为安装器需要手动配置。
>
> **注意**：安装器需要手动配置 AI 提供商，无法通过 LLM 自动完成。请在 OpenCode 配置完成后使用 `opencode auth login` 配置认证。

---

```bash
if command -v opencode &> /dev/null; then
    echo "OpenCode $(opencode --version) is installed"
else
    echo "OpenCode is not installed. Please install it first."
- OpenCode 版本检查：`opencode --version`
- OpenCode 安装指南：https://opencode.ai/docs
```

#### 步骤 2：运行交互式安装器

```bash
# 交互模式，使用提示
bunx oh-my-novel install

# 非交互模式，使用订阅标志
bunx oh-my-novel install --no-tui \
  --claude=<yes|no|max20> \
  --chatgpt=<yes|no> \
  --gemini=<yes|no> \
  --copilot=<yes|no>
```

**示例：**

- 用户有所有订阅（含 max20）：`bunx oh-my-novel install --no-tui --claude=max20 --chatgpt=yes --gemini=yes --copilot=no`
- 用户只有 Claude（无 max20）：`bunx oh-my-novel install --no-tui --claude=yes --chatgpt=no --gemini=no --copilot=no`
- 用户只有 GitHub Copilot：`bunx oh-my-novel install --no-tui --claude=no --chatgpt=no --gemini=no --copilot=yes`
- 用户没有订阅：`bunx oh-my-novel install --no-tui --claude=no --chatgpt=no --gemini=no --copilot=no`

安装器会执行以下操作：

- 检查 OpenCode 安装和版本
- 根据订阅配置代理模型
- 在 `~/.config/opencode/opencode.json` 中注册插件
- 创建 `~/.config/opencode/oh-my-novel.jsonc` 配置文件

#### 步骤 3：验证安装

```bash
opencode --version  # 应为 1.0.150 或更高
cat ~/.config/opencode/opencode.json  # 应在插件数组中包含 "oh-my-novel"
```

#### 步骤 4：配置身份验证

按照说明配置你的 AI 提供商：

```bash
opencode auth login
# 交互式终端：选择提供商
# 按照 OAuth 流程在浏览器中完成
# 等待完成
# 验证成功
```

### 详细安装说明

包括以下内容：

- 多种安装方式
- 系统要求
- 配置选项
- 故障排除指南

详见 [INSTALLATION.md](./INSTALLATION.md)。

### 卸载

删除 oh-my-novel：

1. **从 OpenCode 配置中移除插件**

   编辑 `~/.config/opencode/opencode.json`（或 `opencode.jsonc`）并从 `plugin` 数组中删除 `"oh-my-novel"`：

   ```bash
   # 使用 jq
   jq '.plugin = [.plugin[] | select(. != "oh-my-novel")]' \
       ~/.config/opencode/opencode.json > /tmp/oc.json && \
       mv /tmp/oc.json ~/.config/opencode/opencode.json
   ```

2. **删除配置文件（可选）**

   ```bash
   # 删除用户配置
   rm -f ~/.config/opencode/oh-my-novel.json

   # 删除项目配置（如果存在）
   rm -f .opencode/oh-my-novel.json
   ```

3. **验证删除**

   ```bash
   opencode --version
   # 插件不应再加载
   ```

---

## 🔍 健康检查

```bash
# 运行健康检查
bunx oh-my-novel doctor
```

健康检查包括：

- OpenCode 版本检查（>= 1.0.150）
- 依赖验证（Node.js、Bun、ripgrep、Git）
- 配置验证
- 目录检查（novels、state）
- 磁盘空间检查
- 代理配置验证

---

## 📖 使用方法

### 快速开始

```bash
opencode
# 然后：
创建一个奇幻小说关于年轻的巫师
```

### 详细使用指南

包含以下内容：

- 分步工作流
- 高级功能
- 最佳实践
- 示例

详见 [USER_GUIDE.md](./USER_GUIDE.md)。

### 基础用法

#### 创建新小说

```
请求小说家创建一个奇幻小说关于年轻的巫师
```

小说家代理将执行以下操作：

1. 与情节设计器协作创建故事结构
2. 与角色开发者协作创建主角
3. 与世界构建器协作建立设定
4. 开始逐章编写

#### 编写章节

```
编写第三章，主角发现一件古代神器
```

#### 管理角色

```
显示这部小说中的所有角色
更新反派的背景故事
```

#### 导出小说

```
将小说导出为 markdown 文件
```

### 长运行生成

**生成一个 100 章节的小说，支持自动重试和检查点恢复：**

```
启动长运行生成"Dragon Pact"小说，包含 100 章。
使用批大小 10，最大重试 3 次，出错时暂停。
```

**检查生成进度：**

```
检查生成"dragon-pact-001"的进度
```

**暂停和恢复：**

```
暂停生成"dragon-pact-001"
... 稍后...
恢复生成"dragon-pact-001"从检查点
```

### 搜索和研究

**在小说中搜索内容：**

```
在小说中搜索"魔法剑"
```

**选项：**

- `search_novel`：搜索章节、角色、情节、世界
- `grep`：使用模式搜索所有文件
- `glob`：查找匹配模式的文件

### 会话管理

**列出最近的会话：**

```
列出过去 7 天的会话
```

**读取会话历史：**

```
读取会话 ses_abc123
```

**跨会话搜索：**

```
在所有会话中搜索"dragon pact"
```

### 基于类别的任务委托

**将类别设置应用于代理：**

```
应用"plotting"类别到小说家代理
```

这会自动应用优化的模型、温度和设置。

### 后台任务

**创建和管理后台任务：**

```
创建后台任务进行章节生成
列出所有后台任务
获取任务 task_123 的状态
```

### 技能

**内置技能：**

- `novel-generation-skill`：完整的端到端小说生成工作流（10 步骤流程）
- `long-running-skill`：用于无限章节生成的增强工作流

**自定义技能：**

自定义技能可以从以下位置加载：

- `~/.claude/skills/`（用户级）
- `./.claude/skills/`（项目级）
- `~/.config/opencode/skills/`（opencode 用户级）
- `./.opencode/skills/`（opencode 项目级）

### 项目结构

```
oh-my-novel/
├── src/
│   ├── index.ts                   # 主插件入口
│   ├── agents/
│   │   └── index.ts              # 代理定义
│   ├── tools/
│   │   ├── index.ts              # 核心工具
│   │   ├── index.test.ts         # 工具测试
│   │   ├── long-running.ts        # 长运行工具
│   │   ├── search-tools.ts       # 搜索工具（grep、glob、search_novel）
│   │   ├── session-tools.ts       # 会话管理（4 个工具）
│   │   ├── category-tools.ts     # 类别系统（3 个工具）
│   │   ├── background-task-tools.ts # 后台任务管理（7 个工具）
│   │   └── skill-loader-tools.ts # 技能加载器（4 个工具）
│   ├── hooks/
│   │   ├── index.ts              # 钩子定义
│   │   ├── index.test.ts         # 钩子测试
│   │   ├── enhanced-hooks.ts    # 7 个增强钩子
│   │   └── long-running-hooks.ts # 长运行钩子
│   ├── skills/
│   │   ├── index.ts              # 基础工作流技能
│   │   └── long-running-skill.ts # 增强工作流技能
│   ├── config/
│   │   ├── schema.ts             # Zod 架构（344 行）
│   │   ├── manager.ts            # 配置管理器
│   │   └── index.ts              # 配置导出
│   ├── shared/
│   │   └── permission-system.ts  # 三层权限系统
│   └── utils/
│       ├── StateManager.ts           # 状态管理
│       ├── LongRunningGenerator.ts   # 生成引擎
│       └── utils.test.ts         # 工具测试
├── src/cli/
│   ├── installer.ts              # CLI 安装器
│   └── doctor.ts                # 健康检查
├── .opencode/
│   └── oh-my-novel.json          # 插件配置
├── package.json                  # 依赖和脚本
├── README.md                     # 本文件
├── AGENTS.md                    # 详细代理文档
├── QUICK_REFERENCE.md             # 快速参考指南
├── INSTALLATION.md             # 安装指南
├── USER_GUIDE.md                # 用户手册
├── oh-my-novel.schema.json       # JSON 架构（IDE 自动补全）
└── dist/                         # 构建输出
```

### 开发

#### 构建

```bash
bun run build
```

#### 测试

```bash
# 运行所有测试
bun test

# 运行特定测试文件
bun test src/tools/index.test.ts

# 运行带覆盖率的测试
bun run test:coverage

# 类型检查
bun run typecheck
```

#### 格式化

```bash
bun run format
```

---

## 📚 示例

### 示例 1：奇幻小说

```
创建一个奇幻小说关于年轻的巫师
```

小说家代理将执行以下操作：

1. 与情节设计器协作创建故事结构
2. 与角色开发者协作创建主角
3. 与世界构建器协作建立设定
4. 开始逐章编写

### 示例 2：科幻小说

```
编写一个科幻小说，背景设定在未来 AI 控制人类
```

### 示例 3：长运行生成

**生成一个 50 章节的小说，支持自动重试和检查点恢复：**

```
启动长运行生成"赛博朋克"小说，包含 50 章。
使用批大小 5，最大重试 2 次。
```

### 示例 4：搜索和研究

**在小说中搜索内容：**

```
搜索"反派"的所有出现位置
查找包含"魔法"的所有章节
```

---

## 🧪 开发

### 构建

```bash
bun run build
```

### 测试

```bash
# 运行所有测试
bun test

# 运行特定测试文件
bun test src/tools/index.test.ts

# 运行带覆盖率的测试
bun run test:coverage

# 类型检查
bun run typecheck
```

### 格式化

```bash
bun run format
```

---

## 📊 测试

### 测试覆盖

**测试文件**（3 个文件）：

- `src/tools/index.test.ts`：6 个测试套（novel_create、chapter_write、character_manage、plot_outline、world_notes、export_novel）
- `src/hooks/index.test.ts`：3 个测试套（preToolUse、postToolUse、userPromptSubmit）
- `src/utils/utils.test.ts`：2 个测试套（StateManager、LongRunningGenerator）

**总计**：18 个测试套，约 60% 代码覆盖率

---

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

---

## 📄 许可证

MIT 许可证 - 详见 LICENSE 文件。

---

## 🙏 致谢

灵感来自 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 作者 code-yeongyu。

---

## 📞 支持

- **GitHub 仓库**：https://github.com/siciyuan404/oh-my-novel
- **报告问题**：[GitHub Issues](https://github.com/siciyuan404/oh-my-novel/issues)
- **讨论**：[GitHub Discussions](https://github.com/siciyuan404/oh-my-novel/discussions)
- **安装指南**：[INSTALLATION.md](./INSTALLATION.md)
- **用户指南**：[USER_GUIDE.md](./USER_GUIDE.md)
- **代理文档**：[AGENTS.md](./AGENTS.md)
- **快速参考**：[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

## 📈 统计

| 指标           | 数量                                                   |
| -------------- | ------------------------------------------------------ |
| **总文件数**   | 28+                                                    |
| **源文件数**   | 20+                                                    |
| **测试文件数** | 3                                                      |
| **工具数**     | 20+                                                    |
| **钩子数**     | 12                                                     |
| **代理数**     | 5                                                      |
| **技能数**     | 2 个内置 + 自定义                                      |
| **类别数**     | 8                                                      |
| **配置架构**   | 344 行                                                 |
| **代码覆盖率** | ~60%                                                   |
| **依赖数**     | 5（opencode、zod、jsonc-parser、picomatch、commander） |
