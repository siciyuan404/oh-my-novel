import { Hook } from "opencode";

/**
 * Session Recovery Hook
 * Automatically recovers from session errors and crashes
 */
export const createSessionRecoveryHook = (): Hook => ({
  event: async (input: any) => {
    const { eventType, data } = input;

    // Detect recoverable errors
    if (eventType === "error") {
      const error = data.error;

      // Missing tool results
      if (error.message?.includes("tool result not found")) {
        console.warn(
          "Session Recovery: Detected missing tool result, attempting recovery...",
        );
        return {
          recoverable: true,
          action: "compact_and_resume",
          message: "Recovering from missing tool result",
        };
      }

      // Empty messages
      if (error.message?.includes("empty message")) {
        console.warn("Session Recovery: Detected empty message, sanitizing...");
        return {
          recoverable: true,
          action: "sanitize_message",
          message: "Sanitizing empty message",
        };
      }

      // Thinking block issues
      if (error.message?.includes("thinking block")) {
        console.warn(
          "Session Recovery: Detected thinking block issue, validating...",
        );
        return {
          recoverable: true,
          action: "validate_thinking",
          message: "Validating thinking block",
        };
      }
    }

    // Session idle/crash detection
    if (eventType === "stop") {
      const lastMessage = data.messages?.[data.messages.length - 1];

      if (!lastMessage || lastMessage.content === "") {
        console.warn(
          "Session Recovery: Detected incomplete session, attempting recovery...",
        );
        return {
          recoverable: true,
          action: "restore_last_state",
          message: "Restoring from last valid state",
        };
      }
    }

    return { recoverable: false };
  },
});

/**
 * Context Window Monitor Hook
 * Monitors token usage and alerts at 70% threshold
 */
export const createContextWindowMonitorHook = (
  threshold: number = 0.7,
): Hook => ({
  "chat.message": async (input: any) => {
    const { messages, context } = input;

    // Get context window info if available
    const contextWindow = context?.contextWindow;
    if (!contextWindow) {
      return {};
    }

    const usage = contextWindow.used / contextWindow.max;
    const usagePercent = Math.round(usage * 100);

    // Alert at threshold
    if (usage >= threshold && usagePercent < threshold + 0.1) {
      console.warn(
        `[Context Window Monitor] ${usagePercent}% of context window used. ` +
          `Remaining: ${contextWindow.max - contextWindow.used} tokens. ` +
          `Take care to not rush - there's still headroom.`,
      );

      return {
        alert: `Context window at ${usagePercent}% usage`,
        remainingTokens: contextWindow.max - contextWindow.used,
      };
    }

    // Critical threshold (90%)
    if (usage >= 0.9) {
      console.error(
        `[Context Window Monitor] CRITICAL: ${usagePercent}% of context window used. ` +
          `Consider compacting the session.`,
      );

      return {
        alert: `CRITICAL: ${usagePercent}% context window usage`,
        action: "consider_compaction",
      };
    }

    return {};
  },
});

/**
 * Todo Continuation Enforcer Hook
 * Forces agents to complete all TODOs before stopping
 */
export const createTodoContinuationEnforcerHook = (): Hook => ({
  "chat.message": async (input: any) => {
    const { message, todos } = input;

    // Check if agent is trying to stop with incomplete todos
    const isStopAttempt =
      message.content?.toLowerCase().includes("done") ||
      message.content?.toLowerCase().includes("complete") ||
      (message.role === "assistant" && !message.content);

    if (isStopAttempt && todos && todos.length > 0) {
      const incompleteTodos = todos.filter(
        (t: any) => t.status !== "completed",
      );

      if (incompleteTodos.length > 0) {
        console.warn(
          `[Todo Continuation Enforcer] Agent attempting to stop with ${incompleteTodos.length} incomplete todos.`,
        );

        return {
          forceContinue: true,
          message: `You have ${incompleteTodos.length} incomplete todos. Please complete them first:`,
          todos: incompleteTodos,
        };
      }
    }

    return {};
  },
});

