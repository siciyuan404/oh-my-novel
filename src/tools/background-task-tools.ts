import { Tool } from "opencode";
import { configManager } from "../config/manager.js";

/**
 * Background Task Manager for oh-my-novel
 * Enhanced task orchestration with concurrency control, priority queues, and timeout management
 */

interface BackgroundTask {
  id: string;
  type: "novel_generation" | "chapter_write" | "research" | "custom";
  status: "pending" | "running" | "paused" | "completed" | "failed" | "cancelled";
  priority: "high" | "medium" | "low";
  novelTitle?: string;
  agent: string;
  category?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  result?: any;
  error?: string;
  config?: {
    maxRetries?: number;
    batchSize?: number;
    checkpointInterval?: number;
  };
}

interface TaskConfig {
  defaultConcurrency?: number;
  modelConcurrency?: Record<string, number>;
  staleTimeoutMs?: number;
}

class BackgroundTaskManager {
  private tasks: Map<string, BackgroundTask>;
  private concurrency: TaskConfig;
  private config: TaskConfig;

  constructor(customConfig?: TaskConfig) {
    this.tasks = new Map();
    this.config = {
      // Get from config manager
      defaultConcurrency: configManager.getConfig().background_task?.defaultConcurrency || 5,
      modelConcurrency: configManager.getConfig().background_task?.modelConcurrency || {},
      staleTimeoutMs: configManager.getConfig().background_task?.staleTimeoutMs || 180000, // 3 minutes
      ...customConfig
    };
    this.concurrency = {
      default: this.config.defaultConcurrency,
      byModel: this.config.modelConcurrency,
      byProvider: {} // Could be added if needed
    };
  }

  /**
   * Create a new background task
   */
  createTask(task: Omit<BackgroundTask, "id" | "createdAt" | "status" | "startedAt" | "completedAt" | "progress" | "result" | "error">): string {
    const taskId = this.generateTaskId();
    const newTask: BackgroundTask = {
      id: taskId,
      createdAt: new Date().toISOString(),
      status: "pending",
      ...task
    };

    this.tasks.set(taskId, newTask);
    return taskId;
  }

