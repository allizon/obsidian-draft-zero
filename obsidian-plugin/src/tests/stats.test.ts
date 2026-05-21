import { describe, it, expect } from "vitest";
import { computeStats } from "../stats";
import type { SprintSession } from "../stats";

function makeSession(overrides: Partial<SprintSession> = {}): SprintSession {
  return {
    id: Math.random().toString(36).slice(2),
    savedAt: Date.now(),
    wordCount: 100,
    durationSeconds: 300,
    goalType: "time",
    goalValue: 300,
    completed: true,
    challengeConfig: { noDelete: false, invisibleInk: false },
    vaultPath: null,
    ...overrides,
  };
}

function dateMs(year: number, month: number, day: number): number {
  return new Date(year, month, day, 12, 0, 0).getTime();
}

describe("computeStats", () => {
  it("returns zeros for empty sessions", () => {
    const result = computeStats([]);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.totalWords).toBe(0);
    expect(result.totalSessions).toBe(0);
    expect(result.heatmap).toEqual({});
  });

  it("counts total words and sessions", () => {
    const sessions = [
      makeSession({ wordCount: 200 }),
      makeSession({ wordCount: 150 }),
      makeSession({ wordCount: 50 }),
    ];
    const result = computeStats(sessions);
    expect(result.totalWords).toBe(400);
    expect(result.totalSessions).toBe(3);
  });

  it("computes heatmap grouped by localDateKey", () => {
    // May 20 2026
    const day1 = dateMs(2026, 4, 20);
    // May 21 2026
    const day2 = dateMs(2026, 4, 21);
    const sessions = [
      makeSession({ savedAt: day1, wordCount: 100 }),
      makeSession({ savedAt: day1, wordCount: 50 }),
      makeSession({ savedAt: day2, wordCount: 200 }),
    ];
    const result = computeStats(sessions);
    expect(result.heatmap["2026-4-20"]).toBe(150);
    expect(result.heatmap["2026-4-21"]).toBe(200);
  });

  it("computes streak of 1 for a single session today", () => {
    const today = new Date();
    const sessions = [makeSession({ savedAt: today.getTime() })];
    const result = computeStats(sessions);
    expect(result.currentStreak).toBe(1);
  });

  it("computes streak across consecutive days", () => {
    const sessions = [
      makeSession({ savedAt: dateMs(2026, 4, 18) }),
      makeSession({ savedAt: dateMs(2026, 4, 19) }),
      makeSession({ savedAt: dateMs(2026, 4, 20) }),
    ];
    // When "today" is 2026-05-20 — streak is 3
    // We can't control "today" easily, so test longest streak instead
    const result = computeStats(sessions);
    expect(result.longestStreak).toBe(3);
  });

  it("streak breaks on a gap day", () => {
    const sessions = [
      makeSession({ savedAt: dateMs(2026, 4, 17) }), // May 17
      makeSession({ savedAt: dateMs(2026, 4, 18) }), // May 18
      // May 19 missing — streak break
      makeSession({ savedAt: dateMs(2026, 4, 20) }), // May 20
    ];
    const result = computeStats(sessions);
    expect(result.longestStreak).toBe(2);
  });

  it("multiple sessions on the same day count as one streak day", () => {
    const day = dateMs(2026, 4, 20);
    const sessions = [
      makeSession({ savedAt: day }),
      makeSession({ savedAt: day + 1000 }),
      makeSession({ savedAt: day + 2000 }),
    ];
    const result = computeStats(sessions);
    expect(result.longestStreak).toBe(1);
  });
});
