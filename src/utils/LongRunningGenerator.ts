import { StateManager, GenerationState } from "./StateManager";

interface LongRunningConfig {
  maxRetries: number;
  retryDelay: number;
  checkpointInterval: number;
  batchSize: number;
  pauseOnError: boolean;
  autoResume: boolean;
}

class LongRunningGenerator {
  private stateManager: StateManager;
  private config: LongRunningConfig;
  private isRunning: boolean = false;
  private pauseRequested: boolean = false;

  constructor(config: Partial<LongRunningConfig> = {}) {
    this.stateManager = new StateManager();
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      checkpointInterval: 1,
      batchSize: 5,
      pauseOnError: true,
      autoResume: false,
      ...config
    };
  }

  async startGeneration(
    novelTitle: string,
    totalChapters: number,
    context: any,
    generateChapter: (chapterNum: number, context: any) => Promise<any>
  ): Promise<void> {
    this.isRunning = true;
    this.pauseRequested = false;

    // Try to resume if state exists
    let state = this.stateManager.loadState(novelTitle);
    
    if (!state) {
      state = this.stateManager.initializeState(novelTitle, totalChapters, context);
    }

    this.stateManager.updateStatus("running");

    try {
      while (this.isRunning && !this.pauseRequested) {
        if (state.status === "completed") {
          console.log(`✅ Novel "${novelTitle}" generation completed!`);
          this.isRunning = false;
          break;
        }

        if (state.generatedChapters.length >= totalChapters) {
          this.stateManager.updateStatus("completed");
          console.log(`✅ All ${totalChapters} chapters generated!`);
          break;
        }

        const nextChapter = this.stateManager.getNextChapter();
        
        if (nextChapter > totalChapters) {
          this.stateManager.updateStatus("completed");
          break;
        }

        console.log(`📝 Generating chapter ${nextChapter}/${totalChapters}...`);

        try {
          const result = await this.generateWithRetry(
            nextChapter,
            context,
            generateChapter
          );

          if (result.success) {
            this.stateManager.updateChapterProgress(nextChapter, true);
            console.log(`✅ Chapter ${nextChapter} completed (${result.wordCount || 'N/A'} words)`);
          } else {
            this.stateManager.updateChapterProgress(nextChapter, false);
            console.error(`❌ Chapter ${nextChapter} failed: ${result.error}`);
            
            if (this.config.pauseOnError) {
              console.log("⏸️ Pausing due to error. Use resume() to continue.");
              this.stateManager.updateStatus("paused");
              this.isRunning = false;
              break;
            }
          }
        } catch (error) {
          console.error(`💥 Unexpected error generating chapter ${nextChapter}:`, error);
          this.stateManager.updateChapterProgress(nextChapter, false);
          
          if (this.config.pauseOnError) {
            this.stateManager.updateStatus("error");
            this.isRunning = false;
            break;
          }
        }

        state = this.stateManager.getCurrentState()!;
        
        // Small delay between chapters to prevent overwhelming the system
        await this.sleep(1000);
      }

      if (this.pauseRequested) {
        this.stateManager.updateStatus("paused");
        console.log("⏸️ Generation paused. State saved.");
      }

    } catch (error) {
      console.error("💥 Fatal error during generation:", error);
      this.stateManager.updateStatus("error");
      throw error;
    }
  }

  private async generateWithRetry(
    chapterNum: number,
    context: any,
    generateChapter: (chapterNum: number, context: any) => Promise<any>
  ): Promise<{ success: boolean; wordCount?: number; error?: string }> {
    let lastError: string = "";

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await generateChapter(chapterNum, context);
        return { success: true, wordCount: result.wordCount };
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Attempt ${attempt}/${this.config.maxRetries} failed for chapter ${chapterNum}`);
        
        if (attempt < this.config.maxRetries) {
          await this.sleep(this.config.retryDelay);
        }
      }
    }

    return { success: false, error: lastError };
  }

  async resume(
    generateChapter: (chapterNum: number, context: any) => Promise<any>
  ): Promise<void> {
    const state = this.stateManager.getCurrentState();
    
    if (!state) {
      throw new Error("No active generation state to resume");
    }

    if (state.status !== "paused" && state.status !== "error") {
      throw new Error(`Cannot resume generation with status: ${state.status}`);
    }

    console.log(`▶️ Resuming generation of "${state.novelTitle}" from chapter ${this.stateManager.getNextChapter()}...`);

    await this.startGeneration(
      state.novelTitle,
      state.totalChapters,
      state.context,
      generateChapter
    );
  }

  pause(): void {
    if (!this.isRunning) {
      console.warn("⚠️ No active generation to pause");
      return;
    }

    this.pauseRequested = true;
    console.log("⏸️ Pause requested. Current chapter will complete before pausing...");
  }

  stop(): void {
    this.isRunning = false;
    this.pauseRequested = false;
    console.log("🛑 Generation stopped");
  }

  getStatus(): GenerationState | null {
    return this.stateManager.getCurrentState();
  }

  getProgress(): { current: number; total: number; percentage: number; failed: number } | null {
    const state = this.stateManager.getCurrentState();
    
    if (!state) {
      return null;
    }

    return {
      current: state.generatedChapters.length,
      total: state.totalChapters,
      percentage: (state.generatedChapters.length / state.totalChapters) * 100,
      failed: state.failedChapters.length
    };
  }

  listAllGenerations(): Array<{ title: string; status: string; progress: string; lastUpdate: string }> {
    return this.stateManager.listAllStates();
  }

  deleteGeneration(novelTitle: string): void {
    this.stateManager.deleteState(novelTitle);
    console.log(`🗑️ Deleted generation state for "${novelTitle}"`);
  }

  exportState(novelTitle: string, exportPath: string): void {
    this.stateManager.exportState(novelTitle, exportPath);
    console.log(`📤 Exported state for "${novelTitle}" to ${exportPath}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export { LongRunningGenerator, LongRunningConfig };
