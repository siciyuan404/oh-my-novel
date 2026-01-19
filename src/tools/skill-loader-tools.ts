import { Skill } from "opencode";
import * as fs from "fs";
import * as path from "path";
import { configManager } from "../config/manager.js";

/**
 * Skill Loader for oh-my-novel
 * Supports directory-based skills from multiple sources
 */

interface SkillMetadata {
  name: string;
  path: string;
  description?: string;
  author?: string;
  version?: string;
  enabled: boolean;
  skills: string[]; // Required skills
}

interface SkillDefinition {
  name: string;
  description: string;
  template?: string;
  from?: string;
  model?: string;
  agent?: string;
  subtask?: boolean;
  skills?: string[];
  argument_hint?: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, any>;
  "allowed-tools"?: string[];
  disable?: boolean;
}

class SkillLoader {
  private skillPaths: string[];
  private loadedSkills: Map<string, SkillDefinition>;

  constructor() {
    this.skillPaths = [
      // User-level skills
      path.join(configManager.getHomeDir(), ".claude", "skills"),
      // Project-level skills
      path.join(process.cwd(), ".claude", "skills"),
      path.join(process.cwd(), ".opencode", "skills"),
    ];
    this.loadedSkills = new Map();
  }

  /**
   * Get home directory
   */
  private getHomeDir(): string {
    return process.env.HOME || process.env.USERPROFILE || "";
  }

  /**
   * Scan all skill directories
   */
  scanSkillDirectories(): SkillMetadata[] {
    const skills: SkillMetadata[] = [];

    for (const skillPath of this.skillPaths) {
      if (!fs.existsSync(skillPath)) {
        continue;
      }

      try {
        const entries = fs.readdirSync(skillPath, { withFileTypes: true });

        for (const entry of entries) {
          if (!entry.isDirectory()) continue;

          const skillDir = path.join(skillPath, entry.name);
          const skillFile = path.join(skillDir, "SKILL.md");

          if (fs.existsSync(skillFile)) {
            const metadata: SkillMetadata = {
              name: entry.name,
              path: skillDir,
              enabled: true,
            };

            // Read skill metadata
            const content = fs.readFileSync(skillFile, "utf-8");
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (frontmatterMatch) {
              const frontmatter = frontmatterMatch[1];
              const lines = frontmatter.split("\n");

              for (const line of lines) {
                if (line.startsWith("description:")) {
                  metadata.description = line
                    .substring("description:".length)
                    .trim();
                } else if (line.startsWith("author:")) {
                  metadata.author = line.substring("author:".length).trim();
                } else if (line.startsWith("version:")) {
                  metadata.version = line.substring("version:".length).trim();
                } else if (line.startsWith("enabled:")) {
                  metadata.enabled =
                    line.substring("enabled:".length).trim().toLowerCase() ===
                    "true";
                } else if (line.startsWith("skills:")) {
                  const skillsList = line.substring("skills:".length).trim();
                  metadata.skills = skillsList.split(",").map((s) => s.trim());
                }
              }
            }

            skills.push(metadata);
          }
        }
      } catch (error) {
        console.error(`Error scanning ${skillPath}:`, error);
      }
    }

    return skills;
  }

