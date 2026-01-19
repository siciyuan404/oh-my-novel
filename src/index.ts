import { Plugin } from "opencode";
import { agents } from "./agents/index.js";
import { tools } from "./tools/index.js";
import { hooks } from "./hooks/index.js";
import { skills } from "./skills/index.js";
import { config } from "./config/default.js";

// 导入长时间运行支持
import * as longRunningTools from "./tools/long-running.js";
import { hooks as longRunningHooks } from "./hooks/long-running-hooks.js";
import { skills as longRunningSkills } from "./skills/long-running-skill.js";

// 合并所有工具
const allTools = {
  ...tools,
  ...longRunningTools
};

// 合并所有 hooks
const allHooks = {
  ...hooks,
  ...longRunningHooks
};

// 合并所有 skills
const allSkills = {
  ...skills,
  ...longRunningSkills
};

const plugin: Plugin = {
  id: config.pluginId,
  name: config.pluginName,
  version: config.version,
  description: config.description + " (with long-running support)",

  agents,
  tools: allTools,
  hooks: allHooks,
  skills: allSkills,

  config
};

export default plugin;

// Export all types for user consumption
export * from "./types/index.js";
