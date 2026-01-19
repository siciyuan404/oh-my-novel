import { Tool } from "opencode";
import { configManager } from "../config/manager.js";
import { OverridableAgentNameSchema, CategoryConfigSchema } from "../config/schema.js";

/**
 * Categories System for oh-my-novel
 * Enables category-based task delegation with preset models and settings
 */

// Default categories for novel writing
export const defaultCategories: Record<string, CategoryConfigSchema> = {
  "plotting": {
    model: "openai/gpt-5.2",
    temperature: 0.3,
    top_p: 0.9,
    prompt_append: "Focus on story structure, pacing, and narrative arcs. Create compelling plot developments.",
    tools: {
      "novel_create": true,
      "plot_outline": true,
      "character_manage": true,
      "read": true
    }
  },

  "character-development": {
    model: "openai/gpt-5.2",
    temperature: 0.4,
    top_p: 0.9,
    prompt_append: "Develop rich, multi-dimensional characters with depth, flaws, and growth arcs.",
    tools: {
      "character_manage": true,
      "search_novel": true,
      "grep": true,
      "read": true
    }
  },

  "world-building": {
    model: "anthropic/claude-opus-4-5",
    temperature: 0.5,
    prompt_append: "Create immersive, detailed worlds with internal consistency and narrative purpose.",
    tools: {
      "world_notes": true,
      "search_novel": true,
      "grep": true,
      "glob": true,
      "read": true
    }
  },

  "writing": {
    model: "anthropic/claude-opus-4-5",
    temperature: 0.7,
    maxTokens: 8000,
    prompt_append: "Write engaging prose that draws readers in. Show, don't tell. Use vivid sensory details and maintain character voice consistency.",
    tools: {
      "chapter_write": true,
      "character_manage": true,
      "plot_outline": true,
      "world_notes": true,
      "search_novel": true,
      "read": true,
      "write": true
    }
  },

  "editing": {
    model: "google/gemini-3-pro-preview",
    temperature: 0.3,
    prompt_append: "Refine prose and ensure quality while respecting the author's voice and style. Improve clarity without changing meaning.",
    tools: {
      "chapter_write": true,
      "read": true,
      "write": true,
      "edit": true
    }
  },

  "research": {
    model: "opencode/glm-4.7-free",
    temperature: 0.2,
    prompt_append: "Search and analyze existing novel content, plot patterns, character relationships, and world-building elements.",
    tools: {
      "search_novel": true,
      "grep": true,
      "glob": true,
      "read": true,
      "session_read": true,
      "session_search": true
    }
  },

  "long-running": {
    model: "anthropic/claude-opus-4-5",
    temperature: 0.6,
    batchSize: 10,
    prompt_append: "Generate chapters consistently with attention to narrative continuity and pacing. Maintain quality across large volumes.",
    tools: {
      "start_long_running_generation": true,
      "check_generation_progress": true,
      "pause_generation": true,
      "resume_generation": true,
      "list_all_generations": true,
      "delete_generation_state": true,
      "export_generation_state": true,
      "novel_create": true,
      "chapter_write": true,
      "read": true,
      "write": true
    }
  },

  "planning": {
    model: "openai/gpt-5.2",
    temperature: 0.1,
    prompt_append: "Strategic planning and analysis. Think deeply before acting. Consider multiple approaches and their implications.",
    tools: {
      "novel_create": true,
      "plot_outline": true,
      "character_manage": true,
      "world_notes": true,
      "search_novel": true,
      "grep": true,
      "glob": true,
      "read": true,
      "session_list": true,
      "session_search": true,
      "session_read": true
    }
  }
};

/**
 * Category Manager
 * Manages category configurations and applies them to agent invocations
 */
class CategoryManager {
  private categories: Record<string, CategoryConfigSchema>;

  constructor(customCategories?: Record<string, CategoryConfigSchema>) {
    this.categories = {
      ...defaultCategories,
      ...customCategories
    };
  }

