import * as fs from "fs";
import * as path from "path";
import { parse } from "jsonc-parser";
import { OhMyNovelConfig, safeParseConfig, defaultConfig } from "./schema.js";

/**
 * Configuration Manager for oh-my-novel
 * Supports:
 * - JSONC (JSON with comments)
 * - Multi-level configuration (project > user > default)
 * - Runtime validation with Zod
 */
export class ConfigManager {
  private configCache: Map<string, OhMyNovelConfig> = new Map();

  /**
   * Get configuration path priority:
   * 1. .opencode/oh-my-novel.jsonc (project, JSONC)
   * 2. .opencode/oh-my-novel.json (project, JSON)
   * 3. ~/.config/opencode/oh-my-novel.jsonc (user, JSONC)
   * 4. ~/.config/opencode/oh-my-novel.json (user, JSON)
   */
  getConfigPaths(): string[] {
    const paths: string[] = [];

    // Project-level config
    paths.push(path.join(process.cwd(), ".opencode", "oh-my-novel.jsonc"));
    paths.push(path.join(process.cwd(), ".opencode", "oh-my-novel.json"));

    // User-level config
    const homeDir = this.getHomeDir();
    paths.push(path.join(homeDir, ".config", "opencode", "oh-my-novel.jsonc"));
    paths.push(path.join(homeDir, ".config", "opencode", "oh-my-novel.json"));

    return paths;
  }

  /**
   * Get home directory across platforms
   */
  private getHomeDir(): string {
    return process.env.HOME || process.env.USERPROFILE || "";
  }

  /**
   * Load configuration from file with JSONC support
   */
  loadConfigFromFile(filePath: string): OhMyNovelConfig | null {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = parse(content);
      const result = safeParseConfig(parsed);

      if (!result.success) {
        console.error(`Configuration error in ${filePath}:`);
        console.error(result.error?.errors || result.error?.issues);
        return null;
      }

      return result.data || null;
    } catch (error) {
      console.error(`Error loading config from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Load configuration from all paths with priority
   */
  loadConfig(): OhMyNovelConfig {
    const paths = this.getConfigPaths();
    let finalConfig: OhMyNovelConfig = { ...defaultConfig };

    for (const configPath of paths) {
      const config = this.loadConfigFromFile(configPath);
      if (config) {
        // Merge configs with project-level taking precedence
        finalConfig = this.mergeConfigs(finalConfig, config);
        console.log(`Loaded configuration from: ${configPath}`);
      }
    }

    return finalConfig;
  }

  /**
   * Merge two configuration objects deeply
   */
  private mergeConfigs(
    base: OhMyNovelConfig,
    override: Partial<OhMyNovelConfig>,
  ): OhMyNovelConfig {
    return {
      ...base,
      ...override,
      agents: { ...base.agents, ...override.agents },
      categories: { ...base.categories, ...override.categories },
      novelSettings: { ...base.novelSettings, ...override.novelSettings },
      longRunning: { ...base.longRunning, ...override.longRunning },
      background_task: { ...base.background_task, ...override.background_task },
      experimental: {
        ...base.experimental,
        ...override.experimental,
        dynamic_context_pruning: {
          ...base.experimental?.dynamic_context_pruning,
          ...override.experimental?.dynamic_context_pruning,
        },
      },
    };
  }

  /**
   * Save configuration to file
   */
  saveConfig(config: OhMyNovelConfig, filePath: string): boolean {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const content = JSON.stringify(config, null, 2);
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`Configuration saved to: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Error saving config to ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Validate configuration against schema
   */
  validateConfig(config: unknown): { valid: boolean; errors?: string[] } {
    const result = safeParseConfig(config);
    if (result.success) {
      return { valid: true };
    }

    const errors = (result.error?.errors || result.error?.issues || []).map(
      (e) => `${e.path.join(".")}: ${e.message}`,
    );
    return { valid: false, errors };
  }

  /**
   * Get cached configuration or load fresh
   */
  getConfig(cacheKey: string = "default"): OhMyNovelConfig {
    if (!this.configCache.has(cacheKey)) {
      this.configCache.set(cacheKey, this.loadConfig());
    }
    return this.configCache.get(cacheKey)!;
  }

  /**
   * Clear configuration cache
   */
  clearCache(): void {
    this.configCache.clear();
  }

  /**
   * Get agent configuration with fallback to defaults
   */
  getAgentConfig(
    agentName: string,
  ): OhMyNovelConfig["agents"][string] | undefined {
    const config = this.getConfig();
    return config.agents?.[agentName as keyof typeof config.agents];
  }

  /**
   * Check if a hook is disabled
   */
  isHookDisabled(hookName: string): boolean {
    const config = this.getConfig();
    return config.disabled_hooks?.includes(hookName as any) || false;
  }

  /**
   * Check if an agent is disabled
   */
  isAgentDisabled(agentName: string): boolean {
    const config = this.getConfig();
    return config.disabled_agents?.includes(agentName as any) || false;
  }

  /**
   * Get hook configuration
   */
  getHookConfig(hookName: string): any {
    const config = this.getConfig();
    return config.hooks?.[hookName];
  }

  /**
   * Get category configuration
   */
  getCategoryConfig(
    categoryName: string,
  ): OhMyNovelConfig["categories"][string] | undefined {
    const config = this.getConfig();
    return config.categories?.[categoryName];
  }
}

// Singleton instance
export const configManager = new ConfigManager();
