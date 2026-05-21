import type { Plugin } from "obsidian";
import type { ChallengeConfig } from "./challenges";
import type { SprintSession } from "./stats";
import type { Goal } from "./state";

export interface PluginSettings {
  sprintFolder: string;
  saveDestination: "new-file" | "daily-note" | "ask";
  dailyNotePathTemplate: string;
  defaultGoalType: "time" | "words";
  defaultGoalValue: number;
  defaultChallengeConfig: ChallengeConfig;
  sessions: SprintSession[];
  inProgressText: string | null;
  inProgressGoal: Goal | null;
  lastUsedGoalType: "time" | "words" | null;
  lastUsedGoalValue: number | null;
  lastUsedChallengeConfig: ChallengeConfig | null;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  sprintFolder: "Writing Sprints",
  saveDestination: "new-file",
  dailyNotePathTemplate: "Daily Notes/{{date:YYYY-MM-DD}}",
  defaultGoalType: "time",
  defaultGoalValue: 600,
  defaultChallengeConfig: { noDelete: false, invisibleInk: false },
  sessions: [],
  inProgressText: null,
  inProgressGoal: null,
  lastUsedGoalType: null,
  lastUsedGoalValue: null,
  lastUsedChallengeConfig: null,
};

export class PluginStorage {
  private plugin: Plugin;
  settings: PluginSettings = { ...DEFAULT_SETTINGS };

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  async load(): Promise<void> {
    const saved = await this.plugin.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved ?? {});
  }

  async save(): Promise<void> {
    await this.plugin.saveData(this.settings);
  }

  async addSession(session: SprintSession): Promise<void> {
    this.settings.sessions.push(session);
    await this.save();
  }

  async setInProgress(text: string, goal: Goal): Promise<void> {
    this.settings.inProgressText = text;
    this.settings.inProgressGoal = goal;
    await this.save();
  }

  async clearInProgress(): Promise<void> {
    this.settings.inProgressText = null;
    this.settings.inProgressGoal = null;
    await this.save();
  }
}
