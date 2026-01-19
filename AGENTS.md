# AGENTS.md

**Generated**: 2026-01-18
**Plugin**: Oh-My-Novel v1.0.0
**OpenCode Version**: >= 1.0.150

---

## OVERVIEW

Oh-My-Novel is an OpenCode plugin that transforms the platform into an AI-powered novel writing assistant. It provides automated generation, organization, and management of complete novels using specialized AI agents.

**Mission**: "Oh-my-zsh for novel writing with OpenCode" - Batteries-included agent harness with multi-model orchestration, parallel background agents, and comprehensive tooling for creative writing.

---

## AGENT SYSTEM

### Specialized Agents (5 agents)

| Agent                   | Model                       | Permissions      | Purpose                                                                                         |
| ----------------------- | --------------------------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| **Novelist**            | anthropic/claude-opus-4-5   | read, write, run | Main orchestrator. Manages chapter progression, narrative consistency, coordinates other agents |
| **Plot Designer**       | openai/gpt-5.2              | read             | Creates compelling story arcs, plot twists, narrative structures                                |
| **Character Developer** | openai/gpt-5.2              | read             | Builds rich, multi-dimensional characters with backstories and motivations                      |
| **World Builder**       | anthropic/claude-opus-4-5   | read             | Constructs immersive settings, magic systems, world lore                                        |
| **Editor**              | google/gemini-3-pro-preview | read, write      | Refines prose, checks for consistency, polishes manuscript                                      |

### Agent Collaboration Model

1. **Novelist** initiates work
2. Consults **Plot Designer** for major story beats
3. Works with **Character Developer** for character consistency
4. Collaborates with **World Builder** for setting details
5. Uses **Editor** for final polishing

### Permission System

Three-tier permission system: `ask` / `allow` / `deny`

- **Tool-level permissions**: Control which tools each agent can access
- **Bash command permissions**: Fine-grained control over shell commands (e.g., `{ "git": "allow", "rm": "deny" }`)
- **File operation permissions**: Control read/write/edit operations

**Permission Presets**:

