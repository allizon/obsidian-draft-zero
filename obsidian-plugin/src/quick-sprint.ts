import type { ChallengeConfig } from "./challenges";
import type { Goal } from "./state";
import type { PluginSettings } from "./storage";
import type { SetupResult } from "./setup-modal";

export interface QuickSprintNoticeLines {
  goal: string;
  challenges: string | null;
  /** Non-null only when saveDestination was overridden from 'ask' to 'new-file'. */
  saveDest: string | null;
}

export function buildQuickSprintResult(settings: PluginSettings): SetupResult & { wasAsk: boolean } {
  const wasAsk = settings.saveDestination === "ask";
  return {
    goal: {
      type: settings.lastUsedGoalType ?? settings.defaultGoalType,
      value: settings.lastUsedGoalValue ?? settings.defaultGoalValue,
    },
    challengeConfig: { ...(settings.lastUsedChallengeConfig ?? settings.defaultChallengeConfig) },
    saveDestination: wasAsk ? "new-file" : (settings.saveDestination as "new-file" | "daily-note"),
    wasAsk,
  };
}

export function formatQuickSprintNoticeLines(
  goal: Goal,
  challengeConfig: ChallengeConfig,
  saveDestination: "new-file" | "daily-note",
  wasAsk = false
): QuickSprintNoticeLines {
  // Goal line
  let goalStr: string;
  if (goal.type === "time") {
    const m = Math.floor(goal.value / 60);
    const s = goal.value % 60;
    goalStr = `${m}:${String(s).padStart(2, "0")}`;
  } else {
    goalStr = `${goal.value} words`;
  }

  // Challenges line
  const parts: string[] = [];
  if (challengeConfig.noDelete) parts.push("No-delete");
  if (challengeConfig.invisibleInk) parts.push("Invisible ink");
  const challenges = parts.length > 0 ? parts.join(" · ") : null;

  // Save destination line (only when overridden from 'ask')
  const saveDest = wasAsk ? "Saving to new file" : null;

  return { goal: `Quick Sprint — ${goalStr}`, challenges, saveDest };
}
