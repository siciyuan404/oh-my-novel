#!/usr/bin/env node

/**
 * Oh-My-Novel CLI Entry Point
 * Aligned with oh-my-opencode CLI structure
 */

import { Command } from "commander";
import { install } from "./install";
import type { InstallArgs } from "./types";
import packageJson from "../../package.json";

const VERSION = packageJson.version;

const program = new Command();

program
  .name("oh-my-novel")
  .description(
    "AI-powered novel generation plugin for OpenCode - multi-agent storytelling system",
  )
  .version(VERSION, "-v, --version", "Show version number");

program
  .command("install")
  .description("Install and configure oh-my-novel with interactive setup")
  .option("--no-tui", "Run in non-interactive mode (requires all options)")
  .option("--claude <value>", "Claude subscription: no, yes, max20")
  .option("--chatgpt <value>", "ChatGPT subscription: no, yes")
  .option("--gemini <value>", "Gemini integration: no, yes")
  .option("--copilot <value>", "GitHub Copilot subscription: no, yes")
  .option("--skip-auth", "Skip authentication setup hints")
  .addHelpText(
    "after",
    `
Examples:
  $ bunx oh-my-novel install
  $ bunx oh-my-novel install --no-tui --claude=max20 --chatgpt=yes --gemini=yes --copilot=no
  $ bunx oh-my-novel install --no-tui --claude=no --chatgpt=no --gemini=no --copilot=yes

Model Providers:
  Claude      Powers the Novelist and World Builder agents
  ChatGPT     Powers Plot Designer and Character Developer agents
  Gemini      Powers the Editor agent for beautiful prose
`,
  )
  .action(async (options) => {
    const args: InstallArgs = {
      tui: options.tui !== false,
      claude: options.claude,
      chatgpt: options.chatgpt,
      gemini: options.gemini,
      copilot: options.copilot,
      skipAuth: options.skipAuth ?? false,
    };
    const exitCode = await install(args);
    process.exit(exitCode);
  });

program
  .command("version")
  .description("Show version information")
  .action(() => {
    console.log(`oh-my-novel v${VERSION}`);
  });

program.parse();
