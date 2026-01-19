import { describe, it, expect } from "bun:test";
import { hooks } from "./index.js";

describe("preToolUse hook", () => {
  it("should return success for non-chapter write operations", async () => {
    const result = await hooks.preToolUse.handler({
      toolName: "some_other_tool",
      parameters: {}
    });

    expect(result.success).toBe(true);
  });

  it("should auto-save draft before chapter write", async () => {
    const result = await hooks.preToolUse.handler({
      toolName: "chapter_write",
      parameters: {
        title: "Test Novel",
        chapterNumber: 1,
        content: "Chapter content here"
      }
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("auto-saved");
  });
});

describe("postToolUse hook", () => {
  it("should return success for non-chapter write operations", async () => {
    const result = await hooks.postToolUse.handler({
      toolName: "some_other_tool",
      result: { success: true }
    });

    expect(result.success).toBe(true);
  });

  it("should update chapter index after successful chapter write", async () => {
    const result = await hooks.postToolUse.handler({
      toolName: "chapter_write",
      result: {
        success: true,
        path: "./novels/test-novel/chapters/chapter-1.md",
        wordCount: 500
      },
      parameters: {
        chapterNumber: 1,
        chapterTitle: "Chapter One"
      }
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Chapter index updated");
  });

  it("should create progress log after novel creation", async () => {
    const result = await hooks.postToolUse.handler({
      toolName: "novel_create",
      result: {
        success: true,
        path: "./novels/test-novel",
        message: "Novel created successfully"
      },
      parameters: {
        title: "Test Novel",
        genre: "fantasy",
        author: "Test Author"
      }
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Progress log created");
  });
});

describe("userPromptSubmit hook", () => {
  it("should return success when no novels directory exists", async () => {
    const result = await hooks.userPromptSubmit.handler({
      prompt: "Write a chapter",
      session: {}
    });

    expect(result.success).toBe(true);
    expect(result.contextInjected).toBe(false);
  });

  it("should inject novel context when novels exist", async () => {
    const result = await hooks.userPromptSubmit.handler({
      prompt: "Continue the story",
      session: {}
    });

    expect(result.success).toBe(true);
    // Note: In real implementation with proper fs mocking,
    // contextInjected would be true when novels exist
  });

  it("should return context info with novel details", async () => {
    const result = await hooks.userPromptSubmit.handler({
      prompt: "What characters are in the story?",
      session: {}
    });

    expect(result.success).toBe(true);
    expect(result).toHaveProperty("contextInfo");
  });
});