  /**
   * Load a specific skill
   */
  loadSkill(skillName: string): SkillDefinition | null {
    // Scan directories to find the skill
    const allSkills = this.scanSkillDirectories();
    const skillMetadata = allSkills.find((s) => s.name === skillName);

    if (!skillMetadata || !skillMetadata.enabled) {
      return null;
    }

    try {
      const skillFile = path.join(skillMetadata.path, "SKILL.md");
      const content = fs.readFileSync(skillFile, "utf-8");

      // Parse skill definition
      const skillDef: SkillDefinition = {
        name: skillMetadata.name,
        description: skillMetadata.description || `Custom skill: ${skillName}`,
        disable: !skillMetadata.enabled,
      };

      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const lines = frontmatter.split("\n");

        for (const line of lines) {
          if (line.startsWith("description:")) {
            skillDef.description = line.substring("description:".length).trim();
          } else if (line.startsWith("template:")) {
            skillDef.template = line.substring("template:".length).trim();
          } else if (line.startsWith("from:")) {
            skillDef.from = line.substring("from:".length).trim();
          } else if (line.startsWith("model:")) {
            skillDef.model = line.substring("model:".length).trim();
          } else if (line.startsWith("agent:")) {
            skillDef.agent = line.substring("agent:".length).trim();
          } else if (line.startsWith("subtask:")) {
            skillDef.subtask =
              line.substring("subtask:".length).trim().toLowerCase() === "true";
          } else if (line.startsWith("skills:")) {
            const skillsList = line.substring("skills:".length).trim();
            skillDef.skills = skillsList.split(",").map((s) => s.trim());
          } else if (line.startsWith("argument-hint:")) {
            skillDef.argument_hint = line
              .substring("argument-hint:".length)
              .trim();
          } else if (line.startsWith("license:")) {
            skillDef.license = line.substring("license:".length).trim();
          } else if (line.startsWith("compatibility:")) {
            skillDef.compatibility = line
              .substring("compatibility:".length)
              .trim();
          } else if (line.startsWith("allowed-tools:")) {
            const toolsList = line.substring("allowed-tools:".length).trim();
            skillDef["allowed-tools"] = toolsList
              .split(",")
              .map((t) => t.trim());
          } else if (line.startsWith("disable:")) {
            skillDef.disable =
              line.substring("disable:".length).trim().toLowerCase() === "true";
          } else if (line.startsWith("metadata:")) {
            // Handle metadata object (simplified)
            skillDef.metadata = { raw: line };
          }
        }

        // Skill content is everything after frontmatter
        const skillContent = content
          .substring(frontmatterMatch[0].length)
          .trim();
        if (skillContent && skillContent.startsWith("---")) {
          skillDef.template = skillContent.substring(3).trim();
        }
      }

      return skillDef;
    } catch (error) {
      console.error(`Error loading skill ${skillName}:`, error);
      return null;
    }
  }

  /**
   * Load all enabled skills
   */
  loadAllSkills(): Record<string, SkillDefinition> {
    const allSkills = this.scanSkillDirectories();
    const skills: Record<string, SkillDefinition> = {};

    // Load from config which skills to enable/disable
    const config = configManager.getConfig();
    const disabledSkills = config.disabled_skills || [];

    for (const skillMetadata of allSkills) {
      const shouldLoad =
        skillMetadata.enabled && !disabledSkills.includes(skillMetadata.name);

      if (shouldLoad) {
        const skillDef = this.loadSkill(skillMetadata.name);
        if (skillDef) {
          skills[skillMetadata.name] = skillDef;
        }
      }
    }

    return skills;
  }

  /**
   * Get skill as OpenCode Skill format
   */
  getSkillAsOpenCodeSkill(skillDef: SkillDefinition): Skill {
    return {
      name: skillDef.name,
      description: skillDef.description,
      template: skillDef.template,
      from: skillDef.from,
      model: skillDef.model,
      agent: skillDef.agent,
      subtask: skillDef.subtask,
      skills: skillDef.skills,
      "argument-hint": skillDef.argument_hint,
      license: skillDef.license,
      compatibility: skillDef.compatibility,
      metadata: skillDef.metadata,
      "allowed-tools": skillDef["allowed-tools"],
      disable: skillDef.disable,
    };
  }

  /**
   * Check if skill exists
   */
  skillExists(skillName: string): boolean {
    const allSkills = this.scanSkillDirectories();
    return allSkills.some((s) => s.name === skillName);
  }

  /**
   * Get skill metadata without loading
   */
  getSkillMetadata(skillName: string): SkillMetadata | null {
    const allSkills = this.scanSkillDirectories();
    return allSkills.find((s) => s.name === skillName) || null;
  }
}

// Singleton instance
const skillLoader = new SkillLoader();

/**
 * Load Skills Tool
 * Load and return a specific skill
 */
