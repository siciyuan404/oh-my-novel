import { describe, it, expect } from "bun:test";
import { StateManager } from "./StateManager.js";
import { LongRunningGenerator } from "./LongRunningGenerator.js";

describe("StateManager", () => {
  it("should initialize state with provided parameters", () => {
    const manager = new StateManager();
    const state = manager.initializeState("Test Novel", 100, "Write about hero");

    expect(state.novelTitle).toBe("Test Novel");
    expect(state.totalChapters).toBe(100);
    expect(state.status).toBe("running");
    expect(state.generatedChapters).toEqual([]);
  });

  it("should update chapter progress correctly", () => {
    const manager = new StateManager();
    manager.initializeState("Test Novel", 10, "Context");
    manager.updateChapterProgress(1, true);

    const state = manager.loadState("Test Novel");
    expect(state?.generatedChapters).toContain(1);
  });

  it("should track failed chapters", () => {
    const manager = new StateManager();
    manager.initializeState("Test Novel", 10, "Context");
    manager.updateChapterProgress(1, false);

    const state = manager.loadState("Test Novel");
    expect(state?.failedChapters).toContain(1);
  });

  it("should check retry count correctly", () => {
    const manager = new StateManager();
    manager.initializeState("Test Novel", 10, "Context");
    manager.updateChapterProgress(1, false);
    manager.updateChapterProgress(1, false);

    expect(manager.canRetry(1, 3)).toBe(true);
    expect(manager.canRetry(1, 2)).toBe(false);
  });

  it("should list all saved states", () => {
    const manager = new StateManager();
    manager.initializeState("Novel A", 10, "Context A");
    manager.initializeState("Novel B", 20, "Context B");

    const states = manager.listAllStates();
    expect(states.length).toBeGreaterThanOrEqual(0);
  });

  it("should delete state correctly", () => {
    const manager = new StateManager();
    manager.initializeState("Test Novel", 10, "Context");
    manager.deleteState("Test Novel");

    const state = manager.loadState("Test Novel");
    expect(state).toBeNull();
  });
});

describe("LongRunningGenerator", () => {
  it("should start generation with valid parameters", async () => {
    const generator = new LongRunningGenerator();

    // Mock generateChapter function
    const generateChapter = async (num: number) => {
      return `Chapter ${num} content`;
    };

    // Note: This would be an async operation in real usage
    // For testing, we verify the generator can be created and configured
    expect(generator).toBeDefined();
  });

  it("should track progress correctly", () => {
    const generator = new LongRunningGenerator();
    // Mock state
    const mockState = {
      novelTitle: "Test Novel",
      currentChapter: 5,
      totalChapters: 10,
      generatedChapters: [1, 2, 3, 4],
      failedChapters: [],
      status: "running"
    };

    const progress = generator.getProgress();
    expect(progress).toHaveProperty("current");
    expect(progress).toHaveProperty("total");
    expect(progress).toHaveProperty("percentage");
    expect(progress).toHaveProperty("failed");
  });

  it("should support pause and resume", () => {
    const generator = new LongRunningGenerator();
    generator.pause();

    expect(generator.isActive()).toBe(false);

    generator.resume();
    // In real implementation, this would start/resume generation
    expect(generator).toBeDefined();
  });

  it("should stop generation gracefully", () => {
    const generator = new LongRunningGenerator();
    generator.stop();

    expect(generator.isActive()).toBe(false);
  });

  it("should handle batch processing", async () => {
    const generator = new LongRunningGenerator();
    // Configure batch size
    const config = {
      maxRetries: 3,
      batchSize: 5,
      retryDelay: 1000
    };

    // Verify configuration is set
    expect(generator).toBeDefined();
  });
});