  /**
   * Get configuration for a specific category
   */
  getCategory(categoryName: string): CategoryConfigSchema | null {
    return this.categories[categoryName] || null;
  }

  /**
   * Apply category settings to agent invocation
   */
  applyCategoryToAgent(
    categoryName: string,
    agentName: OverridableAgentNameSchema
  ): {
    model: string;
    temperature?: number;
    top_p?: number;
    maxTokens?: number;
    tools?: Record<string, boolean>;
    prompt_append?: string;
  } | null {
    const category = this.getCategory(categoryName);
    if (!category) {
      return null;
    }

    return {
      model: category.model,
      temperature: category.temperature,
      top_p: category.top_p,
      maxTokens: category.maxTokens,
      tools: category.tools,
      prompt_append: category.prompt_append
    };
  }

  /**
   * Get all available categories
   */
  listCategories(): string[] {
    return Object.keys(this.categories);
  }

  /**
   * Get category description
   */
  getCategoryDescription(categoryName: string): string {
    const descriptions: Record<string, string> = {
      "plotting": "Story structure, narrative arcs, and plot development",
      "character-development": "Creating rich characters with depth and growth",
      "world-building": "Constructing immersive settings and world lore",
      "writing": "Generating engaging prose and chapter content",
      "editing": "Refining prose and ensuring quality",
      "research": "Searching and analyzing existing novel content",
      "long-running": "Extended chapter generation with consistency",
      "planning": "Strategic planning and analysis"
    };

    return descriptions[categoryName] || "";
  }

  /**
   * Recommend category based on task description
   */
  recommendCategory(taskDescription: string): { category: string; confidence: number }[] {
    const lowerTask = taskDescription.toLowerCase();
    const recommendations: Array<{ category: string; confidence: number }> = [];

    // Keyword matching
    const keywords: Record<string, string[]> = {
      "plotting": ["plot", "story", "arc", "structure", "outline", "plan", "narrative"],
      "character-development": ["character", "protagonist", "villain", "hero", "person", "character", "role", "motivation"],
      "world-building": ["world", "setting", "environment", "culture", "magic", "system", "lore", "geography"],
      "writing": ["write", "chapter", "prose", "story", "scene", "dialogue", "narrative", "draft"],
      "editing": ["edit", "revise", "refine", "fix", "improve", "polish", "correct", "review"],
      "research": ["search", "find", "look", "check", "analyze", "research", "review"],
      "long-running": ["long-run", "batch", "generate", "create", "draft", "extended", "volume"],
      "planning": ["plan", "design", "think", "analyze", "strategy", "approach", "consider"]
    };

    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      const matchCount = categoryKeywords.filter((kw: string) => lowerTask.includes(kw)).length;
      const confidence = matchCount / categoryKeywords.length;

      if (confidence > 0) {
        recommendations.push({ category, confidence });
      }
    }

    // Sort by confidence (highest first)
    recommendations.sort((a, b) => b.confidence - a.confidence);

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  /**
   * Merge user-defined categories with defaults
   */
  mergeCategories(userCategories: Record<string, CategoryConfigSchema>): void {
    this.categories = {
      ...this.categories,
      ...userCategories
    };
  }