export const loadSkillTool: Tool = {
  description:
    "Load a custom skill by name from .claude/skills/ or .opencode/skills/",
  parameters: {
    type: "object",
    properties: {
      skillName: {
        type: "string",
        description:
          "Name of the skill to load (e.g., 'custom-character-generator')",
      },
    },
    required: ["skillName"],
  },
  handler: async (params: any) => {
    try {
      const skillDef = skillLoader.loadSkill(params.skillName);

      if (!skillDef) {
        return {
          success: false,
          error: `Skill "${params.skillName}" not found or disabled`,
          availableSkills: skillLoader
            .scanSkillDirectories()
            .map((s) => s.name),
        };
      }

      return {
        success: true,
        skill: skillLoader.getSkillAsOpenCodeSkill(skillDef),
        message: `Skill "${params.skillName}" loaded successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to load skill",
      };
    }
  },
};

/**
 * List Skills Tool
 * List all available custom skills
 */
export const listSkillsTool: Tool = {
  description: "List all available custom skills with their metadata",
  parameters: {
    type: "object",
    properties: {
      includeDisabled: {
        type: "boolean",
        description: "Include disabled skills in results (default: false)",
      },
    },
  },
  handler: async (params: any) => {
    try {
      const allSkills = skillLoader.scanSkillDirectories();
      const config = configManager.getConfig();
      const disabledSkills = config.disabled_skills || [];

      let skills = allSkills;

      if (!params.includeDisabled) {
        skills = allSkills.filter(
          (s) => !disabledSkills.includes(s.name) && s.enabled,
        );
      }

      return {
        success: true,
        skills: skills.map((s) => ({
          name: s.name,
          path: s.path,
          description: s.description,
          author: s.author,
          version: s.version,
          enabled: s.enabled && !disabledSkills.includes(s.name),
        })),
        count: skills.length,
        totalAvailable: allSkills.length,
        disabledCount: disabledSkills.length,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to list skills",
      };
    }
  },
};

/**
 * Reload Skills Tool
 * Reload all skills from directories
 */
export const reloadSkillsTool: Tool = {
  description: "Reload all custom skills from directories",
  parameters: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    try {
      const skills = skillLoader.loadAllSkills();

      return {
        success: true,
        skills,
        count: Object.keys(skills).length,
        message: "All skills reloaded successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to reload skills",
      };
    }
  },
};

/**
 * Create Skill Template Tool
 * Generate a skill template for users to customize
 */
export const createSkillTemplateTool: Tool = {
  description: "Generate a skill template with basic structure",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name for the new skill",
      },
      description: {
        type: "string",
        description: "Description of what the skill does",
      },
      category: {
        type: "string",
        enum: [
          "plotting",
          "character-development",
          "world-building",
          "writing",
          "editing",
          "research",
        ],
        description: "Category of the skill (affects model selection)",
      },
    },
    required: ["name", "description"],
  },
  handler: async (params: any) => {
    try {
      const config = configManager.getConfig();
      const categories = config.categories || {};

      // Get model for category
      const categoryConfig = categories[params.category];
      const model = categoryConfig?.model || "anthropic/claude-opus-4-5";

      const template = `---
name: ${params.name}
description: ${params.description}
model: ${model}
category: ${params.category}
author: User
version: 1.0.0
enabled: true
skills:
---

# ${params.name}

${params.description}

## Instructions

Use this skill to:
- First instruction
- Second instruction
- Third instruction

## Configuration

- Model: ${model}
- Category: ${params.category}
- Temperature: ${categoryConfig?.temperature || 0.7}

## Example

${params.name}: "Write a scene with the protagonist facing a challenge"
`;

      return {
        success: true,
        template,
        message: `Skill template created for "${params.name}"`,
        skillDir: path.join(process.cwd(), ".claude", "skills", params.name),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to create skill template",
      };
    }
  },
};

// Export all skill tools
export const skillLoaderTools = {
  load_skill: loadSkillTool,
  list_skills: listSkillsTool,
  reload_skills: reloadSkillsTool,
  create_skill_template: createSkillTemplateTool,
};
