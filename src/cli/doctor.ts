#!/usr/bin/env node

/**
 * Oh-My-Novel Doctor
 * Health checks and diagnostics for the oh-my-novel plugin
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// ============================================
// Health Check Results
// ============================================

interface HealthCheck {
  name: string;
  category: "critical" | "warning" | "info";
  status: "pass" | "fail" | "warn";
  message: string;
  suggestion?: string;
}

interface HealthReport {
  overall: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

// ============================================
// Helper Functions
// ============================================

function log(
  message: string,
  type: "info" | "success" | "error" | "warning" | "header",
) {
  const colors = {
    info: "\x1b[36m", // cyan
    success: "\x1b[32m", // green
    error: "\x1b[31m", // red
    warning: "\x1b[33m", // yellow
    header: "\x1b[35m", // magenta
  };
  const reset = "\x1b[0m";

  if (type === "header") {
    console.log(`\n${colors.header}${message}${reset}\n`);
  } else {
    console.log(`${colors[type]}${message}${reset}`);
  }
}

function getHomeDir(): string {
  return os.homedir();
}

function getConfigPath(): string {
  const homeDir = getHomeDir();
  return path.join(homeDir, ".config", "opencode");
}

function getDiskSpace(path: string): {
  total: number;
  free: number;
  used: number;
} {
  try {
    const stats = fs.statSync(path);
    // Simple check for now - could use more accurate methods on different platforms
    return {
      total: 0,
      free: 0,
      used: 0,
    };
  } catch (error) {
    return { total: 0, free: 0, used: 0 };
  }
}

// ============================================
// Health Checks
// ============================================

async function checkOpenCodeVersion(): Promise<HealthCheck> {
  try {
    const version = execSync("opencode --version", {
      encoding: "utf-8",
    }).trim();
    const requiredVersion = "1.0.150";

    // Simple version comparison
    const installedVersion = version.split(".")[1] || "0.0";
    const requiredVersionParts = requiredVersion.split(".")[1] || "0.150";
    const isSupported = installedVersion >= requiredVersionParts;

    if (isSupported) {
      return {
        name: "OpenCode Version",
        category: "critical",
        status: "pass",
        message: `OpenCode ${version} installed`,
      };
    } else {
      return {
        name: "OpenCode Version",
        category: "critical",
        status: "fail",
        message: `OpenCode ${version} installed, requires >= 1.0.150`,
        suggestion: "Upgrade OpenCode: https://opencode.ai/docs",
      };
    }
  } catch (error) {
    return {
      name: "OpenCode Version",
      category: "critical",
      status: "fail",
      message: "OpenCode not installed",
      suggestion: "Install OpenCode: https://opencode.ai/docs",
    };
  }
}

async function checkDependencies(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  // Check Node.js
  try {
    const nodeVersion = process.version;
    const requiredVersion = "18.0.0";
    const isSupported = nodeVersion >= `v${requiredVersion}`;

    checks.push({
      name: "Node.js",
      category: "critical",
      status: isSupported ? "pass" : "fail",
      message: `Node.js ${nodeVersion} ${isSupported ? "OK" : "too old"}`,
      suggestion: isSupported ? undefined : "Upgrade Node.js to >= 18.0.0",
    });
  } catch (error) {
    checks.push({
      name: "Node.js",
      category: "critical",
      status: "fail",
      message: "Node.js not found",
      suggestion: "Install Node.js: https://nodejs.org/",
    });
  }

  // Check Bun
  try {
    execSync("bun --version", { stdio: "ignore" });
    checks.push({
      name: "Bun",
      category: "warning",
      status: "pass",
      message: "Bun installed",
    });
  } catch (error) {
    checks.push({
      name: "Bun",
      category: "warning",
      status: "warn",
      message: "Bun not installed (recommended for development)",
      suggestion: "Install Bun: https://bun.sh/",
    });
  }

  // Check ripgrep (optional)
  try {
    execSync("rg --version", { stdio: "ignore" });
    checks.push({
      name: "ripgrep",
      category: "warning",
      status: "pass",
      message: "ripgrep installed (enables grep tool)",
    });
  } catch (error) {
    checks.push({
      name: "ripgrep",
      category: "warning",
      status: "warn",
      message: "ripgrep not installed (limits grep functionality)",
      suggestion: "Install ripgrep: https://github.com/BurntSushi/ripgrep",
    });
  }

  // Check git (optional)
  try {
    execSync("git --version", { stdio: "ignore" });
    checks.push({
      name: "Git",
      category: "warning",
      status: "pass",
      message: "Git installed",
    });
  } catch (error) {
    checks.push({
      name: "Git",
      category: "warning",
      status: "warn",
      message: "Git not installed (recommended for version control)",
      suggestion: "Install Git: https://git-scm.com/",
    });
  }

  return checks;
}

async function checkPluginRegistration(): Promise<HealthCheck> {
  try {
    const configPath = getConfigPath();
    const configFile = path.join(configPath, "opencode.json");

    if (!fs.existsSync(configFile)) {
      return {
        name: "Plugin Registration",
        category: "critical",
        status: "fail",
        message: "opencode.json not found",
        suggestion: "Run installation: bunx oh-my-novel install",
      };
    }

    const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));

    if (!config.plugins || !Array.isArray(config.plugins)) {
      return {
        name: "Plugin Registration",
        category: "critical",
        status: "fail",
        message: "plugins array not found in opencode.json",
        suggestion: "Add oh-my-novel to plugins array in opencode.json",
      };
    }

    if (config.plugins.includes("oh-my-novel")) {
      return {
        name: "Plugin Registration",
        category: "critical",
        status: "pass",
        message: "oh-my-novel registered in opencode.json",
      };
    } else {
      return {
        name: "Plugin Registration",
        category: "critical",
        status: "fail",
        message: "oh-my-novel not in plugins array",
        suggestion: "Add 'oh-my-novel' to plugins array in opencode.json",
      };
    }
  } catch (error) {
    return {
      name: "Plugin Registration",
      category: "critical",
      status: "fail",
      message: `Failed to check plugin registration: ${(error as Error).message}`,
      suggestion: "Verify opencode.json format",
    };
  }
}

async function checkNovelConfig(): Promise<HealthCheck> {
  try {
    const configPath = getConfigPath();
    const novelConfigFile = path.join(configPath, "oh-my-novel.jsonc");

    if (!fs.existsSync(novelConfigFile)) {
      return {
        name: "Novel Configuration",
        category: "warning",
        status: "warn",
        message: "oh-my-novel.jsonc not found (will use defaults)",
        suggestion: "Run installation: bunx oh-my-novel install",
      };
    }

    const content = fs.readFileSync(novelConfigFile, "utf-8");

    // Check for valid JSONC
    const { parse } = await import("jsonc-parser");
    const parsed = parse(content);

    if (!parsed) {
      return {
        name: "Novel Configuration",
        category: "critical",
        status: "fail",
        message: "oh-my-novel.jsonc contains invalid JSONC",
        suggestion: "Validate JSONC syntax and fix errors",
      };
    }

    // Check for required fields
    if (parsed.novelSettings) {
      return {
        name: "Novel Configuration",
        category: "critical",
        status: "pass",
        message: "oh-my-novel.jsonc valid",
      };
    } else {
      return {
        name: "Novel Configuration",
        category: "warning",
        status: "warn",
        message: "oh-my-novel.jsonc missing novelSettings",
        suggestion: "Add novelSettings object to configuration",
      };
    }
  } catch (error) {
    return {
      name: "Novel Configuration",
      category: "warning",
      status: "warn",
      message: `Failed to check novel config: ${(error as Error).message}`,
    };
  }
}

async function checkDirectories(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  // Check novels directory
  const novelsDir = path.join(process.cwd(), "novels");
  if (fs.existsSync(novelsDir)) {
    const stats = fs.statSync(novelsDir);
    const diskSpace = getDiskSpace(novelsDir);

    checks.push({
      name: "Novels Directory",
      category: "info",
      status: "pass",
      message: `novels/ exists at ${novelsDir}`,
    });
  } else {
    checks.push({
      name: "Novels Directory",
      category: "info",
      status: "pass",
      message: "novels/ directory will be created on first use",
    });
  }

  // Check state directory
  const stateDir = path.join(process.cwd(), ".oh-my-novel-state");
  if (fs.existsSync(stateDir)) {
    const files = fs.readdirSync(stateDir);
    const totalSize = files.reduce((sum, file) => {
      const filePath = path.join(stateDir, file);
      const stats = fs.statSync(filePath);
      return sum + (stats.isFile() ? stats.size : 0);
    }, 0);

    checks.push({
      name: "State Directory",
      category: "info",
      status: "pass",
      message: `${files.length} state files (${(totalSize / 1024).toFixed(2)} KB)`,
    });
  } else {
    checks.push({
      name: "State Directory",
      category: "info",
      status: "pass",
      message: "State directory will be created on first use",
    });
  }

  return checks;
}

async function checkAgentConfigurations(): Promise<HealthCheck> {
  try {
    const configPath = getConfigPath();
    const novelConfigFile = path.join(configPath, "oh-my-novel.jsonc");

    if (!fs.existsSync(novelConfigFile)) {
      return {
        name: "Agent Configurations",
        category: "info",
        status: "pass",
        message: "Using default agent configurations",
      };
    }

    const { parse } = await import("jsonc-parser");
    const config = parse(fs.readFileSync(novelConfigFile, "utf-8"));

    if (config.agents) {
      const configuredAgents = Object.keys(config.agents);
      return {
        name: "Agent Configurations",
        category: "info",
        status: "pass",
        message: `${configuredAgents.length} agents configured: ${configuredAgents.join(", ")}`,
      };
    }

    return {
      name: "Agent Configurations",
      category: "info",
      status: "pass",
      message: "Using default agent configurations",
    };
  } catch (error) {
    return {
      name: "Agent Configurations",
      category: "warning",
      status: "warn",
      message: `Failed to check agent configs: ${(error as Error).message}`,
    };
  }
}

async function checkDiskSpace(): Promise<HealthCheck> {
  const diskSpace = getDiskSpace(process.cwd());
  const freeMB = diskSpace.free / (1024 * 1024);

  if (freeMB < 500) {
    return {
      name: "Disk Space",
      category: "warning",
      status: "warn",
      message: `Low disk space: ~${freeMB.toFixed(0)} MB free`,
      suggestion: "Free up disk space for novel generation",
    };
  } else if (freeMB < 100) {
    return {
      name: "Disk Space",
      category: "critical",
      status: "fail",
      message: `Critical disk space: ~${freeMB.toFixed(0)} MB free`,
      suggestion: "Free up disk space urgently",
    };
  }

  return {
    name: "Disk Space",
    category: "info",
    status: "pass",
    message: `Disk space adequate`,
  };
}

// ============================================
// Report Generation
// ============================================

async function generateReport(): Promise<HealthReport> {
  const checks: HealthCheck[] = [];

  // Critical checks
  const opencodeVersion = await checkOpenCodeVersion();
  checks.push(opencodeVersion);

  const dependencies = await checkDependencies();
  checks.push(...dependencies);

  const pluginRegistration = await checkPluginRegistration();
  checks.push(pluginRegistration);

  const novelConfig = await checkNovelConfig();
  checks.push(novelConfig);

  // Info checks
  const directories = await checkDirectories();
  checks.push(...directories);

  const agentConfigs = await checkAgentConfigurations();
  checks.push(agentConfigs);

  const diskSpace = await checkDiskSpace();
  checks.push(diskSpace);

  // Calculate summary
  const summary = {
    total: checks.length,
    passed: checks.filter((c) => c.status === "pass").length,
    failed: checks.filter((c) => c.status === "fail").length,
    warnings: checks.filter((c) => c.status === "warn").length,
  };

  // Determine overall health
  let overall: "healthy" | "degraded" | "unhealthy";
  if (summary.failed > 0) {
    overall = "unhealthy";
  } else if (summary.warnings > 0) {
    overall = "degraded";
  } else {
    overall = "healthy";
  }

  return {
    overall,
    checks,
    summary,
  };
}

// ============================================
// Display Report
// ============================================

async function displayReport(report: HealthReport) {
  log("Oh-My-Novel Health Check Report", "header");

  // Overall status
  const overallColors = {
    healthy: "success",
    degraded: "warning",
    unhealthy: "error",
  };
  log(
    `Overall Status: ${report.overall.toUpperCase()}`,
    overallColors[report.overall as "healthy" | "degraded" | "unhealthy"],
  );

  log("", "info");
  log("Summary:", "header");
  log(`  Total Checks: ${report.summary.total}`);
  log(`  Passed: ${report.summary.passed}`, "success");
  log(
    `  Failed: ${report.summary.failed}`,
    report.summary.failed > 0 ? "error" : "info",
  );
  log(
    `  Warnings: ${report.summary.warnings}`,
    report.summary.warnings > 0 ? "warning" : "info",
  );

  log("", "info");

  // Detailed checks
  log("Detailed Checks:", "header");

  const categories = {
    critical: "Critical",
    warning: "Warning",
    info: "Info",
  };

  for (const category of ["critical", "warning", "info"]) {
    const categoryChecks = report.checks.filter((c) => c.category === category);

    if (categoryChecks.length === 0) continue;

    log(`\n${categories[category as keyof typeof categories]}:`, "info");

    for (const check of categoryChecks) {
      const statusIcon =
        check.status === "pass" ? "✓" : check.status === "fail" ? "✗" : "⚠";
      const statusColor =
        check.status === "pass"
          ? "success"
          : check.status === "fail"
            ? "error"
            : "warning";

      log(`  ${statusIcon} ${check.name}: ${check.message}`, statusColor);

      if (check.suggestion) {
        log(`    → ${check.suggestion}`, "info");
      }
    }
  }

  log("", "info");

  // Recommendations
  const failedChecks = report.checks.filter(
    (c) => c.status === "fail" || c.status === "warn",
  );
  if (failedChecks.length > 0) {
    log("Recommendations:", "header");
    for (const check of failedChecks) {
      if (check.suggestion) {
        log(`  ${check.suggestion}`, "info");
      }
    }
    log("", "info");
  }

  // Next steps
  log("Next Steps:", "header");
  if (report.overall === "healthy") {
    log("  ✅ All systems operational", "success");
    log("  • Run 'opencode' to start using oh-my-novel", "info");
    log("  • Try: 'Create a fantasy novel about dragons'", "info");
  } else if (report.overall === "degraded") {
    log("  ⚠ Some issues found but oh-my-novel should work", "warning");
    log("  • Review the warnings above", "info");
    log("  • Run 'opencode' to test the plugin", "info");
  } else {
    log("  ✗ Critical issues found", "error");
    log("  • Address the failures above", "info");
    log("  • Run 'bunx oh-my-novel install' to reinstall", "info");
  }
}

// ============================================
// Main Entry Point
// ============================================

async function main() {
  try {
    const report = await generateReport();
    await displayReport(report);

    // Exit code based on health
    process.exit(report.overall === "healthy" ? 0 : 1);
  } catch (error) {
    log(`Doctor failed: ${(error as Error).message}`, "error");
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] && process.argv[1].endsWith("doctor.js")) {
  main();
}

export { main, generateReport, displayReport };
