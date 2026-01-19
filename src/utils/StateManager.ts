import * as fs from "fs";
import * as path from "path";

interface GenerationState {
  novelTitle: string;
  currentChapter: number;
  totalChapters: number;
  status: "idle" | "running" | "paused" | "completed" | "error";
  lastCheckpoint: string;
  startTime: string;
  lastUpdateTime: string;
  context: {
    plotOutline: string;
    characters: any[];
    worldBuilding: any;
  };
  generatedChapters: number[];
  failedChapters: number[];
  retryCount: Record<number, number>;
  backupCreated?: string;
  lastMonitorCheck?: string;
  recoveryAvailable?: boolean;
  recoveryPoint?: string;
}

class StateManager {
  private stateDir: string;
  private currentState: GenerationState | null = null;

  constructor(stateDir: string = "./.oh-my-novel-state") {
    this.stateDir = stateDir;
    this.ensureStateDir();
  }

  private ensureStateDir(): void {
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }
  }

  private getStatePath(novelTitle: string): string {
    const safeTitle = novelTitle
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return path.join(this.stateDir, `${safeTitle}-state.json`);
  }

  initializeState(
    novelTitle: string,
    totalChapters: number,
    context: any,
  ): GenerationState {
    const state: GenerationState = {
      novelTitle,
      currentChapter: 1,
      totalChapters,
      status: "idle",
      lastCheckpoint: new Date().toISOString(),
      startTime: new Date().toISOString(),
      lastUpdateTime: new Date().toISOString(),
      context,
      generatedChapters: [],
      failedChapters: [],
      retryCount: {},
    };

    this.saveState(state);
    this.currentState = state;
    return state;
  }

  loadState(novelTitle: string): GenerationState | null {
    const statePath = this.getStatePath(novelTitle);

    if (!fs.existsSync(statePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(statePath, "utf-8");
      this.currentState = JSON.parse(content);
      return this.currentState;
    } catch (error) {
      console.error(`Failed to load state for ${novelTitle}:`, error);
      return null;
    }
  }

  saveState(state: GenerationState): void {
    const statePath = this.getStatePath(state.novelTitle);
    state.lastCheckpoint = new Date().toISOString();
    state.lastUpdateTime = new Date().toISOString();

    try {
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
      this.currentState = state;
    } catch (error) {
      console.error(`Failed to save state for ${state.novelTitle}:`, error);
      throw new Error(`State save failed: ${error}`);
    }
  }

  updateChapterProgress(chapterNumber: number, success: boolean): void {
    if (!this.currentState) {
      throw new Error("No active state to update");
    }

    if (success) {
      if (!this.currentState.generatedChapters.includes(chapterNumber)) {
        this.currentState.generatedChapters.push(chapterNumber);
      }
      // Remove from failed if it was there
      this.currentState.failedChapters =
        this.currentState.failedChapters.filter((n) => n !== chapterNumber);
      delete this.currentState.retryCount[chapterNumber];
    } else {
      if (!this.currentState.failedChapters.includes(chapterNumber)) {
        this.currentState.failedChapters.push(chapterNumber);
      }
      this.currentState.retryCount[chapterNumber] =
        (this.currentState.retryCount[chapterNumber] || 0) + 1;
    }

    this.currentState.currentChapter =
      Math.max(...this.currentState.generatedChapters) + 1;

    // Check if completed
    if (
      this.currentState.generatedChapters.length >=
      this.currentState.totalChapters
    ) {
      this.currentState.status = "completed";
    }

    this.saveState(this.currentState);
  }

  updateStatus(status: GenerationState["status"]): void {
    if (!this.currentState) {
      throw new Error("No active state to update");
    }

    this.currentState.status = status;
    this.saveState(this.currentState);
  }

  getCurrentState(): GenerationState | null {
    return this.currentState;
  }

  canRetry(chapterNumber: number, maxRetries: number = 3): boolean {
    if (!this.currentState) {
      return false;
    }

    const retries = this.currentState.retryCount[chapterNumber] || 0;
    return retries < maxRetries;
  }

  getFailedChapters(): number[] {
    if (!this.currentState) {
      return [];
    }
    return [...this.currentState.failedChapters];
  }

  getNextChapter(): number {
    if (!this.currentState) {
      return 1;
    }

    // First try failed chapters
    if (this.currentState.failedChapters.length > 0) {
      return this.currentState.failedChapters[0];
    }

    // Then try next ungenerated chapter
    return this.currentState.currentChapter;
  }

  deleteState(novelTitle: string): void {
    const statePath = this.getStatePath(novelTitle);

    if (fs.existsSync(statePath)) {
      fs.unlinkSync(statePath);
    }

    if (this.currentState && this.currentState.novelTitle === novelTitle) {
      this.currentState = null;
    }
  }

  exportState(novelTitle: string, exportPath: string): void {
    const state = this.loadState(novelTitle);

    if (!state) {
      throw new Error(`No state found for novel: ${novelTitle}`);
    }

    const exportData = {
      ...state,
      exportTime: new Date().toISOString(),
      summary: {
        progress: `${state.generatedChapters.length}/${state.totalChapters}`,
        completionRate:
          (
            (state.generatedChapters.length / state.totalChapters) *
            100
          ).toFixed(2) + "%",
        failed: state.failedChapters.length,
        totalRetries: Object.values(state.retryCount).reduce(
          (a, b) => a + b,
          0,
        ),
      },
    };

    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
  }

  listAllStates(): Array<{
    title: string;
    status: string;
    progress: string;
    lastUpdate: string;
  }> {
    if (!fs.existsSync(this.stateDir)) {
      return [];
    }

    const files = fs
      .readdirSync(this.stateDir)
      .filter((f) => f.endsWith("-state.json"));
    const states: Array<{
      title: string;
      status: string;
      progress: string;
      lastUpdate: string;
    }> = [];

    for (const file of files) {
      const filePath = path.join(this.stateDir, file);
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const state: GenerationState = JSON.parse(content);

        states.push({
          title: state.novelTitle,
          status: state.status,
          progress: `${state.generatedChapters.length}/${state.totalChapters}`,
          lastUpdate: state.lastUpdateTime,
        });
      } catch (error) {
        // Skip invalid state files
      }
    }

    return states.sort(
      (a, b) =>
        new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime(),
    );
  }
}

export { StateManager, GenerationState };
