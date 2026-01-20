/**
 * Oh-My-Novel CLI Installer
 * Aligned with oh-my-opencode installation standards
 */

import * as p from "@clack/prompts";
import color from "picocolors";
import type {
  InstallArgs,
  InstallConfig,
  ClaudeSubscription,
  BooleanArg,
  DetectedConfig,
} from "./types";
import {
  addPluginToOpenCodeConfig,
  writeOmoConfig,
  isOpenCodeInstalled,
  getOpenCodeVersion,
  addAuthPlugins,
  addProviderConfig,
  detectCurrentConfig,
} from "./config-manager";
import packageJson from "../../package.json";

const VERSION = packageJson.version;

const SYMBOLS = {
  check: color.green("✓"),
  cross: color.red("✗"),
  arrow: color.cyan("→"),
  bullet: color.dim("•"),
  info: color.blue("ℹ"),
  warn: color.yellow("⚠"),
  star: color.yellow("★"),
};

function formatProvider(
  name: string,
  enabled: boolean,
  detail?: string,
): string {
  const status = enabled ? SYMBOLS.check : color.dim("○");
  const label = enabled ? color.white(name) : color.dim(name);
  const suffix = detail ? color.dim(` (${detail})`) : "";
  return `  ${status} ${label}${suffix}`;
}

function formatConfigSummary(config: InstallConfig): string {
  const lines: string[] = [];

  lines.push(color.bold(color.white("Configuration Summary")));
  lines.push("");

  const claudeDetail = config.hasClaude
    ? config.isMax20
      ? "max20"
      : "standard"
    : undefined;
  lines.push(formatProvider("Claude", config.hasClaude, claudeDetail));
  lines.push(formatProvider("ChatGPT", config.hasChatGPT));
  lines.push(formatProvider("Gemini", config.hasGemini));
  lines.push(
    formatProvider("GitHub Copilot", config.hasCopilot, "fallback provider"),
  );

  lines.push("");
  lines.push(color.dim("─".repeat(40)));
  lines.push("");

  lines.push(color.bold(color.white("Agent Configuration")));
  lines.push("");

  const novelistModel = config.hasClaude
    ? "claude-opus-4-5"
    : config.hasCopilot
      ? "github-copilot/claude-opus-4.5"
      : "glm-4.7-free";
  const plotModel = config.hasChatGPT
    ? "gpt-5.2"
    : config.hasCopilot
      ? "github-copilot/gpt-5.2"
      : config.hasClaude
        ? "claude-opus-4-5"
        : "glm-4.7-free";
  const editorModel = config.hasGemini
    ? "gemini-3-pro-preview"
    : config.hasClaude
      ? "claude-opus-4-5"
      : "glm-4.7-free";

  lines.push(
    `  ${SYMBOLS.bullet} Novelist     ${SYMBOLS.arrow} ${color.cyan(novelistModel)}`,
  );
  lines.push(
    `  ${SYMBOLS.bullet} Plot Designer ${SYMBOLS.arrow} ${color.cyan(plotModel)}`,
  );
  lines.push(
    `  ${SYMBOLS.bullet} Editor        ${SYMBOLS.arrow} ${color.cyan(editorModel)}`,
  );

  return lines.join("\n");
}

function printHeader(isUpdate: boolean): void {
  const mode = isUpdate ? "Update" : "Install";
  console.log();
  console.log(color.bgMagenta(color.white(` 📚 Oh-My-Novel ${mode} `)));
  console.log();
}

function printStep(step: number, total: number, message: string): void {
  const progress = color.dim(`[${step}/${total}]`);
  console.log(`${progress} ${message}`);
}

function printSuccess(message: string): void {
  console.log(`${SYMBOLS.check} ${message}`);
}

function printError(message: string): void {
  console.log(`${SYMBOLS.cross} ${color.red(message)}`);
}

function printInfo(message: string): void {
  console.log(`${SYMBOLS.info} ${message}`);
}

function printWarning(message: string): void {
  console.log(`${SYMBOLS.warn} ${color.yellow(message)}`);
}

