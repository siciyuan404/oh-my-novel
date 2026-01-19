#!/usr/bin/env node

/**
 * Oh-My-Novel CLI Installer
 * Interactive installation and configuration wizard
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const program = new Command();

// ============================================
// Helper Functions
// ============================================

function log(message: string, type: "info" | "success" | "error" | "warning" = "info") {
  const colors = {
    info: "\x1b[36m",     // cyan
    success: "\x1b[32m",  // green
    error: "\x1b[31m",    // red
    warning: "\x1b[33m"   // yellow
  };
  const reset = "\x1b[0m";
  console.log(`${colors[type]}${message}${reset}`);
}

function question(prompt: string, defaultValue?: string): Promise<string> {
  return new Promise((resolve) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const fullPrompt = defaultValue
      ? `${prompt} [${defaultValue}]: `
      : `${prompt}: `;

    readline.question(fullPrompt, (answer: string) => {
      readline.close();
      resolve(answer || defaultValue || "");
    });
  });
}

function confirm(prompt: string): Promise<boolean> {
  return new Promise((resolve) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question(`${prompt} [y/N]: `, (answer: string) => {
      readline.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

function getHomeDir(): string {
  return os.homedir();
}

function getConfigPath(): string {
  const homeDir = getHomeDir();
  return path.join(homeDir, ".config", "opencode");
}

// ============================================
// Installation Checks
// ============================================

async function checkOpencodeInstalled(): Promise<boolean> {
  try {
    const { execSync } = await import("child_process");
    execSync("opencode --version", { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

async function checkOpencodeVersion(): Promise<{ installed: boolean; version?: string; meetsRequirement: boolean }> {
  try {
    const { execSync } = await import("child_process");
    const version = execSync("opencode --version", { encoding: "utf-8" }).trim();
    const installed = version >= "1.0.150";
    return {
      installed: true,
      version,
      meetsRequirement: installed
    };
  } catch (error) {
    return {
      installed: false,
      meetsRequirement: false
    };
  }
}

async function checkDependencies(): Promise<{ name: string; installed: boolean; required: boolean }[]> {
  const checks = [
    { name: "Node.js", command: "node --version", required: true },
    { name: "Bun", command: "bun --version", required: true },
    { name: "ripgrep", command: "rg --version", required: false },
    { name: "git", command: "git --version", required: false }
  ];

  const results = [];

  for (const check of checks) {
    try {
      const { execSync } = await import("child_process");
      execSync(check.command, { stdio: "ignore" });
      results.push({ ...check, installed: true });
    } catch (error) {
      results.push({ ...check, installed: false });
    }
  }

  return results;
}

// ============================================
// Configuration Setup
// ============================================

async function setupConfigPath(): Promise<string> {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath, { recursive: true });
    log(`Created config directory: ${configPath}`, "success");
  }

  return configPath;
}

async function createOrUpdateConfig(config: any): Promise<boolean> {
  const configPath = getConfigPath();
  const configFile = path.join(configPath, "opencode.json");

  try {
    let existingConfig: any = {};

    if (fs.existsSync(configFile)) {
      existingConfig = JSON.parse(fs.readFileSync(configFile, "utf-8"));
      log(`Found existing opencode.json`, "info");
    }

    // Merge configurations
    const mergedConfig = {
      ...existingConfig,
      ...config
    };

    // Ensure plugins array exists
    if (!mergedConfig.plugins) {
      mergedConfig.plugins = [];
    }

    // Add oh-my-novel if not present
    if (!mergedConfig.plugins.includes("oh-my-novel")) {
      mergedConfig.plugins.push("oh-my-novel");
      log(`Added oh-my-novel to plugins`, "success");
    }

    fs.writeFileSync(configFile, JSON.stringify(mergedConfig, null, 2));
    log(`Updated ${configFile}`, "success");
    return true;
  } catch (error) {
    log(`Failed to create config: ${(error as Error).message}`, "error");
    return false;
  }
}

async function createNovelConfig(): Promise<boolean> {
  const configPath = getConfigPath();
  const novelConfigFile = path.join(configPath, "oh-my-novel.jsonc");

  try {
    const defaultConfig = {
      "$schema": "./oh-my-novel.schema.json",

      // Novel settings
      "novelSettings": {
        "defaultGenre": "fantasy",
        "chapterLength": 3000,
        "autoSave": true
      },

      // Long running settings
      "longRunning": {
        "maxRetries": 3,
        "retryDelay": 5000,
        "checkpointInterval": 1,
        "batchSize": 5,
        "pauseOnError": true,
        "autoResume": false
      },

      // Hooks
      "disabled_hooks": [],

      // Agent overrides (empty by default)
      "agents": {}
    };

    fs.writeFileSync(novelConfigFile, JSON.stringify(defaultConfig, null, 2));
    log(`Created ${novelConfigFile}`, "success");
    return true;
  } catch (error) {
    log(`Failed to create novel config: ${(error as Error).message}`, "error");
    return false;
  }
}

// ============================================
// CLI Commands
// ============================================

program
  .name("oh-my-novel-installer")
  .description("Interactive installer for oh-my-novel plugin")
  .version("1.0.0");

program
  .command("install")
  .description("Interactive installation wizard")
  .option("--no-tui", "Run in non-interactive mode")
  .option("--skip-deps", "Skip dependency checks")
  .action(async (options) => {
    log("🚀 Oh-My-Novel Installation Wizard", "info");
    log("=======================================", "info");
    log("", "info");

    // Check OpenCode installation
    if (!options.skipDeps) {
      log("Checking OpenCode installation...", "info");
      const opencodeCheck = await checkOpencodeVersion();

      if (!opencodeCheck.installed) {
        log("❌ OpenCode is not installed!", "error");
        log("Please install OpenCode first:", "info");
        log("  https://opencode.ai/docs", "info");
        process.exit(1);
      }

      if (!opencodeCheck.meetsRequirement) {
        log(`❌ OpenCode version ${opencodeCheck.version} is too old!`, "error");
        log("Please upgrade to version 1.0.150 or higher", "info");
        process.exit(1);
      }

      log(`✓ OpenCode ${opencodeCheck.version} installed`, "success");
      log("", "info");
    }

    // Check dependencies
    if (!options.skipDeps) {
      log("Checking dependencies...", "info");
      const depChecks = await checkDependencies();

      let criticalMissing = false;

      for (const dep of depChecks) {
        if (dep.required && !dep.installed) {
          log(`✗ ${dep.name} not installed (required)`, "error");
          criticalMissing = true;
        } else if (dep.installed) {
          log(`✓ ${dep.name} installed`, "success");
        } else {
          log(`⚠ ${dep.name} not installed (optional)`, "warning");
        }
      }

      log("", "info");

      if (criticalMissing) {
        log("Critical dependencies missing. Aborting installation.", "error");
        process.exit(1);
      }
    }

    // Interactive configuration
    if (!options.noTui) {
      log("Configuration", "info");
      log("=======================================", "info");
      log("", "info");

      const genre = await question("Default novel genre", "fantasy");
      const chapterLength = await question("Default chapter length (words)", "3000");
      const autoSave = await confirm("Enable auto-save?");

      log("", "info");

      log("Setting up configuration files...", "info");
      await setupConfigPath();

      // Create opencode.json
      await createOrUpdateConfig({
        // User preferences could be added here
      });

      // Create oh-my-novel.jsonc
      const novelConfigCreated = await createNovelConfig();

      if (novelConfigCreated) {
        log("Novel configuration created successfully!", "success");
        log("", "info");
        log("You can customize the configuration in:", "info");
        log(`  ~/.config/opencode/oh-my-novel.jsonc`, "info");
        log("", "info");
        log("For project-specific configuration, create:", "info");
        log(`  .opencode/oh-my-novel.jsonc`, "info");
      }

      log("", "info");
      log("✅ Installation complete!", "success");
      log("", "info");
      log("Next steps:", "info");
      log("  1. Run 'opencode' to start using oh-my-novel", "info");
      log("  2. Try: 'Create a fantasy novel about dragons'", "info");
      log("  3. See README.md for usage examples", "info");
    } else {
      // Non-interactive mode
      log("Running in non-interactive mode...", "info");
      await setupConfigPath();
      await createOrUpdateConfig({});
      await createNovelConfig();
      log("✅ Installation complete (using defaults)!", "success");
    }
  });

program
  .command("doctor")
  .description("Run health checks")
  .action(async () => {
    log("🏥 Oh-My-Novel Health Check", "info");
    log("=======================================", "info");
    log("", "info");

    const issues: string[] = [];

    // Check OpenCode
    log("Checking OpenCode...", "info");
    const opencodeCheck = await checkOpencodeVersion();

    if (!opencodeCheck.installed) {
      issues.push("OpenCode not installed");
      log("✗ OpenCode not found", "error");
    } else if (!opencodeCheck.meetsRequirement) {
      issues.push(`OpenCode version ${opencodeCheck.version} too old (requires >= 1.0.150)`);
      log(`✗ OpenCode ${opencodeCheck.version} too old`, "error");
    } else {
      log(`✓ OpenCode ${opencodeCheck.version} OK`, "success");
    }

    log("", "info");

    // Check dependencies
    log("Checking dependencies...", "info");
    const depChecks = await checkDependencies();

    for (const dep of depChecks) {
      if (dep.required && !dep.installed) {
        issues.push(`${dep.name} not installed`);
        log(`✗ ${dep.name} missing`, "error");
      } else if (dep.installed) {
        log(`✓ ${dep.name} OK`, "success");
      } else if (!dep.installed) {
        log(`⚠ ${dep.name} optional but not found`, "warning");
      }
    }

    log("", "info");

    // Check configuration
    log("Checking configuration...", "info");
    const configPath = getConfigPath();
    const configFile = path.join(configPath, "opencode.json");
    const novelConfigFile = path.join(configPath, "oh-my-novel.jsonc");

    if (!fs.existsSync(configFile)) {
      issues.push("opencode.json not found");
      log("✗ opencode.json not found", "error");
    } else {
      log("✓ opencode.json found", "success");

      try {
        const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));

        if (!config.plugins || !config.plugins.includes("oh-my-novel")) {
          issues.push("oh-my-novel not registered in plugins");
          log("✗ oh-my-novel not in plugins array", "warning");
        } else {
          log("✓ oh-my-novel registered", "success");
        }
      } catch (error) {
        issues.push("opencode.json invalid JSON");
        log("✗ opencode.json invalid", "error");
      }
    }

    if (!fs.existsSync(novelConfigFile)) {
      issues.push("oh-my-novel.jsonc not found");
      log("✗ oh-my-novel.jsonc not found", "warning");
    } else {
      log("✓ oh-my-novel.jsonc found", "success");
    }

    log("", "info");

    // Summary
    if (issues.length > 0) {
      log("⚠ Issues found:", "warning");
      for (const issue of issues) {
        log(`  - ${issue}`, "warning");
      }
      process.exit(1);
    } else {
      log("✅ All checks passed!", "success");
      log("", "info");
      log("Oh-My-Novel is ready to use!", "success");
    }
  });

program
  .command("uninstall")
  .description("Uninstall oh-my-novel")
  .option("--purge", "Remove all configuration files")
  .action(async (options) => {
    log("🗑️ Oh-My-Novel Uninstaller", "info");
    log("=======================================", "info");
    log("", "info");

    const configPath = getConfigPath();
    const configFile = path.join(configPath, "opencode.json");
    const novelConfigFile = path.join(configPath, "oh-my-novel.jsonc");

    // Remove plugin registration
    if (fs.existsSync(configFile)) {
      try {
        const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));

        if (config.plugins && Array.isArray(config.plugins)) {
          const index = config.plugins.indexOf("oh-my-novel");
          if (index !== -1) {
            config.plugins.splice(index, 1);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            log(`Removed oh-my-novel from opencode.json`, "success");
          } else {
            log("oh-my-novel not found in plugins array", "warning");
          }
        }
      } catch (error) {
        log(`Failed to update opencode.json: ${(error as Error).message}`, "error");
      }
    }

    // Remove novel config
    if (fs.existsSync(novelConfigFile)) {
      if (options.purge || await confirm("Remove oh-my-novel.jsonc?")) {
        fs.unlinkSync(novelConfigFile);
        log(`Removed ${novelConfigFile}`, "success");
      }
    }

    if (options.purge) {
      log("Removing all configuration files...", "info");
      // Could remove entire config directory if oh-my-novel was the only plugin
    }

    log("", "info");
    log("✅ Uninstallation complete!", "success");
    log("", "info");
    log("Note: Session data and novel files remain intact.", "info");
    log("      Remove manually if desired.", "info");
  });

// ============================================
// Error Handling
// ============================================

program.on("command:*", (operands) => {
  log(`Unknown command: ${operands[0]}`, "error");
  log("Run 'oh-my-novel-installer --help' for usage", "info");
  process.exit(1);
});

program.on("error", (error) => {
  log(`Error: ${(error as Error).message}`, "error");
  process.exit(1);
});

// ============================================
// Parse and Execute
// ============================================

program.parse(process.argv);
