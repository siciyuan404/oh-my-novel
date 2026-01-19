import { Hook } from "opencode";
import { StateManager } from "../utils/StateManager";
import * as fs from "fs";
import * as path from "path";

const stateManager = new StateManager();

export const hooks: Record<string, Hook> = {
  preToolUse: {
    description: "Auto-save state before tool execution",
    handler: async (context: {
      toolName: string;
      params: any;
      novelTitle?: string;
    }) => {
      const { toolName, params, novelTitle } = context;

      // 如果是小说相关的工具且包含 novelTitle，自动保存状态
      if (
        novelTitle &&
        [
          "chapter_write",
          "character_manage",
          "plot_outline",
          "world_notes",
        ].includes(toolName)
      ) {
        try {
          const safeTitle = novelTitle
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
          const novelPath = path.join("./novels", safeTitle);
          const statePath = path.join(novelPath, "checkpoint.json");

          if (fs.existsSync(statePath)) {
            // 创建备份
            const backupPath = path.join(
              novelPath,
              `checkpoint-backup-${Date.now()}.json`,
            );
            fs.copyFileSync(statePath, backupPath);

            // @ts-ignore - dynamic property
            context.backupCreated = backupPath;
          }
        } catch (error) {
          console.error("Pre-tool backup failed:", error);
        }
      }

      return { success: true, context };
    },
  },

  postToolUse: {
    description: "Update state and index after tool execution",
    handler: async (context: {
      toolName: string;
      result: any;
      params: any;
      novelTitle?: string;
    }) => {
      const { toolName, result, params, novelTitle } = context;

      // 更新章节索引
      if (toolName === "chapter_write" && result.success && novelTitle) {
        try {
          const safeTitle = novelTitle
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
          const novelPath = path.join("./novels", safeTitle);
          const indexPath = path.join(novelPath, "chapters", "index.json");

          let index: any[] = [];
          if (fs.existsSync(indexPath)) {
            index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
          }

          index.push({
            chapter: params.chapter || index.length + 1,
            title: params.title || `Chapter ${index.length + 1}`,
            wordCount: result.wordCount || 0,
            createdAt: new Date().toISOString(),
            path: result.path,
          });

          fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

          // 保存检查点
          stateManager.saveCheckpoint(novelTitle, {
            lastAction: toolName,
            lastUpdate: new Date().toISOString(),
            generatedChapters: index,
            metadata: result,
          });
        } catch (error) {
          console.error("Post-tool index update failed:", error);
        }
      }

      return { success: true, context };
    },
  },

  userPromptSubmit: {
    description: "Inject novel context into user prompts",
    handler: async (context: { prompt: string; novelTitle?: string }) => {
      const { prompt, novelTitle } = context;

      if (!novelTitle) {
        return { success: true, prompt };
      }

      try {
        const safeTitle = novelTitle
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        const novelPath = path.join("./novels", safeTitle);

        // 加载小说元数据
        const metadataPath = path.join(novelPath, "metadata.json");
        if (!fs.existsSync(metadataPath)) {
          return { success: true, prompt };
        }

        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

        // 加载角色信息
        const characters: any[] = [];
        const charDir = path.join(novelPath, "characters");
        if (fs.existsSync(charDir)) {
          const charFiles = fs
            .readdirSync(charDir)
            .filter((f) => f.endsWith(".json"));
          charFiles.forEach((file) => {
            characters.push(
              JSON.parse(fs.readFileSync(path.join(charDir, file), "utf-8")),
            );
          });
        }

        // 加载世界观
        let worldBuilding = "";
        const worldFile = path.join(novelPath, "world-building", "main.md");
        if (fs.existsSync(worldFile)) {
          worldBuilding = fs.readFileSync(worldFile, "utf-8");
        }

        // 加载最近的章节（上下文窗口限制）
        const chapterDir = path.join(novelPath, "chapters");
        let recentChapters = "";
        if (fs.existsSync(chapterDir)) {
          const chapterFiles = fs
            .readdirSync(chapterDir)
            .filter((f) => f.endsWith(".md") && f !== "index.json")
            .sort()
            .slice(-3); // 只取最近3章

          chapterFiles.forEach((file) => {
            recentChapters +=
              fs.readFileSync(path.join(chapterDir, file), "utf-8") + "\n\n";
          });
        }

        // 构建增强的提示词
        const enhancedPrompt = `
NOVEL CONTEXT: ${metadata.title}
Genre: ${metadata.genre}
Author: ${metadata.author}

CHARACTERS:
${characters.map((c) => `- ${c.name}: ${c.description}`).join("\n")}

WORLD BUILDING:
${worldBuilding}

RECENT CHAPTERS:
${recentChapters}

USER REQUEST:
${prompt}
`.trim();

        return { success: true, prompt: enhancedPrompt };
      } catch (error) {
        console.error("Context injection failed:", error);
        return { success: true, prompt };
      }
    },
  },

  // 新增：长时间运行监控 Hook
  longRunningMonitor: {
    description:
      "Monitor long-running generation tasks and auto-save checkpoints",
    handler: async (context: { generationId?: string; status?: string }) => {
      const { generationId, status } = context;

      if (!generationId) {
        return { success: true, context };
      }

      // 定期保存检查点
      if (status === "running" || status === "paused") {
        try {
          // 从全局生成器映射中获取状态
          // 这里需要与 long-running.ts 中的 activeGenerators 集成
          const state = stateManager.loadState(generationId);

          if (state) {
            state.lastMonitorCheck = new Date().toISOString();
            stateManager.saveState(generationId, state);
          }
        } catch (error) {
          console.error("Monitor checkpoint failed:", error);
        }
      }

      return { success: true, context };
    },
  },

  // 新增：错误恢复 Hook
  errorRecovery: {
    description: "Attempt automatic recovery from errors",
    handler: async (context: {
      toolName: string;
      error: any;
      novelTitle?: string;
    }) => {
      const { toolName, error, novelTitle } = context;

      if (!novelTitle || !error) {
        return { success: true, context };
      }

      try {
        const safeTitle = novelTitle
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        const novelPath = path.join("./novels", safeTitle);
        const errorLogPath = path.join(novelPath, "error-log.json");

        // 记录错误
        const errorLog: any[] = [];
        if (fs.existsSync(errorLogPath)) {
          errorLog.push(...JSON.parse(fs.readFileSync(errorLogPath, "utf-8")));
        }

        errorLog.push({
          toolName,
          error: error.message || error.toString(),
          timestamp: new Date().toISOString(),
          stack: error.stack,
        });

        fs.writeFileSync(errorLogPath, JSON.stringify(errorLog, null, 2));

        // 尝试恢复：查找最近的检查点
        const checkpointFiles = fs
          .readdirSync(novelPath)
          .filter((f) => f.startsWith("checkpoint-backup-"))
          .sort()
          .reverse();

        if (checkpointFiles.length > 0) {
          const latestBackup = checkpointFiles[0];
          // @ts-ignore - dynamic property
          (context as any).recoveryAvailable = true;
          // @ts-ignore - dynamic property
          (context as any).recoveryPoint = latestBackup;
        }
      } catch (e) {
        console.error("Error recovery logging failed:", e);
      }

      return { success: true, context };
    },
  },
};
