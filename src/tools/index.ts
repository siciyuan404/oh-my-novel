import { Tool } from "opencode";
import * as fs from "fs";
import * as path from "path";
import { grepTool, globTool, searchNovelTool } from "./search-tools.js";
import { sessionTools } from "./session-tools.js";
import { categoryTools } from "./category-tools.js";
import { backgroundTaskTools } from "./background-task-tools.js";
import { skillLoaderTools } from "./skill-loader-tools.js";

interface NovelMetadata {
  title: string;
  genre: string;
  author: string;
  createdAt: string;
  chapters: ChapterMetadata[];
  characters: Character[];
  plotOutline: string;
  totalChapters?: number;
}

interface ChapterMetadata {
  number: number;
  title: string;
  wordCount: number;
  status: "draft" | "complete";
}

interface Character {
  name: string;
  role: string;
  description: string;
  backstory: string;
  motivations: string[];
  flaws: string[];
}

const NOVEL_DIR = "./novels";

function ensureNovelDir(): void {
  if (!fs.existsSync(NOVEL_DIR)) {
    fs.mkdirSync(NOVEL_DIR, { recursive: true });
  }
}

function getNovelPath(title: string): string {
  return path.join(NOVEL_DIR, title.toLowerCase().replace(/\s+/g, "-"));
}

function getNovelMetadata(novelPath: string): NovelMetadata | null {
  const metadataPath = path.join(novelPath, "metadata.json");
  if (!fs.existsSync(metadataPath)) {
    return null;
  }
  const content = fs.readFileSync(metadataPath, "utf-8");
  return JSON.parse(content);
}