  /**
   * Start a task
   */
  startTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      return false;
    }

    if (task.status !== "pending" && task.status !== "paused") {
      return false;
    }

    // Check concurrency limits
    if (!this.canStartTask(task)) {
      return false;
    }

    task.status = "running";
    task.startedAt = new Date().toISOString();
    return true;
  }

  /**
   * Pause a task
   */
  pauseTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task || task.status !== "running") {
      return false;
    }

    task.status = "paused";
    return true;
  }

  /**
   * Resume a task
   */
  resumeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task || task.status !== "paused") {
      return false;
    }

    if (!this.canStartTask(task)) {
      return false;
    }

    task.status = "running";
    return true;
  }

  /**
   * Cancel a task
   */
  cancelTask(taskId: string, reason?: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task || task.status === "completed") {
      return false;
    }

    task.status = "cancelled";
    task.error = reason || "Task cancelled by user";

    // Trigger cleanup if needed
    return true;
  }

  /**
   * Update task progress
   */
  updateProgress(taskId: string, progress: { current: number; total: number; }): boolean {
    const task = this.tasks.get(taskId);

    if (!task || task.status !== "running") {
      return false;
    }

    task.progress = {
      current: progress.current,
      total: progress.total,
      percentage: Math.round((progress.current / progress.total) * 100)
    };

    return true;
  }

  /**
   * Mark task as completed
   */
  completeTask(taskId: string, result?: any): boolean {
    const task = this.tasks.get(taskId);

    if (!task || task.status !== "running") {
      return false;
    }

    task.status = "completed";
    task.completedAt = new Date().toISOString();
    task.result = result;
    task.progress = {
      current: task.progress?.total || 100,
      total: task.progress?.total || 100,
      percentage: 100
    };

    return true;
  }

  /**
   * Mark task as failed
   */
  failTask(taskId: string, error: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      return false;
    }

    task.status = "failed";
    task.completedAt = new Date().toISOString();
    task.error = error;

    return true;
  }

  /**
   * List all tasks
   */
  listTasks(filter?: {
    status?: BackgroundTask["status"];
    type?: BackgroundTask["type"];
    agent?: string;
    category?: string;
  }): BackgroundTask[] {
    let tasks = Array.from(this.tasks.values());

    // Apply filters
    if (filter?.status) {
      tasks = tasks.filter(t => t.status === filter.status);
    }

    if (filter?.type) {
      tasks = tasks.filter(t => t.type === filter.type);
    }

    if (filter?.agent) {
      tasks = tasks.filter(t => t.agent === filter.agent);
    }

    if (filter?.category) {
      tasks = tasks.filter(t => t.category === filter.category);
    }

    // Sort by priority and created time
    tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) {
        return priorityDiff; // Higher priority first
      }

      // Same priority: older first
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return tasks;
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): BackgroundTask | null {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Clean up old/finished tasks
   */
  cleanup(olderThan?: string): number {
    const cutoffTime = olderThan
      ? olderThan
      : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24 hours ago

    let cleaned = 0;

    for (const [taskId, task] of this.tasks.entries()) {
      if (
        (task.status === "completed" || task.status === "failed" || task.status === "cancelled") &&
        new Date(task.completedAt || task.createdAt).getTime() < new Date(cutoffTime).getTime()
      ) {
        this.tasks.delete(taskId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    total: number;
    byStatus: Record<BackgroundTask["status"], number>;
    byType: Record<BackgroundTask["type"], number>;
    byPriority: Record<BackgroundTask["priority"], number>;
  } {
    const tasks = Array.from(this.tasks.values());

    const byStatus: Record<BackgroundTask["status"], number> = {
      pending: 0,
      running: 0,
      paused: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    };

    const byType: Record<BackgroundTask["type"], number> = {
      novel_generation: 0,
      chapter_write: 0,
      research: 0,
      custom: 0
    };

    const byPriority: Record<BackgroundTask["priority"], number> = {
      high: 0,
      medium: 0,
      low: 0
    };

    for (const task of tasks) {
      byStatus[task.status]++;
      byType[task.type]++;
      byPriority[task.priority]++;
    }

    return {
      total: tasks.length,
      byStatus,
      byType,
      byPriority
    };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private generateTaskId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `task-${timestamp}-${random}`;
  }

  private canStartTask(task: BackgroundTask): boolean {
    // Count currently running tasks
    const runningTasks = Array.from(this.tasks.values()).filter(t => t.status === "running");
    const currentCount = runningTasks.length;

    // Check default concurrency
    if (currentCount >= this.concurrency.default) {
      return false;
    }

    // Check model-specific concurrency
    if (task.agent && this.concurrency.byModel[task.agent]) {
      const modelCount = runningTasks.filter(t => t.agent === task.agent).length;
      if (modelCount >= this.concurrency.byModel[task.agent]) {
        return false;
      }
    }

    // Check for stale tasks
    const now = Date.now();
    for (const runningTask of runningTasks) {
      if (runningTask.startedAt) {
        const elapsed = now - new Date(runningTask.startedAt).getTime();
        if (elapsed > this.config.staleTimeoutMs) {
          // Task is stale, should be cancelled
          runningTask.status = "failed";
          runningTask.error = "Task timed out (stale)";
          runningTask.completedAt = new Date().toISOString();
        }
      }
    }

    return true;
  }
}

// Singleton instance
const backgroundTaskManager = new BackgroundTaskManager();

/**
 * Create Task Tool
 * Create a new background task
 */
export const createTaskTool: Tool = {
  description: "Create a new background task for novel generation or other operations",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["novel_generation", "chapter_write", "research", "custom"],
        description: "Task type"
      },
      priority: {
        type: "string",
        enum: ["high", "medium", "low"],
        description: "Task priority (default: medium)"
      },
      novelTitle: {
        type: "string",
        description: "Novel title (for novel_generation type)"
      },
      agent: {
        type: "string",
        description: "Agent to use (e.g., novelist, plot-designer)"
      },
      category: {
        type: "string",
        description: "Category to apply (e.g., writing, plotting)"
      },
      config: {
        type: "object",
        description: "Task-specific configuration"
      }
    },
    required: ["type"]
  },
  handler: async (params: any) => {
    try {
      const taskId = backgroundTaskManager.createTask(params);
      return {
        success: true,
        taskId,
        message: `Task created with ID: ${taskId}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to create task"
      };
    }
  }
};

/**
 * Start Task Tool
 * Start a background task
 */
export const startTaskTool: Tool = {
  description: "Start a pending background task",
  parameters: {
    type: "object",
    properties: {
      taskId: {
        type: "string",
        description: "Task ID to start"
      }
    },
    required: ["taskId"]
  },
  handler: async (params: any) => {
    try {
      const started = backgroundTaskManager.startTask(params.taskId);

      if (!started) {
        return {
          success: false,
          error: "Task not found or cannot be started (check status or concurrency limits)"
        };
      }

      return {
        success: true,
        taskId: params.taskId,
        message: `Task ${params.taskId} started`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to start task"
      };
    }
  }
};

/**
 * Pause Task Tool
 * Pause a running background task
 */
export const pauseTaskTool: Tool = {
  description: "Pause a running background task",
  parameters: {
    type: "object",
    properties: {
      taskId: {
        type: "string",
        description: "Task ID to pause"
      }
    },
    required: ["taskId"]
  },
  handler: async (params: any) => {
    try {
      const paused = backgroundTaskManager.pauseTask(params.taskId);

      if (!paused) {
        return {
          success: false,
          error: "Task not found or cannot be paused"
        };
      }

      return {
        success: true,
        taskId: params.taskId,
        message: `Task ${params.taskId} paused`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to pause task"
      };
    }
  }
};

/**
 * Resume Task Tool
 * Resume a paused background task
 */
export const resumeTaskTool: Tool = {
  description: "Resume a paused background task",
  parameters: {
    type: "object",
    properties: {
      taskId: {
        type: "string",
        description: "Task ID to resume"
      }
    },
    required: ["taskId"]
  },
  handler: async (params: any) => {
    try {
      const resumed = backgroundTaskManager.resumeTask(params.taskId);

      if (!resumed) {
        return {
          success: false,
          error: "Task not found or cannot be resumed (check status or concurrency limits)"
        };
      }

      return {
        success: true,
        taskId: params.taskId,
        message: `Task ${params.taskId} resumed`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to resume task"
      };
    }
  }
};

/**
 * Cancel Task Tool
 * Cancel a running or pending task
 */
export const cancelTaskTool: Tool = {
  description: "Cancel a background task",
  parameters: {
    type: "object",
    properties: {
      taskId: {
        type: "string",
        description: "Task ID to cancel"
      },
      reason: {
        type: "string",
        description: "Reason for cancellation (optional)"
      }
    },
    required: ["taskId"]
  },
  handler: async (params: any) => {
    try {
      const cancelled = backgroundTaskManager.cancelTask(params.taskId, params.reason);

      if (!cancelled) {
        return {
          success: false,
          error: "Task not found or cannot be cancelled"
        };
      }

      return {
        success: true,
        taskId: params.taskId,
        message: `Task ${params.taskId} cancelled`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to cancel task"
      };
    }
  }
};

/**
 * List Tasks Tool
 * List all background tasks with filtering
 */
export const listTasksTool: Tool = {
  description: "List all background tasks with optional filtering",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["pending", "running", "paused", "completed", "failed", "cancelled"],
        description: "Filter by task status"
      },
      type: {
        type: "string",
        enum: ["novel_generation", "chapter_write", "research", "custom"],
        description: "Filter by task type"
      },
      agent: {
        type: "string",
        description: "Filter by agent"
      },
      category: {
        type: "string",
        description: "Filter by category"
      }
    }
  },
  handler: async (params: any) => {
    try {
      const tasks = backgroundTaskManager.listTasks(params);
      const stats = backgroundTaskManager.getStatistics();

      return {
        success: true,
        tasks,
        count: tasks.length,
        filters: params,
        statistics: stats
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to list tasks"
      };
    }
  }
};

/**
 * Get Task Status Tool
 * Get detailed status of a specific task
 */
export const getTaskStatusTool: Tool = {
  description: "Get detailed status and progress of a specific task",
  parameters: {
    type: "object",
    properties: {
      taskId: {
        type: "string",
        description: "Task ID to check"
      }
    },
    required: ["taskId"]
  },
  handler: async (params: any) => {
    try {
      const task = backgroundTaskManager.getTaskStatus(params.taskId);

      if (!task) {
        return {
          success: false,
          error: `Task ${params.taskId} not found`
        };
      }

      return {
        success: true,
        task
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get task status"
      };
    }
  }
};

/**
 * Cleanup Tasks Tool
 * Clean up old completed/failed/cancelled tasks
 */
export const cleanupTasksTool: Tool = {
  description: "Clean up old background tasks (completed/failed/cancelled older than 24 hours by default)",
  parameters: {
    type: "object",
    properties: {
      olderThan: {
        type: "string",
        description: "ISO 8601 datetime to clean up tasks older than (optional)"
      }
    }
  },
  handler: async (params: any) => {
    try {
      const cleaned = backgroundTaskManager.cleanup(params.olderThan);

      return {
        success: true,
        cleaned,
        message: `Cleaned up ${cleaned} old tasks`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to cleanup tasks"
      };
    }
  }
};

// Export all tools
export const backgroundTaskTools = {
  create_task: createTaskTool,
  start_task: startTaskTool,
  pause_task: pauseTaskTool,
  resume_task: resumeTaskTool,
  cancel_task: cancelTaskTool,
  list_tasks: listTasksTool,
  get_task_status: getTaskStatusTool,
  cleanup_tasks: cleanupTasksTool
};