/**
 * Keyword Detector Hook
 * Detects keywords and activates specialized modes
 */
export const createKeywordDetectorHook = (): Hook => ({
  userPromptSubmit: async (input: any) => {
    const { prompt } = input;
    const lowerPrompt = prompt.toLowerCase();

    const modes: Record<string, string[]> = {
      "long-run": ["long-run", "lgr", "longrunning", "long-running"],
      edit: ["edit", "revise", "rewrite", "modify"],
      plot: ["plot", "outline", "storyline", "structure"],
      character: ["character", "char", "protagonist", "villain"],
      world: ["world", "setting", "environment", "lore"],
      generate: ["generate", "write", "create", "draft"],
    };

    for (const [mode, keywords] of Object.entries(modes)) {
      if (keywords.some((kw) => lowerPrompt.includes(kw))) {
        console.log(`[Keyword Detector] Activating mode: ${mode}`);
        return {
          mode,
          detected: true,
          keyword: keywords.find((kw) => lowerPrompt.includes(kw)),
        };
      }
    }

    return { detected: false };
  },
});

/**
 * Comment Checker Hook
 * Prevents AI from adding excessive comments
 */
export const createCommentCheckerHook = (): Hook => ({
  "tool.execute.after": async (input: any) => {
    const { toolName, result } = input;

    // Only check for write/edit tools
    if (!["write", "edit", "chapter_write"].includes(toolName)) {
      return {};
    }

    if (!result.content) {
      return {};
    }

    // Count comment lines
    const lines = result.content.split("\n");
    const commentLines = lines.filter(
      (line: string) =>
        line.trim().startsWith("//") ||
        line.trim().startsWith("#") ||
        line.trim().startsWith("/*"),
    );

    const commentRatio = commentLines.length / lines.length;

    // Alert if comment ratio exceeds 15%
    if (commentRatio > 0.15) {
      const percent = Math.round(commentRatio * 100);
      console.warn(
        `[Comment Checker] ${percent}% of generated code is comments. ` +
          `Consider reducing comments - good code is self-documenting.`,
      );

      return {
        alert: `High comment ratio: ${percent}%`,
        suggestion: "Reduce comments, let code speak for itself",
      };
    }

    return {};
  },
});

/**
 * Empty Task Response Detector Hook
 * Catches when Task tool returns nothing
 */
export const createEmptyTaskResponseDetectorHook = (): Hook => ({
  "tool.execute.after": async (input: any) => {
    const { toolName, result } = input;

    if (toolName !== "task" && toolName !== "call_omo_agent") {
      return {};
    }

    if (!result || result === "" || result === null) {
      console.error(
        `[Empty Task Response Detector] Task tool returned empty response. ` +
          `Agent may have failed or timed out.`,
      );

      return {
        alert: "Empty task response detected",
        suggestion: "Agent may have failed, please check status",
      };
    }

    return {};
  },
});

/**
 * Background Notification Hook
 * Notifies when background agent tasks complete
 */
export const createBackgroundNotificationHook = (): Hook => ({
  event: async (input: any) => {
    const { eventType, data } = input;

    if (eventType === "background_task_complete") {
      const { taskId, agent, result } = data;

      console.log(
        `[Background Notification] Task ${taskId} completed by ${agent}`,
      );

      // Send OS notification if available
      if (typeof global !== "undefined" && global.Notification) {
        // Stub for Notification - not available in all environments
        // @ts-ignore - Notification API is optional
        if (typeof Notification !== "undefined") {
          new Notification(`Novel Generation Complete`, {
            body: `Agent ${agent} finished task ${taskId}`,
            icon: "📚",
          });
        }
      }

      return {
        notification: "Task completed",
        taskId,
        agent,
      };
    }

    return {};
  },
});
