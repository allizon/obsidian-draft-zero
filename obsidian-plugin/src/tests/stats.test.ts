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
  // ── Empty input ────────────────────────────────────────────────────────────

  it("returns zeros for empty sessions", () => {
    const result = computeStats([]);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.totalWords).toBe(0);
    expect(result.totalSessions).toBe(0);
    expect(result.heatmap).toEqual({});
  });

  // ── Totals ─────────────────────────────────────────────────────────────────

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

  it("counts a single session correctly", () => {
    const result = computeStats([makeSession({ wordCount: 999 })]);
    expect(result.totalWords).toBe(999);
    expect(result.totalSessions).toBe(1);
  });

  it("counts sessions with zero words", () => {
    const sessions = [makeSession({ wordCount: 0 }), makeSession({ wordCount: 50 })];
    const result = computeStats(sessions);
    expect(result.totalWords).toBe(50);
    expect(result.totalSessions).toBe(2);
  });

  // ── Heatmap ────────────────────────────────────────────────────────────────

  it("computes heatmap grouped by localDateKey", () => {
    const day1 = dateMs(2026, 4, 20); // May 20 2026
    const day2 = dateMs(2026, 4, 21); // May 21 2026
    const sessions = [
      makeSession({ savedAt: day1, wordCount: 100 }),
      makeSession({ savedAt: day1, wordCount: 50 }),
      makeSession({ savedAt: day2, wordCount: 200 }),
    ];
    const result = computeStats(sessions);
    expect(result.heatmap["2026-4-20"]).toBe(150);
    expect(result.heatmap["2026-4-21"]).toBe(200);
  });

  it("heatmap accumulates multiple sessions on the same day", () => {
    const day = dateMs(2024, 0, 15); // Jan 15 2024
    const sessions = [
      makeSession({ savedAt: day, wordCount: 100 }),
      makeSession({ savedAt: day + 3600_000, wordCount: 200 }),
      makeSession({ savedAt: day + 7200_000, wordCount: 300 }),
    ];
    const result = computeStats(sessions);
    expect(result.heatmap["2024-0-15"]).toBe(600);
  });

  it("heatmap has one entry per unique day", () => {
    const day1 = dateMs(2026, 4, 10);
    const day2 = dateMs(2026, 4, 12);
    const sessions = [
      makeSession({ savedAt: day1 }),
      makeSession({ savedAt: day1 }),
      makeSession({ savedAt: day2 }),
    ];
    const result = computeStats(sessions);
    expect(Object.keys(result.heatmap)).toHaveLength(2);
  });

  // ── Longest streak ─────────────────────────────────────────────────────────

  it("longest streak is 1 for a single session day", () => {
    const result = computeStats([makeSession({ savedAt: dateMs(2026, 0, 1) })]);
    expect(result.longestStreak).toBe(1);
  });

  it("computes consecutive-day longest streak", () => {
    const sessions = [
      makeSession({ savedAt: dateMs(2026, 4, 18) }),
      makeSession({ savedAt: dateMs(2026, 4, 19) }),
      makeSession({ savedAt: dateMs(2026, 4, 20) }),
    ];
    const result = computeStats(sessions);
    expect(result.longestStreak).toBe(3);
  });

  it("longest streak breaks on a gap day", () => {
    const sessions = [
      makeSession({ savedAt: dateMs(2026, 4, 17) }),
      makeSession({ savedAt: dateMs(2026, 4, 18) }),
      // gap — May 19 missing
      makeSession({ savedAt: dateMs(2026, 4, 20) }),
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

  it("picks the longest run when there are multiple streaks", () => {
    const sessions = [
      // streak of 2
      makeSession({ savedAt: dateMs(2026, 0, 1) }),
      makeSession({ savedAt: dateMs(2026, 0, 2) }),
      // gap
      // streak of 4
      makeSession({ savedAt: dateMs(2026, 0, 10) }),
      makeSession({ savedAt: dateMs(2026, 0, 11) }),
      makeSession({ savedAt: dateMs(2026, 0, 12) }),
      makeSession({ savedAt: dateMs(2026, 0, 13) }),
      // gap
      // streak of 1
      makeSession({ savedAt: dateMs(2026, 0, 20) }),
    ];
    const result = computeStats(sessions);
    expect(result.longestStreak).toBe(4);
  });

  it("handles sessions spanning a month boundary", () => {
    const sessions = [
      makeSession({ savedAt: dateMs(2026, 0, 31) }), // Jan 31
      makeSession({ savedAt: dateMs(2026, 1, 1) }),  // Feb 1
      makeSession({ savedAt: dateMs(2026, 1, 2) }),  // Feb 2
    ];
    const result = computeStats(sessions);
    expect(result.longestStreak).toBe(3);
  });

  it("handles sessions spanning a year boundary", () => {
    const sessions = [
      makeSession({ savedAt: dateMs(2025, 11, 31) }), // Dec 31 2025
      makeSession({ savedAt: dateMs(2026, 0, 1) }),   // Jan 1 2026
    ];
    const result = computeStats(sessions);
    expect(result.longestStreak).toBe(2);
  });

  // ── Current streak ─────────────────────────────────────────────────────────

  it("current streak is 1 for a single session today", () => {
    const today = new Date();
    const result = computeStats([makeSession({ savedAt: today.getTime() })]);
    expect(result.currentStreak).toBe(1);
  });

  it("current streak includes today and yesterday when both have sessions", () => {
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12, 0, 0);
    const sessions = [
      makeSession({ savedAt: yesterday.getTime() }),
      makeSession({ savedAt: today.getTime() }),
    ];
    const result = computeStats(sessions);
    expect(result.currentStreak).toBe(2);
  });

  it("current streak survives when today has no session but yesterday does", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const sessions = [
      makeSession({ savedAt: twoDaysAgo.getTime() }),
      makeSession({ savedAt: yesterday.getTime() }),
    ];
    const result = computeStats(sessions);
    expect(result.currentStreak).toBe(2);
  });

  it("current streak is 0 when most recent session is two or more days ago", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const result = computeStats([makeSession({ savedAt: twoDaysAgo.getTime() })]);
    expect(result.currentStreak).toBe(0);
  });

  it("current streak is 0 when no recent sessions exist", () => {
    const oldDate = dateMs(2020, 0, 1); // long in the past
    const result = computeStats([makeSession({ savedAt: oldDate })]);
    expect(result.currentStreak).toBe(0);
  });

  it("multiple today sessions only count as one current streak day", () => {
    const today = new Date();
    const sessions = [
      makeSession({ savedAt: today.getTime() }),
      makeSession({ savedAt: today.getTime() + 1000 }),
      makeSession({ savedAt: today.getTime() + 2000 }),
    ];
    const result = computeStats(sessions);
    expect(result.currentStreak).toBe(1);
  });
});
