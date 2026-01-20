/**
 * Type definitions for oh-my-novel CLI
 */

export type ClaudeSubscription = "no" | "yes" | "max20";
export type BooleanArg = "no" | "yes";

export interface InstallArgs {
  tui: boolean;
  claude?: ClaudeSubscription;
  chatgpt?: BooleanArg;
  gemini?: BooleanArg;
  copilot?: BooleanArg;
  skipAuth?: boolean;
}

export interface InstallConfig {
  hasClaude: boolean;
  isMax20: boolean;
  hasChatGPT: boolean;
  hasGemini: boolean;
  hasCopilot: boolean;
}

export interface DetectedConfig extends InstallConfig {
  isInstalled: boolean;
}
