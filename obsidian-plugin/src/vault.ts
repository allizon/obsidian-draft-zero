import type { App } from "obsidian";
import { TFile } from "obsidian";
import type { Goal } from "./state";
import type { ChallengeConfig } from "./challenges";
import { challengeLabel } from "./challenges";

interface SprintFileOptions {
  text: string;
  goal: Goal;
  wordCount: number;
  durationSeconds: number;
  completed: boolean;
  challengeConfig: ChallengeConfig;
  sprintFolder: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function formatGoal(goal: Goal): string {
  return goal.type === "time"
    ? `${Math.floor(goal.value / 60)} minutes`
    : `${goal.value} words`;
}

function buildFrontmatter(opts: SprintFileOptions): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const challenges = challengeLabel(opts.challengeConfig);
  const challengesYaml = challenges
    ? challenges.split(", ").map((c) => `  - ${c}`).join("\n")
    : "  []";

  return [
    "---",
    "tags:",
    "  - draft-zero",
    `date: ${dateStr}`,
    `goal: "${formatGoal(opts.goal)}"`,
    `word-count: ${opts.wordCount}`,
    `duration: "${formatDuration(opts.durationSeconds)}"`,
    `challenges:`,
    challengesYaml,
    `completed: ${opts.completed}`,
    "---",
    "",
    opts.text,
  ].join("\n");
}

export async function saveSprintToNewFile(
  app: App,
  opts: SprintFileOptions
): Promise<string> {
  const { vault } = app;
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  // Ensure folder exists
  if (!vault.getAbstractFileByPath(opts.sprintFolder)) {
    await vault.createFolder(opts.sprintFolder);
  }

  // Find unique filename
  let n = 1;
  let path = `${opts.sprintFolder}/${dateStr}-sprint-${n}.md`;
  while (vault.getAbstractFileByPath(path)) {
    n++;
    path = `${opts.sprintFolder}/${dateStr}-sprint-${n}.md`;
  }

  const content = buildFrontmatter(opts);
  await vault.create(path, content);
  return path;
}

function resolveDailyNotePath(template: string): string {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return template
    .replace("{{date:YYYY-MM-DD}}", `${yyyy}-${mm}-${dd}`)
    .replace("{{date:YYYY}}", yyyy)
    .replace("{{date:MM}}", mm)
    .replace("{{date:DD}}", dd);
}

interface DailyNoteOptions {
  text: string;
  goal: Goal;
  wordCount: number;
  challengeConfig: ChallengeConfig;
  dailyNotePathTemplate: string;
}

export async function appendSprintToDailyNote(
  app: App,
  opts: DailyNoteOptions
): Promise<string> {
  const { vault } = app;
  const path = resolveDailyNotePath(opts.dailyNotePathTemplate);
  const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const challenges = challengeLabel(opts.challengeConfig);
  const goalStr = formatGoal(opts.goal);

  const callout = [
    "",
    "---",
    "",
    `> [!note] Draft Zero Sprint — ${timeStr}`,
    `> Goal: ${goalStr} · Words: ${opts.wordCount}${challenges ? ` · ${challenges}` : ""}`,
    "",
    opts.text,
  ].join("\n");

  const existing = vault.getAbstractFileByPath(path);
  if (existing instanceof TFile) {
    const current = await vault.read(existing);
    await vault.modify(existing, current + callout);
  } else {
    // Ensure parent folder exists
    const parts = path.split("/");
    if (parts.length > 1) {
      const folder = parts.slice(0, -1).join("/");
      if (!vault.getAbstractFileByPath(folder)) {
        await vault.createFolder(folder);
      }
    }
    await vault.create(path, callout.trimStart());
  }

  return path;
}
