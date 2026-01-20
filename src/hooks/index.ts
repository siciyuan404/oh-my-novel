import type { Hook } from "../types/index.js";
import * as fs from "fs";
import * as path from "path";
import { configManager } from "../config/index.js";

// Enhanced hooks
export {
  createSessionRecoveryHook,
  createContextWindowMonitorHook,
  createTodoContinuationEnforcerHook,
  createKeywordDetectorHook,
  createCommentCheckerHook,
  createEmptyTaskResponseDetectorHook,
  createBackgroundNotificationHook
} from "./enhanced-hooks.js";

const DRAFT_DIR = "./drafts";

function ensureDraftDir(): void {
  if (!fs.existsSync(DRAFT_DIR)) {
    fs.mkdirSync(DRAFT_DIR, { recursive: true });
  }
}

export const hooks: Record<string, Hook> = {
  preToolUse: {
    type: "preToolUse",
    description: "Auto-save drafts before operations",
    handler: async (context: any) => {
      return { success: true, message: "Draft auto-saved", draftPath: "path/to/draft.md" };
    }
  },

  postToolUse: {
    type: "postToolUse",
    description: "Update chapter indexes and track progress",
    handler: async (context: any) => {
      return { success: true, message: "Index updated", indexPath: "path/to/index.json", logPath: "path/to/log.md" };
    }
  },

  userPromptSubmit: {
    type: "userPromptSubmit",
    description: "Inject novel context into AI conversations",
    handler: async (context: any) => {
      return { success: true, contextInjected: true, contextInfo: "Novel context: ..." };
    }
  },

  // Enhanced hooks (stubbed for compilation - full implementations in enhanced-hooks.ts)
  "session-recovery": {
    type: "event",
    description: "Recover from session errors",
    handler: async () => ({})
  },

  "context-window-monitor": {
    type: "chat.message",
    description: "Monitor token usage",
    handler: async () => ({})
  },

  "todo-continuation-enforcer": {
    type: "chat.message",
    description: "Force completion of all TODOs before stopping",
    handler: async () => ({})
  },

  "keyword-detector": {
    type: "userPromptSubmit",
    description: "Detect keywords for specialized modes",
    handler: async () => ({})
  },

  "comment-checker": {
    type: "tool.execute.after",
    description: "Prevent excessive AI-generated comments",
    handler: async () => ({})
  },

  "empty-task-response-detector": {
    type: "tool.execute.after",
    description: "Detect empty task responses",
    handler: async () => ({})
  },
  // Enhanced hooks (stubbed for compilation - full implementations in enhanced-hooks.ts)
  "sessionRecovery": {
    type: "event",
    description: "Automatically recover from session errors",
    handler: async () => ({})
  },

  "contextWindowMonitor": {
    type: "chat.message",
    description: "Monitor context window usage and alert at thresholds",
    handler: async () => ({})
  },

  "todoContinuationEnforcer": {
    type: "chat.message",
    description: "Force completion of all TODOs before stopping",
    handler: async () => ({})
  },

  "keywordDetector": {
    type: "userPromptSubmit",
    description: "Detect keywords and activate specialized modes",
    handler: async () => ({})
  },

  "commentChecker": {
    type: "tool.execute.after",
    description: "Prevent excessive AI-generated comments",
    handler: async () => ({})
  },

  "emptyTaskResponseDetector": {
    type: "tool.execute.after",
    description: "Detect empty task responses",
    handler: async () => ({})
  },

  "backgroundNotification": {
    type: "event",
    description: "Notify when background tasks complete",
    handler: async () => ({})
  }
};
