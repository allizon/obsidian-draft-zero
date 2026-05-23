import { App, Modal, Setting } from "obsidian";
import type { Goal } from "./state";
import type { ChallengeConfig } from "./challenges";
import type { PluginSettings } from "./storage";

export interface SetupResult {
  goal: Goal;
  challengeConfig: ChallengeConfig;
  saveDestination: "new-file" | "daily-note";
}

export class SetupModal extends Modal {
  private settings: PluginSettings;
  private onSubmit: (result: SetupResult) => void;

  private goalType: "time" | "words";
  private goalValue: number;
  private challengeConfig: ChallengeConfig;
  private saveDestination: "new-file" | "daily-note";

  constructor(
    app: App,
    settings: PluginSettings,
    onSubmit: (result: SetupResult) => void
  ) {
    super(app);
    this.settings = settings;
    this.onSubmit = onSubmit;
    this.goalType = settings.lastUsedGoalType ?? settings.defaultGoalType;
    this.goalValue = settings.lastUsedGoalValue ?? settings.defaultGoalValue;
    this.challengeConfig = { ...(settings.lastUsedChallengeConfig ?? settings.defaultChallengeConfig) };
    this.saveDestination =
      settings.saveDestination === "ask" ? "new-file" : settings.saveDestination;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("dz-setup-modal");

    contentEl.createEl("h2", { text: "Start a sprint" });

    new Setting(contentEl)
      .setName("Goal type")
      .addDropdown((drop) =>
        drop
          .addOption("time", "Time")
          .addOption("words", "Word count")
          .setValue(this.goalType)
          .onChange((val: "time" | "words") => {
            this.goalType = val;
            this.goalValue = val === "time" ? 600 : 300;
          })
      );

    new Setting(contentEl)
      .setName("Goal value")
      .setDesc("Seconds for time; words for word count.")
      .addText((text) =>
        text.setValue(String(this.goalValue)).onChange((val) => {
          const n = parseInt(val, 10);
          if (!isNaN(n) && n > 0) this.goalValue = n;
        })
      );

    new Setting(contentEl)
      .setName("No-delete mode")
      .setDesc("Backspace and Delete are disabled while writing.")
      .addToggle((tog) =>
        tog.setValue(this.challengeConfig.noDelete).onChange((val) => {
          this.challengeConfig.noDelete = val;
        })
      );

    new Setting(contentEl)
      .setName("Invisible ink")
      .setDesc("Text is hidden while writing.")
      .addToggle((tog) =>
        tog.setValue(this.challengeConfig.invisibleInk).onChange((val) => {
          this.challengeConfig.invisibleInk = val;
        })
      );

    if (this.settings.saveDestination === "ask") {
      new Setting(contentEl)
        .setName("Save destination")
        .addDropdown((drop) =>
          drop
            .addOption("new-file", "New file")
            .addOption("daily-note", "Daily note")
            .setValue(this.saveDestination)
            .onChange((val: "new-file" | "daily-note") => {
              this.saveDestination = val;
            })
        );
    }

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Start writing")
        .setCta()
        .onClick(() => this.submit())
    );

    contentEl.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter") this.submit();
    });
  }

  private submit(): void {
    this.onSubmit({
      goal: { type: this.goalType, value: this.goalValue },
      challengeConfig: this.challengeConfig,
      saveDestination: this.saveDestination,
    });
    this.close();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
