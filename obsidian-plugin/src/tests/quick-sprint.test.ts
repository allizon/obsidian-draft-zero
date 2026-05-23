import { describe, it, expect } from "vitest";
import { buildQuickSprintResult, formatQuickSprintNoticeLines } from "../quick-sprint";
import { DEFAULT_SETTINGS } from "../storage";
import type { PluginSettings } from "../storage";

// ── buildQuickSprintResult ────────────────────────────────────────────────────

describe("buildQuickSprintResult", () => {
  it("uses last-used goal type and value when available", () => {
    const settings: PluginSettings = {
      ...DEFAULT_SETTINGS,
      lastUsedGoalType: "words",
      lastUsedGoalValue: 500,
    };
    const result = buildQuickSprintResult(settings);
    expect(result.goal).toEqual({ type: "words", value: 500 });
  });

  it("falls back to default goal when last-used is null", () => {
    const settings: PluginSettings = {
      ...DEFAULT_SETTINGS,
      defaultGoalType: "time",
      defaultGoalValue: 300,
      lastUsedGoalType: null,
      lastUsedGoalValue: null,
    };
    const result = buildQuickSprintResult(settings);
    expect(result.goal).toEqual({ type: "time", value: 300 });
  });

  it("uses last-used challenge config when available", () => {
    const settings: PluginSettings = {
      ...DEFAULT_SETTINGS,
      lastUsedChallengeConfig: { noDelete: true, invisibleInk: false },
    };
    const result = buildQuickSprintResult(settings);
    expect(result.challengeConfig).toEqual({ noDelete: true, invisibleInk: false });
  });

  it("falls back to default challenge config when last-used is null", () => {
    const settings: PluginSettings = {
      ...DEFAULT_SETTINGS,
      defaultChallengeConfig: { noDelete: false, invisibleInk: true },
      lastUsedChallengeConfig: null,
    };
    const result = buildQuickSprintResult(settings);
    expect(result.challengeConfig).toEqual({ noDelete: false, invisibleInk: true });
  });

  it("returns a copy of challengeConfig, not the same reference", () => {
    const config = { noDelete: true, invisibleInk: false };
    const settings: PluginSettings = { ...DEFAULT_SETTINGS, lastUsedChallengeConfig: config };
    const result = buildQuickSprintResult(settings);
    expect(result.challengeConfig).not.toBe(config);
  });

  it("passes through new-file saveDestination unchanged", () => {
    const settings: PluginSettings = { ...DEFAULT_SETTINGS, saveDestination: "new-file" };
    expect(buildQuickSprintResult(settings).saveDestination).toBe("new-file");
  });

  it("passes through daily-note saveDestination unchanged", () => {
    const settings: PluginSettings = { ...DEFAULT_SETTINGS, saveDestination: "daily-note" };
    expect(buildQuickSprintResult(settings).saveDestination).toBe("daily-note");
  });

  it("maps ask saveDestination to new-file", () => {
    const settings: PluginSettings = { ...DEFAULT_SETTINGS, saveDestination: "ask" };
    expect(buildQuickSprintResult(settings).saveDestination).toBe("new-file");
  });
});

// ── formatQuickSprintNoticeLines ─────────────────────────────────────────────

describe("formatQuickSprintNoticeLines", () => {
  it("formats a time goal in M:SS", () => {
    const lines = formatQuickSprintNoticeLines(
      { type: "time", value: 600 },
      { noDelete: false, invisibleInk: false },
      "new-file"
    );
    expect(lines.goal).toBe("Quick Sprint — 10:00");
  });

  it("zero-pads seconds in time goal", () => {
    const lines = formatQuickSprintNoticeLines(
      { type: "time", value: 90 },
      { noDelete: false, invisibleInk: false },
      "new-file"
    );
    expect(lines.goal).toBe("Quick Sprint — 1:30");
  });

  it("formats a word-count goal", () => {
    const lines = formatQuickSprintNoticeLines(
      { type: "words", value: 500 },
      { noDelete: false, invisibleInk: false },
      "new-file"
    );
    expect(lines.goal).toBe("Quick Sprint — 500 words");
  });

  it("returns no challenges line when neither challenge is active", () => {
    const lines = formatQuickSprintNoticeLines(
      { type: "time", value: 600 },
      { noDelete: false, invisibleInk: false },
      "new-file"
    );
    expect(lines.challenges).toBeNull();
  });

  it("returns challenges line for no-delete only", () => {
    const lines = formatQuickSprintNoticeLines(
      { type: "time", value: 600 },
      { noDelete: true, invisibleInk: false },
      "new-file"
    );
    expect(lines.challenges).toBe("No-delete");
  });

  it("returns challenges line for invisible-ink only", () => {
    const lines = formatQuickSprintNoticeLines(
      { type: "time", value: 600 },
      { noDelete: false, invisibleInk: true },
      "new-file"
    );
    expect(lines.challenges).toBe("Invisible ink");
  });

  it("returns combined challenges line when both are active", () => {
    const lines = formatQuickSprintNoticeLines(
      { type: "time", value: 600 },
      { noDelete: true, invisibleInk: true },
      "new-file"
    );
    expect(lines.challenges).toBe("No-delete · Invisible ink");
  });

  it("returns no save line when saveDestination is new-file", () => {
    const lines = formatQuickSprintNoticeLines(
      { type: "time", value: 600 },
      { noDelete: false, invisibleInk: false },
      "new-file"
    );
    expect(lines.saveDest).toBeNull();
  });

  it("returns no save line when saveDestination is daily-note", () => {
    const lines = formatQuickSprintNoticeLines(
      { type: "time", value: 600 },
      { noDelete: false, invisibleInk: false },
      "daily-note"
    );
    expect(lines.saveDest).toBeNull();
  });

  it("returns save line when saveDestination was overridden from ask", () => {
    const lines = formatQuickSprintNoticeLines(
      { type: "time", value: 600 },
      { noDelete: false, invisibleInk: false },
      "new-file",
      true
    );
    expect(lines.saveDest).toBe("Saving to new file");
  });
});