function printBox(content: string, title?: string): void {
  const lines = content.split("\n");
  const maxWidth = Math.max(
    ...lines.map((l) => l.replace(/\x1b\[[0-9;]*m/g, "").length),
    title?.length ?? 0,
  ) + 4;
  const border = color.dim("─".repeat(maxWidth));

  console.log();
  if (title) {
    console.log(
      color.dim("┌─") +
        color.bold(` ${title} `) +
        color.dim("─".repeat(maxWidth - title.length - 4)) +
        color.dim("┐"),
    );
  } else {
    console.log(color.dim("┌") + border + color.dim("┐"));
  }

  for (const line of lines) {
    const stripped = line.replace(/\x1b\[[0-9;]*m/g, "");
    const padding = maxWidth - stripped.length;
    console.log(
      color.dim("│") + ` ${line}${" ".repeat(padding - 1)}` + color.dim("│"),
    );
  }

  console.log(color.dim("└") + border + color.dim("┘"));
  console.log();
}

function validateNonTuiArgs(args: InstallArgs): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (args.claude === undefined) {
    errors.push("--claude is required (values: no, yes, max20)");
  } else if (!["no", "yes", "max20"].includes(args.claude)) {
    errors.push(
      `Invalid --claude value: ${args.claude} (expected: no, yes, max20)`,
    );
  }

  if (args.chatgpt === undefined) {
    errors.push("--chatgpt is required (values: no, yes)");
  } else if (!["no", "yes"].includes(args.chatgpt)) {
    errors.push(
      `Invalid --chatgpt value: ${args.chatgpt} (expected: no, yes)`,
    );
  }

  if (args.gemini === undefined) {
    errors.push("--gemini is required (values: no, yes)");
  } else if (!["no", "yes"].includes(args.gemini)) {
    errors.push(`Invalid --gemini value: ${args.gemini} (expected: no, yes)`);
  }

  if (args.copilot === undefined) {
    errors.push("--copilot is required (values: no, yes)");
  } else if (!["no", "yes"].includes(args.copilot)) {
    errors.push(`Invalid --copilot value: ${args.copilot} (expected: no, yes)`);
  }

  return { valid: errors.length === 0, errors };
}

function argsToConfig(args: InstallArgs): InstallConfig {
  return {
    hasClaude: args.claude !== "no",
    isMax20: args.claude === "max20",
    hasChatGPT: args.chatgpt === "yes",
    hasGemini: args.gemini === "yes",
    hasCopilot: args.copilot === "yes",
  };
}

function detectedToInitialValues(detected: DetectedConfig): {
  claude: ClaudeSubscription;
  chatgpt: BooleanArg;
  gemini: BooleanArg;
  copilot: BooleanArg;
} {
  let claude: ClaudeSubscription = "no";
  if (detected.hasClaude) {
    claude = detected.isMax20 ? "max20" : "yes";
  }

  return {
    claude,
    chatgpt: detected.hasChatGPT ? "yes" : "no",
    gemini: detected.hasGemini ? "yes" : "no",
    copilot: detected.hasCopilot ? "yes" : "no",
  };
}

async function runTuiMode(
  detected: DetectedConfig,
): Promise<InstallConfig | null> {
  const initial = detectedToInitialValues(detected);

  const claude = await p.select({
    message: "Do you have a Claude Pro/Max subscription?",
    options: [
      {
        value: "no" as const,
        label: "No",
        hint: "Will use opencode/glm-4.7-free as fallback",
      },
      {
        value: "yes" as const,
        label: "Yes (standard)",
        hint: "Claude Opus 4.5 for novelist",
      },
      {
        value: "max20" as const,
        label: "Yes (max20 mode)",
        hint: "Full power with extended thinking",
      },
    ],
    initialValue: initial.claude,
  });

  if (p.isCancel(claude)) {
    p.cancel("Installation cancelled.");
    return null;
  }

  const chatgpt = await p.select({
    message: "Do you have a ChatGPT Plus/Pro subscription?",
    options: [
      {
        value: "no" as const,
        label: "No",
        hint: "Plot/character agents will use fallback model",
      },
      {
        value: "yes" as const,
        label: "Yes",
        hint: "GPT-5.2 for plot and character development",
      },
    ],
    initialValue: initial.chatgpt,
  });

  if (p.isCancel(chatgpt)) {
    p.cancel("Installation cancelled.");
    return null;
  }

  const gemini = await p.select({
    message: "Will you integrate Google Gemini?",
    options: [
      {
        value: "no" as const,
        label: "No",
        hint: "Editor agent will use fallback",
      },
      {
        value: "yes" as const,
        label: "Yes",
        hint: "Beautiful prose editing with Gemini 3 Pro",
      },
    ],
    initialValue: initial.gemini,
  });

  if (p.isCancel(gemini)) {
    p.cancel("Installation cancelled.");
    return null;
  }

  const copilot = await p.select({
    message: "Do you have a GitHub Copilot subscription?",
    options: [
      {
        value: "no" as const,
        label: "No",
        hint: "Only native providers will be used",
      },
      {
        value: "yes" as const,
        label: "Yes",
        hint: "Fallback option when native providers unavailable",
      },
    ],
    initialValue: initial.copilot,
  });

  if (p.isCancel(copilot)) {
    p.cancel("Installation cancelled.");
    return null;
  }

  return {
    hasClaude: claude !== "no",
    isMax20: claude === "max20",
    hasChatGPT: chatgpt === "yes",
    hasGemini: gemini === "yes",
    hasCopilot: copilot === "yes",
  };
}

async function runNonTuiInstall(args: InstallArgs): Promise<number> {
  const validation = validateNonTuiArgs(args);
  if (!validation.valid) {
    printHeader(false);
    printError("Validation failed:");
    for (const err of validation.errors) {
      console.log(`  ${SYMBOLS.bullet} ${err}`);
    }
    console.log();
    printInfo(
      "Usage: bunx oh-my-novel install --no-tui --claude=<no|yes|max20> --chatgpt=<no|yes> --gemini=<no|yes> --copilot=<no|yes>",
    );
    console.log();
    return 1;
  }

  const detected = detectCurrentConfig();
  const isUpdate = detected.isInstalled;

  printHeader(isUpdate);

  const totalSteps = 6;
  let step = 1;

  printStep(step++, totalSteps, "Checking OpenCode installation...");
  const installed = await isOpenCodeInstalled();
  if (!installed) {
    printError("OpenCode is not installed on this system.");
    printInfo("Visit https://opencode.ai/docs for installation instructions");
    return 1;
  }

  const version = await getOpenCodeVersion();
  printSuccess(`OpenCode ${version ?? ""} detected`);

  if (isUpdate) {
    const initial = detectedToInitialValues(detected);
    printInfo(
      `Current config: Claude=${initial.claude}, ChatGPT=${initial.chatgpt}, Gemini=${initial.gemini}`,
    );
  }

  const config = argsToConfig(args);

  printStep(step++, totalSteps, "Adding oh-my-novel plugin...");
  const pluginResult = await addPluginToOpenCodeConfig(VERSION);
  if (!pluginResult.success) {
    printError(`Failed: ${pluginResult.error}`);
    return 1;
  }
  printSuccess(
    `Plugin ${isUpdate ? "verified" : "added"} ${SYMBOLS.arrow} ${color.dim(pluginResult.configPath)}`,
  );

  if (config.hasGemini) {
    printStep(step++, totalSteps, "Adding auth plugins...");
    const authResult = await addAuthPlugins(config);
    if (!authResult.success) {
      printError(`Failed: ${authResult.error}`);
      return 1;
    }
    printSuccess(
      `Auth plugins configured ${SYMBOLS.arrow} ${color.dim(authResult.configPath)}`,
    );

    printStep(step++, totalSteps, "Adding provider configurations...");
    const providerResult = addProviderConfig(config);
    if (!providerResult.success) {
      printError(`Failed: ${providerResult.error}`);
      return 1;
    }
    printSuccess(
      `Provider config added ${SYMBOLS.arrow} ${color.dim(providerResult.configPath)}`,
    );
  } else {
    step += 2; // Skip auth and provider steps
  }

  printStep(step++, totalSteps, "Writing oh-my-novel configuration...");
  const omoResult = writeOmoConfig(config);
  if (!omoResult.success) {
    printError(`Failed: ${omoResult.error}`);
    return 1;
  }
  printSuccess(
    `Config ${isUpdate ? "updated" : "created"} ${SYMBOLS.arrow} ${color.dim(omoResult.configPath)}`,
  );

  console.log();
  printBox(formatConfigSummary(config), "Installation Complete");

  if (!args.skipAuth) {
    printAuthInstructions(config);
  }

  printNextSteps();

  return 0;
}

async function runTuiInstall(): Promise<number> {
  const detected = detectCurrentConfig();
  const isUpdate = detected.isInstalled;

  printHeader(isUpdate);

  p.intro(
    color.bgMagenta(
      color.white(" Welcome to Oh-My-Novel - AI-Powered Novel Generation "),
    ),
  );

  if (isUpdate) {
    const initial = detectedToInitialValues(detected);
    p.note(
      `Current: Claude=${initial.claude}, ChatGPT=${initial.chatgpt}, Gemini=${initial.gemini}`,
      "Existing Configuration Detected",
    );
  }

  const s = p.spinner();

  s.start("Checking OpenCode installation");
  const installed = await isOpenCodeInstalled();
  if (!installed) {
    s.stop("OpenCode not found");
    p.cancel("OpenCode is not installed. Visit https://opencode.ai/docs");
    return 1;
  }

  const version = await getOpenCodeVersion();
  s.stop(`OpenCode ${version ?? ""} detected`);

  const config = await runTuiMode(detected);
  if (!config) {
    return 1;
  }

  s.start("Configuring oh-my-novel");

  const pluginResult = await addPluginToOpenCodeConfig(VERSION);
  if (!pluginResult.success) {
    s.stop("Failed to add plugin");
    p.cancel(`Error: ${pluginResult.error}`);
    return 1;
  }

  if (config.hasGemini) {
    const authResult = await addAuthPlugins(config);
    if (!authResult.success) {
      s.stop("Failed to add auth plugins");
      p.cancel(`Error: ${authResult.error}`);
      return 1;
    }

    const providerResult = addProviderConfig(config);
    if (!providerResult.success) {
      s.stop("Failed to add provider config");
      p.cancel(`Error: ${providerResult.error}`);
      return 1;
    }
  }

  const omoResult = writeOmoConfig(config);
  if (!omoResult.success) {
    s.stop("Failed to write config");
    p.cancel(`Error: ${omoResult.error}`);
    return 1;
  }

  s.stop("Configuration complete");

  console.log();
  printBox(formatConfigSummary(config), "Installation Complete");

  printAuthInstructions(config);
  printNextSteps();

  p.outro(
    color.green("✨ Oh-My-Novel is ready! Start creating amazing stories!"),
  );

  return 0;
}

function printAuthInstructions(config: InstallConfig): void {
  const authSteps: string[] = [];

  if (config.hasClaude) {
    authSteps.push(
      color.bold("Claude:") +
        " Run " +
        color.cyan("opencode auth login") +
        " → Select Anthropic → Claude Pro/Max",
    );
  }

  if (config.hasChatGPT) {
    authSteps.push(
      color.bold("ChatGPT:") +
        " Run " +
        color.cyan("opencode auth login") +
        " → Select OpenAI → ChatGPT Plus/Pro",
    );
  }

  if (config.hasGemini) {
    authSteps.push(
      color.bold("Gemini:") +
        " Run " +
        color.cyan("opencode auth login") +
        " → Select Google → OAuth with Google (Antigravity)",
    );
  }

  if (config.hasCopilot) {
    authSteps.push(
      color.bold("GitHub Copilot:") +
        " Run " +
        color.cyan("opencode auth login") +
        " → Select GitHub → Authenticate via OAuth",
    );
  }

  if (authSteps.length > 0) {
    console.log();
    console.log(color.bold(color.white("Authentication Required")));
    console.log();
    for (const step of authSteps) {
      console.log(`  ${SYMBOLS.arrow} ${step}`);
    }
    console.log();
  }
}

function printNextSteps(): void {
  console.log(color.bold(color.white("Next Steps")));
  console.log();
  console.log(
    `  ${SYMBOLS.bullet} Run ${color.cyan("opencode")} to start using oh-my-novel`,
  );
  console.log(
    `  ${SYMBOLS.bullet} Try: ${color.dim('"Create a fantasy novel about dragons"')}`,
  );
  console.log(
    `  ${SYMBOLS.bullet} See ${color.cyan("README_CN.md")} for usage examples`,
  );
  console.log();
}

export async function install(args: InstallArgs): Promise<number> {
  try {
    if (args.tui) {
      return await runTuiInstall();
    } else {
      return await runNonTuiInstall(args);
    }
  } catch (error) {
    console.error(
      color.red(`Installation failed: ${error instanceof Error ? error.message : String(error)}`),
    );
    return 1;
  }
}