- `readOnly`: Plot Designer, Character Developer (can't write files)
- `readWrite`: Novelist, Editor (can read and write)
- `exploration`: World Builder (can explore and read)
- `fullAccess`: Complete access (use with caution)

---

## TOOLS (20+ tools)

### Novel Management Tools (6 tools)

| Tool               | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `novel_create`     | Initialize a new novel project with directory structure |
| `chapter_write`    | Write individual chapters with word count tracking      |
| `character_manage` | CRUD operations for character profiles                  |
| `plot_outline`     | Create/view/update plot outlines                        |
| `world_notes`      | Document world-building details by category             |
| `export_novel`     | Export complete novel to markdown/txt                   |

### Long-Running Tools (7 tools)

| Tool                            | Description                                              |
| ------------------------------- | -------------------------------------------------------- |
| `start_long_running_generation` | Start unlimited chapter generation with batch processing |
| `check_generation_progress`     | Monitor real-time progress and status                    |
| `pause_generation`              | Gracefully pause running tasks                           |
| `resume_generation`             | Resume from checkpoints                                  |
| `list_all_generations`          | List all active/saved tasks                              |
| `delete_generation_state`       | Clean up and stop tasks                                  |
| `export_generation_state`       | Export state for backup                                  |

### Search Tools (3 tools)

| Tool           | Description                                                     | Limits                   |
| -------------- | --------------------------------------------------------------- | ------------------------ |
| `grep`         | Search for patterns using ripgrep                               | 60s timeout, 10MB output |
| `glob`         | Find files matching patterns                                    | 60s timeout, 100 files   |
| `search_novel` | Search within novel content (chapters, characters, plot, world) | Scoped search            |

### Session Management Tools (4 tools)

| Tool             | Description                                        |
| ---------------- | -------------------------------------------------- |
| `session_list`   | List all sessions with filtering by date and limit |
| `session_read`   | Read messages and history from a specific session  |
| `session_search` | Full-text search across session messages           |
| `session_info`   | Get metadata and statistics about a session        |

### Category Tools (3 tools)

| Tool                 | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `list_categories`    | List all available task categories with descriptions |
| `apply_category`     | Apply category configuration to agent invocation     |
| `recommend_category` | Analyze task and recommend appropriate category      |

### Background Task Tools (7 tools)

| Tool              | Description                                   |
| ----------------- | --------------------------------------------- |
| `create_task`     | Create a new background task                  |
| `start_task`      | Start a pending background task               |
| `pause_task`      | Pause a running background task               |
| `resume_task`     | Resume a paused background task               |
| `cancel_task`     | Cancel a background task                      |
| `list_tasks`      | List all background tasks with filtering      |
| `get_task_status` | Get detailed status of a specific task        |
| `cleanup_tasks`   | Clean up old completed/failed/cancelled tasks |

### Skill Loader Tools (4 tools)

| Tool                    | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `load_skill`            | Load a custom skill by name                      |
| `list_skills`           | List all available custom skills                 |
| `reload_skills`         | Reload all skills from directories               |
| `create_skill_template` | Generate a skill template for users to customize |

---

## HOOKS SYSTEM (12 hooks)

### Core Hooks (3 hooks)

| Hook               | Description                                |
| ------------------ | ------------------------------------------ |
| `preToolUse`       | Auto-save drafts before operations         |
| `postToolUse`      | Update chapter indexes and track progress  |
| `userPromptSubmit` | Inject novel context into AI conversations |

### Enhanced Hooks (7 hooks)

| Hook                           | Description                                                                                             | Triggers                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------- |
| `session-recovery`             | Automatically recover from session errors (missing tool results, empty messages, thinking block issues) | event, tool.execute.before |
| `context-window-monitor`       | Monitor token usage and alert at 70%/90% thresholds                                                     | chat.message               |
| `todo-continuation-enforcer`   | Force agents to complete all TODOs before stopping                                                      | chat.message               |
| `keyword-detector`             | Detect keywords and activate specialized modes (long-run, edit, plot, character, world, generate)       | userPromptSubmit           |
| `comment-checker`              | Prevent AI from adding excessive comments (>15% ratio)                                                  | tool.execute.after         |
| `empty-task-response-detector` | Catch when Task tool returns nothing                                                                    | tool.execute.after         |
| `background-notification`      | Notify when background agent tasks complete                                                             | event                      |
| `longRunningMonitor`           | Monitor long-running tasks and auto-save checkpoints                                                    | event                      |
| `errorRecovery`                | Log errors and identify recovery points from backups                                                    | event                      |

### Long-Running Hooks (2 hooks)

These hooks are defined in `src/hooks/long-running-hooks.ts` and handle:

- Monitoring long-running generation tasks
- Error recovery during generation

---

## CONFIGURATION SYSTEM

### Configuration Schema (Zod validation, 344 lines)

**Multi-level configuration**:

1. `.opencode/oh-my-novel.jsonc` (project-level, highest priority)
2. `.opencode/oh-my-novel.json` (project-level)
3. `~/.config/opencode/oh-my-novel.jsonc` (user-level)
4. `~/.config/opencode/oh-my-novel.json` (user-level)

**Configuration sections**:

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
    },
    "plot-designer": {
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

### Configuration Manager

`src/config/manager.ts` provides:

- Multi-level configuration loading with priority
- JSONC parsing support
- Runtime validation with Zod
- Configuration caching
- Helper methods: `isHookDisabled()`, `isAgentDisabled()`, `getCategoryConfig()`

---

## CATEGORIES SYSTEM

### Default Categories (8 categories)

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

### Category-Based Delegation

Use `apply_category` tool to automatically apply category settings to agents:

```typescript
apply_category({
  category: "plotting",
  agent: "novelist",
  validate: true,
});
```

This applies the category's model, temperature, tools, and prompt_append to the agent.

---

## SKILLS SYSTEM

### Built-in Skills (2 skills)

1. **novel-generation-skill** (`src/skills/index.ts`)
   - 10-step workflow: Initialize → Design Plot → Develop Characters → Build World → Start Generation → Monitor → Pause (optional) → Resume → Edit → Export

2. **long-running-skill** (`src/skills/long-running-skill.ts`)
   - Enhanced workflow for long-running generation with unlimited chapters
   - Includes retry, checkpoint recovery, batch processing

### Custom Skills

Custom skills can be loaded from:

- `~/.claude/skills/` (user-level)
- `./.claude/skills/` (project-level)
- `~/.config/opencode/skills/` (opencode user-level)
- `./.opencode/skills/` (opencode project-level)

**Skill format**:

```markdown
---
name: custom-character-generator
description: Generate detailed character profiles
model: openai/gpt-5.2
category: character-development
author: User
version: 1.0.0
enabled: true
skills:
---

# Custom Character Generator

Generate detailed character profiles with backstories, motivations, and flaws.

## Instructions

Use this skill to create rich, multi-dimensional characters:

- Define clear goals and motivations
- Create internal and external conflicts
- Design visible flaws and weaknesses
- Ensure characters have distinct voices
- Plan meaningful character growth

## Configuration

- Model: openai/gpt-5.2
- Temperature: 0.4

## Example

custom-character-generator: "Create a young wizard protagonist with a hidden power"
```

---

## LONG-RUNNING GENERATION

### State Management

Persistent state storage in `./.oh-my-novel-state/`:

- `novelTitle`: Novel identifier
- `currentChapter`: Current chapter being generated
- `totalChapters`: Total chapters to generate
- `generatedChapters`: Array of successfully generated chapter numbers
- `failedChapters`: Array of failed chapter numbers
- `status`: `running` | `paused` | `completed` | `failed` | `cancelled`
- `retryCount`: Object tracking retries per chapter
- `timestamp`: Start, last update, checkpoint times

### StateManager Methods

- `initializeState(title, totalChapters, context)`: Create new state
- `loadState(title)`: Load existing state
- `saveState(state)`: Persist state to file
- `updateChapterProgress(num, success)`: Update chapter status
- `canRetry(num, maxRetries)`: Check if retry available
- `getFailedChapters()`: Get failed chapter list
- `getNextChapter()`: Get next chapter to generate
- `deleteState(title)`: Delete state file
- `exportState(title, path)`: Export state for backup
- `listAllStates()`: List all saved states

### LongRunningGenerator Methods

- `startGeneration(title, totalChapters, context, generateChapter)`: Start batch generation
- `resume(generateChapter)`: Resume from checkpoint
- `pause()`: Gracefully pause current generation
- `stop()`: Stop generation
- `getStatus()`: Get current state
- `getProgress()`: Get progress metrics (current, total, percentage, failed)
- `listAllGenerations()`: List all generations

### Resilience Features

✅ **Unlimited chapter support**: Tested with 100+ chapters
✅ **Auto checkpoints**: Save state after each chapter
✅ **Resume from interruption**: Pause and resume at any point
✅ **Error retry**: Failed chapters automatically retried (configurable retry count and delay)
✅ **Batch processing**: Process multiple chapters per batch (configurable batch size)
✅ **Memory optimization**: Streaming avoids loading all chapters
✅ **Progress tracking**: Real-time view of generation progress and status
✅ **Recovery mechanisms**: Export/import state for backup

---

## TESTING

### Test Coverage

**Test files** (3 files):

- `src/tools/index.test.ts`: 6 test suites (novel_create, chapter_write, character_manage, plot_outline, world_notes, export_novel)
- `src/hooks/index.test.ts`: 3 test suites (preToolUse, postToolUse, userPromptSubmit)
- `src/utils/utils.test.ts`: 2 test suites (StateManager, LongRunningGenerator)

**Total**: 18 test suites

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/tools/index.test.ts

# Run with coverage
bun run test:coverage

# Type check
bun run typecheck

# Build
bun run build
```

---

## CLI TOOLS

### Installation

```bash
# Interactive installation wizard
bunx oh-my-novel install

# Non-interactive mode
bunx oh-my-novel install --no-tui

# Skip dependency checks
bunx oh-my-novel install --skip-deps
```

### Health Check

```bash
# Run doctor checks
bunx oh-my-novel doctor

# Or via node after build
node dist/cli/doctor.js
```

### Commands

- `install`: Interactive installation wizard
  - Checks OpenCode installation and version
  - Validates dependencies
  - Creates configuration files
  - Interactive configuration prompts

- `doctor`: Health checks
  - OpenCode version check (>= 1.0.150)
  - Dependency validation (Node.js, Bun, ripgrep, Git)
  - Configuration validation
  - Directory checks (novels, state)
  - Disk space check
  - Agent configuration validation

- `uninstall`: Uninstall plugin
  - Remove plugin registration from opencode.json
  - Optionally remove configuration files

---

## NOVEL PROJECT STRUCTURE

```
./novels/{title}/
├── metadata.json              # Novel metadata
├── plot-outline.md           # Story outline
├── chapters/
│   ├── chapter-1.md
│   ├── chapter-2.md
│   └── index.json            # Chapter index
├── characters/
│   ├── character-name.md
│   └── index.json
├── world-building/
│   ├── category-name.md
│   └── main.md
├── drafts/                     # Auto-saved drafts
└── progress-log.md           # Progress tracking
```

---

## STATE STORAGE STRUCTURE

```
./.oh-my-novel-state/
└── {title}-state.json        # Generation state
```

**State Object**:

```typescript
{
  novelTitle: string;
  totalChapters: number;
  currentChapter: number;
  generatedChapters: number[];
  failedChapters: number[];
  status: "running" | "paused" | "completed" | "failed" | "cancelled";
  context: string;
  retryCount: Record<number, number>;
  createdAt: string;
  lastUpdated: string;
  checkpoints: number[];
}
```

---

## FILE STRUCTURE

```
oh-my-novel/
├── src/
│   ├── index.ts                   # Main plugin entry (46 lines)
│   ├── agents/
│   │   └── index.ts              # Agent definitions (119 lines)
│   ├── tools/
│   │   ├── index.ts              # Core tools (13 exports)
│   │   ├── index.test.ts         # Tools tests
│   │   ├── long-running.ts        # Long-running tools
│   │   ├── search-tools.ts       # Search tools (3 exports)
│   │   ├── session-tools.ts       # Session management (4 exports)
│   │   ├── category-tools.ts     # Category system (3 exports)
│   │   ├── background-task-tools.ts # Background task management (7 exports)
│   │   └── skill-loader-tools.ts # Skill loader (4 exports)
│   ├── hooks/
│   │   ├── index.ts              # Hook definitions (12 exports)
│   │   ├── index.test.ts         # Hooks tests
│   │   └── enhanced-hooks.ts    # 7 enhanced hooks
│   │   └── long-running-hooks.ts # Long-running hooks
│   ├── skills/
│   │   ├── index.ts              # Basic workflow skill
│   │   └── long-running-skill.ts # Enhanced workflow
│   ├── config/
│   │   ├── schema.ts             # Zod schema (344 lines)
│   │   ├── manager.ts            # Configuration manager (180+ lines)
│   │   └── index.ts              # Config exports
│   ├── shared/
│   │   └── permission-system.ts  # Three-tier permission system (200+ lines)
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
├── README.md                     # Main documentation
├── QUICK_REFERENCE.md             # Quick reference guide
├── IMPROVEMENTS_SUMMARY.md      # Improvements summary
└── EXECUTION_REPORT.md            # Complete execution report
```

---

## KEYWORD DETECTION

The keyword detector automatically activates specialized modes when keywords are detected in user prompts:

| Mode                                                       | Keywords                                                    | Behavior                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| `long-run` / `lgr`                                         | long-run, longrunning, unlimited, batch                     | Activate long-running mode with batch processing and auto-retry |
| `edit` / `revise` / `rewrite` / `modify`                   | edit, revise, rewrite, modify                               | Activate editing mode with Editor agent                         |
| `plot` / `outline` / `storyline` / `structure`             | plot, outline, storyline, structure, narrative              | Activate plotting mode                                          |
| `character` / `char` / `protagonist` / `villain`           | character, char, protagonist, villain, person, role         | Activate character development mode                             |
| `world` / `setting` / `environment` / `lore` / `geography` | world, setting, environment, lore, geography, magic, system | Activate world-building mode                                    |
| `generate` / `write` / `create` / `draft`                  | generate, write, create, draft                              | Activate writing mode                                           |

**Usage**:

```
User: "Start long-run generation for Dragon Pact novel"
→ Mode: long-run activated

User: "Edit chapter 5 to improve the dialogue"
→ Mode: edit activated
```

---

## PERMISSION SYSTEM DETAILS

### Permission Values

- `ask`: Requires user confirmation before execution
- `allow`: Allow execution without confirmation
- `deny`: Block execution entirely

### Permission Types

1. **Tool permissions**: Control access to specific tools

   ```typescript
   permission: {
     "novel_create": "deny",
     "chapter_write": "ask",
     "grep": "allow"
   }
   ```

2. **Bash permissions**: Control shell command execution

   ```typescript
   permission: {
     bash: {
       "git": "allow",
       "rm": "deny",
       "npm": "ask"
     }
   }
   ```

3. **File operation permissions**: Control read/write/edit
   ```typescript
   permission: {
     edit: "deny",
     "write": "ask"
   }
   ```

### Helper Functions

```typescript
// Check tool permission
checkToolPermission(toolName: string, permissions): {
  allowed: boolean;
  reason?: string;
  requiresConfirmation: boolean;
}

// Check bash permission
checkBashPermission(command: string, permissions): {
  allowed: boolean;
  reason?: string;
}

// Check file operation permission
checkFileOperationPermission(operation, permissions): {
  allowed: boolean;
  reason?: string;
}
```

---

## DIRECTORY STRUCTURE

```
oh-my-novel/
├── src/
│   ├── agents/                    # AI agent definitions
│   ├── tools/                     # Plugin tools
│   │   ├── index.ts
│   │   ├── search-tools.ts
│   │   ├── session-tools.ts
│   │   ├── category-tools.ts
│   │   ├── background-task-tools.ts
│   │   └── skill-loader-tools.ts
│   ├── hooks/                     # Lifecycle hooks
│   │   ├── index.ts
│   │   ├── enhanced-hooks.ts
│   │   └── long-running-hooks.ts
│   ├── skills/                    # Predefined workflows
│   ├── config/                    # Configuration system
│   ├── shared/                    # Shared utilities
│   └── utils/                      # Core utilities
├── src/cli/                      # CLI tools
├── .opencode/                     # Plugin config
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── README.md                      # Main docs
├── QUICK_REFERENCE.md              # Quick reference
├── IMPROVEMENTS_SUMMARY.md      # Improvements summary
├── EXECUTION_REPORT.md            # Execution report
└── AGENTS.md                     # This file
```

---

## STATISTICS

| Metric                   | Count                                                 |
| ------------------------ | ----------------------------------------------------- |
| **Total files**          | 28+                                                   |
| **Source files**         | 20+                                                   |
| **Test files**           | 3                                                     |
| **Tools**                | 20+                                                   |
| **Hooks**                | 12                                                    |
| **Agents**               | 5                                                     |
| **Skills**               | 2 built-in + custom                                   |
| **Configuration schema** | 344 lines                                             |
| **Code coverage**        | ~60%                                                  |
| **Dependencies**         | 5 (opencode, zod, jsonc-parser, picomatch, commander) |

---

## NEXT STEPS

1. Install dependencies: `bun install`
2. Build project: `bun run build`
3. Run tests: `bun test`
4. Type check: `bun run typecheck`
5. Run health check: `bunx oh-my-novel doctor`
6. Start writing: `opencode` and begin with `Create a fantasy novel about dragons`

---

## QUICK START

### Basic Novel Creation

```
User: Create a fantasy novel about dragons

[Auto]
1. Novelist creates project structure
2. Plot Designer generates story outline
3. Character Developer creates protagonists and antagonists
4. World Builder establishes magic system and setting
5. Writer begins generating chapters
```

### Long-Running Generation

```
User: Start long-run generation for "Dragon Pact" with 100 chapters

[Auto]
- Batch processing (default: 10 chapters/batch)
- Auto-retry (default: 3 attempts, 5s delay)
- Checkpoints after each chapter
- Progress tracking available via check_generation_progress tool
- Can pause/resume anytime
```

### Search and Research

```
User: Search for "magic sword" in the novel

[Options]
- search_novel: Searches chapters, characters, plot, world
- grep: Search all files with patterns
- glob: Find files matching patterns
```

---

## CONTACT & SUPPORT

- **GitHub**: https://github.com/siciyuan404/oh-my-novel
- **Issues**: https://github.com/siciyuan404/oh-my-novel/issues
- **Discussions**: https://github.com/siciyuan404/oh-my-novel/discussions
- **Inspired by**: [oh-my-opencode](https://github.com/siciyuan404/oh-my-opencode)

---

## LICENSE

MIT License - see LICENSE file for details

---

**End of AGENTS.md**
