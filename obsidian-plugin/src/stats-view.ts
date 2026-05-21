import { ItemView, WorkspaceLeaf } from "obsidian";
import { computeStats } from "./stats";
import type { SprintSession } from "./stats";

export const STATS_VIEW_TYPE = "draft-zero-stats";

export class StatsView extends ItemView {
  private getSessions: () => SprintSession[];

  constructor(leaf: WorkspaceLeaf, getSessions: () => SprintSession[]) {
    super(leaf);
    this.getSessions = getSessions;
  }

  getViewType(): string {
    return STATS_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Draft Zero Stats";
  }

  getIcon(): string {
    return "feather";
  }

  async onOpen(): Promise<void> {
    this.render();
  }

  render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("dz-stats-view");

    const sessions = this.getSessions();
    const stats = computeStats(sessions);

    const summary = contentEl.createDiv({ cls: "dz-stats-summary" });

    const addStat = (label: string, value: string | number) => {
      const block = summary.createDiv({ cls: "dz-stat-block" });
      block.createDiv({ cls: "dz-stat-value", text: String(value) });
      block.createDiv({ cls: "dz-stat-label", text: label });
    };

    addStat("Current Streak", `${stats.currentStreak}d`);
    addStat("Longest Streak", `${stats.longestStreak}d`);
    addStat("Total Words", stats.totalWords.toLocaleString());
    addStat("Sprints", stats.totalSessions);

    contentEl.createEl("h3", { text: "Activity" });

    const heatmapEl = contentEl.createDiv({ cls: "dz-heatmap" });

    // Determine max words/day for intensity scaling
    const counts = Object.values(stats.heatmap);
    const maxWords = counts.length > 0 ? Math.max(...counts) : 1;

    // Sort days and render cells
    const days = Object.keys(stats.heatmap).sort((a, b) => {
      return new Date(parseDateKey(a)).getTime() - new Date(parseDateKey(b)).getTime();
    });

    for (const day of days) {
      const words = stats.heatmap[day];
      const intensity = Math.max(1, Math.ceil((words / maxWords) * 4)) as 1 | 2 | 3 | 4;
      const cell = heatmapEl.createDiv({ cls: "dz-heatmap-cell" });
      cell.setAttribute("data-level", String(intensity));
      cell.setAttribute("title", `${day}: ${words} words`);
    }
  }

  async onClose(): Promise<void> {
    this.contentEl.empty();
  }
}

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month, day);
}