function saveNovelMetadata(novelPath: string, metadata: NovelMetadata): void {
  const metadataPath = path.join(novelPath, "metadata.json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

export const tools: Record<string, Tool> = {
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
      ensureNovelDir();
      
      const novelPath = getNovelPath(title);
      
      if (fs.existsSync(novelPath)) {
        return { success: false, error: `Novel "${title}" already exists` };
      }

      fs.mkdirSync(novelPath, { recursive: true });
      fs.mkdirSync(path.join(novelPath, "chapters"), { recursive: true });
      fs.mkdirSync(path.join(novelPath, "characters"), { recursive: true });
      fs.mkdirSync(path.join(novelPath, "world-building"), { recursive: true });
      fs.mkdirSync(path.join(novelPath, "drafts"), { recursive: true });

      const metadata: NovelMetadata = {
        title,
        genre,
        author,
        createdAt: new Date().toISOString(),
        chapters: [],
        characters: [],
        plotOutline: "",
        totalChapters
      };

      saveNovelMetadata(novelPath, metadata);

      return {
        success: true,
        message: `Novel "${title}" created successfully`,
        path: novelPath,
        totalChapters
      };
    }
  },

  chapter_write: {
    description: "Write individual chapters with AI assistance",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" },
        chapterNumber: { type: "number", description: "Chapter number" },
        chapterTitle: { type: "string", description: "Chapter title" },
        content: { type: "string", description: "Chapter content" },
        wordCount: { type: "number", description: "Target word count" }
      },
      required: ["title", "chapterNumber", "content"]
    },
    handler: async (params: { title: string; chapterNumber: number; chapterTitle?: string; content: string; wordCount?: number }) => {
      const { title, chapterNumber, chapterTitle = `Chapter ${chapterNumber}`, content, wordCount } = params;
      const novelPath = getNovelPath(title);
      
      if (!fs.existsSync(novelPath)) {
        return { success: false, error: `Novel "${title}" not found` };
      }

      const metadata = getNovelMetadata(novelPath);
      if (!metadata) {
        return { success: false, error: "Novel metadata not found" };
      }

      const chapterPath = path.join(novelPath, "chapters", `chapter-${chapterNumber}.md`);
      const chapterContent = `# ${chapterTitle}\n\n${content}`;
      
      fs.writeFileSync(chapterPath, chapterContent);

      const actualWordCount = content.split(/\s+/).length;
      
      const chapterMetadata: ChapterMetadata = {
        number: chapterNumber,
        title: chapterTitle,
        wordCount: actualWordCount,
        status: "draft"
      };

      const existingIndex = metadata.chapters.findIndex(c => c.number === chapterNumber);
      if (existingIndex >= 0) {
        metadata.chapters[existingIndex] = chapterMetadata;
      } else {
        metadata.chapters.push(chapterMetadata);
      }

      saveNovelMetadata(novelPath, metadata);

      return {
        success: true,
        message: `Chapter ${chapterNumber} written successfully`,
        wordCount: actualWordCount,
        path: chapterPath
      };
    }
  },

  character_manage: {
    description: "Track and manage character profiles",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" },
        action: { type: "string", enum: ["create", "update", "list", "view"], description: "Action to perform" },
        characterName: { type: "string", description: "Character name" },
        profile: { type: "object", description: "Character profile data" }
      },
      required: ["title", "action"]
    },
    handler: async (params: { title: string; action: string; characterName?: string; profile?: any }) => {
      const { title, action, characterName, profile } = params;
      const novelPath = getNovelPath(title);
      
      if (!fs.existsSync(novelPath)) {
        return { success: false, error: `Novel "${title}" not found` };
      }

      const metadata = getNovelMetadata(novelPath);
      if (!metadata) {
        return { success: false, error: "Novel metadata not found" };
      }

      switch (action) {
        case "create":
          if (!characterName || !profile) {
            return { success: false, error: "characterName and profile required for create action" };
          }
          const newCharacter: Character = {
            name: characterName,
            role: profile.role || "",
            description: profile.description || "",
            backstory: profile.backstory || "",
            motivations: profile.motivations || [],
            flaws: profile.flaws || []
          };
          metadata.characters.push(newCharacter);
          saveNovelMetadata(novelPath, metadata);
          
          const charPath = path.join(novelPath, "characters", `${characterName.toLowerCase().replace(/\s+/g, "-")}.md`);
          fs.writeFileSync(charPath, `# ${characterName}\n\n**Role:** ${newCharacter.role}\n\n**Description:** ${newCharacter.description}\n\n**Backstory:** ${newCharacter.backstory}\n\n**Motivations:**\n${newCharacter.motivations.map(m => `- ${m}`).join("\n")}\n\n**Flaws:**\n${newCharacter.flaws.map(f => `- ${f}`).join("\n")}`);
          
          return { success: true, message: `Character "${characterName}" created`, path: charPath };

        case "list":
          return { success: true, characters: metadata.characters };

        case "view":
          if (!characterName) {
            return { success: false, error: "characterName required for view action" };
          }
          const character = metadata.characters.find(c => c.name === characterName);
          if (!character) {
            return { success: false, error: `Character "${characterName}" not found` };
          }
          return { success: true, character };

        case "update":
          if (!characterName || !profile) {
            return { success: false, error: "characterName and profile required for update action" };
          }
          const charIndex = metadata.characters.findIndex(c => c.name === characterName);
          if (charIndex < 0) {
            return { success: false, error: `Character "${characterName}" not found` };
          }
          metadata.characters[charIndex] = { ...metadata.characters[charIndex], ...profile };
          saveNovelMetadata(novelPath, metadata);
          return { success: true, message: `Character "${characterName}" updated` };

        default:
          return { success: false, error: `Unknown action: ${action}` };
      }
    }
  },

  plot_outline: {
    description: "Create and maintain plot outlines",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" },
        action: { type: "string", enum: ["create", "update", "view"], description: "Action to perform" },
        outline: { type: "string", description: "Plot outline content" }
      },
      required: ["title", "action"]
    },
    handler: async (params: { title: string; action: string; outline?: string }) => {
      const { title, action, outline } = params;
      const novelPath = getNovelPath(title);
      
      if (!fs.existsSync(novelPath)) {
        return { success: false, error: `Novel "${title}" not found` };
      }

      const metadata = getNovelMetadata(novelPath);
      if (!metadata) {
        return { success: false, error: "Novel metadata not found" };
      }

      const outlinePath = path.join(novelPath, "plot-outline.md");

      switch (action) {
        case "create":
        case "update":
          if (!outline) {
            return { success: false, error: "outline required for create/update action" };
          }
          metadata.plotOutline = outline;
          saveNovelMetadata(novelPath, metadata);
          fs.writeFileSync(outlinePath, `# Plot Outline\n\n${outline}`);
          return { success: true, message: "Plot outline saved", path: outlinePath };

        case "view":
          if (!fs.existsSync(outlinePath)) {
            return { success: true, outline: metadata.plotOutline || "No plot outline yet" };
          }
          const content = fs.readFileSync(outlinePath, "utf-8");
          return { success: true, outline: content };

        default:
          return { success: false, error: `Unknown action: ${action}` };
      }
    }
  },

  world_notes: {
    description: "Document world-building details",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" },
        category: { type: "string", description: "Category (geography, culture, magic, etc.)" },
        content: { type: "string", description: "World-building content" }
      },
      required: ["title", "category", "content"]
    },
    handler: async (params: { title: string; category: string; content: string }) => {
      const { title, category, content } = params;
      const novelPath = getNovelPath(title);
      
      if (!fs.existsSync(novelPath)) {
        return { success: false, error: `Novel "${title}" not found` };
      }

      const worldDir = path.join(novelPath, "world-building");
      const notePath = path.join(worldDir, `${category.toLowerCase().replace(/\s+/g, "-")}.md`);
      
      fs.writeFileSync(notePath, `# ${category}\n\n${content}`);

      return {
        success: true,
        message: `World-building note for "${category}" saved`,
        path: notePath
      };
    }
  },

  export_novel: {
    description: "Export the complete novel in various formats",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" },
        format: { type: "string", enum: ["markdown", "txt"], description: "Export format" },
        outputPath: { type: "string", description: "Output file path" }
      },
      required: ["title", "format"]
    },
    handler: async (params: { title: string; format: string; outputPath?: string }) => {
      const { title, format, outputPath } = params;
      const novelPath = getNovelPath(title);
      
      if (!fs.existsSync(novelPath)) {
        return { success: false, error: `Novel "${title}" not found` };
      }

      const metadata = getNovelMetadata(novelPath);
      if (!metadata) {
        return { success: false, error: "Novel metadata not found" };
      }

      const chaptersDir = path.join(novelPath, "chapters");
      const chapterFiles = fs.readdirSync(chaptersDir)
        .filter(f => f.endsWith(".md"))
        .sort();

      let fullContent = `# ${metadata.title}\n\n`;
      fullContent += `**Genre:** ${metadata.genre}\n`;
      fullContent += `**Author:** ${metadata.author}\n\n`;
      fullContent += `---\n\n`;

      for (const file of chapterFiles) {
        const chapterPath = path.join(chaptersDir, file);
        const chapterContent = fs.readFileSync(chapterPath, "utf-8");
        fullContent += chapterContent + "\n\n---\n\n";
      }

      const extension = format === "markdown" ? "md" : "txt";
      const defaultOutputPath = path.join(process.cwd(), `${title}.${extension}`);
      const finalOutputPath = outputPath || defaultOutputPath;

      fs.writeFileSync(finalOutputPath, fullContent);

      return {
        success: true,
        message: `Novel exported successfully`,
        path: finalOutputPath,
        wordCount: fullContent.split(/\s+/).length
      };
    }
  },

  // Search tools
  grep: grepTool,
  glob: globTool,
  search_novel: searchNovelTool,
  // Session tools
  ...sessionTools,
  // Category tools
  ...categoryTools,
  // Background task tools
  ...backgroundTaskTools,
  // Skill loader tools
  ...skillLoaderTools
};
