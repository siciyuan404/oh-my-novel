import { Skill } from "opencode";
import { tools } from "../tools";
import { hooks } from "../hooks";

export const skills: Record<string, Skill> = {
  "novel-generation-skill": {
    name: "novel-generation-skill",
    description: "完整的小说生成流程，支持长时间运行和任意章节数量",
    agents: ["novelist", "plot-designer", "character-developer", "world-builder", "editor"],
    tools: [
      "novel_create",
      "chapter_write",
      "character_manage",
      "plot_outline",
      "world_notes",
      "start_long_running_generation",
      "check_generation_progress",
      "pause_generation",
      "resume_generation",
      "export_novel"
    ],
    hooks: ["preToolUse", "postToolUse", "userPromptSubmit", "longRunningMonitor"],
    workflow: [
      {
        step: 1,
        name: "Initialize Novel",
        agent: "novelist",
        tool: "novel_create",
        description: "创建小说项目，设置基本信息"
      },
      {
        step: 2,
        name: "Design Plot",
        agent: "plot-designer",
        tool: "plot_outline",
        description: "设计故事大纲和情节结构"
      },
      {
        step: 3,
        name: "Develop Characters",
        agent: "character-developer",
        tool: "character_manage",
        description: "创建角色档案和关系网络"
      },
      {
        step: 4,
        name: "Build World",
        agent: "world-builder",
        tool: "world_notes",
        description: "构建世界观和设定"
      },
      {
        step: 5,
        name: "Start Long-Running Generation",
        agent: "novelist",
        tool: "start_long_running_generation",
        description: "启动长时间生成任务，支持批量生成和自动恢复",
        config: {
          batchSize: 5,
          maxRetries: 3,
          retryDelay: 5000,
          pauseOnError: true,
          autoSaveInterval: 60000
        }
      },
      {
        step: 6,
        name: "Monitor Progress",
        agent: "novelist",
        tool: "check_generation_progress",
        description: "监控生成进度和状态",
        repeat: true
      },
      {
        step: 7,
        name: "Pause if Needed",
        agent: "novelist",
        tool: "pause_generation",
        description: "暂停生成任务（可选）",
        condition: "user_request"
      },
      {
        step: 8,
        name: "Resume Generation",
        agent: "novelist",
        tool: "resume_generation",
        description: "恢复暂停或失败的生成任务",
        condition: "paused_or_failed"
      },
      {
        step: 9,
        name: "Edit and Polish",
        agent: "editor",
        tool: "chapter_write",
        description: "编辑润色生成的章节",
        repeat: true
      },
      {
        step: 10,
        name: "Export Novel",
        agent: "novelist",
        tool: "export_novel",
        description: "导出完整小说为电子书格式"
      }
    ],
    examples: [
      {
        title: "生成 100 章长篇奇幻小说",
        workflow: [
          {
            tool: "novel_create",
            params: {
              title: "龙之契约",
              genre: "奇幻",
              author: "AI 作家",
              totalChapters: 100,
              description: "一个关于龙族与人类签订契约的史诗故事"
            }
          },
          {
            tool: "start_long_running_generation",
            params: {
              generationId: "dragon-pact-001",
              batchSize: 10,
              maxRetries: 5,
              retryDelay: 10000,
              pauseOnError: true
            }
          },
          {
            tool: "check_generation_progress",
            params: {
              generationId: "dragon-pact-001"
            }
          },
          {
            tool: "export_novel",
            params: {
              format: "epub",
              includeMetadata: true
            }
          }
        ]
      },
      {
        title: "暂停并恢复生成",
        workflow: [
          {
            tool: "pause_generation",
            params: {
              generationId: "dragon-pact-001"
            }
          },
          {
            tool: "resume_generation",
            params: {
              generationId: "dragon-pact-001",
              fromCheckpoint: true
            }
          }
        ]
      },
      {
        title: "批量生成多个小说",
        workflow: [
          {
            tool: "novel_create",
            params: {
              title: "星际迷航",
              genre: "科幻",
              totalChapters: 50
            }
          },
          {
            tool: "start_long_running_generation",
            params: {
              generationId: "scifi-001",
              batchSize: 5
            }
          },
          {
            tool: "novel_create",
            params: {
              title: "武侠传奇",
              genre: "武侠",
              totalChapters: 80
            }
          },
          {
            tool: "start_long_running_generation",
            params: {
              generationId: "wuxia-001",
              batchSize: 8
            }
          },
          {
            tool: "list_all_generations",
            params: {}
          }
        ]
      }
    ],
    longRunningSupport: {
      enabled: true,
      features: [
        "持久化状态存储",
        "自动检查点",
        "断点续传",
        "错误重试机制",
        "批量处理",
        "内存优化",
        "进度跟踪",
        "并发任务管理"
      ],
      maxChapters: "unlimited",
      maxRuntime: "unlimited",
      statePersistence: "file_system",
      autoSave: true,
      recoveryMechanism: true
    }
  }
};
