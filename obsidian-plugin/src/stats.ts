import type { ChallengeConfig } from "./challenges";
import { localDateKey } from "./date-utils";

export interface SprintSession {
  id: string;
  savedAt: number;
  wordCount: number;
  durationSeconds: number;
  goalType: "time" | "words";
  goalValue: number;
  completed: boolean;
  challengeConfig: ChallengeConfig;
  vaultPath: string | null;
}

export interface StatsResult {
  currentStreak: number;
  longestStreak: number;
  totalWords: number;
  totalSessions: number;
  heatmap: Record<string, number>;
}

export function computeStats(sessions: SprintSession[]): StatsResult {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalWords: 0, totalSessions: 0, heatmap: {} };
  }

  const totalWords = sessions.reduce((sum, s) => sum + s.wordCount, 0);
  const totalSessions = sessions.length;

  const heatmap: Record<string, number> = {};
  for (const s of sessions) {
    const key = localDateKey(new Date(s.savedAt));
    heatmap[key] = (heatmap[key] ?? 0) + s.wordCount;
  }

  // Unique days sorted ascending
  const days = Object.keys(heatmap).sort((a, b) => {
    return new Date(parseDateKey(a)).getTime() - new Date(parseDateKey(b)).getTime();
  });

  // Compute longest streak
  let longestStreak = 0;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (isConsecutiveDay(days[i - 1], days[i])) {
      run++;
    } else {
      longestStreak = Math.max(longestStreak, run);
      run = 1;
    }
  }
  longestStreak = Math.max(longestStreak, run);

  // Current streak: count back from today
  const todayKey = localDateKey(new Date());
  let currentStreak = 0;
  if (heatmap[todayKey]) {
    // Walk backwards from today
    let checkDate = new Date();
    while (heatmap[localDateKey(checkDate)]) {
      currentStreak++;
      checkDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate() - 1);
    }
  } else {
    // Check if yesterday has a session (streak still alive today)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = localDateKey(yesterday);
    if (heatmap[yesterdayKey]) {
      let checkDate = yesterday;
      while (heatmap[localDateKey(checkDate)]) {
        currentStreak++;
        checkDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate() - 1);
      }
    }
  }

  return { currentStreak, longestStreak, totalWords, totalSessions, heatmap };
}

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month, day);
}

function isConsecutiveDay(keyA: string, keyB: string): boolean {
  const a = parseDateKey(keyA);
  const b = parseDateKey(keyB);
  const nextDay = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1);
  return (
    nextDay.getFullYear() === b.getFullYear() &&
    nextDay.getMonth() === b.getMonth() &&
    nextDay.getDate() === b.getDate()
  );
}
