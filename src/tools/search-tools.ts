import { Tool } from "opencode";
import { execSync } from "child_process";
import * as path from "path";

/**
 * Grep tool - search for patterns in files
 * Uses ripgrep with timeout and output limits
 */
export const grepTool: Tool = {
  description: "Search for text patterns in files using ripgrep. Fast, safe search with 60s timeout and 10MB output limit.",
  parameters: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Search pattern (supports regex)" },
      path: { type: "string", description: "Directory to search in (default: current directory)" },
      include: { type: "string", description: "File pattern to include (e.g., '*.md', '*.ts')" },
      exclude: { type: "string", description: "File pattern to exclude" },
      caseSensitive: { type: "boolean", description: "Case sensitive search (default: false)" },
      maxResults: { type: "number", description: "Maximum results to return (default: 100)" }
    },
    required: ["pattern"]
  },
  handler: async (params: any) => {
    try {
      const {
        pattern,
        searchPath = ".",
        include = "",
        exclude = "",
        caseSensitive = false,
        maxResults = 100
      } = params;

      // Build ripgrep command
      const args: string[] = [
        "rg",
        "--json",
        "--max-count", maxResults.toString(),
        caseSensitive ? "--case-sensitive" : "--ignore-case"
      ];

      if (include) {
        args.push("--glob", include);
      }

      if (exclude) {
        args.push("--glob-never", exclude);
      }

      args.push(pattern);
      args.push(searchPath);

      // Execute with timeout
      const timeout = 60000; // 60 seconds
      const startTime = Date.now();
      const result = execSync(args.join(" "), {
        timeout,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });

      const elapsedTime = Date.now() - startTime;

      // Parse JSON output
      const matches = result
        .trim()
        .split("\n")
        .filter((line: string) => line)
        .map((line: string) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter((m: any) => m !== null)
        .slice(0, maxResults);

      return {
        success: true,
        matches,
        count: matches.length,
        pattern,
        searchPath,
        elapsed: `${elapsedTime}ms`
      };
    } catch (error: any) {
      // Handle timeout
      if (error.killed && error.signal === "SIGTERM") {
        return {
          success: false,
          error: "Search timed out after 60 seconds",
          suggestion: "Try narrowing your search pattern or using --include to filter files"
        };
      }

      // Handle max buffer exceeded
      if (error.stdout && error.stdout.includes("maxBuffer")) {
        return {
          success: false,
          error: "Search results exceed 10MB limit",
          suggestion: "Use --include to filter files or --maxResults to reduce output"
        };
      }

      return {
        success: false,
        error: error.message || "Search failed",
        suggestion: "Check if ripgrep (rg) is installed and the search path is valid"
      };
    }
  }
};

/**
 * Glob tool - find files matching patterns
 * Uses picomatch with timeout and 100 file limit
 */
export const globTool: Tool = {
  description: "Find files matching glob patterns. Fast pattern matching with 60s timeout and 100 file limit.",
  parameters: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Glob pattern (e.g., '**/*.md', 'src/**/*.ts')" },
      path: { type: "string", description: "Base directory (default: current directory)" },
      maxResults: { type: "number", description: "Maximum files to return (default: 100)" }
    },
    required: ["pattern"]
  },
  handler: async (params: any) => {
    try {
      const {
        pattern,
        searchPath = ".",
        maxResults = 100
      } = params;

      const picomatch = await import("picomatch");
      const pm = picomatch.default(pattern, { globstar: true });

      const startTime = Date.now();
      const files: string[] = [];

      // Recursively search files
      const searchDir = (dir: string) => {
        const timeout = 60000; // 60 seconds
        if (Date.now() - startTime > timeout) {
          throw new Error("Glob timed out after 60 seconds");
        }

        if (files.length >= maxResults) {
          return;
        }

        const entries = require("fs").readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(searchPath, fullPath);

          if (entry.isDirectory()) {
            // Skip node_modules and hidden directories
            if (
              entry.name === "node_modules" ||
              entry.name === ".git" ||
              entry.name.startsWith(".")
            ) {
              continue;
            }

            searchDir(fullPath);
          } else if (pm(relativePath)) {
            files.push(relativePath);

            if (files.length >= maxResults) {
              break;
            }
          }
        }
      };

      searchDir(searchPath);

      const elapsedTime = Date.now() - startTime;

      return {
        success: true,
        files,
        count: files.length,
        pattern,
        searchPath,
        elapsed: `${elapsedTime}ms`,
        truncated: files.length >= maxResults
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Glob failed",
        suggestion: "Check if the pattern is valid and the search path exists"
      };
    }
  }
};

