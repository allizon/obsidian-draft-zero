import { Editor, Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { PluginStorage } from "./storage";
import { DraftZeroSettingsTab } from "./settings";
import { SetupModal } from "./setup-modal";
import { SprintModal } from "./sprint-modal";
import { StatsView, STATS_VIEW_TYPE } from "./stats-view";
import { saveSprintToNewFile, appendSprintToDailyNote } from "./vault";
import type { Goal } from "./state";
import type { SprintSession } from "./stats";
import type { ChallengeConfig } from "./challenges";

export default class DraftZeroPlugin extends Plugin {
  private storage!: PluginStorage;

  async onload(): Promise<void> {
    this.storage = new PluginStorage(this);
    await this.storage.load();

    // Register the stats view
    this.registerView(
      STATS_VIEW_TYPE,
      (leaf: WorkspaceLeaf) =>
        new StatsView(leaf, () => this.storage.settings.sessions)
    );

    // Ribbon icon → open stats
    this.addRibbonIcon("feather", "Draft Zero Stats", () => {
      this.openStatsView();
    });

    // Commands
    this.addCommand({
      id: "start-sprint",
      name: "Start Sprint",
      callback: () => this.startSprint(),
    });

    this.addCommand({
      id: "sprint-at-cursor",
      name: "Sprint at cursor",
      editorCallback: (editor: Editor) => this.startSprintAtCursor(editor),
    });

    this.addCommand({
      id: "open-stats",
      name: "Open Stats",
      callback: () => this.openStatsView(),
    });

    // Settings tab
    this.addSettingTab(
      new DraftZeroSettingsTab(this.app, this, this.storage)
    );

    // Crash recovery: if there's in-progress text, offer to recover
    if (this.storage.settings.inProgressText !== null) {
      this.offerRecovery();
    }

    // Auto-save handler
    this.registerEvent(
      (this.app.workspace as any).on("draft-zero:autosave", async (data: { text: string; goal: Goal | null }) => {
        if (data.goal) {
          await this.storage.setInProgress(data.text, data.goal);
        }
      })
    );
  }

  onunload(): void {}

  private async startSprint(): Promise<void> {
    const { settings } = this.storage;

    new SetupModal(this.app, settings, (result) => {
      const initialText = "";
      new SprintModal(
        this.app,
        result,
        initialText,
        async (text, goal, durationSeconds, completed) => {
          await this.saveSprint(text, goal, durationSeconds, completed, result.saveDestination, result.challengeConfig);
        }
      ).open();
    }).open();
  }

  private async saveSprint(
    text: string,
    goal: Goal,
    durationSeconds: number,
    completed: boolean,
    saveDestination: "new-file" | "daily-note",
    challengeConfig: ChallengeConfig
  ): Promise<void> {
    const { settings } = this.storage;
    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    let vaultPath: string | null = null;

    if (text.trim().length > 0) {
      try {
        if (saveDestination === "daily-note") {
          vaultPath = await appendSprintToDailyNote(this.app, {
            text,
            goal,
            wordCount,
            challengeConfig,
            dailyNotePathTemplate: settings.dailyNotePathTemplate,
          });
        } else {
          vaultPath = await saveSprintToNewFile(this.app, {
            text,
            goal,
            wordCount,
            durationSeconds,
            completed,
            challengeConfig,
            sprintFolder: settings.sprintFolder,
          });
        }
      } catch (e) {
        new Notice(`Draft Zero: failed to save sprint — ${(e as Error).message}`);
      }
    }

    await this.recordSession(text, goal, durationSeconds, completed, challengeConfig, vaultPath);

    if (vaultPath) {
      new Notice(`Sprint saved to ${vaultPath} (${wordCount} words)`);
    } else if (wordCount === 0) {
      new Notice("Sprint ended with no text — nothing saved.");
    }
  }

  private async recordSession(
    text: string,
    goal: Goal,
    durationSeconds: number,
    completed: boolean,
    challengeConfig: ChallengeConfig,
    vaultPath: string | null
  ): Promise<void> {
    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    const session: SprintSession = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      savedAt: Date.now(),
      wordCount,
      durationSeconds,
      goalType: goal.type,
      goalValue: goal.value,
      completed,
      challengeConfig,
      vaultPath,
    };

    await this.storage.addSession(session);
    this.storage.settings.lastUsedGoalType = goal.type;
    this.storage.settings.lastUsedGoalValue = goal.value;
    this.storage.settings.lastUsedChallengeConfig = { ...challengeConfig };
    await this.storage.clearInProgress();

    this.app.workspace.getLeavesOfType(STATS_VIEW_TYPE).forEach((leaf) => {
      (leaf.view as StatsView).render();
    });
  }

  private startSprintAtCursor(editor: Editor): void {
    const cursor = editor.getCursor();
    const beforeCursor = editor.getValue().slice(0, editor.posToOffset(cursor));
    const seedText = beforeCursor.split("\n").slice(-10).join("\n");
    const activeFile = this.app.workspace.getActiveFile();
    const vaultPath = activeFile?.path ?? null;

    new SetupModal(this.app, this.storage.settings, (result) => {
      new SprintModal(
        this.app,
        result,
        "",
        async (text, goal, durationSeconds, completed) => {
          editor.replaceRange(text, cursor);
          await this.recordSession(text, goal, durationSeconds, completed, result.challengeConfig, vaultPath);
          const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
          if (wordCount === 0) {
            new Notice("Sprint ended with no text — nothing inserted.");
          } else {
            new Notice(`Sprint inserted at cursor (${wordCount} words)`);
          }
        },
        seedText
      ).open();
    }).open();
  }

  private async openStatsView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(STATS_VIEW_TYPE);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: STATS_VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
  }

  private offerRecovery(): void {
    const { inProgressText, inProgressGoal } = this.storage.settings;
    if (!inProgressText || !inProgressGoal) return;

    const wordCount = inProgressText.trim().split(/\s+/).length;
    const notice = new Notice(
      `Draft Zero: Recover ${wordCount}-word unfinished sprint?`,
      0
    );

    // Obsidian's Notice doesn't natively support buttons; we inject them
    const noticeEl = (notice as any).noticeEl as HTMLElement;
    const btnRow = noticeEl.createDiv({ cls: "dz-recovery-buttons" });

    const recoverBtn = btnRow.createEl("button", { text: "Recover" });
    recoverBtn.addEventListener("click", () => {
      notice.hide();
      // Open sprint modal with recovered text
      new SetupModal(this.app, this.storage.settings, (result) => {
        new SprintModal(
          this.app,
          result,
          inProgressText,
          async (text, goal, durationSeconds, completed) => {
            await this.saveSprint(text, goal, durationSeconds, completed, result.saveDestination, result.challengeConfig);
          }
        ).open();
      }).open();
    });

    const discardBtn = btnRow.createEl("button", { text: "Discard" });
    discardBtn.addEventListener("click", async () => {
      notice.hide();
      await this.storage.clearInProgress();
    });
  }
}