  /**
   * Validate category configuration
   */
  validateCategory(categoryName: string, config: CategoryConfigSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.model) {
      errors.push("model is required");
    }

    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
      errors.push("temperature must be between 0 and 2");
    }

    if (config.top_p && (config.top_p < 0 || config.top_p > 1)) {
      errors.push("top_p must be between 0 and 1");
    }

    if (config.maxTokens && config.maxTokens < 1) {
      errors.push("maxTokens must be positive");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Singleton instance
let categoryManager: CategoryManager | null = null;

function getCategoryManager(): CategoryManager {
  if (!categoryManager) {
    // Load user-defined categories from config
    const config = configManager.getConfig();
    categoryManager = new CategoryManager(config.categories);
  }
  return categoryManager;
}

/**
 * List Categories Tool
 * Lists all available categories with descriptions
 */
export const listCategoriesTool: Tool = {
  description: "List all available task categories with their descriptions and configurations",
  parameters: {
    type: "object",
    properties: {
      format: {
        type: "string",
        enum: ["text", "json", "table"],
        description: "Output format (default: table)"
      }
    }
  },
  handler: async (params: any) => {
    try {
      const manager = getCategoryManager();
      const categories = manager.listCategories();

      const format = params.format || "table";

      if (format === "text") {
        let output = "Available Categories:\n\n";
        for (const category of categories) {
          const config = manager.getCategory(category);
          output += `### ${category}\n`;
          output += `  ${manager.getCategoryDescription(category)}\n`;
          output += `  Model: ${config?.model}\n`;
          output += `  Temperature: ${config?.temperature}\n\n`;
        }
        return { success: true, output };
      }

      if (format === "json") {
        const json: Record<string, any> = {};
        for (const category of categories) {
          const config = manager.getCategory(category);
          json[category] = {
            description: manager.getCategoryDescription(category),
            ...config
          };
        }
        return { success: true, categories: json };
      }

      // Table format (default)
      const tableData = categories.map((category: string) => {
        const config = manager.getCategory(category);
        return {
          category,
          description: manager.getCategoryDescription(category),
          model: config?.model,
          temperature: config?.temperature
        };
      });

      return {
        success: true,
        categories: tableData,
        format: "table"
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to list categories"
      };
    }
  }
};

/**
 * Apply Category Tool
 * Apply category settings to an agent invocation
 */
export const applyCategoryTool: Tool = {
  description: "Apply category configuration to a specific agent for task delegation",
  parameters: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "Category name to apply (e.g., 'plotting', 'writing', 'character-development')"
      },
      agent: {
        type: "string",
        description: "Agent to apply category to (e.g., 'novelist', 'plot-designer')"
      },
      validate: {
        type: "boolean",
        description: "Validate category configuration before applying (default: true)"
      }
    },
    required: ["category"]
  },
  handler: async (params: any) => {
    try {
      const manager = getCategoryManager();
      const config = manager.applyCategoryToAgent(
        params.category,
        params.agent
      );

      if (!config) {
        return {
          success: false,
          error: `Category "${params.category}" not found`,
          availableCategories: manager.listCategories()
        };
      }

      // Validate if requested
      if (params.validate !== false) {
        const categoryConfig = manager.getCategory(params.category);
        if (categoryConfig) {
          const validation = manager.validateCategory(params.category, categoryConfig);
          if (!validation.valid) {
            return {
              success: false,
              error: "Category configuration invalid",
              errors: validation.errors
            };
          }
        }
      }

      return {
        success: true,
        category: params.category,
        agent: params.agent,
        configuration: config,
        message: `Applied "${params.category}" category to ${params.agent || "default"} agent`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to apply category"
      };
    }
  }
};

/**
 * Recommend Category Tool
 * Analyze task description and recommend appropriate category
 */
export const recommendCategoryTool: Tool = {
  description: "Analyze task description and recommend the most appropriate category",
  parameters: {
    type: "object",
    properties: {
      task: {
        type: "string",
        description: "Task description to analyze"
      }
    },
    required: ["task"]
  },
  handler: async (params: any) => {
    try {
      const manager = getCategoryManager();
      const recommendations = manager.recommendCategory(params.task);

      if (recommendations.length === 0) {
        return {
          success: true,
          message: "No specific category recommendation. Using 'writing' as default.",
          recommended: "writing"
        };
      }

      const topRecommendation = recommendations[0];

      return {
        success: true,
        recommendations,
        topRecommendation: {
          category: topRecommendation.category,
          confidence: Math.round(topRecommendation.confidence * 100),
          description: manager.getCategoryDescription(topRecommendation.category)
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to recommend category"
      };
    }
  }
};

// Export all tools
export const categoryTools = {
  list_categories: listCategoriesTool,
  apply_category: applyCategoryTool,
  recommend_category: recommendCategoryTool
};
