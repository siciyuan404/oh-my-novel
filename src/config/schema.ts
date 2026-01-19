import { z } from "zod";

// Permission System
const PermissionValue = z.enum(["ask", "allow", "deny"]);

const BashPermission = z.union([
  PermissionValue,
  z.record(z.string(), PermissionValue),
]);

const AgentPermissionSchema = z.object({
  edit: PermissionValue.optional(),
  bash: BashPermission.optional(),
  webfetch: PermissionValue.optional(),
  external_directory: PermissionValue.optional(),
});

// Built-in Agent Names
export const BuiltinAgentNameSchema = z.enum([
  "novelist",
  "plot-designer",
  "character-developer",
  "world-builder",
  "editor",
]);

export const OverridableAgentNameSchema = z.enum([
  "novelist",
  "plot-designer",
  "character-developer",
  "world-builder",
  "editor",
]);

// Built-in Hook Names
export const HookNameSchema = z.enum([
  "preToolUse",
  "postToolUse",
  "userPromptSubmit",
  "longRunningMonitor",
  "errorRecovery",
  "session-recovery",
  "context-window-monitor",
  "todo-continuation-enforcer",
  "keyword-detector",
  "comment-checker",
  "empty-task-response-detector",
  "empty-message-sanitizer",
  "background-notification",
  "session-notification",
  "auto-update-checker",
  "startup-toast",
  "directory-agents-injector",
  "directory-readme-injector",
  "rules-injector",
  "thinking-block-validator",
  "claude-code-hooks",
]);

// Agent Override Configuration
export const AgentOverrideConfigSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  prompt: z.string().optional(),
  prompt_append: z.string().optional(),
  tools: z.record(z.string(), z.boolean()).optional(),
  disable: z.boolean().optional(),
  description: z.string().optional(),
  permission: AgentPermissionSchema.optional(),
});

export const AgentOverridesSchema = z.object({
  novelist: AgentOverrideConfigSchema.optional(),
  "plot-designer": AgentOverrideConfigSchema.optional(),
  "character-developer": AgentOverrideConfigSchema.optional(),
  "world-builder": AgentOverrideConfigSchema.optional(),
  editor: AgentOverrideConfigSchema.optional(),
});

// Novel Settings
export const NovelSettingsSchema = z.object({
  defaultGenre: z.string().default("fantasy"),
  chapterLength: z.number().positive().default(3000),
  autoSave: z.boolean().default(true),
});

// Long Running Configuration
export const LongRunningConfigSchema = z.object({
  maxRetries: z.number().positive().default(3),
  retryDelay: z.number().positive().default(5000),
  checkpointInterval: z.number().positive().default(1),
  batchSize: z.number().positive().default(5),
  pauseOnError: z.boolean().default(true),
  autoResume: z.boolean().default(false),
});

// Background Task Configuration
export const BackgroundTaskConfigSchema = z.object({
  defaultConcurrency: z.number().positive().optional(),
  modelConcurrency: z.record(z.string(), z.number().positive()).optional(),
  staleTimeoutMs: z.number().positive().optional(),
});

// Categories Configuration
export const CategoryConfigSchema = z.object({
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  maxTokens: z.number().optional(),
  tools: z.record(z.string(), z.boolean()).optional(),
  prompt_append: z.string().optional(),
});

export const CategoriesConfigSchema = z.record(z.string(), CategoryConfigSchema);

// Comment Checker Configuration
export const CommentCheckerConfigSchema = z.object({
  custom_prompt: z.string().optional(),
});