/**
 * Search tool - search within novel content
 * Specialized for searching chapters, characters, and plot notes
 */
export const searchNovelTool: Tool = {
  description: "Search within novel content (chapters, characters, plot, world-building). Specialized for novel project search.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Novel title" },
      query: { type: "string", description: "Search query" },
      scope: {
        type: "string",
        enum: ["all", "chapters", "characters", "plot", "world"],
        description: "Search scope (default: all)"
      },
      maxResults: { type: "number", description: "Maximum results per section (default: 10)" }
    },
    required: ["title", "query"]
  },
  handler: async (params: any) => {
    try {
      const {
        title,
        query,
        scope = "all",
        maxResults = 10
      } = params;

      const NOVEL_DIR = "./novels";
      const novelPath = path.join(NOVEL_DIR, title.toLowerCase().replace(/\s+/g, "-"));

      if (!require("fs").existsSync(novelPath)) {
        return {
          success: false,
          error: `Novel "${title}" not found`
        };
      }

      const fs = require("fs");
      const results: any = {
        chapters: [],
        characters: [],
        plot: [],
        world: []
      };

      const lowerQuery = query.toLowerCase();

      // Search chapters
      if (scope === "all" || scope === "chapters") {
        const chaptersDir = path.join(novelPath, "chapters");
        if (fs.existsSync(chaptersDir)) {
          const chapterFiles = fs.readdirSync(chaptersDir).filter((f: string) => f.endsWith(".md"));

          for (const file of chapterFiles.slice(0, maxResults)) {
            const chapterPath = path.join(chaptersDir, file);
            const content = fs.readFileSync(chapterPath, "utf-8");

            if (content.toLowerCase().includes(lowerQuery)) {
              // Extract context around match
              const matchIndex = content.toLowerCase().indexOf(lowerQuery);
              const start = Math.max(0, matchIndex - 100);
              const end = Math.min(content.length, matchIndex + 200);
              const context = content.substring(start, end);

              results.chapters.push({
                file,
                path: chapterPath,
                context
              });

              if (results.chapters.length >= maxResults) break;
            }
          }
        }
      }

      // Search characters
      if (scope === "all" || scope === "characters") {
        const metadataPath = path.join(novelPath, "metadata.json");
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

          for (const character of metadata.characters.slice(0, maxResults)) {
            const charStr = JSON.stringify(character).toLowerCase();
            if (charStr.includes(lowerQuery)) {
              results.characters.push(character);

              if (results.characters.length >= maxResults) break;
            }
          }
        }
      }

      // Search plot outline
      if (scope === "all" || scope === "plot") {
        const plotPath = path.join(novelPath, "plot-outline.md");
        if (fs.existsSync(plotPath)) {
          const plotContent = fs.readFileSync(plotPath, "utf-8");

          if (plotContent.toLowerCase().includes(lowerQuery)) {
            // Extract matching sections
            const sections = plotContent.split("\n\n").filter((section: string) =>
              section.toLowerCase().includes(lowerQuery)
            ).slice(0, maxResults);

            results.plot = sections;
          }
        }
      }

      // Search world-building
      if (scope === "all" || scope === "world") {
        const worldDir = path.join(novelPath, "world-building");
        if (fs.existsSync(worldDir)) {
          const worldFiles = fs.readdirSync(worldDir).filter((f: string) => f.endsWith(".md"));

          for (const file of worldFiles.slice(0, maxResults)) {
            const worldPath = path.join(worldDir, file);
            const content = fs.readFileSync(worldPath, "utf-8");

            if (content.toLowerCase().includes(lowerQuery)) {
              results.world.push({
                file,
                path: worldPath,
                category: path.basename(file, ".md")
              });

              if (results.world.length >= maxResults) break;
            }
          }
        }
      }

      return {
        success: true,
        results,
        query,
        title,
        totalMatches:
          results.chapters.length +
          results.characters.length +
          results.plot.length +
          results.world.length
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Search failed"
      };
    }
  }
};
