/**
 * Type definitions for oh-my-novel plugin
 *
 * This file provides comprehensive TypeScript type exports for the oh-my-novel plugin.
 * Users can import these types for configuration, extension, and type safety.
 *
 * @example
 * ```typescript
 * import type {
 *   PermissionValue,
 *   PluginConfig,
 *   NovelSettings,
 *   GenerationState
 * } from 'oh-my-novel/types';
 *
 * const config: PluginConfig = {
 *   novelSettings: {
 *     defaultGenre: 'fantasy',
 *     chapterLength: 3000,
 *     autoSave: true
 *   }
 * };
 * ```
 */

// ============================================================================
// Permission System Types
// ============================================================================

/**
 * Permission value for controlling agent behavior
 * - `ask`: Requires user confirmation before execution
 * - `allow`: Allow execution without confirmation
 * - `deny`: Block execution entirely
 */
export type PermissionValue = 'ask' | 'allow' | 'deny';

/**
 * Bash command permission mapping
 *
 * Can be:
 * - A single permission value (applies to all bash commands)
 * - An object mapping specific commands to permissions
 *
 * @example
 * ```typescript
 * "allow"           // Allow all bash commands
 * { "git": "allow", "rm": "deny", "npm": "ask" }  // Specific permissions
 * ```
 */
export type BashPermission = PermissionValue | Record<string, PermissionValue>;

/**
 * Agent permission configuration
 *
 * Controls what an agent can do:
 * - `edit`: Allow file editing operations
 * - `bash`: Allow bash command execution
 * - `webfetch`: Allow web fetch operations
 * - `external_directory`: Allow access to external directories
 */
export interface AgentPermission {
  edit?: PermissionValue;
  bash?: BashPermission;
  webfetch?: PermissionValue;
  external_directory?: PermissionValue;
}

// ============================================================================
// Agent Types
// ============================================================================

/**
 * Built-in agent names
 */
export type BuiltinAgentName = 'novelist' | 'plot-designer' | 'character-developer' | 'world-builder' | 'editor';

/**
 * Overridable agent names (all built-in agents can be overridden)
 */
export type OverridableAgentName = 'novelist' | 'plot-designer' | 'character-developer' | 'world-builder' | 'editor';

/**
 * Agent override configuration
 *
 * Allows users to override default agent settings:
 * - `model`: Change the model used by the agent
 * - `temperature`: Adjust creativity (0.0 to 1.0)
 * - `permission`: Override default permissions
 * - `prompt_append`: Add custom prompts to the agent
 * - `disabled`: Disable the agent entirely
 *
 * @example
 * ```typescript
 * const agentOverride: AgentOverride = {
 *   model: "anthropic/claude-opus-4-5",
 *   temperature: 0.7,
 *   permission: {
 *     edit: "ask",
 *     bash: { "git": "allow", "rm": "deny" }
 *   }
 * };
 * ```
 */
