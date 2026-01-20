/**
 * Configuration Manager for oh-my-novel
 * Handles OpenCode config and oh-my-novel config management
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { parse as parseJsonc, modify } from "jsonc-parser";

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

export interface ConfigResult {
  success: boolean;
  error?: string;
  configPath?: string;
}

/**
 * Get OpenCode config directory path
 */
export function getOpenCodeConfigDir(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, ".config", "opencode");
}

/**
 * Get OpenCode config file path
 */
export function getOpenCodeConfigPath(): string {
  const configDir = getOpenCodeConfigDir();
  const jsoncPath = path.join(configDir, "opencode.jsonc");
  const jsonPath = path.join(configDir, "opencode.json");

  // Prefer .jsonc if it exists
  if (fs.existsSync(jsoncPath)) {
    return jsoncPath;
  }
  return jsonPath;
}

/**
 * Get oh-my-novel config file path
 */
export function getOmoConfigPath(): string {
  const configDir = getOpenCodeConfigDir();
  const jsoncPath = path.join(configDir, "oh-my-novel.jsonc");
  const jsonPath = path.join(configDir, "oh-my-novel.json");

  // Prefer .jsonc if it exists
  if (fs.existsSync(jsoncPath)) {
    return jsoncPath;
  }
  return jsoncPath; // Default to .jsonc for new installations
}

/**
 * Check if OpenCode is installed
 */
