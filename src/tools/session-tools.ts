import { Tool } from "opencode";
import * as fs from "fs";
import * as path from "path";

/**
 * Session Manager for oh-my-novel
 * Manages session history, metadata, and search functionality
 */
class NovelSessionManager {
  private sessionDir: string;
  private sessions: Map<string, NovelSessionMetadata>;

  constructor(sessionDir: string = "./.novel-sessions") {
    this.sessionDir = sessionDir;
    this.sessions = new Map();
    this.ensureSessionDir();
  }

  private ensureSessionDir(): void {
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  /**
   * List all sessions with optional filtering
   */
  listSessions(options?: {
    limit?: number;
    fromDate?: string;
    toDate?: string;
  }): NovelSessionMetadata[] {
    const files = fs.readdirSync(this.sessionDir)
      .filter((f: string) => f.endsWith(".json"))
      .sort((a, b) => b.localeCompare(a)); // Most recent first

    let sessions: NovelSessionMetadata[] = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.sessionDir, file), "utf-8");
        const session: NovelSessionMetadata = JSON.parse(content);
        sessions.push(session);
      } catch (error) {
        console.error(`Error reading session file ${file}:`, error);
      }
    }

    // Apply filters
    if (options?.fromDate) {
      sessions = sessions.filter(s => s.createdAt >= options.fromDate);
    }

    if (options?.toDate) {
      sessions = sessions.filter(s => s.createdAt <= options.toDate);
    }

    if (options?.limit) {
      sessions = sessions.slice(0, options.limit);
    }

    return sessions;
  }

  /**
   * Read session messages and history
   */
  readSession(sessionId: string, options?: {
    includeTodos?: boolean;
    includeTranscript?: boolean;
    limit?: number;
  }): NovelSession | null {
    const sessionPath = path.join(this.sessionDir, `${sessionId}.json`);

    if (!fs.existsSync(sessionPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(sessionPath, "utf-8");
      const session: NovelSession = JSON.parse(content);

      // Filter messages by limit
      if (options?.limit && session.messages) {
        session.messages = session.messages.slice(-options.limit);
      }

      return session;
    } catch (error) {
      console.error(`Error reading session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Search across session messages
   */
  searchSessions(query: string, options?: {
    sessionId?: string;
    caseSensitive?: boolean;
    limit?: number;
  }): SearchResult[] {
    const results: SearchResult[] = [];
    const lowerQuery = options?.caseSensitive ? query : query.toLowerCase();

    const sessions = options?.sessionId
      ? [this.readSession(options.sessionId)]
      : this.listSessions().map(s => s.id ? this.readSession(s.id) : null).filter(Boolean);

    for (const session of sessions) {
      if (!session || !session.messages) continue;

      for (let i = 0; i < session.messages.length; i++) {
        const message = session.messages[i];
        const content = message.content || "";
        const searchContent = options?.caseSensitive ? content : content.toLowerCase();

        if (searchContent.includes(lowerQuery)) {
          // Extract context around match
          const matchIndex = searchContent.indexOf(lowerQuery);
          const start = Math.max(0, matchIndex - 100);
          const end = Math.min(content.length, matchIndex + 200);
          const context = content.substring(start, end);

          results.push({
            sessionId: session.id,
            sessionTitle: session.title || `Session ${session.id}`,
            messageId: message.id || `msg-${i}`,
            role: message.role,
            timestamp: message.timestamp || session.createdAt,
            context,
            matchIndex
          });
        }
      }

      if (options?.limit && results.length >= options.limit) {
        break;
      }
    }

    return results.slice(0, options?.limit || results.length);
  }

  /**
   * Get session metadata and statistics
   */
  getSessionInfo(sessionId: string): SessionInfo | null {
    const session = this.readSession(sessionId);
    if (!session) {
      return null;
    }

    const messages = session.messages || [];
    const userMessages = messages.filter((m: any) => m.role === "user");
    const assistantMessages = messages.filter((m: any) => m.role === "assistant");

    return {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: messages.length,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      duration: this.calculateDuration(session.createdAt, session.updatedAt),
      hasTodos: !!(options?.includeTodos && session.todos),
      todoCount: session.todos?.length || 0,
      completedTodoCount: session.todos?.filter((t: any) => t.status === "completed").length || 0,
      agent: session.agent,
      model: session.model
    };
  }

  /**
   * Save session
   */
  saveSession(session: NovelSession): boolean {
    try {
      const sessionPath = path.join(this.sessionDir, `${session.id}.json`);
      session.updatedAt = new Date().toISOString();
      fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
      return true;
    } catch (error) {
      console.error(`Error saving session ${session.id}:`, error);
      return false;
    }
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    try {
      const sessionPath = path.join(this.sessionDir, `${sessionId}.json`);
      if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error);
      return false;
    }
  }

  private calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}

// Types
interface NovelSessionMetadata {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt?: string;
  agent?: string;
  model?: string;
}

interface NovelSession extends NovelSessionMetadata {
  messages: Array<{
    id?: string;
    role: string;
    content?: string;
    timestamp?: string;
    toolCalls?: any[];
  }>;
  todos?: Array<{
    id: string;
    content: string;
    status: "pending" | "in_progress" | "completed";
    priority?: "high" | "medium" | "low";
  }>;
  transcript?: any[];
}

interface SearchResult {
  sessionId: string;
  sessionTitle: string;
  messageId: string;
  role: string;
  timestamp: string;
  context: string;
  matchIndex: number;
}

interface SessionInfo {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt?: string;
  messageCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
  duration: string;
  hasTodos: boolean;
  todoCount: number;
  completedTodoCount: number;
  agent?: string;
  model?: string;
}

// Singleton instance
const sessionManager = new NovelSessionManager();

/**
 * Session List Tool
 * Lists all OpenCode sessions with filtering
 */
export const sessionListTool: Tool = {
  description: "List all novel writing sessions with filtering by date and limit",
  parameters: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of sessions to return (default: 20)"
      },
      fromDate: {
        type: "string",
        description: "ISO 8601 date to filter sessions from (e.g., '2026-01-01')"
      },
      toDate: {
        type: "string",
        description: "ISO 8601 date to filter sessions to (e.g., '2026-01-31')"
      }
    }
  },
  handler: async (params: any) => {
    try {
      const sessions = sessionManager.listSessions(params);

      return {
        success: true,
        sessions,
        count: sessions.length,
        filters: {
          limit: params.limit,
          fromDate: params.fromDate,
          toDate: params.toDate
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to list sessions"
      };
    }
  }
};

/**
 * Session Read Tool
 * Read messages and history from a specific session
 */
export const sessionReadTool: Tool = {
  description: "Read messages and history from a specific session",
  parameters: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session ID to read"
      },
      limit: {
        type: "number",
        description: "Maximum number of messages to return (default: all)"
      },
      includeTodos: {
        type: "boolean",
        description: "Include TODOs in the session (default: true)"
      },
      includeTranscript: {
        type: "boolean",
        description: "Include transcript data (default: false)"
      }
    },
    required: ["sessionId"]
  },
  handler: async (params: any) => {
    try {
      const session = sessionManager.readSession(
        params.sessionId,
        params
      );

      if (!session) {
        return {
          success: false,
          error: `Session "${params.sessionId}" not found`
        };
      }

      return {
        success: true,
        session,
        messageCount: session.messages?.length || 0,
        todoCount: session.todos?.length || 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to read session"
      };
    }
  }
};

/**
 * Session Search Tool
 * Full-text search across session messages
 */
export const sessionSearchTool: Tool = {
  description: "Full-text search across all session messages",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query"
      },
      sessionId: {
        type: "string",
        description: "Search within specific session only (optional)"
      },
      caseSensitive: {
        type: "boolean",
        description: "Case sensitive search (default: false)"
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (default: 20)"
      }
    },
    required: ["query"]
  },
  handler: async (params: any) => {
    try {
      const results = sessionManager.searchSessions(
        params.query,
        {
          sessionId: params.sessionId,
          caseSensitive: params.caseSensitive,
          limit: params.limit
        }
      );

      return {
        success: true,
        results,
        count: results.length,
        query: params.query
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Search failed"
      };
    }
  }
};

/**
 * Session Info Tool
 * Get metadata and statistics about a session
 */
export const sessionInfoTool: Tool = {
  description: "Get metadata and statistics about a specific session",
  parameters: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session ID to get info for"
      }
    },
    required: ["sessionId"]
  },
  handler: async (params: any) => {
    try {
      const info = sessionManager.getSessionInfo(params.sessionId);

      if (!info) {
        return {
          success: false,
          error: `Session "${params.sessionId}" not found`
        };
      }

      return {
        success: true,
        info
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get session info"
      };
    }
  }
};

/**
 * Session Delete Tool
 * Delete a session
 */
export const sessionDeleteTool: Tool = {
  description: "Delete a specific session",
  parameters: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session ID to delete"
      }
    },
    required: ["sessionId"]
  },
  handler: async (params: any) => {
    try {
      const deleted = sessionManager.deleteSession(params.sessionId);

      if (!deleted) {
        return {
          success: false,
          error: `Session "${params.sessionId}" not found or could not be deleted`
        };
      }

      return {
        success: true,
        message: `Session "${params.sessionId}" deleted successfully`,
        sessionId: params.sessionId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to delete session"
      };
    }
  }
};

// Export tools
export const sessionTools = {
  session_list: sessionListTool,
  session_read: sessionReadTool,
  session_search: sessionSearchTool,
  session_info: sessionInfoTool,
  session_delete: sessionDeleteTool
};
