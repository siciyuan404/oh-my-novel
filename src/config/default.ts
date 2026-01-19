export const defaultConfig = {
  pluginId: "oh-my-novel",
  pluginName: "Oh My Novel",
  version: "1.0.0",
  description: "AI-powered novel generation plugin for OpenCode",

  novelSettings: {
    defaultGenre: "fantasy",
    chapterLength: 3000,
    autoSave: true,
    maxDrafts: 10,
  },

  agentDefaults: {
    novelist: {
      model: "anthropic/claude-opus-4-5",
      permission: ["read", "write", "run"],
    },
    "plot-designer": {
      model: "openai/gpt-5.2",
      permission: ["read"],
    },
    "character-developer": {
      model: "openai/gpt-5.2",
      permission: ["read"],
    },
    "world-builder": {
      model: "anthropic/claude-opus-4-5",
      permission: ["read"],
    },
    editor: {
      model: "google/gemini-3-pro-preview",
      permission: ["read", "write"],
    },
  },

  directories: {
    novels: "./novels",
    drafts: "./drafts",
    exports: "./exports",
  },
};

export default defaultConfig;