export async function isOpenCodeInstalled(): Promise<boolean> {
  try {
    const { execSync } = await import("child_process");
    execSync("opencode --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get OpenCode version
 */
export async function getOpenCodeVersion(): Promise<string | null> {
  try {
    const { execSync } = await import("child_process");
    const output = execSync("opencode --version", { encoding: "utf-8" });
    return output.trim();
  } catch {
    return null;
  }
}

/**
 * Detect current configuration
 */
export function detectCurrentConfig(): DetectedConfig {
  const omoConfigPath = getOmoConfigPath();
  const isInstalled = fs.existsSync(omoConfigPath);

  if (!isInstalled) {
    return {
      isInstalled: false,
      hasClaude: false,
      isMax20: false,
      hasChatGPT: false,
      hasGemini: false,
      hasCopilot: false,
    };
  }

  try {
    const content = fs.readFileSync(omoConfigPath, "utf-8");
    const config = parseJsonc(content);

    // Detect from agent models
    const agents = config.agents || {};
    const novelist = agents.novelist || {};
    const plotDesigner = agents["plot-designer"] || {};
    const editor = agents.editor || {};

    const hasClaude =
      novelist.model?.includes("claude") ||
      novelist.model?.includes("anthropic");
    const isMax20 = novelist.model?.includes("max20");
    const hasChatGPT =
      plotDesigner.model?.includes("gpt") ||
      plotDesigner.model?.includes("openai");
    const hasGemini =
      editor.model?.includes("gemini") || editor.model?.includes("google");
    const hasCopilot =
      novelist.model?.includes("copilot") ||
      plotDesigner.model?.includes("copilot");

    return {
      isInstalled: true,
      hasClaude,
      isMax20,
      hasChatGPT,
      hasGemini,
      hasCopilot,
    };
  } catch {
    return {
      isInstalled: true,
      hasClaude: false,
      isMax20: false,
      hasChatGPT: false,
      hasGemini: false,
      hasCopilot: false,
    };
  }
}

/**
 * Add oh-my-novel plugin to OpenCode config
 */
export async function addPluginToOpenCodeConfig(
  version: string,
): Promise<ConfigResult> {
  try {
    const configDir = getOpenCodeConfigDir();

    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = getOpenCodeConfigPath();
    let content = "{}";

    if (fs.existsSync(configPath)) {
      content = fs.readFileSync(configPath, "utf-8");
    }

    const config = parseJsonc(content);
    const plugins = config.plugin || [];

    // Check if oh-my-novel is already in the plugin list
    const pluginEntry = `oh-my-novel`;
    if (!plugins.includes(pluginEntry)) {
      plugins.push(pluginEntry);

      // Modify the content
      const edits = modify(content, ["plugin"], plugins, {
        formattingOptions: { tabSize: 2, insertSpaces: true },
      });

      let newContent = content;
      for (const edit of edits.reverse()) {
        newContent =
          newContent.slice(0, edit.offset) +
          edit.content +
          newContent.slice(edit.offset + edit.length);
      }

      fs.writeFileSync(configPath, newContent, "utf-8");
    }

    return { success: true, configPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Write oh-my-novel configuration
 */
export function writeOmoConfig(config: InstallConfig): ConfigResult {
  try {
    const configPath = getOmoConfigPath();
    const agentModels = determineAgentModels(config);

    const omoConfig = {
      $schema: "./oh-my-novel.schema.json",

      // Novel settings
      novelSettings: {
        defaultGenre: "fantasy",
        chapterLength: 3000,
        autoSave: true,
      },

      // Long running settings
      longRunning: {
        maxRetries: 3,
        retryDelay: 5000,
        checkpointInterval: 1,
        batchSize: 5,
        pauseOnError: true,
        autoResume: false,
      },

      // Hooks
      disabled_hooks: [],

      // Agent overrides based on subscriptions
      agents: agentModels,
    };

    const content = JSON.stringify(omoConfig, null, 2);
    fs.writeFileSync(configPath, content, "utf-8");

    return { success: true, configPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Determine agent models based on subscriptions
 */
function determineAgentModels(config: InstallConfig): Record<string, any> {
  const agentModels: Record<string, any> = {};

  // Novelist agent
  if (config.hasClaude) {
    agentModels.novelist = {
      model: config.isMax20
        ? "anthropic/claude-opus-4-5-max20"
        : "anthropic/claude-opus-4-5",
      temperature: 0.7,
    };
  } else if (config.hasCopilot) {
    agentModels.novelist = {
      model: "github-copilot/claude-opus-4.5",
      temperature: 0.7,
    };
  } else {
    agentModels.novelist = {
      model: "opencode/glm-4.7-free",
      temperature: 0.7,
    };
  }

  // Plot Designer agent
  if (config.hasChatGPT) {
    agentModels["plot-designer"] = {
      model: "openai/gpt-5.2",
      temperature: 0.3,
    };
  } else if (config.hasCopilot) {
    agentModels["plot-designer"] = {
      model: "github-copilot/gpt-5.2",
      temperature: 0.3,
    };
  } else if (config.hasClaude) {
    agentModels["plot-designer"] = {
      model: "anthropic/claude-opus-4-5",
      temperature: 0.3,
    };
  } else {
    agentModels["plot-designer"] = {
      model: "opencode/glm-4.7-free",
      temperature: 0.3,
    };
  }

  // Character Developer agent
  if (config.hasChatGPT) {
    agentModels["character-developer"] = {
      model: "openai/gpt-5.2",
      temperature: 0.4,
    };
  } else if (config.hasCopilot) {
    agentModels["character-developer"] = {
      model: "github-copilot/gpt-5.2",
      temperature: 0.4,
    };
  } else if (config.hasClaude) {
    agentModels["character-developer"] = {
      model: "anthropic/claude-opus-4-5",
      temperature: 0.4,
    };
  } else {
    agentModels["character-developer"] = {
      model: "opencode/glm-4.7-free",
      temperature: 0.4,
    };
  }

  // World Builder agent
  if (config.hasClaude) {
    agentModels["world-builder"] = {
      model: "anthropic/claude-opus-4-5",
      temperature: 0.5,
    };
  } else if (config.hasCopilot) {
    agentModels["world-builder"] = {
      model: "github-copilot/claude-opus-4.5",
      temperature: 0.5,
    };
  } else {
    agentModels["world-builder"] = {
      model: "opencode/glm-4.7-free",
      temperature: 0.5,
    };
  }

  // Editor agent
  if (config.hasGemini) {
    agentModels.editor = {
      model: "google/gemini-3-pro-preview",
      temperature: 0.3,
    };
  } else if (config.hasClaude) {
    agentModels.editor = {
      model: "anthropic/claude-opus-4-5",
      temperature: 0.3,
    };
  } else {
    agentModels.editor = {
      model: "opencode/glm-4.7-free",
      temperature: 0.3,
    };
  }

  return agentModels;
}

/**
 * Add auth plugins for Gemini (antigravity-auth)
 */
export async function addAuthPlugins(
  config: InstallConfig,
): Promise<ConfigResult> {
  if (!config.hasGemini) {
    return { success: true };
  }

  try {
    const configPath = getOpenCodeConfigPath();
    let content = "{}";

    if (fs.existsSync(configPath)) {
      content = fs.readFileSync(configPath, "utf-8");
    }

    const openCodeConfig = parseJsonc(content);
    const plugins = openCodeConfig.plugin || [];

    // Add opencode-antigravity-auth plugin
    const authPlugin = "opencode-antigravity-auth@1.2.8";
    if (!plugins.includes(authPlugin)) {
      plugins.push(authPlugin);

      const edits = modify(content, ["plugin"], plugins, {
        formattingOptions: { tabSize: 2, insertSpaces: true },
      });

      let newContent = content;
      for (const edit of edits.reverse()) {
        newContent =
          newContent.slice(0, edit.offset) +
          edit.content +
          newContent.slice(edit.offset + edit.length);
      }

      fs.writeFileSync(configPath, newContent, "utf-8");
    }

    return { success: true, configPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Add provider configuration for Gemini
 */
export function addProviderConfig(config: InstallConfig): ConfigResult {
  if (!config.hasGemini) {
    return { success: true };
  }

  try {
    const configPath = getOpenCodeConfigPath();
    let content = "{}";

    if (fs.existsSync(configPath)) {
      content = fs.readFileSync(configPath, "utf-8");
    }

    const openCodeConfig = parseJsonc(content);

    // Add provider configuration for antigravity
    if (!openCodeConfig.provider) {
      openCodeConfig.provider = {};
    }

    if (!openCodeConfig.provider["google/antigravity"]) {
      openCodeConfig.provider["google/antigravity"] = {
        type: "google/antigravity",
      };
    }

    // Add model configuration
    if (!openCodeConfig.model) {
      openCodeConfig.model = {};
    }

    const geminiModels = [
      "google/antigravity-gemini-3-pro-high",
      "google/antigravity-gemini-3-flash",
    ];

    for (const model of geminiModels) {
      if (!openCodeConfig.model[model]) {
        openCodeConfig.model[model] = {
          provider: "google/antigravity",
        };
      }
    }

    const newContent = JSON.stringify(openCodeConfig, null, 2);
    fs.writeFileSync(configPath, newContent, "utf-8");

    return { success: true, configPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
