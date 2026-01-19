import { PermissionValue } from "../config/schema.js";

/**
 * Permission System for oh-my-novel
 * Three-tier permissions: ask / allow / deny
 */

export type PermissionValue = "ask" | "allow" | "deny";

export type PermissionFormat = {
  permission: Record<string, PermissionValue>;
};

/**
 * Create agent tool restrictions
 * @param denyTools - Array of tool names to deny
 */
export function createAgentToolRestrictions(denyTools: string[]): PermissionFormat {
  const permission: Record<string, PermissionValue> = {};

  for (const tool of denyTools) {
    permission[tool] = "deny";
  }

  return { permission };
}

/**
 * Create agent tool allowlist
 * @param allowTools - Array of tool names to allow (all others denied)
 */
export function createAgentToolAllowlist(allowTools: string[]): PermissionFormat {
  const permission: Record<string, PermissionValue> = {};

  // Deny all tools by default
  const allTools = [
    "novel_create",
    "chapter_write",
    "character_manage",
    "plot_outline",
    "world_notes",
    "export_novel",
    "start_long_running_generation",
    "check_generation_progress",
    "pause_generation",
    "resume_generation",
    "list_all_generations",
    "delete_generation_state",
    "export_generation_state",
    "grep",
    "glob",
    "search_novel",
    "task",
    "delegate_task",
    "call_omo_agent",
    "background_output",
    "background_cancel",
    "look_at",
    "skill",
    "skill_mcp",
    "slashcommand",
    "interactive_bash"
  ];

  for (const tool of allTools) {
    permission[tool] = allowTools.includes(tool) ? "allow" : "deny";
  }

  return { permission };
}

/**
 * Check if tool execution is permitted
 * @param toolName - Tool name to check
 * @param permissions - Agent's permission configuration
 * @returns Object with { allowed, reason, requiresConfirmation }
 */
export function checkToolPermission(
  toolName: string,
  permissions: Record<string, PermissionValue>
): {
  allowed: boolean;
  reason?: string;
  requiresConfirmation: boolean;
} {
  const permission = permissions[toolName];

  if (!permission || permission === "allow") {
    return { allowed: true, requiresConfirmation: false };
  }

  if (permission === "deny") {
    return {
      allowed: false,
      reason: `Tool "${toolName}" is denied by agent permissions`,
      requiresConfirmation: false
    };
  }

  if (permission === "ask") {
    return {
      allowed: true,
      reason: `Tool "${toolName}" requires confirmation`,
      requiresConfirmation: true
    };
  }

  return { allowed: true, requiresConfirmation: false };
}

/**
 * Check bash command permission
 * @param command - Bash command to check
 * @param permissions - Agent's permission configuration
 * @returns Object with { allowed, reason }
 */
export function checkBashPermission(
  command: string,
  permissions: Record<string, PermissionValue>
): {
  allowed: boolean;
  reason?: string;
} {
  const bashPermission = permissions["bash"];

  // No bash permission specified, default to ask
  if (!bashPermission) {
    return {
      allowed: false,
      reason: "Bash command requires explicit permission"
    };
  }

  // Global bash permission
  if (bashPermission === "allow") {
    return { allowed: true };
  }

  if (bashPermission === "deny") {
    return {
      allowed: false,
      reason: "Bash commands are denied for this agent"
    };
  }

  // Per-command permissions
  if (typeof bashPermission === "object") {
    const commandName = command.split(" ")[0].trim();

    const commandPermission = bashPermission[commandName];

    if (commandPermission === "allow") {
      return { allowed: true };
    }

    if (commandPermission === "deny") {
      return {
        allowed: false,
        reason: `Command "${commandName}" is denied`
      };
    }

    // Default to ask for unspecified commands
    return {
      allowed: false,
      reason: `Command "${commandName}" requires explicit permission`
    };
  }

  // ask permission for bash
  return {
    allowed: false,
    reason: "Bash command requires user confirmation"
  };
}

/**
 * Check file operation permission
 * @param operation - File operation type
 * @param permissions - Agent's permission configuration
 * @returns Object with { allowed, reason }
 */
export function checkFileOperationPermission(
  operation: "read" | "write" | "edit",
  permissions: Record<string, PermissionValue>
): {
  allowed: boolean;
  reason?: string;
} {
  const permission = permissions[operation];

  if (!permission || permission === "allow") {
    return { allowed: true };
  }

  if (permission === "deny") {
    return {
      allowed: false,
      reason: `${operation} operations are denied for this agent`
    };
  }

  // ask permission
  return {
    allowed: false,
    reason: `${operation} operation requires user confirmation`
  };
}

/**
 * Permission presets for different agent types
 */
export const AgentPermissionPresets = {
  // Read-only agent (e.g., plot designer, character developer)
  readOnly: createAgentToolRestrictions([
    "novel_create",
    "chapter_write",
    "world_notes",
    "export_novel",
    "start_long_running_generation",
    "pause_generation",
    "resume_generation",
    "delete_generation_state"
  ]),

  // Read-write agent (e.g., novelist, editor)
  readWrite: createAgentToolAllowlist([
    "novel_create",
    "chapter_write",
    "character_manage",
    "plot_outline",
    "world_notes",
    "export_novel",
    "search_novel",
    "grep",
    "glob"
  ]),

  // Exploration agent (e.g., world builder)
  exploration: createAgentToolAllowlist([
    "character_manage",
    "plot_outline",
    "world_notes",
    "search_novel",
    "grep",
    "glob"
  ]),

  // Full access agent (rare, use with caution)
  fullAccess: createAgentToolAllowlist([
    "novel_create",
    "chapter_write",
    "character_manage",
    "plot_outline",
    "world_notes",
    "export_novel",
    "start_long_running_generation",
    "check_generation_progress",
    "pause_generation",
    "resume_generation",
    "list_all_generations",
    "delete_generation_state",
    "export_generation_state",
    "grep",
    "glob",
    "search_novel"
  ])
};
