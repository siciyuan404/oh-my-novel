import { Tool } from "opencode";
import { StateManager } from "../utils/StateManager";
import { LongRunningGenerator } from "../utils/LongRunningGenerator";
import * as fs from "fs";
import * as path from "path";

// 全局生成器实例（用于跨请求管理）
const activeGenerators: Map<string, LongRunningGenerator> = new Map();

export const tools: Record<string, Tool> = {
  // ... 之前的 tools 保持不变 ...
  
  novel_create: {
    description: "Initialize a new novel project with structure",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" },
        genre: { type: "string", description: "Genre (fantasy, sci-fi, romance, etc.)" },
        author: { type: "string", description: "Author name" },
        totalChapters: { type: "number", description: "Total number of chapters planned (for long-running generation)" }
      },
      required: ["title", "genre"]
    },
    handler: async (params: { title: string; genre: string; author?: string; totalChapters?: number }) => {
      const { title, genre, author = "Anonymous", totalChapters = 20 } = params;
      const NOVEL_DIR = "./novels";
      
      if (!fs.existsSync(NOVEL_DIR)) {
        fs.mkdirSync(NOVEL_DIR, { recursive: true });
      }
      
      const safeTitle = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const novelPath = path.join(NOVEL_DIR, safeTitle);
      
      if (fs.existsSync(novelPath)) {
        return { success: false, error: `Novel "${title}" already exists` };
      }

      fs.mkdirSync(novelPath, { recursive: true });
      fs.mkdirSync(path.join(novelPath, "chapters"), { recursive: true });
      fs.mkdirSync(path.join(novelPath, "characters"), { recursive: true });
      fs.mkdirSync(path.join(novelPath, "world-building"), { recursive: true });
      fs.mkdirSync(path.join(novelPath, "drafts"), { recursive: true });

      const metadata = {
        title,
        genre,
        author,
        createdAt: new Date().toISOString(),
        chapters: [],
        characters: [],
        plotOutline: "",
        totalChapters
      };

      fs.writeFileSync(path.join(novelPath, "metadata.json"), JSON.stringify(metadata, null, 2));

      return {
        success: true,
        message: `Novel "${title}" created successfully`,
        path: novelPath,
        totalChapters
      };
    }
  },

  start_long_running_generation: {
    description: "Start long-running novel generation with checkpoint support (supports unlimited chapters)",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" },
        totalChapters: { type: "number", description: "Total number of chapters to generate" },
        context: { 
          type: "object", 
          description: "Generation context (plot outline, characters, world building)" 
        },
        config: {
          type: "object",
          description: "Generation configuration (optional)",
          properties: {
            maxRetries: { type: "number", description: "Max retries per chapter (default: 3)" },
            retryDelay: { type: "number", description: "Retry delay in ms (default: 5000)" },
            batchSize: { type: "number", description: "Batch size (default: 5)" },
            pauseOnError: { type: "boolean", description: "Pause on error (default: true)" }
          }
        }
      },
      required: ["title", "totalChapters", "context"]
    },
    handler: async (params: any) => {
      const { title, totalChapters, context, config = {} } = params;
      
      // 创建生成器实例
      const generator = new LongRunningGenerator({
        maxRetries: config.maxRetries || 3,
        retryDelay: config.retryDelay || 5000,
        batchSize: config.batchSize || 5,
        pauseOnError: config.pauseOnError !== false
      });

      // 存储实例
      activeGenerators.set(title, generator);

      // 启动生成（在后台运行）
      const safeTitle = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const novelPath = path.join("./novels", safeTitle);
      
      // 异步启动生成
      setImmediate(async () => {
        try {
          await generator.startGeneration(
            title,
            totalChapters,
            context,
            async (chapterNum: number, ctx: any) => {
              // 这里应该调用实际的章节生成逻辑
              // 暂时返回模拟结果
              const chapterPath = path.join(novelPath, "chapters", `chapter-${chapterNum}.md`);
              const content = `# Chapter ${chapterNum}\n\nGenerated content for chapter ${chapterNum}...`;
              
              fs.writeFileSync(chapterPath, content);
              
              return { wordCount: content.split(/\s+/).length };
            }
          );
        } catch (error) {
          console.error(`Generation failed for "${title}":`, error);
        }
      });

      return {
        success: true,
        message: `Long-running generation started for "${title}"`,
        totalChapters,
        status: "running",
        advice: "Use check_generation_progress to monitor progress, pause_generation to pause, or resume_generation to resume"
      };
    }
  },

  check_generation_progress: {
    description: "Check progress of a long-running novel generation",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" }
      },
      required: ["title"]
    },
    handler: async (params: { title: string }) => {
      const { title } = params;
      
      const generator = activeGenerators.get(title);
      
      if (!generator) {
        // 尝试从状态文件加载
        const stateManager = new StateManager();
        const state = stateManager.loadState(title);
        
        if (state) {
          const progress = {
            current: state.generatedChapters.length,
            total: state.totalChapters,
            percentage: (state.generatedChapters.length / state.totalChapters) * 100,
            failed: state.failedChapters.length
          };
          
          return {
            success: true,
            status: state.status,
            progress,
            generatedChapters: state.generatedChapters,
            failedChapters: state.failedChapters,
            lastUpdate: state.lastUpdateTime,
            canResume: state.status === "paused" || state.status === "error"
          };
        }
        
        return { success: false, error: `No active or saved generation found for "${title}"` };
      }

      const progress = generator.getProgress();
      const state = generator.getStatus();

      return {
        success: true,
        status: state?.status,
        progress,
        isActive: generator.isActive(),
        lastUpdate: state?.lastUpdateTime
      };
    }
  },

  pause_generation: {
    description: "Pause a running novel generation",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" }
      },
      required: ["title"]
    },
    handler: async (params: { title: string }) => {
      const { title } = params;
      
      const generator = activeGenerators.get(title);
      
      if (!generator) {
        return { success: false, error: `No active generation found for "${title}"` };
      }

      generator.pause();

      return {
        success: true,
        message: `Generation for "${title}" will pause after current chapter completes`,
        status: "pausing"
      };
    }
  },

  resume_generation: {
    description: "Resume a paused or failed novel generation",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" }
      },
      required: ["title"]
    },
    handler: async (params: { title: string }) => {
      const { title } = params;
      
      let generator = activeGenerators.get(title);
      
      if (!generator) {
        // 创建新的生成器实例来恢复
        generator = new LongRunningGenerator();
        activeGenerators.set(title, generator);
      }

      const safeTitle = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const novelPath = path.join("./novels", safeTitle);

      // 异步恢复
      setImmediate(async () => {
        try {
          await generator.resume(async (chapterNum: number, ctx: any) => {
            const chapterPath = path.join(novelPath, "chapters", `chapter-${chapterNum}.md`);
            const content = `# Chapter ${chapterNum}\n\nGenerated content for chapter ${chapterNum}...`;
            
            fs.writeFileSync(chapterPath, content);
            
            return { wordCount: content.split(/\s+/).length };
          });
        } catch (error) {
          console.error(`Resume failed for "${title}":`, error);
        }
      });

      return {
        success: true,
        message: `Generation for "${title}" resumed`,
        status: "running"
      };
    }
  },

  list_all_generations: {
    description: "List all novel generation tasks (active and saved)",
    parameters: {
      type: "object",
      properties: {},
      required: []
    },
    handler: async () => {
      const stateManager = new StateManager();
      const allGenerations = stateManager.listAllStates();

      return {
        success: true,
        generations: allGenerations,
        count: allGenerations.length
      };
    }
  },

  delete_generation_state: {
    description: "Delete saved state for a novel generation",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" }
      },
      required: ["title"]
    },
    handler: async (params: { title: string }) => {
      const { title } = params;
      
      // 停止活动生成器
      const generator = activeGenerators.get(title);
      if (generator) {
        generator.stop();
        activeGenerators.delete(title);
      }

      // 删除状态
      const stateManager = new StateManager();
      stateManager.deleteState(title);

      return {
        success: true,
        message: `Generation state for "${title}" deleted`
      };
    }
  },

  export_generation_state: {
    description: "Export generation state to a file",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" },
        outputPath: { type: "string", description: "Output file path" }
      },
      required: ["title", "outputPath"]
    },
    handler: async (params: { title: string; outputPath: string }) => {
      const { title, outputPath } = params;
      
      const stateManager = new StateManager();
      
      try {
        stateManager.exportState(title, outputPath);
        
        return {
          success: true,
          message: `State exported to ${outputPath}`,
          path: outputPath
        };
      } catch (error) {
        return {
          success: false,
          error: `Export failed: ${error}`
        };
      }
    }
  }
};
