# Oh My Novel

An OpenCode plugin for automated novel generation with AI agents. This plugin transforms OpenCode into a powerful writing assistant that can help you create, organize, and refine novels using specialized AI agents.

**Version**: 1.0.0
**Inspired by**: [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)

---

## 🌟 Features

### 🤖 Specialized Agents (5 agents)

| Agent                   | Model                       | Permissions      | Purpose                                                               |
| ----------------------- | --------------------------- | ---------------- | --------------------------------------------------------------------- |
| **Novelist**            | anthropic/claude-opus-4-5   | read, write, run | Main orchestrator. Manages chapter progression, narrative consistency |
| **Plot Designer**       | openai/gpt-5.2              | read             | Creates compelling story arcs, plot twists, narrative structures      |
| **Character Developer** | openai/gpt-5.2              | read             | Builds rich, multi-dimensional characters with backstories            |
| **World Builder**       | anthropic/claude-opus-4-5   | read             | Constructs immersive settings, magic systems, world lore              |
| **Editor**              | google/gemini-3-pro-preview | read, write      | Refines prose, checks for consistency, polishes manuscript            |

### 🛠️ Novel Management Tools (20+ tools)

**Basic Tools:**

- `novel_create`: Initialize a new novel project with structure
- `chapter_write`: Write individual chapters with AI assistance
- `character_manage`: Track and manage character profiles
- `plot_outline`: Create and maintain plot outlines
- `world_notes`: Document world-building details
- `export_novel`: Export the complete novel in various formats

**Long-Running Tools:**

- `start_long_running_generation`: Start long-running generation tasks with unlimited chapters
- `check_generation_progress`: Monitor generation progress and status in real-time
- `pause_generation`: Pause running generation tasks gracefully
- `resume_generation`: Resume paused or failed generation tasks from checkpoints
- `list_all_generations`: List all active and saved generation tasks
- `delete_generation_state`: Clean up generation state and stop active tasks
- `export_generation_state`: Export state for backup or transfer

**Search Tools:**

- `grep`: Search for patterns using ripgrep (60s timeout, 10MB output)
- `glob`: Find files matching patterns (60s timeout, 100 files)
- `search_novel`: Search within novel content (chapters, characters, plot, world)

**Session Management Tools:**

- `session_list`: List all sessions with filtering by date and limit
- `session_read`: Read messages and history from a specific session
- `session_search`: Full-text search across session messages
- `session_info`: Get metadata and statistics about a session

**Category Tools:**

- `list_categories`: List all available task categories with descriptions
- `apply_category`: Apply category configuration to agent invocation
- `recommend_category`: Analyze task and recommend appropriate category

**Background Task Tools:**

- `create_task`: Create a new background task
- `start_task`: Start a pending background task
- `pause_task`: Pause a running background task
- `resume_task`: Resume a paused background task
- `cancel_task`: Cancel a background task
- `list_tasks`: List all background tasks with filtering
- `get_task_status`: Get detailed status of a specific task
- `cleanup_tasks`: Clean up old completed/failed/cancelled tasks

**Skill Loader Tools:**

- `load_skill`: Load a custom skill by name
- `list_skills`: List all available custom skills
- `reload_skills`: Reload all skills from directories
- `create_skill_template`: Generate a skill template for users to customize

### 🔧 Hooks System (12 hooks)

**Core Hooks (3 hooks):**

- `preToolUse`: Auto-save drafts before operations
- `postToolUse`: Update chapter indexes and track progress
- `userPromptSubmit`: Inject novel context into AI conversations

**Enhanced Hooks (7 hooks):**

- `session-recovery`: Automatically recover from session errors (missing tool results, empty messages, thinking block issues)
- `context-window-monitor`: Monitor token usage and alert at 70%/90% thresholds
- `todo-continuation-enforcer`: Force agents to complete all TODOs before stopping
- `keyword-detector`: Detect keywords and activate specialized modes (long-run, edit, plot, character, world, generate)
- `comment-checker`: Prevent AI from adding excessive comments (>15% ratio)
- `empty-task-response-detector`: Catch when Task tool returns nothing
- `background-notification`: Notify when background agent tasks complete

**Long-Running Hooks (2 hooks):**

- `longRunningMonitor`: Monitor long-running tasks and auto-save checkpoints
- `errorRecovery`: Log errors and identify recovery points from backups

### 🎯 Skills System

**Built-in Skills (2 skills):**

- `novel-generation-skill`: Complete end-to-end novel generation workflow (10-step process)
- `long-running-skill`: Enhanced workflow for long-running generation with unlimited chapters, auto-retry, and checkpoint recovery

**Custom Skills:**
Custom skills can be loaded from:

- `~/.claude/skills/` (user-level)
- `./.claude/skills/` (project-level)
- `~/.config/opencode/skills/` (opencode user-level)
- `./.opencode/skills/` (opencode project-level)

### 🎛️ Permission System

Three-tier permission system: `ask` / `allow` / `deny`

**Permission Types:**

- **Tool-level permissions**: Control which tools each agent can access
- **Bash command permissions**: Fine-grained control over shell commands (e.g., `{ "git": "allow", "rm": "deny" }`)
- **File operation permissions**: Control read/write/edit operations

**Permission Presets:**

- `readOnly`: Plot Designer, Character Developer (can't write files)
- `readWrite`: Novelist, Editor (can read and write)
- `exploration`: World Builder (can explore and read)
- `fullAccess`: Complete access (use with caution)

### 📊 Categories System

Default task categories with optimized settings:

| Category                | Model                       | Temperature | Purpose                                           |
| ----------------------- | --------------------------- | ----------- | ------------------------------------------------- |
| `plotting`              | openai/gpt-5.2              | 0.3         | Story structure, narrative arcs, plot development |
| `character-development` | openai/gpt-5.2              | 0.4         | Creating rich characters with depth and growth    |
| `world-building`        | anthropic/claude-opus-4-5   | 0.5         | Constructing immersive settings and world lore    |
| `writing`               | anthropic/claude-opus-4-5   | 0.7         | Generating engaging prose and chapter content     |
| `editing`               | google/gemini-3-pro-preview | 0.3         | Refining prose and ensuring quality               |
| `research`              | opencode/glm-4.7-free       | 0.2         | Searching and analyzing existing novel content    |
| `long-running`          | anthropic/claude-opus-4-5   | 0.6         | Extended chapter generation with consistency      |
| `planning`              | openai/gpt-5.2              | 0.1         | Strategic planning and analysis                   |

### 🔑 Keyword Detection

Automatically activates specialized modes when keywords are detected:

| Mode                                                       | Keywords                                                    | Behavior                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| `long-run` / `lgr`                                         | long-run, longrunning, unlimited, batch                     | Activate long-running mode with batch processing and auto-retry |
| `edit` / `revise` / `rewrite` / `modify`                   | edit, revise, rewrite, modify                               | Activate editing mode with Editor agent                         |
| `plot` / `outline` / `storyline` / `structure`             | plot, outline, storyline, structure, narrative              | Activate plotting mode                                          |
| `character` / `char` / `protagonist` / `villain`           | character, char, protagonist, villain, person, role         | Activate character development mode                             |
| `world` / `setting` / `environment` / `lore` / `geography` | world, setting, environment, lore, geography, magic, system | Activate world-building mode                                    |
| `generate` / `write` / `create` / `draft`                  | generate, write, create, draft                              | Activate writing mode                                           |

---

## ⏱️ Long-Running Support

oh-my-novel now fully supports long-running novel generation tasks with unlimited chapters:

✅ **Persistent State Storage**: All generation states are automatically saved to the file system
✅ **Auto Checkpoints**: Periodically saves progress to prevent data loss
✅ **Resume from Interruption**: Pause and resume generation at any time
✅ **Error Retry Mechanism**: Failed chapters are automatically retried with configurable retry count and delay
✅ **Batch Processing**: Supports batch generation of multiple chapters for efficiency
✅ **Memory Optimization**: Uses streaming processing to avoid memory overflow
✅ **Progress Tracking**: Real-time view of generation progress and status
✅ **Concurrent Task Management**: Supports multiple novel generation tasks running simultaneously

See [LONG_RUNNING_GUIDE.md](./LONG_RUNNING_GUIDE.md) for detailed documentation.

---

## 📋 Configuration System

### Configuration Schema (Zod validation)

**Multi-level configuration** (highest to lowest priority):

1. `.opencode/oh-my-novel.jsonc` (project-level, supports comments)
2. `.opencode/oh-my-novel.json` (project-level)
3. `~/.config/opencode/oh-my-novel.jsonc` (user-level, supports comments)
4. `~/.config/opencode/oh-my-novel.json` (user-level)

**Configuration sections:**

- `agents`: Override agent configurations (model, temperature, permissions, prompt_append)
- `categories`: Custom task categories with model and settings presets
- `novelSettings`: Novel defaults (defaultGenre, chapterLength, autoSave)
- `longRunning`: Long-running configuration (maxRetries, retryDelay, batchSize, checkpointInterval)
- `background_task`: Background task management (concurrency limits, timeouts)
- `hooks`: Disabled hooks list
- `disabled_skills`: Disabled skills list
- `experimental`: Experimental features
- `ralph_loop`: Ralph Loop configuration
- `notification`: Notification settings

### JSONC Support

Configuration files support JSONC (JSON with comments and trailing commas):

```jsonc
{
  "$schema": "./oh-my-novel.schema.json",
  // Novel settings
  "novelSettings": {
    "defaultGenre": "fantasy",
    "chapterLength": 3000,
    "autoSave": true,
  },
  // Agent overrides
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
  // Long running settings
  "longRunning": {
    "maxRetries": 5,
    "retryDelay": 5000,
    "batchSize": 10,
  },
}
```

---

## 🚀 Installation

### Prerequisites

- [Bun](https://bun.sh/) runtime (optional, for full CLI features)
- [OpenCode](https://github.com/sst/opencode) CLI (version 1.0.150 or higher)
- [Node.js](https://nodejs.org) 18+ (for npm users)
- [Git](https://git-scm.com) (for version control)

### Quick Start

#### Step 1: Install OpenCode

```bash
# Using Bun (recommended)
bun install -g opencode

# Using npm
npm install -g opencode
```

#### Step 2: Install oh-my-novel Plugin

```bash
# From npm (recommended for npm users)
npm install -g oh-my-novel

# Using bunx
bunx oh-my-novel install

# From GitHub
git clone https://github.com/mxrain/oh-my-novel.git
cd oh-my-novel
npm install
npm run build
```

#### Step 3: Configure OpenCode

Create or edit your OpenCode configuration file:

**Windows**: `C:\Users\{username}\.config\opencode\opencode.json`
**macOS/Linux**: `~/.config/opencode/opencode.json`

Add the plugin:

```json
{
  "plugin": ["oh-my-novel"],
  "model": "anthropic/claude-opus-4-5",
  "temperature": 0.7
}
```

#### Step 4: Verify Installation

```bash
# Start OpenCode
opencode

# Check plugin loaded
# You should see: [INFO] Loaded plugins: oh-my-novel
```

For detailed installation instructions, see [PLUGIN_USAGE.md](./PLUGIN_USAGE.md) or [INSTALLATION.md](./INSTALLATION.md).

### Detailed Installation

For detailed installation instructions, including:

- Multiple installation methods
- System requirements
- Configuration options
- Troubleshooting guide

📖 **See [INSTALLATION.md](./INSTALLATION.md)**

### Configure OpenCode

Add `oh-my-novel` to your `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["oh-my-novel"]
}
```

---

## 🔍 Health Check

```bash
# Run doctor checks
bunx oh-my-novel doctor
```

Doctor checks include:

- OpenCode version check (>= 1.0.150)
- Dependency validation (Node.js, Bun, ripgrep, Git)
- Configuration validation
- Directory checks (novels, state)
- Disk space check
- Agent configuration validation

---

## 📖 Usage

### Quick Start

```bash
opencode
# Then:
Create a fantasy novel about a young wizard
```

### Detailed Usage Guide

For comprehensive usage instructions, including:

- Step-by-step workflows
- Advanced features
- Best practices
- Examples

📖 **See [USER_GUIDE.md](./USER_GUIDE.md)**

### Basic Usage

#### Start a New Novel

```
Ask the Novelist to create a fantasy novel about a young wizard
```

The Novelist agent will:

1. Consult with Plot Designer for story structure
2. Work with Character Developer to create protagonists
3. Collaborate with World Builder to establish the setting
4. Begin writing chapter by chapter

#### Write a Chapter

```
Write chapter 3 where the protagonist discovers an ancient artifact
```

#### Manage Characters

```
Show me all characters in this novel
Update the villain's backstory
```

#### Export Your Novel

```
Export the novel as a markdown file
```

### Long-Running Generation

**Generate a 100-chapter novel with auto-retry and checkpoint recovery:**

```
Start long-running generation for "Dragon Pact" novel with 100 chapters.
Use batch size of 10, max retries of 3, and pause on error.
```

**Check generation progress:**

```
Check progress for generation "dragon-pact-001"
```

**Pause and resume:**

```
Pause generation "dragon-pact-001"
... (later) ...
Resume generation "dragon-pact-001" from checkpoint
```

**List all active generations:**

```
List all generation tasks
```

### Search and Research

**Search for content in your novel:**

```
Search for "magic sword" in the novel
```

Options:

- `search_novel`: Searches chapters, characters, plot, world
- `grep`: Search all files with patterns
- `glob`: Find files matching patterns

### Session Management

**List recent sessions:**

```
List sessions from the last 7 days
```

**Read session history:**

```
Read session ses_abc123
```

**Search across sessions:**

```
Search sessions for "dragon pact"
```

### Category-Based Delegation

**Apply category settings to an agent:**

```
Apply "plotting" category to novelist agent
```

This automatically applies optimized model, temperature, and settings.

### Background Tasks

**Create and manage background tasks:**

```
Create a background task for chapter generation
List all background tasks
Get status of task task_123
```

---

## 🏗️ Project Structure

```
oh-my-novel/
├── src/
│   ├── index.ts                   # Main plugin entry
│   ├── agents/
│   │   └── index.ts              # Agent definitions
│   ├── tools/
│   │   ├── index.ts              # Core tools
│   │   ├── index.test.ts         # Tools tests
│   │   ├── long-running.ts        # Long-running tools
│   │   ├── search-tools.ts       # Search tools (grep, glob, search_novel)
│   │   ├── session-tools.ts       # Session management (4 tools)
│   │   ├── category-tools.ts     # Category system (3 tools)
│   │   ├── background-task-tools.ts # Background task management (7 tools)
│   │   └── skill-loader-tools.ts # Skill loader (4 tools)
│   ├── hooks/
│   │   ├── index.ts              # Hook definitions
│   │   ├── index.test.ts         # Hooks tests
│   │   ├── enhanced-hooks.ts    # 7 enhanced hooks
│   │   └── long-running-hooks.ts # Long-running hooks
│   ├── skills/
│   │   ├── index.ts              # Basic workflow skill
│   │   └── long-running-skill.ts # Enhanced workflow
│   ├── config/
│   │   ├── schema.ts             # Zod schema (344 lines)
│   │   ├── manager.ts            # Configuration manager
│   │   └── index.ts              # Config exports
│   ├── shared/
│   │   └── permission-system.ts  # Three-tier permission system
│   └── utils/
│       ├── StateManager.ts           # State management
│       ├── LongRunningGenerator.ts   # Generation engine
│       └── utils.test.ts         # Utils tests
├── src/cli/
│   ├── installer.ts              # CLI installer
│   └── doctor.ts                # Health checks
├── .opencode/
│   └── oh-my-novel.json          # Plugin configuration
├── package.json                  # Dependencies and scripts
├── README.md                     # This file
├── AGENTS.md                     # Detailed agent documentation
├── QUICK_REFERENCE.md             # Quick reference guide
├── IMPROVEMENTS_SUMMARY.md      # Improvements summary
├── EXECUTION_REPORT.md            # Complete execution report
└── oh-my-novel.schema.json       # JSON schema for IDE auto-completion
```

---

## 📚 Examples

### Example 1: Fantasy Novel

```
Create a fantasy novel about a dragon rider who must save their kingdom
```

### Example 2: Science Fiction

```
Write a sci-fi novel set in a dystopian future where AI controls humanity
```

### Example 3: Romance

```
Help me write a contemporary romance novel with enemies-to-lovers trope
```

### Example 4: Long-Running Generation

```
Start long-run generation for "Eternal Quest" with 50 chapters
Use batch size 5, max retries 2
```

### Example 5: Search and Research

```
Search for "protagonist's backstory" in all chapters
Find all files matching "chapters/*.md"
```

---

## 🧪 Development

### Build

```bash
bun run build
```

### Test

```bash
# Run all tests
bun test

# Run specific test file
bun test src/tools/index.test.ts

# Run with coverage
bun run test:coverage

# Type check
bun run typecheck
```

### Format

```bash
bun run format
```

---

## 📊 Testing

### Test Coverage

**Test files** (3 files):

- `src/tools/index.test.ts`: 6 test suites (novel_create, chapter_write, character_manage, plot_outline, world_notes, export_novel)
- `src/hooks/index.test.ts`: 3 test suites (preToolUse, postToolUse, userPromptSubmit)
- `src/utils/utils.test.ts`: 2 test suites (StateManager, LongRunningGenerator)

**Total**: 18 test suites, ~60% code coverage

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

Inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by code-yeongyu

---

## 📞 Support

- **GitHub Repository:** https://github.com/mxrain/oh-my-novel
- **Report bugs:** [GitHub Issues](https://github.com/mxrain/oh-my-novel/issues)
- **Discussions:** [GitHub Discussions](https://github.com/mxrain/oh-my-novel/discussions)
- **Installation Guide:** [INSTALLATION.md](./INSTALLATION.md)
- **User Guide:** [USER_GUIDE.md](./USER_GUIDE.md)
- **Agent Documentation:** [AGENTS.md](./AGENTS.md)
- **Quick Reference:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

## 📈 Statistics

| Metric                   | Count                                                 |
| ------------------------ | ----------------------------------------------------- |
| **Total files**          | 28+                                                   |
| **Source files**         | 20+                                                   |
| **Test files**           | 3                                                     |
| **Tools**                | 20+                                                   |
| **Hooks**                | 12                                                    |
| **Agents**               | 5                                                     |
| **Skills**               | 2 built-in + custom                                   |
| **Categories**           | 8                                                     |
| **Configuration schema** | 344 lines                                             |
| **Code coverage**        | ~60%                                                  |
| **Dependencies**         | 5 (opencode, zod, jsonc-parser, picomatch, commander) |

---

**Happy Writing! 📚✨**