// Experimental Features
export const ExperimentalConfigSchema = z.object({
  truncate_all_tool_outputs: z.boolean().optional(),
  aggressive_truncation: z.boolean().optional(),
  auto_resume: z.boolean().optional(),
  dynamic_context_pruning: z.object({
    enabled: z.boolean().default(false),
    notification: z.enum(["off", "minimal", "detailed"]).default("detailed"),
    turn_protection: z.object({
      enabled: z.boolean().default(true),
      turns: z.number().min(1).max(10).default(3),
    }).optional(),
    protected_tools: z.array(z.string()).default([]),
    strategies: z.object({
      deduplication: z.object({ enabled: z.boolean() }).optional(),
      supersede_writes: z.object({ aggressive: z.boolean() }).optional(),
      purge_errors: z.object({ turns: z.number() }).optional(),
    }).optional(),
  }).optional(),
});

// Ralph Loop Configuration
export const RalphLoopConfigSchema = z.object({
  enabled: z.boolean().default(false),
  default_max_iterations: z.number().min(1).max(1000).default(100),
  state_dir: z.string().optional(),
});

// Notification Configuration
export const NotificationConfigSchema = z.object({
  force_enable: z.boolean().optional(),
});

// Main Configuration Schema
export const OhMyNovelConfigSchema = z.object({
  $schema: z.string().optional(),
  disabled_hooks: z.array(HookNameSchema).optional(),
  disabled_agents: z.array(BuiltinAgentNameSchema).optional(),
  disabled_tools: z.array(z.string()).optional(),
  agents: AgentOverridesSchema.optional(),
  categories: CategoriesConfigSchema.optional(),
  novelSettings: NovelSettingsSchema.optional(),
  longRunning: LongRunningConfigSchema.optional(),
  background_task: BackgroundTaskConfigSchema.optional(),
  comment_checker: CommentCheckerConfigSchema.optional(),
  experimental: ExperimentalConfigSchema.optional(),
  ralph_loop: RalphLoopConfigSchema.optional(),
  notification: NotificationConfigSchema.optional(),
});

// Type Exports
export type OhMyNovelConfig = z.infer<typeof OhMyNovelConfigSchema>;
export type AgentOverrideConfig = z.infer<typeof AgentOverrideConfigSchema>;
export type AgentOverrides = z.infer<typeof AgentOverridesSchema>;
export type AgentPermission = z.infer<typeof AgentPermissionSchema>;
export type NovelSettings = z.infer<typeof NovelSettingsSchema>;
export type LongRunningConfig = z.infer<typeof LongRunningConfigSchema>;
export type BackgroundTaskConfig = z.infer<typeof BackgroundTaskConfigSchema>;
export type CategoryConfig = z.infer<typeof CategoryConfigSchema>;
export type CategoriesConfig = z.infer<typeof CategoriesConfigSchema>;
export type CommentCheckerConfig = z.infer<typeof CommentCheckerConfigSchema>;
export type ExperimentalConfig = z.infer<typeof ExperimentalConfigSchema>;
export type RalphLoopConfig = z.infer<typeof RalphLoopConfigSchema>;
export type NotificationConfig = z.infer<typeof NotificationConfigSchema>;
export type PermissionValue = z.infer<typeof PermissionValue>;
export type HookName = z.infer<typeof HookNameSchema>;
export type BuiltinAgentName = z.infer<typeof BuiltinAgentNameSchema>;
export type OverridableAgentName = z.infer<typeof OverridableAgentNameSchema>;

// Default configuration
export const defaultConfig: OhMyNovelConfig = {
  novelSettings: {
    defaultGenre: "fantasy",
    chapterLength: 3000,
    autoSave: true,
  },
  longRunning: {
    maxRetries: 3,
    retryDelay: 5000,
    checkpointInterval: 1,
    batchSize: 5,
    pauseOnError: true,
    autoResume: false,
  },
  background_task: {
    defaultConcurrency: 5,
    staleTimeoutMs: 180000, // 3 minutes
  },
};

// Validation helper function
export function validateConfig(config: unknown): OhMyNovelConfig {
  return OhMyNovelConfigSchema.parse(config);
}

// Safe parse helper
export function safeParseConfig(config: unknown): {
  success: boolean;
  data?: OhMyNovelConfig;
  error?: z.ZodError;
} {
  const result = OhMyNovelConfigSchema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