export interface AgentOverride {
  model?: string;
  temperature?: number;
  permission?: AgentPermission | string[];
  prompt_append?: string;
  disabled?: boolean;
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Built-in hook names
 */
export type HookName =
  | 'preToolUse'
  | 'postToolUse'
  | 'userPromptSubmit'
  | 'longRunningMonitor'
  | 'errorRecovery'
  | 'session-recovery'
  | 'context-window-monitor'
  | 'todo-continuation-enforcer'
  | 'keyword-detector'
  | 'comment-checker'
  | 'empty-task-response-detector'
  | 'empty-message-sanitizer'
  | 'background-notification'
  | 'session-notification';

/**
 * Keyword mode that can be activated
 */
export type KeywordMode =
  | 'long-run' | 'lgr'
  | 'edit' | 'revise' | 'rewrite' | 'modify'
  | 'plot' | 'outline' | 'storyline' | 'structure' | 'narrative'
  | 'character' | 'char' | 'protagonist' | 'villain' | 'person' | 'role'
  | 'world' | 'setting' | 'environment' | 'lore' | 'geography' | 'magic' | 'system'
  | 'generate' | 'write' | 'create' | 'draft';

/**
 * Keyword detection rule
 *
 * Maps keywords to modes that should be activated when detected
 */
export interface KeywordRule {
  keywords: KeywordMode[];
  mode: string;
  description?: string;
}

// ============================================================================
// Category Types
// ============================================================================

/**
 * Built-in category names
 */
export type CategoryName = 'plotting' | 'character-development' | 'world-building' | 'writing' | 'editing' | 'research' | 'long-running' | 'planning';

/**
 * Category configuration
 *
 * Defines settings for a specific task category
 */
export interface CategoryConfig {
  model: string;
  temperature: number;
  description?: string;
  tools?: string[];
  prompt_append?: string;
  max_tokens?: number;
}

/**
 * Custom category definition
 *
 * Allows users to create new task categories
 *
 * @example
 * ```typescript
 * const customCategory: CustomCategory = {
 *   name: "Romance",
 *   id: "plotting",
 *   model: "openai/gpt-5.2",
 *   temperature: 0.4,
 *   description: "Romance story elements",
 *   tools: ["novel_create", "character_manage"]
 * };
 * ```
 */
export interface CustomCategory extends CategoryConfig {
  name: string;
  id: CategoryName;
}

// ============================================================================
// Novel Settings Types
// ============================================================================

/**
 * Novel settings configuration
 *
 * Default settings for new novel projects
 *
 * @example
 * ```typescript
 * const novelSettings: NovelSettings = {
 *   defaultGenre: "fantasy",
 *   chapterLength: 3000,
 *   autoSave: true,
 *   draftDirectory: "./drafts",
 *   outputFormat: "markdown"
 * };
 * ```
 */
export interface NovelSettings {
  defaultGenre?: string;
  chapterLength?: number;
  autoSave?: boolean;
  draftDirectory?: string;
  outputFormat?: 'markdown' | 'txt' | 'pdf';
}

// ============================================================================
// Long-Running Types
// ============================================================================

/**
 * Long-running generation configuration
 *
 * Settings for unlimited chapter generation tasks
 *
 * @example
 * ```typescript
 * const longRunningConfig: LongRunningConfig = {
 *   maxRetries: 5,
 *   retryDelay: 5000,
 *   batchSize: 10,
 *   checkpointInterval: 5,
 *   pauseOnError: true,
 *   maxConcurrentBatches: 2
 * };
 * ```
 */
export interface LongRunningConfig {
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  batchSize?: number;
  checkpointInterval?: number; // number of chapters
  pauseOnError?: boolean;
  maxConcurrentBatches?: number;
}

/**
 * Generation state status
 */
export type GenerationStatus = 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * Generation state object
 *
 * Represents the current state of a long-running generation task
 */
export interface GenerationState {
  novelTitle: string;
  totalChapters: number;
  currentChapter: number;
  generatedChapters: number[];
  failedChapters: number[];
  status: GenerationStatus;
  context: string;
  retryCount: Record<number, number>;
  createdAt: string;
  lastUpdated: string;
  checkpoints: number[];
}

/**
 * Generation progress information
 *
 * @example
 * ```typescript
 * const progress: GenerationProgress = {
 *   current: 45,
 *   total: 100,
 *   percentage: 45,
 *   failed: 3,
 *   status: "running"
 * };
 * ```
 */
export interface GenerationProgress {
  current: number;
  total: number;
  percentage: number;
  failed: number;
  status: GenerationStatus;
}

// ============================================================================
// Background Task Types
// ============================================================================

/**
 * Background task status
 */
export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * Background task object
 *
 * Represents a background task managed by the plugin
 *
 * @example
 * ```typescript
 * const task: BackgroundTask = {
 *   id: "task_123",
 *   name: "Chapter Generation",
 *   status: "running",
 *   createdAt: "2026-01-18T10:00:00Z",
 *   startedAt: "2026-01-18T10:00:05Z",
 *   progress: 45
 * };
 * ```
 */
export interface BackgroundTask {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress?: number;
  result?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Background task configuration
 *
 * @example
 * ```typescript
 * const taskConfig: BackgroundTaskConfig = {
 *   name: "Generate Chapter 5",
 *   description: "Generate chapter 5 of Dragon Pact novel",
 *   priority: 1,
 *   timeout: 600000
 * };
 * ```
 */
export interface BackgroundTaskConfig {
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
  priority?: number;
  timeout?: number; // milliseconds
}

// ============================================================================
// Session Types
// ============================================================================

/**
 * Session metadata
 *
 * Information about an OpenCode session
 */
export interface SessionMetadata {
  id: string;
  messages: number;
  first: string;
  last: string;
  agents: string[];
}

/**
 * Session search result
 *
 * Result of searching within a session
 */
export interface SessionSearchResult {
  sessionId: string;
  messageId: string;
  role: string;
  timestamp: string;
  excerpt: string;
}

/**
 * Session filter options
 *
 * @example
 * ```typescript
 * const filter: SessionFilterOptions = {
 *   limit: 10,
 *   from_date: "2026-01-01",
 *   to_date: "2026-01-18"
 * };
 * ```
 */
export interface SessionFilterOptions {
  limit?: number;
  from_date?: string;
  to_date?: string;
  project_path?: string;
}

// ============================================================================
// Search Types
// ============================================================================

/**
 * Search scope for novel content
 */
export type NovelSearchScope = 'chapters' | 'characters' | 'plot' | 'world' | 'all';

/**
 * Novel search result
 *
 * Result of searching within novel content
 *
 * @example
 * ```typescript
 * const result: NovelSearchResult = {
 *   scope: "chapters",
 *   file: "chapters/chapter-1.md",
 *   line: 42,
 *   excerpt: "...magic sword glowed...",
 *   context_before: "The hero reached out and...",
 *   context_after: "...filling the room with..."
 * };
 * ```
 */
export interface NovelSearchResult {
  scope: NovelSearchScope;
  file?: string;
  section?: string;
  line?: number;
  excerpt: string;
  context_before?: string;
  context_after?: string;
}

/**
 * Grep search options
 *
 * @example
 * ```typescript
 * const grepOptions: GrepOptions = {
 *   pattern: "magic sword",
 *   include: "*.md",
 *   caseSensitive: false,
 *   maxResults: 50
 * };
 * ```
 */
export interface GrepOptions {
  pattern: string;
  include?: string;
  caseSensitive?: boolean;
  maxResults?: number;
  path?: string;
}

/**
 * Glob search options
 *
 * @example
 * ```typescript
 * const globOptions: GlobOptions = {
 *   pattern: "**/chapters/*.md"
 * };
 * ```
 */
export interface GlobOptions {
  pattern: string;
  path?: string;
}

// ============================================================================
// Skill Types
// ============================================================================

/**
 * Built-in skill names
 */
export type BuiltinSkillName = 'novel-generation-skill' | 'long-running-skill';

/**
 * Skill metadata
 *
 * Information about a skill
 */
export interface SkillMetadata {
  name: string;
  description: string;
  model?: string;
  category?: CategoryName;
  author?: string;
  version?: string;
  enabled?: boolean;
  skills?: string[];
}

/**
 * Custom skill definition
 *
 * Allows users to create custom skills
 *
 * @example
 * ```typescript
 * const customSkill: CustomSkill = {
 *   name: "character-generator",
 *   description: "Generate detailed character profiles",
 *   model: "openai/gpt-5.2",
 *   category: "character-development",
 *   author: "User",
 *   version: "1.0.0",
 *   enabled: true,
 *   instructions: "Create rich, multi-dimensional characters...",
 *   configuration: {
 *     temperature: 0.4,
 *     max_tokens: 1000
 *   }
 * };
 * ```
 */
export interface CustomSkill extends SkillMetadata {
  instructions: string;
  configuration?: Record<string, unknown>;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Main plugin configuration
 *
 * Complete configuration for oh-my-novel plugin
 *
 * @example
 * ```typescript
 * const config: PluginConfig = {
 *   agents: {
 *     novelist: {
 *       model: "anthropic/claude-opus-4-5",
 *       temperature: 0.7,
 *       permission: {
 *         edit: "ask",
 *         bash: { "git": "allow", "rm": "deny" }
 *       }
 *     }
 *   },
 *   categories: {
 *     writing: {
 *       model: "anthropic/claude-opus-4-5",
 *       temperature: 0.7,
 *       tools: ["novel_create", "chapter_write"]
 *     }
 *   },
 *   novelSettings: {
 *     defaultGenre: "fantasy",
 *     chapterLength: 3000,
 *     autoSave: true
 *   },
 *   longRunning: {
 *     maxRetries: 5,
 *     batchSize: 10
 *   },
 *   disabled_hooks: ["comment-checker"]
 * };
 * ```
 */
export interface PluginConfig {
  /** Agent overrides */
  agents?: Partial<Record<OverridableAgentName, AgentOverride>>;
  /** Custom categories */
  categories?: Partial<Record<CategoryName, CategoryConfig>>;
  /** Novel settings */
  novelSettings?: NovelSettings;
  /** Long-running configuration */
  longRunning?: LongRunningConfig;
  /** Background task configuration */
  background_task?: {
    max_concurrent_tasks?: number;
    task_timeout?: number;
    cleanup_interval?: number;
    max_task_age?: number; // milliseconds
  };
  /** Hooks to disable */
  disabled_hooks?: HookName[];
  /** Skills to disable */
  disabled_skills?: BuiltinSkillName[];
  /** Experimental features */
  experimental?: Record<string, unknown>;
  /** Ralph Loop configuration */
  ralph_loop?: {
    enabled?: boolean;
    max_iterations?: number;
  };
  /** Notification settings */
  notification?: {
    os_notifications?: boolean;
    sound?: boolean;
  };
  /** Custom skills */
  custom_skills?: Record<string, CustomSkill>;
}

/**
 * Configuration source
 *
 * Where a configuration value came from
 */
export type ConfigSource = 'project' | 'user' | 'default';

/**
 * Configuration with source information
 *
 * Extended configuration that includes source information
 */
export interface ConfigWithSource<T> {
  value: T;
  source: ConfigSource;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Deep partial type
 *
 * Makes all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Required keys
 *
 * Makes specified keys required
 */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Optional keys
 *
 * Makes specified keys optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================================================
// Plugin Types
// ============================================================================

/**
 * Plugin metadata
 *
 * Information about the plugin itself
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
}

/**
 * Plugin export
 *
 * The main export of the plugin
 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  agents: unknown;
  tools: unknown;
  hooks: unknown;
  skills: unknown;
  config: unknown;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a permission value
 *
 * @example
 * ```typescript
 * if (isPermissionValue(value)) {
 *   console.log(value); // "ask", "allow", or "deny"
 * }
 * ```
 */
export function isPermissionValue(value: unknown): value is PermissionValue {
  return value === 'ask' || value === 'allow' || value === 'deny';
}

/**
 * Check if a value is a hook name
 *
 * @example
 * ```typescript
 * if (isHookName(hookName)) {
 *   console.log(`Hook: ${hookName}`);
 * }
 * ```
 */
export function isHookName(value: unknown): value is HookName {
  const hooks: HookName[] = [
    'preToolUse',
    'postToolUse',
    'userPromptSubmit',
    'longRunningMonitor',
    'errorRecovery',
    'session-recovery',
    'context-window-monitor',
    'todo-continuation-enforcer',
    'keyword-detector',
    'comment-checker',
    'empty-task-response-detector',
    'empty-message-sanitizer',
    'background-notification',
    'session-notification',
  ];
  return typeof value === 'string' && hooks.includes(value as HookName);
}

/**
 * Check if a value is a category name
 *
 * @example
 * ```typescript
 * if (isCategoryName(category)) {
 *   console.log(`Category: ${category}`);
 * }
 * ```
 */
export function isCategoryName(value: unknown): value is CategoryName {
  const categories: CategoryName[] = [
    'plotting',
    'character-development',
    'world-building',
    'writing',
    'editing',
    'research',
    'long-running',
    'planning',
  ];
  return typeof value === 'string' && categories.includes(value as CategoryName);
}

/**
 * Check if a value is a generation status
 *
 * @example
 * ```typescript
 * if (isGenerationStatus(status)) {
 *   console.log(`Status: ${status}`);
 * }
 * ```
 */
export function isGenerationStatus(value: unknown): value is GenerationStatus {
  const statuses: GenerationStatus[] = ['running', 'paused', 'completed', 'failed', 'cancelled'];
  return typeof value === 'string' && statuses.includes(value as GenerationStatus);
}

/**
 * Check if a value is a task status
 *
 * @example
 * ```typescript
 * if (isTaskStatus(status)) {
 *   console.log(`Task status: ${status}`);
 * }
 * ```
 */
export function isTaskStatus(value: unknown): value is TaskStatus {
  const statuses: TaskStatus[] = ['pending', 'running', 'paused', 'completed', 'failed', 'cancelled'];
  return typeof value === 'string' && statuses.includes(value as TaskStatus);
}
