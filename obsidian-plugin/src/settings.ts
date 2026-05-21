import { App, PluginSettingTab, Setting } from "obsidian";
import type DraftZeroPlugin from "./main";
import type { PluginStorage } from "./storage";

export class DraftZeroSettingsTab extends PluginSettingTab {
  private storage: PluginStorage;

  constructor(app: App, plugin: DraftZeroPlugin, storage: PluginStorage) {
    super(app, plugin);
    this.storage = storage;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Sprint folder")
      .setDesc("Vault folder where sprint notes are saved.")
      .addText((text) =>
        text
          .setPlaceholder("Writing Sprints")
          .setValue(this.storage.settings.sprintFolder)
          .onChange(async (value) => {
            this.storage.settings.sprintFolder = value || "Writing Sprints";
            await this.storage.save();
          })
      );

    new Setting(containerEl)
      .setName("Save destination")
      .setDesc("Where to save finished sprints.")
      .addDropdown((drop) =>
        drop
          .addOption("new-file", "New file")
          .addOption("daily-note", "Daily note")
          .addOption("ask", "Ask each time")
          .setValue(this.storage.settings.saveDestination)
          .onChange(async (value: "new-file" | "daily-note" | "ask") => {
            this.storage.settings.saveDestination = value;
            await this.storage.save();
            // Re-render to show/hide daily note path field
            this.display();
          })
      );

    if (this.storage.settings.saveDestination !== "new-file") {
      new Setting(containerEl)
        .setName("Daily note path template")
        .setDesc("Path template with {{date:YYYY-MM-DD}} placeholder.")
        .addText((text) =>
          text
            .setPlaceholder("Daily Notes/{{date:YYYY-MM-DD}}")
            .setValue(this.storage.settings.dailyNotePathTemplate)
            .onChange(async (value) => {
              this.storage.settings.dailyNotePathTemplate =
                value || "Daily Notes/{{date:YYYY-MM-DD}}";
              await this.storage.save();
            })
        );
    }

    new Setting(containerEl)
      .setName("Default goal type")
      .addDropdown((drop) =>
        drop
          .addOption("time", "Time")
          .addOption("words", "Word count")
          .setValue(this.storage.settings.defaultGoalType)
          .onChange(async (value: "time" | "words") => {
            this.storage.settings.defaultGoalType = value;
            await this.storage.save();
          })
      );

    new Setting(containerEl)
      .setName("Default goal value")
      .setDesc("Seconds for time goals; word count for word goals.")
      .addText((text) =>
        text
          .setValue(String(this.storage.settings.defaultGoalValue))
          .onChange(async (value) => {
            const n = parseInt(value, 10);
            if (!isNaN(n) && n > 0) {
              this.storage.settings.defaultGoalValue = n;
              await this.storage.save();
            }
          })
      );
  }
}
