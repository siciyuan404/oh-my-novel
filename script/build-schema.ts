#!/usr/bin/env node

/**
 * Build JSON Schema from Zod configuration
 * Generates oh-my-novel.schema.json for IDE autocomplete
 */

import * as fs from "fs";
import * as path from "path";
import { OhMyNovelConfigSchema } from "../src/config/schema.js";

function generateSchema(): string {
  // Start with schema meta
  let schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://github.com/yourusername/oh-my-novel/schemas/oh-my-novel",
    "$comment": "Auto-generated from Zod configuration schema. DO NOT EDIT MANUALLY.",
    "title": "Oh My Novel Configuration Schema",
    "description": "Configuration schema for oh-my-novel plugin with IDE autocomplete support",
    "type": "object",
    "definitions": {} as Record<string, any>
  };

  // Extract all definitions from Zod schema
  const defs = (OhMyNovelConfigSchema as any).shape;

  // Helper function to recursively generate definitions
  function generateDefinitions(schema: any, definitions: Record<string, any>) {
    const type = schema._def.typeName;
    const zodType = type.replace(/"/g, "_");

    if (!zodType) return;

    switch (zodType) {
      case "ZodString":
        schema.definitions[type] = {
          type: "string",
          description: (schema as any).description
        };
        break;

      case "ZodNumber":
        schema.definitions[type] = {
          type: "number",
          description: (schema as any).description
        };
        break;

      case "ZodBoolean":
        schema.definitions[type] = {
          type: "boolean",
          description: (schema as any).description
        };
        break;

      case "ZodArray":
        const innerType = schema._def.typeName;
        schema.definitions[type] = {
          type: "array",
          items: { $ref: `#/definitions/${innerType}` },
          description: (schema as any).description
        };
        if (!definitions[innerType]) {
          generateDefinitions(schema, definitions);
        }
        break;

      case "ZodObject":
        const properties: Record<string, any> = {};
        const required: string[] = [];

        for (const [key, prop] of Object.entries(schema._def.shape())) {
          const propSchema = prop as any;
          const propType = propSchema._def.typeName;

          if (propType === "ZodOptional") {
            const inner = (propSchema as any)._def.innerType;
            const innerType = inner._def.typeName;

            if (innerType === "ZodString") {
              properties[key] = {
                type: "string",
                description: (propSchema as any).description
              };
            } else if (innerType === "ZodNumber") {
              properties[key] = {
                type: "number",
                description: (propSchema as any).description
              };
            } else if (innerType === "ZodBoolean") {
              properties[key] = {
                type: "boolean",
                description: (propSchema as any).description
              };
            } else if (innerType === "ZodArray") {
              const arrayInner = inner._def.typeName;
              if (definitions[arrayInner]) {
                properties[key] = {
                  type: "array",
                  items: { $ref: `#/definitions/${arrayInner}` },
                  description: (propSchema as any).description
                };
              } else {
                properties[key] = {
                  type: "array",
                  description: (propSchema as any).description
                };
              }
            } else if (innerType === "ZodObject") {
              properties[key] = {
                type: "object",
                description: (propSchema as any).description
              };
            }
          } else if (propType === "ZodEnum") {
            properties[key] = {
              type: "string",
              enum: propSchema._def.values,
              description: (propSchema as any).description
            };
          } else if (propType === "ZodLiteral") {
            properties[key] = {
              const: (propSchema as any)._def.value,
              description: (propSchema as any).description
            };
          } else if (propType === "ZodUnion") {
            // Simplified union handling
            const options = propSchema._def.options;
            const hasString = options.some((o: any) => o._def.typeName === "ZodString");
            const hasNumber = options.some((o: any) => o._def.typeName === "ZodNumber");
            const hasBoolean = options.some((o: any) => o._def.typeName === "ZodBoolean");

            if (hasString && hasNumber && !hasBoolean) {
              properties[key] = {
                type: ["string", "number"],
                description: (propSchema as any).description
              };
            } else if (hasString) {
              properties[key] = {
                type: "string",
                description: (propSchema as any).description
              };
            } else {
              properties[key] = {
                type: "string",
                description: (propSchema as any).description
              };
            }
          }
        }

        schema.definitions[type] = {
          type: "object",
          properties,
          required,
          description: (schema as any).description
        };
        break;

      case "ZodEnum":
        schema.definitions[type] = {
          type: "string",
          enum: schema._def.values,
          description: (schema as any).description
        };
        break;

      case "ZodLiteral":
        schema.definitions[type] = {
          const: (schema as any)._def.value,
          description: (schema as any).description
        };
        break;

      case "ZodUnion":
        schema.definitions[type] = {
          type: "string",
          description: (schema as any).description
        };
        break;

      case "ZodDefault":
        const inner = (schema as any)._def.innerType;
        const innerType = inner._def.typeName;
        if (innerType === "ZodString") {
          schema.definitions[type] = {
            type: "string",
            default: (schema as any).defaultValue,
            description: (schema as any).description
          };
        } else if (innerType === "ZodNumber") {
          schema.definitions[type] = {
            type: "number",
            default: (schema as any).defaultValue,
            description: (schema as any).description
          };
        } else if (innerType === "ZodBoolean") {
          schema.definitions[type] = {
            type: "boolean",
            default: (schema as any).defaultValue,
            description: (schema as any).description
          };
        } else if (innerType === "ZodArray") {
          const arrayInner = inner._def.typeName;
          schema.definitions[type] = {
            type: "array",
            items: { $ref: `#/definitions/${arrayInner}` },
            default: (schema as any).defaultValue,
            description: (schema as any).description
          };
        } else if (innerType === "ZodObject") {
          const nestedDefs = generateDefinitions(inner, definitions);
          schema.definitions[type] = {
            type: "object",
            properties: nestedDefs.properties,
            default: (schema as any).defaultValue,
            description: (schema as any).description
          };
        } else {
          schema.definitions[type] = {
            type: "string",
            default: (schema as any).defaultValue,
            description: (schema as any).description
          };
        }
        break;

      case "ZodEffects":
        // Skip effects in schema generation
        break;

      case "ZodNull":
        schema.definitions[type] = {
          type: "null",
          description: (schema as any).description
        };
        break;

      case "ZodUndefined":
        schema.definitions[type] = {
          type: "string",
          description: (schema as any).description
        };
        break;

      case "ZodRecord":
        const valueType = schema._def.valueType;
        const valueTypeSchema = valueType._def.typeName;
        if (definitions[valueTypeSchema]) {
          schema.definitions[type] = {
            type: "object",
            additionalProperties: true,
            patternProperties: {
              type: "string",
              pattern: ".*",
              description: (schema as any).description
            },
            additionalProperties: { $ref: `#/definitions/${valueTypeSchema}` }
          };
        }
        break;

      default:
        // Fallback to string
        schema.definitions[type] = {
          type: "string",
          description: (schema as any).description
        };
        break;
    }
  }

  // Generate all definitions recursively
  for (const [key, def] of Object.entries(defs)) {
    generateDefinitions(def, schema.definitions);
  }

  // Add root level properties
  schema.properties = {};

  const ohMyNovelProps = (OhMyNovelConfigSchema as any).shape;

  for (const [key, prop] of Object.entries(ohMyNovelProps)) {
    const propSchema = prop;
    const propType = propSchema._def.typeName;

    if (propType === "ZodOptional") {
      const inner = propSchema._def.innerType;
      const innerType = inner._def.typeName;

      if (innerType === "ZodString") {
        schema.properties[key] = {
          type: "string",
          description: (propSchema as any).description
        };
      } else if (innerType === "ZodNumber") {
        schema.properties[key] = {
          type: "number",
          description: (propSchema as any).description
        };
      } else if (innerType === "ZodBoolean") {
        schema.properties[key] = {
          type: "boolean",
          description: (propSchema as any).description
        };
      } else if (innerType === "ZodArray") {
        const arrayInner = inner._def.typeName;
        if (schema.definitions[arrayInner]) {
          schema.properties[key] = {
            type: "array",
            items: { $ref: `#/definitions/${arrayInner}` },
            description: (propSchema as any).description
          };
        }
      } else if (innerType === "ZodObject") {
        // Generate nested definitions
        const nestedDefs = generateDefinitions(inner, schema.definitions);
        schema.properties[key] = {
          type: "object",
          properties: nestedDefs.properties,
          description: (propSchema as any).description
        };
      } else if (innerType === "ZodEnum") {
        schema.properties[key] = {
          type: "string",
          enum: propSchema._def.values,
          description: (propSchema as any).description
        };
      } else if (innerType === "ZodUnion") {
        // Simplified union handling
        const options = propSchema._def.options;
        const hasString = options.some((o: any) => o._def.typeName === "ZodString");
        const hasNumber = options.some((o: any) => o._def.typeName === "ZodNumber");
        const hasBoolean = options.some((o: any) => o._def.typeName === "ZodBoolean");

        if (hasString && hasNumber && !hasBoolean) {
          schema.properties[key] = {
            type: ["string", "number"],
            description: (propSchema as any).description
          };
        } else if (hasString) {
          schema.properties[key] = {
            type: "string",
            description: (propSchema as any).description
          };
        } else {
          schema.properties[key] = {
            type: "string",
            description: (propSchema as any).description
          };
        }
      } else if (innerType === "ZodLiteral") {
        schema.properties[key] = {
          const: (propSchema as any)._def.value,
          description: (propSchema as any).description
        };
      } else if (innerType === "ZodDefault") {
        const inner = (propSchema as any)._def.innerType;
        const innerType2 = inner._def.typeName;
        if (innerType2 === "ZodString") {
          schema.properties[key] = {
            type: "string",
            default: (propSchema as any).defaultValue,
            description: (propSchema as any).description
          };
        } else if (innerType2 === "ZodNumber") {
          schema.properties[key] = {
            type: "number",
            default: (propSchema as any).defaultValue,
            description: (propSchema as any).description
          };
        } else if (innerType2 === "ZodBoolean") {
          schema.properties[key] = {
            type: "boolean",
            default: (propSchema as any).defaultValue,
            description: (propSchema as any).description
          };
        } else if (innerType2 === "ZodArray") {
          const arrayInner = inner._def.typeName;
          if (schema.definitions[arrayInner]) {
            schema.properties[key] = {
              type: "array",
              items: { $ref: `#/definitions/${arrayInner}` },
              default: (propSchema as any).defaultValue,
              description: (propSchema as any).description
            };
          }
        } else if (innerType2 === "ZodObject") {
          const nestedDefs = generateDefinitions(inner, schema.definitions);
          schema.properties[key] = {
            type: "object",
            properties: nestedDefs.properties,
            default: (propSchema as any).defaultValue,
            description: (propSchema as any).description
          };
        } else {
          schema.properties[key] = {
            type: "string",
            default: (propSchema as any).defaultValue,
            description: (propSchema as any).description
          };
        }
      } else if (propType === "ZodEffects") {
        // Skip effects
      } else if (propType === "ZodNull") {
        schema.properties[key] = {
          type: "null",
          description: (propSchema as any).description
        };
      } else if (propType === "ZodUndefined") {
        schema.properties[key] = {
          type: "string",
          description: (propSchema as any). description
        };
      } else if (propType === "ZodRecord") {
        // Simplified record handling
        schema.properties[key] = {
          type: "object",
          additionalProperties: true,
          description: (propSchema as any).description
        };
      } else if (propType === "ZodRef") {
        schema.properties[key] = {
          $ref: `#/definitions/${(propSchema as any)._def.typeName}`,
          description: (propSchema as any).description
        };
      }
    }
  }

  // Add manual property definitions for nested structures
  if (!schema.definitions["NovelSettings"]) {
    const novelSettings = (OhMyNovelConfigSchema as any).shape.novelSettings;
    generateDefinitions(novelSettings, schema.definitions);
  }

  if (!schema.definitions["LongRunningConfig"]) {
    const longRunningConfig = (OhMyNovelConfigSchema as any).shape.longRunning;
    generateDefinitions(longRunningConfig, schema.definitions);
  }

  if (!schema.definitions["BackgroundTaskConfig"]) {
    const backgroundTaskConfig = (OhMyNovelConfigSchema as any).shape.background_task;
    generateDefinitions(backgroundTaskConfig, schema.definitions);
  }

  if (!schema.definitions["CommentCheckerConfig"]) {
    const commentCheckerConfig = (OhMyNovelConfigSchema as any).shape.comment_checker;
    generateDefinitions(commentCheckerConfig, schema.definitions);
  }

  if (!schema.definitions["RalphLoopConfig"]) {
    const ralphLoopConfig = (OhMyNovelConfigSchema as any).shape.ralph_loop;
    generateDefinitions(ralphLoopConfig, schema.definitions);
  }

  if (!schema.definitions["NotificationConfig"]) {
    const notificationConfig = (OhMyNovelConfigSchema as any).shape.notification;
    generateDefinitions(notificationConfig, schema.definitions);
  }

  if (!schema.definitions["ExperimentalConfig"]) {
    const experimentalConfig = (OhMyNovelConfigSchema as any).shape.experimental;
    generateDefinitions(experimentalConfig, schema.definitions);
  }

  // Add array type definitions
  schema.definitions["AgentOverrides"] = {
    type: "object",
    description: "Override configuration for specific agents"
  };

  schema.definitions["CategoriesConfig"] = {
    type: "object",
    description: "Task category configurations with preset models and settings"
  };

  schema.definitions["NovelSettings"] = {
    type: "object",
    description: "Novel-specific settings"
  };

  schema.definitions["HookName"] = {
    type: "string",
    enum: [
      "preToolUse",
      "postToolUse",
      "userPromptSubmit",
      "longRunningMonitor",
      "errorRecovery",
      "session-recovery",
      "context-window-monitor",
      "todo-continuation-enforcer",
      "keyword-detector",
      "comment-checker",
      "empty-task-response-detector",
      "empty-message-sanitizer",
      "background-notification",
      "startup-toast",
      "auto-update-checker",
      "directory-agents-injector",
      "directory-readme-injector",
      "rules-injector",
      "thinking-block-validator",
      "claude-code-hooks",
      "ralph-loop",
      "preemptive-compaction",
      "compaction-context-injector",
      "edit-error-recovery",
      "delegate-task-retry",
      "prometheus-md-only",
      "start-work",
      "sisyphus-orchestrator"
    ],
    description: "Available hook names"
  };

  schema.definitions["BuiltinAgentName"] = {
    type: "string",
    enum: [
      "novelist",
      "plot-designer",
      "character-developer",
      "world-builder",
      "editor"
    ],
    description: "Built-in agent names"
  };

  schema.definitions["BuiltinSkillName"] = {
    type: "string",
    enum: [
      "playwright",
      "frontend-ui-ux",
      "git-master"
    ],
    description: "Built-in skill names"
  };

  schema.definitions["BuiltinCommandName"] = {
    type: "string",
    enum: [
      "init-deep",
      "start-work"
    ],
    description: "Built-in command names"
  };

  schema.definitions["PermissionValue"] = {
    type: "string",
    enum: ["ask", "allow", "deny"],
    description: "Permission level: ask/allow/deny"
  };

  return JSON.stringify(schema, null, 2);
}

// ============================================
// Main Entry Point
// ============================================

function main() {
  try {
    const schema = generateSchema();

    const outputPath = path.join(process.cwd(), "assets", "oh-my-novel.schema.json");
    const outputDir = path.dirname(outputPath);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, schema);
    console.log(`Schema generated: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error(`Error generating schema: ${(error as Error).message}`, error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSchema };
